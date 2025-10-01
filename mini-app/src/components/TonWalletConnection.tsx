import { useEffect } from "react";
import { TonConnectButton, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useTelegramWebApp } from "../hooks/useTelegramWebApp";
import { useTonConnectDebug } from "../hooks/useTonConnectDebug";
import { TonConnectDiagnostics } from "./TonConnectDiagnostics";
import { Link } from "@tanstack/react-router";

export function TonWalletConnection() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { webApp, isLoading } = useTelegramWebApp();
  
  // Initialize debug hooks
  useTonConnectDebug();
  
  // Add debugging for wallet connection state
  useEffect(() => {
    console.log('[TonWalletConnection Debug] Component mounted');
    console.log('[TonWalletConnection Debug] Initial state:', {
      wallet: !!wallet,
      walletAddress: wallet?.account?.address,
      walletChain: wallet?.account?.chain,
      tonConnectUIConnected: tonConnectUI?.connected,
      tonConnectUIAccount: tonConnectUI?.account,
      isLoading,
      webApp: !!webApp
    });
  }, []);
  
  useEffect(() => {
    console.log('[TonWalletConnection Debug] Wallet state changed:', {
      connected: !!wallet,
      address: wallet?.account?.address,
      chain: wallet?.account?.chain,
      publicKey: wallet?.account?.publicKey
    });
  }, [wallet]);
  
  useEffect(() => {
    console.log('[TonWalletConnection Debug] TonConnect UI state changed:', {
      connected: tonConnectUI?.connected,
      account: tonConnectUI?.account,
      wallet: tonConnectUI?.wallet
    });
  }, [tonConnectUI?.connected, tonConnectUI?.account]);

  const handleDisconnect = () => {
    console.log('[TonWalletConnection Debug] Disconnecting wallet...');
    tonConnectUI?.disconnect();
  };

  if (isLoading) {
    console.log('[TonWalletConnection Debug] Showing loading state');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#282c34] text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        <p className="mt-4">Loading Telegram Mini App...</p>
      </div>
    );
  }
  
  console.log('[TonWalletConnection Debug] Rendering main component with wallet:', !!wallet);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#282c34] text-white p-4">
      <div className="max-w-md w-full bg-[#3a3f47] rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">TonTip Mini App</h1>
        
        {webApp && (
          <div className="mb-4 text-sm text-gray-300">
            <p>Platform: {webApp.platform}</p>
            <p>Version: {webApp.version}</p>
          </div>
        )}
        
        <div className="mb-6">
          <TonConnectButton />
        </div>

        {wallet ? (
          <div className="space-y-4">
            <div className="bg-[#4a5058] rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Connected Wallet</h2>
              <p className="text-sm text-gray-300 mb-2">Address:</p>
              <p className="text-xs font-mono bg-[#2a2d34] p-2 rounded break-all">
                {wallet.account.address}
              </p>
              <p className="text-sm text-gray-300 mt-2">Chain:</p>
              <p className="text-sm">{wallet.account.chain}</p>
            </div>
            
                {/* Debug diagnostics */}
            <TonConnectDiagnostics />
            
            {/* Navigation to app features */}
            <div className="bg-[#4a5058] rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">TonTip Features</h3>
              <div className="space-y-2">
                <Link 
                  to="/" 
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded transition-colors text-center"
                >
                  📚 Home
                </Link>
                <Link 
                  to="/hello-world" 
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors text-center"
                >
                  HelloWorld Contract
                </Link>
                <Link 
                  to="/reward-contract" 
                  className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors text-center"
                >
                  Reward Contract
                </Link>
              </div>
            </div>
            
            <button
              onClick={handleDisconnect}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400">Connect your TON wallet to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}