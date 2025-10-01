import React from "react";
import { Link } from "@tanstack/react-router";
import { TonConnectButton } from "@tonconnect/ui-react";

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            TON Telegram Mini App Starter
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            A modern starter template for building TON blockchain apps with Tolk smart contracts
          </p>
          <div className="flex justify-center">
            <TonConnectButton />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold mb-3">🚀 Tolk Smart Contracts</h3>
            <p className="text-gray-300 mb-4">
              Built with the modern Tolk language - the next generation of TON smart contract development
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold mb-3">⚡ React + TypeScript</h3>
            <p className="text-gray-300 mb-4">
              Modern frontend stack with TanStack Router, Tailwind CSS, and full type safety
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold mb-3">💎 TonConnect Integration</h3>
            <p className="text-gray-300 mb-4">
              Seamless wallet connection with TonConnect 2.0 for secure blockchain interactions
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold mb-3">📱 Telegram Mini App</h3>
            <p className="text-gray-300 mb-4">
              Ready-to-use Telegram bot integration for launching your app in Telegram
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Try the Demo</h2>
          <div className="space-y-4">
            <Link
              to="/counter"
              className="block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg text-center transition-all transform hover:scale-105"
            >
              Counter Contract Demo
            </Link>
            <p className="text-sm text-gray-300 text-center">
              Interact with a simple Tolk counter smart contract on the TON blockchain
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold mb-6">Getting Started</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">1. Install Dependencies</h3>
              <code className="block bg-black/30 p-3 rounded font-mono text-sm">
                pnpm install
              </code>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">2. Build Smart Contracts</h3>
              <code className="block bg-black/30 p-3 rounded font-mono text-sm">
                npx blueprint build
              </code>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">3. Deploy Contracts</h3>
              <code className="block bg-black/30 p-3 rounded font-mono text-sm">
                npx blueprint run
              </code>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">4. Start Development Server</h3>
              <code className="block bg-black/30 p-3 rounded font-mono text-sm">
                cd mini-app && pnpm dev
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400">
          <p>Built with ❤️ for the TON ecosystem</p>
        </div>
      </div>
    </div>
  );
};
