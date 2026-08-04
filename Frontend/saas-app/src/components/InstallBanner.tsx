import React, { useState, useEffect } from 'react';

const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-zinc-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-zinc-700 animate-bounce">
      <div>
        <h4 className="font-bold text-sm">Install ParcelFlow App</h4>
        <p className="text-xs text-zinc-400">Get a fast app experience on your phone!</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowBanner(false)}
          className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
        >
          Later
        </button>
        <button
          onClick={handleInstallClick}
          className="px-4 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-500 transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;