import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, BookOpen, RefreshCw, Trophy, Palette, BadgeAlert, Coins, Sparkles } from 'lucide-react';
import { BoardTheme } from '../types';
import { Language, TRANSLATIONS } from '../translations';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  theme: BoardTheme;
  setTheme: (theme: BoardTheme) => void;
  pieceStyle: string;
  setPieceStyle: (style: string) => void;
  tokens: number;
  onClearData?: () => void;
  onShowRules: () => void;
}

export const BOARD_THEMES_3: { id: BoardTheme; nameKu: string; nameEn: string; bg: string }[] = [
  { id: 'CLASSIC_WOOD', nameKu: 'تەختەی دارین 🪵', nameEn: 'Sablax Wood', bg: 'bg-[#5c4033] border-[#3e2723]' },
  { id: 'ROYAL_GOLD', nameKu: 'لوکس شاهانە 👑', nameEn: 'Royal Gold', bg: 'bg-amber-900 border-amber-600' },
  { id: 'DARK_MARBLE', nameKu: 'مەڕمەڕی تاریک ✨', nameEn: 'Dark Marble', bg: 'bg-slate-900 border-slate-700' },
];

export const PIECE_MATCHUPS_3 = [
  { id: 'WHITE_BLACK', nameKu: 'سپی کریستاڵ و ڕەش', nameEn: 'Crystal White' },
  { id: 'GOLD_BLACK', nameKu: 'زێڕینی شاهانە و ڕەش', nameEn: 'Royal Gold' },
  { id: 'RUBY_EMERALD', nameKu: 'سەوز و سوور 💎', nameEn: 'Emerald & Ruby' },
];

export default function MenuDrawer({
  isOpen,
  onClose,
  lang,
  setLang,
  soundEnabled,
  setSoundEnabled,
  theme,
  setTheme,
  pieceStyle,
  setPieceStyle,
  tokens,
  onShowRules,
}: MenuDrawerProps) {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'KU' || lang === 'AR';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
          />

          {/* Drawer side panel */}
          <motion.div
            initial={{ x: isRtl ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            dir={isRtl ? 'rtl' : 'ltr'}
            className="fixed top-0 bottom-0 z-50 w-full max-w-sm bg-neutral-900 border-l border-r border-white/5 shadow-2x flex flex-col focus:outline-none"
            style={{ [isRtl ? 'right' : 'left']: 0 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-neutral-900/60 backdrop-blur-lg">
              <div className="flex items-center space-x-2 space-x-reverse rtl:space-x-reverse">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  {lang === 'KU' ? 'مێنیوی سەرەکی' : lang === 'AR' ? 'القائمة الرئيسية' : 'Main Configuration'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content inside Sidebar */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Token Board in menu */}
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                    {lang === 'KU' ? 'کاپیتاڵ تۆکن' : lang === 'AR' ? 'الرمز الذهبي' : 'Active Balance'}
                  </div>
                  <div className="text-2xl font-black text-amber-400 mt-1">{tokens} ❖</div>
                </div>
                <div className="p-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl">
                  <Coins className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">
                  {lang === 'KU' ? 'زمان' : lang === 'AR' ? 'اللغة' : 'Language'}
                </label>
                <div className="grid grid-cols-3 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                  {(['KU', 'EN', 'AR'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        lang === l ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Option Toggle */}
              <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest">
                  {lang === 'KU' ? 'دەنگی یاری' : lang === 'AR' ? 'صوت اللعبة' : 'Game Audio'}
                </span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg transition-all ${
                    soundEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'bg-neutral-800 text-neutral-600'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

               {/* 3 Beautiful Board Themes Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-sans">
                  {lang === 'KU' ? 'سێ تەختە سەرنجڕاکێشەکە' : lang === 'AR' ? 'المعالم الثلاث الفخمة' : 'The 3 Premium Board Skins'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BOARD_THEMES_3.map((bt) => (
                    <button
                      key={bt.id}
                      onClick={() => setTheme(bt.id)}
                      className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                        theme === bt.id
                          ? 'border-cyan-500 bg-cyan-950/20 text-cyan-200 font-extrabold'
                          : 'border-white/5 bg-black/20 text-neutral-400 hover:bg-black/35 hover:text-white'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg mb-1 border ${bt.bg} opacity-80`} />
                      <span className="text-[10px] font-bold truncate w-full text-center outline-none leading-none">
                        {lang === 'KU' ? bt.nameKu : bt.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Beautiful & Contrast Pieces Design Style Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block font-sans">
                  {lang === 'KU' ? 'سێ شێوازەکەی بەردەکان' : lang === 'AR' ? 'أنماط الأحجار الثلاث التنافسية' : 'The 3 High Contrast Checkers'}
                </label>
                <div className="grid grid-cols-3 gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                  {PIECE_MATCHUPS_3.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPieceStyle(p.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center cursor-pointer ${
                        pieceStyle === p.id
                          ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300 font-extrabold'
                          : 'border-white/5 bg-black/20 text-neutral-400 hover:bg-black/30'
                      }`}
                    >
                      <span className="text-[10px] font-bold leading-tight">
                        {lang === 'KU' ? p.nameKu : p.nameEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rules Manual */}
              <button
                onClick={() => {
                  onShowRules();
                  onClose();
                }}
                className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-neutral-800 to-neutral-900 border border-white/5 p-3 rounded-xl text-xs font-bold hover:bg-neutral-800 text-neutral-200 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-cyan-400 mr-2 rtl:ml-2 rtl:mr-0" />
                <span>{t.RULES_TITLE}</span>
              </button>
            </div>

            {/* Footer containing app signature to avoid slop / build a warm visual look */}
            <div className="p-4 border-t border-white/5 text-center bg-neutral-950/50">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
                Dama Offline • دێسکی ڕێسای دەرەوەی ئۆنلاین
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
