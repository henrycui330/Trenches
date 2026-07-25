/* ==========================================================================
   TRENCHES 1917: UI CONTROLLER & EVENT HANDLERS
   ========================================================================== */

class UIController {
    constructor() {
        this.engine = null;

        // Screen Elements
        this.menuScreen = null;
        this.battleScreen = null;

        // HUD Elements
        this.starsText = null;
        this.killsProgressText = null;
        this.xpText = null;
        this.specialistsText = null;
        this.rifleCountText = null;
        this.skirmCountText = null;
        this.mgCountText = null;
        this.artCountText = null;
        this.engCountText = null;
        this.medCountText = null;
        this.offCountText = null;
        this.cpText = null;
        this.cpBar = null;
        this.moraleText = null;
        this.moraleBar = null;
        this.suppliesText = null;
        this.timeText = null;
        this.playerFlagIcon = null;
        this.playerFactionName = null;
        
        // Build Panel Elements
        this.buildPanel = null;

        // Telegraph Elements
        this.telegraphFeed = null;

        // Tactical Banner
        this.tacticalBanner = null;
        this.bannerTitle = null;
        this.bannerDesc = null;

        // Modals
        this.modals = {};
        this.countryballViewer = null;
        this.mp = null;
    }

    initElements() {
        this.menuScreen = document.getElementById('main-menu');
        this.battleScreen = document.getElementById('battlefield-screen');

        this.starsText = document.getElementById('hud-stars');
        this.killsProgressText = document.getElementById('hud-kills-progress');
        this.xpText = document.getElementById('hud-xp');
        this.specialistsText = document.getElementById('hud-specialists');
        this.rifleCountText = document.getElementById('hud-rifle-count');
        this.skirmCountText = document.getElementById('hud-skirm-count');
        this.mgCountText = document.getElementById('hud-mg-count');
        this.artCountText = document.getElementById('hud-art-count');
        this.engCountText = document.getElementById('hud-eng-count');
        this.medCountText = document.getElementById('hud-med-count');
        this.offCountText = document.getElementById('hud-off-count');

        this.cpText = document.getElementById('hud-cp');
        this.cpBar = document.getElementById('hud-cp-bar');
        this.moraleText = document.getElementById('hud-morale');
        this.moraleBar = document.getElementById('hud-morale-bar');
        this.suppliesText = document.getElementById('hud-supplies');
        this.timeText = document.getElementById('battle-time');

        this.playerFlagIcon = document.getElementById('player-flag-icon');
        this.playerFactionName = document.getElementById('player-faction-name');
        
        this.buildPanel = document.getElementById('build-panel');
        this.telegraphFeed = document.getElementById('telegraph-feed');

        this.tacticalBanner = document.getElementById('tactical-banner');
        this.bannerTitle = document.getElementById('banner-title');
        this.bannerDesc = document.getElementById('banner-desc');

        this.modals = {
            cabinet: document.getElementById('modal-war-cabinet'),
            settings: document.getElementById('modal-settings'),
            credits: document.getElementById('modal-credits'),
            upgrades: document.getElementById('modal-upgrades'),
            faction: document.getElementById('modal-faction-select'),
            matchSettings: document.getElementById('modal-match-settings'),
            countryball: document.getElementById('modal-countryball-viewer'),
            multiplayer: document.getElementById('modal-multiplayer')
        };
    }

    bindEngine(engine) {
        this.initElements();
        this.engine = engine;
        this.engine.subscribe((state) => this.updateHUD(state));
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.initElements();

        // START BATTLE — open faction modal
        const startBtn = document.getElementById('btn-start-battle');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.openModal('faction');
            });
        }

        this.setupMultiplayerUI();

        // FACTION & COUNTRY CARDS SELECTION HANDLERS -> Transition to Match Settings
        document.querySelectorAll('.faction-card-btn[data-faction]').forEach(card => {
            card.addEventListener('click', () => {
                this.pendingFaction = card.getAttribute('data-faction');
                this.pendingCountry = card.getAttribute('data-country') || 'uk';

                const flags = { uk: '🇬🇧', canada: '🇨🇦', france: '🇫🇷', usa: '🇺🇸', soviet: '🛠️', germany: '🇩🇪', austria: '🇦🇹', ottoman: '🇹🇷' };
                const titles = {
                    uk: 'UNITED KINGDOM (BRITISH ARMED FORCES)',
                    canada: 'CANADA (CANADIAN ARMED FORCES)',
                    france: 'FRANCE (FRENCH ARMED FORCES)',
                    usa: 'UNITED STATES (US ARMY / AMERICAN FORCES)',
                    soviet: 'SOVIET UNION (RED ARMY)',
                    germany: 'GERMAN ARMED FORCES',
                    austria: 'AUSTRO-HUNGARIAN FORCES',
                    ottoman: 'OTTOMAN ARMED FORCES'
                };
                const badgeEl = document.getElementById('match-settings-country-badge');
                if (badgeEl) {
                    badgeEl.innerText = `${flags[this.pendingCountry] || ''} ${titles[this.pendingCountry] || this.pendingFaction.toUpperCase()}`;
                }

                this.closeAllModals();
                this.openModal('matchSettings');
            });
        });

        // PRE-BATTLE MATCH SETTINGS CONTROLS
        this.selectedMode = 'checkpoints';
        this.selectedWeather = 'fog';
        this.selectedGarrison = '25';

        document.querySelectorAll('#setting-gamemode-options .setting-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#setting-gamemode-options .setting-option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedMode = btn.getAttribute('data-mode');
            });
        });

        document.querySelectorAll('#setting-weather-options .setting-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#setting-weather-options .setting-option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedWeather = btn.getAttribute('data-weather');
            });
        });

        document.querySelectorAll('#setting-garrison-options .setting-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#setting-garrison-options .setting-option-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedGarrison = btn.getAttribute('data-garrison');
            });
        });

        // Disaster Frequency Slider
        this.selectedDisasterFrequency = '50';
        const disasterSlider = document.getElementById('setting-disaster-slider');
        const disasterLabel = document.getElementById('setting-disaster-label');
        if (disasterSlider) {
            disasterSlider.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10);
                this.selectedDisasterFrequency = String(val);
                if (disasterLabel) {
                    if (val === 0) disasterLabel.innerText = 'OFF (0%)';
                    else if (val === 100) disasterLabel.innerText = 'CONSTANT (100%)';
                    else if (val >= 80) disasterLabel.innerText = `HIGH (${val}%)`;
                    else if (val <= 30) disasterLabel.innerText = `LOW (${val}%)`;
                    else disasterLabel.innerText = `MODERATE (${val}%)`;
                }
            });
        }

        const commenceBtn = document.getElementById('btn-commence-battle');
        if (commenceBtn) {
            commenceBtn.addEventListener('click', () => {
                const matchOptions = {
                    gameMode: this.selectedMode || 'checkpoints',
                    weather: this.selectedWeather || 'fog',
                    startingMen: this.selectedGarrison || '25',
                    disasterFrequency: this.selectedDisasterFrequency || '50'
                };

                this.closeAllModals();
                this.switchScreen('battle');
                if (this.engine) {
                    this.engine.resetBattle(this.pendingFaction || 'entente', this.pendingCountry || 'uk', matchOptions);
                }
            });
        }

        const returnBtn = document.getElementById('btn-return-menu');
        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                if (this.engine) this.engine.pause();
                this.switchScreen('menu');
                this.syncGuestGfxControls();
            });
        }

        // BUILD PANEL TOGGLES
        const buildToggleBtn = document.getElementById('btn-toggle-build-panel');
        if (buildToggleBtn) {
            buildToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleBuildPanel();
            });
        }

        const closeBuildBtn = document.getElementById('btn-close-build');
        if (closeBuildBtn) {
            closeBuildBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideBuildPanel();
            });
        }

        if (this.buildPanel) {
            this.buildPanel.addEventListener('mousedown', (e) => e.stopPropagation());
            this.buildPanel.addEventListener('click', (e) => e.stopPropagation());
        }

        const guestGfxBtn = document.getElementById('btn-guest-gfx');
        if (guestGfxBtn) {
            guestGfxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleGuestGfxMode();
            });
        }

        const guestGfxSelect = document.getElementById('setting-guest-gfx');
        if (guestGfxSelect) {
            guestGfxSelect.addEventListener('change', () => {
                this.applyGuestGfxMode(guestGfxSelect.value === 'lite');
            });
        }

        const buildArtilleryBtn = document.getElementById('btn-build-artillery');
        if (buildArtilleryBtn) {
            buildArtilleryBtn.addEventListener('click', () => {
                if (!this.engine || !this.engine.renderer) return;

                if (this.engine.state.commandPoints < 30) {
                    if (this.engine) this.engine.notifyTelegraph("INSUFFICIENT CP: Field Artillery Gun requires 30 CP!", true);
                    return;
                }

                if (this.engine.state.engineerCount <= 0) {
                    if (this.engine) this.engine.notifyTelegraph("NO ENGINEERS: You need at least 1 available Engineer in Reserve!", true);
                    return;
                }

                this.engine.state.commandPoints -= 30;
                this.engine.renderer.enableBuildMode('artillery_gun');
                this.hideBuildPanel();

                this.triggerBannerNotification('build_artillery');
            });
        }

        // UPGRADES MODAL & TABS
        const openUpgradesBtn = document.getElementById('btn-open-upgrades');
        if (openUpgradesBtn) {
            openUpgradesBtn.addEventListener('click', () => this.openModal('upgrades'));
        }

        document.querySelectorAll('.tab-btn[data-tab]').forEach(tabBtn => {
            tabBtn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                tabBtn.classList.add('active');

                const tabTarget = tabBtn.getAttribute('data-tab');
                document.querySelectorAll('.tab-content').forEach(c => {
                    c.classList.remove('active');
                    c.classList.add('hidden');
                });
                const targetEl = document.getElementById(`tab-${tabTarget}`);
                if (targetEl) {
                    targetEl.classList.remove('hidden');
                    targetEl.classList.add('active');
                    this.resetUpgradeDivisionView(tabTarget);
                }
            });
        });

        // Division → sub-branch navigation
        document.querySelectorAll('.upgrade-sub-btn[data-branch]').forEach(btn => {
            btn.addEventListener('click', () => {
                const division = btn.getAttribute('data-division');
                const branch = btn.getAttribute('data-branch');
                this.showUpgradeBranch(division, branch);
            });
        });

        document.querySelectorAll('.upgrade-back-btn[data-back]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.resetUpgradeDivisionView(btn.getAttribute('data-back'));
            });
        });

        // BUY UPGRADE BUTTONS
        document.querySelectorAll('.upgrade-buy-btn[data-upgrade]').forEach(buyBtn => {
            buyBtn.addEventListener('click', () => {
                const key = buyBtn.getAttribute('data-upgrade');
                const costs = {
                    mgTier1: 500, mgTier2: 1000, mgTier3: 1500,
                    officerTier1: 500,
                    rifleTier1: 500, rifleTier2: 1000, rifleTier3: 1500
                };
                const cost = costs[key] || 500;
                
                if (this.engine) {
                    this.engine.buyUpgrade(key, cost);
                }
            });
        });

        // MODALS
        const cabinetBtn = document.getElementById('btn-war-cabinet');
        if (cabinetBtn) cabinetBtn.addEventListener('click', () => this.openModal('cabinet'));

        const cbViewerBtn = document.getElementById('btn-countryball-viewer');
        if (cbViewerBtn) {
            cbViewerBtn.addEventListener('click', () => this.openModal('countryball'));
        }
        
        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openModal('settings'));
        
        const creditsBtn = document.getElementById('btn-credits');
        if (creditsBtn) creditsBtn.addEventListener('click', () => this.openModal('credits'));

        // Countryball viewer controls
        const cbCountry = document.getElementById('cb-viewer-country');
        const cbRole = document.getElementById('cb-viewer-role');
        const cbZoom = document.getElementById('cb-viewer-zoom');
        if (cbCountry) {
            cbCountry.addEventListener('change', () => {
                if (this.countryballViewer) this.countryballViewer.setCountry(cbCountry.value);
            });
        }
        if (cbRole) {
            cbRole.addEventListener('change', () => {
                if (this.countryballViewer) this.countryballViewer.setRole(cbRole.value);
            });
        }
        if (cbZoom) {
            cbZoom.addEventListener('input', () => {
                if (this.countryballViewer) this.countryballViewer.setScale(parseFloat(cbZoom.value));
            });
        }

        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // SPEED CONTROLS
        document.querySelectorAll('.speed-btn[data-speed]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.speed-btn[data-speed]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const speed = parseFloat(btn.getAttribute('data-speed'));
                if (this.engine) this.engine.setSpeed(speed);
            });
        });

        const pauseBtn = document.getElementById('btn-pause-battle');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (!this.engine) return;
                if (this.engine.state.isPaused) {
                    this.engine.resume();
                    pauseBtn.innerText = '⏸️';
                } else {
                    this.engine.pause();
                    pauseBtn.innerText = '▶️';
                }
            });
        }

        // ORDER BUTTON DECK
        document.querySelectorAll('.order-btn[data-order]').forEach(btn => {
            btn.addEventListener('click', () => {
                const order = btn.getAttribute('data-order');
                const cost = parseInt(btn.getAttribute('data-cost') || 0, 10);
                
                if (this.engine) {
                    const result = this.engine.executeOrder(order, cost);
                    if (result.success) {
                        this.triggerBannerNotification(order);
                    }
                }
            });
        });
    }

    switchScreen(screenName) {
        this.initElements();
        if (screenName === 'battle') {
            if (this.menuScreen) {
                this.menuScreen.classList.remove('active');
                this.menuScreen.classList.add('hidden');
            }
            if (this.battleScreen) {
                this.battleScreen.classList.remove('hidden');
                this.battleScreen.classList.add('active');
            }

            if (this.engine && this.engine.renderer) {
                this.engine.renderer.resize();
                // Layout may settle after display:none → visible; resize again next frames
                requestAnimationFrame(() => {
                    this.engine.renderer.resize();
                    requestAnimationFrame(() => this.engine.renderer.resize());
                });
            }
        } else {
            if (this.battleScreen) {
                this.battleScreen.classList.remove('active');
                this.battleScreen.classList.add('hidden');
            }
            if (this.menuScreen) {
                this.menuScreen.classList.remove('hidden');
                this.menuScreen.classList.add('active');
            }
        }
    }

    openModal(modalKey) {
        this.initElements();
        this.hideBuildPanel();
        this.uiBusy = true;
        if (this.engine && this.engine.renderer && this.engine.renderer.camera) {
            this.engine.renderer.camera.isDragging = false;
        }
        if (this.modals[modalKey]) {
            const el = this.modals[modalKey];
            el.classList.remove('hidden');
            // Double rAF so CSS transition + display settle (stops guest panel flicker)
            requestAnimationFrame(() => {
                el.classList.add('active');
                requestAnimationFrame(() => {
                    el.classList.add('active');
                    el.style.pointerEvents = 'auto';
                });
            });
        }
        if (modalKey === 'upgrades') {
            this.resetUpgradeDivisionView('firepower');
            this.resetUpgradeDivisionView('personnel');
            // show firepower tab as default
            document.querySelectorAll('.tab-btn[data-tab]').forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-tab') === 'firepower');
            });
            document.querySelectorAll('.tab-content').forEach(c => {
                c.classList.remove('active');
                c.classList.add('hidden');
            });
            const fire = document.getElementById('tab-firepower');
            if (fire) {
                fire.classList.remove('hidden');
                fire.classList.add('active');
            }
        }
        if (modalKey === 'countryball') {
            if (!this.countryballViewer && window.CountryballViewer) {
                this.countryballViewer = new window.CountryballViewer('cb-viewer-canvas');
            }
            const countrySel = document.getElementById('cb-viewer-country');
            const roleSel = document.getElementById('cb-viewer-role');
            const zoomSel = document.getElementById('cb-viewer-zoom');
            if (this.countryballViewer) {
                if (countrySel) this.countryballViewer.setCountry(countrySel.value);
                if (roleSel) this.countryballViewer.setRole(roleSel.value);
                if (zoomSel) this.countryballViewer.setScale(parseFloat(zoomSel.value));
                this.countryballViewer.draw();
            }
        }
    }

    resetUpgradeDivisionView(divisionId) {
        const tab = document.getElementById(`tab-${divisionId}`);
        if (!tab) return;
        tab.querySelectorAll('.upgrade-view').forEach(view => {
            const isPicker = view.getAttribute('data-view') === 'picker';
            view.classList.toggle('hidden', !isPicker);
        });
    }

    showUpgradeBranch(divisionId, branchId) {
        const tab = document.getElementById(`tab-${divisionId}`);
        if (!tab) return;
        tab.querySelectorAll('.upgrade-view').forEach(view => {
            const match = view.getAttribute('data-view') === branchId;
            view.classList.toggle('hidden', !match);
        });
    }

    closeAllModals() {
        this.uiBusy = false;
        Object.values(this.modals).forEach(m => {
            if (!m) return;
            m.classList.remove('active');
            m.classList.add('hidden');
            m.style.pointerEvents = '';
        });
    }

    toggleBuildPanel() {
        this.initElements();
        if (!this.buildPanel) return;
        if (this.buildPanel.classList.contains('open')) this.hideBuildPanel();
        else this.showBuildPanel();
    }

    showBuildPanel() {
        this.initElements();
        if (!this.buildPanel) return;
        this.uiBusy = true;
        if (this.engine && this.engine.renderer && this.engine.renderer.camera) {
            this.engine.renderer.camera.isDragging = false;
        }
        this.buildPanel.classList.remove('hidden');
        this.buildPanel.classList.add('open');
    }

    hideBuildPanel() {
        if (!this.buildPanel) this.buildPanel = document.getElementById('build-panel');
        if (!this.buildPanel) return;
        this.buildPanel.classList.remove('open');
        this.buildPanel.classList.add('hidden');
        // Keep uiBusy if a modal is still open
        const modalOpen = Object.values(this.modals || {}).some(m => m && m.classList.contains('active'));
        if (!modalOpen) this.uiBusy = false;
    }

    toggleGuestGfxMode() {
        if (!this.engine || !this.engine.renderer || !this.engine.isMpGuest()) return;
        const nextLite = !this.engine.renderer.isGuestLite();
        this.applyGuestGfxMode(nextLite);
    }

    applyGuestGfxMode(lite) {
        if (!this.engine || !this.engine.renderer) return;
        this.engine.renderer.setGuestRenderLite(!!lite);
        this.syncGuestGfxControls();
        if (this.engine.notifyTelegraph) {
            this.engine.notifyTelegraph(
                lite
                    ? 'GRAPHICS: LITE mode — smoother on this device.'
                    : 'GRAPHICS: NORMAL mode — full battlefield visuals.',
                true
            );
        }
    }

    syncGuestGfxControls() {
        const isGuest = !!(this.engine && this.engine.isMpGuest && this.engine.isMpGuest());
        const btn = document.getElementById('btn-guest-gfx');
        const label = document.getElementById('btn-guest-gfx-label');
        const row = document.getElementById('setting-guest-gfx-row');
        const hint = document.getElementById('setting-guest-gfx-hint');
        const select = document.getElementById('setting-guest-gfx');
        const lite = !!(this.engine && this.engine.renderer && this.engine.renderer.isGuestLite());

        if (btn) btn.classList.toggle('hidden', !isGuest);
        if (label) label.textContent = lite ? '⚡ LITE' : '🎞 NORMAL';
        if (row) row.classList.toggle('hidden', !isGuest);
        if (hint) hint.classList.toggle('hidden', !isGuest);
        if (select) select.value = lite ? 'lite' : 'normal';
    }

    updateHUD(state) {
        this.initElements();

        // While a panel/modal is open, only refresh critical meters (stops guest panel flicker)
        const lightHud = !!this.uiBusy;

        // Player Country Flag & Badge Title
        const flags = { uk: '🇬🇧', canada: '🇨🇦', france: '🇫🇷', usa: '🇺🇸', soviet: '🛠️', germany: '🇩🇪', austria: '🇦🇹', ottoman: '🇹🇷' };
        const titles = {
            uk: 'UNITED KINGDOM (BRITISH ARMED FORCES)',
            canada: 'CANADA (CANADIAN ARMED FORCES)',
            france: 'FRANCE (FRENCH ARMED FORCES)',
            usa: 'UNITED STATES (US ARMY / AMERICAN FORCES)',
            soviet: 'SOVIET UNION (RED ARMY)',
            germany: 'GERMAN ARMED FORCES',
            austria: 'AUSTRO-HUNGARIAN FORCES',
            ottoman: 'OTTOMAN ARMED FORCES'
        };

        if (this.playerFlagIcon) this.playerFlagIcon.innerText = flags[state.playerCountry] || (state.playerFaction === 'entente' ? '🇬🇧' : '🇩🇪');
        if (this.playerFactionName) this.playerFactionName.innerText = titles[state.playerCountry] || (state.playerFaction === 'entente' ? 'ENTENTE EXPEDITIONARY' : 'CENTRAL POWERS');

        // Command Stars, Kills Progress & Command XP
        if (this.starsText) this.starsText.innerText = `${state.stars} ⭐`;
        if (this.killsProgressText) this.killsProgressText.innerText = `(${state.killsProgress}/5 Kills)`;
        if (this.xpText) this.xpText.innerText = `${Math.floor(state.xp)} XP`;
        
        // Specialist Reserve Stock
        if (this.specialistsText) this.specialistsText.innerText = `${state.machineGunnerCount} MG | ${state.engineerCount} ENG | ${state.artilleryCount} ART | ${state.medicCount} MED | ${state.officerCount} OFF`;

        // HQ Stream Pipeline Counts
        if (this.rifleCountText) this.rifleCountText.innerText = `Active: ${state.activeRiflemanPipelines}`;
        if (this.skirmCountText) this.skirmCountText.innerText = `Active: ${state.activeSkirmisherPipelines || 0}`;
        if (this.mgCountText) this.mgCountText.innerText = `Active: ${state.activeMGPipelines}`;
        if (this.artCountText) this.artCountText.innerText = `Active: ${state.activeArtilleryPipelines}`;
        if (this.engCountText) this.engCountText.innerText = `Active: ${state.activeEngineerPipelines}`;
        if (this.medCountText) this.medCountText.innerText = `Active: ${state.activeMedicPipelines}`;

        if (this.offCountText) {
            if (!state.unlockedUpgrades.officerTier1) {
                this.offCountText.innerText = 'LOCKED (Requires Tech)';
            } else if (state.officerCooldown > 0) {
                this.offCountText.innerText = `Wait ${Math.ceil(state.officerCooldown)}s`;
            } else {
                this.offCountText.innerText = `Active: ${state.officerCount}`;
            }
        }

        // CP Update
        const cpVal = Math.floor(state.commandPoints);
        if (this.cpText) this.cpText.innerText = `${cpVal} / ${state.maxCommandPoints}`;
        if (this.cpBar) this.cpBar.style.width = `${(cpVal / state.maxCommandPoints) * 100}%`;

        // Morale Update
        const moraleVal = Math.floor(state.morale);
        if (this.moraleText) this.moraleText.innerText = `${moraleVal}%`;
        if (this.moraleBar) this.moraleBar.style.width = `${moraleVal}%`;

        // Time & Disaster Badge Update
        if (this.timeText) this.timeText.innerText = this.engine ? this.engine.getFormattedTime() : '06:00 HOURS';

        const disasterBox = document.getElementById('hud-disaster-box');
        const disasterIcon = document.getElementById('hud-disaster-icon');
        const disasterTimer = document.getElementById('hud-disaster-timer');
        if (disasterBox) {
            if (state.activeDisaster) {
                disasterBox.classList.remove('hidden');
                if (disasterIcon) disasterIcon.innerText = state.activeDisaster.icon || '☣️';
                if (disasterTimer) disasterTimer.innerText = `${state.activeDisaster.title} (${Math.ceil(state.activeDisaster.durationRemaining)}s)`;
            } else {
                disasterBox.classList.add('hidden');
            }
        }

        if (lightHud) return; // skip CP-dot churn / button disable thrash while panels open

        // Capture Point HUD Dots (Checkpoints vs King of the Hill)
        if (this.engine && this.engine.renderer && this.engine.renderer.capturePoints && this.engine.renderer.capturePoints.length > 0) {
            const cps = this.engine.renderer.capturePoints;
            const isKoth = cps.length === 1;

            const cp1 = document.getElementById('cp-1');
            const cp2 = document.getElementById('cp-2');
            const arrows = document.querySelectorAll('.cp-arrow');

            if (cp1) cp1.classList.toggle('hidden', isKoth);
            if (cp2) cp2.classList.toggle('hidden', isKoth);
            arrows.forEach(a => a.classList.toggle('hidden', isKoth));

            cps.forEach((cp, i) => {
                const dot = document.getElementById(`cp-dot-${i}`);
                const indicator = document.getElementById(`cp-${i}`);
                const label = document.getElementById(`cp-label-${i}`);
                if (!dot || !indicator) return;

                if (label) label.innerText = cp.label || (isKoth ? 'HILL-100' : `C-${i + 1}`);

                const inRange = this.engine.renderer.units.filter(u =>
                    u.hp > 0 && (u.type === 'rifleman' || u.type === 'skirmisher') && Math.abs(u.x - cp.x) < 45
                );
                const hasEntente = inRange.some(u => u.faction === 'entente');
                const hasCentral = inRange.some(u => u.faction === 'central');
                const contested  = hasEntente && hasCentral;

                dot.innerText = cp.owner === 'entente' ? '🔵' : cp.owner === 'central' ? '🔴' : '⚪';
                indicator.className = 'cp-indicator' +
                    (contested ? ' contested' :
                     cp.owner === 'entente' ? ' owned-entente' :
                     cp.owner === 'central'  ? ' owned-central'  : '');
            });
        }

        // Enable/Disable Star Buttons
        document.querySelectorAll('.order-btn[data-cost-star]').forEach(btn => {
            const starCost = parseInt(btn.getAttribute('data-cost-star'), 10);
            if (btn.getAttribute('data-order') === 'buy_officer_stream') {
                btn.disabled = state.stars < 10 || !state.unlockedUpgrades.officerTier1 || state.officerCooldown > 0;
            } else {
                btn.disabled = state.stars < starCost;
            }
        });

        document.querySelectorAll('.order-btn[data-cost]').forEach(btn => {
            const order = btn.getAttribute('data-order');
            const cost = parseInt(btn.getAttribute('data-cost') || '0', 10);
            if (order === 'charge' || order === 'reinforce' || order === 'dig_in' || order === 'fallback') {
                btn.disabled = state.commandPoints < cost;
            }
        });

        // Enable/Disable Upgrade Buttons inside Modal
        const costs = {
            mgTier1: 500, mgTier2: 1000, mgTier3: 1500,
            officerTier1: 500,
            rifleTier1: 500, rifleTier2: 1000, rifleTier3: 1500
        };

        const prereqs = {
            mgTier2: 'mgTier1',
            mgTier3: 'mgTier2',
            rifleTier2: 'rifleTier1',
            rifleTier3: 'rifleTier2'
        };

        document.querySelectorAll('.upgrade-buy-btn[data-upgrade]').forEach(buyBtn => {
            const key = buyBtn.getAttribute('data-upgrade');
            const cost = costs[key] || 500;
            const isUnlocked = state.unlockedUpgrades[key];
            const reqKey = prereqs[key];
            const isReqMet = !reqKey || state.unlockedUpgrades[reqKey];

            if (isUnlocked) {
                buyBtn.innerText = "UNLOCKED ✓";
                buyBtn.disabled = true;
            } else if (!isReqMet) {
                const reqNames = {
                    mgTier1: "MG Tier One",
                    mgTier2: "MG Tier Two",
                    rifleTier1: "Rifleman Tier One",
                    rifleTier2: "Rifleman Tier Two"
                };
                buyBtn.innerText = `REQUIRES ${reqNames[reqKey] || reqKey}`;
                buyBtn.disabled = true;
            } else {
                buyBtn.innerText = `BUY UPGRADE (${cost} XP)`;
                buyBtn.disabled = state.xp < cost;
            }
        });
    }

    addTelegraphDispatch(text, isUrgent = false) {
        this.initElements();
        if (!this.telegraphFeed) return;
        const entry = document.createElement('span');
        entry.className = `dispatch-entry ${isUrgent ? 'urgent' : ''}`;
        const timestamp = this.engine ? this.engine.getFormattedTime().split(' ')[0] : '06:00';
        entry.innerText = `[${timestamp}] ${text}`;

        this.telegraphFeed.innerHTML = '';
        this.telegraphFeed.appendChild(entry);
    }

    triggerCustomBanner(title, desc) {
        this.initElements();
        if (this.bannerTitle) this.bannerTitle.innerText = title;
        if (this.bannerDesc) this.bannerDesc.innerText = desc;

        if (this.tacticalBanner) {
            this.tacticalBanner.classList.remove('hidden');
            setTimeout(() => {
                this.tacticalBanner.classList.add('hidden');
            }, 3500);
        }
    }

    triggerBannerNotification(order) {
        this.initElements();
        const pCountry = this.engine ? this.engine.state.playerCountry : 'uk';
        const teamTitles = {
            uk: "BRITISH ARMED FORCES",
            canada: "CANADIAN ARMED FORCES",
            france: "FRENCH ARMED FORCES",
            usa: "US ARMY",
            soviet: "RED ARMY",
            germany: "GERMAN ARMED FORCES",
            austria: "AUSTRO-HUNGARIAN FORCES",
            ottoman: "OTTOMAN ARMED FORCES"
        };
        const teamName = teamTitles[pCountry] || 'HIGH COMMAND';

        const banners = {
            buy_rifleman_stream: { title: "HQ REINFORCEMENT STREAM", desc: "1 New Rifleman dispatched from HQ every 10 seconds (1 ⭐)" },
            buy_skirmisher_stream: { title: "SKIRMISHER STREAM", desc: "1 Skirmisher / 10s — shotgun + 3 grenades (2 ⭐)" },
            buy_mg_stream: { title: "MACHINE GUNNER STREAM", desc: "1 New Machine Gunner dispatched to Reserve every 10 seconds (2 ⭐)" },
            buy_artillery_stream: { title: "ARTILLERY BATTERY STREAM", desc: "1 New Artillery Man dispatched to Reserve every 10 seconds (3 ⭐)" },
            buy_engineer_stream: { title: "ENGINEER CORPS STREAM", desc: "1 New Engineer dispatched to Reserve every 10 seconds (3 ⭐)" },
            buy_medic_stream: { title: "FIELD MEDIC STREAM", desc: "1 New Medic dispatched to Reserve every 10 seconds (3 ⭐)" },
            buy_officer_stream: { title: "FIELD OFFICER DISPATCHED", desc: "1 Field Officer dispatched from HQ! (10 ⭐, 60s limit)" },
            build_mg: { title: "ENGINEERING PLACEMENT", desc: "Click anywhere on the battlefield to construct a Machine Gun Nest (60s)!" },
            build_artillery: { title: "FIELD ARTILLERY PLACEMENT", desc: "Click anywhere on the battlefield to construct a Field Artillery Gun (90s)!" },
            charge: { title: `${teamName} IS CHARGING!`, desc: "Cascade: 80% from each owned line advances one trench forward!" },
            reinforce: { title: `${teamName} REINFORCEMENTS`, desc: "20% hold main trench; 80% split evenly across owned Charlie lines (100%/50%/~33%)" },
            dig_in: { title: "FORTIFYING POSITIONS", desc: "Soldiers reinforcing sandbags and wire posts" },
            fallback: { title: "RETREAT TO TRENCH COVER", desc: "Tactical withdrawal to friendly trench cover" }
        };

        const info = banners[order] || { title: "ORDER ISSUED", desc: "High Command directive dispatched" };
        this.triggerCustomBanner(info.title, info.desc);
    }

    setupMultiplayerUI() {
        if (this._mpBound) return;
        this._mpBound = true;

        if (!this.mp && window.MpClient) {
            this.mp = new window.MpClient();
            this.mp.onError = (message) => this.setMpStatus(message, true);
            this.mp.onRoomState = (room) => this.renderMpLobby(room);
            this.mp.onMatchStart = (msg) => {
                this.beginMultiplayerBattle(msg);
            };
            this.mp.onConnectionChange = (ok) => {
                if (!ok) this.setMpStatus('Disconnected from HQ wire.', true);
            };
        }

        const mpBtn = document.getElementById('btn-multiplayer');
        if (mpBtn) {
            mpBtn.addEventListener('click', async () => {
                this.openModal('multiplayer');
                this.showMpGate();
                this.setMpStatus(`Connecting to ${this.mp.defaultUrl} …`);
                try {
                    await this.mp.connect();
                    this.setMpStatus('Connected. Create a room or enter a 5-digit code to join.');
                    this.showMpGate();
                } catch (err) {
                    this.setMpStatus(err.message || 'Could not connect. Run: npm start', true);
                }
            });
        }

        const createBtn = document.getElementById('btn-mp-create');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                const name = document.getElementById('mp-player-name')?.value || 'Host';
                this.mp.createRoom(name);
            });
        }

        const joinBtn = document.getElementById('btn-mp-join');
        if (joinBtn) {
            joinBtn.addEventListener('click', () => {
                const code = document.getElementById('mp-join-code')?.value || '';
                const name = document.getElementById('mp-player-name')?.value || 'Commander';
                if (!/^\d{5}$/.test(code.trim())) {
                    this.setMpStatus('Enter a valid 5-digit room code.', true);
                    return;
                }
                this.mp.joinRoom(code, name);
            });
        }

        const joinInput = document.getElementById('mp-join-code');
        if (joinInput) {
            joinInput.addEventListener('input', () => {
                joinInput.value = joinInput.value.replace(/\D/g, '').slice(0, 5);
            });
        }

        document.querySelectorAll('.mp-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.mp.isHost()) return;
                const mode = btn.getAttribute('data-mode');
                this.mp.setMode(mode);
            });
        });

        const readyBtn = document.getElementById('btn-mp-ready');
        if (readyBtn) {
            readyBtn.addEventListener('click', () => {
                const me = this.mp.room?.players?.find(p => p.id === this.mp.playerId);
                this.mp.setReady(!(me && me.ready));
            });
        }

        const startBtn = document.getElementById('btn-mp-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.mp.startMatch());
        }

        const leaveBtn = document.getElementById('btn-mp-leave');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => {
                this.mp.leaveRoom();
                this.showMpGate();
                this.setMpStatus('Left room. Create or join again.');
            });
        }

        const copyBtn = document.getElementById('btn-mp-copy-code');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const code = document.getElementById('mp-room-code')?.textContent;
                if (!code || code === '-----') return;
                try {
                    await navigator.clipboard.writeText(code);
                    this.setMpStatus(`Copied room code ${code}`);
                } catch {
                    this.setMpStatus(`Room code: ${code}`);
                }
            });
        }
    }

    setMpStatus(text, isError = false) {
        const el = document.getElementById('mp-status');
        if (!el) return;
        el.textContent = text;
        el.style.color = isError ? '#c45c4a' : '';
    }

    showMpGate() {
        const gate = document.getElementById('mp-gate');
        const lobby = document.getElementById('mp-lobby');
        if (gate) gate.classList.remove('hidden');
        if (lobby) lobby.classList.add('hidden');
    }

    showMpLobby() {
        const gate = document.getElementById('mp-gate');
        const lobby = document.getElementById('mp-lobby');
        if (gate) gate.classList.add('hidden');
        if (lobby) lobby.classList.remove('hidden');
    }

    renderMpLobby(room) {
        if (!room) {
            this.showMpGate();
            return;
        }
        this.showMpLobby();

        const codeEl = document.getElementById('mp-room-code');
        if (codeEl) codeEl.textContent = room.code;

        const isHost = this.mp.isHost();
        const hostSettings = document.getElementById('mp-host-settings');
        const modeReadonly = document.getElementById('mp-mode-readonly');
        if (hostSettings) hostSettings.classList.toggle('hidden', !isHost);
        if (modeReadonly) modeReadonly.classList.toggle('hidden', isHost);
        const modeLabel = document.getElementById('mp-mode-label');
        if (modeLabel) modeLabel.textContent = room.mode;

        document.querySelectorAll('.mp-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === room.mode);
        });

        const list = document.getElementById('mp-player-list');
        if (list) {
            list.innerHTML = '';
            (room.players || []).forEach(p => {
                const li = document.createElement('li');
                if (p.id === this.mp.playerId) li.classList.add('mp-you');
                const hostTag = p.id === room.hostId ? ' ★HOST' : '';
                const readyTag = p.ready ? ' ✓ READY' : ' …';
                const country = p.country ? p.country.toUpperCase() : 'no country';
                li.textContent = `${p.name}${hostTag} — ${country}${readyTag}`;
                list.appendChild(li);
            });
        }

        const flags = {
            uk: '🇬🇧', canada: '🇨🇦', france: '🇫🇷', usa: '🇺🇸',
            germany: '🇩🇪', austria: '🇦🇹', ottoman: '🇹🇷'
        };
        const grid = document.getElementById('mp-country-grid');
        const me = (room.players || []).find(p => p.id === this.mp.playerId);
        const taken = new Set(room.takenCountries || []);
        if (grid) {
            grid.innerHTML = '';
            const catalog = this.mp.countries.length
                ? this.mp.countries
                : [
                    { id: 'uk', faction: 'entente', label: 'United Kingdom' },
                    { id: 'canada', faction: 'entente', label: 'Canada' },
                    { id: 'france', faction: 'entente', label: 'France' },
                    { id: 'usa', faction: 'entente', label: 'United States' },
                    { id: 'germany', faction: 'central', label: 'Germany' },
                    { id: 'austria', faction: 'central', label: 'Austria-Hungary' },
                    { id: 'ottoman', faction: 'central', label: 'Ottoman Empire' }
                ];
            catalog.forEach(c => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'mp-country-btn';
                btn.textContent = `${flags[c.id] || ''} ${c.label}`;
                const mine = me && me.country === c.id;
                const blocked = taken.has(c.id) && !mine;
                if (mine) btn.classList.add('selected');
                btn.disabled = blocked || room.started;
                btn.addEventListener('click', () => this.mp.pickCountry(c.id));
                grid.appendChild(btn);
            });
        }

        const readyBtn = document.getElementById('btn-mp-ready');
        if (readyBtn && me) {
            readyBtn.textContent = me.ready ? 'UNREADY' : 'READY';
        }

        const startBtn = document.getElementById('btn-mp-start');
        if (startBtn) {
            startBtn.classList.toggle('hidden', !isHost);
        }

        this.setMpStatus(
            isHost
                ? `Hosting ${room.code} — mode follows countries (same alliance = CO-OP). Ready then START.`
                : `In room ${room.code} — pick country & ready. Host starts. Mode: ${room.mode}.`
        );
    }

    beginMultiplayerBattle(msg) {
        const room = msg.room;
        const me = (room.players || []).find(p => p.id === this.mp.playerId);
        if (!me || !me.faction || !me.country) {
            this.setMpStatus('Match started but your seat has no country.', true);
            return;
        }

        const isHost = room.hostId === this.mp.playerId;
        const roster = (room.players || []).map(p => ({
            id: p.id,
            name: p.name,
            country: p.country,
            faction: p.faction
        }));

        this.closeAllModals();
        this.switchScreen('battle');

        if (this.engine) {
            this.engine.mpClient = this.mp;
            // Mixed alliances (e.g. 2 Entente + 1 Central) must be versus — never AI on a human side
            const factionsPresent = new Set(roster.map(p => p.faction));
            const mode = factionsPresent.size > 1 ? 'versus' : (room.mode || 'coop');
            this.engine.mpSession = {
                active: true,
                isHost,
                hostId: room.hostId,
                mode,
                roomCode: room.code,
                playerId: this.mp.playerId,
                players: roster
            };
            this.engine.localPlayerId = this.mp.playerId;

            if (this.engine.renderer) {
                this.engine.renderer.mpRoster = roster;
                this.engine.renderer.mpGuestView = !isHost;
                if (!isHost) {
                    this.engine.renderer.loadGuestGfxPreference();
                } else {
                    this.engine.renderer.guestRenderLite = false;
                }
            }

            this.mp.onSnapshot = (snap) => this.engine.applyMpSnapshot(snap);
            this.mp.onFxBurst = (shots) => this.engine.applyMpFxBurst(shots);
            this.mp.onCmd = (fromId, cmd) => this.engine.applyMpCmd(fromId, cmd);
            this.mp.onPeerReady = (remoteId) => {
                if (this.engine && typeof this.engine.notifyTelegraph === 'function') {
                    this.engine.notifyTelegraph(`P2P LINK UP with ${remoteId.slice(0, 8)}… — low-lag sync active.`, true);
                }
                if (isHost) this.engine.broadcastMpSnapshot({ includeBodies: true });
            };

            // Host runs the shared sim; guest waits for snapshots
            this.engine.resetBattle(me.faction, me.country);
            if (!this.engine.shouldRunEnemyAI()) {
                this.engine.state.aiRiflemanPipelines = 0;
                this.engine.notifyTelegraph(
                    mode === 'versus'
                        ? 'VERSUS: Enemy AI disabled — human commanders only.'
                        : 'AI disabled on human-held trenches.',
                    true
                );
            }
            if (!isHost && this.engine.renderer) {
                // Clear local random spawn — host snapshot is source of truth
                this.engine.renderer.units = [];
                this.engine.renderer.structures = [];
                this.engine.renderer.deadBodies = [];
                this.engine.renderer._enforceGuestFxCaps();
            }
            if (isHost) {
                this.engine.broadcastMpSnapshot();
            }
            this.engine.notifyStateChange();
            // Ensure canvas size + HUD after battle screen is visible
            requestAnimationFrame(() => {
                if (this.engine && this.engine.renderer) this.engine.renderer.resize();
                this.engine.notifyStateChange();
                this.syncGuestGfxControls();
            });
        }

        this.syncGuestGfxControls();

        const modeLabel = room.mode === 'coop' ? 'CO-OP' : 'VERSUS';
        const allyNames = (room.players || [])
            .filter(p => p.id !== me.id)
            .map(p => `${p.name} (${(p.country || '?').toUpperCase()})`)
            .join(', ');

        this.triggerCustomBanner(
            `${modeLabel} — JOINT FRONT`,
            room.mode === 'coop'
                ? `Shared trench with ${allyNames || 'allies'} — each nation keeps its own sprites.`
                : `Facing ${allyNames || 'the enemy'} on one battlefield.`
        );

        if (this.engine && typeof this.engine.notifyTelegraph === 'function') {
            this.engine.notifyTelegraph(
                isHost
                    ? `MP ${modeLabel}: You are HOST — sim authority. Allies: ${allyNames || 'none'}.`
                    : `MP ${modeLabel}: Synced to host battlefield. You command ${(me.country || '').toUpperCase()}.`,
                true
            );
        }

        console.log('[MP] joint battle', { mode: room.mode, isHost, me, roster });
    }
}

// Global UI Singleton instance
window.UIController = new UIController();
