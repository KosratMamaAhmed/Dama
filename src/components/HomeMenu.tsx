import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Users, Palette, Gem } from 'lucide-react';

export default function HomeMenu({ setScreen, setMode, theme, setTheme, pieceFlag, setPieceFlag }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
      className="z-10 flex flex-col items-center w-full max-w-md pt-8 px-5 space-y-8 relative pb-10"
      dir="rtl"
    >
      <div className="text-center space-y-3 mt-10">
        <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold bg-cyan-900/30 px-5 py-2 rounded-full border border-cyan-400/30">
          DAMA CURDISH • ئۆفلاین
        </span>
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500 drop-shadow-2xl py-2">
          دامەی کوردی
        </h1>
      </div>

      <div className="w-full space-y-4">
        <button onClick={() => { setMode('AI'); setScreen('SETUP_AI'); }} className="group w-full flex items-center justify-between p-5 bg-black/40 hover:bg-black/60 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl transition-all active:scale-95 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-slate-900 transition-all"><Cpu className="w-6 h-6" /></div>
            <div className="text-right">
              <p className="text-lg font-black text-white">یاری لەگەڵ ماشێن</p>
              <p className="text-xs text-white/50">خێرا بێ بیرکردنەوە</p>
            </div>
          </div>
        </button>

        <button onClick={() => { setMode('FRIEND'); setScreen('SETUP_FRIEND'); }} className="group w-full flex items-center justify-between p-5 bg-black/40 hover:bg-black/60 border border-indigo-500/30 hover:border-indigo-400 rounded-2xl transition-all active:scale-95 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-400 group-hover:text-slate-900 transition-all"><Users className="w-6 h-6" /></div>
            <div className="text-right">
              <p className="text-lg font-black text-white">یاری لەگەڵ هاوڕێ</p>
              <p className="text-xs text-white/50">یاریکردن لەسەر یەک شاشە</p>
            </div>
          </div>
        </button>
      </div>

      {/* ڕێکخستنی دیزاینەکان */}
      <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 space-y-5 backdrop-blur-md">
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-cyan-400"><Palette className="w-5 h-5" /><h3 className="font-black text-sm">دیزاینی تەختەی یاری</h3></div>
          <div className="grid grid-cols-2 gap-2">
            {[ 
              { key: 'CLASSIC_WOOD', label: 'تەختەی کلاسیک', color: 'bg-[#5c4033]' }, 
              { key: 'DARK_MARBLE', label: 'مەڕمەڕی تاریک', color: 'bg-slate-900' },
              { key: 'VINTAGE_STONE', label: 'کۆنی ڤینتەیج', color: 'bg-[#8d6e63]' },
              { key: 'ROYAL_GOLD', label: 'شاهانەی گۆڵد', color: 'bg-amber-900' }
            ].map((t) => (
              <button key={t.key} onClick={() => setTheme(t.key)} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-black transition-all ${ theme === t.key ? 'bg-amber-500/20 border-amber-400 text-white shadow-md' : 'bg-black/20 border-white/5 text-white/60 hover:text-white' }`}>
                <span className={`w-4 h-4 rounded-full border border-white/30 ${t.color}`} /><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 text-emerald-400"><Gem className="w-5 h-5" /><h3 className="font-black text-sm">شێوەی بەردەکان (بەردی ناڕێک)</h3></div>
          <div className="grid grid-cols-1 gap-2">
            {[ 
              { key: 'WHITE_BLACK', label: 'سپی تۆخ و ڕەش (کلاسیک)' }, 
              { key: 'GOLD_BLACK', label: 'گۆڵد و ڕەش (شاهانە)' },
              { key: 'RUBY_EMERALD', label: 'بەردی یاقووت و زمروود' },
              { key: 'WOODEN_ROCK', label: 'بەردی دارین' }
            ].map((p) => (
              <button key={p.key} onClick={() => setPieceFlag(p.key)} className={`flex items-center justify-between p-3 rounded-xl border text-xs font-black transition-all ${ pieceFlag === p.key ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md' : 'bg-black/20 border-white/5 text-white/60 hover:text-white' }`}>
                <span>{p.label}</span>
                {pieceFlag === p.key && <span className="text-emerald-400">✓</span>}
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}