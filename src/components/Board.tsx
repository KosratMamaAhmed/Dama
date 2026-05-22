import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Piece from './Piece';

export default function Board({ gameState, dispatch, theme = 'CLASSIC_WOOD', pieceStyle = 'WHITE_BLACK', disabled = false, lang = 'KU', onGoHome, onRestart, p1Name, p2Name }: any) {

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
            const isHintSource = gameState.hintPos?.r === r && gameState.hintPos?.c === c;
            const isHintDest = gameState.hintPos?.dest?.r === r && gameState.hintPos?.dest?.c === c;

            return (
              <div
                key={`cell-${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-colors duration-200
                  ${isDark ? colors.dark : colors.light}
                  ${isSelected ? 'ring-inset ring-4 ring-cyan-400 brightness-125 z-10 scale-105 rounded-lg shadow-lg' : ''}
                  ${isMustJump ? 'ring-inset ring-4 ring-rose-500 animate-pulse z-10 rounded-lg' : ''}
                  ${isHintSource ? 'ring-inset ring-4 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.7)] z-10 rounded-lg animate-pulse' : ''}
                  overflow-visible
                `}
              >
                {isHintDest && (
                  <div className="absolute inset-2 border-2 border-dashed border-amber-400 rounded-full animate-pulse flex items-center justify-center bg-amber-400/10 pointer-events-none z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                  </div>
                )}
                <AnimatePresence>
                  {piece && (
                    <motion.div
                      key={piece.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12, ease: "easeInOut" }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 pointer-events-auto animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-slate-900 via-neutral-950 to-slate-900 border-2 border-amber-500/50 p-6 sm:p-8 rounded-3xl text-center shadow-[0_0_60px_rgba(245,158,11,0.5)] max-w-sm w-full relative overflow-hidden"
            >
              {/* Decorative dynamic blur effects */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-x-10 -translate-y-10" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl translate-x-10 translate-y-10" />

              {/* Glowing Medal Cup */}
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 via-yellow-450 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-yellow-200 mb-4 animate-bounce">
                <span className="text-3xl">🏆</span>
              </div>

              <h3 className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase mb-1">
                {lang === 'KU' ? 'پیرۆزبایی • Celebration' : lang === 'AR' ? 'تهانينا الحارة' : 'Congratulations'}
              </h3>

              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug mb-4">
                {gameState.winner === 'CYAN' ? (
                  lang === 'KU' ? 'پیرۆزە! تۆ بەسەرکەوتوویی بردیەوە! 🎉☀️' :
                  lang === 'AR' ? 'تهانينا! لقد فزت باللعبة بجدارة! 🎉👑' :
                  'Congratulations! You won the game! 🎉'
                ) : (
                  lang === 'KU' ? 'یاری کۆتایی هات! تاقیکردنەوەیەکی باش بوو 🤝' :
                  lang === 'AR' ? 'انتهت اللعبة! فاز منافسك باللعبة 🤝' :
                  'Game Over! Opponent won this time. 🤝'
                )}
              </h2>

              <p className="text-xs text-neutral-400 font-bold mb-6">
                {gameState.winner === 'CYAN' ? (
                  lang === 'KU' ? 'ئاستێکی زۆر نایاب و زیرەکانەت نیشان دا!' :
                  lang === 'AR' ? 'لقد أظهرت مهارة فائقة في تحريك الأحجار!' :
                  'You demonstrated brilliant strategic skills!'
                ) : (
                  lang === 'KU' ? 'هەرگیز کۆڵ مەدە، سەرکەوتن نزیکە!' :
                  lang === 'AR' ? 'حاول مجدداً، التدريب يصنع المستحيل!' :
                  'Keep trying, success is just around the corner!'
                )}
              </p>

              <div className="space-y-2.5">
                {/* Replay button */}
                <button
                  onClick={() => {
                    if (onRestart) onRestart();
                    else dispatch({ type: 'RESET_GAME' });
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:scale-[1.02] text-neutral-950 font-black text-sm rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10 border border-yellow-300/30 flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  <span>{lang === 'KU' ? 'دووبارە یاریکردنەوە' : lang === 'AR' ? 'اللعب مرة أخرى' : 'Play Again'}</span>
                </button>

                {/* Exit button to return to home page */}
                <button
                  onClick={() => {
                    if (onGoHome) onGoHome();
                  }}
                  className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/15 hover:scale-[1.02] text-rose-400 hover:text-rose-300 font-black text-xs rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🚪</span>
                  <span>{lang === 'KU' ? 'چوونەدەرەوە بۆ دەستپێک' : lang === 'AR' ? 'الرجوع إلى الرئيسية' : 'Exit to Main Menu'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}