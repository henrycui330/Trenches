/**
 * Multiplayer WebSocket endpoint config.
 * - Local: ws://localhost:8765 (npm start → open that URL)
 * - Cloudflare Workers deploy: same-origin /ws (auto)
 * - GitHub Pages / other static hosts: use PRODUCTION_WS below
 */
window.TRENCHES_MP = {
    PRODUCTION_WS: 'wss://trenches-1917.abstracted-fight.workers.dev/ws'
};
