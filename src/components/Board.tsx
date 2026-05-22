import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Piece from './Piece';
import { getMovesForPiece, hasAnyJumps } from '../gameLogic';

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

  // دۆزینەوەی ئەو بەردانەی ڕکابەر کە دەبێت بە ناچاری بخورێن بۆ ئاگادارکردنەوەی سووری درەوشاوە
  const forcedCapturePositions = useMemo(() => {
    const locations: { r: number, c: number }[] = [];
    if (disabled || gameState.winner) return locations;

    const turn = gameState.turn;

    if (gameState.mustJumpPos) {
      const moves = getMovesForPiece(gameState.board, gameState.mustJumpPos.r, gameState.mustJumpPos.c);
      moves.forEach(m => {
        if (m.type === 'jump' && m.captured) {
          locations.push(m.captured);
        }
      });
    } else {
      const hasJumps = hasAnyJumps(gameState.board, turn);
      if (hasJumps) {
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.player === turn) {
              const moves = getMovesForPiece(gameState.board, r, c);
              moves.forEach(m => {
                if (m.type === 'jump' && m.captured) {
                  locations.push(m.captured);
                }
              });
            }
          }
        }
      }
    }
    return locations;
  }, [gameState.board, gameState.turn, gameState.mustJumpPos, disabled]);

  // دۆزینەوەی جوڵە یاساییەکان و ئاراستەی جوڵان بۆ بەردی دیاریکراو تا بە وێنە و نیشاندەر گوزارشتی لێ بکەین
  const selectedPieceMoves = useMemo(() => {
    if (disabled || gameState.winner || !gameState.selectedPos) return [];

    const { r, c } = gameState.selectedPos;
    const allMoves = getMovesForPiece(gameState.board, r, c);

    let validMoves = allMoves;
    const hasJumps = allMoves.some(m => m.type === 'jump');
    if (hasJumps) {
      validMoves = validMoves.filter(m => m.type === 'jump');
    } else {
      const hasGlobalJumps = hasAnyJumps(gameState.board, gameState.turn);
      if (hasGlobalJumps) {
        return [];
      }
    }
    return validMoves;
  }, [gameState.selectedPos, gameState.board, gameState.turn, gameState.winner, disabled]);

  const handleSquareClick = (r: number, c: number) => {
    if (disabled || gameState.winner) return;
    dispatch({ type: 'SELECT_OR_MOVE', payload: { r, c } });
  };

  if (!gameState || !gameState.board) return null;

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-[420px]">
      
      {/* چوارچێوەی تەختەکە */}
      <div 
        className={`grid grid-cols-8 gap-0 p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-[0_20px_45px_rgba(0,0,0,0.65)] border-4 ${colors.border} ${colors.light}`}
      >
        {gameState.board.map((row: any[], r: number) =>
          row.map((piece: any, c: number) => {
            const isDark = (r + c) % 2 === 1;
            const isSelected = gameState.selectedPos?.r === r && gameState.selectedPos?.c === c;
            const isMustJump = gameState.mustJumpPos?.r === r && gameState.mustJumpPos?.c === c;
            const isHintSource = gameState.hintPos?.r === r && gameState.hintPos?.c === c;
            const isHintDest = gameState.hintPos?.dest?.r === r && gameState.hintPos?.dest?.c === c;

            const isForcedCaptureTarget = forcedCapturePositions.some(pos => pos.r === r && pos.c === c);
            const isMoveDest = selectedPieceMoves.some(m => m.dest.r === r && m.dest.c === c);

            return (
              <div
                key={`cell-${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`
                  relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center transition-all duration-200 cursor-pointer
                  ${isDark ? colors.dark : colors.light}
                  ${isSelected ? 'ring-inset ring-4 ring-cyan-400 brightness-125 z-10 scale-105 rounded-lg shadow-lg' : ''}
                  ${isMustJump ? 'ring-inset ring-4 ring-rose-500 animate-pulse z-10 rounded-lg' : ''}
                  ${isHintSource ? 'ring-inset ring-4 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.7)] z-10 rounded-lg animate-pulse' : ''}
                  ${isForcedCaptureTarget ? 'bg-gradient-to-br from-rose-950/80 to-red-900/60 border-2 border-red-500 ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.75)] z-10 rounded-lg scale-[0.98]' : ''}
                  overflow-visible
                `}
              >
                {isHintDest && (
                  <div className="absolute inset-2 border-2 border-dashed border-amber-400 rounded-full animate-pulse flex items-center justify-center bg-amber-400/10 pointer-events-none z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                  </div>
                )}

                {/* ڕێنمایی گرافیکی جوڵانی بەردەکان بە نیشاندانی تیشک و تیری ئاراستەکان بە شێوازێکی زۆر جوان */}
                {isMoveDest && (
                  <div className="absolute inset-1 border border-emerald-500/80 rounded-lg animate-pulse flex flex-col items-center justify-center bg-emerald-500/15 pointer-events-none z-10 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                    <span className="text-emerald-300 text-[10px] sm:text-xs font-black animate-bounce leading-none">
                      {gameState.selectedPos && r - gameState.selectedPos.r < 0 && c - gameState.selectedPos.c === 0 ? '▲' : ''}
                      {gameState.selectedPos && r - gameState.selectedPos.r > 0 && c - gameState.selectedPos.c === 0 ? '▼' : ''}
                      {gameState.selectedPos && r - gameState.selectedPos.r === 0 && c - gameState.selectedPos.c > 0 ? '▶' : ''}
                      {gameState.selectedPos && r - gameState.selectedPos.r === 0 && c - gameState.selectedPos.c < 0 ? '◀' : ''}
                    </span>
                    <span className="text-[6px] sm:text-[7px] text-emerald-200 font-black tracking-tighter leading-none mt-0.5">
                      {lang === 'KU' ? 'جوڵە' : lang === 'AR' ? 'تحرك' : 'GO'}
                    </span>
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
                      {/* ئاگادارکردنەوە فەرمی بۆ بەردی ناچاری بە ڕەنگی سووری بریقەدار و نیشاندەری مەترسی */}
                      {isForcedCaptureTarget && (
                        <>
                          <div className="absolute inset-0 bg-red-600/30 rounded-full ring-4 ring-red-500 animate-ping shadow-[0_0_15px_#ef4444] z-10" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 border border-white flex items-center justify-center text-white text-[8px] font-black animate-bounce shadow-md z-[35]">
                            ⚠️
                          </div>
                        </>
                      )}
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
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[110] p-4 pointer-events-auto animate-fade-in animate-once"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-[#0c0d12] via-[#050608] to-[#0c0d12] border-2 border-amber-500/50 p-6 sm:p-8 rounded-3xl text-center shadow-[0_0_60px_rgba(245,158,11,0.65)] max-w-sm w-full relative overflow-hidden"
            >
              {/* Decorative dynamic blur effects */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl -translate-x-10 -translate-y-10" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-500/15 rounded-full blur-2xl translate-x-10 translate-y-10" />

              {/* Glowing Medal Cup or broken crown depending on status */}
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-lg border mb-4 animate-bounce ${
                gameState.winner === 'CYAN' 
                  ? 'bg-gradient-to-br from-amber-400 via-yellow-450 to-amber-600 border-yellow-300 shadow-amber-500/40' 
                  : 'bg-gradient-to-br from-neutral-700 via-neutral-800 to-neutral-900 border-neutral-600 shadow-black'
              }`}>
                <span className="text-3xl">
                  {gameState.winner === 'CYAN' ? '🏆' : '💀'}
                </span>
              </div>

              <h3 className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase mb-1.5 font-sans">
                {gameState.winner === 'CYAN'
                  ? (lang === 'KU' ? 'سەرکەوتن • Victoria' : lang === 'AR' ? 'تهانينا الحارة' : 'Winner!')
                  : (lang === 'KU' ? 'کۆتایی یاری • Match Over' : lang === 'AR' ? 'حظّاً أوفر' : 'Better Luck!')
                }
              </h3>

              <h2 className="text-lg sm:text-xl font-black text-white leading-snug mb-4">
                {gameState.winner === 'CYAN' ? (
                  lang === 'KU' ? 'پیرۆزە، تۆ براوە بویت! 🏆' :
                  lang === 'AR' ? 'مبارك! لقد كنت الفائز بجدارة! 🏆' :
                  'Congratulations, you won the match! 🏆'
                ) : (
                  lang === 'KU' ? 'بە هیوای بەختی باشتر، دەست پێبکەرەوە بە ئەزموونی زیاتر! ❤️' :
                  lang === 'AR' ? 'حظ أوفر المرة القادمة، ابدأ من جديد بخبرة أفضل! ❤️' :
                  'Better luck next time, restart with more experience! ❤️'
                )}
              </h2>

              {/* Interactive Info Text */}
              <p className="text-[11px] text-neutral-400 font-bold mb-6 select-none font-sans">
                {gameState.winner === 'CYAN' ? (
                  lang === 'KU' ? 'تۆ یارییەکی نایاب و زیرەکانەت ئەنجام دا!' :
                  lang === 'AR' ? 'لقد قدمت أداءً مبهراً وتكتيكاً ذكياً!' :
                  'You demonstrated magnificent core tactics!'
                ) : (
                  lang === 'KU' ? 'ڕاهێنان بەردەوام بکە بۆ باشترکردنی ئاستت.' :
                  lang === 'AR' ? 'استمر بالتدريب لترقية رتبتك إلى مستوى الأبطال.' :
                  'Keep practicing to sharpen your tactical mastery.'
                )}
              </p>

              {/* Three distinctively-colored beautiful buttons */}
              <div className="flex flex-col gap-2.5 font-sans">
                {/* Button 1: Replay / Retry (Beautiful Emerald Green) */}
                <button
                  onClick={() => {
                    if (onRestart) onRestart();
                    else dispatch({ type: 'RESET_GAME' });
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-[0_4px_15px_rgba(16,185,129,0.3)] border border-green-400/20 flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  <span>{lang === 'KU' ? 'دووبارە' : lang === 'AR' ? 'إعادة اللعب' : 'Try Again'}</span>
                </button>

                {/* Button 2: Main Menu / Safe Home (Elegant Cyan Blue) */}
                <button
                  onClick={() => {
                    if (onGoHome) onGoHome();
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.3)] border border-cyan-400/20 flex items-center justify-center gap-2"
                >
                  <span>🏠</span>
                  <span>{lang === 'KU' ? 'سەرەتا' : lang === 'AR' ? 'البداية' : 'Main Menu'}</span>
                </button>

                {/* Button 3: More Apps (Sophisticated Indigo Purple) */}
                <button
                  onClick={() => {
                    window.location.href = '/more.html';
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-[0_4px_15px_rgba(99,102,241,0.3)] border border-indigo-400/20 flex items-center justify-center gap-2"
                >
                  <span>🚀</span>
                  <span>{lang === 'KU' ? 'بەرنامەی زیاتر' : lang === 'AR' ? 'تطبيقات أخرى' : 'More Apps'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}