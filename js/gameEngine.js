/* ==========================================================================
   TRENCHES 1917: HIGH COMMAND ENGINE & GAME STATE MANAGER
   ========================================================================== */

class GameEngine {
    constructor(renderer) {
        this.renderer = renderer;

        // Solo identity (multiplayer will use real socket player ids)
        const U = (typeof TrenchesUnlocks !== 'undefined') ? TrenchesUnlocks : null;
        this.localPlayerId = (U && U.LOCAL_PLAYER_ID) || 'local';

        // Core Resources & State
        this.state = {
            isRunning: false,
            isPaused: false,
            gameSpeed: 1,
            
            // High Command Stats
            commandPoints: 100,
            maxCommandPoints: 100,
            cpRegenRate: 5,
            
            morale: 85,
            requisition: 750,

            // Command XP & Upgrade Tree
            xp: 0,
            unlockedUpgrades: {
                mgTier1: false,
                mgTier2: false,
                mgTier3: false,
                officerTier1: false,
                rifleTier1: false,
                rifleTier2: false,
                rifleTier3: false
            },

            // HQ Star System & Specialists
            stars: 1,
            playerKills: 0,
            killsProgress: 0,
            
            // Active Stream Pipelines
            activeRiflemanPipelines: 0,
            activeSkirmisherPipelines: 0,
            activeMGPipelines: 0,
            activeArtilleryPipelines: 0,
            activeEngineerPipelines: 0,
            activeMedicPipelines: 0,
            activeOfficerPipelines: 0,

            hqSpawnTimer: 0,
            officerCooldown: 0,

            // Reserve Specialist Stock
            machineGunnerCount: 5,
            engineerCount: 5,
            artilleryCount: 5,
            medicCount: 5,
            officerCount: 0,

            // AI Opponent Stats
            aiStars: 1,
            aiKills: 0,
            aiRiflemanPipelines: 1,
            aiChargeCooldown: 0,      // Minimum seconds between AI charges
            aiElapsedTime: 0,         // Total elapsed seconds for AI scaling

            // Faction & Country Info
            playerFaction: 'entente',
            playerCountry: 'uk', // 'uk', 'canada', 'france', 'usa', 'germany', 'austria', 'ottoman'
            enemyFaction: 'central',

            // In-game Clock
            gameTimeMinutes: 360,
            aiTimer: 0
        };

        this.listeners = [];
        this.lastTimestamp = performance.now();
        this.mpSession = null;
        this._snapTimer = 0;
        this.mpClient = null;

        window.gameEngineInstance = this;
    }

    resetBattle(faction, country) {
        this.state.playerFaction = faction;
        this.state.playerCountry = country;
        this.state.enemyFaction = faction === 'entente' ? 'central' : 'entente';
        this.state.commandPoints = 100;
        this.state.morale = 85;
        this.state.stars = 1;
        this.state.playerKills = 0;
        this.state.killsProgress = 0;
        this.state.xp = 0;
        this.state.activeRiflemanPipelines = 0;
        this.state.activeSkirmisherPipelines = 0;
        this.state.activeMGPipelines = 0;
        this.state.activeArtilleryPipelines = 0;
        this.state.activeEngineerPipelines = 0;
        this.state.activeMedicPipelines = 0;
        this.state.officerCount = 0;
        this.state.machineGunnerCount = 5;
        this.state.engineerCount = 5;
        this.state.artilleryCount = 5;
        this.state.medicCount = 5;
        // Versus MP: humans face each other — no AI reinforcement / tactics
        this.state.aiRiflemanPipelines = this.shouldRunEnemyAI() ? 1 : 0;
        this.state.aiElapsedTime = 0;
        this.state.aiChargeCooldown = 0;
        this.state.hqSpawnTimer = 0;
        this.state.gameTimeMinutes = 360;
        this.state.aiTimer = 0;

        if (this.renderer) {
            this.renderer.playerFaction = faction;
            this.renderer.playerCountry = country;
            if (!this.mpSession || !this.mpSession.active) {
                this.renderer.mpGuestView = false;
                this.renderer.mpRoster = null;
            }
            this.renderer.reloadBattlefield();
            this.renderer.setPlayerFaction(faction, country);
        }

        this.setPlayerFaction(faction, country);
        this.start();
    }

    setPlayerFaction(faction, country = 'uk') {
        this.state.playerFaction = faction;
        this.state.playerCountry = country;
        this.state.enemyFaction = faction === 'entente' ? 'central' : 'entente';
        
        if (this.renderer) {
            this.renderer.setPlayerFaction(faction, country);
        }

        const countryTitles = {
            uk: "UNITED KINGDOM (BEF)",
            canada: "CANADIAN EXPEDITIONARY FORCE (CEF)",
            france: "FRENCH ARMY (POILUS)",
            usa: "UNITED STATES EXPEDITIONARY FORCE (AEF)",
            germany: "GERMAN IMPERIAL ARMY",
            austria: "AUSTRO-HUNGARIAN IMPERIAL ARMY",
            ottoman: "OTTOMAN IMPERIAL ARMY"
        };

        this.notifyTelegraph(`HIGH COMMAND: Assumed command of ${countryTitles[country] || faction}! Ready for operations.`, true);
        this.notifyStateChange();
    }

    getLocalPlayerId() {
        if (this.mpSession && this.mpSession.playerId) return this.mpSession.playerId;
        return this.localPlayerId || 'local';
    }

    isMpHost() {
        return !!(this.mpSession && this.mpSession.active && this.mpSession.isHost);
    }

    isMpGuest() {
        return !!(this.mpSession && this.mpSession.active && !this.mpSession.isHost);
    }

    /** Solo + co-op AI only on sides with NO human. Versus = AI fully off. */
    shouldRunEnemyAI() {
        const mp = this.mpSession;
        if (!mp || !mp.active) return true; // solo

        if (mp.mode === 'versus') return false;

        // Never let AI drive a faction that has a human commander (fixes 2v1 “axis charged alone”)
        const enemy = this.state.enemyFaction;
        if (this.factionHasHuman(enemy)) return false;

        return true; // co-op: empty enemy alliance
    }

    factionHasHuman(faction) {
        const players = (this.mpSession && this.mpSession.players) || [];
        return players.some(p => p.faction === faction);
    }

    /**
     * Upgrade buffs for a unit owner only.
     * Solo: local player unlocks; AI/enemy owners get none.
     */
    getUnlocksForOwner(ownerId) {
        if (typeof TrenchesUnlocks !== 'undefined') {
            return TrenchesUnlocks.getUnlocksForOwner(ownerId, {
                [this.getLocalPlayerId()]: { unlockedUpgrades: this.state.unlockedUpgrades }
            });
        }
        if (!ownerId || ownerId === 'ai') {
            return {
                mgTier1: false, mgTier2: false, mgTier3: false, officerTier1: false,
                rifleTier1: false, rifleTier2: false, rifleTier3: false
            };
        }
        if (ownerId === this.getLocalPlayerId()) return this.state.unlockedUpgrades;
        return {
            mgTier1: false, mgTier2: false, mgTier3: false, officerTier1: false,
            rifleTier1: false, rifleTier2: false, rifleTier3: false
        };
    }

    start() {
        if (this.state.isRunning) {
            this.state.isPaused = false;
            this.lastTimestamp = performance.now();
            return;
        }
        this.state.isRunning = true;
        this.state.isPaused = false;
        this.lastTimestamp = performance.now();
        this.loop(this.lastTimestamp);
    }

    pause() {
        this.state.isPaused = true;
    }

    resume() {
        this.state.isPaused = false;
        this.lastTimestamp = performance.now();
    }

    setSpeed(speed) {
        this.state.gameSpeed = speed;
    }

    adjustMorale(amount) {
        this.state.morale = Math.max(0, Math.min(100, this.state.morale + amount));
        this.notifyStateChange();
    }

    awardXP(amount) {
        this.state.xp += amount;
        this.notifyStateChange();
    }

    buyUpgrade(upgradeKey, cost) {
        if (upgradeKey === 'rifleTier2' && !this.state.unlockedUpgrades.rifleTier1) {
            this.notifyTelegraph("RESEARCH LOCKED: Riflemen Tier 2 requires Riflemen Tier 1 first!", true);
            return { success: false, message: "LOCKED! Requires Riflemen Tier 1 first!" };
        }

        if (upgradeKey === 'rifleTier3' && !this.state.unlockedUpgrades.rifleTier2) {
            this.notifyTelegraph("RESEARCH LOCKED: Riflemen Tier 3 requires Riflemen Tier 2 first!", true);
            return { success: false, message: "LOCKED! Requires Riflemen Tier 2 first!" };
        }

        if (upgradeKey === 'mgTier2' && !this.state.unlockedUpgrades.mgTier1) {
            this.notifyTelegraph("RESEARCH LOCKED: MG Tier 2 requires MG Tier 1 first!", true);
            return { success: false, message: "LOCKED! Requires MG Tier 1 first!" };
        }

        if (upgradeKey === 'mgTier3' && !this.state.unlockedUpgrades.mgTier2) {
            this.notifyTelegraph("RESEARCH LOCKED: MG Tier 3 requires MG Tier 2 first!", true);
            return { success: false, message: "LOCKED! Requires MG Tier 2 first!" };
        }

        if (this.state.xp < cost) {
            this.notifyTelegraph(`INSUFFICIENT XP: Requires ${cost} XP!`, true);
            return { success: false, message: "INSUFFICIENT COMMAND XP!" };
        }

        if (this.state.unlockedUpgrades[upgradeKey]) return { success: false, message: "UPGRADE ALREADY UNLOCKED!" };

        this.state.xp -= cost;
        this.state.unlockedUpgrades[upgradeKey] = true;

        const upgradeNames = {
            mgTier1: "MG Tier 1 (10% Overheat Protection)",
            mgTier2: "MG Tier 2 (+10% MG Accuracy)",
            mgTier3: "MG Tier 3 (+20% MG Firing Speed)",
            officerTier1: "Officer Tier 1 (Officer Role Unlocked!)",
            rifleTier1: "Riflemen Tier 1 (Bayonet Melee Unlocked!)",
            rifleTier2: "Riflemen Tier 2 (+10% Rifle Damage)",
            rifleTier3: "Riflemen Tier 3 (+15% Trench Armor & HP)"
        };

        this.notifyTelegraph(`TECH UNLOCKED: High Command research completed - ${upgradeNames[upgradeKey] || upgradeKey}!`, true);
        this.notifyStateChange();
        return { success: true };
    }

    onEnemyKilled() {
        this.state.playerKills += 1;
        this.state.killsProgress += 1;

        const xpOptions = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];
        const killXP = xpOptions[Math.floor(Math.random() * xpOptions.length)];
        this.awardXP(killXP);

        if (this.state.killsProgress >= 5) {
            this.state.killsProgress = 0;
            this.state.stars += 1;
            this.notifyTelegraph(`HIGH COMMAND CITATION: 5 Enemy Casualties Confirmed! (+${killXP} XP, +1 Star ⭐)`, true);
        }
        this.notifyStateChange();
    }

    // --- GAME TICK LOOP ---
    loop(currentTimestamp) {
        if (!this.state.isRunning) return;

        const rawDelta = (currentTimestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = currentTimestamp;

        if (!this.state.isPaused) {
            const deltaTime = rawDelta * this.state.gameSpeed;
            // Guests render host snapshots only — host runs the sim
            if (!this.isMpGuest()) {
                this.update(deltaTime);
                if (this.isMpHost()) {
                    this._snapTimer += deltaTime;
                    this._bodySnapTimer = (this._bodySnapTimer || 0) + deltaTime;
                    this.flushMpFxBurst();
                    // ~30 Hz over P2P when ready, else 20 Hz via WS fallback
                    const p2p = this.mpClient && this.mpClient.p2pReadyCount && this.mpClient.p2pReadyCount() > 0;
                    const interval = p2p ? 0.033 : 0.05;
                    if (this._snapTimer >= interval) {
                        this._snapTimer = 0;
                        const includeBodies = this._bodySnapTimer >= 0.5;
                        if (includeBodies) this._bodySnapTimer = 0;
                        this.broadcastMpSnapshot({ includeBodies });
                    }
                }
            } else {
                this.flushMpSnapshot();
                this.updateGuestLocal(deltaTime);
                this._checkGuestSyncHealth();
            }
            this.renderer.render(deltaTime * 1000);
        }

        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(dt) {
        // 1. CP Accumulation
        if (this.state.commandPoints < this.state.maxCommandPoints) {
            this.state.commandPoints = Math.min(
                this.state.maxCommandPoints, 
                this.state.commandPoints + (this.state.cpRegenRate * dt)
            );
        }

        // 2. Battle Clock Progression
        this.state.gameTimeMinutes += dt * 2;

        // 3. Officer Cooldown Timer (1 per minute limit)
        if (this.state.officerCooldown > 0) {
            this.state.officerCooldown = Math.max(0, this.state.officerCooldown - dt);
        }

        // 4. HQ Continuous Reinforcement Streams (Every 10 seconds)
        this.state.hqSpawnTimer += dt;
        if (this.state.hqSpawnTimer >= 10) {
            this.state.hqSpawnTimer = 0;

            const pFaction = this.state.playerFaction;
            const eFaction = this.state.enemyFaction;

            for (let i = 0; i < this.state.activeRiflemanPipelines; i++) {
                this.renderer.spawnHQRifleman(pFaction, this.getLocalPlayerId());
            }
            for (let i = 0; i < this.state.activeSkirmisherPipelines; i++) {
                this.renderer.spawnHQSkirmisher(pFaction, this.getLocalPlayerId());
            }
            for (let i = 0; i < this.state.activeMGPipelines; i++) {
                this.renderer.spawnHQSpecialist(pFaction, 'machinegunner', this.getLocalPlayerId());
                this.state.machineGunnerCount += 1;
            }
            for (let i = 0; i < this.state.activeArtilleryPipelines; i++) {
                this.renderer.spawnHQSpecialist(pFaction, 'artilleryman', this.getLocalPlayerId());
                this.state.artilleryCount += 1;
            }
            for (let i = 0; i < this.state.activeEngineerPipelines; i++) {
                this.renderer.spawnHQSpecialist(pFaction, 'engineer', this.getLocalPlayerId());
                this.state.engineerCount += 1;
            }
            for (let i = 0; i < this.state.activeMedicPipelines; i++) {
                this.renderer.spawnHQSpecialist(pFaction, 'medic', this.getLocalPlayerId());
                this.state.medicCount += 1;
            }

            if (this.shouldRunEnemyAI()) {
                for (let i = 0; i < this.state.aiRiflemanPipelines; i++) {
                    this.renderer.spawnHQRifleman(eFaction, 'ai');
                }
            } else {
                // Keep AI pipelines pinned at 0 so they cannot escalate mid-match
                this.state.aiRiflemanPipelines = 0;
            }
        }

        // 5. AI Opponent Tactics (disabled in versus multiplayer)
        if (this.shouldRunEnemyAI()) {
            this.state.aiTimer += dt;
            this.state.aiElapsedTime += dt;
            this.state.aiChargeCooldown = Math.max(0, this.state.aiChargeCooldown - dt);

            const newPipelines = Math.min(4, 1 + Math.floor(this.state.aiElapsedTime / 90));
            if (newPipelines > this.state.aiRiflemanPipelines) {
                this.state.aiRiflemanPipelines = newPipelines;
                this.notifyTelegraph(`INTEL: Enemy command escalating reinforcements — now sending ${newPipelines} rifleman streams!`, true);
            }

            if (this.state.aiTimer > 5) {
                this.state.aiTimer = 0;
                this.triggerEnemyAIResponse();
            }
        }

        this.notifyStateChange();
    }

    // --- HIGH COMMAND ORDERS ---
    executeOrder(orderType, cost) {
        if (this.isMpGuest() && this.mpClient) {
            return this._executeOrderAsGuest(orderType, cost);
        }

        const pFaction = this.state.playerFaction;
        const oid = this.getLocalPlayerId();

        if (orderType === 'buy_rifleman_stream') {
            if (this.state.stars < 1) return { success: false, message: "REQUIRES 1 COMMAND STAR ⭐!" };
            this.state.stars -= 1;
            this.state.activeRiflemanPipelines += 1;
            this.renderer.spawnHQRifleman(pFaction, oid);
            this.awardXP(100);
            this.notifyTelegraph("HQ REINFORCEMENT: Rifleman Stream Activated (+1 Rifleman / 10s, +100 XP).", true);
            this.notifyStateChange();
            return { success: true };
        }

        if (orderType === 'buy_skirmisher_stream') {
            if (this.state.stars < 2) return { success: false, message: "REQUIRES 2 COMMAND STARS ⭐!" };
            this.state.stars -= 2;
            this.state.activeSkirmisherPipelines += 1;
            this.renderer.spawnHQSkirmisher(pFaction, oid);
            this.awardXP(100);
            this.notifyTelegraph("HQ REINFORCEMENT: Skirmisher Stream Activated (+1 Skirmisher / 10s — shotgun + 3 grenades, +100 XP).", true);
            this.notifyStateChange();
            return { success: true };
        }

        if (orderType === 'buy_mg_stream') {
            if (this.state.stars < 2) return { success: false, message: "REQUIRES 2 COMMAND STARS ⭐!" };
            this.state.stars -= 2;
            this.state.activeMGPipelines += 1;
            this.state.machineGunnerCount += 1;
            this.renderer.spawnHQSpecialist(pFaction, 'machinegunner', oid);
            this.awardXP(100);
            this.notifyTelegraph("HQ REINFORCEMENT: Machine Gunner Stream Activated (+1 MG Gunner / 10s to Reserve, +100 XP).", true);
            this.notifyStateChange();
            return { success: true };
        }

        if (orderType === 'buy_artillery_stream') {
            if (this.state.stars < 3) return { success: false, message: "REQUIRES 3 COMMAND STARS ⭐!" };
            this.state.stars -= 3;
            this.state.activeArtilleryPipelines += 1;
            this.state.artilleryCount += 1;
            this.renderer.spawnHQSpecialist(pFaction, 'artilleryman', oid);
            this.awardXP(100);
            this.notifyTelegraph("HQ REINFORCEMENT: Artillery Battery Stream Activated (+1 Artillery Man / 10s to Reserve, +100 XP).", true);
            this.notifyStateChange();
            return { success: true };
        }

        if (orderType === 'buy_engineer_stream') {
            if (this.state.stars < 3) return { success: false, message: "REQUIRES 3 COMMAND STARS ⭐!" };
            this.state.stars -= 3;
            this.state.activeEngineerPipelines += 1;
            this.state.engineerCount += 1;
            this.renderer.spawnHQSpecialist(pFaction, 'engineer', oid);
            this.awardXP(100);
            this.notifyTelegraph("HQ REINFORCEMENT: Engineer Corps Stream Activated (+1 Engineer / 10s to Reserve, +100 XP).", true);
            this.notifyStateChange();
            return { success: true };
        }

        if (orderType === 'buy_medic_stream') {
            if (this.state.stars < 3) return { success: false, message: "REQUIRES 3 COMMAND STARS ⭐!" };
            this.state.stars -= 3;
            this.state.activeMedicPipelines += 1;
            this.state.medicCount += 1;
            this.renderer.spawnHQSpecialist(pFaction, 'medic', oid);
            this.awardXP(100);
            this.notifyTelegraph("HQ REINFORCEMENT: Field Medic Stream Activated (+1 Medic / 10s to Reserve, +100 XP).", true);
            this.notifyStateChange();
            return { success: true };
        }

        if (orderType === 'buy_officer_stream') {
            if (!this.state.unlockedUpgrades.officerTier1) {
                return { success: false, message: "LOCKED! Unlock Officer Tier 1 in the Upgrade Panel first!" };
            }
            if (this.state.stars < 10) return { success: false, message: "REQUIRES 10 COMMAND STARS ⭐!" };
            if (this.state.officerCooldown > 0) return { success: false, message: "OFFICER COOLDOWN! Only 1 Officer per minute allowed." };

            this.state.stars -= 10;
            this.state.officerCooldown = 60.0;
            this.state.officerCount += 1;
            this.renderer.spawnHQSpecialist(pFaction, 'officer', oid);
            this.awardXP(100);
            this.notifyTelegraph("HIGH COMMAND ARRIVAL: Field Officer dispatched! (+100 XP) Providing AID to construction (+50% speed), frontline (10% instakill), and artillery (90% accuracy).", true);
            this.notifyStateChange();
            return { success: true };
        }

        if (this.state.commandPoints < cost) {
            return { success: false, message: "INSUFFICIENT COMMAND POINTS!" };
        }

        this.state.commandPoints -= cost;

        switch (orderType) {
            case 'charge':
                this.renderer.orderCharge(pFaction);
                this.notifyTelegraph(
                    'COMMAND DIRECTIVE: Over the Top! Cascading 80% forward from each owned line.',
                    true
                );
                break;

            case 'reinforce':
                const reinforceResult = this.renderer.orderReinforce(pFaction);
                if (!reinforceResult || reinforceResult.sent === 0) {
                    this.state.commandPoints += cost;
                    return { success: false, message: "NO MAIN-TRENCH RIFLEMEN TO REDISTRIBUTE!" };
                }
                break;

            case 'dig_in':
                this.adjustMorale(10);
                this.notifyTelegraph("FIELD DISPATCH: Sandbag fortifications reinforced. Morale +10%.");
                break;

            case 'fallback':
                const retreated = this.renderer.orderWithdrawal(pFaction);
                if (retreated > 0) {
                    this.notifyTelegraph(`COMMAND DIRECTIVE: Tactical withdrawal executed! ${retreated} squads falling back to trench cover.`);
                } else {
                    this.notifyTelegraph("FIELD REPORT: All troops currently holding trench lines.");
                }
                break;

            default:
                break;
        }

        this.notifyStateChange();
        return { success: true };
    }

    triggerEnemyAIResponse() {
        if (!this.shouldRunEnemyAI()) return;

        const eFaction = this.state.enemyFaction;
        // Hard stop: never orderCharge / shell as a human-controlled side
        if (this.factionHasHuman(eFaction)) {
            console.warn('[AI] blocked — human controls', eFaction);
            return;
        }

        const targetTrenchX = eFaction === 'central' ? this.renderer.ententeTrenchX : this.renderer.centralTrenchX;

        const garrisonCount = this.renderer.units.filter(
            u => u.faction === eFaction && this.renderer._isFrontlineInfantry(u.type) && u.state === 'garrison' && u.hp > 0
        ).length;

        const roll = Math.random();

        if (roll < 0.30) {
            const targetX = targetTrenchX + (Math.random() * 60 - 30);
            const targetY = 200 + Math.random() * (this.renderer.worldHeight - 400);
            this.renderer.fireArtillery(targetX, targetY, 'he');
            this.notifyTelegraph(`WARNING: Enemy ${eFaction === 'central' ? 'German' : 'Allied'} artillery shell incoming!`, true);
            return;
        }

        const minChargeMen = Math.min(18, 10 + Math.floor(this.state.aiElapsedTime / 60) * 2);

        if (roll < 0.55 && this.state.aiChargeCooldown <= 0 && garrisonCount >= minChargeMen) {
            this.renderer.orderCharge(eFaction);
            this.state.aiChargeCooldown = 60 + Math.random() * 30;
            const nextTarget = this.renderer._getNextCPTarget(eFaction);
            const cpIdx = this.renderer.capturePoints.findIndex(cp => Math.abs(cp.x - nextTarget) < 50);
            const targetLabel = cpIdx >= 0 ? this.renderer.capturePoints[cpIdx].label : 'your frontline';
            this.notifyTelegraph(
                `INTEL REPORT: Enemy ${eFaction === 'central' ? 'Central Powers' : 'Entente'} massed ${garrisonCount} men — advancing on ${targetLabel}!`,
                true
            );
        } else if (this.state.aiChargeCooldown > 0 && garrisonCount < minChargeMen) {
            if (Math.random() < 0.15) {
                this.notifyTelegraph(
                    `INTELLIGENCE: Enemy massing troops (${garrisonCount}/${minChargeMen} men). Expect a major assault soon!`,
                    false
                );
            }
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyStateChange() {
        this.listeners.forEach(fn => fn(this.state));
    }

    notifyTelegraph(message, isUrgent = false) {
        if (window.UIController) {
            window.UIController.addTelegraphDispatch(message, isUrgent);
        }
    }

    getFormattedTime() {
        const totalMins = Math.floor(this.state.gameTimeMinutes);
        const hrs = Math.floor(totalMins / 60) % 24;
        const mins = totalMins % 60;
        const hrsStr = hrs < 10 ? '0' + hrs : hrs;
        const minsStr = mins < 10 ? '0' + mins : mins;
        return `${hrsStr}:${minsStr} HOURS`;
    }

    _executeOrderAsGuest(orderType, cost) {
        const buyStars = {
            buy_rifleman_stream: 1,
            buy_skirmisher_stream: 2,
            buy_mg_stream: 2,
            buy_artillery_stream: 3,
            buy_engineer_stream: 3,
            buy_medic_stream: 3,
            buy_officer_stream: 10
        };

        if (buyStars[orderType] != null) {
            const need = buyStars[orderType];
            if (orderType === 'buy_officer_stream' && !this.state.unlockedUpgrades.officerTier1) {
                return { success: false, message: "LOCKED! Unlock Officer Tier 1 in the Upgrade Panel first!" };
            }
            if (this.state.stars < need) return { success: false, message: `REQUIRES ${need} COMMAND STAR(S) ⭐!` };
            if (orderType === 'buy_officer_stream' && this.state.officerCooldown > 0) {
                return { success: false, message: "OFFICER COOLDOWN! Only 1 Officer per minute allowed." };
            }
            this.state.stars -= need;
            if (orderType === 'buy_rifleman_stream') this.state.activeRiflemanPipelines += 1;
            if (orderType === 'buy_skirmisher_stream') this.state.activeSkirmisherPipelines += 1;
            if (orderType === 'buy_mg_stream') this.state.activeMGPipelines += 1;
            if (orderType === 'buy_artillery_stream') this.state.activeArtilleryPipelines += 1;
            if (orderType === 'buy_engineer_stream') this.state.activeEngineerPipelines += 1;
            if (orderType === 'buy_medic_stream') this.state.activeMedicPipelines += 1;
            if (orderType === 'buy_officer_stream') {
                this.state.officerCooldown = 60;
                this.state.officerCount += 1;
            }
            this.awardXP(100);
            this.mpClient.sendCmd({ orderType });
            // Optimistic: guest sees their own order immediately (host reconciles via snaps)
            this._applyGuestOptimisticOrder(orderType);
            this.notifyStateChange();
            return { success: true };
        }

        if (this.state.commandPoints < cost) {
            return { success: false, message: "INSUFFICIENT COMMAND POINTS!" };
        }
        this.state.commandPoints -= cost;
        this.mpClient.sendCmd({ orderType, cost });
        this._applyGuestOptimisticOrder(orderType);
        this.notifyTelegraph(`ORDER RELAYED: ${orderType}`, true);
        this.notifyStateChange();
        return { success: true };
    }

    _applyGuestOptimisticOrder(orderType) {
        if (!this.renderer || !this.isMpGuest()) return;
        const faction = this.state.playerFaction;
        if (orderType === 'charge') this.renderer.orderCharge(faction);
        else if (orderType === 'reinforce') this.renderer.orderReinforce(faction);
        else if (orderType === 'fallback') this.renderer.orderWithdrawal(faction);
    }

    broadcastMpSnapshot(opts = {}) {
        if (!this.isMpHost() || !this.mpClient || !this.renderer) return;
        const heavyOk = typeof this.mpClient.canSendHeavy !== 'function' || this.mpClient.canSendHeavy();
        // Never skip the whole snap — only strip FX when congested (guest capture/pause fix)
        const snapOpts = heavyOk
            ? opts
            : { includeBodies: !!opts.includeBodies, lightFx: true };
        this.mpClient.sendSnapshot(this.renderer.buildSnapshot(snapOpts));
    }

    /** Host: flush queued muzzle flashes as tiny packets (~40ms). */
    flushMpFxBurst() {
        if (!this.isMpHost() || !this.mpClient || !this.renderer) return;
        const now = performance.now();
        if (this._lastFxFlushAt && now - this._lastFxFlushAt < 40) return;
        const shots = this.renderer.drainMpFxQueue && this.renderer.drainMpFxQueue();
        if (!shots || !shots.length) return;
        this._lastFxFlushAt = now;
        this.mpClient.sendFxBurst(shots);
    }

    applyMpFxBurst(shots) {
        if (!this.isMpGuest() || !this.renderer) return;
        this.renderer.applyFxBurst(shots);
    }

    applyMpSnapshot(snap) {
        if (!this.isMpGuest() || !this.renderer) return;
        // Coalesce: only keep latest until next frame
        this._pendingMpSnap = snap;
        this._lastMpSnapAt = performance.now();
    }

    flushMpSnapshot() {
        if (!this._pendingMpSnap || !this.renderer) return;
        // Don't teleport the world mid-pan — apply after drag ends
        if (this.renderer.camera && this.renderer.camera.isDragging) return;
        const snap = this._pendingMpSnap;
        this._pendingMpSnap = null;
        this.renderer.applySnapshot(snap);
    }

    /**
     * Guest: keep CP / clock / HUD alive without running the full sim or HQ spawns.
     */
    updateGuestLocal(dt) {
        if (this.state.commandPoints < this.state.maxCommandPoints) {
            this.state.commandPoints = Math.min(
                this.state.maxCommandPoints,
                this.state.commandPoints + (this.state.cpRegenRate * dt)
            );
        }
        this.state.gameTimeMinutes += dt * 2;
        if (this.state.officerCooldown > 0) {
            this.state.officerCooldown = Math.max(0, this.state.officerCooldown - dt);
        }
        this._guestHudAcc = (this._guestHudAcc || 0) + dt;
        if (this._guestHudAcc >= 0.25) {
            this._guestHudAcc = 0;
            this.notifyStateChange();
        }
    }

    /** Guest: warn if host snapshots stall (looks like a frozen battlefield). */
    _checkGuestSyncHealth() {
        if (!this.isMpGuest()) return;
        const last = this._lastMpSnapAt || 0;
        const stalled = last > 0 && (performance.now() - last) > 2000;
        if (stalled && !this._guestSyncWarned) {
            this._guestSyncWarned = true;
            this.notifyTelegraph('SYNC DELAY — waiting on host battlefield…', true);
            console.warn('[MP] Guest snapshot stall >2s');
        } else if (!stalled) {
            this._guestSyncWarned = false;
        }
    }

    applyMpCmd(fromId, cmd) {
        if (!this.isMpHost() || !this.renderer || !cmd) return;
        const seat = (this.mpSession.players || []).find(p => p.id === fromId);
        if (!seat) return;
        const faction = seat.faction;
        const orderType = cmd.orderType;
        switch (orderType) {
            case 'charge':
                this.renderer.orderCharge(faction);
                this.notifyTelegraph(`ALLY ORDER: ${seat.name || 'Ally'} — Over the Top!`, true);
                break;
            case 'reinforce':
                this.renderer.orderReinforce(faction);
                break;
            case 'fallback':
                this.renderer.orderWithdrawal(faction);
                break;
            case 'dig_in':
                this.adjustMorale(5);
                break;
            case 'buy_rifleman_stream':
                this.renderer.spawnHQRifleman(faction, fromId);
                break;
            case 'buy_skirmisher_stream':
                this.renderer.spawnHQSkirmisher(faction, fromId);
                break;
            case 'buy_mg_stream':
                this.renderer.spawnHQSpecialist(faction, 'machinegunner', fromId);
                break;
            case 'buy_artillery_stream':
                this.renderer.spawnHQSpecialist(faction, 'artilleryman', fromId);
                break;
            case 'buy_engineer_stream':
                this.renderer.spawnHQSpecialist(faction, 'engineer', fromId);
                break;
            case 'buy_medic_stream':
                this.renderer.spawnHQSpecialist(faction, 'medic', fromId);
                break;
            case 'buy_officer_stream':
                this.renderer.spawnHQSpecialist(faction, 'officer', fromId);
                break;
            default:
                break;
        }
        this.broadcastMpSnapshot();
    }
}
