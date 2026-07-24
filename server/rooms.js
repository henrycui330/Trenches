/**
 * Room helpers (testable without sockets).
 */
const COUNTRIES = {
    uk: { faction: 'entente', label: 'United Kingdom' },
    canada: { faction: 'entente', label: 'Canada' },
    france: { faction: 'entente', label: 'France' },
    usa: { faction: 'entente', label: 'United States' },
    germany: { faction: 'central', label: 'Germany' },
    austria: { faction: 'central', label: 'Austria-Hungary' },
    ottoman: { faction: 'central', label: 'Ottoman Empire' }
};

const COUNTRY_IDS = Object.keys(COUNTRIES);
const MAX_PLAYERS = COUNTRY_IDS.length; // 7

function generateRoomCode(existingCodes) {
    const taken = existingCodes instanceof Set ? existingCodes : new Set(existingCodes || []);
    for (let i = 0; i < 50; i++) {
        const code = String(Math.floor(10000 + Math.random() * 90000)); // 5 digits
        if (!taken.has(code)) return code;
    }
    throw new Error('Could not allocate room code');
}

function createRoom(hostPlayer) {
    return {
        code: null, // set by server
        hostId: hostPlayer.id,
        mode: 'versus', // host-controlled: versus | coop
        started: false,
        players: {
            [hostPlayer.id]: {
                id: hostPlayer.id,
                name: hostPlayer.name || 'Commander',
                country: null,
                faction: null,
                ready: false,
                isHost: true
            }
        }
    };
}

function publicRoomState(room) {
    return {
        code: room.code,
        hostId: room.hostId,
        mode: room.mode,
        started: room.started,
        players: Object.values(room.players),
        takenCountries: Object.values(room.players)
            .map(p => p.country)
            .filter(Boolean),
        maxPlayers: MAX_PLAYERS
    };
}

function deriveMode(room) {
    const list = Object.values(room.players).filter(p => p.faction);
    if (list.length < 2) return room.mode || 'versus';
    const factions = new Set(list.map(p => p.faction));
    // Same alliance → co-op; mixed alliances → versus
    return factions.size === 1 ? 'coop' : 'versus';
}

function canStart(room) {
    if (room.started) return { ok: false, reason: 'Already started' };
    const list = Object.values(room.players);
    if (list.length < 1) return { ok: false, reason: 'No players' };
    if (list.some(p => !p.country)) return { ok: false, reason: 'Everyone must pick a country' };
    if (list.some(p => !p.ready)) return { ok: false, reason: 'Everyone must be ready' };
    if (list.length < 2) return { ok: false, reason: 'Need at least 2 players' };

    // Mode follows countries at start time
    room.mode = deriveMode(room);

    if (room.mode === 'coop') {
        const factions = new Set(list.map(p => p.faction));
        if (factions.size !== 1) {
            return { ok: false, reason: 'Co-op: all players must share the same alliance' };
        }
    }
    return { ok: true };
}

module.exports = {
    COUNTRIES,
    COUNTRY_IDS,
    MAX_PLAYERS,
    generateRoomCode,
    createRoom,
    publicRoomState,
    canStart,
    deriveMode
};
