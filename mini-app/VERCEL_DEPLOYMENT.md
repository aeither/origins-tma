# Vercel Deployment Guide

This guide will help you deploy your TanStack Start TON Mini App to Vercel.

## Prerequisites

- Vercel account ([sign up here](https://vercel.com/signup))
- Vercel CLI installed (`npm i -g vercel`)

## Deployment Steps

### Option 1: One-Click Deployment (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Click "Import Project" and select your repository
4. Vercel will auto-detect the settings
5. Click "Deploy"

### Option 2: CLI Deployment

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Deploy from the mini-app directory:**
   ```bash
   cd mini-app
   vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time) or **Y** (subsequent deploys)
   - Project name? Accept default or customize
   - Directory? `./` (current directory)
   - Override settings? **N**

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## Configuration Summary

Your project is now configured with:

- ✅ **Nitro v2 Plugin** with Vercel preset
- ✅ **Build command**: `pnpm run build`
- ✅ **Output directory**: `.vercel/output/`
- ✅ **Compatibility date**: 2025-10-02
- ✅ **Framework**: TanStack Start

## Environment Variables

If you need to add environment variables:

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add your variables:
   - `CONTRACT_ADDRESS` - Your TON contract address
   - `NETWORK` - Network type (testnet/mainnet)
   - Any other custom variables from your `.env` file

## Local Build Testing

Before deploying, test the build locally:

```bash
# Build the project
pnpm run build

# The build output will be in .vercel/output/
# Check for any errors or warnings
```

## Troubleshooting

### Build Fails

1. Check that all dependencies are installed:
   ```bash
   pnpm install
   ```

2. Verify the build works locally:
   ```bash
   pnpm run build
   ```

### Runtime Errors

1. Check Vercel logs in the Dashboard under "Deployments" → Select deployment → "Function Logs"
2. Ensure all environment variables are set correctly
3. Verify your TON contract address is accessible from the Vercel servers

### Rate Limiting Issues

The app includes rate limiting protection for TON API calls:
- Fetches are debounced to prevent overlapping requests
- Polling pauses when the tab is not visible
- Configurable polling interval (default: 30 seconds)

## Post-Deployment

After successful deployment:

1. **Update Telegram Bot**: Update your bot's mini app URL in BotFather
2. **Update TON Connect Manifest**: Update the manifest URL if hosted separately
3. **Test the app**: Open in Telegram and test all features

## Useful Commands

```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Remove a deployment
vercel remove [deployment-url]

# List all deployments
vercel list
```

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [TanStack Start Docs](https://tanstack.com/start/latest/docs)
- [TON Documentation](https://docs.ton.org)

---

**Note**: The first deployment might take a few minutes. Subsequent deployments are typically faster due to caching.


