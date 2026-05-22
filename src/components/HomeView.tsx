import React from 'react';
import { motion } from 'motion/react';
import { Bot, Users, Trophy, AlertCircle, Play, ShieldCheck, BookOpen, UserCheck } from 'lucide-react';
import { RobotAvatar, KurdishManAvatar } from './Avatars';
import { AvatarRenderer } from './ProfilesModal';
import { TITLES } from '../store/profileStore';
import { Language } from '../translations';
import { GameMode, BoardTheme } from '../types';

export const BOARD_THEMES_3: { id: BoardTheme; nameKu: string; nameEn: string; nameAr: string; colors: string }[] = [
  { id: 'CLASSIC_WOOD', nameKu: 'کلاسیك', nameEn: 'Classic Sablax Wood', nameAr: 'خشب كلاسيكي عتيق', colors: 'from-amber-800 to-stone-900' },
  { id: 'ROYAL_GOLD', nameKu: 'لوکس و شاهانە ', nameEn: 'Royal Gold Luxury', nameAr: 'الذهبي الملكي الفاخر', colors: 'from-amber-600 to-yellow-950' },
  { id: 'DARK_MARBLE', nameKu: 'مەڕمەڕی تاریک ', nameEn: 'Polished Dark Marble', nameAr: 'الرخام الأسود المصقول', colors: 'from-slate-800 to-slate-950' },
];

export const PIECE_MATCHUPS_3 = [
  { id: 'WHITE_BLACK', nameKu: 'سپی و ڕەش', nameEn: 'Crystal White & Deep Black', nameAr: 'أبيض وأسود كلاسيكي' },
  { id: 'GOLD_BLACK', nameKu: 'گۆڵد و ڕەش', nameEn: 'Royal Gold & Jet Black', nameAr: 'ذهبي ملكي وأسود ملكي' },
  { id: 'RUBY_EMERALD', nameKu: 'مرواری سەوز و سوور ', nameEn: 'Emerald Green & Ruby Red', nameAr: 'أخضر زمردي وأحمر ياقوتي' },
];

interface HomeViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  screen: 'HOME' | 'PLAYING' | 'RULES';
  setScreen: (screen: 'HOME' | 'PLAYING' | 'RULES') => void;
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  theme: BoardTheme;
  setTheme: (theme: BoardTheme) => void;
  pieceStyle: string;
  setPieceStyle: (style: string) => void;
  timeAttack: boolean;
  setTimeAttack: (ta: boolean) => void;
  tokens: number;
  cooldownRemaining: number;
  activeCampaignBoss: any;
  setShowCampaign: (show: boolean) => void;
  setShowStats: (show: boolean) => void;
  setShowProfiles: (show: boolean) => void;
  setShowCoach: (show: boolean) => void;
  setShowPuzzles: (show: boolean) => void;
  setShowAcademy: (show: boolean) => void;
  setShowPlayStorePolicies: (show: boolean) => void;
  setShowDamaRules: (show: boolean) => void;
  setShowAboutUsPortfolio: (show: boolean) => void;
  p1Profile: any;
  getCooldownString: () => string;
  handleStartAction: () => void;
  t: any;
}

export default function HomeView({
  lang,
  setLang,
  screen,
  setScreen,
  mode,
  setMode,
  theme,
  setTheme,
  pieceStyle,
  setPieceStyle,
  timeAttack,
  setTimeAttack,
  tokens,
  cooldownRemaining,
  activeCampaignBoss,
  setShowCampaign,
  setShowStats,
  setShowProfiles,
  setShowCoach,
  setShowPuzzles,
  setShowAcademy,
  setShowPlayStorePolicies,
  setShowDamaRules,
  setShowAboutUsPortfolio,
  p1Profile,
  getCooldownString,
  handleStartAction,
  t
}: HomeViewProps) {
  const isRtl = lang === 'KU' || lang === 'AR';

  return (
    <div className="w-full flex flex-col items-center">
      <motion.div
        key="home"
        initial={{ opacity: 0, scale: 0.95, y: 11 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -11 }}
        className="w-full max-w-md my-auto bg-[#041124]/95 border-2 border-cyan-500/35 shadow-[0_20px_50px_rgba(14,165,233,0.18)] rounded-2xl p-4 sm:p-5 relative z-10 backdrop-blur-3xl animate-fade-in overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.15), transparent)',
        }}
      >
        <div className="space-y-4">
          {/* Visual Header with glowing badge */}
          <div className="text-center relative py-1 pb-1">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-40 h-10 bg-gradient-to-r from-sky-500/15 via-cyan-600/15 to-indigo-500/15 blur-xl rounded-full" />
            <span className="text-xs font-black tracking-widest text-cyan-300 select-none uppercase bg-white/5 px-4 py-1.5 border border-cyan-500/25 rounded-full shadow-inner">
              Dama / دامە
            </span>
          </div>

          {/* Visual Player 1 Profile Card & Feature Center Dashboard */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-500/20 relative overflow-hidden flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AvatarRenderer 
                avatarId={p1Profile.avatarId} 
                frameId={p1Profile.selectedFrameId} 
                className="w-10 h-10"
              />
              <div className="flex-1 text-left space-y-0.5">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-xs font-black text-white">{p1Profile.name}</span>
                  {p1Profile.selectedTitleId && (
                    <span className="text-[8.5px] bg-[#fbbf24]/10 text-[#fbbf24] px-1.5 py-0.5 rounded border border-[#fbbf24]/10 font-black uppercase tracking-wider scale-95">
                      {TITLES.find(tIdx => tIdx.id === p1Profile.selectedTitleId)?.nameKu}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-3 text-[10px] text-neutral-400 font-bold">
                  <span>🏆 {p1Profile.totalWins} {lang === 'KU' ? 'بردنەوە' : 'wins'}</span>
                  <span className="text-orange-500 font-extrabold flex items-center gap-0.5">🔥 {p1Profile.currentWinStreak} {lang === 'KU' ? 'سەرکەوتن' : 'streak'}</span>
                  <span className="text-[#fbbf24] font-black flex items-center gap-0.5">🪙 {p1Profile.coinCount}</span>
                </div>
              </div>
            </div>

            {/* 5 Multi-Feature Bento Micro-Dashboard Utilities Bar */}
            <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-white/5">
              <button
                onClick={() => setShowProfiles(true)}
                className="py-1.5 px-0.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 hover:text-sky-200 rounded-lg border border-sky-500/30 hover:border-sky-500/60 text-[8.5px] font-black flex flex-col items-center gap-0.5 transition-all cursor-pointer shadow-sm"
              >
                <span className="text-sm">👤</span>
                <span className="truncate font-black">{lang === 'KU' ? 'پڕۆفایل' : lang === 'AR' ? 'الملف' : 'Profile'}</span>
              </button>

              <button
                onClick={() => setShowStats(true)}
                className="py-1.5 px-0.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 rounded-lg border border-purple-500/30 hover:border-purple-500/60 text-[8.5px] font-black flex flex-col items-center gap-0.5 transition-all cursor-pointer shadow-sm"
              >
                <span className="text-sm">📊</span>
                <span className="truncate font-black">{lang === 'KU' ? 'ئامارەکان' : lang === 'AR' ? 'التحليلات' : 'Stats'}</span>
              </button>

              <button
                onClick={() => setShowCoach(true)}
                className="py-1.5 px-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 hover:text-cyan-100 rounded-lg border border-cyan-500/40 hover:border-cyan-500/70 text-[8.5px] font-black flex flex-col items-center gap-0.5 transition-all cursor-pointer shadow-sm"
              >
                <span className="text-sm animate-bounce">🤖</span>
                <span className="truncate font-black">{lang === 'KU' ? 'ڕاهێنەر' : lang === 'AR' ? 'المدرب' : 'Coach'}</span>
              </button>

              <button
                onClick={() => setShowPuzzles(true)}
                className="py-1.5 px-0.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 rounded-lg border border-amber-500/30 hover:border-amber-500/60 text-[8.5px] font-black flex flex-col items-center gap-0.5 transition-all cursor-pointer shadow-sm"
              >
                <span className="text-sm">🧩</span>
                <span className="truncate font-black">{lang === 'KU' ? 'مەتەڵەکان' : lang === 'AR' ? 'الألغاز' : 'Puzzles'}</span>
              </button>

              <button
                onClick={() => setShowAcademy(true)}
                className="py-1.5 px-0.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 rounded-lg border border-emerald-500/30 hover:border-emerald-500/60 text-[8.5px] font-black flex flex-col items-center gap-0.5 transition-all cursor-pointer shadow-sm"
              >
                <span className="text-sm">🎓</span>
                <span className="truncate font-black">{lang === 'KU' ? 'ئەکادیمیا' : lang === 'AR' ? 'التعليم' : 'Academy'}</span>
              </button>
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="text-[9px] font-extrabold text-cyan-300 uppercase tracking-widest mb-2 block text-center">
              {lang === 'KU' ? 'هەڵبژاردنی مۆدی یاری • دەستپێکردن' : lang === 'AR' ? 'اختر نمط اللعب' : 'Select Game Mode'}
            </label>
            <div className="flex flex-col gap-2 w-full font-sans">
              {/* Mode 1: AI (Robot) */}
              <button
                onClick={() => setMode('AI')}
                className={`w-full relative flex items-center justify-center py-3 px-4 transition-all duration-300 cursor-pointer overflow-hidden group select-none ${
                  mode === 'AI' 
                    ? 'rounded-xl bg-gradient-to-r from-cyan-950/90 to-sky-900/85 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.35)] scale-[1.01]' 
                    : 'bg-slate-900/40 border border-white/5 text-neutral-400 hover:bg-slate-900/70 hover:border-white/15 rounded-xl'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className={`text-[9px] uppercase tracking-widest font-black ${mode === 'AI' ? 'text-cyan-300 font-extrabold' : 'text-neutral-500'}`}>
                    {lang === 'KU' ? 'سیستەمی زیرەک' : lang === 'AR' ? 'الذكاء الاصطناعي' : 'CYBER AI'}
                  </span>
                  <span className={`block text-sm font-black mt-0.5 ${mode === 'AI' ? 'text-white font-black' : 'text-neutral-300 font-semibold'}`}>
                    {lang === 'KU' ? 'یاری لەگەڵ ژیری دەستکرد' : lang === 'AR' ? 'یاری لەگەڵ ژیری دەستکرد' : t.PLAY_AI}
                  </span>
                </div>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0">
                  {mode === 'AI' ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-400 shadow-md flex items-center justify-center scale-95 origin-center">
                      <RobotAvatar />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-neutral-900/60 flex items-center justify-center scale-95 origin-center opacity-45 group-hover:opacity-85 transition-all">
                      <RobotAvatar />
                    </div>
                  )}
                </div>
              </button>

              {/* Mode 2: Friend (Traditional Human Player) */}
              <button
                onClick={() => setMode('FRIEND')}
                className={`w-full relative flex items-center justify-center py-3 px-4 transition-all duration-300 cursor-pointer overflow-hidden group select-none ${
                  mode === 'FRIEND' 
                    ? 'rounded-xl bg-gradient-to-r from-sky-950/90 to-blue-900/85 border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.35)] scale-[1.01]' 
                    : 'bg-slate-900/40 border border-white/5 text-neutral-400 hover:bg-slate-900/70 hover:border-white/15 rounded-xl'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className={`text-[9px] uppercase tracking-widest font-black ${mode === 'FRIEND' ? 'text-sky-300 font-extrabold' : 'text-neutral-500'}`}>
                    {lang === 'KU' ? 'هاوڕێی ئۆفلاین' : lang === 'AR' ? 'صديق أوفلاين' : 'LOCAL DUEL'}
                  </span>
                  <span className={`block text-sm font-black mt-0.5 ${mode === 'FRIEND' ? 'text-white font-black' : 'text-neutral-300 font-semibold'}`}>
                    {lang === 'KU' ? 'یاری لەگەڵ هاوڕێ' : lang === 'AR' ? 'یاری لەگەڵ هاوڕێ' : t.PLAY_FRIEND}
                  </span>
                </div>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0">
                  {mode === 'FRIEND' ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-sky-400 shadow-md flex items-center justify-center scale-95 origin-center">
                      <KurdishManAvatar />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 bg-neutral-900/60 flex items-center justify-center scale-95 origin-center opacity-45 group-hover:opacity-85 transition-all">
                      <KurdishManAvatar />
                    </div>
                  )}
                </div>
              </button>

              {/* Mode 3: Campaign Gateway (پاڵەوانێتی) */}
              <button
                onClick={() => { setMode('CAMPAIGN'); setShowCampaign(true); }}
                className={`w-full relative flex items-center justify-center py-3 px-4 transition-all duration-300 cursor-pointer overflow-hidden group select-none ${
                  mode === 'CAMPAIGN' 
                    ? 'rounded-xl bg-gradient-to-r from-indigo-950/90 to-purple-900/85 border-2 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.35)] scale-[1.01]' 
                    : 'bg-slate-900/40 border border-white/5 text-neutral-400 hover:bg-slate-900/70 hover:border-white/15 rounded-xl'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className={`text-[9px] uppercase tracking-widest font-black ${mode === 'CAMPAIGN' ? 'text-indigo-300 font-extrabold' : 'text-neutral-500'}`}>
                    {lang === 'KU' ? 'کاروانی پاشایەتی' : lang === 'AR' ? 'درب الملوك والبطولة' : 'CAMPAIGN GATEWAY'}
                  </span>
                  <span className={`block text-sm font-black mt-0.5 ${mode === 'CAMPAIGN' ? 'text-white font-black' : 'text-neutral-300 font-semibold'}`}>
                    {lang === 'KU' ? 'پاڵەوانێتی (١٢ ئاستی ناوازە)' : lang === 'AR' ? 'البوابة الكبرى (١٢ بطلاً)' : 'Grand Campaign' }
                  </span>
                </div>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0">
                  {mode === 'CAMPAIGN' ? (
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-400 shadow-xs">
                      <Trophy className="w-4 h-4 text-indigo-300" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-neutral-900/60 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-neutral-800 transition-all opacity-45 group-hover:opacity-85">
                      <Trophy className="w-3.5 h-3.5 text-neutral-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* BOARD THEMES - 3 Choices directly inside home dashboard */}
          <div>
            <label className="text-[9px] font-extrabold text-cyan-300 uppercase tracking-widest mb-2 block text-center">
              {t.BOARD_THEME} • دیزاینی تەختەی یاری
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BOARD_THEMES_3.map((themItem) => {
                const isSelected = theme === themItem.id;
                let bgGradClass = '';
                if (isSelected) {
                  if (themItem.id === 'CLASSIC_WOOD') bgGradClass = 'bg-gradient-to-br from-cyan-900 to-[#041124] border-cyan-400 text-cyan-200 shadow-[0_2px_10px_rgba(6,182,212,0.3)]';
                  else if (themItem.id === 'ROYAL_GOLD') bgGradClass = 'bg-gradient-to-br from-cyan-620 via-cyan-700 to-indigo-900 border-cyan-400 text-white shadow-[0_2px_10px_rgba(6,182,212,0.3)]';
                  else if (themItem.id === 'DARK_MARBLE') bgGradClass = 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border-slate-500 text-white shadow-[0_2px_10px_rgba(71,85,105,0.3)]';
                } else {
                  bgGradClass = 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10';
                }
                return (
                  <button
                    key={themItem.id}
                    onClick={() => setTheme(themItem.id)}
                    className={`p-2 rounded-xl border text-[11px] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${bgGradClass} ${isSelected ? 'scale-101 font-black' : 'font-bold'}`}
                  >
                    <span className="text-[10px] truncate text-center leading-tight">
                      {lang === 'KU' ? themItem.nameKu : lang === 'AR' ? themItem.nameAr : themItem.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIECE DESIGNS - 3 Contrast matchups setup directly inside home dashboard */}
          <div>
            <label className="text-[9px] font-extrabold text-cyan-300 uppercase tracking-widest mb-2 block text-center">
              Piece Styling • جۆری بەردەکان
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5">
              {PIECE_MATCHUPS_3.map((pStyle) => {
                const isSelected = pieceStyle === pStyle.id;
                let activeClass = '';
                if (isSelected) {
                  if (pStyle.id === 'WHITE_BLACK') activeClass = 'bg-gradient-to-br from-cyan-500/25 to-black text-cyan-200 border-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.15)]';
                  else if (pStyle.id === 'GOLD_BLACK') activeClass = 'bg-gradient-to-br from-cyan-500/25 to-[#051122] text-cyan-200 border-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.15)]';
                  else activeClass = 'bg-gradient-to-br from-cyan-500/25 to-[#051122] text-cyan-300 border-cyan-400 shadow-[0_2px_10px_rgba(6,182,212,0.15)]';
                } else {
                  activeClass = 'bg-white/5 border-transparent hover:bg-white/10 text-neutral-400';
                }
                return (
                  <button
                    key={pStyle.id}
                    onClick={() => setPieceStyle(pStyle.id)}
                    className={`p-1.5 rounded-lg border text-[11px] transition-all duration-300 flex flex-col justify-center items-center text-center cursor-pointer ${activeClass} ${isSelected ? 'scale-101 font-black border-cyan-500' : 'font-semibold'}`}
                  >
                    <span className="leading-tight text-[9px]">
                      {lang === 'KU' ? pStyle.nameKu : lang === 'AR' ? pStyle.nameAr : pStyle.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time-Attack Mode (تاقیکرمانەوەی خێرا) Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 mt-0.5 select-none">
            <div className="flex items-center gap-2">
              <span className="text-base">⏱️</span>
              <div className="text-left">
                <h4 className="text-[11px] font-black text-white text-right ltr:text-left">
                  {lang === 'KU' ? 'مۆدی تاقیکردنەوەی خێرا (Time-Attack)' : lang === 'AR' ? 'وضع هجوم الوقت السريع' : 'Time-Attack Blitz'}
                </h4>
                <p className="text-[9px] text-neutral-400 mt-0.5 font-semibold text-right ltr:text-left">
                  {lang === 'KU' ? '٣ خولەکی فەرمی بۆ بڕیاردانی خێرا' : lang === 'AR' ? '3 دقائق لكل لاعب لتسريع اللعب' : '3 minutes chess clock per side'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTimeAttack(!timeAttack)}
              className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                timeAttack
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/35 shadow-md'
                  : 'bg-white/5 text-neutral-400 border-transparent hover:bg-white/10'
              }`}
            >
              {timeAttack ? (lang === 'KU' ? 'کارایە' : lang === 'AR' ? 'نشط' : 'Enabled') : (lang === 'KU' ? 'ناچالاک' : lang === 'AR' ? 'غير نشط' : 'Disabled')}
            </button>
          </div>

          {mode === 'CAMPAIGN' && (
            <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center flex flex-col items-center justify-center gap-1.5 mt-1">
              <div className="text-[10px] font-bold text-neutral-300">
                {lang === 'KU' ? 'دژبەری کارا:' : lang === 'AR' ? 'الخصم الحاضر:' : 'Target Boss:'}{' '}
                <span className="text-amber-400 font-extrabold text-xs block mt-0.5">
                  {activeCampaignBoss 
                    ? (lang === 'KU' ? `👑 ${activeCampaignBoss.nameKu} (${activeCampaignBoss.titleKu})` : lang === 'AR' ? `👑 ${activeCampaignBoss.nameAr} (${activeCampaignBoss.titleAr})` : `👑 ${activeCampaignBoss.nameEn} (${activeCampaignBoss.titleEn})`)
                    : (lang === 'KU' ? 'هیچ هەڵنەبژێردراوە' : lang === 'AR' ? 'بدون اختيار' : 'None Selected')}
                </span>
              </div>
              <button
                onClick={() => setShowCampaign(true)}
                className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 rounded-lg text-[10px] font-black text-amber-300 transition-all cursor-pointer"
              >
                {lang === 'KU' ? 'نەخشەی ڕێگای پاڵەوانیەتی 🏆' : lang === 'AR' ? 'خريطة درب البطولة 🏆' : 'Open Campaign Map 🏆'}
              </button>
            </div>
          )}

          {/* Primary Launch Action button */}
          <div className="pt-0.5">
            {cooldownRemaining > 0 ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="relative w-full h-11 overflow-hidden rounded-xl bg-neutral-900 border border-red-500/30 text-red-400 font-extrabold text-xs flex items-center justify-center gap-1.5 font-sans opacity-85 select-none"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="tracking-wide text-[10px] sm:text-[11px]">
                    {getCooldownString()}
                  </span>
                </button>
                <p className="text-[10px] text-center text-neutral-400 font-bold leading-normal max-w-xs mx-auto">
                  {lang === 'KU' 
                    ? 'کۆینەکانت بووە بە ٠! نابێت یاری بکەیت تا ١ سەعات تێنەپەڕێت؛ دواتر خۆکارانە دەبێتەوە بە ٤٠ کۆین بۆ ئەوەی بتوانیت یاری بکەیتەوە.' 
                    : lang === 'AR' 
                    ? 'لقد نفدت الكوينات! لا يمكنك اللعب حتى مرور ساعة واحدة؛ وبعدها ستحصل تلقائياً على 40 كوين لمواصلة اللعب.' 
                    : 'Your coins are 0! You cannot play until 1 hour has passed; then they will automatically restore to 40 coins.'}
                </p>
              </div>
            ) : (
              <button
                onClick={handleStartAction}
                className="premium-play-button w-full h-12 rounded-xl text-neutral-950 font-black text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 select-none hover:brightness-110 active:scale-95 border border-amber-300/30"
              >
                <Play className="w-4 h-4 fill-current text-neutral-955" />
                <span className="tracking-wide uppercase font-black text-xs sm:text-sm">
                  {mode === 'CAMPAIGN' && activeCampaignBoss 
                    ? (lang === 'KU' ? `بەرەنگاربوونەوەی ${activeCampaignBoss.nameKu}` : lang === 'AR' ? `تحدي ${activeCampaignBoss.nameAr}` : `Challenge ${activeCampaignBoss.nameEn}`)
                    : (lang === 'KU' ? 'یاری بکە' : lang === 'AR' ? 'ابدأ اللعب' : 'Play Game')}
                </span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating Horizontal Navigation Utility Footer under Home Grid */}
      <div className="w-full max-w-md mt-4 flex justify-between gap-2 items-center px-1 z-20 shrink-0 select-none">
        {/* Button 1: Play Store Policies */}
        <button
          onClick={() => setShowPlayStorePolicies(true)}
          className="flex-1 py-1.5 sm:py-2 px-1 rounded-xl bg-[#09090e]/95 hover:bg-neutral-800 border border-amber-500/10 hover:border-cyan-500/30 text-neutral-300 hover:text-cyan-400 text-[9px] sm:text-[10px] font-black tracking-wide transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 active:scale-95 shadow-lg shadow-black/85"
        >
          <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate leading-none">
            {lang === 'KU' ? 'یاساکانی پڵەی ستۆر' : lang === 'AR' ? 'سياسات المتجر' : 'Store Rules'}
          </span>
        </button>

        {/* Button 2: Rules of Dama */}
        <button
          onClick={() => setShowDamaRules(true)}
          className="flex-1 py-1.5 sm:py-2 px-1 rounded-xl bg-[#09090e]/95 hover:bg-neutral-800 border border-amber-500/10 hover:border-amber-500/30 text-neutral-300 hover:text-amber-400 text-[9px] sm:text-[10px] font-black tracking-wide transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 active:scale-95 shadow-lg shadow-black/85"
        >
          <BookOpen className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate leading-none">
            {lang === 'KU' ? 'یاساکانی یاری دامە' : lang === 'AR' ? 'قوانين ياری دامە' : 'Dama Rules'}
          </span>
        </button>

        {/* Button 3: About Us & Apps Portfolio */}
        <button
          onClick={() => { window.location.href = '/kosrat.html'; }}
          className="flex-1 py-1.5 sm:py-2 px-1 rounded-xl bg-[#09090e]/95 hover:bg-neutral-800 border border-amber-500/10 hover:border-indigo-500/30 text-neutral-300 hover:text-indigo-400 text-[9px] sm:text-[10px] font-black tracking-wide transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 active:scale-95 shadow-lg shadow-black/85"
        >
          <UserCheck className="w-3 h-3 text-indigo-400 shrink-0" />
          <span className="truncate leading-none">
            {lang === 'KU' ? 'بەرنامەکانم و دەربارە' : lang === 'AR' ? 'المطور وتطبيقاتي' : 'About & Apps'}
          </span>
        </button>
      </div>
    </div>
  );
}
