import React from 'react';
import { Coins, RefreshCw, Home as HomeIcon, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { Language } from '../translations';

export type ScreenType = 'HOME' | 'PLAYING' | 'RULES';

interface GameHeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  screen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  tokens: number;
  handleClearCacheAndRefresh: () => void;
  deductActivePenalty: () => void;
  dispatch: any;
  handleFullReset: () => void;
  handleBack: () => void;
}

export default function GameHeader({
  lang,
  setLang,
  screen,
  setScreen,
  soundEnabled,
  setSoundEnabled,
  tokens,
  handleClearCacheAndRefresh,
  deductActivePenalty,
  dispatch,
  handleFullReset,
  handleBack,
}: GameHeaderProps) {
  return (
    <header className="flex justify-between items-center py-1.5 px-2.5 sm:px-4 lg:px-6 border-b border-white/5 backdrop-blur-md relative z-30 bg-black/35 select-none shrink-0">
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Tokens counter */}
        <div className="flex items-center space-x-1 space-x-reverse bg-amber-500/10 border border-amber-500/35 text-amber-300 px-2 py-0.5 rounded-lg text-xs font-black shadow-[0_0_10px_rgba(245,158,11,0.15)]">
          <Coins className="w-3 h-3 mr-0.5 rtl:ml-0.5 rtl:mr-0 text-amber-400" />
          <span>{tokens}</span>
        </div>

        {/* If on HOME screen: Instant Flush Cache & Safe Refresh Button */}
        {screen === 'HOME' && (
          <button
            onClick={handleClearCacheAndRefresh}
            title={lang === 'KU' ? 'سڕینەوەی کاش و نوێکردنەوە' : lang === 'AR' ? 'مسح الكاش والتحديث' : 'Flush Cache & Safe Refresh'}
            className="flex items-center space-x-1 space-x-reverse py-0.5 px-2 rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 active:scale-95 shadow-sm text-[10px] font-black uppercase cursor-pointer"
          >
            <RefreshCw className="w-2.5 h-2.5 text-orange-400 animate-[spin_6s_linear_infinite]" />
            <span className="hidden xs:inline mr-0.5 rtl:ml-0.5">
              {lang === 'KU' ? 'سڕینەوەی کاش' : lang === 'AR' ? 'مسح الكاش' : 'Safe Reset'}
            </span>
          </button>
        )}

        {/* If on PLAYING screen: Home/Exit, Back/Undo, and Restart */}
        {screen === 'PLAYING' && (
          <div className="flex items-center gap-1.5">
            {/* Home/Exit button */}
            <button
              onClick={handleBack}
              className="p-1 px-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 transition-all duration-200 active:scale-90 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              title={lang === 'KU' ? 'سەرەکی' : lang === 'AR' ? 'القائمة الرئيسية' : 'Main Menu'}
            >
              <HomeIcon className="w-3.5 h-3.5 text-rose-300" />
            </button>

            {/* Back / Undo button */}
            <button
              onClick={() => dispatch({ type: 'UNDO_MOVE' })}
              className="p-1 px-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 transition-all duration-200 active:scale-90 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              title={lang === 'KU' ? 'گەڕانەوە بۆ پێشوو' : lang === 'AR' ? 'تراجع' : 'Undo Move'}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-amber-305" />
            </button>

            {/* Restart button */}
            <button
              onClick={handleFullReset}
              className="p-1 px-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 transition-all duration-200 active:scale-90 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              title={lang === 'KU' ? 'دووبارەکردنەوە' : lang === 'AR' ? 'إعادة تشغيل' : 'Restart'}
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-305" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
        </button>

        {/* Language selection toolbar */}
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
          <button onClick={() => setLang('KU')} className={`px-2 py-1 text-[10px] font-black rounded-md transition cursor-pointer ${lang === 'KU' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 shadow-sm' : 'text-neutral-400 hover:text-white'}`}>KU</button>
          <button onClick={() => setLang('EN')} className={`px-2 py-1 text-[10px] font-black rounded-md transition cursor-pointer ${lang === 'EN' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 shadow-sm' : 'text-neutral-400 hover:text-white'}`}>EN</button>
          <button onClick={() => setLang('AR')} className={`px-2 py-1 text-[10px] font-black rounded-md transition cursor-pointer ${lang === 'AR' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 shadow-sm' : 'text-neutral-400 hover:text-white'}`}>AR</button>
        </div>
      </div>
    </header>
  );
}
