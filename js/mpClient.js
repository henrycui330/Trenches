/* ==========================================================================
   Multiplayer WebSocket client (lobby)
   ========================================================================== */

class MpClient {
    constructor() {
        this.ws = null;
        this.playerId = null;
        this.room = null;
        this.countries = [];
        this.onRoomState = null;
        this.onError = null;
        this.onMatchStart = null;
        this.onWelcome = null;
        this.onConnectionChange = null;
        this.onSnapshot = null;
        this.onCmd = null;
        this._connectTimer = null;
    }

    /** Game WS always lives on the Node server (default 8765). */
    get defaultUrl() {
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = (location.hostname && location.hostname !== '') ? location.hostname : 'localhost';
        // file:// or wrong static port → still hit the game server
        if (location.protocol === 'file:' || !location.port || location.port !== '8765') {
            return `${proto}//${host}:8765`;
        }
        return `${proto}//${location.host}`;
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    connect(url) {
        return new Promise((resolve, reject) => {
            if (this.isConnected()) {
                resolve(this.playerId);
                return;
            }

            // Drop stale socket attempting to connect
            if (this.ws) {
                try { this.ws.close(); } catch (_) { /* ignore */ }
                this.ws = null;
            }

            const target = url || this.defaultUrl;
            let settled = false;
            const finish = (fn, arg) => {
                if (settled) return;
                settled = true;
                if (this._connectTimer) {
                    clearTimeout(this._connectTimer);
                    this._connectTimer = null;
                }
                fn(arg);
            };

            console.log('[MP] connecting to', target);
            try {
                this.ws = new WebSocket(target);
            } catch (err) {
                finish(reject, err);
                return;
            }

            this.ws.onopen = () => {
                if (this.onConnectionChange) this.onConnectionChange(true);
                console.log('[MP] socket open', target);
            };

            this.ws.onmessage = (ev) => {
                let msg;
                try {
                    msg = JSON.parse(ev.data);
                } catch {
                    return;
                }
                this._handle(msg);
                if (msg.type === 'welcome') {
                    finish(resolve, msg.playerId);
                }
            };

            this.ws.onerror = (ev) => {
                console.warn('[MP] socket error', target, ev);
            };

            this.ws.onclose = (ev) => {
                if (this.onConnectionChange) this.onConnectionChange(false);
                this.ws = null;
                console.log('[MP] disconnected', ev.code, ev.reason || '');
                finish(reject, new Error(
                    `Could not reach multiplayer server at ${target}. Run: npm start  then open http://localhost:8765`
                ));
            };

            this._connectTimer = setTimeout(() => {
                finish(reject, new Error(
                    `Connection timed out (${target}). Run: npm start  then open http://localhost:8765`
                ));
                try { if (this.ws) this.ws.close(); } catch (_) { /* ignore */ }
            }, 8000);
        });
    }

    _handle(msg) {
        switch (msg.type) {
            case 'welcome':
                this.playerId = msg.playerId;
                this.countries = msg.countries || [];
                if (this.onWelcome) this.onWelcome(msg);
                break;
            case 'room_created':
            case 'room_state':
                this.room = msg.room;
                if (this.onRoomState) this.onRoomState(this.room);
                break;
            case 'match_start':
                this.room = msg.room;
                if (this.onMatchStart) this.onMatchStart(msg);
                break;
            case 'left_room':
                this.room = null;
                if (this.onRoomState) this.onRoomState(null);
                break;
            case 'error':
                console.warn('[MP] error', msg.message);
                if (this.onError) this.onError(msg.message);
                break;
            case 'snapshot':
                if (this.onSnapshot) this.onSnapshot(msg.snap);
                break;
            case 'cmd':
                if (this.onCmd) this.onCmd(msg.from, msg.cmd);
                break;
            default:
                break;
        }
    }

    send(obj) {
        if (!this.isConnected()) {
            if (this.onError) {
                this.onError('Not connected — open http://localhost:8765 after npm start');
            }
            return;
        }
        this.ws.send(JSON.stringify(obj));
    }

    sendSnapshot(snap) {
        this.send({ type: 'snapshot', snap });
    }

    sendCmd(cmd) {
        this.send({ type: 'cmd', cmd });
    }

    createRoom(name) {
        this.send({ type: 'create_room', name: name || 'Host' });
    }

    joinRoom(code, name) {
        this.send({ type: 'join_room', code: String(code).trim(), name: name || 'Commander' });
    }

    setMode(mode) {
        this.send({ type: 'set_mode', mode });
    }

    pickCountry(country) {
        this.send({ type: 'pick_country', country });
    }

    setReady(ready) {
        this.send({ type: 'set_ready', ready: !!ready });
    }

    startMatch() {
        this.send({ type: 'start_match' });
    }

    leaveRoom() {
        this.send({ type: 'leave_room' });
    }

    isHost() {
        return this.room && this.playerId && this.room.hostId === this.playerId;
    }
}

window.MpClient = MpClient;
