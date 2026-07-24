/* ==========================================================================
   TRENCHES 1917: COUNTRYBALL VIEWER (asset preview utility)
   ========================================================================== */

class CountryballViewer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        this.country = 'france';
        this.role = 'rifleman';
        this.scale = 2.5;

        this.images = {};
        this._loadImages();
    }

    _loadImages() {
        const sources = {
            uk: 'UK123-removebg-preview.png',
            canada: 'canada_countryball_by_bosphore9_by_bosphore9_dfyszme-fullview.png',
            france: 'a-french-countryball-i-drew-some-time-ago-v0-sq9mv8o9c21b1-removebg-preview.png',
            usa: 'OIP__3_-removebg-preview.png',
            germany: '560-5607261_germany-countryballs-ww1-freetoedit-eye-liner-hd-png-removebg-preview.png',
            austria: 'channels4_profile-removebg-preview.png',
            ottoman: 'ottomans-removebg-preview.png',
            rifle: 'KAR98K-removebg-preview.png',
            pistol: 'm1911-removebg-preview.png',
            shotgun: 'remington-removebg-preview.png',
            grenade: 'm67-fragmentation-grenade-3d-model-f7eecd64dd-removebg-preview.png',
            mg: 'mg-08-machine-gun-weapon-weaponry-cannon-transparent-png-2101779-removebg-preview.png',
            artillery: 'artillery!!!!.png'
        };

        Object.entries(sources).forEach(([key, src]) => {
            const img = new Image();
            img.onload = () => this.draw();
            img.src = src;
            this.images[key] = img;
        });
    }

    // Match in-game sprite sizing / flip flags from BattlefieldRenderer._getCountrySprite
    _getCountrySprite(country) {
        const map = {
            uk:      { key: 'uk',      w: 32, h: 48, ox: -16, oy: -24, flip: false, weaponFlip: false },
            canada:  { key: 'canada',  w: 34, h: 34, ox: -17, oy: -17, flip: false, weaponFlip: false },
            france:  { key: 'france',  w: 34, h: 34, ox: -17, oy: -17, flip: false, weaponFlip: false },
            usa:     { key: 'usa',     w: 34, h: 34, ox: -17, oy: -17, flip: false, weaponFlip: false },
            germany: { key: 'germany', w: 84, h: 52, ox: -42, oy: -26, flip: true,  weaponFlip: true  },
            austria: { key: 'austria', w: 50, h: 50, ox: -25, oy: -25, flip: false, weaponFlip: true  },
            ottoman: { key: 'ottoman', w: 50, h: 50, ox: -25, oy: -25, flip: true,  weaponFlip: true  }
        };
        return map[country] || map.uk;
    }

    setCountry(country) {
        this.country = country;
        this.draw();
    }

    setRole(role) {
        this.role = role;
        this.draw();
    }

    setScale(scale) {
        this.scale = scale;
        this.draw();
    }

    getLabel() {
        const countries = {
            uk: 'United Kingdom', canada: 'Canada', france: 'France', usa: 'United States',
            germany: 'Germany', austria: 'Austria-Hungary', ottoman: 'Ottoman Empire'
        };
        const roles = {
            rifleman: 'Rifleman',
            skirmisher: 'Skirmisher',
            machinegunner: 'Machine Gunner',
            officer: 'Officer',
            medic: 'Medic',
            engineer: 'Engineer',
            artilleryman: 'Artilleryman'
        };
        return `${countries[this.country] || this.country} — ${roles[this.role] || this.role}`;
    }

    draw() {
        if (!this.ctx || !this.canvas) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Backdrop
        ctx.clearRect(0, 0, w, h);
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#2a2218');
        grad.addColorStop(1, '#14100c');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Ground strip
        ctx.fillStyle = '#1a1510';
        ctx.fillRect(0, h * 0.72, w, h * 0.28);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(w / 2, h * 0.74, 70 * this.scale / 2.5, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        const sprite = this._getCountrySprite(this.country);
        const ballImg = this.images[sprite.key];
        if (!ballImg || !ballImg.complete || ballImg.naturalWidth === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Loading sprites…', w / 2, h / 2);
            return;
        }

        ctx.save();
        ctx.translate(w / 2, h * 0.55);
        ctx.scale(this.scale, this.scale);

        // Countryball
        if (sprite.flip) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(ballImg, sprite.ox, sprite.oy, sprite.w, sprite.h);
            ctx.restore();
        } else {
            ctx.drawImage(ballImg, sprite.ox, sprite.oy, sprite.w, sprite.h);
        }

        // Weapon / kit overlay by role
        const isFlipped = sprite.weaponFlip;
        if (this.role === 'rifleman' || this.role === 'medic') {
            const rifle = this.images.rifle;
            if (rifle && rifle.complete) {
                ctx.save();
                if (isFlipped) ctx.scale(-1, 1);
                ctx.translate(6, 10);
                ctx.rotate(0.1);
                ctx.drawImage(rifle, 0, -5, 32, 10);
                ctx.restore();
            }
        } else if (this.role === 'skirmisher') {
            const shotgun = this.images.shotgun;
            const grenade = this.images.grenade;
            ctx.save();
            if (isFlipped) ctx.scale(-1, 1);
            ctx.translate(5, 8);
            ctx.rotate(0.08);
            if (shotgun && shotgun.complete && shotgun.naturalWidth > 0) {
                ctx.drawImage(shotgun, 0, -6, 34, 12);
            } else {
                ctx.fillStyle = '#2a241c';
                ctx.fillRect(0, -3, 22, 5);
            }
            ctx.restore();
            for (let g = 0; g < 3; g++) {
                const gx = -12 + g * 10;
                const gy = -24;
                if (grenade && grenade.complete && grenade.naturalWidth > 0) {
                    ctx.drawImage(grenade, gx - 5, gy - 5, 12, 12);
                } else {
                    ctx.fillStyle = '#6b8f3a';
                    ctx.beginPath();
                    ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } else if (this.role === 'machinegunner') {
            const mg = this.images.mg;
            if (mg && mg.complete) {
                ctx.save();
                if (isFlipped) ctx.scale(-1, 1);
                ctx.translate(8, -6);
                ctx.drawImage(mg, 0, 0, 48, 36);
                ctx.restore();
            }
        } else if (this.role === 'artilleryman') {
            const art = this.images.artillery;
            if (art && art.complete) {
                ctx.save();
                ctx.translate(28, -8);
                ctx.drawImage(art, -20, -20, 40, 40);
                ctx.restore();
            }
        } else {
            // officer / engineer — pistol
            const pistol = this.images.pistol;
            if (pistol && pistol.complete) {
                ctx.save();
                if (isFlipped) ctx.scale(-1, 1);
                ctx.translate(4, 8);
                ctx.drawImage(pistol, 0, -4, 18, 12);
                ctx.restore();
            }
        }

        // Role badge
        if (this.role === 'officer') {
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();

        const labelEl = document.getElementById('cb-viewer-label');
        if (labelEl) labelEl.textContent = this.getLabel();
    }
}

window.CountryballViewer = CountryballViewer;
