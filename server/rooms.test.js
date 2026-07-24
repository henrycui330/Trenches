const assert = require('assert');
const {
    generateRoomCode,
    createRoom,
    canStart,
    deriveMode,
    publicRoomState,
    MAX_PLAYERS
} = require('./rooms.js');

const codes = new Set();
for (let i = 0; i < 20; i++) {
    const c = generateRoomCode(codes);
    assert.strictEqual(c.length, 5, 'code must be 5 digits');
    assert.match(c, /^\d{5}$/);
    assert.ok(!codes.has(c));
    codes.add(c);
}

const room = createRoom({ id: 'h1', name: 'Host' });
room.code = '12345';
assert.strictEqual(room.hostId, 'h1');
assert.strictEqual(canStart(room).ok, false);

room.players.h1.country = 'uk';
room.players.h1.faction = 'entente';
room.players.h1.ready = true;
room.players.g1 = {
    id: 'g1', name: 'Guest', country: 'usa', faction: 'entente', ready: true, isHost: false
};

// UK + USA → coop even if room.mode was versus
room.mode = 'versus';
assert.strictEqual(deriveMode(room), 'coop');
assert.strictEqual(canStart(room).ok, true);
assert.strictEqual(room.mode, 'coop', 'canStart should set coop for same alliance');

// UK + Germany → versus
room.players.g1.country = 'germany';
room.players.g1.faction = 'central';
room.mode = 'coop';
assert.strictEqual(deriveMode(room), 'versus');
assert.strictEqual(canStart(room).ok, true);
assert.strictEqual(room.mode, 'versus');

const pub = publicRoomState(room);
assert.strictEqual(pub.code, '12345');
assert.ok(pub.takenCountries.includes('uk'));
assert.strictEqual(MAX_PLAYERS, 7);

console.log('[PASS] rooms.test.js — 5-digit codes + auto coop/versus OK');
