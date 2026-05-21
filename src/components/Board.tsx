import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Piece from './Piece';

export type BoardTheme = 'CLASSIC' | 'EMERALD' | 'GOLD' | 'ROYAL' | 'DARK_NEON' | 'CHERRY' | 'OCEAN';
export type PieceStyle = 'CLASSIC' | 'BLACK_WHITE' | 'GOLD_BLACK' | 'NEON_GLOW' | 'WOODEN';

interface BoardProps {
  gameState: any;
  dispatch: React.Dispatch<any>;
  theme?: BoardTheme;
  pieceStyle?: PieceStyle;
  disabled?: boolean;
}

export default function Board({ 
  gameState, 
  dispatch, 
  theme = 'CLASSIC', 
  pieceStyle = 'CLASSIC',
  disabled = false 
}: BoardProps) {

  const colors = useMemo(() => {
    switch (theme) {
      case 'EMERALD': return { dark: 'bg-emerald-800', light: 'bg-emerald-100', border: 'border-emerald-500' };
      case 'GOLD': return { dark: 'bg-amber-700', light: 'bg-amber-100', border: 'border-amber-500' };
      case 'ROYAL': return { dark: 'bg-violet-800', light: 'bg-violet-100', border: 'border-violet-500' };
      case 'DARK_NEON': return { dark: 'bg-slate-900', light: 'bg-slate-700', border: 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' };
      case 'CHERRY': return { dark: 'bg-rose-900', light: 'bg-rose-100', border: 'border-rose-500' };
      case 'OCEAN': return { dark: 'bg-sky-800', light: 'bg-cyan-100', border: 'border-sky-400' };
      case 'CLASSIC':
      default: return { dark: 'bg-slate-700', light: 'bg-slate-200', border: 'border-slate-500' };
    }
  }, [theme]);

  const handleSquareClick = (r: number, c: number) => {
    if (disabled || gameState.winner) return;
    dispatch({ type: 'SELECT_OR_MOVE', payload: { r, c } });
  };

  if (!gameState || !gameState.board) return <div className="text-white">تەختەکە ئامادە نییە...</div>;

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-[400px]">
      <div className={`grid grid-cols-8 gap-0 p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-2xl border-4 ${colors.border} bg-white/5`}>
        {gameState.board.map((row: any[], r: number) =>
          row.map((piece: any, c: number) => {
            const isDark = (r + c) % 2 === 1;
            const isSelected = gameState.selectedPos?.r === r && gameState.selectedPos?.c === c;
            const isMustJump = gameState.mustJumpPos?.r === r && gameState.mustJumpPos?.c === c;
            const isValidMove = false; // ئەگەر لۆجیکەکەت هەبوو لێرە دەیکەیت بە ڕاست

            return (
              <div
                key={`cell-${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-colors duration-200
                  ${isDark ? colors.dark : colors.light}
                  ${isSelected ? 'ring-inset ring-4 ring-cyan-400 brightness-110 z-10 scale-105 rounded-lg' : ''}
                  ${isMustJump ? 'ring-inset ring-4 ring-rose-500 animate-pulse z-10' : ''}
                  ${r === 0 && isDark ? 'rounded-tl-lg' : ''}
                  ${r === 0 && c === 7 && isDark ? 'rounded-tr-lg' : ''}
                  ${r === 7 && c === 0 && isDark ? 'rounded-bl-lg' : ''}
                  ${r === 7 && c === 7 && isDark ? 'rounded-br-lg' : ''}
                  overflow-visible
                `}
              >
                {/* نیشاندانی خاڵ بۆ شوێنە گونجاوەکان گەر پێویست بوو */}
                {isValidMove && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="absolute w-3 h-3 bg-cyan-400/60 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] pointer-events-none"
                  />
                )}

                <AnimatePresence>
                  {piece && (
                    <motion.div
                      layoutId={piece.id} // ئەمە خاڵی گۆڕانکارییەکەیە! وا دەکات بەردەکە بخلیسکێت
                      key={piece.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                      <Piece piece={piece} styleType={pieceStyle} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* ئەنیمەیشنی بردنەوە */}
      <AnimatePresence>
        {gameState.winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-slate-900/90 backdrop-blur-md border-2 border-cyan-400 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(34,211,238,0.4)] pointer-events-auto">
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
                {gameState.winner === 'CYAN' ? 'شین بردیەوە! 🎉' : 'سپی بردیەوە! 🎉'}
              </h2>
              <button
                onClick={() => dispatch({ type: 'RESET_GAME' })}
                className="mt-6 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl w-full transition-transform active:scale-95 cursor-pointer"
              >
                دووبارە یاریکردنەوە
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}