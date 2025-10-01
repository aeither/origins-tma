// Debug utilities for TonConnect troubleshooting

export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global Debug] Unhandled promise rejection:', event.reason);
    console.error('[Global Debug] Promise:', event.promise);
    
    // Check if it's a TonConnect related error
    if (event.reason && typeof event.reason === 'object') {
      if (event.reason.message?.includes('TON') || 
          event.reason.message?.includes('TonConnect') ||
          event.reason.message?.includes('wallet')) {
        console.error('[Global Debug] TonConnect-related error detected:', {
          message: event.reason.message,
          stack: event.reason.stack,
          cause: event.reason.cause
        });
      }
    }
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    console.error('[Global Debug] Global error:', event.error);
    console.error('[Global Debug] Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  console.log('[Global Debug] Global error handlers set up');
};

export const logTonConnectEnvironment = () => {
  console.log('[TonConnect Debug] Environment check:', {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    href: window.location.href,
    origin: window.location.origin,
    protocol: window.location.protocol,
    host: window.location.host,
    isTelegram: !!window.Telegram,
    telegramWebApp: !!window.Telegram?.WebApp,
    telegramVersion: window.Telegram?.WebApp?.version,
    telegramInitData: window.Telegram?.WebApp?.initData,
    telegramInitDataUnsafe: window.Telegram?.WebApp?.initDataUnsafe,
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined'
  });
};

// Add manifest URL validation
export const validateManifestUrl = async (manifestUrl: string) => {
  console.log('[TonConnect Debug] Validating manifest URL:', manifestUrl);
  
  try {
    const response = await fetch(manifestUrl);
    console.log('[TonConnect Debug] Manifest response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      console.error('[TonConnect Debug] Manifest not accessible:', response.status);
      return false;
    }
    
    const manifest = await response.json();
    console.log('[TonConnect Debug] Manifest content:', manifest);
    
    // Validate required fields
    const requiredFields = ['url', 'name', 'iconUrl'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.error('[TonConnect Debug] Missing required manifest fields:', missingFields);
      return false;
    }
    
    console.log('[TonConnect Debug] Manifest validation successful');
    return true;
    
  } catch (error) {
    console.error('[TonConnect Debug] Error validating manifest:', error);
    return false;
  }
};