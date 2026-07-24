import { TrenchesLobby } from './lobby.js';

export { TrenchesLobby };

/**
 * Serves static game assets + upgrades WebSocket to Durable Object lobby.
 */
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // WebSocket lobby (same host as the game — works on Cloudflare, not on GitHub Pages alone)
        if (url.pathname === '/ws' || request.headers.get('Upgrade') === 'websocket') {
            const id = env.LOBBY.idFromName('global');
            const stub = env.LOBBY.get(id);
            return stub.fetch(request);
        }

        // Static assets
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        return new Response('Trenches 1917 — assets binding missing', { status: 500 });
    }
};
