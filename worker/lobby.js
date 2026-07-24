import {
    COUNTRIES,
    COUNTRY_IDS,
    MAX_PLAYERS,
    generateRoomCode,
    createRoom,
    publicRoomState,
    canStart,
    deriveMode
} from './rooms.js';

function send(ws, msg) {
    try {
        ws.send(JSON.stringify(msg));
    } catch (_) {
        /* closed */
    }
}

/**
 * Single Durable Object holding all lobby rooms + WebSocket sessions.
 * (Same protocol as server/index.js — works from Workers + GitHub Pages via wss.)
 */
export class TrenchesLobby {
    constructor(ctx, env) {
        this.ctx = ctx;
        this.env = env;
        this.rooms = new Map();
        this.sockets = new Map(); // playerId -> WebSocket
        this.meta = new WeakMap(); // ws -> { playerId, roomCode }
    }

    async fetch(request) {
        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response('Trenches lobby WebSocket — connect with ws/wss', { status: 426 });
        }

        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        server.accept();

        const playerId = `p_${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;
        this.sockets.set(playerId, server);
        this.meta.set(server, { playerId, roomCode: null });

        send(server, {
            type: 'welcome',
            playerId,
            countries: COUNTRY_IDS.map(id => ({ id, ...COUNTRIES[id] })),
            maxPlayers: MAX_PLAYERS
        });

        server.addEventListener('message', (event) => {
            this.handleMessage(server, String(event.data || ''));
        });

        server.addEventListener('close', () => {
            const m = this.meta.get(server);
            if (m) {
                this.leaveRoom(m.playerId);
                this.sockets.delete(m.playerId);
            }
        });

        return new Response(null, { status: 101, webSocket: client });
    }

    broadcastRoom(room) {
        const state = publicRoomState(room);
        for (const p of Object.values(room.players)) {
            const ws = this.sockets.get(p.id);
            if (ws) send(ws, { type: 'room_state', room: state });
        }
    }

    leaveRoom(playerId) {
        for (const [code, room] of this.rooms) {
            if (!room.players[playerId]) continue;
            const wasHost = room.hostId === playerId;
            delete room.players[playerId];
            if (Object.keys(room.players).length === 0) {
                this.rooms.delete(code);
                return;
            }
            if (wasHost) {
                const next = Object.values(room.players)[0];
                room.hostId = next.id;
                next.isHost = true;
            }
            this.broadcastRoom(room);
            return;
        }
    }

    handleMessage(ws, data) {
        const meta = this.meta.get(ws) || {};
        const playerId = meta.playerId;
        let msg;
        try {
            msg = JSON.parse(data);
        } catch {
            return send(ws, { type: 'error', message: 'Invalid JSON' });
        }

        switch (msg.type) {
            case 'create_room': {
                this.leaveRoom(playerId);
                const room = createRoom({
                    id: playerId,
                    name: (msg.name || 'Host').slice(0, 24)
                });
                const code = generateRoomCode(this.rooms.keys());
                room.code = code;
                this.rooms.set(code, room);
                meta.roomCode = code;
                send(ws, { type: 'room_created', code, room: publicRoomState(room) });
                break;
            }
            case 'join_room': {
                const code = String(msg.code || '').trim();
                if (!/^\d{5}$/.test(code)) {
                    return send(ws, { type: 'error', message: 'Enter a 5-digit room code' });
                }
                const room = this.rooms.get(code);
                if (!room) return send(ws, { type: 'error', message: 'Room not found' });
                if (room.started) return send(ws, { type: 'error', message: 'Match already started' });
                if (Object.keys(room.players).length >= MAX_PLAYERS) {
                    return send(ws, { type: 'error', message: 'Room is full' });
                }
                this.leaveRoom(playerId);
                room.players[playerId] = {
                    id: playerId,
                    name: (msg.name || 'Commander').slice(0, 24),
                    country: null,
                    faction: null,
                    ready: false,
                    isHost: false
                };
                meta.roomCode = code;
                this.broadcastRoom(room);
                break;
            }
            case 'set_mode': {
                const room = this.rooms.get(meta.roomCode);
                if (!room) return send(ws, { type: 'error', message: 'Not in a room' });
                if (room.hostId !== playerId) {
                    return send(ws, { type: 'error', message: 'Only the host can change settings' });
                }
                if (room.started) return send(ws, { type: 'error', message: 'Match already started' });
                if (msg.mode !== 'versus' && msg.mode !== 'coop') {
                    return send(ws, { type: 'error', message: 'Invalid mode' });
                }
                room.mode = msg.mode;
                for (const p of Object.values(room.players)) p.ready = false;
                this.broadcastRoom(room);
                break;
            }
            case 'pick_country': {
                const room = this.rooms.get(meta.roomCode);
                if (!room) return send(ws, { type: 'error', message: 'Not in a room' });
                if (room.started) return send(ws, { type: 'error', message: 'Match already started' });
                const country = msg.country;
                if (!COUNTRIES[country]) {
                    return send(ws, { type: 'error', message: 'Unknown country' });
                }
                const taken = Object.values(room.players).some(
                    p => p.id !== playerId && p.country === country
                );
                if (taken) return send(ws, { type: 'error', message: 'Country already taken' });
                const me = room.players[playerId];
                me.country = country;
                me.faction = COUNTRIES[country].faction;
                me.ready = false;
                room.mode = deriveMode(room);
                this.broadcastRoom(room);
                break;
            }
            case 'set_ready': {
                const room = this.rooms.get(meta.roomCode);
                if (!room) return send(ws, { type: 'error', message: 'Not in a room' });
                const me = room.players[playerId];
                if (!me.country) {
                    return send(ws, { type: 'error', message: 'Pick a country first' });
                }
                me.ready = !!msg.ready;
                this.broadcastRoom(room);
                break;
            }
            case 'start_match': {
                const room = this.rooms.get(meta.roomCode);
                if (!room) return send(ws, { type: 'error', message: 'Not in a room' });
                if (room.hostId !== playerId) {
                    return send(ws, { type: 'error', message: 'Only the host can start the match' });
                }
                const check = canStart(room);
                if (!check.ok) return send(ws, { type: 'error', message: check.reason });
                room.started = true;
                room.mode = deriveMode(room);
                const payload = { type: 'match_start', room: publicRoomState(room) };
                for (const p of Object.values(room.players)) {
                    const pws = this.sockets.get(p.id);
                    if (pws) send(pws, payload);
                }
                break;
            }
            case 'leave_room': {
                this.leaveRoom(playerId);
                meta.roomCode = null;
                send(ws, { type: 'left_room' });
                break;
            }
            case 'snapshot': {
                const room = this.rooms.get(meta.roomCode);
                if (!room || !room.started) return;
                if (room.hostId !== playerId) {
                    return send(ws, { type: 'error', message: 'Only host sends snapshots' });
                }
                for (const p of Object.values(room.players)) {
                    if (p.id === playerId) continue;
                    const pws = this.sockets.get(p.id);
                    if (pws) send(pws, { type: 'snapshot', snap: msg.snap });
                }
                break;
            }
            case 'cmd': {
                const room = this.rooms.get(meta.roomCode);
                if (!room || !room.started) return;
                const hostWs = this.sockets.get(room.hostId);
                if (hostWs) send(hostWs, { type: 'cmd', from: playerId, cmd: msg.cmd });
                break;
            }
            case 'webrtc_signal': {
                const room = this.rooms.get(meta.roomCode);
                if (!room) return;
                const to = msg.to;
                if (!to || !room.players[to]) return;
                // Only relay within the same room
                if (!room.players[playerId]) return;
                const pws = this.sockets.get(to);
                if (pws) {
                    send(pws, {
                        type: 'webrtc_signal',
                        from: playerId,
                        signal: msg.signal
                    });
                }
                break;
            }
            default:
                send(ws, { type: 'error', message: `Unknown message: ${msg.type}` });
        }
    }
}
