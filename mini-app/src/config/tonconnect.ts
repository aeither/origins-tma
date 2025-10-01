// Configuration for TonConnect
export const getManifestUrl = () => {
  // Check if we're in production/ngrok environment
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  
  console.log('[TonConnect Debug] Current host:', currentHost);
  
  // If we're using ngrok or a custom domain, use that
  if (currentHost.includes('ngrok')) {
    const manifestUrl = `${currentHost}/tonconnect-manifest.json`;
    console.log('[TonConnect Debug] Using dynamic manifest URL:', manifestUrl);
    return manifestUrl;
  }
  
  // Default to the ngrok URL you provided
  const defaultManifestUrl = 'https://basically-enough-clam.ngrok-free.app/tonconnect-manifest.json';
  console.log('[TonConnect Debug] Using default manifest URL:', defaultManifestUrl);
  return defaultManifestUrl;
};

export const getTwaReturnUrl = () => {
  // Update this with your actual Telegram bot URL
  const returnUrl = 'https://t.me/mini_labs_bot/myapp';
  console.log('[TonConnect Debug] TWA Return URL:', returnUrl);
  return returnUrl;
};