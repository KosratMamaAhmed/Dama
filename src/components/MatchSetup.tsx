import React from 'react';
import { motion } from 'motion/react';
import { User, Play, ChevronRight, Cpu } from 'lucide-react';
import { ScreenType } from '../App';
import { Difficulty } from '../types';
import { TRANSLATIONS, Language } from '../translations';

interface Props {
  mode: 'AI' | 'FRIEND';
  screen: ScreenType;
  setScreen: (s: ScreenType) => void;
  lang: Language;
  player1Name: string;
  setPlayer1Name: (s: string) => void;
  player2Name: string;
  setPlayer2Name: (s: string) => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  startGame: () => void;
}

export default function MatchSetup({ mode, setScreen, lang, player1Name, setPlayer1Name, player2Name, setPlayer2Name, difficulty, setDifficulty, startGame }: Props) {
  const dict = TRANSLATIONS[lang];
  const isRtl = lang === 'KU' || lang === 'AR';

  return (
    <motion.div initial={{ opacity: 0, x: isRtl ? 40 : -40 }} animate={{ opacity: 1, x: 0 }} className="z-10 flex flex-col w-full max-w-md px-6 pt-10 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => setScreen('HOME')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 transition-colors">
          <ChevronRight className={`w-6 h-6 ${isRtl ? '' : 'rotate-180'}`} />
        </button>
        <h2 className="text-3xl font-black text-white">{mode === 'AI' ? dict.PLAY_AI : dict.PLAY_FRIEND}</h2>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-3xl p-6 space-y-6 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <label className="text-white/70 font-bold text-sm">یاریزانی یەکەم (شین)</label>
          <div className="relative">
            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
            <input type="text" value={player1Name} onChange={e => setPlayer1Name(e.target.value)} placeholder="ناوی یاریزان..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 font-bold" />
          </div>
        </div>

        {mode === 'FRIEND' ? (
          <div className="space-y-2">
            <label className="text-white/70 font-bold text-sm">یاریزانی دووەم (سپی)</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
              <input type="text" value={player2Name} onChange={e => setPlayer2Name(e.target.value)} placeholder="ناوی یاریزان..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 font-bold" />
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <label className="text-white/70 font-bold text-sm">ئاستی زیرەکی دەستکرد</label>
            <div className="grid grid-cols-1 gap-2">
              {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as Difficulty[]).map(level => (
                <button key={level} onClick={() => setDifficulty(level)} className={`p-4 rounded-2xl text-sm font-bold transition-all flex justify-between items-center ${ difficulty === level ? 'bg-cyan-500/20 border-2 border-cyan-400/50 text-cyan-300 shadow-lg shadow-cyan-500/20' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10' }`}>
                  <span>{level}</span>
                  {difficulty === level && <Cpu className="w-5 h-5 animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button onClick={startGame} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 py-5 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-95 transition-all">
        <Play className="w-6 h-6 fill-current" />
        <span>دەستپێکردن</span>
      </button>
    </motion.div>
  );
}