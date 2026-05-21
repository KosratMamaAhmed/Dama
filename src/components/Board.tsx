import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Piece from './Piece';

export default function Board({ gameState, dispatch, theme = 'CLASSIC_WOOD', pieceStyle = 'WHITE_BLACK', disabled = false }: any) {

  // ڕەنگە شاهانە و کلاسیکەکانی تەختەی یاری
  const colors = useMemo(() => {
    switch (theme) {
      case 'CLASSIC_WOOD': return { dark: 'bg-[#5c4033]', light: 'bg-[#d7ccc8]', border: 'border-[#3e2723] shadow-[#3e2723]/50' };
      case 'DARK_MARBLE': return { dark: 'bg-slate-900', light: 'bg-slate-400', border: 'border-slate-700 shadow-slate-900/50' };
      case 'VINTAGE_STONE': return { dark: 'bg-[#8d6e63]', light: 'bg-[#efebe9]', border: 'border-[#5d4037] shadow-[#5d4037]/50' };
      case 'ROYAL_GOLD': return { dark: 'bg-amber-900', light: 'bg-amber-100', border: 'border-amber-600 shadow-amber-900/50' };
      case 'NATURE_GREEN': return { dark: 'bg-[#2e7d32]', light: 'bg-[#c8e6c9]', border: 'border-[#1b5e20] shadow-[#1b5e20]/50' };
      default: return { dark: 'bg-[#5c4033]', light: 'bg-[#d7ccc8]', border: 'border-[#3e2723]' };
    }
  }, [theme]);

  const handleSquareClick = (r: number, c: number) => {
    if (disabled || gameState.winner) return;
    dispatch({ type: 'SELECT_OR_MOVE', payload: { r, c } });
  };

  if (!gameState || !gameState.board) return null;

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-[420px]">
      {/* چوارچێوەی تەختەکە */}
      <div className={`grid grid-cols-8 gap-0 p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 ${colors.border} ${colors.light}`}>
        {gameState.board.map((row: any[], r: number) =>
          row.map((piece: any, c: number) => {
            const isDark = (r + c) % 2 === 1;
            const isSelected = gameState.selectedPos?.r === r && gameState.selectedPos?.c === c;
            const isMustJump = gameState.mustJumpPos?.r === r && gameState.mustJumpPos?.c === c;

            return (
              <div
                key={`cell-${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-colors duration-200
                  ${isDark ? colors.dark : colors.light}
                  ${isSelected ? 'ring-inset ring-4 ring-cyan-400 brightness-125 z-10 scale-105 rounded-lg shadow-lg' : ''}
                  ${isMustJump ? 'ring-inset ring-4 ring-rose-500 animate-pulse z-10 rounded-lg' : ''}
                  overflow-visible
                `}
              >
                <AnimatePresence>
                  {piece && (
                    <motion.div
                      layoutId={piece.id} 
                      key={piece.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
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

      <AnimatePresence>
        {gameState.winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-500 p-8 rounded-3xl text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] pointer-events-auto">
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-600 mb-2">
                {gameState.winner === 'CYAN' ? 'یاریزانی شین بردیەوە! 🎉' : 'یاریزانی ڕەش بردیەوە! 🎉'}
              </h2>
              <button
                onClick={() => dispatch({ type: 'RESET_GAME' })}
                className="mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl w-full transition-transform active:scale-95 cursor-pointer shadow-lg"
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