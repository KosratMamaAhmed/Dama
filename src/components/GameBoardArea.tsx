import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, RefreshCw, Cpu, Loader2 } from 'lucide-react';
import Board from './Board';
import { getAIMove } from '../ai';

export default function GameBoardArea({ gameState, dispatch, mode, difficulty, setScreen }: any) {
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (mode === 'AI' && gameState.turn === 'WHITE' && !gameState.winner) {
      setIsThinking(true);
      
      // چاوەڕێ دەکات تا ئەنیمەیشنی پێشوو تەواو دەبێت، پاشان بیر دەکاتەوە
      const timer = setTimeout(() => {
        const aiMove = getAIMove(gameState.board, difficulty, 'WHITE', gameState.mustJumpPos);
        
        if (aiMove) {
          // دیاریکردنی بەردەکە
          dispatch({ type: 'SELECT_OR_MOVE', payload: { r: aiMove.r, c: aiMove.c } });
          
          // چاوەڕێ دەکات ٤٠٠ میللی چرکە پێش ئەوەی بیجووڵێنێت بۆ ئەوەی بینەر بیبینێت
          setTimeout(() => {
            dispatch({ type: 'SELECT_OR_MOVE', payload: { r: aiMove.dest.r, c: aiMove.dest.c } });
            setIsThinking(false);
          }, 400); 
        } else {
          setIsThinking(false);
        }
      }, 300); // 300ms باشترین کاتە بۆ ڕێگریکردن لە Freeze.

      return () => clearTimeout(timer);
    }
  }, [mode, difficulty, gameState.turn, gameState.winner, gameState.board, dispatch]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="flex flex-col items-center justify-center min-h-[100dvh] w-full p-4 space-y-6"
    >
      
      <div className="w-full max-w-[400px] flex justify-between items-center bg-black/40 backdrop-blur-xl border border-white/10 p-3 rounded-3xl shadow-lg">
        <button onClick={() => setScreen('HOME')} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer">
          <Home className="w-5 h-5 text-white" />
        </button>
        
        <div className="text-sm font-black text-cyan-400 drop-shadow-md tracking-wider">
          <AnimatePresence mode="wait">
            <motion.span
              key={gameState.turn}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="inline-block"
            >
              {gameState.turn === 'CYAN' ? 'سەرەی تۆیە 🥷🏽' : (mode === 'AI' ? 'سەرەی ڕۆبۆتە 🤖' : 'سەرەی بەرامبەرە 👴🏽')}
            </motion.span>
          </AnimatePresence>
        </div>

        <button onClick={() => dispatch({ type: 'RESET_GAME' })} className="p-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl transition-all border border-cyan-500/30 cursor-pointer">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className={`w-full max-w-[400px] p-4 rounded-3xl border-2 flex items-center justify-between transition-all duration-300 ${
        gameState.turn === 'WHITE' && !gameState.winner ? 'bg-white/10 border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-[1.02]' : 'bg-black/20 border-transparent opacity-60'
      }`}>
        <div className="flex items-center gap-3 text-4xl">
          {mode === 'AI' ? '🤖' : '👴🏽'}
          <AnimatePresence>
            {isThinking && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/30 overflow-hidden whitespace-nowrap">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-[10px] text-indigo-300 font-bold">بیردەکاتەوە...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-white">{mode === 'AI' ? 'مێشکی دەستکرد' : 'یاریزانی سپی'}</p>
          {mode === 'AI' && (
            <p className="text-[10px] text-cyan-400 flex items-center justify-end gap-1 mt-1 font-bold"><Cpu className="w-3 h-3" /> ئاستی {difficulty}</p>
          )}
        </div>
      </div>

      <div className="w-full flex justify-center z-10 shadow-2xl drop-shadow-2xl">
        <Board 
          gameState={gameState} 
          dispatch={dispatch} 
          theme="DARK_NEON"       
          pieceStyle="NEON_GLOW"  
          disabled={mode === 'AI' && gameState.turn === 'WHITE'} 
        />
      </div>

      <div className={`w-full max-w-[400px] p-4 rounded-3xl border-2 flex items-center justify-between transition-all duration-300 ${
        gameState.turn === 'CYAN' && !gameState.winner ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-[1.02]' : 'bg-black/20 border-transparent opacity-60'
      }`}>
        <div className="text-4xl">🥷🏽</div>
        <div className="text-right">
          <p className="text-lg font-black text-cyan-400">یاریزانی شین</p>
          <p className="text-[10px] text-cyan-400/60 font-bold mt-1">تۆ</p>
        </div>
      </div>

    </motion.div>
  );
}