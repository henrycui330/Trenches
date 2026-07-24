/**
 * Task 1 tests: upgrade buffs are per-owner only.
 * Run: node code/sim/unlocks.test.js
 */
const assert = require('assert');
const {
    getUnlocksForOwner,
    defaultOwnerId,
    createEmptyUnlocks,
    LOCAL_PLAYER_ID,
    AI_OWNER_ID
} = require('./unlocks.js');

const players = {
    [LOCAL_PLAYER_ID]: {
        unlockedUpgrades: {
            ...createEmptyUnlocks(),
            rifleTier3: true,
            mgTier1: true,
            rifleTier1: true,
            rifleTier2: true
        }
    },
    ally2: {
        unlockedUpgrades: {
            ...createEmptyUnlocks(),
            rifleTier2: true
        }
    }
};

// AI never gets buffs
const aiUnlocks = getUnlocksForOwner(AI_OWNER_ID, players);
assert.strictEqual(aiUnlocks.rifleTier3, false, 'AI must not get rifleTier3');
assert.strictEqual(aiUnlocks.mgTier1, false, 'AI must not get mgTier1');

// Local player gets own unlocks
const localUnlocks = getUnlocksForOwner(LOCAL_PLAYER_ID, players);
assert.strictEqual(localUnlocks.rifleTier3, true, 'local gets rifleTier3');
assert.strictEqual(localUnlocks.mgTier1, true, 'local gets mgTier1');

// Ally unlocks do not leak to local lookup when querying ally id
const allyUnlocks = getUnlocksForOwner('ally2', players);
assert.strictEqual(allyUnlocks.rifleTier2, true, 'ally2 gets own rifleTier2');
assert.strictEqual(allyUnlocks.rifleTier3, false, 'ally2 does not get local rifleTier3');

// Unknown owner
const unknown = getUnlocksForOwner('nobody', players);
assert.strictEqual(unknown.rifleTier3, false, 'unknown owner empty unlocks');
assert.strictEqual(getUnlocksForOwner(null, players).mgTier1, false);

// Default owner assignment
assert.strictEqual(defaultOwnerId('entente', 'entente', LOCAL_PLAYER_ID), LOCAL_PLAYER_ID);
assert.strictEqual(defaultOwnerId('central', 'entente', LOCAL_PLAYER_ID), AI_OWNER_ID);
assert.strictEqual(defaultOwnerId('central', 'central', 'p1'), 'p1');

console.log('[PASS] unlocks.test.js — owner-gated upgrades OK');
