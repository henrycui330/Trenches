/* ==========================================================================
   Multiplayer client — WS lobby + WebRTC P2P game sync (low guest lag)
   Snapshots/cmds prefer host↔guest DataChannel; Cloudflare WS is signaling/fallback.
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
        this.onPeerReady = null;
        this._connectTimer = null;

        /** @type {Map<string, { pc: RTCPeerConnection, dc: RTCDataChannel|null, polite: boolean }>} */
        this.peers = new Map();
        this._makingOffer = new Set();
    }

    get defaultUrl() {
        const cfg = window.TRENCHES_MP || {};
        if (cfg.PRODUCTION_WS && !this._isLocalHost()) {
            return cfg.PRODUCTION_WS;
        }
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        if (this._isLocalHost()) {
            if (location.port === '8765') return `ws://${location.hostname}:8765`;
            return 'ws://localhost:8765';
        }
        return `${proto}//${location.host}/ws`;
    }

    _isLocalHost() {
        const h = location.hostname || '';
        return h === 'localhost' || h === '127.0.0.1' || location.protocol === 'file:';
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
                if (msg.type === 'welcome') finish(resolve, msg.playerId);
            };

            this.ws.onerror = () => console.warn('[MP] socket error', target);

            this.ws.onclose = (ev) => {
                if (this.onConnectionChange) this.onConnectionChange(false);
                this.ws = null;
                this._teardownPeers();
                console.log('[MP] disconnected', ev.code, ev.reason || '');
                finish(reject, new Error(
                    `Could not reach multiplayer server at ${target}. Run: npm start → http://localhost:8765`
                ));
            };

            this._connectTimer = setTimeout(() => {
                finish(reject, new Error(`Connection timed out (${target})`));
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
                // Host kicks off P2P to every guest after match starts
                queueMicrotask(() => this._startWebRtcMesh());
                break;
            case 'left_room':
                this.room = null;
                this._teardownPeers();
                if (this.onRoomState) this.onRoomState(null);
                break;
            case 'error':
                console.warn('[MP] error', msg.message);
                if (this.onError) this.onError(msg.message);
                break;
            case 'snapshot':
                if (this.onSnapshot) this.onSnapshot(msg.snap);
                break;
            case 'fx_burst':
                if (this.onFxBurst) this.onFxBurst(msg.shots);
                break;
            case 'cmd':
                if (this.onCmd) this.onCmd(msg.from, msg.cmd);
                break;
            case 'webrtc_signal':
                this._onSignal(msg);
                break;
            default:
                break;
        }
    }

    send(obj) {
        if (!this.isConnected()) {
            if (this.onError) this.onError('Not connected to lobby server');
            return;
        }
        this.ws.send(JSON.stringify(obj));
    }

    /**
     * Full snap over P2P when open; always keep a light WS backbone (units+cps)
     * so guests never freeze when datachannels clog or stall.
     */
    sendSnapshot(snap) {
        const lightSnap = {
            t: snap.t,
            units: snap.units,
            cps: snap.cps,
            structures: snap.structures
        };
        if (snap.bodies) lightSnap.bodies = snap.bodies;

        let viaP2p = false;
        const full = JSON.stringify({ type: 'snapshot', snap });
        for (const [, peer] of this.peers) {
            if (peer.dc && peer.dc.readyState === 'open' && peer.dc.bufferedAmount < 512 * 1024) {
                try {
                    peer.dc.send(full);
                    viaP2p = true;
                } catch (_) { /* ignore */ }
            }
        }

        const now = performance.now();
        // High-speed snapshot backbone: 45ms over WS (~22 Hz), 200ms when P2P channel is active
        const wsInterval = viaP2p ? 200 : 45;
        if (!viaP2p || !this._lastWsSnapAt || now - this._lastWsSnapAt > wsInterval) {
            this._lastWsSnapAt = now;
            this.send({ type: 'snapshot', snap: lightSnap });
        }
    }

    /** Prefer dropping FX, never block light state. */
    canSendHeavy() {
        for (const [, peer] of this.peers) {
            if (peer.dc && peer.dc.readyState === 'open') {
                return peer.dc.bufferedAmount < 512 * 1024;
            }
        }
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
        return this.ws.bufferedAmount < 256 * 1024;
    }

    sendCmd(cmd) {
        // Orders ALWAYS go over WebSocket (reliable). P2P alone dropped guest assaults.
        this.send({ type: 'cmd', cmd });
    }

    /**
     * Tiny gunfight packets. Prefer P2P; WS only as fallback (avoid double-apply lag).
     */
    sendFxBurst(shots) {
        if (!shots || !shots.length) return;
        const payload = JSON.stringify({ type: 'fx_burst', shots });
        let viaP2p = false;
        for (const [, peer] of this.peers) {
            if (peer.dc && peer.dc.readyState === 'open' && peer.dc.bufferedAmount < 256 * 1024) {
                try {
                    peer.dc.send(payload);
                    viaP2p = true;
                } catch (_) { /* ignore */ }
            }
        }
        if (!viaP2p) this.send({ type: 'fx_burst', shots });
    }

    _iceServers() {
        return [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            // Public TURN fallback when direct/STUN fails (symmetric NATs)
            {
                urls: 'turn:openrelay.metered.ca:80',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            },
            {
                urls: 'turn:openrelay.metered.ca:443',
                username: 'openrelayproject',
                credential: 'openrelayproject'
            }
        ];
    }

    _teardownPeers() {
        for (const [, peer] of this.peers) {
            try { peer.dc && peer.dc.close(); } catch (_) { /* */ }
            try { peer.pc && peer.pc.close(); } catch (_) { /* */ }
        }
        this.peers.clear();
        this._makingOffer.clear();
    }

    _startWebRtcMesh() {
        if (!this.room || !this.room.started) return;
        const players = this.room.players || [];
        const hostId = this.room.hostId;
        const me = this.playerId;

        // Host initiates offers to each guest. Guests wait for offers.
        if (me === hostId) {
            for (const p of players) {
                if (p.id === me) continue;
                this._ensurePeer(p.id, true);
            }
        }
    }

    _ensurePeer(remoteId, asOfferer) {
        if (this.peers.has(remoteId)) return this.peers.get(remoteId);

        const pc = new RTCPeerConnection({ iceServers: this._iceServers() });
        const entry = { pc, dc: null, polite: !asOfferer };
        this.peers.set(remoteId, entry);

        pc.onicecandidate = (ev) => {
            if (!ev.candidate) return;
            this.send({
                type: 'webrtc_signal',
                to: remoteId,
                signal: { type: 'ice', candidate: ev.candidate.toJSON() }
            });
        };

        pc.onconnectionstatechange = () => {
            console.log('[MP][RTC]', remoteId, pc.connectionState);
        };

        if (asOfferer) {
            const dc = pc.createDataChannel('game', {
                ordered: false,
                maxRetransmits: 0
            });
            this._wireDc(remoteId, dc);
            this._makeOffer(remoteId);
        } else {
            pc.ondatachannel = (ev) => this._wireDc(remoteId, ev.channel);
        }

        return entry;
    }

    _wireDc(remoteId, dc) {
        const entry = this.peers.get(remoteId);
        if (!entry) return;
        entry.dc = dc;
        dc.binaryType = 'arraybuffer';

        dc.onopen = () => {
            console.log('[MP][RTC] datachannel open', remoteId);
            if (this.onPeerReady) this.onPeerReady(remoteId);
        };

        dc.onmessage = (ev) => {
            let msg;
            try {
                msg = JSON.parse(typeof ev.data === 'string' ? ev.data : new TextDecoder().decode(ev.data));
            } catch {
                return;
            }
            if (msg.type === 'snapshot' && this.onSnapshot) this.onSnapshot(msg.snap);
            if (msg.type === 'fx_burst' && this.onFxBurst) this.onFxBurst(msg.shots);
            if (msg.type === 'cmd' && this.onCmd) this.onCmd(msg.from, msg.cmd);
        };

        dc.onclose = () => console.log('[MP][RTC] datachannel closed', remoteId);
    }

    async _makeOffer(remoteId) {
        const entry = this.peers.get(remoteId);
        if (!entry || this._makingOffer.has(remoteId)) return;
        this._makingOffer.add(remoteId);
        try {
            const offer = await entry.pc.createOffer();
            await entry.pc.setLocalDescription(offer);
            this.send({
                type: 'webrtc_signal',
                to: remoteId,
                signal: { type: 'offer', sdp: entry.pc.localDescription }
            });
        } catch (err) {
            console.warn('[MP][RTC] offer failed', remoteId, err);
        } finally {
            this._makingOffer.delete(remoteId);
        }
    }

    async _onSignal(msg) {
        const from = msg.from;
        const signal = msg.signal;
        if (!from || !signal || from === this.playerId) return;

        let entry = this.peers.get(from);
        if (!entry) {
            if (signal.type !== 'offer') return;
            entry = this._ensurePeer(from, false);
        }

        try {
            if (signal.type === 'offer') {
                await entry.pc.setRemoteDescription(signal.sdp);
                const answer = await entry.pc.createAnswer();
                await entry.pc.setLocalDescription(answer);
                this.send({
                    type: 'webrtc_signal',
                    to: from,
                    signal: { type: 'answer', sdp: entry.pc.localDescription }
                });
            } else if (signal.type === 'answer') {
                if (entry.pc.signalingState === 'have-local-offer') {
                    await entry.pc.setRemoteDescription(signal.sdp);
                }
            } else if (signal.type === 'ice' && signal.candidate) {
                try {
                    await entry.pc.addIceCandidate(signal.candidate);
                } catch (err) {
                    console.warn('[MP][RTC] ice failed', err);
                }
            }
        } catch (err) {
            console.warn('[MP][RTC] signal error', signal.type, err);
        }
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
        this._teardownPeers();
        this.send({ type: 'leave_room' });
    }

    isHost() {
        return this.room && this.playerId && this.room.hostId === this.playerId;
    }

    p2pReadyCount() {
        let n = 0;
        for (const [, p] of this.peers) {
            if (p.dc && p.dc.readyState === 'open') n++;
        }
        return n;
    }
}

window.MpClient = MpClient;
