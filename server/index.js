/**
 * Trenches 1917 — static file + WebSocket lobby server
 * Run: npm install && npm start
 * Open: http://localhost:8080
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const {
    COUNTRIES,
    COUNTRY_IDS,
    MAX_PLAYERS,
    generateRoomCode,
    createRoom,
    publicRoomState,
    canStart,
    deriveMode
} = require('./rooms.js');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 8765;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const rooms = new Map(); // code -> room
const sockets = new Map(); // playerId -> ws

function send(ws, msg) {
    if (ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function broadcastRoom(room) {
    const state = publicRoomState(room);
    for (const p of Object.values(room.players)) {
        const ws = sockets.get(p.id);
        if (ws) send(ws, { type: 'room_state', room: state });
    }
}

function leaveRoom(playerId) {
    for (const [code, room] of rooms) {
        if (!room.players[playerId]) continue;
        const wasHost = room.hostId === playerId;
        delete room.players[playerId];
        if (Object.keys(room.players).length === 0) {
            rooms.delete(code);
            console.log(`[ROOM] ${code} closed (empty)`);
            return;
        }
        if (wasHost) {
            const next = Object.values(room.players)[0];
            room.hostId = next.id;
            next.isHost = true;
            console.log(`[ROOM] ${code} new host ${next.id}`);
        }
        broadcastRoom(room);
        return;
    }
}

function handleMessage(ws, data) {
    const playerId = ws.playerId;
    let msg;
    try {
        msg = JSON.parse(data);
    } catch {
        return send(ws, { type: 'error', message: 'Invalid JSON' });
    }

    switch (msg.type) {
        case 'create_room': {
            leaveRoom(playerId);
            const room = createRoom({
                id: playerId,
                name: (msg.name || 'Host').slice(0, 24)
            });
            const code = generateRoomCode(rooms.keys());
            room.code = code;
            rooms.set(code, room);
            ws.roomCode = code;
            console.log(`[ROOM] created ${code} by ${playerId}`);
            send(ws, { type: 'room_created', code, room: publicRoomState(room) });
            break;
        }
        case 'join_room': {
            const code = String(msg.code || '').trim();
            if (!/^\d{5}$/.test(code)) {
                return send(ws, { type: 'error', message: 'Enter a 5-digit room code' });
            }
            const room = rooms.get(code);
            if (!room) return send(ws, { type: 'error', message: 'Room not found' });
            if (room.started) return send(ws, { type: 'error', message: 'Match already started' });
            if (Object.keys(room.players).length >= MAX_PLAYERS) {
                return send(ws, { type: 'error', message: 'Room is full' });
            }
            leaveRoom(playerId);
            room.players[playerId] = {
                id: playerId,
                name: (msg.name || 'Commander').slice(0, 24),
                country: null,
                faction: null,
                ready: false,
                isHost: false
            };
            ws.roomCode = code;
            console.log(`[ROOM] ${playerId} joined ${code}`);
            broadcastRoom(room);
            break;
        }
        case 'set_mode': {
            const room = rooms.get(ws.roomCode);
            if (!room) return send(ws, { type: 'error', message: 'Not in a room' });
            if (room.hostId !== playerId) {
                return send(ws, { type: 'error', message: 'Only the host can change settings' });
            }
            if (room.started) return send(ws, { type: 'error', message: 'Match already started' });
            if (msg.mode !== 'versus' && msg.mode !== 'coop') {
                return send(ws, { type: 'error', message: 'Invalid mode' });
            }
            room.mode = msg.mode;
            // Clear ready when mode changes
            for (const p of Object.values(room.players)) p.ready = false;
            broadcastRoom(room);
            break;
        }
        case 'pick_country': {
            const room = rooms.get(ws.roomCode);
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

            const faction = COUNTRIES[country].faction;
            const me = room.players[playerId];
            me.country = country;
            me.faction = faction;
            me.ready = false;
            // UK+USA (same alliance) → coop; UK+Germany → versus
            room.mode = deriveMode(room);
            broadcastRoom(room);
            break;
        }
        case 'set_ready': {
            const room = rooms.get(ws.roomCode);
            if (!room) return send(ws, { type: 'error', message: 'Not in a room' });
            const me = room.players[playerId];
            if (!me.country) {
                return send(ws, { type: 'error', message: 'Pick a country first' });
            }
            me.ready = !!msg.ready;
            broadcastRoom(room);
            break;
        }
        case 'start_match': {
            const room = rooms.get(ws.roomCode);
            if (!room) return send(ws, { type: 'error', message: 'Not in a room' });
            if (room.hostId !== playerId) {
                return send(ws, { type: 'error', message: 'Only the host can start the match' });
            }
            const check = canStart(room);
            if (!check.ok) return send(ws, { type: 'error', message: check.reason });
            room.started = true;
            room.mode = deriveMode(room);
            const payload = {
                type: 'match_start',
                room: publicRoomState(room)
            };
            for (const p of Object.values(room.players)) {
                const pws = sockets.get(p.id);
                if (pws) send(pws, payload);
            }
            console.log(`[ROOM] ${room.code} MATCH START mode=${room.mode}`);
            break;
        }
        case 'leave_room': {
            leaveRoom(playerId);
            ws.roomCode = null;
            send(ws, { type: 'left_room' });
            break;
        }
        case 'snapshot': {
            const room = rooms.get(ws.roomCode);
            if (!room || !room.started) return;
            if (room.hostId !== playerId) {
                return send(ws, { type: 'error', message: 'Only host sends snapshots' });
            }
            for (const p of Object.values(room.players)) {
                if (p.id === playerId) continue;
                const pws = sockets.get(p.id);
                if (pws) send(pws, { type: 'snapshot', snap: msg.snap });
            }
            break;
        }
        case 'cmd': {
            const room = rooms.get(ws.roomCode);
            if (!room || !room.started) return;
            const hostWs = sockets.get(room.hostId);
            if (hostWs) {
                send(hostWs, { type: 'cmd', from: playerId, cmd: msg.cmd });
            }
            break;
        }
        case 'webrtc_signal': {
            const room = rooms.get(ws.roomCode);
            if (!room) return;
            const to = msg.to;
            if (!to || !room.players[to] || !room.players[playerId]) return;
            const pws = sockets.get(to);
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

const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.normalize(path.join(ROOT, urlPath));
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end('Not found');
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    ws.playerId = `p_${Math.random().toString(36).slice(2, 10)}`;
    ws.roomCode = null;
    sockets.set(ws.playerId, ws);
    send(ws, {
        type: 'welcome',
        playerId: ws.playerId,
        countries: COUNTRY_IDS.map(id => ({ id, ...COUNTRIES[id] })),
        maxPlayers: MAX_PLAYERS
    });
    console.log(`[WS] connect ${ws.playerId}`);

    ws.on('message', (data) => handleMessage(ws, data.toString()));
    ws.on('close', () => {
        leaveRoom(ws.playerId);
        sockets.delete(ws.playerId);
        console.log(`[WS] disconnect ${ws.playerId}`);
    });
});

server.listen(PORT, () => {
    console.log(`[SERVER] Trenches 1917 lobby at http://localhost:${PORT}`);
    console.log(`[SERVER] WebSocket on same port — create/join 5-digit rooms`);
});
