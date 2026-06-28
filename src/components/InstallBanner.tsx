'use client';

import { useState, useEffect } from 'react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Cek apakah sudah terinstall
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    // Cek apakah user sudah dismiss
    if (localStorage.getItem('pwa-install-dismissed')) return;

    // iOS detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isInStandaloneMode = (window.navigator as any).standalone;

    if (isIosDevice && !isInStandaloneMode) {
      setIsIos(true);
      setShowBanner(true);
      return;
    }

    // Android / Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="mx-4 mb-4 mt-2 bg-gradient-to-r from-[#1E293B] to-[#0F2040] border border-[#C9A84C]/30 rounded-2xl p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#C9A84C]/10 rounded-full blur-2xl pointer-events-none"></div>

      <button onClick={handleDismiss} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/10 text-white/50 hover:text-white flex items-center justify-center text-sm">
        ✕
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#C9A84C]/20">
          <img src="/icons/icon-192.png" alt="BaitulMarifah" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 pr-6">
          <p className="text-white font-bold text-sm">Install BaitulMarifah App</p>
          {isIos ? (
            <>
              <p className="text-white/50 text-xs mt-1">Tap ikon <strong className="text-white/70">Share</strong> lalu pilih <strong className="text-white/70">"Add to Home Screen"</strong></p>
              <p className="text-white/40 text-[11px] mt-1">Agar app bisa dibuka seperti aplikasi native</p>
            </>
          ) : (
            <>
              <p className="text-white/50 text-xs mt-1">Akses lebih cepat langsung dari layar utama HP Anda</p>
              <button
                onClick={handleInstall}
                className="mt-2 px-4 py-1.5 bg-[#C9A84C] text-[#0F172A] font-bold text-xs rounded-lg hover:bg-[#D4B869] transition-colors"
              >
                Install Sekarang
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
