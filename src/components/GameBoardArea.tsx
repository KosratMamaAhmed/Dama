import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, RefreshCw, Cpu } from 'lucide-react';
import Board from './Board';
import { getAIMove } from '../ai';

export default function GameBoardArea({ gameState, dispatch, mode, difficulty, setScreen, theme, pieceFlag }: any) {
  
  // لۆجیکی زیرەکی دەستکرد بە خێرایی باڵا بێ هیچ چاوەڕوانییەک (Instant Move)
  useEffect(() => {
    if (mode === 'AI' && gameState.turn === 'WHITE' && !gameState.winner) {
      // تەنها ١٠ میللی چرکە دەوەستێت بۆ ئەوەی ڕووکارەکە وشەی "سەرەی ڕۆبۆتە" نیشان بدات
      const timer = setTimeout(() => {
        const aiMove = getAIMove(gameState.board, difficulty, 'WHITE', gameState.mustJumpPos);
        if (aiMove) {
          dispatch({ type: 'SELECT_OR_MOVE', payload: { r: aiMove.r, c: aiMove.c } });
          // ڕاستەوخۆ دەیباتە شوێنی خۆی
          dispatch({ type: 'SELECT_OR_MOVE', payload: { r: aiMove.dest.r, c: aiMove.dest.c } });
        }
      }, 10); 
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
              {gameState.turn === 'CYAN' ? 'سەرەی تۆیە 🥷🏽' : (mode === 'AI' ? 'ڕۆبۆت جوڵا 🤖' : 'سەرەی بەرامبەرە 👴🏽')}
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
        <div className="text-4xl">{mode === 'AI' ? '🤖' : '👴🏽'}</div>
        <div className="text-right">
          <p className="text-lg font-black text-white">{mode === 'AI' ? 'وەستای دەستکرد' : 'یاریزانی ڕەش/سپی'}</p>
          {mode === 'AI' && (
            <p className="text-[10px] text-cyan-400 flex items-center justify-end gap-1 mt-1 font-bold"><Cpu className="w-3 h-3" /> ئاستی {difficulty}</p>
          )}
        </div>
      </div>

      <div className="w-full flex justify-center z-10 shadow-2xl drop-shadow-2xl">
        <Board 
          gameState={gameState} 
          dispatch={dispatch} 
          theme={theme || 'CLASSIC_WOOD'}       
          pieceStyle={pieceFlag || 'WHITE_BLACK'}  
          disabled={mode === 'AI' && gameState.turn === 'WHITE'} 
        />
      </div>

      <div className={`w-full max-w-[400px] p-4 rounded-3xl border-2 flex items-center justify-between transition-all duration-300 ${
        gameState.turn === 'CYAN' && !gameState.winner ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-[1.02]' : 'bg-black/20 border-transparent opacity-60'
      }`}>
        <div className="text-4xl">🥷🏽</div>
        <div className="text-right">
          <p className="text-lg font-black text-cyan-400">یاریزانی سەرەکی</p>
          <p className="text-[10px] text-cyan-400/60 font-bold mt-1">تۆ</p>
        </div>
      </div>

    </motion.div>
  );
}