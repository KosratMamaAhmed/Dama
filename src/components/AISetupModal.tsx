import React from 'react';
import { motion } from 'motion/react';
import { Bot, ChevronLeft } from 'lucide-react';
import { Language } from '../translations';
import { Difficulty } from '../types';

interface AISetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  playerName: string;
  setPlayerName: (name: string) => void;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  onStartGame: () => void;
  t: any;
}

export default function AISetupModal({
  isOpen,
  onClose,
  lang,
  playerName,
  setPlayerName,
  difficulty,
  setDifficulty,
  onStartGame,
  t
}: AISetupModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[120] p-4 pointer-events-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        className="bg-gradient-to-br from-slate-900 via-neutral-950 to-slate-900 border-2 border-amber-500/50 p-6 sm:p-8 rounded-3xl text-center shadow-[0_0_60px_rgba(245,158,11,0.5)] max-w-sm w-full relative overflow-hidden"
      >
        {/* Floating Clean Back Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 bg-white/5 hover:bg-neutral-800 border border-white/10 hover:border-amber-500/50 p-1 rounded-lg text-neutral-450 hover:text-amber-400 transition-all active:scale-90 cursor-pointer flex items-center justify-center z-50 shadow-md"
          title={lang === 'KU' ? 'گەڕانەوە' : 'Back'}
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>

        {/* Decorative glows */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl translate-x-10 translate-y-10" />

        {/* Icon Badge */}
        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-amber-400 via-yellow-450 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-yellow-200 mb-4">
          <Bot className="w-8 h-8 text-black" />
        </div>

        <h2 className="text-lg sm:text-xl font-black text-white leading-snug mb-1">
          {lang === 'KU' ? 'ڕێکخستنی یاری ژیری دەستکرد' : lang === 'AR' ? 'تجهيز مباراة الذكاء الاصطناعي' : 'AI Match Setup'}
        </h2>
        <p className="text-[11px] sm:text-xs text-neutral-400 font-bold mb-6">
          {lang === 'KU' ? 'ناوی خۆت و ئاستی زیرەکی دیاریبکە' : lang === 'AR' ? 'يرجى إدخال اسمك واختيار مستوى الصعوبة' : 'Enter details to launch your AI challenge'}
        </p>

        {/* Form Body */}
        <div className="space-y-5 text-left font-sans">
          {/* 1. Name Input */}
          <div>
            <label className="text-[10px] font-extrabold text-[#fbbf24] uppercase tracking-widest mb-2 block text-center">
              {lang === 'KU' ? 'ناوی تۆ • Your Name' : lang === 'AR' ? 'اسم اللاعب' : 'Your Name'}
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t.YOU}
              className="w-full bg-cyan-950/20 hover:bg-cyan-950/30 text-white text-sm font-black px-4 py-3 rounded-xl border border-amber-500/20 focus:border-amber-400 outline-none transition-all text-center placeholder-neutral-500"
            />
          </div>

          {/* 2. Difficulty Selection */}
          <div>
            <label className="text-[10px] font-extrabold text-[#fbbf24] uppercase tracking-widest mb-2 block text-center">
              {lang === 'KU' ? 'دیاریکردنی ئاستی زیرەکی • AI Level' : lang === 'AR' ? 'درجة الصعوبة' : 'Difficulty Level'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'EASY', nameKu: 'ئاسان (Easy)', nameAr: 'سهل', nameEn: 'Easy', border: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/30', active: 'border-emerald-500 bg-emerald-500 text-black shadow-[0_2px_10px_rgba(16,185,129,0.3)]' },
                { id: 'MEDIUM', nameKu: 'مامناوەند (Medium)', nameAr: 'متوسط', nameEn: 'Medium', border: 'border-amber-500/30 text-amber-400 bg-amber-950/20 hover:bg-amber-950/30', active: 'border-amber-500 bg-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3)]' },
                { id: 'HARD', nameKu: 'سەخت (Hard)', nameAr: 'صعب', nameEn: 'Hard', border: 'border-orange-500/30 text-orange-400 bg-orange-950/20 hover:bg-orange-950/30', active: 'border-orange-500 bg-orange-500 text-black shadow-[0_2px_10px_rgba(249,115,22,0.3)]' },
                { id: 'EXPERT', nameKu: 'زۆرزان (Expert)', nameAr: 'خبير', nameEn: 'Expert', border: 'border-rose-500/30 text-rose-400 bg-rose-950/20 hover:bg-rose-950/30', active: 'border-rose-500 bg-rose-500 text-black shadow-[0_2px_10px_rgba(239,68,68,0.3)]' }
              ].map((lvl) => {
                const isLvlSel = difficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficulty(lvl.id as Difficulty)}
                    className={`p-2 rounded-xl border text-[11px] font-black transition-all duration-200 cursor-pointer flex flex-col items-center justify-center leading-tight ${isLvlSel ? lvl.active : lvl.border}`}
                  >
                    <span>{lang === 'KU' ? lvl.nameKu : lang === 'AR' ? lvl.nameAr : lvl.nameEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/10"
            >
              {lang === 'KU' ? 'پاشگەزبوونەوە' : lang === 'AR' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={onStartGame}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:scale-[1.02] active:scale-95 text-[#050508] font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 border border-yellow-300/30 flex items-center justify-center gap-2"
            >
              <span>⚔️</span>
              <span>{lang === 'KU' ? 'دەستپێکردن' : lang === 'AR' ? 'بدء اللعب' : 'Launch'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
