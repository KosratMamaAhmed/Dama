import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Piece from './Piece';
import { BoardTheme, GameState } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { RefreshCw, Home } from 'lucide-react';

interface BoardProps {
  gameState: GameState;
  dispatch: React.Dispatch<any>;
  theme: BoardTheme;
  disabled: boolean;
  p1Name: string;
  p2Name: string;
  onRestart: () => void;
  onGoHome: () => void;
  lang: Language;
  pieceStyle: string;
}

export default function Board({ gameState, dispatch, theme, disabled, onRestart, lang, pieceStyle }: BoardProps) {
  const dict = TRANSLATIONS[lang];

  // ڕێکخستنی ڕەنگەکانی تەختە بەپێی ئەو تێمەی هەڵبژێردراوە
  const colors = useMemo(() => {
    switch (theme) {
      case 'EMERALD': return { dark: 'bg-emerald-800/80', light: 'bg-emerald-100/80', border: 'border-emerald-500/30' };
      case 'GOLD': return { dark: 'bg-amber-700/80', light: 'bg-amber-100/80', border: 'border-amber-500/30' };
      case 'ROYAL': return { dark: 'bg-violet-800/80', light: 'bg-violet-100/80', border: 'border-violet-500/30' };
      case 'KURDISH_WOOD': return { dark: 'bg-amber-900/90', light: 'bg-amber-200/90', border: 'border-amber-700/50' };
      case 'GOLD_BLACK': return { dark: 'bg-black/90', light: 'bg-amber-400/90', border: 'border-amber-500/50' };
      case 'BLUE_BROWN': return { dark: 'bg-sky-700/80', light: 'bg-amber-100/80', border: 'border-sky-500/30' };
      case 'TOKYO_NEON': return { dark: 'bg-purple-900/90', light: 'bg-cyan-200/90', border: 'border-fuchsia-500/50' };
      case 'COSMIC_VOID': return { dark: 'bg-slate-900/90', light: 'bg-indigo-200/90', border: 'border-indigo-500/50' };
      default: return { dark: 'bg-slate-700/80', light: 'bg-slate-200/80', border: 'border-slate-500/30' };
    }
  }, [theme]);

  const handleSquareClick = (r: number, c: number) => {
    if (disabled || gameState.winner) return;
    dispatch({ type: 'SELECT_OR_MOVE', payload: { r, c } });
  };

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-[400px]">
      <div className={`grid grid-cols-8 gap-0 p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl backdrop-blur-md shadow-2xl border ${colors.border} bg-white/5`}>
        {gameState.board.map((row, r) =>
          row.map((piece, c) => {
            const isDark = (r + c) % 2 === 1;
            const isSelected = gameState.selectedPos?.r === r && gameState.selectedPos?.c === c;
            const isValidMove = gameState.validMoves.some(m => m.r === r && m.c === c);
            const isMustJump = gameState.mustJumpPos?.r === r && gameState.mustJumpPos?.c === c;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  relative w-10 h-10 sm:w-[3.25rem] sm:h-[3.25rem] md:w-14 md:h-14 flex items-center justify-center transition-colors duration-200
                  ${isDark ? colors.dark : colors.light}
                  ${isSelected ? 'ring-inset ring-4 ring-cyan-400 brightness-110' : ''}
                  ${isMustJump ? 'ring-inset ring-2 ring-rose-500 animate-pulse' : ''}
                  ${r === 0 && isDark ? 'rounded-tl-lg' : ''}
                  ${r === 0 && c === 7 && isDark ? 'rounded-tr-lg' : ''}
                  ${r === 7 && c === 0 && isDark ? 'rounded-bl-lg' : ''}
                  ${r === 7 && c === 7 && isDark ? 'rounded-br-lg' : ''}
                `}
              >
                {isValidMove && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-cyan-400/60 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] pointer-events-none"
                  />
                )}
                <AnimatePresence>
                  {piece && (
                    <motion.div
                      key={piece.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute inset-0 flex items-center justify-center"
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
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm rounded-3xl"
          >
            <div className="bg-slate-900 border-2 border-cyan-400/50 p-6 rounded-3xl text-center shadow-[0_0_50px_rgba(34,211,238,0.2)]">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
                {gameState.winner === 'CYAN' ? dict.P1_WINS : dict.P2_WINS}
              </h2>
              <p className="text-white/60 mb-6 font-bold">{dict.GAME_OVER}</p>
              <button
                onClick={onRestart}
                className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl transition-all active:scale-95 shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                <span>دەستپێکردنەوە</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}