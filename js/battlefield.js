/* ==========================================================================
   TRENCHES 1917: BATTLEFIELD 2D CANVAS RENDERER & COMBAT SIMULATOR
   ========================================================================== */

class BattlefieldRenderer {
    constructor(canvasId, minimapCanvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.minimapCanvas = document.getElementById(minimapCanvasId);
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

        // Faction Control & Country State
        this.playerFaction = 'entente';
        this.playerCountry = 'uk'; // 'uk', 'canada', 'france', 'usa', 'germany', 'austria', 'ottoman'

        // Custom Asset Image Loading
        this.alliedImg = new Image();
        this.alliedImg.src = 'UK123-removebg-preview.png';
        this.alliedImgLoaded = false;
        this.alliedImg.onload = () => { this.alliedImgLoaded = true; };

        this.canadaImg = new Image();
        this.canadaImg.src = 'canada_countryball_by_bosphore9_by_bosphore9_dfyszme-fullview.png';
        this.canadaImgLoaded = false;
        this.canadaImg.onload = () => { this.canadaImgLoaded = true; };

        this.franceImg = new Image();
        this.franceImg.src = 'a-french-countryball-i-drew-some-time-ago-v0-sq9mv8o9c21b1-removebg-preview.png';
        this.franceImgLoaded = false;
        this.franceImg.onload = () => { this.franceImgLoaded = true; };

        this.usaImg = new Image();
        this.usaImg.src = 'OIP__3_-removebg-preview.png';
        this.usaImgLoaded = false;
        this.usaImg.onload = () => { this.usaImgLoaded = true; };

        this.germanyImg = new Image();
        this.germanyImg.src = '560-5607261_germany-countryballs-ww1-freetoedit-eye-liner-hd-png-removebg-preview.png';
        this.germanyImgLoaded = false;
        this.germanyImg.onload = () => { this.germanyImgLoaded = true; };

        this.austriaImg = new Image();
        this.austriaImg.src = 'channels4_profile-removebg-preview.png';
        this.austriaImgLoaded = false;
        this.austriaImg.onload = () => { this.austriaImgLoaded = true; };

        this.ottomanImg = new Image();
        this.ottomanImg.src = 'ottomans-removebg-preview.png';
        this.ottomanImgLoaded = false;
        this.ottomanImg.onload = () => { this.ottomanImgLoaded = true; };

        this.weaponImg = new Image();
        this.weaponImg.src = 'KAR98K-removebg-preview.png';
        this.weaponImgLoaded = false;
        this.weaponImg.onload = () => { this.weaponImgLoaded = true; };

        this.bayonetWeaponImg = new Image();
        this.bayonetWeaponImg.src = 'KAR98k BAYONET.png';
        this.bayonetWeaponImgLoaded = false;
        this.bayonetWeaponImg.onload = () => { this.bayonetWeaponImgLoaded = true; };

        this.pistolImg = new Image();
        this.pistolImg.src = 'm1911-removebg-preview.png';
        this.pistolImgLoaded = false;
        this.pistolImg.onload = () => { this.pistolImgLoaded = true; };

        this.alliedMgImg = new Image();
        this.alliedMgImg.src = 'm2-removebg-preview.png';
        this.alliedMgImgLoaded = false;
        this.alliedMgImg.onload = () => { this.alliedMgImgLoaded = true; };

        this.axisMgImg = new Image();
        this.axisMgImg.src = 'mg42-removebg-preview.png';
        this.axisMgImgLoaded = false;
        this.axisMgImg.onload = () => { this.axisMgImgLoaded = true; };

        this.sovietImg = new Image();
        this.sovietImg.src = 'soviet-removebg-preview.png';
        this.sovietImgLoaded = false;
        this.sovietImg.onload = () => { this.sovietImgLoaded = true; };

        this.sovietMgImg = new Image();
        this.sovietMgImg.src = 'PKMMMMM-removebg-preview.png';
        this.sovietMgImgLoaded = false;
        this.sovietMgImg.onload = () => { this.sovietMgImgLoaded = true; };

        this.artilleryImg = new Image();
        this.artilleryImg.src = 'artillery!!!!.png';
        this.artilleryImgLoaded = false;
        this.artilleryImg.onload = () => { this.artilleryImgLoaded = true; };

        this.shotgunImg = new Image();
        this.shotgunImg.src = 'remington-removebg-preview.png';
        this.shotgunImgLoaded = false;
        this.shotgunImg.onload = () => { this.shotgunImgLoaded = true; };

        this.grenadeImg = new Image();
        this.grenadeImg.src = 'm67-fragmentation-grenade-3d-model-f7eecd64dd-removebg-preview.png';
        this.grenadeImgLoaded = false;
        this.grenadeImg.onload = () => { this.grenadeImgLoaded = true; };

        this.sovietTankImg = new Image();
        this.sovietTankImg.src = 'Untitled_design__5_-removebg-preview.png';
        this.sovietTankImgLoaded = false;
        this.sovietTankImg.onload = () => { this.sovietTankImgLoaded = true; };

        this.axisTankImg = new Image();
        this.axisTankImg.src = 'Untitled_design__6_-removebg-preview.png';
        this.axisTankImgLoaded = false;
        this.axisTankImg.onload = () => { this.axisTankImgLoaded = true; };

        this.alliedTankImg = new Image();
        this.alliedTankImg.src = 'Untitled_design__5_-removebg-preview (1).png';
        this.alliedTankImgLoaded = false;
        this.alliedTankImg.onload = () => { this.alliedTankImgLoaded = true; };

        this.tanks = [];

        // World Coordinates (Horizontal battlefield: Left = Allied, Right = Central Powers)
        this.worldWidth = 4800;
        this.worldHeight = 1600;
        
        this.camera = {
            x: 0,
            y: (this.worldHeight - window.innerHeight) / 2,
            zoom: 1.0,
            targetZoom: 1.0,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0
        };

        // Environment, World Entities & Structures
        this.craters = [];
        this.barbedWire = [];
        this.units = [];       // Living soldiers
        this.structures = [];  // Built MG Nests, Artillery Guns, Bunkers
        this.deadBodies = [];  // Fallen soldiers
        this.particles = [];   
        this.ordnance = [];    
        this.tracers = [];     
        this.planes = [];
        /** Host→guest tiny shot packets (drained each flush). */
        this._mpFxQueue = [];

        // Build Placement Mode state
        this.buildMode = {
            active: false,
            structureType: null,
            mouseX: 0,
            mouseY: 0
        };

        // Grid Layout (X coordinates) — world is 4800px wide (Western Front)
        this.mapId = 'western';
        this.ententeSupportTrenchX = 480;
        this.ententeTrenchX        = 900;

        // Multiplayer seat list: [{ id, country, faction }, ...] — null/empty = solo
        this.mpRoster = null;
        /** Guest clients: skip local combat/CP sim; host snapshots are authority. */
        this.mpGuestView = false;
        /**
         * Guest graphics LOD (user toggle). true = lite (default), false = full visuals.
         * Only applies when mpGuestView is set.
         */
        this.guestRenderLite = true;
        this._mpDeadBodyAcc = 0;

        // 3 Neutral Capture Points across No Man's Land
        this.capturePoints = [
            { x: 1700, owner: null, progress: 0, path: null, label: 'CHARLIE-1' },
            { x: 2400, owner: null, progress: 0, path: null, label: 'CHARLIE-2' },
            { x: 3100, owner: null, progress: 0, path: null, label: 'CHARLIE-3' },
        ];

        this.centralTrenchX        = 3900;
        this.centralSupportTrenchX = 4320;

        // Weather state
        this.weather = {
            type: 'fog',
            fogParticles: [],
            rainParticles: []
        };

        this.init();
    }

    /** Guest + lite graphics preference. */
    isGuestLite() {
        return !!this.mpGuestView && this.guestRenderLite === true;
    }

    setGuestRenderLite(lite) {
        this.guestRenderLite = !!lite;
        try {
            localStorage.setItem('trenches_guest_gfx', lite ? 'lite' : 'normal');
        } catch (_) { /* ignore */ }
        if (lite) {
            this._enforceGuestFxCaps();
            if (this.weather) {
                this.weather.fogParticles = [];
                this.weather.rainParticles = [];
            }
        } else if (this.mpGuestView && this.weather) {
            // Rebuild fog for normal mode if we cleared it in lite
            if (!this.weather.fogParticles.length) {
                for (let i = 0; i < 40; i++) {
                    this.weather.fogParticles.push({
                        x: Math.random() * this.worldWidth,
                        y: Math.random() * this.worldHeight,
                        radius: 120 + Math.random() * 180,
                        vx: 0.1 + Math.random() * 0.25,
                        opacity: 0.08 + Math.random() * 0.12
                    });
                }
            }
        }
        console.log('[MP] guest graphics:', lite ? 'LITE' : 'NORMAL');
    }

    loadGuestGfxPreference() {
        try {
            const v = localStorage.getItem('trenches_guest_gfx');
            if (v === 'normal') this.guestRenderLite = false;
            else if (v === 'lite') this.guestRenderLite = true;
        } catch (_) { /* ignore */ }
    }

    applyMapLayout(mode = 'checkpoints') {
        this.gameMode = mode;
        this.mapId = 'western';
        this.worldWidth = 4800;
        this.ententeSupportTrenchX = 480;
        this.ententeTrenchX = 900;
        this.centralTrenchX = 3900;
        this.centralSupportTrenchX = 4320;

        if (mode === 'koth') {
            this.capturePoints = [
                { x: 2400, owner: null, progress: 0, path: null, label: 'HILL-100' }
            ];
        } else {
            this.capturePoints = [
                { x: 1700, owner: null, progress: 0, path: null, label: 'CHARLIE-1' },
                { x: 2400, owner: null, progress: 0, path: null, label: 'CHARLIE-2' },
                { x: 3100, owner: null, progress: 0, path: null, label: 'CHARLIE-3' },
            ];
        }
        console.log(`[MAP] Applied layout mode=${mode} world=${this.worldWidth} cps=${this.capturePoints.length}`);
    }

    reloadBattlefield(options = {}) {
        this.gameMode = options.gameMode || 'checkpoints';
        this.weatherType = options.weather || 'fog';
        this.startingGarrisonCount = parseInt(options.startingMen || 25, 10);

        this.applyMapLayout(this.gameMode);
        this.units = [];
        this.deadBodies = [];
        this.structures = [];
        this.craters = [];
        this.barbedWire = [];
        this.ordnance = [];
        this.particles = [];
        this.tracers = [];
        this.planes = [];
        this.tanks = [];
        this.generateTerrainFeatures();
        this.initWeather(this.weatherType);
        this.spawnInitialGarrisons();
        if (this.playerFaction === 'central') {
            this.camera.x = Math.max(0, this.centralTrenchX - 900);
        } else {
            this.camera.x = 0;
        }
        this.clampCamera();
        this.resize();
    }

    setPlayerFaction(faction, country = 'uk') {
        this.playerFaction = faction;
        this.playerCountry = country;
        if (faction === 'central') {
            this.camera.x = Math.max(0, this.centralTrenchX - 900);
        } else {
            this.camera.x = 0;
        }
        this.clampCamera();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.generateTerrainFeatures();
        this.initWeather();
        this.setupCameraControls();
        this.setupBuildModeListeners();
        this.spawnInitialGarrisons();
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        const w = (parent && parent.clientWidth) || window.innerWidth;
        const h = (parent && parent.clientHeight) || (window.innerHeight - 150);
        // Avoid 0×0 buffer (hidden battle screen) — keeps camera clamp sane
        this.canvas.width = Math.max(320, w);
        this.canvas.height = Math.max(240, h);
        this.clampCamera();
    }

    generateTerrainFeatures() {
        this.craters = [];
        this.barbedWire = [];

        const nmlLeft = this.ententeTrenchX + 80;
        const nmlRight = this.centralTrenchX - 80;
        const nmlWidth = Math.max(200, nmlRight - nmlLeft);
        const guestLite = this.isGuestLite();
        const craterCount = guestLite ? 16 : 80;

        for (let i = 0; i < craterCount; i++) {
            this.craters.push({
                x: nmlLeft + Math.random() * nmlWidth,
                y: 100 + Math.random() * (this.worldHeight - 200),
                radius: 18 + Math.random() * 30,
                waterColor: Math.random() > 0.4 ? '#1c221a' : '#171410'
            });
        }

        const yStep = guestLite ? 120 : 60;
        for (let y = 80; y < this.worldHeight - 80; y += yStep) {
            this.barbedWire.push({ x: this.ententeTrenchX + 60, y: y + Math.random() * 10 });
            this.barbedWire.push({ x: this.centralTrenchX  - 60, y: y + Math.random() * 10 });
            if (!guestLite && Math.random() < 0.4) {
                this.capturePoints.forEach(cp => {
                    this.barbedWire.push({ x: cp.x + (Math.random() < 0.5 ? -40 : 40), y: y + Math.random() * 10 });
                });
            }
        }
    }

    spawnInitialGarrisons() {
        this.units = [];
        this.deadBodies = [];
        this.structures = [];
        this.buildTrenchPaths();

        this._spawnFactionGarrison('entente');
        this._spawnFactionGarrison('central');
    }

    /** Humans on this faction from mpRoster, or solo/AI defaults. */
    _getFactionRoster(faction) {
        if (this.mpRoster && this.mpRoster.length) {
            const humans = this.mpRoster.filter(p => p.faction === faction && p.country);
            if (humans.length) {
                return humans.map(p => ({ ownerId: p.id, country: p.country }));
            }
            return [{
                ownerId: 'ai',
                country: faction === 'entente' ? 'uk' : 'germany'
            }];
        }
        const isPlayer = faction === this.playerFaction;
        return [{
            ownerId: isPlayer ? this._getLocalPlayerId() : 'ai',
            country: isPlayer ? this.playerCountry : this._getEnemyCountry()
        }];
    }

    _spawnFactionGarrison(faction) {
        const roster = this._getFactionRoster(faction);
        const totalRifle = this.startingGarrisonCount || 25;
        const yMin = 150;
        const ySpan = this.worldHeight - 300;
        const frontPath = faction === 'entente' ? this.ententeFrontPath : this.centralFrontPath;
        const supportX = faction === 'entente' ? this.ententeSupportTrenchX : this.centralSupportTrenchX;
        const n = roster.length;

        for (let i = 0; i < totalRifle; i++) {
            const owner = roster[Math.min(n - 1, Math.floor((i / totalRifle) * n))];
            const band = ySpan / n;
            const ownerIndex = roster.indexOf(owner);
            const y0 = yMin + ownerIndex * band;
            const t = (i % Math.ceil(totalRifle / n)) / Math.max(1, Math.ceil(totalRifle / n) - 1 || 1);
            const y = y0 + t * (band - 20) + (Math.random() * 8 - 4);
            const x = this.getTrenchXAtY(frontPath, y);
            this.units.push(this.createSoldier(faction, x, y, 'rifleman', 'garrison', owner.ownerId, owner.country));
        }

        for (let oi = 0; oi < n; oi++) {
            const owner = roster[oi];
            const band = ySpan / n;
            const baseY = yMin + oi * band + band * 0.25;
            ['machinegunner', 'engineer', 'artilleryman', 'medic'].forEach((type, ti) => {
                this.units.push(this.createSoldier(
                    faction, supportX, baseY + ti * 40, type, 'reserve', owner.ownerId, owner.country
                ));
            });
        }
    }

    _countryForOwner(ownerId, faction) {
        if (this.mpRoster && this.mpRoster.length) {
            const seat = this.mpRoster.find(p => p.id === ownerId);
            if (seat && seat.country) return seat.country;
        }
        if (ownerId === 'ai') {
            return faction === 'central' ? 'germany' : 'uk';
        }
        if (ownerId === this._getLocalPlayerId()) return this.playerCountry;
        return faction === this.playerFaction ? this.playerCountry : this._getEnemyCountry();
    }

    _getLocalPlayerId() {
        if (window.gameEngineInstance && typeof window.gameEngineInstance.getLocalPlayerId === 'function') {
            return window.gameEngineInstance.getLocalPlayerId();
        }
        return (typeof TrenchesUnlocks !== 'undefined' && TrenchesUnlocks.LOCAL_PLAYER_ID) || 'local';
    }

    _getUnlocksForOwner(ownerId) {
        if (window.gameEngineInstance && typeof window.gameEngineInstance.getUnlocksForOwner === 'function') {
            return window.gameEngineInstance.getUnlocksForOwner(ownerId);
        }
        return {};
    }

    _resolveOwnerId(faction, ownerId) {
        if (ownerId) return ownerId;
        if (this.mpRoster && this.mpRoster.length) {
            // Prefer local human seat on this faction
            const localId = this._getLocalPlayerId();
            const mine = this.mpRoster.find(p => p.id === localId && p.faction === faction);
            if (mine) return localId;
            const any = this.mpRoster.find(p => p.faction === faction);
            if (any) return any.id;
            return 'ai';
        }
        if (typeof TrenchesUnlocks !== 'undefined') {
            return TrenchesUnlocks.defaultOwnerId(faction, this.playerFaction, this._getLocalPlayerId());
        }
        return faction === this.playerFaction ? this._getLocalPlayerId() : 'ai';
    }

    createSoldier(faction, x, y, type = 'rifleman', state = 'garrison', ownerId = null, country = null) {
        const resolvedOwnerId = this._resolveOwnerId(faction, ownerId);
        const resolvedCountry = country || this._countryForOwner(resolvedOwnerId, faction);
        const unlocks = this._getUnlocksForOwner(resolvedOwnerId);
        let range = 750;
        if (type === 'machinegunner') range = 900;
        else if (type === 'skirmisher') range = 320;
        else if (type === 'engineer' || type === 'artilleryman' || type === 'officer') range = 420;
        else if (type === 'rifleman') {
            if (unlocks.rifleTier2) range = 900;
            else if (unlocks.rifleTier1) range = 830;
        }
        
        const baseHp = (type === 'rifleman' && unlocks.rifleTier3) ? 115 : 100;
        const isFrontline = type === 'rifleman' || type === 'skirmisher';

        return {
            id: Math.random().toString(36).substr(2, 9),
            faction: faction,
            ownerId: resolvedOwnerId,
            country: resolvedCountry,
            type: type,
            x: x,
            y: y,
            targetX: x,
            targetY: y,
            state: state,
            holdLine: isFrontline ? 'main' : null,
            chargeHoldLine: null,
            chargeTargetX: undefined,
            assignedBuildId: null,
            assignedTargetId: null,
            reviveTimer: 0,
            grenades: type === 'skirmisher' ? 3 : 0,
            grenadeCooldown: type === 'skirmisher' ? 1.5 + Math.random() * 2 : 0,
            hp: baseHp,
            maxHp: baseHp,
            speed: type === 'engineer' ? 2.2 : (type === 'machinegunner' ? 1.6 : (type === 'officer' ? 2.0 : (type === 'medic' ? 2.3 : (type === 'skirmisher' ? 2.2 : 1.9)))),
            range: range,
            shootCooldown: Math.random() * 2.5,
            isAiming: false,
            aimTimer: 0,
            inCover: state === 'garrison' || state === 'reserve'
        };
    }

    // Build zigzag trench path arrays (called once at init)
    buildTrenchPaths() {
        const segLen  = 90;
        const jogH    = 18;
        const jogDist = 28;

        const buildPath = (baseX) => {
            const pts = [];
            let curX = baseX;
            let curY = 0;
            let jogDir = 1;
            while (curY < this.worldHeight) {
                pts.push({ x: curX, y: curY });
                curY = Math.min(curY + segLen, this.worldHeight);
                pts.push({ x: curX, y: curY });
                if (curY >= this.worldHeight) break;
                const nextX = curX + jogDir * jogDist;
                pts.push({ x: nextX, y: curY });
                curX = nextX;
                curY = Math.min(curY + jogH, this.worldHeight);
                pts.push({ x: curX, y: curY });
                jogDir *= -1;
            }
            return pts;
        };

        this.ententeFrontPath = buildPath(this.ententeTrenchX);
        this.centralFrontPath = buildPath(this.centralTrenchX);

        // Build paths for each capture point trench
        this.capturePoints.forEach(cp => {
            cp.path = buildPath(cp.x);
        });
    }

    // Interpolate trench X at a given Y from a path array
    getTrenchXAtY(path, y) {
        if (!path || path.length < 2) return path ? path[0].x : 0;
        for (let i = 0; i < path.length - 1; i++) {
            const a = path[i], b = path[i + 1];
            const minY = Math.min(a.y, b.y);
            const maxY = Math.max(a.y, b.y);
            if (y >= minY && y <= maxY) {
                if (Math.abs(b.y - a.y) < 0.001) return a.x; // horizontal segment
                const t = (y - a.y) / (b.y - a.y);
                return a.x + (b.x - a.x) * t;
            }
        }
        return path[path.length - 1].x;
    }

    // holdLine: 'main' | 'cp0' | 'cp1' | 'cp2' | 'enemy'
    _getPathForHoldLine(faction, holdLine) {
        if (holdLine === 'enemy') {
            return faction === 'entente' ? this.centralFrontPath : this.ententeFrontPath;
        }
        if (typeof holdLine === 'string' && holdLine.startsWith('cp')) {
            const idx = parseInt(holdLine.slice(2), 10);
            if (this.capturePoints[idx] && this.capturePoints[idx].path) {
                return this.capturePoints[idx].path;
            }
        }
        return faction === 'entente' ? this.ententeFrontPath : this.centralFrontPath;
    }

    _getXForHoldLine(faction, holdLine) {
        if (holdLine === 'enemy') {
            return faction === 'entente' ? this.centralTrenchX : this.ententeTrenchX;
        }
        if (typeof holdLine === 'string' && holdLine.startsWith('cp')) {
            const idx = parseInt(holdLine.slice(2), 10);
            if (this.capturePoints[idx]) return this.capturePoints[idx].x;
        }
        return faction === 'entente' ? this.ententeTrenchX : this.centralTrenchX;
    }

    _holdLineFromX(faction, x) {
        for (let i = 0; i < this.capturePoints.length; i++) {
            if (Math.abs(this.capturePoints[i].x - x) < 80) return `cp${i}`;
        }
        const enemyX = faction === 'entente' ? this.centralTrenchX : this.ententeTrenchX;
        if (Math.abs(enemyX - x) < 80) return 'enemy';
        return 'main';
    }

    _holdLineFromForwardX(faction) {
        return this._holdLineFromX(faction, this._getForwardGarrisonX(faction));
    }

    _isFrontlineInfantry(type) {
        return type === 'rifleman' || type === 'skirmisher';
    }

    /** Y span a soldier may patrol (full trench, or co-op owner band). */
    _ownerYBand(faction, ownerId) {
        const yMin = 150;
        const ySpan = this.worldHeight - 300;
        if (!this.mpRoster || !this.mpRoster.length) {
            return { yMin, yMax: yMin + ySpan };
        }
        const roster = this._getFactionRoster(faction);
        const n = Math.max(1, roster.length);
        let idx = roster.findIndex(r => r.ownerId === ownerId);
        if (idx < 0) idx = 0;
        const band = ySpan / n;
        const lo = yMin + idx * band + 8;
        const hi = yMin + (idx + 1) * band - 8;
        return { yMin: lo, yMax: Math.max(lo + 50, hi) };
    }

    /** Nearest enemy this garrison should slide toward along the trench. */
    _findTrenchThreat(u) {
        const path = this._getPathForHoldLine(u.faction, u.holdLine || 'main');
        const myLineX = this.getTrenchXAtY(path, u.y);
        let best = null;
        let bestScore = Infinity;
        const gunReach = (u.range || 750) + 150;

        for (let i = 0; i < this.units.length; i++) {
            const e = this.units[i];
            if (!e || e.hp <= 0 || e.faction === u.faction) continue;

            const xDist = Math.abs(e.x - myLineX);
            const dist = Math.hypot(e.x - u.x, e.y - u.y);
            const onOurLine = xDist < 100; // infiltrator / melee in our trench
            const inGunArc = dist < gunReach;
            const chargingIn = e.state === 'charging' && xDist < gunReach + 80;
            if (!onOurLine && !inGunArc && !chargingIn) continue;

            // Prefer closer threats; slight bias to larger |dy| so a bottom threat pulls the line down
            const score = dist - Math.min(80, Math.abs(e.y - u.y) * 0.15);
            if (score < bestScore) {
                bestScore = score;
                best = e;
            }
        }
        return best;
    }

    /** Soft unstick only — used while reacting to a threat, not for idle milling. */
    _trenchSeparationPush(u) {
        const line = u.holdLine || 'main';
        let push = 0;
        for (let i = 0; i < this.units.length; i++) {
            const other = this.units[i];
            if (!other || other === u || other.hp <= 0 || other.faction !== u.faction) continue;
            if (!this._isFrontlineInfantry(other.type) || other.state !== 'garrison') continue;
            if ((other.holdLine || 'main') !== line) continue;
            const dy = u.y - other.y;
            const dist = Math.abs(dy);
            if (dist < 0.5) {
                push += (u.id > other.id ? 1 : -1) * 1.2;
            } else if (dist < 22) {
                push += Math.sign(dy) * (22 - dist) * 0.1;
            }
        }
        return push;
    }

    // HQ infantry always deploy to MAIN trench only (CPs via Over the Top / Reinforcements)
    spawnHQRifleman(faction, ownerId = null) {
        this._spawnHQInfantry(faction, 'rifleman', ownerId);
    }

    spawnHQSkirmisher(faction, ownerId = null) {
        this._spawnHQInfantry(faction, 'skirmisher', ownerId);
    }

    _spawnHQInfantry(faction, type = 'rifleman', ownerId = null) {
        const oid = ownerId || this._getLocalPlayerId();
        const country = this._countryForOwner(oid, faction);
        const startX = faction === 'entente' ? this.ententeSupportTrenchX : this.centralSupportTrenchX;
        // Spawn in owner's Y band when multiplayer roster exists
        let y = 150 + Math.random() * (this.worldHeight - 300);
        if (this.mpRoster && this.mpRoster.length) {
            const roster = this._getFactionRoster(faction);
            const idx = Math.max(0, roster.findIndex(r => r.ownerId === oid));
            const n = roster.length;
            const band = (this.worldHeight - 300) / n;
            y = 150 + idx * band + Math.random() * Math.max(40, band - 20);
        }
        const recruit = this.createSoldier(faction, startX, y, type, 'charging', oid, country);
        recruit.chargeTargetX = this._getXForHoldLine(faction, 'main');
        recruit.chargeHoldLine = 'main';
        recruit.holdLine = 'main';
        recruit.inCover = false;
        this.units.push(recruit);
        console.log(`[SPAWN] ${faction} ${type} owner=${oid} country=${country} → main`);
    }

    // Returns the most forward X position this faction currently holds
    _getForwardGarrisonX(faction) {
        if (faction === 'entente') {
            // Find the rightmost CP owned by entente
            for (let i = this.capturePoints.length - 1; i >= 0; i--) {
                if (this.capturePoints[i].owner === 'entente') return this.capturePoints[i].x;
            }
            return this.ententeTrenchX;
        } else {
            // Find the leftmost CP owned by central
            for (let i = 0; i < this.capturePoints.length; i++) {
                if (this.capturePoints[i].owner === 'central') return this.capturePoints[i].x;
            }
            return this.centralTrenchX;
        }
    }

    // Returns the next target CP for a faction to attack (nearest neutral or enemy CP)
    _getNextCPTarget(faction) {
        if (faction === 'entente') {
            for (let i = 0; i < this.capturePoints.length; i++) {
                if (this.capturePoints[i].owner !== 'entente') return this.capturePoints[i].x;
            }
            return this.centralTrenchX; // all CPs captured, push to enemy frontline
        } else {
            for (let i = this.capturePoints.length - 1; i >= 0; i--) {
                if (this.capturePoints[i].owner !== 'central') return this.capturePoints[i].x;
            }
            return this.ententeTrenchX; // all CPs captured, push to enemy frontline
        }
    }

    // Forward assault chain (rear → tip). Entente advances C1→C2→C3; Central C3→C2→C1.
    _getAssaultChain(faction) {
        if (!this.capturePoints || this.capturePoints.length === 0) {
            return ['main', 'enemy'];
        }
        const cpKeys = this.capturePoints.map((_, i) => `cp${i}`);
        if (faction === 'entente') {
            return ['main', ...cpKeys, 'enemy'];
        }
        return ['main', ...cpKeys.slice().reverse(), 'enemy'];
    }

    _labelForHoldLine(holdLine) {
        if (holdLine === 'main') return 'MAIN TRENCH';
        if (holdLine === 'enemy') return 'ENEMY FRONTLINE';
        if (typeof holdLine === 'string' && holdLine.startsWith('cp')) {
            const idx = parseInt(holdLine.slice(2), 10);
            return (this.capturePoints[idx] && this.capturePoints[idx].label) || holdLine.toUpperCase();
        }
        return String(holdLine).toUpperCase();
    }

    _getGarrisonAtLine(faction, holdLine) {
        return this.units.filter(u =>
            u.faction === faction &&
            this._isFrontlineInfantry(u.type) &&
            u.state === 'garrison' &&
            u.hp > 0 &&
            (u.holdLine || 'main') === holdLine
        );
    }

    // Snapshot garrison pools for every non-enemy line on the assault chain
    _snapshotAssaultGarrisons(faction) {
        const chain = this._getAssaultChain(faction);
        const snapshot = {};
        chain.forEach(line => {
            if (line === 'enemy') return;
            snapshot[line] = this._getGarrisonAtLine(faction, line).slice();
        });
        return snapshot;
    }

    // Leave ~20% behind; return the ~80% that will advance (stable Y sort)
    _pickEightyPercent(units) {
        const sorted = units.slice().sort((a, b) => a.y - b.y);
        const moveCount = Math.floor(sorted.length * 0.8);
        return sorted.slice(0, moveCount);
    }

    _canSendFromLine(faction, holdLine) {
        if (holdLine === 'main') return true;
        if (holdLine === 'enemy') return false;
        if (typeof holdLine === 'string' && holdLine.startsWith('cp')) {
            const idx = parseInt(holdLine.slice(2), 10);
            return this.capturePoints[idx] && this.capturePoints[idx].owner === faction;
        }
        return false;
    }

    _dispatchCharge(units, destHoldLine) {
        units.forEach(u => {
            u.state = 'charging';
            u.inCover = false;
            u.chargeHoldLine = destHoldLine;
            u.chargeTargetX = this._getXForHoldLine(u.faction, destHoldLine);
        });
    }

    // Owned Charlie lines in assault order; if none owned, nearest unowned CP only
    _getReinforceDestinations(faction) {
        const cpChain = this._getAssaultChain(faction).filter(l => typeof l === 'string' && l.startsWith('cp'));
        const owned = cpChain.filter(line => {
            const idx = parseInt(line.slice(2), 10);
            return this.capturePoints[idx] && this.capturePoints[idx].owner === faction;
        });
        if (owned.length > 0) return owned;
        return cpChain.length > 0 ? [cpChain[0]] : [];
    }

    // Split array into n contiguous chunks as evenly as possible
    _splitEvenly(units, n) {
        if (n <= 0) return [];
        const buckets = Array.from({ length: n }, () => []);
        const base = Math.floor(units.length / n);
        let rem = units.length % n;
        let offset = 0;
        for (let i = 0; i < n; i++) {
            const size = base + (rem > 0 ? 1 : 0);
            if (rem > 0) rem--;
            buckets[i] = units.slice(offset, offset + size);
            offset += size;
        }
        return buckets;
    }

    // Update capture point logic each frame
    updateCapturePoints(dt) {
        if (!this.capturePoints || this.capturePoints.length === 0) return;
        const CAPTURE_TIME = 8.0;   // seconds to flip a neutral or contest an owned one
        const CAPTURE_RADIUS = 45;  // px from CP centerline to count as 'in trench'

        this.capturePoints.forEach((cp, idx) => {
            const inRange = this.units.filter(u =>
                u.hp > 0 && this._isFrontlineInfantry(u.type) &&
                Math.abs(u.x - cp.x) < CAPTURE_RADIUS
            );
            const entente = inRange.filter(u => u.faction === 'entente').length;
            const central = inRange.filter(u => u.faction === 'central').length;

            const contested = entente > 0 && central > 0;

            if (!contested) {
                if (entente > 0) cp.progress = Math.min(cp.progress + dt, CAPTURE_TIME);
                else if (central > 0) cp.progress = Math.max(cp.progress - dt, -CAPTURE_TIME);
                // no troops: progress slowly decays back toward 0 (neutral bleeds)
                else if (cp.owner === null) {
                    cp.progress *= 0.98;
                }
            }

            const prevOwner = cp.owner;
            if (cp.progress >= CAPTURE_TIME)      cp.owner = 'entente';
            else if (cp.progress <= -CAPTURE_TIME) cp.owner = 'central';
            else if (Math.abs(cp.progress) < 0.05) cp.owner = null;

            // Fire telegraph when ownership changes
            if (cp.owner !== prevOwner) {
                const label = cp.label;
                const winner = cp.owner === 'entente' ? '🔵 ALLIED' : (cp.owner === 'central' ? '🔴 CENTRAL POWERS' : '⬜ NEUTRAL');
                if (window.UIController) {
                    window.UIController.addTelegraphDispatch(
                        `FIELD DISPATCH: ${label} ${cp.owner ? 'CAPTURED by ' + winner : 'LOST — now NEUTRAL'}!`,
                        true
                    );
                }
                // Guests only see Charlie flips via snapshots — push immediately
                if (window.gameEngineInstance && typeof window.gameEngineInstance.isMpHost === 'function'
                    && window.gameEngineInstance.isMpHost()) {
                    window.gameEngineInstance.broadcastMpSnapshot({ includeBodies: true });
                }
                // Check win condition: all 3 CPs owned by same side
                if (window.gameEngineInstance) {
                    const allEntente = this.capturePoints.every(c => c.owner === 'entente');
                    const allCentral = this.capturePoints.every(c => c.owner === 'central');
                    if (allEntente) {
                        window.gameEngineInstance.adjustMorale(-30);
                        window.UIController?.addTelegraphDispatch('⚡ ALL POSITIONS CAPTURED! Enemy flanked — major morale collapse!', true);
                    } else if (allCentral) {
                        window.gameEngineInstance.adjustMorale(30);
                        window.UIController?.addTelegraphDispatch('⚡ ENEMY CAPTURED ALL POSITIONS! Our lines are flanked!', true);
                    }
                }
            }
        });
    }

    spawnHQSpecialist(faction, type, ownerId = null) {
        const oid = ownerId || this._getLocalPlayerId();
        const country = this._countryForOwner(oid, faction);
        const startX = faction === 'entente' ? this.ententeSupportTrenchX : this.centralSupportTrenchX;
        let y = 150 + Math.random() * (this.worldHeight - 300);
        if (this.mpRoster && this.mpRoster.length) {
            const roster = this._getFactionRoster(faction);
            const idx = Math.max(0, roster.findIndex(r => r.ownerId === oid));
            const n = roster.length;
            const band = (this.worldHeight - 300) / n;
            y = 150 + idx * band + Math.random() * Math.max(40, band - 20);
        }
        const spec = this.createSoldier(faction, startX, y, type, 'reserve', oid, country);
        this.units.push(spec);
    }

    buildSnapshot(opts = {}) {
        const includeBodies = !!opts.includeBodies;
        const snap = {
            t: Date.now(),
            units: this.units.map(u => ({
                id: u.id,
                f: u.faction === 'entente' ? 0 : 1,
                o: u.ownerId,
                c: u.country,
                ty: u.type,
                x: Math.round(u.x),
                y: Math.round(u.y),
                s: u.state,
                hl: u.holdLine,
                ch: u.chargeHoldLine || undefined,
                cx: u.chargeTargetX != null ? Math.round(u.chargeTargetX) : undefined,
                hp: Math.round(u.hp),
                mh: Math.round(u.maxHp),
                a: u.isAiming ? 1 : 0,
                g: u.grenades || 0
            })),
            cps: this.capturePoints.map(c => ({
                o: c.owner,
                p: Math.round((c.progress || 0) * 100) / 100
            })),
            structures: this.structures.map(s => ({
                id: s.id,
                ty: s.type,
                f: s.faction === 'entente' ? 0 : 1,
                x: Math.round(s.x),
                y: Math.round(s.y),
                constructed: !!s.constructed,
                progress: s.progress || 0,
                occupiedBy: s.occupiedBy || null,
                heat: s.heat || 0,
                oh: !!s.isOverheated
            })),
            fx: opts.lightFx ? [] : this.tracers.slice(0, 48).map(t => ({
                sx: Math.round(t.startX),
                sy: Math.round(t.startY),
                tx: Math.round(t.targetX),
                ty: Math.round(t.targetY),
                life: Math.round((t.life || 0.1) * 100) / 100,
                col: t.color
            })),
            ord: opts.lightFx ? [] : this.ordnance.slice(0, 20).map(o => ({
                sx: Math.round(o.startX),
                sy: Math.round(o.startY),
                tx: Math.round(o.targetX),
                ty: Math.round(o.targetY),
                p: Math.round((o.progress || 0) * 100) / 100,
                sp: o.speed,
                tyo: o.type
            }))
        };
        if (includeBodies) {
            snap.bodies = this.deadBodies.slice(0, 40).map(b => ({
                id: b.id,
                x: Math.round(b.x),
                y: Math.round(b.y),
                f: b.faction === 'entente' ? 0 : 1,
                c: b.country,
                a: b.angle,
                d: Math.round(b.deathTimer)
            }));
        }
        return snap;
    }

    applySnapshot(snap) {
        if (!snap || !snap.units) return;
        if (snap.t && this._lastSnapT && snap.t < this._lastSnapT) return; // stale
        this._lastSnapT = snap.t || Date.now();

        const factionOf = (f) => (f === 0 || f === 'entente') ? 'entente' : 'central';
        const byId = new Map(this.units.map(u => [u.id, u]));
        const next = [];
        let heardShot = false;

        for (const u of snap.units) {
            const faction = factionOf(u.f != null ? u.f : u.faction);
            const type = u.ty || u.type;
            const existing = byId.get(u.id);
            const x = u.x;
            const y = u.y;
            const state = u.s || u.state;
            const holdLine = u.hl != null ? u.hl : u.holdLine;
            const chargeHoldLine = u.ch != null ? u.ch : u.chargeHoldLine;
            const chargeTargetX = u.cx != null ? u.cx : u.chargeTargetX;
            const hp = u.hp;
            const maxHp = u.mh != null ? u.mh : (u.maxHp || 100);
            const ownerId = u.o || u.ownerId;
            const country = u.c || u.country;
            const isAiming = !!(u.a != null ? u.a : u.isAiming);
            const grenades = u.g != null ? u.g : (u.grenades || 0);

            if (existing) {
                if (hp < existing.hp - 2 && !this.isGuestLite()) {
                    this.spawnBloodPuff(existing.x, existing.y);
                }
                const dx = x - existing.x;
                const dy = y - existing.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 80) {
                    existing.x = x;
                    existing.y = y;
                    existing.targetX = x;
                    existing.targetY = y;
                } else {
                    existing.targetX = x;
                    existing.targetY = y;
                }
                existing.faction = faction;
                existing.ownerId = ownerId;
                existing.country = country;
                existing.type = type;
                existing.state = state;
                existing.holdLine = holdLine;
                existing.chargeHoldLine = chargeHoldLine || null;
                existing.chargeTargetX = chargeTargetX;
                existing.hp = hp;
                existing.maxHp = maxHp;
                existing.isAiming = isAiming;
                existing.grenades = grenades;
                next.push(existing);
                byId.delete(u.id);
            } else {
                next.push({
                    id: u.id,
                    faction,
                    ownerId,
                    country,
                    type,
                    x, y,
                    targetX: x,
                    targetY: y,
                    state,
                    holdLine,
                    chargeHoldLine: chargeHoldLine || null,
                    chargeTargetX,
                    hp,
                    maxHp,
                    grenades,
                    grenadeCooldown: 0,
                    shootCooldown: 0,
                    aimTimer: 0,
                    isAiming,
                    currentTarget: null,
                    assignedBuildId: null,
                    assignedTargetId: null,
                    reviveTimer: 0,
                    inCover: state === 'garrison' || state === 'reserve',
                    speed: type === 'engineer' ? 2.2 : (type === 'machinegunner' ? 1.6 : (type === 'officer' ? 2.0 : (type === 'medic' ? 2.3 : (type === 'skirmisher' ? 2.2 : 1.9)))),
                    range: type === 'machinegunner' ? 900 : (type === 'skirmisher' ? 320 : (type === 'engineer' || type === 'artilleryman' || type === 'officer' ? 420 : 750))
                });
            }
        }

        // Units that vanished on host → local death puff
        for (const [, gone] of byId) {
            if (gone.hp > 0) this.spawnBloodPuff(gone.x, gone.y);
        }
        this.units = next;

        if (snap.cps && snap.cps.length === this.capturePoints.length) {
            snap.cps.forEach((c, i) => {
                const prev = this.capturePoints[i].owner;
                const nextOwner = c.o === undefined ? c.owner : c.o;
                this.capturePoints[i].owner = nextOwner;
                this.capturePoints[i].progress = c.p != null ? c.p : c.progress;
                if (nextOwner !== prev && window.UIController) {
                    const label = this.capturePoints[i].label;
                    const winner = nextOwner === 'entente' ? '🔵 ALLIED'
                        : (nextOwner === 'central' ? '🔴 CENTRAL POWERS' : '⬜ NEUTRAL');
                    window.UIController.addTelegraphDispatch(
                        `FIELD DISPATCH: ${label} ${nextOwner ? 'CAPTURED by ' + winner : 'LOST — now NEUTRAL'}!`,
                        true
                    );
                }
            });
        } else if (snap.capturePoints && snap.capturePoints.length === this.capturePoints.length) {
            snap.capturePoints.forEach((c, i) => {
                this.capturePoints[i].owner = c.owner;
                this.capturePoints[i].progress = c.progress;
            });
        }

        if (snap.structures) {
            this.structures = snap.structures.map(s => ({
                id: s.id,
                type: s.ty || s.type,
                faction: factionOf(s.f != null ? s.f : s.faction),
                x: s.x,
                y: s.y,
                constructed: !!s.constructed,
                progress: s.progress || 0,
                occupiedBy: s.occupiedBy || null,
                heat: s.heat || 0,
                isOverheated: !!(s.oh != null ? s.oh : s.isOverheated),
                overheatTimer: 0
            }));
        }

        if (snap.bodies) {
            this.deadBodies = snap.bodies.map(b => ({
                id: b.id,
                x: b.x,
                y: b.y,
                faction: factionOf(b.f != null ? b.f : b.faction),
                country: b.c || b.country,
                angle: b.a != null ? b.a : b.angle,
                deathTimer: b.d != null ? b.d : b.deathTimer,
                assignedMedicId: null
            }));
        } else if (snap.deadBodies) {
            this.deadBodies = snap.deadBodies.map(b => ({
                ...b,
                assignedMedicId: null
            }));
        }

        // Gunfight VFX from host unit snaps — APPEND only; never wipe with []
        if (Array.isArray(snap.fx) && snap.fx.length > 0) {
            for (const t of snap.fx) {
                this.tracers.push({
                    startX: t.sx,
                    startY: t.sy,
                    targetX: t.tx,
                    targetY: t.ty,
                    life: t.life != null ? t.life : 0.12,
                    color: t.col || 'rgba(255, 230, 150, 0.9)'
                });
            }
            heardShot = true;
            this._lastFxT = snap.t;
        }

        if (Array.isArray(snap.ord) && snap.ord.length > 0) {
            // Merge in-flight shells; don't clear guest-local grenades with empty host lists
            for (const o of snap.ord) {
                this.ordnance.push({
                    startX: o.sx,
                    startY: o.sy,
                    targetX: o.tx,
                    targetY: o.ty,
                    progress: o.p || 0,
                    speed: o.sp || 1.5,
                    type: o.tyo || o.type || 'he'
                });
            }
        }

        if (heardShot && window.AudioEngine && typeof window.AudioEngine.playGunshot === 'function') {
            // Throttle audio so MG bursts don't explode speakers
            const now = performance.now();
            if (!this._lastGuestShotSfx || now - this._lastGuestShotSfx > 80) {
                window.AudioEngine.playGunshot();
                this._lastGuestShotSfx = now;
            }
        }
    }

    initWeather(type = 'fog') {
        this.weather = {
            type: type,
            fogParticles: [],
            rainParticles: []
        };
        if (this.isGuestLite() || type === 'clear') return;

        if (type === 'fog' || type === 'smog') {
            const baseOpacity = type === 'smog' ? 0.16 : 0.08;
            for (let i = 0; i < 60; i++) {
                this.weather.fogParticles.push({
                    x: Math.random() * this.worldWidth,
                    y: Math.random() * this.worldHeight,
                    radius: 120 + Math.random() * 180,
                    vx: 0.1 + Math.random() * 0.25,
                    opacity: baseOpacity + Math.random() * 0.1
                });
            }
        }
        if (type === 'rain') {
            for (let i = 0; i < 200; i++) {
                this.weather.rainParticles.push({
                    x: Math.random() * this.worldWidth,
                    y: Math.random() * this.worldHeight,
                    length: 14 + Math.random() * 20,
                    vy: 14 + Math.random() * 10,
                    vx: -2 - Math.random() * 2
                });
            }
        }
    }

    setupCameraControls() {
        const c = this.canvas;
        c.addEventListener('mousedown', (e) => {
            if (window.UIController && window.UIController.uiBusy) return;
            if (e.button === 0 && !this.buildMode.active) {
                this.camera.isDragging = true;
                this.camera.dragStartX = e.clientX;
                this.camera.dragStartY = e.clientY;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.camera.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const sx = rect.width > 0 ? this.canvas.width / rect.width : 1;
                const sy = rect.height > 0 ? this.canvas.height / rect.height : 1;
                const dx = ((e.clientX - this.camera.dragStartX) * sx) / this.camera.zoom;
                const dy = ((e.clientY - this.camera.dragStartY) * sy) / this.camera.zoom;
                this.camera.x -= dx;
                this.camera.y -= dy;
                this.camera.dragStartX = e.clientX;
                this.camera.dragStartY = e.clientY;
                this.clampCamera();
            }

            if (this.buildMode.active) {
                const rect = this.canvas.getBoundingClientRect();
                const sx = rect.width > 0 ? this.canvas.width / rect.width : 1;
                const sy = rect.height > 0 ? this.canvas.height / rect.height : 1;
                this.buildMode.mouseX = ((e.clientX - rect.left) * sx) / this.camera.zoom + this.camera.x;
                this.buildMode.mouseY = ((e.clientY - rect.top) * sy) / this.camera.zoom + this.camera.y;
            }
        });

        window.addEventListener('mouseup', () => {
            this.camera.isDragging = false;
        });

        c.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
            this.camera.targetZoom = Math.min(Math.max(0.6, this.camera.targetZoom * zoomFactor), 1.8);
        }, { passive: false });
    }

    clampCamera() {
        const viewW = this.canvas.width / this.camera.zoom;
        const viewH = this.canvas.height / this.camera.zoom;
        this.camera.x = Math.max(0, Math.min(this.worldWidth - viewW, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.worldHeight - viewH, this.camera.y));
    }

    setupBuildModeListeners() {
        this.canvas.addEventListener('click', (e) => {
            if (this.buildMode.active && this.buildMode.structureType) {
                const rect = this.canvas.getBoundingClientRect();
                const worldX = (e.clientX - rect.left) / this.camera.zoom + this.camera.x;
                const worldY = (e.clientY - rect.top) / this.camera.zoom + this.camera.y;

                if (window.gameEngineInstance && window.gameEngineInstance.isMpGuest()) {
                    window.gameEngineInstance.mpClient.sendCmd({
                        orderType: 'place_building',
                        structureType: this.buildMode.structureType,
                        x: Math.round(worldX),
                        y: Math.round(worldY)
                    });
                    if (window.gameEngineInstance.notifyTelegraph) {
                        const buildTimeStr = this.buildMode.structureType === 'artillery_gun' ? '90s' : '60s';
                        const structName = this.buildMode.structureType === 'artillery_gun' ? 'Field Artillery Gun' : 'Machine Gun Nest';
                        window.gameEngineInstance.notifyTelegraph(`ENGINEERING DIRECTIVE: Construction order dispatched for ${structName} (${buildTimeStr}).`);
                    }
                } else {
                    this.constructStructureAt(this.playerFaction, this.buildMode.structureType, worldX, worldY);
                }
                
                this.buildMode.active = false;
                this.canvas.style.cursor = 'crosshair';
            }
        });
    }

    enableBuildMode(structureType) {
        this.buildMode.active = true;
        this.buildMode.structureType = structureType;
        this.canvas.style.cursor = 'cell';
    }

    constructStructureAt(faction, type, x, y) {
        const newStruct = {
            id: Math.random().toString(36).substr(2, 9),
            faction: faction,
            type: type,
            x: x,
            y: y,
            constructed: false,
            progress: 0,
            hp: 350,
            maxHp: 350,
            occupiedBy: null,
            assignedEngineerId: null,
            heat: 0,
            isOverheated: false,
            overheatTimer: 0,
            artilleryCooldown: 0
        };

        const availableEng = this.units.find(u => u.faction === faction && u.type === 'engineer' && u.state === 'reserve' && !u.assignedBuildId);
        if (availableEng) {
            availableEng.state = 'building';
            availableEng.assignedBuildId = newStruct.id;
            availableEng.targetX = x;
            availableEng.targetY = y;
            newStruct.assignedEngineerId = availableEng.id;

            const buildTimeStr = type === 'artillery_gun' ? '90s' : '60s';
            if (window.gameEngineInstance) {
                window.gameEngineInstance.notifyTelegraph(`ENGINEERING DIRECTIVE: Engineer dispatched to construct ${type === 'artillery_gun' ? 'Field Artillery Gun' : 'Machine Gun Nest'} (${buildTimeStr} build time).`);
            }
        } else {
            if (window.gameEngineInstance) window.gameEngineInstance.notifyTelegraph("CONSTRUCTION PENDING: Structure queued. All Engineers currently assigned!", true);
        }

        this.structures.push(newStruct);
    }

    // --- MAIN RENDER & UPDATE LOOP ---
    render(deltaTime = 16) {
        const dtSec = deltaTime / 1000;
        const isGuest = !!this.mpGuestView;
        const lite = this.isGuestLite();

        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.1;
        this.clampCamera();

        if (isGuest) {
            // Authority stays with host — guests never run full sim
            this.combatVisualOnly = true;
            this.updateGuestCosmeticMovement(dtSec);
            if (lite) this._enforceGuestFxCaps();
        } else {
            this.combatVisualOnly = false;
            this.updateFallenBodies(dtSec);
            this.updateMedicBehavior(dtSec);
            this.updateOfficerBehavior(dtSec);
            this.updateSoldierCombat(dtSec);
            this.updateSoldierMovement(dtSec);
            this.updateStructures(dtSec);
            this.updateCapturePoints(dtSec);
            this.updateTanks(dtSec);
        }

        const ctx = this.ctx;
        ctx.save();

        ctx.fillStyle = '#1c1813';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.translate(-this.camera.x, -this.camera.y);

        this.drawGround(ctx);
        this.drawTrenches(ctx);
        this.drawTerrainObstacles(ctx);
        this.drawDeadBodies(ctx);
        this.drawUnits(ctx, deltaTime);
        this.drawTanks(ctx);
        this.drawStructures(ctx);
        this.updateAndDrawTracers(ctx, dtSec);
        this.updateAndDrawOrdnance(ctx, deltaTime);
        this.updateAndDrawParticles(ctx, deltaTime);
        if (!lite) {
            this.updateAndDrawPlanes(ctx, deltaTime);
            this.drawWeather(ctx, deltaTime);
        }
        this.drawBuildPreviewGhost(ctx);
        this.drawCaptureUI(ctx);

        ctx.restore();
        this._guestFrame = (this._guestFrame || 0) + 1;
        if (!lite || (this._guestFrame % 2) === 0) {
            this.drawMinimap();
        }
    }

    /** Hard caps so guest GPUs don't drown in craters/tracers/particles. */
    _enforceGuestFxCaps() {
        if (!this.isGuestLite()) return;
        const trim = (arr, max) => {
            if (arr && arr.length > max) arr.splice(0, arr.length - max);
        };
        trim(this.craters, 18);
        trim(this.tracers, 28);
        trim(this.particles, 24);
        trim(this.deadBodies, 20);
        trim(this.ordnance, 6);
        trim(this.planes, 0);
        if (this.weather && this.weather.fogParticles) this.weather.fogParticles.length = 0;
    }

    // --- FALLEN BODIES & MEDIC REVIVE ENGINE ---
    updateFallenBodies(dt) {
        for (let i = this.deadBodies.length - 1; i >= 0; i--) {
            const body = this.deadBodies[i];
            body.deathTimer -= dt;
            if (body.deathTimer <= 0) {
                this.deadBodies.splice(i, 1);
            }
        }
    }

    updateMedicBehavior(dt) {
        if (window.gameEngineInstance && window.gameEngineInstance.state && window.gameEngineInstance.state.isSupplyCut) {
            return; // Medics cannot heal/revive during Supply Cut blackout!
        }

        const medics = this.units.filter(u => u.type === 'medic' && u.hp > 0);
        if (medics.length === 0) return;

        const halfWayPoint = (this.ententeTrenchX + this.centralTrenchX) / 2;

        medics.forEach(medic => {
            const homeReserveX = medic.faction === 'entente' ? this.ententeSupportTrenchX : this.centralSupportTrenchX;

            if (medic.state === 'reviving' && medic.assignedTargetId) {
                const targetBodyIndex = this.deadBodies.findIndex(b => b.id === medic.assignedTargetId);
                
                if (targetBodyIndex !== -1) {
                    const body = this.deadBodies[targetBodyIndex];
                    const dist = Math.hypot(medic.x - body.x, medic.y - body.y);
                    
                    if (dist < 25) {
                        medic.reviveTimer += dt;
                        if (medic.reviveTimer >= 1.5) {
                            this.deadBodies.splice(targetBodyIndex, 1);
                            const revived = this.createSoldier(
                                medic.faction, body.x, body.y, 'rifleman', 'garrison',
                                medic.ownerId || null,
                                medic.country || body.country || null
                            );
                            revived.hp = 100;
                            this.units.push(revived);

                            medic.state = 'reserve';
                            medic.assignedTargetId = null;
                            medic.reviveTimer = 0;
                            medic.targetX = homeReserveX;
                            medic.targetY = 150 + Math.random() * (this.worldHeight - 300);

                            if (window.gameEngineInstance) {
                                window.gameEngineInstance.notifyTelegraph(`FIELD MEDICAL DISPATCH: Fallen ${medic.faction === 'entente' ? 'Allied' : 'German'} soldier revived!`);
                            }
                        }
                    } else {
                        medic.targetX = body.x;
                        medic.targetY = body.y;
                    }
                } else {
                    medic.state = 'reserve';
                    medic.assignedTargetId = null;
                    medic.reviveTimer = 0;
                    medic.targetX = homeReserveX;
                    medic.targetY = 150 + Math.random() * (this.worldHeight - 300);
                }
            } else if (medic.state === 'reserve') {
                const validBody = this.deadBodies.find(b => {
                    if (b.faction !== medic.faction || b.deathTimer <= 0 || b.assignedMedicId) return false;
                    return medic.faction === 'entente' ? (b.x <= halfWayPoint) : (b.x >= halfWayPoint);
                });

                if (validBody) {
                    validBody.assignedMedicId = medic.id;
                    medic.assignedTargetId = validBody.id;
                    medic.state = 'reviving';
                    medic.reviveTimer = 0;
                    medic.targetX = validBody.x;
                    medic.targetY = validBody.y;
                } else {
                    medic.targetX = homeReserveX;
                }
            }
        });
    }

    // --- OFFICER BEHAVIOR & AID MOVEMENT ---
    updateOfficerBehavior(dt) {
        const officers = this.units.filter(u => u.type === 'officer' && u.hp > 0);
        if (officers.length === 0) return;

        officers.forEach(officer => {
            const activeBuilding = this.structures.find(s => !s.constructed && s.assignedEngineerId);
            const homeTrenchX = officer.faction === 'entente' ? this.ententeTrenchX : this.centralTrenchX;

            if (activeBuilding) {
                officer.targetX = activeBuilding.x - 30;
                officer.targetY = activeBuilding.y;
                officer.state = 'aiding';
            } else {
                officer.targetX = homeTrenchX;
                if (Math.abs(officer.y - officer.targetY) < 10) {
                    officer.targetY = 200 + Math.random() * (this.worldHeight - 400);
                }
                officer.state = 'aiding';
            }
        });
    }

    updateStructures(dt) {
        this.structures.forEach(s => {
            if (s.isOverheated) {
                s.overheatTimer -= dt;
                if (s.overheatTimer <= 0) {
                    s.isOverheated = false;
                    s.heat = 0;
                    if (window.gameEngineInstance) {
                        window.gameEngineInstance.notifyTelegraph("MACHINE GUN DISPATCH: Nest barrel cooled. Machine Gun operational!");
                    }
                }
            } else if (s.heat > 0) {
                s.heat = Math.max(0, s.heat - dt * 12);
            }

            if (!s.constructed && !s.assignedEngineerId) {
                const freeEng = this.units.find(u => u.faction === s.faction && u.type === 'engineer' && u.state === 'reserve' && !u.assignedBuildId);
                if (freeEng) {
                    freeEng.state = 'building';
                    freeEng.assignedBuildId = s.id;
                    freeEng.targetX = s.x;
                    freeEng.targetY = s.y;
                    s.assignedEngineerId = freeEng.id;
                }
            }

            if (!s.constructed) {
                const builder = this.units.find(u => u.id === s.assignedEngineerId && u.hp > 0);
                if (builder) {
                    if (Math.hypot(builder.x - s.x, builder.y - s.y) < 35) {
                        const totalBuildTime = s.type === 'artillery_gun' ? 90 : 60;
                        const isOfficerAiding = this.units.some(u => u.faction === s.faction && u.type === 'officer' && Math.hypot(u.x - s.x, u.y - s.y) < 100);
                        
                        const buildMultiplier = isOfficerAiding ? 1.5 : 1.0;
                        s.progress += (dt * buildMultiplier) / totalBuildTime;
                        
                        if (s.progress >= 1.0) {
                            s.constructed = true;
                            s.progress = 1.0;
                            
                            builder.state = 'reserve';
                            builder.assignedBuildId = null;
                            builder.targetX = builder.faction === 'entente' ? this.ententeSupportTrenchX : this.centralSupportTrenchX;
                            builder.targetY = 150 + Math.random() * (this.worldHeight - 300);

                            if (window.gameEngineInstance) {
                                window.gameEngineInstance.awardXP(50);
                                window.gameEngineInstance.notifyTelegraph(`CONSTRUCTION COMPLETE: ${s.type === 'artillery_gun' ? 'Field Artillery Gun' : 'Machine Gun Nest'} constructed! (+50 XP)`);
                            }

                            if (s.type === 'mg_nest') {
                                const gunner = this.units.find(u => u.faction === s.faction && u.type === 'machinegunner' && u.state === 'reserve');
                                if (gunner) {
                                    gunner.state = 'manning_mg';
                                    gunner.targetX = s.x;
                                    gunner.targetY = s.y;
                                    s.occupiedBy = gunner.id;
                                }
                            } else if (s.type === 'artillery_gun') {
                                const artMan = this.units.find(u => u.faction === s.faction && u.type === 'artilleryman' && u.state === 'reserve');
                                if (artMan) {
                                    artMan.state = 'manning_artillery';
                                    artMan.targetX = s.x;
                                    artMan.targetY = s.y;
                                    s.occupiedBy = artMan.id;
                                }
                            }
                        }
                    }
                } else {
                    s.assignedEngineerId = null;
                }
            } else if (s.constructed) {
                if (s.type === 'mg_nest') {
                    const gunner = this.units.find(u => u.id === s.occupiedBy && u.hp > 0);
                    if (gunner) {
                        gunner.x = s.x;
                        gunner.y = s.y;
                        gunner.range = 950;
                    } else {
                        s.occupiedBy = null;
                        const newGunner = this.units.find(u => u.faction === s.faction && u.type === 'machinegunner' && u.state === 'reserve');
                        if (newGunner) {
                            newGunner.state = 'manning_mg';
                            newGunner.targetX = s.x;
                            newGunner.targetY = s.y;
                            s.occupiedBy = newGunner.id;
                        }
                    }
                } else if (s.type === 'artillery_gun') {
                    const artMan = this.units.find(u => u.id === s.occupiedBy && u.hp > 0);
                    if (artMan) {
                        artMan.x = s.x;
                        artMan.y = s.y;
                        
                        s.artilleryCooldown = (s.artilleryCooldown || 0) - dt;
                        if (s.artilleryCooldown <= 0) {
                            s.artilleryCooldown = 20.0;
                            this.fireArtilleryGunShell(s);
                        }
                    } else {
                        s.occupiedBy = null;
                        const newArtMan = this.units.find(u => u.faction === s.faction && u.type === 'artilleryman' && u.state === 'reserve');
                        if (newArtMan) {
                            newArtMan.state = 'manning_artillery';
                            newArtMan.targetX = s.x;
                            newArtMan.targetY = s.y;
                            s.occupiedBy = newArtMan.id;
                        }
                    }
                }
            }
        });
    }

    fireArtilleryGunShell(structure) {
        const isOfficerAiding = this.units.some(u => u.faction === structure.faction && u.type === 'officer' && Math.hypot(u.x - structure.x, u.y - structure.y) < 100);
        const scatterRadius = isOfficerAiding ? 20 : 80;

        const targetX = structure.faction === 'entente' ? (this.centralTrenchX + Math.random() * scatterRadius - (scatterRadius / 2)) : (this.ententeTrenchX + Math.random() * scatterRadius - (scatterRadius / 2));
        const targetY = 150 + Math.random() * (this.worldHeight - 300);

        this.fireArtillery(targetX, targetY, 'he');

        if (window.gameEngineInstance) {
            const aidStr = isOfficerAiding ? " (OFFICER AIDING: 90% High Precision Hit!)" : " (70% Accuracy)";
            window.gameEngineInstance.notifyTelegraph(`BATTERY DISPATCH: Field Artillery Gun shell launched at enemy trench${aidStr}!`, true);
        }
    }

    // --- COMBAT ENGINE ---
    updateSoldierCombat(dt) {
        for (let i = 0; i < this.units.length; i++) {
            const u = this.units[i];
            const unlocks = this._getUnlocksForOwner(u.ownerId);
            
            if (u.faction === 'entente') {
                u.inCover = (Math.abs(u.x - this.ententeTrenchX) < 25) || (Math.abs(u.x - this.ententeSupportTrenchX) < 25)
                    || this.capturePoints.some(cp => Math.abs(u.x - cp.x) < 30);
            } else {
                u.inCover = (Math.abs(u.x - this.centralTrenchX) < 25) || (Math.abs(u.x - this.centralSupportTrenchX) < 25)
                    || this.capturePoints.some(cp => Math.abs(u.x - cp.x) < 30);
            }

            if (this._isFrontlineInfantry(u.type)) {
                const meleeVictim = this.units.find(e => e.faction !== u.faction && e.hp > 0 && Math.hypot(e.x - u.x, e.y - u.y) < 30);
                if (meleeVictim) {
                    u.bayonetThrustTimer = 0.6;
                    this.spawnBloodPuff(meleeVictim.x, meleeVictim.y);
                    if (!this.combatVisualOnly) {
                        meleeVictim.hp -= 60; // Lethal bayonet thrust!
                        if (meleeVictim.hp <= 0) this.killSoldier(meleeVictim);
                    }
                    continue;
                }
            }

            if (u.state === 'manning_mg') {
                const nest = this.structures.find(s => s.occupiedBy === u.id);
                if (nest) {
                    if (nest.isOverheated) continue;

                    const chargingEnemies = this.units.filter(e => e.faction !== u.faction && e.hp > 0 && e.state === 'charging');
                    
                    if (chargingEnemies.length > 0) {
                        u.shootCooldown -= dt;
                        if (u.shootCooldown <= 0) {
                            u.shootCooldown = unlocks.mgTier3 ? 1.1 : 1.4;
                            this.executeMGBlindFireBurst(u, nest);
                        }
                    }
                }
                continue;
            }

            if (u.state === 'manning_artillery' || u.state === 'reviving') continue;

            if (u.isAiming) {
                u.aimTimer -= dt;
                if (u.aimTimer <= 0) {
                    u.isAiming = false;
                    this.fireRifleOrPistolShot(u);
                }
                continue;
            }

            // Skirmisher grenades (up to 3) — throw at nearby enemy clusters before shotgun
            if (u.type === 'skirmisher' && (u.grenades || 0) > 0) {
                u.grenadeCooldown = (u.grenadeCooldown || 0) - dt;
                if (u.grenadeCooldown <= 0) {
                    const throwRangeMin = 50;
                    const throwRangeMax = 160;
                    let best = null;
                    let bestCount = 0;
                    for (let j = 0; j < this.units.length; j++) {
                        const enemy = this.units[j];
                        if (enemy.faction === u.faction || enemy.hp <= 0) continue;
                        const dist = Math.hypot(enemy.x - u.x, enemy.y - u.y);
                        if (dist < throwRangeMin || dist > throwRangeMax) continue;
                        const nearby = this.units.filter(e =>
                            e.faction !== u.faction && e.hp > 0 &&
                            Math.hypot(e.x - enemy.x, e.y - enemy.y) < 55
                        ).length;
                        if (nearby > bestCount) {
                            bestCount = nearby;
                            best = enemy;
                        }
                    }
                    if (best) {
                        this.throwGrenade(u, best.x, best.y);
                        u.grenades -= 1;
                        u.grenadeCooldown = 5.0 + Math.random() * 2;
                        console.log(`[SKIRMISHER] ${u.faction} threw grenade (${u.grenades} left)`);
                        continue;
                    }
                }
            }

            u.shootCooldown -= dt;

            if (u.shootCooldown <= 0) {
                let closestEnemy = null;
                let minDist = u.range;

                for (let j = 0; j < this.units.length; j++) {
                    const enemy = this.units[j];
                    if (enemy.faction !== u.faction && enemy.hp > 0) {
                        const dist = Math.hypot(enemy.x - u.x, enemy.y - u.y);
                        if (dist < minDist) {
                            minDist = dist;
                            closestEnemy = enemy;
                        }
                    }
                }

                if (closestEnemy) {
                    u.isAiming = true;
                    u.aimTimer = u.type === 'skirmisher' ? 0.35 : 0.5;
                    u.currentTarget = closestEnemy;
                    if (u.type === 'skirmisher') {
                        u.shootCooldown = 1.8 + Math.random() * 0.6;
                    } else if (u.type === 'engineer' || u.type === 'machinegunner' || u.type === 'artilleryman' || u.type === 'officer') {
                        u.shootCooldown = 2.2;
                    } else {
                        u.shootCooldown = 2.5 + Math.random() * 1.5;
                    }
                }
            }
        }
    }

    throwGrenade(thrower, targetX, targetY) {
        this.ordnance.push({
            startX: thrower.x,
            startY: thrower.y,
            targetX: targetX + (Math.random() * 20 - 10),
            targetY: targetY + (Math.random() * 20 - 10),
            progress: 0,
            speed: 1.8,
            type: 'grenade'
        });
        if (window.AudioEngine && typeof window.AudioEngine.playArtilleryRumble === 'function') {
            // soft cue — reuse rumble at low volume via existing synth if available
            window.AudioEngine.playArtilleryRumble();
        }
    }

    executeMGBlindFireBurst(u, nest) {
        const unlocks = this._getUnlocksForOwner(u.ownerId);
        const burstCount = 8;
        const dir = u.faction === 'entente' ? 1 : -1;

        if (nest) {
            const noHeatRoll = unlocks.mgTier1 && Math.random() < 0.10;
            if (!noHeatRoll) {
                nest.heat += 25;
                if (nest.heat >= 100) {
                    nest.isOverheated = true;
                    nest.overheatTimer = 10.0;
                    if (window.gameEngineInstance) {
                        window.gameEngineInstance.notifyTelegraph("OVERHEAT ALERT: Machine Gun Nest overheated! Cooling down for 10 seconds.", true);
                    }
                }
            }
        }

        for (let b = 0; b < burstCount; b++) {
            setTimeout(() => {
                if (u.hp <= 0) return;

                const spreadY = u.y + (Math.random() * 240 - 120);
                const targetX = u.x + (dir * (350 + Math.random() * 300));
                const targetY = spreadY;

                const enemiesInSector = this.units.filter(e => e.faction !== u.faction && e.hp > 0 && e.state === 'charging' && Math.hypot(e.x - targetX, e.y - targetY) < 130);
                let isHit = false;
                let victim = null;

                const hitThreshold = unlocks.mgTier2 ? 0.52 : 0.42;

                if (enemiesInSector.length > 0 && Math.random() < hitThreshold) {
                    isHit = true;
                    victim = enemiesInSector[Math.floor(Math.random() * enemiesInSector.length)];
                }

                this._pushTracer({
                    startX: u.x,
                    startY: u.y + 2,
                    targetX: isHit && victim ? victim.x : targetX,
                    targetY: isHit && victim ? victim.y : targetY,
                    life: 0.1,
                    color: u.faction === 'entente' ? 'rgba(255, 220, 100, 0.95)' : 'rgba(255, 170, 90, 0.95)'
                }, { hit: isHit && !!victim });

                if (window.AudioEngine && typeof window.AudioEngine.playGunshot === 'function') window.AudioEngine.playGunshot();

                if (isHit && victim) {
                    this.spawnBloodPuff(victim.x, victim.y);
                    if (!this.combatVisualOnly) {
                        const dmg = 25; // MG hit = 25% max health!
                        victim.hp -= dmg;
                        if (victim.hp <= 0) this.killSoldier(victim);
                    }
                }
            }, b * 70);
        }
    }

    fireRifleOrPistolShot(u) {
        const enemy = u.currentTarget;
        if (!enemy || enemy.hp <= 0) return;

        const unlocks = this._getUnlocksForOwner(u.ownerId);

        let hitChance = u.inCover ? 0.45 : 0.28;
        if (enemy.inCover) hitChance *= 0.45;
        if (u.type === 'skirmisher') hitChance = u.inCover ? 0.55 : 0.40;
        else if (u.type !== 'rifleman' && u.type !== 'medic') hitChance *= 0.85;

        // Officer aura: only officers with the SAME ownerId buff that owner's troops
        const isOfficerAidingFront = this._isFrontlineInfantry(u.type) && this.units.some(off =>
            off.ownerId === u.ownerId &&
            off.type === 'officer' &&
            off.hp > 0 &&
            Math.hypot(off.x - u.x, off.y - u.y) < 140
        );
        const isOneShotKill = !this.combatVisualOnly && isOfficerAidingFront && Math.random() < 0.10;

        const isHit = Math.random() < hitChance || isOneShotKill;

        this._pushTracer({
            startX: u.x,
            startY: u.y + 2,
            targetX: enemy.x + (isHit ? 0 : (Math.random() * 30 - 15)),
            targetY: enemy.y + (isHit ? 0 : (Math.random() * 30 - 15)),
            life: 0.12,
            color: u.type === 'skirmisher'
                ? 'rgba(255, 200, 80, 0.95)'
                : (u.faction === 'entente' ? 'rgba(255, 230, 150, 0.9)' : 'rgba(255, 180, 120, 0.9)')
        }, { hit: isHit });

        if (window.AudioEngine && typeof window.AudioEngine.playGunshot === 'function') window.AudioEngine.playGunshot();

        if (isHit) {
            this.spawnBloodPuff(enemy.x, enemy.y);
            if (!this.combatVisualOnly) {
                let damage;
                if (u.type === 'skirmisher') {
                    damage = 60; // Heavy shot
                } else if (u.type === 'rifleman' || u.type === 'medic') {
                    damage = 50; // Rifle shot = 50% max health (half a person's damage!)
                } else {
                    damage = 12.5; // Pistol shot = 10-15% max health!
                }
                if (unlocks.rifleTier2 && u.type === 'rifleman') damage = 55;
                if (isOneShotKill) damage = 999;
                enemy.hp -= damage;
                if (enemy.hp <= 0) this.killSoldier(enemy);
            }
        }
    }

    killSoldier(soldier) {
        this.deadBodies.push({
            id: Math.random().toString(36).substr(2, 9),
            x: soldier.x,
            y: soldier.y,
            faction: soldier.faction,
            country: soldier.country || this._countryForOwner(soldier.ownerId, soldier.faction),
            angle: Math.random() * Math.PI * 2,
            deathTimer: 60.0,
            assignedMedicId: null
        });

        if (window.gameEngineInstance) {
            if (soldier.faction === this.playerFaction) {
                window.gameEngineInstance.adjustMorale(-0.6);
            } else {
                window.gameEngineInstance.onEnemyKilled();
            }
        }
    }

    /**
     * Push a tracer locally and (on host) queue a tiny MP shot packet for guests.
     */
    _pushTracer(t, opts = {}) {
        this.tracers.push(t);
        if (this.mpGuestView) return;
        const eng = window.gameEngineInstance;
        if (!eng || typeof eng.isMpHost !== 'function' || !eng.isMpHost()) return;
        if (!this._mpFxQueue) this._mpFxQueue = [];
        this._mpFxQueue.push({
            sx: Math.round(t.startX),
            sy: Math.round(t.startY),
            tx: Math.round(t.targetX),
            ty: Math.round(t.targetY),
            c: t.color,
            life: Math.round((t.life || 0.12) * 100) / 100,
            hit: opts.hit ? 1 : 0
        });
        if (this._mpFxQueue.length > 80) {
            this._mpFxQueue.splice(0, this._mpFxQueue.length - 80);
        }
    }

    drainMpFxQueue() {
        if (!this._mpFxQueue || this._mpFxQueue.length === 0) return null;
        return this._mpFxQueue.splice(0, 48);
    }

    /** Guest: append tiny host shot packets (never replace local tracers). */
    applyFxBurst(shots) {
        if (!Array.isArray(shots) || shots.length === 0) return;
        for (const t of shots) {
            this.tracers.push({
                startX: t.sx,
                startY: t.sy,
                targetX: t.tx,
                targetY: t.ty,
                life: t.life != null ? t.life : 0.12,
                color: t.c || 'rgba(255, 230, 150, 0.9)'
            });
            if (t.hit) this.spawnBloodPuff(t.tx, t.ty);
        }
        if (window.AudioEngine && typeof window.AudioEngine.playGunshot === 'function') {
            window.AudioEngine.playGunshot();
            if (shots.length > 4) window.AudioEngine.playGunshot();
        }
        this._enforceGuestFxCaps();
    }

    /**
     * Guest-only: continuous 60 FPS lerp interpolation towards latest target coordinates
     * received from host snapshots. Eliminates stutter and position popping.
     */
    updateGuestCosmeticMovement(dt) {
        const lerpRate = Math.min(1.0, dt * 24.0);
        this.units.forEach(u => {
            if (!u || u.hp <= 0) return;

            if (u.targetX !== undefined && u.targetY !== undefined) {
                const dx = u.targetX - u.x;
                const dy = u.targetY - u.y;
                const dist = Math.hypot(dx, dy);

                if (dist > 80) {
                    u.x = u.targetX;
                    u.y = u.targetY;
                } else if (dist > 0.05) {
                    u.x += dx * lerpRate;
                    u.y += dy * lerpRate;
                }
            }

            if (u.state === 'garrison' || u.state === 'reserve') {
                u.inCover = true;
            } else {
                u.inCover = false;
            }
        });
    }

    updateSoldierMovement(dt) {
        this.units = this.units.filter(u => u.hp > 0);

        this.units.forEach(u => {
            if (u.isAiming) return;

            if (u.type === 'machinegunner' || u.type === 'engineer' || u.type === 'artilleryman' || u.type === 'officer' || u.type === 'medic') {
                if (u.state === 'building' || u.state === 'manning_mg' || u.state === 'manning_artillery' || u.state === 'reserve' || u.state === 'aiding' || u.state === 'reviving') {
                    const dx = u.targetX - u.x;
                    const dy = u.targetY - u.y;
                    if (Math.hypot(dx, dy) > 5) {
                        u.x += Math.sign(dx) * (u.speed * 1.2);
                        u.y += Math.sign(dy) * (u.speed * 1.2);
                    }
                }
                return;
            }

            if (u.state === 'charging') {
                // Advance to assigned hold line (CP / enemy trench)
                const targetX = u.chargeTargetX !== undefined
                    ? u.chargeTargetX
                    : this._getXForHoldLine(u.faction, u.chargeHoldLine || 'enemy');
                const dx = targetX - u.x;
                if (Math.abs(dx) > 8) {
                    u.x += Math.sign(dx) * (u.speed * 1.25);
                    u.y += (Math.random() - 0.5) * 0.3;
                    u.inCover = false;
                } else {
                    // Arrived — garrison this line so later orders can count them here
                    const line = u.chargeHoldLine || this._holdLineFromX(u.faction, targetX);
                    u.holdLine = line;
                    u.state = 'garrison';
                    u.inCover = true;
                    u.chargeHoldLine = null;
                    u.chargeTargetX = undefined;
                    const path = this._getPathForHoldLine(u.faction, line);
                    u.x = this.getTrenchXAtY(path, u.y);
                    if (window.gameEngineInstance && u.faction === this.playerFaction) {
                        window.gameEngineInstance.adjustMorale(2);
                    }
                }
            } else if (u.state === 'retreating') {
                const line = u.holdLine || 'main';
                const path = this._getPathForHoldLine(u.faction, line);
                const homeX = this.getTrenchXAtY(path, u.y);
                const dx = homeX - u.x;
                if (Math.abs(dx) > 10) {
                    u.x += Math.sign(dx) * (u.speed * 1.35);
                } else {
                    u.x = homeX;
                    u.state = 'garrison';
                    u.inCover = true;
                }
            } else if (u.state === 'garrison' && this._isFrontlineInfantry(u.type)) {
                this._updateGarrisonTrenchReact(u, dt);
            } else if (u.state === 'garrison') {
                const path = this._getPathForHoldLine(u.faction, u.holdLine || 'main');
                const targetX = this.getTrenchXAtY(path, u.y);
                u.x += (targetX - u.x) * 0.05;
            }
        });
    }

    /**
     * Hold position unless a threat exists — then slide along the trench toward that enemy's Y.
     * Example: enemy at the bottom of the line → garrison shifts down to engage. No idle pacing.
     */
    _updateGarrisonTrenchReact(u, dt) {
        const path = this._getPathForHoldLine(u.faction, u.holdLine || 'main');
        const band = this._ownerYBand(u.faction, u.ownerId);
        const threat = this._findTrenchThreat(u);

        if (threat) {
            const dy = threat.y - u.y;
            if (Math.abs(dy) > 8) {
                const step = Math.min(Math.abs(dy), u.speed * 0.95);
                u.y += Math.sign(dy) * step;
            }
            u.y += this._trenchSeparationPush(u) * 0.45;
        }

        u.y = Math.max(band.yMin, Math.min(band.yMax, u.y));
        const targetX = this.getTrenchXAtY(path, u.y);
        u.x += (targetX - u.x) * 0.15;
        u.inCover = true;
    }

    _getTeamTitle(faction) {
        if (faction === 'entente') {
            return this.playerCountry === 'soviet' ? 'RED ARMY' : 'ALLIED FORCES';
        }
        return 'GERMAN ARMED FORCES';
    }

    orderCharge(faction) {
        const chain = this._getAssaultChain(faction);
        const snapshot = this._snapshotAssaultGarrisons(faction);

        let totalSent = 0;
        const hopSummaries = [];

        for (let i = 0; i < chain.length - 1; i++) {
            const from = chain[i];
            const to = chain[i + 1];
            if (!this._canSendFromLine(faction, from)) continue;

            const pool = snapshot[from] || [];
            const movers = this._pickEightyPercent(pool);
            if (movers.length === 0) continue;

            this._dispatchCharge(movers, to);
            totalSent += movers.length;
            hopSummaries.push(`${this._labelForHoldLine(from)}→${this._labelForHoldLine(to)} (${movers.length})`);
            console.log(`[CHARGE] ${faction} hop ${from}→${to}: sent ${movers.length}/${pool.length} (20% hold)`);
        }

        if (totalSent === 0) {
            console.log(`[CHARGE] ${faction}: no troops available to advance`);
            return;
        }

        if (window.AudioEngine && typeof window.AudioEngine.playWhistle === 'function') {
            window.AudioEngine.playWhistle();
        }

        const teamName = this._getTeamTitle(faction);
        const tip = hopSummaries[hopSummaries.length - 1] || 'FORWARD';
        if (window.UIController) {
            window.UIController.triggerCustomBanner(
                `${teamName} IS CHARGING!`,
                `Over the Top cascade: ${hopSummaries.join(' · ')}`
            );
            window.UIController.addTelegraphDispatch(
                `TACTICAL ALERT: ${teamName} OVER THE TOP — ${totalSent} men cascading (${tip})`,
                true
            );
        }
    }

    orderReinforce(faction) {
        const mainPool = this._getGarrisonAtLine(faction, 'main');
        const movers = this._pickEightyPercent(mainPool);
        const destinations = this._getReinforceDestinations(faction);

        if (movers.length === 0 || destinations.length === 0) {
            console.log(`[REINFORCE] ${faction}: no main-trench troops or destinations`);
            return { sent: 0, destinations: [] };
        }

        const buckets = this._splitEvenly(movers, destinations.length);
        const summaries = [];

        destinations.forEach((dest, i) => {
            const group = buckets[i] || [];
            if (group.length === 0) return;
            this._dispatchCharge(group, dest);
            const label = this._labelForHoldLine(dest);
            summaries.push(`${label}: ${group.length}`);
            console.log(`[REINFORCE] ${faction} → ${dest}: ${group.length} men`);
        });

        if (window.AudioEngine && typeof window.AudioEngine.playWhistle === 'function') {
            window.AudioEngine.playWhistle();
        }

        const teamName = this._getTeamTitle(faction);
        const pctLabel = destinations.length === 1 ? '100%' : (destinations.length === 2 ? '50%/50%' : '~33% each');
        if (window.UIController) {
            window.UIController.triggerCustomBanner(
                `${teamName} REINFORCEMENTS!`,
                `20% hold main · 80% split ${pctLabel} → ${summaries.join(' · ')}`
            );
            window.UIController.addTelegraphDispatch(
                `COMMAND DIRECTIVE: Reinforcements — ${movers.length} men from main redistributed (${pctLabel}).`,
                true
            );
        }

        return { sent: movers.length, destinations: summaries };
    }

    orderWithdrawal(faction) {
        let retreatCount = 0;
        this.units.forEach(u => {
            if (u.faction !== faction || !this._isFrontlineInfantry(u.type) || u.hp <= 0) return;
            if (u.state !== 'charging') return;

            u.state = 'retreating';
            u.holdLine = 'main';
            u.chargeHoldLine = null;
            u.chargeTargetX = undefined;
            u.inCover = false;
            retreatCount++;
        });
        return retreatCount;
    }

    spawnBloodPuff(x, y) {
        const n = this.isGuestLite() ? 2 : 6;
        for (let i = 0; i < n; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 2 + Math.random() * 3,
                color: 'rgba(160, 20, 20, ',
                opacity: 0.9,
                decay: this.isGuestLite() ? 0.08 : 0.04
            });
        }
        if (this.isGuestLite()) this._enforceGuestFxCaps();
    }

    drawGround(ctx) {
        // Base dark dirt
        ctx.fillStyle = '#241e17';
        ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);

        // No Man's Land darker band (between the two frontlines)
        ctx.fillStyle = '#1a1510';
        ctx.fillRect(this.ententeTrenchX + 20, 0, this.centralTrenchX - this.ententeTrenchX - 40, this.worldHeight);

        // Shell-scarred texture — skip on guests (36 ellipses/frame is costly)
        if (this.isGuestLite()) return;
        ctx.fillStyle = 'rgba(12, 9, 6, 0.4)';
        for (let i = 0; i < 36; i++) {
            ctx.beginPath();
            ctx.ellipse(
                this.ententeTrenchX + 100 + (i % 9) * 340,
                200 + Math.floor(i / 9) * 350,
                120, 75, (i * 0.4), 0, Math.PI * 2
            );
            ctx.fill();
        }
    }

    /** Guest: thick lines only — no sandbag fillRect spam. */
    _drawTrenchesLite(ctx) {
        const strokePath = (pts, color, width) => {
            if (!pts || pts.length < 2) return;
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineJoin = 'miter';
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();
        };
        const straight = (x, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x - 10, 0, 20, this.worldHeight);
        };
        straight(this.ententeSupportTrenchX, '#0f0c09');
        straight(this.centralSupportTrenchX, '#0f0c09');
        strokePath(this.ententeFrontPath, '#0d0a07', 18);
        strokePath(this.ententeFrontPath, '#3a2d1f', 12);
        strokePath(this.centralFrontPath, '#0d0a07', 18);
        strokePath(this.centralFrontPath, '#3a2d1f', 12);
        this.capturePoints.forEach(cp => {
            if (!cp.path) return;
            const col = cp.owner === 'entente' ? '#1e3a8a' : cp.owner === 'central' ? '#7f1d1d' : '#2a2a2a';
            strokePath(cp.path, col, 14);
        });
    }

    drawTrenches(ctx) {
        if (this.isGuestLite()) {
            this._drawTrenchesLite(ctx);
            return;
        }
        // --- Straight reserve/support trench ---
        const drawStraightTrench = (x, label, isPlayer) => {
            ctx.fillStyle = '#0f0c09';
            ctx.fillRect(x - 12, 0, 24, this.worldHeight);
            ctx.fillStyle = '#3a2d1f';
            for (let y = 0; y < this.worldHeight; y += 14) {
                ctx.fillRect(x - 8, y, 16, 10);
            }
            ctx.fillStyle = isPlayer ? '#5c4a2e' : '#453c30';
            for (let y = 0; y < this.worldHeight; y += 20) {
                ctx.fillRect(x - 18, y, 8, 14);
                ctx.fillRect(x + 10, y + 10, 8, 14);
            }
            ctx.save();
            ctx.font = '11px "Special Elite", monospace';
            ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
            ctx.translate(x - 24, 180);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(label, 0, 0);
            ctx.restore();
        };

        // --- Zigzag frontline trench using pre-built path ---
        const drawZigzagTrench = (pts, baseX, label, isPlayer, facingRight) => {
            if (!pts || pts.length < 2) return;

            const trenchW    = 20;
            const sandbagCol = isPlayer ? '#705b41' : '#5c4a2e';
            const darkBag    = isPlayer ? '#4a3b28' : '#3a3228';

            ctx.save();
            ctx.lineJoin = 'miter';
            ctx.lineCap  = 'square';

            // 1. Black trench floor
            ctx.strokeStyle = '#0d0a07';
            ctx.lineWidth   = trenchW;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();

            // 2. Dirt fill (slightly narrower)
            ctx.strokeStyle = '#3a2d1f';
            ctx.lineWidth   = trenchW - 7;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();

            // 3. Sandbag blocks — only on vertical (bay) segments
            for (let i = 0; i < pts.length - 1; i++) {
                const ax = pts[i].x,   ay = pts[i].y;
                const bx = pts[i+1].x, by = pts[i+1].y;
                const isVertical = Math.abs(bx - ax) < 2;  // skip horizontal traverses
                if (!isVertical) continue;
                const len = Math.abs(by - ay);
                const steps = Math.floor(len / 14);
                for (let s = 0; s <= steps; s++) {
                    const my = ay + (by - ay) * (s / steps);
                    ctx.fillStyle = s % 2 === 0 ? sandbagCol : darkBag;
                    ctx.fillRect(ax - trenchW / 2 - 7, my - 4, 9, 10);
                    ctx.fillRect(ax + trenchW / 2 - 2, my - 4, 9, 10);
                }
            }

            ctx.restore();

            // 4. Label
            ctx.save();
            ctx.font = '11px "Special Elite", monospace';
            ctx.fillStyle = 'rgba(212, 175, 55, 0.5)';
            ctx.translate(baseX + (facingRight ? 32 : -44), 180);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(label, 0, 0);
            ctx.restore();
        };

        // Reserve trenches: straight
        drawStraightTrench(
            this.ententeSupportTrenchX,
            'ALLIED - RESERVE TRENCH',
            this.playerFaction === 'entente'
        );
        drawStraightTrench(
            this.centralSupportTrenchX,
            'CENTRAL POWERS - RESERVE TRENCH',
            this.playerFaction === 'central'
        );

        // Frontline trenches: zigzag traverse
        drawZigzagTrench(
            this.ententeFrontPath,
            this.ententeTrenchX,
            'ALLIED - FRONTLINE TRENCH',
            this.playerFaction === 'entente',
            true
        );
        drawZigzagTrench(
            this.centralFrontPath,
            this.centralTrenchX,
            'CENTRAL POWERS - FRONTLINE TRENCH',
            this.playerFaction === 'central',
            false
        );

        if (window.gameEngineInstance && window.gameEngineInstance.state && window.gameEngineInstance.state.isTrenchFlooded) {
            ctx.save();
            ctx.strokeStyle = 'rgba(55, 90, 110, 0.55)';
            ctx.lineWidth = 22;
            [this.ententeFrontPath, this.centralFrontPath].forEach(pts => {
                if (!pts || pts.length < 2) return;
                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                ctx.stroke();
            });
            ctx.fillStyle = 'rgba(55, 90, 110, 0.4)';
            ctx.fillRect(this.ententeSupportTrenchX - 12, 0, 24, this.worldHeight);
            ctx.fillRect(this.centralSupportTrenchX - 12, 0, 24, this.worldHeight);
            ctx.restore();
        }

        // Capture Point trenches — faction-tinted zigzag
        this.capturePoints.forEach(cp => {
            const floorColor = cp.owner === 'entente' ? '#0a1a3a' : cp.owner === 'central' ? '#3a0a0a' : '#1a1a1a';
            const bagColor   = cp.owner === 'entente' ? '#2a4a6a' : cp.owner === 'central' ? '#6a2a2a' : '#4a4a3a';
            const bagDark    = cp.owner === 'entente' ? '#1a2a4a' : cp.owner === 'central' ? '#4a1a1a' : '#2a2a22';

            if (!cp.path || cp.path.length < 2) return;
            const pts = cp.path;
            const trenchW = 18;

            ctx.save();
            ctx.lineJoin = 'miter';
            ctx.lineCap  = 'square';

            ctx.strokeStyle = floorColor;
            ctx.lineWidth   = trenchW;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();

            ctx.strokeStyle = cp.owner === 'entente' ? '#1a3050' : cp.owner === 'central' ? '#501a1a' : '#2e2a20';
            ctx.lineWidth   = trenchW - 7;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.stroke();

            // Sandbags on vertical segments
            for (let i = 0; i < pts.length - 1; i++) {
                const ax = pts[i].x, ay = pts[i].y;
                const bx = pts[i+1].x, by = pts[i+1].y;
                if (Math.abs(bx - ax) > 2) continue;
                const len = Math.abs(by - ay);
                const steps = Math.floor(len / 14);
                for (let s = 0; s <= steps; s++) {
                    const my = ay + (by - ay) * (s / steps);
                    ctx.fillStyle = s % 2 === 0 ? bagColor : bagDark;
                    ctx.fillRect(ax - trenchW / 2 - 6, my - 4, 9, 10);
                    ctx.fillRect(ax + trenchW / 2 - 3, my - 4, 9, 10);
                }
            }
            ctx.restore();

            // CP label
            ctx.save();
            ctx.font = 'bold 11px "Special Elite", monospace';
            ctx.fillStyle = cp.owner === 'entente' ? 'rgba(80,160,255,0.7)'
                          : cp.owner === 'central'  ? 'rgba(255,80,80,0.7)'
                          : 'rgba(200,190,140,0.6)';
            ctx.translate(cp.x + 28, 150);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(cp.label, 0, 0);
            ctx.restore();
        });

        // Bunker/pillbox emplacements
        for (let y = 250; y < this.worldHeight; y += 500) {
            const ex = this.getTrenchXAtY(this.ententeFrontPath, y);
            ctx.fillStyle = '#6b583e';
            ctx.beginPath();
            ctx.arc(ex, y, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#2a2218';
            ctx.beginPath();
            ctx.arc(ex, y, 14, 0, Math.PI * 2);
            ctx.fill();

            const cx = this.getTrenchXAtY(this.centralFrontPath, y);
            ctx.fillStyle = '#44484d';
            ctx.fillRect(cx - 18, y, 36, 50);
            ctx.fillStyle = '#1a1612';
            ctx.fillRect(cx - 14, y + 15, 8, 20);
        }
    }

    // Draw floating capture progress arcs above each CP
    drawCaptureUI(ctx) {
        const CAPTURE_TIME = 8.0;
        this.capturePoints.forEach(cp => {
            const centerY = this.worldHeight / 2;

            // Count troops in range for contested indicator
            const inRange = this.units.filter(u => u.hp > 0 && this._isFrontlineInfantry(u.type) && Math.abs(u.x - cp.x) < 45);
            const hasEntente = inRange.some(u => u.faction === 'entente');
            const hasCentral = inRange.some(u => u.faction === 'central');
            const contested  = hasEntente && hasCentral;

            // Flash yellow when contested
            if (contested && Math.floor(Date.now() / 250) % 2 === 0) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 220, 0, 0.6)';
                ctx.lineWidth = 3;
                ctx.setLineDash([8, 6]);
                ctx.beginPath();
                ctx.moveTo(cp.x, 0);
                ctx.lineTo(cp.x, this.worldHeight);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }

            // Progress arc
            const pct = cp.progress / CAPTURE_TIME; // -1..+1
            const arcR = 28;
            const arcX = cp.x;
            const arcY = centerY - 80;

            // Background ring
            ctx.save();
            ctx.beginPath();
            ctx.arc(arcX, arcY, arcR, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Fill arc
            if (Math.abs(pct) > 0.02) {
                const arcColor = pct > 0 ? '#3b82f6' : '#ef4444';
                const startAngle = -Math.PI / 2;
                const endAngle   = startAngle + Math.abs(pct) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(arcX, arcY);
                ctx.arc(arcX, arcY, arcR, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = arcColor + 'aa';
                ctx.fill();
            }

            // Owner icon in center
            ctx.font = '14px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                cp.owner === 'entente' ? '🔵' : cp.owner === 'central' ? '🔴' : '⚪',
                arcX, arcY
            );

            // Label below
            ctx.font = 'bold 10px "Special Elite", monospace';
            ctx.fillStyle = 'rgba(220,210,180,0.9)';
            ctx.fillText(cp.label, arcX, arcY + arcR + 10);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.restore();
        });
    }
    drawTerrainObstacles(ctx) {
        const craters = this.isGuestLite() && this.craters.length > 18
            ? this.craters.slice(-18)
            : this.craters;
        craters.forEach(crater => {
            ctx.fillStyle = '#3a2f22';
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.radius + 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#14100c';
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
            ctx.fill();

            // Guest lite: skip water highlight (1 less path per crater)
            if (!this.isGuestLite()) {
                ctx.fillStyle = crater.waterColor;
                ctx.beginPath();
                ctx.arc(crater.x + 2, crater.y + 2, crater.radius * 0.65, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.strokeStyle = '#8c8275';
        ctx.lineWidth = 1.5;
        const wires = this.isGuestLite() && this.barbedWire.length > 40
            ? this.barbedWire.filter((_, i) => i % 2 === 0)
            : this.barbedWire;
        wires.forEach(w => {
            ctx.beginPath();
            ctx.moveTo(w.x, w.y - 20); ctx.lineTo(w.x, w.y + 20);
            ctx.stroke();

            ctx.strokeStyle = '#4a3a28';
            ctx.beginPath();
            ctx.moveTo(w.x - 8, w.y - 10); ctx.lineTo(w.x + 8, w.y + 10);
            ctx.moveTo(w.x + 8, w.y - 10); ctx.lineTo(w.x - 8, w.y + 10);
            ctx.stroke();
            ctx.strokeStyle = '#8c8275';
        });
    }

    spawnTankSupport(faction, ownerId = null) {
        const resolvedOwnerId = this._resolveOwnerId(faction, ownerId);
        const isLeft = faction === 'entente';
        const startX = isLeft ? -150 : this.worldWidth + 150;
        const dropX = isLeft ? this.ententeTrenchX : this.centralTrenchX;
        const targetFrontX = isLeft ? (this.worldWidth - 600) : 600;
        const country = this._countryForOwner(resolvedOwnerId, faction);

        for (let i = 0; i < 3; i++) {
            const spawnY = 280 + i * 280 + (Math.random() * 80 - 40);
            this.tanks.push({
                id: Math.random().toString(36).substr(2, 9),
                faction: faction,
                ownerId: resolvedOwnerId,
                country: country,
                x: startX + (isLeft ? -i * 140 : i * 140),
                y: spawnY,
                targetX: dropX,
                targetY: spawnY,
                targetFrontX: targetFrontX,
                hp: 550,
                maxHp: 550,
                speed: 2.4,
                state: 'moving_to_drop', // 'moving_to_drop' | 'dropping_off' | 'advancing'
                dropTimer: 0,
                droppedOff: false,
                cannonCooldown: Math.random() * 2,
                recoil: 0
            });
        }
        if (window.AudioEngine && typeof window.AudioEngine.playArtilleryBoom === 'function') {
            window.AudioEngine.playArtilleryBoom();
        }
    }

    updateTanks(deltaTime = 0.016) {
        for (let i = this.tanks.length - 1; i >= 0; i--) {
            const t = this.tanks[i];
            if (t.hp <= 0) {
                this.createCrater(t.x, t.y, 24);
                for (let p = 0; p < 18; p++) {
                    this.particles.push({
                        x: t.x + (Math.random() * 40 - 20),
                        y: t.y + (Math.random() * 20 - 10),
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        life: 1.2,
                        maxLife: 1.2,
                        size: 6 + Math.random() * 8,
                        color: Math.random() < 0.6 ? '#f97316' : '#4b5563'
                    });
                }
                this.tanks.splice(i, 1);
                continue;
            }

            t.recoil = Math.max(0, t.recoil - deltaTime * 5);
            t.cannonCooldown = Math.max(0, t.cannonCooldown - deltaTime);

            const isLeft = t.faction === 'entente';

            if (t.state === 'moving_to_drop') {
                const dist = Math.abs(t.x - t.targetX);
                if (dist > 15) {
                    t.x += (isLeft ? 1 : -1) * t.speed * 60 * deltaTime;
                } else {
                    t.state = 'dropping_off';
                    t.dropTimer = 2.0;
                }
            } else if (t.state === 'dropping_off') {
                t.dropTimer -= deltaTime;
                if (t.dropTimer <= 0 && !t.droppedOff) {
                    t.droppedOff = true;
                    // Drop off 3 men (Roulette: rifleman, skirmisher, machinegunner, medic, engineer)
                    const types = ['rifleman', 'skirmisher', 'machinegunner', 'medic', 'engineer'];
                    for (let m = 0; m < 3; m++) {
                        const rType = types[Math.floor(Math.random() * types.length)];
                        const dropY = Math.max(100, Math.min(this.worldHeight - 100, t.y + (m - 1) * 22));
                        const soldier = this.createSoldier(t.faction, t.x, dropY, rType, 'garrison', t.ownerId, t.country);
                        this.units.push(soldier);
                    }
                    t.state = 'advancing';
                    t.targetX = t.targetFrontX;
                }
            } else if (t.state === 'advancing') {
                const dist = Math.abs(t.x - t.targetX);
                if (dist > 15) {
                    t.x += (isLeft ? 1 : -1) * (t.speed * 0.75) * 60 * deltaTime;
                }
            }

            // Tank Main Cannon Combat (Fires every 3.5s at enemy targets within 750px)
            if (t.cannonCooldown <= 0) {
                const targets = this.units.filter(u => u.hp > 0 && u.faction !== t.faction && Math.abs(u.x - t.x) < 750);
                if (targets.length > 0) {
                    targets.sort((a, b) => Math.abs(a.x - t.x) - Math.abs(b.x - t.x));
                    const target = targets[0];

                    t.cannonCooldown = 3.5;
                    t.recoil = 1.0;

                    if (window.AudioEngine && typeof window.AudioEngine.playShot === 'function') {
                        window.AudioEngine.playShot('artillery');
                    }

                    const cannonAngle = Math.atan2(target.y - t.y, target.x - t.x);
                    this.ordnance.push({
                        id: Math.random().toString(36).substr(2, 9),
                        x: t.x + (isLeft ? 40 : -40),
                        y: t.y - 10,
                        vx: Math.cos(cannonAngle) * 14,
                        vy: Math.sin(cannonAngle) * 14,
                        targetX: target.x,
                        targetY: target.y,
                        type: 'tank_shell',
                        damage: 90,
                        splashRadius: 55,
                        faction: t.faction,
                        ownerId: t.ownerId
                    });
                }
            }
        }
    }

    drawTanks(ctx) {
        this.tanks.forEach(t => {
            ctx.save();
            ctx.translate(t.x, t.y);

            const isLeft = t.faction === 'entente';
            const isSoviet = t.country === 'soviet';

            let img = this.alliedTankImg;
            let loaded = this.alliedTankImgLoaded;

            if (isSoviet && this.sovietTankImgLoaded) {
                img = this.sovietTankImg;
                loaded = this.sovietTankImgLoaded;
            } else if (t.faction === 'central' && this.axisTankImgLoaded) {
                img = this.axisTankImg;
                loaded = this.axisTankImgLoaded;
            }

            // Tank Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.ellipse(0, 32, 72, 18, 0, 0, Math.PI * 2);
            ctx.fill();

            // Flip facing based on faction (Left side tank barrel points RIGHT into combat)
            if (isLeft) {
                ctx.scale(-1, 1);
            }

            // Cannon Recoil Kick
            const recoilX = -t.recoil * 8;
            ctx.translate(recoilX, 0);

            // 1.5x Bigger + Stretched Horizontally Left-Right
            const tankW = 165;
            const tankH = 81;

            if (loaded) {
                ctx.drawImage(img, -tankW / 2, -tankH / 2, tankW, tankH);
            } else {
                ctx.fillStyle = t.faction === 'entente' ? '#2563eb' : '#dc2626';
                ctx.fillRect(-60, -30, 120, 60);
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, -12, 50, 14);
            }

            ctx.restore();

            // Tank Health Bar overhead
            if (t.hp < t.maxHp) {
                ctx.save();
                ctx.translate(t.x, t.y - 52);
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(-32, 0, 64, 7);
                const hpPct = Math.max(0, t.hp / t.maxHp);
                ctx.fillStyle = hpPct > 0.5 ? '#10b981' : (hpPct > 0.2 ? '#f59e0b' : '#ef4444');
                ctx.fillRect(-32, 0, 64 * hpPct, 7);
                ctx.restore();
            }

            // Dropping Off Indicator Text
            if (t.state === 'dropping_off') {
                ctx.save();
                ctx.translate(t.x, t.y - 64);
                ctx.font = 'bold 12px "Special Elite", monospace';
                ctx.fillStyle = '#f59e0b';
                ctx.textAlign = 'center';
                ctx.fillText("🪖 UNLOADING 3 MEN...", 0, 0);
                ctx.restore();
            }
        });
    }

    drawStructures(ctx) {
        this.structures.forEach(s => {
            ctx.save();
            ctx.translate(s.x, s.y);

            if (s.type === 'mg_nest') {
                ctx.fillStyle = s.faction === 'entente' ? '#705b41' : '#5c5243';
                ctx.beginPath();
                ctx.arc(0, 0, 24, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#1e1812';
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.fill();

                const isAllied = s.faction === 'entente';
                const mgImg = isAllied ? this.alliedMgImg : this.axisMgImg;
                const mgLoaded = isAllied ? this.alliedMgImgLoaded : this.axisMgImgLoaded;

                if (mgLoaded) {
                    ctx.save();
                    if (!isAllied) {
                        ctx.scale(-1, 1); // Flip Axis MG42 to point left toward No Man's Land
                    }
                    const renderW = isAllied ? 46 : 38;
                    const renderH = isAllied ? 20 : 26;
                    ctx.drawImage(mgImg, -6, -renderH / 2, renderW, renderH);
                    ctx.restore();
                } else {
                    ctx.fillStyle = '#111';
                    ctx.fillRect(0, -4, 28, 8);
                }

                if (s.isOverheated) {
                    ctx.font = '900 13px "Special Elite", monospace';
                    ctx.fillStyle = '#ef4444';
                    ctx.shadowColor = '#000';
                    ctx.shadowBlur = 4;
                    ctx.fillText("🔥 OVERHEATING", -45, -36);
                    ctx.shadowBlur = 0;
                }
            } else if (s.type === 'artillery_gun') {
                ctx.fillStyle = '#3a332a';
                ctx.beginPath();
                ctx.arc(0, 0, 32, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#1a1612';
                ctx.beginPath();
                ctx.arc(0, 0, 26, 0, Math.PI * 2);
                ctx.fill();

                if (this.artilleryImgLoaded) {
                    ctx.drawImage(this.artilleryImg, -25, -30, 50, 50);
                } else {
                    ctx.fillStyle = '#4b5563';
                    ctx.fillRect(-10, -15, 20, 30);
                    ctx.fillStyle = '#111';
                    ctx.fillRect(0, -25, 8, 30);
                }
            }

            if (!s.constructed) {
                const barW = 44;
                ctx.fillStyle = '#111';
                ctx.fillRect(-barW / 2, -42, barW, 6);
                ctx.fillStyle = '#d4af37';
                ctx.fillRect(-barW / 2, -42, barW * s.progress, 6);
            }

            ctx.restore();
        });
    }

    drawBuildPreviewGhost(ctx) {
        if (!this.buildMode.active) return;
        ctx.save();
        ctx.translate(this.buildMode.mouseX, this.buildMode.mouseY);

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
        ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const label = this.buildMode.structureType === 'artillery_gun' ? "BUILD ARTILLERY (90s)" : "BUILD MG NEST (60s)";
        ctx.font = '12px "Cinzel", serif';
        ctx.fillStyle = '#d4af37';
        ctx.fillText(label, -55, -38);

        ctx.restore();
    }

    // Helper: get the correct sprite image & draw params for a given country
    _getCountrySprite(country) {
        const map = {
            uk:      { img: this.alliedImg,   loaded: this.alliedImgLoaded,   w: 32, h: 48, ox: -16, oy: -24, flip: false, weaponFlip: false },
            canada:  { img: this.canadaImg,   loaded: this.canadaImgLoaded,   w: 34, h: 34, ox: -17, oy: -17, flip: false, weaponFlip: false },
            france:  { img: this.franceImg,   loaded: this.franceImgLoaded,   w: 34, h: 34, ox: -17, oy: -17, flip: false, weaponFlip: false },
            usa:     { img: this.usaImg,      loaded: this.usaImgLoaded,      w: 34, h: 34, ox: -17, oy: -17, flip: false, weaponFlip: false },
            germany: { img: this.germanyImg,  loaded: this.germanyImgLoaded,  w: 84, h: 52, ox: -42, oy: -26, flip: true,  weaponFlip: true  },
            austria: { img: this.austriaImg,  loaded: this.austriaImgLoaded,  w: 50, h: 50, ox: -25, oy: -25, flip: false, weaponFlip: true  },
            ottoman: { img: this.ottomanImg,  loaded: this.ottomanImgLoaded,  w: 50, h: 50, ox: -25, oy: -25, flip: true,  weaponFlip: true  },
            soviet:  { img: this.sovietImg,   loaded: this.sovietImgLoaded,   w: 60, h: 52, ox: -30, oy: -26, flip: true,  weaponFlip: false }
        };
        return map[country] || map['uk'];
    }

    // Helper: determine the enemy country to use for the opposing sprite
    _getEnemyCountry() {
        if (this.playerFaction === 'entente') {
            return 'germany';
        }
        return 'uk';
    }

    drawDeadBodies(ctx) {
        const bodies = this.isGuestLite() && this.deadBodies.length > 20
            ? this.deadBodies.slice(-20)
            : this.deadBodies;
        bodies.forEach(b => {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);

            const isPlayerFaction = b.faction === this.playerFaction;
            const country = b.country || (isPlayerFaction ? this.playerCountry : this._getEnemyCountry());
            const sprite = this._getCountrySprite(country);

            if (sprite.loaded) {
                ctx.globalAlpha = 0.7;
                if (sprite.flip) {
                    ctx.save();
                    ctx.scale(-1, 1);
                    ctx.drawImage(sprite.img, sprite.ox, sprite.oy, sprite.w, sprite.h);
                    ctx.restore();
                } else {
                    ctx.drawImage(sprite.img, sprite.ox, sprite.oy, sprite.w, sprite.h);
                }
                ctx.globalAlpha = 1.0;
            } else {
                ctx.fillStyle = b.faction === 'entente' ? '#1e3a8a' : '#7f1d1d';
                ctx.fillRect(-6, -2, 12, 4);
                ctx.fillStyle = '#111';
                ctx.beginPath();
                ctx.arc(-4, -1, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            if (b.deathTimer > 0) {
                ctx.font = '12px serif';
                ctx.fillStyle = '#ef4444';
                ctx.fillText('🩸', -6, -26);
            }

            ctx.restore();
        });
    }

    drawUnits(ctx, deltaTime) {
        this.units.forEach(unit => {
            // Sprinting Detection & Smooth Stride Cadence
            const isSprinting = unit.state === 'charging' || unit.state === 'retreating' || unit.isSprinting;
            if (isSprinting) {
                unit.sprintPhase = (unit.sprintPhase || 0) + (deltaTime || 0.016) * 3.5;
            } else {
                unit.sprintPhase = 0;
            }

            // Slower, smooth stride sway
            const forwardLean = unit.faction === 'entente' ? 0.10 : -0.10;
            const bodySway = isSprinting ? (forwardLean + Math.sin(unit.sprintPhase) * 0.06) : 0;
            const verticalBob = isSprinting ? Math.abs(Math.sin(unit.sprintPhase)) * -2.5 : 0;
            const rifleSprintDip = isSprinting ? (0.28 + Math.sin(unit.sprintPhase) * 0.04) : 0;

            ctx.save();
            ctx.translate(unit.x, unit.y + verticalBob);

            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(0, 10 - verticalBob, 12, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            if (unit.isAiming) {
                ctx.strokeStyle = 'rgba(255, 200, 50, 0.8)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.stroke();
            }

            if (unit.type === 'officer') {
                ctx.strokeStyle = 'rgba(212, 175, 55, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 22, 0, Math.PI * 2);
                ctx.stroke();

                ctx.font = '10px "Cinzel", serif';
                ctx.fillStyle = '#d4af37';
                ctx.fillText("🎖️ AID", -16, -28);
            }

            if (unit.type === 'medic' && unit.state === 'reviving') {
                ctx.font = 'bold 12px "Special Elite", monospace';
                ctx.fillStyle = '#10b981';
                ctx.fillText("➕ REVIVING", -35, -30);
            }

            if (unit.bayonetThrustTimer && unit.bayonetThrustTimer > 0) {
                unit.bayonetThrustTimer -= (deltaTime || 0.016);
                ctx.font = 'bold 11px "Cinzel", serif';
                ctx.fillStyle = '#ef4444';
                ctx.fillText("🗡️ BAYONET", -25, -32);
            }

            // Draw Countryball Sprite — per-unit country (UK ally ≠ USA ally)
            const unitCountry = unit.country
                || this._countryForOwner(unit.ownerId, unit.faction)
                || (unit.faction === this.playerFaction ? this.playerCountry : this._getEnemyCountry());
            const sprite = this._getCountrySprite(unitCountry);

            if (sprite.loaded) {
                ctx.save();
                if (isSprinting) ctx.rotate(bodySway); // Smooth forward lean & weight sway!
                if (sprite.flip) {
                    ctx.save();
                    ctx.scale(-1, 1);
                    ctx.drawImage(sprite.img, sprite.ox, sprite.oy, sprite.w, sprite.h);
                    ctx.restore();
                } else {
                    ctx.drawImage(sprite.img, sprite.ox, sprite.oy, sprite.w, sprite.h);
                }
                ctx.restore();
            } else {
                // Fallback colored circle
                const color = unit.faction === 'entente' ? '#1e3a8a' : '#7f1d1d';
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            // Weapon overlay — pistol for specialists, mobile HMG for machine gunners, shotgun for skirmishers, rifle for riflemen/medics
            const isFlipped = sprite.weaponFlip;
            if (unit.type === 'engineer' || unit.type === 'artilleryman' || unit.type === 'officer') {
                if (this.pistolImgLoaded && unit.state !== 'manning_artillery') {
                    ctx.save();
                    if (isFlipped) ctx.scale(-1, 1);
                    ctx.translate(4, 8);
                    ctx.rotate(isSprinting ? (0.25 + Math.sin(unit.sprintPhase) * 0.05) : 0);
                    ctx.drawImage(this.pistolImg, 0, -4, 18, 12);
                    ctx.restore();
                }
            } else if (unit.type === 'machinegunner') {
                const isSoviet = unit.country === 'soviet';
                const isAllied = unit.faction === 'entente';
                const mgImg = isSoviet ? (this.sovietMgImgLoaded ? this.sovietMgImg : this.alliedMgImg) : (isAllied ? this.alliedMgImg : this.axisMgImg);
                const mgLoaded = isSoviet ? (this.sovietMgImgLoaded || this.alliedMgImgLoaded) : (isAllied ? this.alliedMgImgLoaded : this.axisMgImgLoaded);
                if (mgLoaded) {
                    ctx.save();
                    if (isFlipped) ctx.scale(-1, 1);
                    ctx.translate(5, 8);
                    ctx.rotate(isSprinting ? rifleSprintDip : (unit.isAiming ? -0.05 : 0.08));
                    const mgW = isSoviet ? 38 : (isAllied ? 36 : 32);
                    const mgH = isSoviet ? 18 : (isAllied ? 16 : 22);
                    ctx.drawImage(mgImg, 0, -mgH / 2, mgW, mgH);
                    ctx.restore();
                }
            } else if (unit.type === 'skirmisher') {
                ctx.save();
                if (isFlipped) ctx.scale(-1, 1);
                ctx.translate(5, 8);
                ctx.rotate(isSprinting ? rifleSprintDip : (unit.isAiming ? -0.05 : 0.08));
                if (this.shotgunImgLoaded) {
                    ctx.drawImage(this.shotgunImg, 0, -6, 34, 12);
                } else {
                    ctx.fillStyle = '#2a241c';
                    ctx.fillRect(0, -3, 22, 5);
                    ctx.fillStyle = '#4a3f32';
                    ctx.fillRect(14, -4, 12, 7);
                }
                ctx.restore();
                // Remaining grenades as M67 icons above head
                if ((unit.grenades || 0) > 0) {
                    for (let g = 0; g < unit.grenades; g++) {
                        const gx = -12 + g * 8;
                        const gy = -26;
                        if (this.grenadeImgLoaded) {
                            ctx.drawImage(this.grenadeImg, gx - 4, gy - 4, 9, 9);
                        } else {
                            ctx.fillStyle = '#6b8f3a';
                            ctx.beginPath();
                            ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            } else if ((unit.type === 'rifleman' || unit.type === 'medic') && (this.bayonetWeaponImgLoaded || this.weaponImgLoaded)) {
                ctx.save();
                if (isFlipped) ctx.scale(-1, 1);
                ctx.translate(6, 10);
                if (isSprinting) {
                    ctx.rotate(rifleSprintDip); // Low trail carry angle!
                } else {
                    ctx.rotate(unit.isAiming ? -0.1 : 0.08); // Level ready stance!
                }
                const activeRifleImg = (this.bayonetWeaponImgLoaded && (unit.type === 'rifleman' || unit.bayonetThrustTimer > 0))
                    ? this.bayonetWeaponImg
                    : this.weaponImg;
                ctx.drawImage(activeRifleImg, 0, -9, 34, 18);
                ctx.restore();
            }

            if (unit.hp < unit.maxHp) {
                const barWidth = 16;
                const hpPct = Math.max(0, unit.hp / unit.maxHp);
                ctx.fillStyle = '#111';
                ctx.fillRect(-barWidth / 2, -28, barWidth, 3);
                ctx.fillStyle = hpPct > 0.5 ? '#10b981' : '#ef4444';
                ctx.fillRect(-barWidth / 2, -28, barWidth * hpPct, 3);
            }

            ctx.restore();
        });
    }

    updateAndDrawTracers(ctx, dt) {
        if (this.isGuestLite() && this.tracers.length > 28) {
            this.tracers.splice(0, this.tracers.length - 28);
        }
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            const t = this.tracers[i];
            t.life -= this.isGuestLite() ? dt * 1.4 : dt;
            if (t.life <= 0) {
                this.tracers.splice(i, 1);
                continue;
            }

            ctx.strokeStyle = t.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(t.startX, t.startY);
            ctx.lineTo(t.targetX, t.targetY);
            ctx.stroke();
        }
    }

    updateAndDrawOrdnance(ctx, deltaTime) {
        for (let i = this.ordnance.length - 1; i >= 0; i--) {
            const ord = this.ordnance[i];
            ord.progress += 0.02 * (ord.speed || 1);

            if (ord.progress < 1.0) {
                const currentX = ord.startX + (ord.targetX - ord.startX) * ord.progress;
                const arc = Math.sin(ord.progress * Math.PI) * (ord.type === 'grenade' ? 40 : 25);
                const currentY = ord.startY + (ord.targetY - ord.startY) * ord.progress - arc;

                if (ord.type === 'grenade') {
                    if (this.grenadeImgLoaded) {
                        ctx.drawImage(this.grenadeImg, currentX - 8, currentY - 8, 16, 16);
                    } else {
                        ctx.fillStyle = '#3d4a2e';
                        ctx.beginPath();
                        ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    ctx.strokeStyle = 'rgba(255, 200, 100, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(currentX - 15, currentY - 25);
                    ctx.lineTo(currentX, currentY);
                    ctx.stroke();
                }
            } else {
                this.createExplosion(ord.targetX, ord.targetY, ord.type);
                this.ordnance.splice(i, 1);
            }
        }
    }

    createExplosion(x, y, type = 'he') {
        const isGrenade = type === 'grenade';
        const guestLite = this.isGuestLite();
        this.craters.push({
            x: x, y: y,
            radius: type === 'he' ? 22 : (isGrenade ? 12 : 14),
            waterColor: '#191511'
        });
        if (guestLite && this.craters.length > 18) {
            this.craters.splice(0, this.craters.length - 18);
        }

        // Guests only show VFX — host owns damage via snapshots
        if (!guestLite) {
            const blastRadius = type === 'he' ? 55 : (isGrenade ? 48 : 35);
            const maxDmg = type === 'he' ? 120 : (isGrenade ? 85 : 60);
            this.units.forEach(u => {
                const dist = Math.hypot(u.x - x, u.y - y);
                if (dist < blastRadius) {
                    const dmg = (1 - (dist / blastRadius)) * maxDmg;
                    u.hp -= dmg;
                    if (u.hp <= 0) this.killSoldier(u);
                }
            });
        }

        const particleCount = guestLite
            ? (isGrenade ? 4 : 6)
            : (isGrenade ? 18 : (type === 'he' ? 25 : 40));
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                radius: 3 + Math.random() * (isGrenade ? 6 : 8),
                color: type === 'gas' ? 'rgba(80, 200, 80, ' : (Math.random() > 0.4 ? 'rgba(255, 140, 0, ' : 'rgba(80, 80, 80, '),
                opacity: 0.9,
                decay: guestLite ? 0.04 : (0.015 + Math.random() * 0.02),
                type: type
            });
        }
        if (guestLite) this._enforceGuestFxCaps();
    }

    updateAndDrawParticles(ctx, deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.radius += 0.2;
            p.opacity -= p.decay;

            if (p.opacity <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.fillStyle = p.color + p.opacity + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    updateAndDrawPlanes(ctx, deltaTime) {
        for (let i = this.planes.length - 1; i >= 0; i--) {
            const plane = this.planes[i];
            plane.x += plane.vx;
            plane.y += plane.vy;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.beginPath();
            ctx.ellipse(plane.x - 30, plane.y + 120, 20, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = plane.faction === 'entente' ? '#78826b' : '#a33939';
            ctx.fillRect(plane.x - 18, plane.y - 4, 36, 8);
            ctx.fillRect(plane.x - 4, plane.y - 15, 8, 30);

            if (plane.x > this.worldWidth + 100 || plane.x < -100) {
                this.planes.splice(i, 1);
            }
        }
    }

    drawWeather(ctx, deltaTime) {
        if (this.isGuestLite() || this.weather.type === 'clear') return;

        if (this.weather.type === 'fog') {
            this.weather.fogParticles.forEach(f => {
                f.x += f.vx;
                if (f.x > this.worldWidth + f.radius) f.x = -f.radius;

                ctx.fillStyle = `rgba(215, 205, 185, ${f.opacity})`;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (this.weather.type === 'smog') {
            this.weather.fogParticles.forEach(f => {
                f.x += f.vx;
                if (f.x > this.worldWidth + f.radius) f.x = -f.radius;

                ctx.fillStyle = `rgba(130, 140, 100, ${f.opacity})`;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (this.weather.type === 'rain') {
            ctx.strokeStyle = 'rgba(180, 210, 240, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            this.weather.rainParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.y > this.worldHeight) {
                    p.y = -20;
                    p.x = Math.random() * this.worldWidth;
                }
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + p.vx, p.y + p.length);
            });
            ctx.stroke();
        }
    }

    drawMinimap() {
        if (!this.minimapCtx) return;
        const mctx = this.minimapCtx;
        const mw = this.minimapCanvas.width;
        const mh = this.minimapCanvas.height;

        mctx.fillStyle = '#1c1813';
        mctx.fillRect(0, 0, mw, mh);

        const scaleX = mw / this.worldWidth;
        const scaleY = mh / this.worldHeight;

        mctx.fillStyle = '#3b82f6';
        mctx.fillRect(this.ententeTrenchX * scaleX, 0, 2, mh);

        mctx.fillStyle = '#ef4444';
        mctx.fillRect(this.centralTrenchX * scaleX, 0, 2, mh);

        this.units.forEach(u => {
            mctx.fillStyle = u.faction === 'entente' ? '#60a5fa' : '#f87171';
            mctx.fillRect(u.x * scaleX, u.y * scaleY, 2, 2);
        });

        const camW = (this.canvas.width / this.camera.zoom) * scaleX;
        const camH = (this.canvas.height / this.camera.zoom) * scaleY;
        const camX = this.camera.x * scaleX;
        const camY = this.camera.y * scaleY;

        mctx.strokeStyle = '#d4af37';
        mctx.lineWidth = 1;
        mctx.strokeRect(camX, camY, camW, camH);
    }

    fireArtillery(targetX, targetY, type = 'he') {
        this.ordnance.push({
            startX: targetX + (Math.random() * 200 - 100),
            startY: targetY - 500,
            targetX: targetX,
            targetY: targetY,
            progress: 0,
            speed: 1.2,
            type: type
        });
    }

    dispatchReconPlane(faction = 'entente') {
        this.planes.push({
            faction: faction,
            x: -50,
            y: 400 + Math.random() * 600,
            vx: 3.5 + Math.random() * 1.5,
            vy: 0.1
        });
    }
}
