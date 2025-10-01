# Contract Setup Guide

## Current Issue: Exit Code -13 Error

The "exit code -13" error means the contract GET methods cannot be executed. This usually happens when:

1. **Wrong Network**: The contract is deployed on testnet but you're calling mainnet (or vice versa)
2. **Contract Not Deployed**: The contract address doesn't exist on the network
3. **Wrong Contract Address**: The address in the config doesn't match your deployed contract

## How to Fix

### Step 1: Deploy Your Contract

```bash
cd tolk-contracts
npx blueprint build
npx blueprint run
```

When you deploy, Blueprint will show you the contract address. **Copy this address!**

### Step 2: Update the Contract Address

Edit `mini-app/src/config/consts.ts`:

```typescript
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE";
export const NETWORK = "testnet"; // or "mainnet" depending on where you deployed
```

### Step 3: Verify on TON Explorer

Visit one of these based on your network:

- **Testnet**: https://testnet.tonscan.org/address/YOUR_CONTRACT_ADDRESS
- **Mainnet**: https://tonscan.org/address/YOUR_CONTRACT_ADDRESS

Check that:
- Contract status is "Active"
- Contract has some balance
- Contract code is deployed

### Step 4: Test the Contract

You can test the contract works using the Blueprint scripts:

```bash
cd tolk-contracts

# Read contract data
npx blueprint run readTolkContracts

# Increment counter
npx blueprint run incrementTolkContracts
```

If these work, your contract is deployed correctly and the frontend should work too!

## Common Issues

### "Contract is not active"
Your contract needs to be deployed first. Run `npx blueprint run` in the `tolk-contracts` directory.

### "Unable to execute get method"
- Check the network setting matches where you deployed
- Verify the contract address is correct
- Make sure the contract has been deployed and is active

### Rate Limiting
If you're making many requests, you may hit rate limits. Get a free API key from:
- Testnet: https://testnet.toncenter.com/
- Mainnet: https://toncenter.com/

Then add it to the code:
```typescript
const tonClient = new TonClient({
  endpoint: TON_CENTER_ENDPOINTS[NETWORK],
  apiKey: "YOUR_API_KEY_HERE"
});
```

## Network Configuration

The app now shows which network it's using in the UI. Make sure:
1. Your TonConnect wallet is on the same network
2. The contract address is from that network
3. The NETWORK setting in `consts.ts` matches

## Contract Methods

The Tolk contract exposes these GET methods:
- `currentCounter()` - Returns the current counter value
- `initialId()` - Returns the contract's initial ID

And these message handlers:
- `IncreaseCounter` (opcode: 0x7e8764ef) - Increments the counter
- `ResetCounter` (opcode: 0x3a752f06) - Resets the counter to 0
