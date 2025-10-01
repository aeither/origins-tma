# TON Telegram Mini App Starter

A modern, production-ready starter template for building Telegram Mini Apps on the TON blockchain with **Tolk smart contracts**.

## 🚀 Features

- **Tolk Smart Contracts** - Built with the modern Tolk language, the next generation of TON smart contract development
- **React + TypeScript** - Modern frontend stack with full type safety
- **TanStack Router** - Type-safe routing with excellent developer experience
- **Tailwind CSS** - Beautiful, responsive UI with utility-first CSS
- **TonConnect 2.0** - Seamless wallet integration for secure blockchain interactions
- **Telegram Bot Integration** - Ready-to-use bot setup for launching your Mini App
- **Blueprint** - Official TON development framework for building and deploying contracts
- **Comprehensive Testing** - Jest test suite for smart contracts

## 📦 Project Structure

```
ton-tma-starter/
├── contracts/          # Tolk smart contracts
│   └── counter.tolk    # Example counter contract
├── wrappers/           # TypeScript wrappers for contracts
│   └── Counter.ts      # Counter contract wrapper
├── scripts/            # Deployment and interaction scripts
│   ├── deployCounter.ts
│   └── incrementCounter.ts
├── tests/              # Smart contract tests
│   └── Counter.spec.ts
├── mini-app/           # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.tsx
│   │   │   └── CounterPage.tsx
│   │   └── routes/
│   └── package.json
├── telegram-bot/       # Telegram bot server
│   ├── src/
│   └── package.json
└── package.json        # Root package.json
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** package manager
- **TON wallet** (Tonkeeper, TON Wallet, etc.)
- **Telegram Bot Token** (for Mini App deployment)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ton-tma-starter
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Build smart contracts**
```bash
npx blueprint build
```

This will compile your Tolk contracts using the official TON toolchain.

### Development

#### Smart Contract Development

1. **Write your contract** in `contracts/` directory using Tolk
2. **Build the contract**:
```bash
npx blueprint build
```

3. **Test your contract**:
```bash
npm test
```

4. **Deploy to testnet**:
```bash
npx blueprint run deployCounter
```

5. **Interact with deployed contract**:
```bash
npx blueprint run incrementCounter
```

#### Mini App Development

1. **Start the development server**:
```bash
cd mini-app
pnpm dev
```

2. **Open your browser** at `http://localhost:3000`

3. **Connect your wallet** and interact with the Counter contract

#### Telegram Bot Setup

1. **Navigate to bot directory**:
```bash
cd telegram-bot
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env and add your BOT_TOKEN
```

3. **Start development bot**:
```bash
pnpm dev
```

4. **For production deployment** (Cloudflare Workers):
```bash
pnpm deploy
```

## 📱 Example: Counter Contract

The starter includes a simple counter contract written in Tolk:

### Contract Features

- ✅ Increment counter via transaction
- ✅ Get current counter value
- ✅ Get contract version
- ✅ Gas-optimized operations

### Frontend Integration

```typescript
import { Counter } from '../wrappers/Counter';
import { Address } from '@ton/core';

// Create contract instance
const counter = Counter.createFromAddress(Address.parse(CONTRACT_ADDRESS));

// Read counter value
const value = await counter.getCounter(provider);

// Increment counter
await counter.sendIncrement(provider, via, {
  value: toNano('0.05'),
});
```

## 🔧 Configuration

### Update Contract Address

After deploying your contract, update the address in:

```typescript
// mini-app/src/components/CounterPage.tsx
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### TonConnect Manifest

Update the manifest for wallet connection:

```json
// mini-app/public/tonconnect-manifest.json
{
  "url": "https://your-app-url.com",
  "name": "Your App Name",
  "iconUrl": "https://your-app-url.com/icon.png"
}
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run specific test file:

```bash
npm test -- tests/Counter.spec.ts
```

## 🚢 Deployment

### Deploy Smart Contracts

1. **Testnet**:
```bash
npx blueprint run deployCounter --testnet
```

2. **Mainnet**:
```bash
npx blueprint run deployCounter --mainnet
```

### Deploy Mini App

1. **Build the app**:
```bash
cd mini-app
pnpm build
```

2. **Deploy to your hosting** (Vercel, Netlify, Cloudflare Pages, etc.)

### Deploy Telegram Bot

```bash
cd telegram-bot
pnpm deploy
```

## 📚 Learn More

### Tolk Language

- [Tolk Documentation](https://docs.ton.org/develop/tolk)
- [Tolk vs FunC Comparison](https://docs.ton.org/develop/tolk/tolk-vs-func)
- [Tolk Language Reference](https://docs.ton.org/develop/tolk/specification)

### TON Blockchain

- [TON Documentation](https://docs.ton.org/)
- [TON Smart Contract Guidelines](https://docs.ton.org/develop/smart-contracts/)
- [Blueprint Framework](https://github.com/ton-org/blueprint)

### Telegram Mini Apps

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [TonConnect SDK](https://github.com/ton-connect/sdk)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this starter for your projects!

## 💡 Tips for Your Project

### Customization Checklist

- [ ] Update project name in all `package.json` files
- [ ] Replace counter contract with your custom logic
- [ ] Update contract addresses after deployment
- [ ] Customize frontend UI/UX
- [ ] Set up your Telegram bot
- [ ] Configure TonConnect manifest
- [ ] Add your app icon and branding
- [ ] Update README with your project details

### Best Practices

1. **Security**: Always test contracts on testnet before mainnet deployment
2. **Gas Optimization**: Use Tolk's optimizations for lower transaction costs
3. **Error Handling**: Implement comprehensive error handling in frontend
4. **User Experience**: Show transaction status and loading states
5. **Testing**: Write tests for all contract functions
6. **Documentation**: Keep README updated with contract addresses and features

## 🆘 Troubleshooting

### Common Issues

**Contract compilation fails:**
- Ensure you have the latest `@ton/tolk-js` version
- Check Tolk syntax in your contract files

**Wallet not connecting:**
- Verify TonConnect manifest URL is accessible
- Check that you're using a supported wallet

**Transaction fails:**
- Ensure sufficient TON balance for gas fees
- Verify contract address is correct
- Check transaction payload encoding

**Build errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Update dependencies: `pnpm update`

## 🌟 What's Next?

This starter is designed to help you quickly build and deploy TON Telegram Mini Apps. Here are some ideas to extend it:

- Add more complex smart contract logic
- Implement NFT minting and trading
- Create a DeFi application
- Build a gaming Mini App
- Integrate with other TON ecosystem projects

---

Built with ❤️ for the TON ecosystem
