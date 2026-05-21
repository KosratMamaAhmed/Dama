import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Users, BookOpen, ShieldAlert, Sparkles, Palette, Globe } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { ScreenType } from '../App';

interface Props {
  setScreen: (s: ScreenType) => void;
  lang: Language;
  setLang: (l: Language) => void;
  setMode: (m: 'AI' | 'FRIEND') => void;
  theme: string;
  setTheme: (t: any) => void;
  pieceFlag: string;
  setPieceFlag: (p: string) => void;
}

export default function HomeMenu({ setScreen, lang, setLang, setMode, theme, setTheme, pieceFlag, setPieceFlag }: Props) {
  const dict = TRANSLATIONS[lang];
  const isRtl = lang === 'KU' || lang === 'AR';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="z-10 flex flex-col items-center w-full max-w-md pt-8 px-5 space-y-8 relative"
    >
      <div className="absolute top-4 right-4 flex gap-2 z-50">
        {(['KU', 'EN', 'AR'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all backdrop-blur-md ${
              lang === l ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
            }`}
          >
            {l === 'KU' ? 'کوردی' : l === 'AR' ? 'عربي' : 'EN'}
          </button>
        ))}
      </div>

      <div className="text-center space-y-3 mt-10">
        <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold bg-cyan-900/30 px-5 py-2 rounded-full border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
          DAMA CURDISH • ئۆفلاین
        </span>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 drop-shadow-2xl py-2 cursor-pointer select-none">
          {dict.TITLE}
        </h1>
      </div>

      <div className="w-full space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <button
          onClick={() => { setMode('AI'); setScreen('SETUP_AI'); }}
          className="group w-full flex items-center justify-between p-5 bg-black/40 hover:bg-black/60 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-lg overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 bg-cyan-500/20 border border-cyan-400/40 rounded-xl text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-slate-900 transition-all">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white">{dict.PLAY_AI}</p>
              <p className="text-xs text-white/50">{dict.EASY} • {dict.MEDIUM} • {dict.HARD}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => { setMode('FRIEND'); setScreen('SETUP_FRIEND'); }}
          className="group w-full flex items-center justify-between p-5 bg-black/40 hover:bg-black/60 border border-indigo-500/30 hover:border-indigo-400 rounded-2xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-lg overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
          <div className="flex items-center gap-4 z-10">
            <div className="p-3 bg-indigo-500/20 border border-indigo-400/40 rounded-xl text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-400 group-hover:text-slate-900 transition-all">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white">{dict.PLAY_FRIEND}</p>
              <p className="text-xs text-white/50">یاریکردن لەسەر یەک مۆبایل</p>
            </div>
          </div>
        </button>
      </div>

      <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5 backdrop-blur-md">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Palette className="w-5 h-5" />
            <h3 className="font-black text-sm">{dict.BOARD_THEME}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[ { key: 'CLASSIC', label: dict.THEME_CLASSIC, color: 'bg-slate-700' }, { key: 'EMERALD', label: dict.THEME_EMERALD, color: 'bg-emerald-700' } ].map((t) => (
              <button key={t.key} onClick={() => setTheme(t.key)} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-black transition-all ${ theme === t.key ? 'bg-amber-500/20 border-amber-400 text-white shadow-md' : 'bg-black/20 border-white/5 text-white/60 hover:text-white' }`}>
                <span className={`w-4 h-4 rounded-full ${t.color}`} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}