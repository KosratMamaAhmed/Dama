import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, RefreshCw, Volume2, VolumeX, Clock } from 'lucide-react';
import Board from './Board';
import { getAIMove } from '../ai';
import { useDropSound } from '../useSound';
import { GameMode, Difficulty, BoardTheme, GameState } from '../types';
import { ScreenType } from '../App';
import { TRANSLATIONS, Language } from '../translations';

interface Props {
  gameState: GameState;
  dispatch: React.Dispatch<any>;
  mode: GameMode;
  difficulty: Difficulty;
  theme: BoardTheme;
  pieceFlag: string;
  lang: Language;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  seconds: number;
  player1Name: string;
  player2Name: string;
  setScreen: (s: ScreenType) => void;
  handleFullReset: () => void;
}

export default function GameBoardArea({ gameState, dispatch, mode, difficulty, theme, pieceFlag, lang, soundEnabled, setSoundEnabled, seconds, player1Name, player2Name, setScreen, handleFullReset }: Props) {
  const playSound = useDropSound();
  const dict = TRANSLATIONS[lang];
  const p1 = player1Name || 'شین';
  const p2 = mode === 'AI' ? 'ڕۆبۆت 🤖' : (player2Name || 'سپی');

  // لۆجیکی زیرەکی دەستکردی ئۆفلاین (خێرا و بێ کێشە)
  useEffect(() => {
    if (mode === 'AI' && gameState.turn === 'WHITE' && !gameState.winner) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(gameState.board, difficulty, 'WHITE', gameState.mustJumpPos);
        if (aiMove) {
          dispatch({ type: 'SELECT_OR_MOVE', payload: { r: aiMove.r, c: aiMove.c } });
          setTimeout(() => dispatch({ type: 'SELECT_OR_MOVE', payload: { r: aiMove.dest.r, c: aiMove.dest.c } }), 300);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mode, difficulty, gameState.turn, gameState.winner, gameState.board, dispatch]);

  const formatTime = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="z-10 flex flex-col w-full h-full max-w-3xl flex-1 items-center justify-center space-y-4 px-2">
      
      {/* توڵباری سەرەوە */}
      <div className="w-full flex justify-between items-center bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-3xl mt-4 z-20 shadow-lg">
        <div className="flex gap-2">
          <button onClick={() => setScreen('HOME')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
            <Home className="w-5 h-5 text-white" />
          </button>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
          </button>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/20 px-4 py-2 rounded-xl text-cyan-300 font-mono font-bold border border-indigo-500/30">
          <Clock className="w-4 h-4" />
          <span>{formatTime(seconds)}</span>
        </div>
        <button onClick={handleFullReset} className="p-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl transition-all border border-cyan-500/30">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* زانیاری یاریزانی دووەم */}
      <div className={`w-full max-w-md p-4 rounded-3xl border-2 flex items-center justify-between transition-all duration-300 ${gameState.turn === 'WHITE' && !gameState.winner ? 'bg-white/15 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105' : 'bg-black/20 border-transparent opacity-70'}`}>
        <div className="text-4xl">{mode === 'AI' ? '🤖' : '👴🏽'}</div>
        <div className="text-right">
          <p className="text-xl font-black text-white">{p2}</p>
        </div>
      </div>

      {/* تەختەی یاری */}
      <div className="w-full flex justify-center z-10 shadow-2xl">
        <Board 
          gameState={gameState} 
          dispatch={dispatch} 
          theme={theme} 
          disabled={mode === 'AI' && gameState.turn === 'WHITE'}
          p1Name={p1} p2Name={p2} onRestart={handleFullReset} onGoHome={() => setScreen('HOME')} lang={lang} pieceStyle={pieceFlag}
        />
      </div>

      {/* زانیاری یاریزانی یەکەم */}
      <div className={`w-full max-w-md p-4 rounded-3xl border-2 flex items-center justify-between transition-all duration-300 ${gameState.turn === 'CYAN' && !gameState.winner ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-105' : 'bg-black/20 border-transparent opacity-70'}`}>
        <div className="text-4xl">🥷🏽</div>
        <div className="text-right">
          <p className="text-xl font-black text-cyan-400">{p1}</p>
        </div>
      </div>

    </motion.div>
  );
}