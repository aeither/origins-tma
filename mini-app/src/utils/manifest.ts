// Utility to dynamically update manifest based on current environment
export const updateManifestForCurrentDomain = () => {
  if (typeof window === 'undefined') return;
  
  const currentOrigin = window.location.origin;
  
  // Only update if we're not already on the expected domain
  if (currentOrigin !== 'https://basically-enough-clam.ngrok-free.app') {
    const manifestData = {
      url: currentOrigin,
      name: "TonTip Mini App",
      iconUrl: `${currentOrigin}/icon-192x192.png`,
      termsOfUseUrl: "https://ton.org/terms",
      privacyPolicyUrl: "https://ton.org/privacy"
    };
    
    // This would ideally be handled server-side, but for development we can log it
    console.log('Manifest should be updated to:', manifestData);
  }
};