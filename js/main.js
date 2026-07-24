/* ==========================================================================
   TRENCHES 1917: MAIN BOOTSTRAP & SYNTHESIZED SOUND ENGINE
   ========================================================================== */

class AudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.isEnabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
    }

    playWhistle() {
        if (!this.isEnabled) return;
        try {
            const whistleAudio = new Audio('Whistle.mp3');
            whistleAudio.volume = 0.85;
            whistleAudio.play().catch(e => console.log('Whistle playback prevented:', e));
        } catch(e) {
            console.log('Whistle audio error:', e);
        }
    }

    playGunshot() {
        if (!this.isEnabled) return;
        this.init();
        if (!this.ctx) return;

        // Create noise buffer for realistic rifle crack
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
    }

    playArtilleryRumble() {
        if (!this.isEnabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.8);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.9);
    }

    playTelegraphClick() {
        if (!this.isEnabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }
}

// Global Audio Engine Instance
window.AudioEngine = new AudioSynthesizer();

// Application Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Trenches 1917: High Command System...");

    // 1. Initialize Canvas Renderer
    const renderer = new BattlefieldRenderer('battlefield-canvas', 'minimap-canvas');

    // 2. Initialize Game Engine
    const engine = new GameEngine(renderer);

    // 3. Bind UI Controller
    if (window.UIController) {
        window.UIController.bindEngine(engine);
    }

    // Sound toggle listener
    const audioToggle = document.getElementById('setting-audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('change', (e) => {
            window.AudioEngine.isEnabled = e.target.checked;
        });
    }

    // User gesture unlock for Web Audio
    window.addEventListener('click', () => {
        window.AudioEngine.init();
    }, { once: true });
});
