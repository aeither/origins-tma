# cf-tg-bot

## Info
.dev for polling
.dev.vars for cf webhook

## Development

### Start polling
pnpm run dev

### For webhook testing (optional)
pnpm run dev:webhook

## Production

### Install Wrangler CLI
pnpm exec wrangler login

### Deploy to Cloudflare
pnpm run deploy

### Set secret in production
pnpm run secret

### Set webhook after deployment (* remember the slash at the end of the url /)
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook" \
     -d '{"url": "https://basically-enough-clam.ngrok-free.app/"}' \
     -H "Content-Type: application/json"

