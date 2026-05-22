import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Lightbulb } from 'lucide-react';
import { RobotAvatar, KurdishManAvatar } from './Avatars';
import Board from './Board';
import { Language } from '../translations';
import { GameMode, BoardTheme, Difficulty } from '../types';

interface PlayingViewProps {
  lang: Language;
  mode: GameMode;
  theme: BoardTheme;
  difficulty: Difficulty;
  setDifficulty: (diff: Difficulty) => void;
  player1Name: string;
  setPlayer1Name: (name: string) => void;
  player2Name: string;
  setPlayer2Name: (name: string) => void;
  gameState: any;
  dispatch: any;
  timeAttack: boolean;
  timeAttackP1: number;
  timeAttackP2: number;
  whiteCount: number;
  cyanCount: number;
  shakeBoard: boolean;
  bubbleText: string | null;
  bubbleSender: 'CYAN' | 'WHITE' | null;
  pieceStyle: string;
  requestHint: () => void;
  deductActivePenalty: () => void;
  handleBack: () => void;
  handleFullReset: () => void;
  t: any;
}

const formatClock = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function PlayingView({
  lang,
  mode,
  theme,
  difficulty,
  setDifficulty,
  player1Name,
  setPlayer1Name,
  player2Name,
  setPlayer2Name,
  gameState,
  dispatch,
  timeAttack,
  timeAttackP1,
  timeAttackP2,
  whiteCount,
  cyanCount,
  shakeBoard,
  bubbleText,
  bubbleSender,
  pieceStyle,
  requestHint,
  deductActivePenalty,
  handleBack,
  handleFullReset,
  t
}: PlayingViewProps) {
  return (
    <motion.div
      key="playing"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-3xl py-1 md:py-2 flex flex-col items-center"
    >
      {/* OPPONENT AREA (ABOVE THE BOARD) - Nested in stylized decorative Console Game framing */}
      <div className="w-full max-w-2xl p-0.5 rounded-2xl bg-gradient-to-r from-neutral-800 via-amber-500/25 to-neutral-800 shadow-xl border border-white/10 mb-2 relative">
        <div className="bg-gradient-to-br from-black/90 to-[#0e0f14]/98 rounded-[14px] p-2.5 sm:p-3 flex items-center justify-between relative shadow-inner overflow-hidden">
          {/* Ambient lighting inside card */}
          <div className="absolute top-0 right-0 w-24 h-12 bg-amber-500/[0.04] blur-xl rounded-full pointer-events-none" />

          <div className="flex items-center gap-2 sm:gap-3 z-10">
            {/* Bot Avatar or Friend Avatar */}
            {mode === 'AI' ? (
              <RobotAvatar />
            ) : (
              <KurdishManAvatar />
            )}
            
            <div className="text-left rtl:text-right">
              <div className="text-[9px] text-[#fbbf24]/70 font-black uppercase tracking-widest leading-none mb-1">
                {lang === 'KU' ? 'یاریزانی دژبەر' : lang === 'AR' ? 'اللاعب المنافس' : 'Opponent'}
              </div>
              
              {mode === 'FRIEND' ? (
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder={t.FRIEND}
                  className="w-24 sm:w-32 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-black px-2 py-0.5 rounded border border-white/10 focus:border-amber-400 outline-none transition-all text-center"
                />
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                  <div className="text-xs sm:text-sm font-black text-white leading-none">
                    {player2Name.trim() || t.AI_NAME}
                  </div>
                  
                  {/* Beautiful Interactive Choice Select for Difficulty inside the active game */}
                  <div className="flex items-center mt-0.5 sm:mt-0">
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className={`text-[9.5px] font-black px-1.5 py-0.5 rounded border outline-none cursor-pointer transition-all ${
                        difficulty === 'EASY' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                        difficulty === 'MEDIUM' ? 'bg-amber-950/40 border-amber-500/30 text-amber-500' :
                        difficulty === 'HARD' ? 'bg-orange-950/40 border-orange-500/30 text-orange-400' :
                        'bg-red-950/40 border-red-500/30 text-rose-300'
                      }`}
                    >
                      <option value="EASY" className="bg-slate-950 text-emerald-400 font-bold">{t.EASY}</option>
                      <option value="MEDIUM" className="bg-slate-950 text-amber-500 font-bold">{t.MEDIUM}</option>
                      <option value="HARD" className="bg-slate-950 text-orange-400 font-bold">{t.HARD}</option>
                      <option value="EXPERT" className="bg-slate-950 text-red-500 font-bold">{t.EXPERT}</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* Count of pieces next to them */}
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold font-sans">
                <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full select-none text-[9px] sm:text-[10px]">
                  ● {lang === 'KU' ? 'چالاک' : lang === 'AR' ? 'نشط' : 'Active'}: {whiteCount}
                </span>
                <span className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full select-none text-[9px] sm:text-[10px]">
                  {lang === 'KU' ? 'خوراو' : lang === 'AR' ? 'المأكول' : 'Captured'}: {16 - cyanCount}
                </span>
              </div>
            </div>
          </div>

          {/* Turn indicator glow & Chess Clock */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 z-10">
            {timeAttack && (
              <div className={`px-2 py-0.5 rounded-lg font-mono text-[10px] sm:text-xs font-black border tracking-wider transition-all select-none ${
                gameState.turn === 'WHITE' && !gameState.winner
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)] animate-pulse'
                  : 'bg-neutral-900 border-white/5 text-neutral-500'
              }`}>
                ⏱️ {formatClock(timeAttackP2)}
              </div>
            )}
            <div className="flex flex-col items-center gap-0.5">
              <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${gameState.turn === 'WHITE' ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-ping' : 'bg-neutral-800'}`} />
              <span className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest leading-none">
                {gameState.turn === 'WHITE' ? 'TURN' : 'WAIT'}
              </span>
            </div>
          </div>

          {/* Speech Bubble comments floating */}
          {bubbleText && bubbleSender === 'WHITE' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="absolute bottom-full mb-3 left-4 sm:left-12 bg-gradient-to-br from-indigo-950/95 via-purple-950/95 to-slate-900 border border-indigo-400/30 text-indigo-100 text-[11px] font-bold py-2.5 px-4 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.6)] max-w-[260px] z-30 font-sans"
            >
              {bubbleText}
              <div className="absolute top-full left-6 border-[6px] border-transparent border-t-indigo-900/95" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Mandatory capture reminder banner */}
      {gameState.mustJumpPos && !gameState.winner && (
         <div className="w-full max-w-2xl text-[10px] sm:text-xs text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg font-bold flex items-center justify-center border border-amber-400/20 mb-1 animate-pulse">
           <AlertCircle className="w-3.5 h-3.5 rtl:ml-1.5 ltr:mr-1.5 shrink-0 text-amber-500" /> 
           <span>{t.MANDATORY}</span>
         </div>
      )}

      {/* BOARD CONTAINER WITH SHAKE ANIMATION */}
      <motion.div 
        animate={shakeBoard ? {
          x: [0, -4, 4, -4, 4, -2, 2, 0],
          y: [0, 0, 0, 0, 0, 0, 0, 0]
        } : {}}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="w-full flex justify-center py-0.5 sm:py-1 relative z-10"
      >
        <Board
          gameState={gameState}
          dispatch={dispatch}
          theme={theme}
          lang={lang}
          disabled={gameState.winner !== null || (mode === 'AI' && gameState.turn === 'WHITE')}
          onGoHome={handleBack}
          onRestart={handleFullReset}
          p1Name={player1Name.trim() || t.YOU}
          p2Name={player2Name.trim() || (mode === 'AI' ? t.AI_NAME : t.FRIEND)}
          coachHintSource={gameState.hintPos}
          pieceStyle={pieceStyle}
        />
      </motion.div>

      {/* HUMAN AREA (BELOW THE BOARD) - Wrapped in premium glowing frame containing the integrated Get Hint utility */}
      <div className="w-full max-w-2xl p-0.5 rounded-2xl bg-gradient-to-r from-neutral-800 via-cyan-500/25 to-neutral-800 shadow-xl border border-white/10 mt-1 sm:mt-2 relative">
        <div className="bg-gradient-to-br from-black/90 to-[#0a0d10]/98 rounded-[14px] p-2.5 sm:p-3 flex items-center justify-between relative shadow-inner overflow-hidden">
          {/* Subtle inside glow */}
          <div className="absolute bottom-0 left-0 w-24 h-12 bg-cyan-500/[0.04] blur-xl rounded-full pointer-events-none" />

          <div className="flex items-center gap-2 sm:gap-3 z-10">
            {/* Kurdish Man Avatar representing You */}
            <KurdishManAvatar />
            
            <div className="text-left rtl:text-right">
              <div className="text-[9px] text-cyan-400/70 font-black uppercase tracking-widest leading-none mb-1">
                {lang === 'KU' ? 'ناوی تۆ • Your Name' : lang === 'AR' ? 'اسمك الكريم' : 'Your Name'}
              </div>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder={t.YOU}
                className="w-24 sm:w-32 bg-cyan-950/20 hover:bg-cyan-950/35 text-cyan-400 text-xs sm:text-sm font-black px-2 py-0.5 rounded border border-cyan-500/25 focus:border-cyan-400 outline-none transition-all text-center"
              />
              
              {/* Count of pieces next to them & beautiful newly integrated small hint button */}
              <div className="flex items-center gap-2 mt-1.5 text-xs font-bold font-sans flex-wrap">
                <span className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full select-none text-[9.5px]">
                  ● {lang === 'KU' ? 'چالاک' : lang === 'AR' ? 'نشط' : 'Active'}: {cyanCount}
                </span>
                <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full select-none text-[9.5px]">
                  {lang === 'KU' ? 'خوراو' : lang === 'AR' ? 'المأكول' : 'Captured'}: {16 - whiteCount}
                </span>

                {/* COMPACT HELP BUTTON - Integrates smoothly inside status list without bloating size */}
                {mode === 'AI' && (
                  <button
                    onClick={requestHint}
                    disabled={gameState.hintsLeft <= 0 || gameState.turn !== 'CYAN' || !!gameState.winner}
                    className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 active:from-amber-500 active:to-amber-600 text-neutral-950 font-black rounded-lg text-[9px] transition-all duration-200 active:scale-95 cursor-pointer border border-amber-300/80 shadow-[0_2px_8px_rgba(245,158,11,0.25)] flex items-center gap-1 select-none hover:brightness-110 disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                    title={`${gameState.hintsLeft} hints left`}
                  >
                    <Lightbulb className="w-2.5 h-2.5 text-neutral-950 animate-pulse inline" />
                    <span>{lang === 'KU' ? `ئامۆژگاری (${gameState.hintsLeft})` : lang === 'AR' ? `تلميح (${gameState.hintsLeft})` : `Hint (${gameState.hintsLeft})`}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Turn indicator glow & Chess Clock */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 z-10">
            {timeAttack && (
              <div className={`px-2 py-0.5 rounded-lg font-mono text-[10px] sm:text-xs font-black border tracking-wider transition-all select-none ${
                gameState.turn === 'CYAN' && !gameState.winner
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)] animate-pulse'
                  : 'bg-neutral-900 border-white/5 text-neutral-500'
              }`}>
                ⏱️ {formatClock(timeAttackP1)}
              </div>
            )}
            <div className="flex flex-col items-center gap-0.5">
              <span className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${gameState.turn === 'CYAN' ? 'bg-cyan-400 shadow-[0_0_12px_#06b6d4] animate-ping' : 'bg-neutral-800'}`} />
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                {gameState.turn === 'CYAN' ? 'TURN' : 'WAIT'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
