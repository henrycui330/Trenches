/**
 * Per-owner upgrade unlock lookup (solo + multiplayer).
 * AI and unknown owners never receive player upgrade buffs.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TrenchesUnlocks = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    const EMPTY_UNLOCKS = Object.freeze({
        mgTier1: false,
        mgTier2: false,
        mgTier3: false,
        officerTier1: false,
        rifleTier1: false,
        rifleTier2: false,
        rifleTier3: false
    });

    function createEmptyUnlocks() {
        return {
            mgTier1: false,
            mgTier2: false,
            mgTier3: false,
            officerTier1: false,
            rifleTier1: false,
            rifleTier2: false,
            rifleTier3: false
        };
    }

    /**
     * @param {string|null|undefined} ownerId
     * @param {Record<string, { unlockedUpgrades?: object }>} playersById
     * @returns {object} unlock flags for that owner (never mutates shared EMPTY)
     */
    function getUnlocksForOwner(ownerId, playersById) {
        if (!ownerId || ownerId === 'ai') {
            return createEmptyUnlocks();
        }
        const player = playersById && playersById[ownerId];
        if (!player || !player.unlockedUpgrades) {
            return createEmptyUnlocks();
        }
        return player.unlockedUpgrades;
    }

    /** Solo default: player units use 'local', enemy/AI use 'ai' */
    function defaultOwnerId(faction, playerFaction, localPlayerId) {
        const localId = localPlayerId || 'local';
        if (faction === playerFaction) return localId;
        return 'ai';
    }

    return {
        EMPTY_UNLOCKS,
        createEmptyUnlocks,
        getUnlocksForOwner,
        defaultOwnerId,
        LOCAL_PLAYER_ID: 'local',
        AI_OWNER_ID: 'ai'
    };
});
