/**
 * Multiplayer WebSocket endpoint config.
 * - Local: ws://localhost:8765 (npm start → open that URL)
 * - Cloudflare Workers: same-origin /ws when playing on the deploy URL
 * - GitHub Pages / other static hosts: PRODUCTION_WS below
 */
window.TRENCHES_MP = {
    PRODUCTION_WS: 'wss://trenches.henrycui330.workers.dev/ws'
};
