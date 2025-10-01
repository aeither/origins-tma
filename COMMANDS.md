# Quick Command Reference

All commands you need to run the TON Telegram Mini App Starter.

## 🚀 Initial Setup

```bash
# 1. Install all dependencies
pnpm install
cd mini-app && pnpm install && cd ..
cd telegram-bot && pnpm install && cd ..

# 2. Build smart contracts
npx blueprint build

# 3. Run tests
npm test
```

## 📱 Development Mode (3 Terminals)

### Terminal 1: Mini App
```bash
cd mini-app
pnpm dev
# Runs on http://localhost:3000
```

### Terminal 2: ngrok (for Telegram testing)
```bash
ngrok http 3000
# Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
```

### Terminal 3: Telegram Bot
```bash
cd telegram-bot
pnpm run dev
# Bot will respond to Telegram messages
```

## 🔨 Smart Contract Commands

### Build Contract
```bash
npx blueprint build
# Compiles contracts/counter.tolk to bytecode
```

### Test Contract
```bash
npm test
# Runs all tests in tests/ folder

# Run specific test
npm test -- tests/Counter.spec.ts
```

### Deploy Contract (Testnet)
```bash
npx blueprint run deployCounter
# Select: testnet
# Copy the contract address from output
```

### Deploy Contract (Mainnet)
```bash
npx blueprint run deployCounter
# Select: mainnet
# ⚠️ Use real TON - test thoroughly on testnet first!
```

### Interact with Deployed Contract
```bash
# Increment the counter
npx blueprint run incrementCounter
# Paste your contract address when prompted

# Or pass address directly
npx blueprint run incrementCounter EQD...youraddress
```

## 🌐 Mini App Commands

```bash
cd mini-app

# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm serve

# Code quality
pnpm lint
pnpm format
pnpm check
```

## 🤖 Telegram Bot Commands

```bash
cd telegram-bot

# Development with auto-reload
bun run dev

# Deploy to Cloudflare Workers (production)
bun run deploy

# Set up bot token in Cloudflare
wrangler secret put BOT_TOKEN

# Test webhook locally
bun run dev:webhook
```

## 📦 Dependency Management

```bash
# Update all dependencies
pnpm update

# Install new package (root)
pnpm add <package-name>

# Install new package (mini-app)
cd mini-app && pnpm add <package-name>

# Install new package (telegram-bot)
cd telegram-bot && bun add <package-name>

# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 🔍 Debugging Commands

```bash
# Check TypeScript types
npx tsc --noEmit

# Check for TON SDK issues
pnpm list @ton/core @ton/ton

# View contract on TONScan
# Testnet: https://testnet.tonscan.org/address/<your-address>
# Mainnet: https://tonscan.org/address/<your-address>

# Check ngrok status
curl http://localhost:4040/api/tunnels

# Test TonConnect manifest accessibility
curl https://your-ngrok-url.ngrok-free.app/tonconnect-manifest.json
```

## 🧹 Clean Up Commands

```bash
# Remove build artifacts
rm -rf build/

# Remove node_modules
rm -rf node_modules mini-app/node_modules telegram-bot/node_modules

# Remove lock files
rm pnpm-lock.yaml mini-app/pnpm-lock.yaml

# Fresh install
pnpm install
```

## 🚀 Production Deployment

### Deploy Smart Contract to Mainnet
```bash
npx blueprint run deployCounter
# Select: mainnet
# Ensure you have real TON in your wallet
```

### Deploy Mini App
```bash
cd mini-app
pnpm build
# Upload dist/ folder to:
# - Vercel: vercel --prod
# - Netlify: netlify deploy --prod
# - Cloudflare Pages: wrangler pages publish dist
```

### Deploy Telegram Bot
```bash
cd telegram-bot

# Set production bot token
wrangler secret put BOT_TOKEN

# Deploy to Cloudflare Workers
bun run deploy
```

## 📝 Configuration Files to Update

After deployment, update these files:

```bash
# 1. Update contract address
mini-app/src/components/CounterPage.tsx
# Line 10: const CONTRACT_ADDRESS = "EQD...your_address"

# 2. Update ngrok URL (development)
telegram-bot/src/bot.ts
# Line 4: const DEV_MINI_APP_URL = "https://your-ngrok.ngrok-free.app"

# 3. Update production URL (production)
telegram-bot/src/bot.ts
# Line 5: const _PROD_MINI_APP_URL = "https://your-domain.com"
# Line 8: const CURRENT_MINI_APP_URL = _PROD_MINI_APP_URL

# 4. Update TonConnect manifest
mini-app/public/tonconnect-manifest.json
# Update url and iconUrl fields
```

## 🎯 Complete Workflow Example

```bash
# 1. Initial setup
pnpm install && cd mini-app && pnpm install && cd ../telegram-bot && bun install && cd ..

# 2. Build contracts
npx blueprint build

# 3. Deploy to testnet
npx blueprint run deployCounter

# 4. Copy contract address and update CounterPage.tsx
# Edit: mini-app/src/components/CounterPage.tsx

# 5. Start development (3 terminals)

# Terminal 1
cd mini-app && pnpm dev

# Terminal 2
ngrok http 3000

# Terminal 3 - After updating bot.ts with ngrok URL
cd telegram-bot && bun run dev

# 6. Test in Telegram
# - Open bot
# - Send /start
# - Click "Open Mini App"
# - Connect wallet
# - Test increment function

# 7. Production deployment
cd mini-app && pnpm build && vercel --prod
cd ../telegram-bot && bun run deploy
```

## ⚡ Quick Fixes

### Contract won't compile
```bash
pnpm update @ton/tolk-js @ton/blueprint
npx blueprint build
```

### Mini app won't start
```bash
cd mini-app
rm -rf node_modules .vinxi .output
pnpm install
pnpm dev
```

### Wallet won't connect
```bash
# Update manifest with correct ngrok URL
# Restart mini-app dev server
# Try clearing browser cache
```

### Bot won't respond
```bash
# Check .env file exists with BOT_TOKEN
# Restart bot: cd telegram-bot && bun run dev
# Check bot token is valid with @BotFather
```

---

💡 **Tip**: Keep this file open in a separate terminal window for quick reference!
