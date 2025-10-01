// Configuration for TonConnect
export const getManifestUrl = () => {
  // Check if we're in production/ngrok environment
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  
  console.log('[TonConnect Debug] Current host:', currentHost);
  
  // If we're on localhost, use the ngrok URL for testing
  if (currentHost.includes('localhost')) {
    const ngrokManifestUrl = 'https://basically-enough-clam.ngrok-free.app/tonconnect-manifest.json';
    console.log('[TonConnect Debug] Using ngrok manifest URL (localhost):', ngrokManifestUrl);
    return ngrokManifestUrl;
  }
  
  // For production deployments (Vercel, etc.), use the current host
  const manifestUrl = `${currentHost}/tonconnect-manifest.json`;
  console.log('[TonConnect Debug] Using current host manifest URL:', manifestUrl);
  return manifestUrl;
};

export const getTwaReturnUrl = () => {
  // Update this with your actual Telegram bot URL
  const returnUrl = 'https://t.me/mini_labs_bot/myapp';
  console.log('[TonConnect Debug] TWA Return URL:', returnUrl);
  return returnUrl;
};