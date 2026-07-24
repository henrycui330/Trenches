# Trenches 1917: High Command

Western Front tactical browser game with WebSocket multiplayer.

## Play online (multiplayer works here)

**https://trenches-1917.abstracted-fight.workers.dev**

> GitHub Pages cannot run a WebSocket server. Use the Cloudflare URL above for multiplayer.

### Keep the deploy permanent
This preview account expires in ~60 minutes unless claimed:

**https://dash.cloudflare.com/claim-preview?claimToken=AVzivqDm0OLwlwNZO68H7KtRPEjhfjqy4u4WZB5WQp8**

Sign in / create a Cloudflare account via that link to keep the Worker forever. Then redeploy with `npx wrangler deploy` (after `wrangler login`).

## Local

```bash
npm install
npm start
```

Open **http://localhost:8765** (not a random Live Server port).

## Multiplayer

1. MULTIPLAYER → CREATE ROOM → share 5-digit code  
2. Friends JOIN with the code  
3. Pick countries → READY → host START  

Same alliance = co-op vs AI. Mixed alliances = versus (no AI on human sides).
