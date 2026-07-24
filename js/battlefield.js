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

        this.pistolImg = new Image();
        this.pistolImg.src = 'm1911-removebg-preview.png';
        this.pistolImgLoaded = false;
        this.pistolImg.onload = () => { this.pistolImgLoaded = true; };

        this.mg08Img = new Image();
        this.mg08Img.src = 'mg-08-machine-gun-weapon-weaponry-cannon-transparent-png-2101779-removebg-preview.png';
        this.mg08ImgLoaded = false;
        this.mg08Img.onload = () => { this.mg08ImgLoaded = true; };

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

    applyMapLayout() {
        this.mapId = 'western';
        this.worldWidth = 4800;
        this.ententeSupportTrenchX = 480;
        this.ententeTrenchX = 900;
        this.capturePoints = [
            { x: 1700, owner: null, progress: 0, path: null, label: 'CHARLIE-1' },
            { x: 2400, owner: null, progress: 0, path: null, label: 'CHARLIE-2' },
            { x: 3100, owner: null, progress: 0, path: null, label: 'CHARLIE-3' },
        ];
        this.centralTrenchX = 3900;
        this.centralSupportTrenchX = 4320;
        console.log(`[MAP] Applied western layout world=${this.worldWidth} cps=${this.capturePoints.length}`);
    }

    reloadBattlefield() {
        this.applyMapLayout();
        this.units = [];
        this.deadBodies = [];
        this.structures = [];
        this.craters = [];
        this.barbedWire = [];
        this.ordnance = [];
        this.particles = [];
        this.tracers = [];
        this.planes = [];
        this.generateTerrainFeatures();
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
        this.canvas.width = this.canvas.parentElement.clientWidth || window.innerWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight || (window.innerHeight - 150);
    }

    generateTerrainFeatures() {
        this.craters = [];
        this.barbedWire = [];

        const nmlLeft = this.ententeTrenchX + 80;
        const nmlRight = this.centralTrenchX - 80;
        const nmlWidth = Math.max(200, nmlRight - nmlLeft);

        for (let i = 0; i < 80; i++) {
            this.craters.push({
                x: nmlLeft + Math.random() * nmlWidth,
                y: 100 + Math.random() * (this.worldHeight - 200),
                radius: 18 + Math.random() * 30,
                waterColor: Math.random() > 0.4 ? '#1c221a' : '#171410'
            });
        }

        for (let y = 80; y < this.worldHeight - 80; y += 60) {
            this.barbedWire.push({ x: this.ententeTrenchX + 60, y: y + Math.random() * 10 });
            this.barbedWire.push({ x: this.centralTrenchX  - 60, y: y + Math.random() * 10 });
            if (Math.random() < 0.4) {
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
        const totalRifle = 25;
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
        if (ownerId === 'ai') return faction === 'entente' ? 'uk' : 'germany';
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
        let range = 450;
        if (type === 'machinegunner') range = 550;
        else if (type === 'skirmisher') range = 180;
        else if (type === 'engineer' || type === 'artilleryman' || type === 'officer') range = 260;
        
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
            // Frontline infantry hold a trench line: main front, Charlie CP, or enemy trench
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
            speed: type === 'engineer' ? 1.1 : (type === 'machinegunner' ? 0.8 : (type === 'officer' ? 1.05 : (type === 'medic' ? 1.15 : (type === 'skirmisher' ? 1.05 : 0.95)))),
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
        if (faction === 'entente') {
            return ['main', 'cp0', 'cp1', 'cp2', 'enemy'];
        }
        return ['main', 'cp2', 'cp1', 'cp0', 'enemy'];
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
                mh: Math.round(u.maxHp)
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

            if (existing) {
                // Soft follow host position (reduces teleport stutter)
                const dx = x - existing.x;
                const dy = y - existing.y;
                if (Math.hypot(dx, dy) > 48) {
                    existing.x = x;
                    existing.y = y;
                } else {
                    // Snap hard toward host — guests were lagging behind with soft follow
                    existing.x += dx * 0.9;
                    existing.y += dy * 0.9;
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
                    grenades: type === 'skirmisher' ? 3 : 0,
                    grenadeCooldown: 0,
                    shootCooldown: 0,
                    aimTimer: 0,
                    isAiming: false,
                    currentTarget: null,
                    assignedBuildId: null,
                    assignedTargetId: null,
                    reviveTimer: 0,
                    inCover: state === 'garrison' || state === 'reserve',
                    speed: type === 'engineer' ? 1.1 : (type === 'machinegunner' ? 0.8 : (type === 'officer' ? 1.05 : (type === 'medic' ? 1.15 : (type === 'skirmisher' ? 1.05 : 0.95)))),
                    range: type === 'machinegunner' ? 550 : (type === 'skirmisher' ? 180 : (type === 'engineer' || type === 'artilleryman' || type === 'officer' ? 260 : 450))
                });
            }
        }
        this.units = next;

        if (snap.cps && snap.cps.length === this.capturePoints.length) {
            snap.cps.forEach((c, i) => {
                this.capturePoints[i].owner = c.o === undefined ? c.owner : c.o;
                this.capturePoints[i].progress = c.p != null ? c.p : c.progress;
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
    }

    initWeather() {
        for (let i = 0; i < 60; i++) {
            this.weather.fogParticles.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                radius: 120 + Math.random() * 180,
                vx: 0.1 + Math.random() * 0.25,
                opacity: 0.08 + Math.random() * 0.12
            });
        }
        for (let i = 0; i < 150; i++) {
            this.weather.rainParticles.push({
                x: Math.random() * this.worldWidth,
                y: Math.random() * this.worldHeight,
                length: 12 + Math.random() * 18,
                vy: 12 + Math.random() * 8,
                vx: -2 - Math.random() * 2
            });
        }
    }

    setupCameraControls() {
        const c = this.canvas;
        c.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !this.buildMode.active) {
                this.camera.isDragging = true;
                this.camera.dragStartX = e.clientX;
                this.camera.dragStartY = e.clientY;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.camera.isDragging) {
                const dx = (e.clientX - this.camera.dragStartX) / this.camera.zoom;
                const dy = (e.clientY - this.camera.dragStartY) / this.camera.zoom;
                this.camera.x -= dx;
                this.camera.y -= dy;
                this.camera.dragStartX = e.clientX;
                this.camera.dragStartY = e.clientY;
                this.clampCamera();
            }

            if (this.buildMode.active) {
                const rect = this.canvas.getBoundingClientRect();
                this.buildMode.mouseX = (e.clientX - rect.left) / this.camera.zoom + this.camera.x;
                this.buildMode.mouseY = (e.clientY - rect.top) / this.camera.zoom + this.camera.y;
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

                this.constructStructureAt(this.playerFaction, this.buildMode.structureType, worldX, worldY);
                
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

        this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.1;
        this.clampCamera();

        if (this.mpGuestView) {
            // Presentation only — do NOT run combat/capture (that was causing huge MP lag)
            this.updateSoldierMovement(dtSec);
        } else {
            this.updateFallenBodies(dtSec);
            this.updateMedicBehavior(dtSec);
            this.updateOfficerBehavior(dtSec);
            this.updateSoldierCombat(dtSec);
            this.updateSoldierMovement(dtSec);
            this.updateStructures(dtSec);
            this.updateCapturePoints(dtSec);
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
        this.drawStructures(ctx);
        this.updateAndDrawTracers(ctx, dtSec);
        this.updateAndDrawOrdnance(ctx, deltaTime);
        this.updateAndDrawParticles(ctx, deltaTime);
        this.updateAndDrawPlanes(ctx, deltaTime);
        this.drawBuildPreviewGhost(ctx);
        this.drawWeather(ctx, deltaTime);
        this.drawCaptureUI(ctx);

        ctx.restore();
        this.drawMinimap();
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
                        gunner.range = 550;
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
                u.inCover = (Math.abs(u.x - this.ententeTrenchX) < 25) || (Math.abs(u.x - this.ententeSupportTrenchX) < 25);
            } else {
                u.inCover = (Math.abs(u.x - this.centralTrenchX) < 25) || (Math.abs(u.x - this.centralSupportTrenchX) < 25);
            }

            if (unlocks.rifleTier1 && u.type === 'rifleman') {
                const meleeVictim = this.units.find(e => e.faction !== u.faction && e.hp > 0 && Math.hypot(e.x - u.x, e.y - u.y) < 25);
                if (meleeVictim) {
                    meleeVictim.hp -= 60;
                    this.spawnBloodPuff(meleeVictim.x, meleeVictim.y);
                    if (meleeVictim.hp <= 0) this.killSoldier(meleeVictim);
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

                this.tracers.push({
                    startX: u.x,
                    startY: u.y + 2,
                    targetX: isHit && victim ? victim.x : targetX,
                    targetY: isHit && victim ? victim.y : targetY,
                    life: 0.1,
                    color: u.faction === 'entente' ? 'rgba(255, 220, 100, 0.95)' : 'rgba(255, 170, 90, 0.95)'
                });

                if (window.AudioEngine && typeof window.AudioEngine.playGunshot === 'function') window.AudioEngine.playGunshot();

                if (isHit && victim) {
                    const dmg = 35 + Math.random() * 25;
                    victim.hp -= dmg;
                    this.spawnBloodPuff(victim.x, victim.y);
                    if (victim.hp <= 0) this.killSoldier(victim);
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
        const isOneShotKill = isOfficerAidingFront && Math.random() < 0.10;

        const isHit = Math.random() < hitChance || isOneShotKill;

        this.tracers.push({
            startX: u.x,
            startY: u.y + 2,
            targetX: enemy.x + (isHit ? 0 : (Math.random() * 30 - 15)),
            targetY: enemy.y + (isHit ? 0 : (Math.random() * 30 - 15)),
            life: 0.12,
            color: u.type === 'skirmisher'
                ? 'rgba(255, 200, 80, 0.95)'
                : (u.faction === 'entente' ? 'rgba(255, 230, 150, 0.9)' : 'rgba(255, 180, 120, 0.9)')
        });

        if (window.AudioEngine && typeof window.AudioEngine.playGunshot === 'function') window.AudioEngine.playGunshot();

        if (isHit) {
            let damage;
            if (u.type === 'skirmisher') {
                damage = 55 + Math.random() * 30; // shotgun punch
            } else if (u.type === 'rifleman' || u.type === 'medic') {
                damage = 35 + Math.random() * 25;
            } else {
                damage = 25 + Math.random() * 20;
            }
            
            if (unlocks.rifleTier2 && u.type === 'rifleman') damage *= 1.10;
            if (isOneShotKill) damage = 999;

            enemy.hp -= damage;
            this.spawnBloodPuff(enemy.x, enemy.y);

            if (enemy.hp <= 0) {
                this.killSoldier(enemy);
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

    updateSoldierMovement(dt) {
        this.units = this.units.filter(u => u.hp > 0);

        this.units.forEach(u => {
            if (u.isAiming) return;

            if (u.type === 'machinegunner' || u.type === 'engineer' || u.type === 'artilleryman' || u.type === 'officer' || u.type === 'medic') {
                if (u.state === 'building' || u.state === 'manning_mg' || u.state === 'manning_artillery' || u.state === 'reserve' || u.state === 'aiding' || u.state === 'reviving') {
                    const dx = u.targetX - u.x;
                    const dy = u.targetY - u.y;
                    if (Math.hypot(dx, dy) > 5) {
                        u.x += Math.sign(dx) * u.speed;
                        u.y += Math.sign(dy) * u.speed;
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
                    u.x += Math.sign(dx) * u.speed;
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
                    u.x += Math.sign(dx) * (u.speed * 1.15);
                } else {
                    u.x = homeX;
                    u.state = 'garrison';
                    u.inCover = true;
                }
            } else if (u.state === 'garrison') {
                // Softly snap X to this unit's assigned trench line (main or Charlie CP)
                const path = this._getPathForHoldLine(u.faction, u.holdLine || 'main');
                const targetX = this.getTrenchXAtY(path, u.y);
                u.x += (targetX - u.x) * 0.05;
                u.y += (Math.random() - 0.5) * 0.2;
                u.y = Math.max(120, Math.min(this.worldHeight - 120, u.y));
            }
        });
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

        const teamName = faction === 'entente' ? 'ENTENTE EXPEDITIONARY' : 'CENTRAL POWERS';
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

        const teamName = faction === 'entente' ? 'ENTENTE EXPEDITIONARY' : 'CENTRAL POWERS';
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
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 2 + Math.random() * 3,
                color: 'rgba(160, 20, 20, ',
                opacity: 0.9,
                decay: 0.04
            });
        }
    }

    drawGround(ctx) {
        // Base dark dirt
        ctx.fillStyle = '#241e17';
        ctx.fillRect(0, 0, this.worldWidth, this.worldHeight);

        // No Man's Land darker band (between the two frontlines)
        ctx.fillStyle = '#1a1510';
        ctx.fillRect(this.ententeTrenchX + 20, 0, this.centralTrenchX - this.ententeTrenchX - 40, this.worldHeight);

        // Shell-scarred texture patches across No Man's Land
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

    drawTrenches(ctx) {
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
        this.craters.forEach(crater => {
            ctx.fillStyle = '#3a2f22';
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.radius + 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#14100c';
            ctx.beginPath();
            ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = crater.waterColor;
            ctx.beginPath();
            ctx.arc(crater.x + 2, crater.y + 2, crater.radius * 0.65, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.strokeStyle = '#8c8275';
        ctx.lineWidth = 1.5;
        this.barbedWire.forEach(w => {
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

                if (this.mg08ImgLoaded) {
                    ctx.drawImage(this.mg08Img, -2, -14, 38, 28);
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
            ottoman: { img: this.ottomanImg,  loaded: this.ottomanImgLoaded,  w: 50, h: 50, ox: -25, oy: -25, flip: true,  weaponFlip: true  }
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
        this.deadBodies.forEach(b => {
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
            ctx.save();
            ctx.translate(unit.x, unit.y);

            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(0, 10, 12, 5, 0, 0, Math.PI * 2);
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

            // Draw Countryball Sprite — per-unit country (UK ally ≠ USA ally)
            const unitCountry = unit.country || (unit.faction === this.playerFaction ? this.playerCountry : this._getEnemyCountry());
            const sprite = this._getCountrySprite(unitCountry);

            if (sprite.loaded) {
                if (sprite.flip) {
                    ctx.save();
                    ctx.scale(-1, 1);
                    ctx.drawImage(sprite.img, sprite.ox, sprite.oy, sprite.w, sprite.h);
                    ctx.restore();
                } else {
                    ctx.drawImage(sprite.img, sprite.ox, sprite.oy, sprite.w, sprite.h);
                }
            } else {
                // Fallback colored circle
                const color = unit.faction === 'entente' ? '#1e3a8a' : '#7f1d1d';
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            // Weapon overlay — pistol for specialists, shotgun for skirmisher, rifle for riflemen/medics
            const isFlipped = sprite.weaponFlip;
            if (unit.type === 'engineer' || unit.type === 'artilleryman' || unit.type === 'officer' || (unit.type === 'machinegunner' && unit.state !== 'manning_mg')) {
                if (this.pistolImgLoaded && unit.state !== 'manning_artillery') {
                    ctx.save();
                    if (isFlipped) ctx.scale(-1, 1);
                    ctx.translate(4, 8);
                    ctx.drawImage(this.pistolImg, 0, -4, 18, 12);
                    ctx.restore();
                }
            } else if (unit.type === 'skirmisher') {
                ctx.save();
                if (isFlipped) ctx.scale(-1, 1);
                ctx.translate(5, 8);
                ctx.rotate(unit.isAiming ? -0.05 : 0.08);
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
            } else if ((unit.type === 'rifleman' || unit.type === 'medic') && this.weaponImgLoaded) {
                ctx.save();
                if (isFlipped) ctx.scale(-1, 1);
                ctx.translate(6, 10);
                ctx.rotate(unit.isAiming ? -0.1 : 0.1);
                ctx.drawImage(this.weaponImg, 0, -5, 32, 10);
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
        for (let i = this.tracers.length - 1; i >= 0; i--) {
            const t = this.tracers[i];
            t.life -= dt;
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
        this.craters.push({
            x: x, y: y,
            radius: type === 'he' ? 22 : (isGrenade ? 12 : 14),
            waterColor: '#191511'
        });

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

        const particleCount = isGrenade ? 18 : (type === 'he' ? 25 : 40);
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
                decay: 0.015 + Math.random() * 0.02,
                type: type
            });
        }
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
        if (this.weather.type === 'fog') {
            this.weather.fogParticles.forEach(f => {
                f.x += f.vx;
                if (f.x > this.worldWidth + f.radius) f.x = -f.radius;

                ctx.fillStyle = `rgba(215, 205, 185, ${f.opacity})`;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
            });
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
