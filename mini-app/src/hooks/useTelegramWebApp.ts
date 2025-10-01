import { useEffect, useState } from 'react';

// Telegram Web App types
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  isVersionAtLeast: (version: string) => boolean;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  close: () => void;
  expand: () => void;
  ready: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initWebApp = () => {
      if (window.Telegram?.WebApp) {
        const tgWebApp = window.Telegram.WebApp;
        setWebApp(tgWebApp);
        
        // Initialize the web app
        tgWebApp.ready();
        tgWebApp.expand();
        
        // Set theme
        tgWebApp.setHeaderColor('#282c34');
        tgWebApp.setBackgroundColor('#282c34');
        
        setIsLoading(false);
      } else {
        // Fallback for development/testing
        setTimeout(initWebApp, 100);
      }
    };

    initWebApp();
  }, []);

  return { webApp, isLoading };
}