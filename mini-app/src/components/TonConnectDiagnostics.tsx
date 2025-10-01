import React, { useEffect, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { getManifestUrl } from '../config/tonconnect';
import { validateManifestUrl } from '../utils/debug';

export const TonConnectDiagnostics: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [manifestValid, setManifestValid] = useState<boolean | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    const runDiagnostics = async () => {
      const manifestUrl = getManifestUrl();
      const isValid = await validateManifestUrl(manifestUrl);
      setManifestValid(isValid);

      // Gather diagnostic information
      const diagnosticData = {
        manifestUrl,
        manifestValid: isValid,
        walletConnected: !!wallet,
        walletAddress: wallet?.account?.address,
        walletChain: wallet?.account?.chain,
        tonConnectUIConnected: tonConnectUI.connected,
        tonConnectUIAccount: tonConnectUI.account,
        telegramWebApp: {
          available: !!window.Telegram?.WebApp,
          version: window.Telegram?.WebApp?.version,
          initData: window.Telegram?.WebApp?.initData ? '✓ Available' : '✗ Not available',
          platform: window.Telegram?.WebApp?.platform,
          colorScheme: window.Telegram?.WebApp?.colorScheme,
          themeParams: window.Telegram?.WebApp?.themeParams,
        },
        environment: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          href: window.location.href,
          origin: window.location.origin,
          protocol: window.location.protocol,
          host: window.location.host,
        },
        storage: {
          localStorage: typeof localStorage !== 'undefined' ? '✓ Available' : '✗ Not available',
          sessionStorage: typeof sessionStorage !== 'undefined' ? '✓ Available' : '✗ Not available',
          indexedDB: typeof indexedDB !== 'undefined' ? '✓ Available' : '✗ Not available',
        }
      };

      setDiagnostics(diagnosticData);
      console.log('[TonConnect Diagnostics] Complete diagnostic data:', diagnosticData);
    };

    runDiagnostics();
  }, [tonConnectUI, wallet]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? '✓ true' : '✗ false';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return '⏳';
    return status ? '✅' : '❌';
  };

  return (
    <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">TonConnect Diagnostics</h2>
      
      <div className="space-y-4 text-sm">
        <div className="bg-[#2a2d34] rounded p-3">
          <h3 className="font-semibold mb-2">Connection Status</h3>
          <div className="space-y-1">
            <p>Wallet Connected: {getStatusIcon(!!wallet)} {formatValue(!!wallet)}</p>
            <p>TonConnect UI Connected: {getStatusIcon(tonConnectUI.connected)} {formatValue(tonConnectUI.connected)}</p>
            <p>Manifest Valid: {getStatusIcon(manifestValid)} {formatValue(manifestValid)}</p>
          </div>
        </div>

        <div className="bg-[#2a2d34] rounded p-3">
          <h3 className="font-semibold mb-2">Wallet Info</h3>
          <div className="space-y-1">
            <p>Address: {formatValue(wallet?.account?.address)}</p>
            <p>Chain: {formatValue(wallet?.account?.chain)}</p>
            <p>Public Key: {formatValue(wallet?.account?.publicKey)}</p>
          </div>
        </div>

        <div className="bg-[#2a2d34] rounded p-3">
          <h3 className="font-semibold mb-2">Configuration</h3>
          <div className="space-y-1">
            <p>Manifest URL: {formatValue(diagnostics.manifestUrl)}</p>
            <p>Telegram Web App: {getStatusIcon(diagnostics.telegramWebApp?.available)} {formatValue(diagnostics.telegramWebApp?.available)}</p>
            <p>TWA Version: {formatValue(diagnostics.telegramWebApp?.version)}</p>
            <p>TWA Platform: {formatValue(diagnostics.telegramWebApp?.platform)}</p>
            <p>Init Data: {formatValue(diagnostics.telegramWebApp?.initData)}</p>
          </div>
        </div>

        <div className="bg-[#2a2d34] rounded p-3">
          <h3 className="font-semibold mb-2">Environment</h3>
          <div className="space-y-1">
            <p>Origin: {formatValue(diagnostics.environment?.origin)}</p>
            <p>Protocol: {formatValue(diagnostics.environment?.protocol)}</p>
            <p>Platform: {formatValue(diagnostics.environment?.platform)}</p>
            <p>Online: {getStatusIcon(diagnostics.environment?.onLine)} {formatValue(diagnostics.environment?.onLine)}</p>
            <p>Cookies: {getStatusIcon(diagnostics.environment?.cookieEnabled)} {formatValue(diagnostics.environment?.cookieEnabled)}</p>
          </div>
        </div>

        <div className="bg-[#2a2d34] rounded p-3">
          <h3 className="font-semibold mb-2">Storage</h3>
          <div className="space-y-1">
            <p>localStorage: {formatValue(diagnostics.storage?.localStorage)}</p>
            <p>sessionStorage: {formatValue(diagnostics.storage?.sessionStorage)}</p>
            <p>indexedDB: {formatValue(diagnostics.storage?.indexedDB)}</p>
          </div>
        </div>

        <div className="bg-[#2a2d34] rounded p-3">
          <h3 className="font-semibold mb-2">Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('[TonConnect Diagnostics] Current TonConnect UI state:', {
                  connected: tonConnectUI.connected,
                  account: tonConnectUI.account,
                  wallet: tonConnectUI.wallet
                });
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Log Current State
            </button>
            <button
              onClick={() => {
                tonConnectUI.disconnect();
                console.log('[TonConnect Diagnostics] Disconnected wallet');
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Force Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};