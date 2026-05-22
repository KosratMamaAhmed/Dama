import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, WifiOff, Wifi } from 'lucide-react';

export default function InstallPrompt() {
  const [showiOSPrompt, setShowiOSPrompt] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOfflineNotice, setShowOfflineNotice] = useState(!navigator.onLine);

  useEffect(() => {
    // Online/Offline status listeners
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineNotice(true);
      // Automatically hide online notice after 3 seconds
      setTimeout(() => setShowOfflineNotice(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    // Detect if already installed (standalone mode)
    const isStandalone = () => {
      return ('standalone' in window.navigator) && (window.navigator as any).standalone;
    };

    if (isIos() && !isStandalone()) {
      setShowiOSPrompt(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Offline Status indicator banner */}
      {showOfflineNotice && (
        <div 
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[99] px-4 py-2.5 rounded-xl border flex items-center gap-2.5 shadow-lg transition-all duration-300 ${
            isOffline 
              ? 'bg-red-500/10 border-red-500/30 text-red-200' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}
          id="offline-status-banner"
        >
          {isOffline ? (
            <>
              <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
              <div className="text-xs text-right rtl:text-right">
                <span className="font-extrabold block">دۆخی ئۆفلاین (بێ هێڵ) فعالە</span>
                <span className="text-[10px] text-red-350">دەتوانیت بە تەواوی و بێ دابڕان بەردەوام بیت لە کات بەسەربردن!</span>
              </div>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 text-emerald-400" />
              <div className="text-xs text-right rtl:text-right">
                <span className="font-extrabold block">تۆ بەستراویتەوە بە ئینتەرنێتەوە</span>
                <span className="text-[10px] text-emerald-350">پەیوەندی هێڵ گەڕایەوە دواوە!</span>
              </div>
            </>
          )}
          <button 
            type="button"
            onClick={() => setShowOfflineNotice(false)}
            className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* iOS Add to Home Screen Prompt with stylish Sky-blue layout */}
      {showiOSPrompt && (
        <div 
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-950/95 border border-sky-400/20 p-4 rounded-2xl z-[98] flex flex-col gap-3 shadow-[0_15px_40px_rgba(14,165,233,0.35)] backdrop-blur-md animate-fade-in"
          id="ios-install-prompt"
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-2.5 items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
                DAMA
              </div>
              <div>
                <h3 className="text-white font-black text-xs">داما بە شێوەی ئەپ دامەزرێنە</h3>
                <p className="text-sky-300 text-[10px] font-bold">بۆ بەکارهێنان بە بێ هێڵی ئینتەرنێت (PWA)</p>
              </div>
            </div>
            <button 
              onClick={() => setShowiOSPrompt(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-neutral-300 text-[11px] leading-relaxed bg-white/5 p-2.5 rounded-xl border border-white/5 font-medium rtl:text-right text-right">
            <span>بۆ جێگیرکردنی لە ناو مۆبایلە ئایفۆنەکەتدا، بە دوای یەکدا:</span>
            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap justify-end">
              <strong className="text-sky-400">Add to Home Screen</strong>
              <span>پاشان هەڵبژێرە</span>
              <PlusSquare className="w-4 h-4 text-sky-400 inline shrink-0" />
              <span>دابگرە،</span>
              <Share className="w-4 h-4 text-sky-400 inline shrink-0" />
              <span>نیشانەی</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
