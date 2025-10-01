import { useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';

export const useTonConnectDebug = () => {
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    console.log('[TonConnect Debug Hook] Setting up event listeners');

    // Connection state change events
    const unsubscribeStatus = tonConnectUI.onStatusChange((wallet) => {
      console.log('[TonConnect Debug] Status changed:', {
        connected: !!wallet,
        address: wallet?.account?.address,
        chain: wallet?.account?.chain,
        device: wallet?.device,
        provider: wallet?.provider,
        timestamp: new Date().toISOString()
      });
    });

    // Modal state change events
    const unsubscribeModal = tonConnectUI.onModalStateChange((state) => {
      console.log('[TonConnect Debug] Modal state changed:', {
        state: state.status,
        closeReason: state.closeReason,
        timestamp: new Date().toISOString()
      });
    });

    // Monitor connection restoration
    setTimeout(() => {
      console.log('[TonConnect Debug] Initial connection check:', {
        connected: tonConnectUI.connected,
        account: tonConnectUI.account,
        wallet: tonConnectUI.wallet
      });
    }, 1000);

    return () => {
      console.log('[TonConnect Debug Hook] Cleaning up event listeners');
      unsubscribeStatus();
      unsubscribeModal();
    };
  }, [tonConnectUI]);
};