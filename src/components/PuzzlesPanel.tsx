import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PUZZLES, Puzzle, PuzzleMove } from '../data/puzzles';
import { getProfiles, saveProfiles, addMatchHistory } from '../store/profileStore';
import { Trophy, HelpCircle, RefreshCw, ChevronLeft, Award, Flame, FlameKindling, Info } from 'lucide-react';
import { BoardType, Position, Piece } from '../types';

interface PuzzlesPanelProps {
  lang: 'KU' | 'AR' | 'EN';
  onClose: () => void;
  playSound: (type: 'move' | 'capture' | 'win' | 'error') => void;
  soundEnabled: boolean;
  onCoinsUpdated: () => void;
}

export default function PuzzlesPanel({ lang, onClose, playSound, soundEnabled, onCoinsUpdated }: PuzzlesPanelProps) {
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string>(PUZZLES[0].id);
  const [board, setBoard] = useState<BoardType>([]);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [showTip, setShowTip] = useState<boolean>(false);
  const [puzzleState, setPuzzleState] = useState<'PLAYING' | 'CORRECT' | 'SOLVED' | 'FAILED'>('PLAYING');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [solvedList, setSolvedList] = useState<string[]>([]);

  const puzzle = PUZZLES.find(p => p.id === selectedPuzzleId) || PUZZLES[0];

  // Load solved puzzles from localStorage
  useEffect(() => {
    const solved = localStorage.getItem('dama_solved_puzzles');
    if (solved) {
      setSolvedList(JSON.parse(solved));
    }
  }, []);

  // Initialize board for current puzzle
  useEffect(() => {
    resetPuzzle();
  }, [selectedPuzzleId]);

  const resetPuzzle = () => {
    setBoard(puzzle.boardSetup());
    setSelectedPos(null);
    setStepIndex(0);
    setShowTip(false);
    setPuzzleState('PLAYING');
    setFeedbackMsg('');
  };

  const handleSquareClick = (r: number, c: number) => {
    if (puzzleState === 'SOLVED') return;

    const clickedPiece = board[r][c];

    // 1. Select a Cyan piece
    if (clickedPiece && clickedPiece.player === 'CYAN') {
      setSelectedPos({ r, c });
      return;
    }

    // 2. Clicked empty square to move
    if (selectedPos && !clickedPiece) {
      const activeMove: PuzzleMove = { from: selectedPos, to: { r, c } };
      
      // Look up correct move at this step index
      const correctMove = puzzle.solution[stepIndex];

      const isCorrectMove = 
        correctMove.from.r === activeMove.from.r && 
        correctMove.from.c === activeMove.from.c &&
        correctMove.to.r === activeMove.to.r &&
        correctMove.to.c === activeMove.to.c;

      if (isCorrectMove) {
        // Execute Move physically on local board
        const nextBoard = board.map(row => [...row]);
        const piece = nextBoard[selectedPos.r][selectedPos.c]!;
        
        // Simple automatic capture clean if it is jump (jump is when distance > 1)
        const isJump = Math.abs(selectedPos.r - r) > 1 || Math.abs(selectedPos.c - c) > 1;
        if (isJump) {
          // Identify midpoint(s) and erase White pieces
          const stepR = Math.sign(r - selectedPos.r);
          const stepC = Math.sign(c - selectedPos.c);
          let currR = selectedPos.r + stepR;
          let currC = selectedPos.c + stepC;
          while (currR !== r || currC !== c) {
            nextBoard[currR][currC] = null;
            currR += stepR;
            currC += stepC;
          }
          if (soundEnabled) playSound('capture');
        } else {
          if (soundEnabled) playSound('move');
        }

        // Move the cyan piece
        nextBoard[r][c] = { ...piece };
        nextBoard[selectedPos.r][selectedPos.c] = null;

        // Auto promote to representation King if landed on row 0
        if (r === 0) {
          nextBoard[r][c]!.type = 'KING';
        }

        setBoard(nextBoard);
        setSelectedPos(null);

        // Check if there are opponent response moves left
        if (stepIndex < puzzle.opponentsMoves.length) {
          setPuzzleState('CORRECT');
          setFeedbackMsg(
            lang === 'KU' ? 'جووڵەیەکی نایاب بوو! ڕکابەر بیردەکاتەوە...' :
            lang === 'AR' ? 'حركة رائعة وصافية! الخصم يفكر الآن...' :
            'Perfect Move! Opponent is replying...'
          );

          // Automated opponent move
          setTimeout(() => {
            const oppMove = puzzle.opponentsMoves[stepIndex];
            const updatedBoard = nextBoard.map(row => [...row]);
            const oppPiece = updatedBoard[oppMove.from.r][oppMove.from.c]!;

            const oppIsJump = Math.abs(oppMove.from.r - oppMove.to.r) > 1 || Math.abs(oppMove.from.c - oppMove.to.c) > 1;
            if (oppIsJump) {
              const stepR = Math.sign(oppMove.to.r - oppMove.from.r);
              const stepC = Math.sign(oppMove.to.c - oppMove.from.c);
              let currR = oppMove.from.r + stepR;
              let currC = oppMove.from.c + stepC;
              while (currR !== oppMove.to.r || currC !== oppMove.to.c) {
                updatedBoard[currR][currC] = null;
                currR += stepR;
                currC += stepC;
              }
              if (soundEnabled) playSound('capture');
            } else {
              if (soundEnabled) playSound('move');
            }

            updatedBoard[oppMove.to.r][oppMove.to.c] = { ...oppPiece };
            updatedBoard[oppMove.from.r][oppMove.from.c] = null;

            // Auto promote white King on row 7
            if (oppMove.to.r === 7) {
              updatedBoard[oppMove.to.r][oppMove.to.c]!.type = 'KING';
            }

            setBoard(updatedBoard);
            setStepIndex(prev => prev + 1);
            setPuzzleState('PLAYING');
            setFeedbackMsg(
              lang === 'KU' ? 'باشە! ئێستا جوڵەی کۆتایی خۆت بکە.' :
              lang === 'AR' ? 'جميل! قم الآن بالخطوة الفاصلة الحاسمة.' :
              'Perfect! Now make your final tactical step.'
            );
          }, 1000);
        } else {
          // Solved fully!
          triggerPuzzleSolved();
        }
      } else {
        // Failed
        if (soundEnabled) playSound('error');
        setFeedbackMsg(
          lang === 'KU' ? 'ئەمەش چارەسەری مەتەڵەکە نییە، تکایە ڕێکخستنەوە بکە و دووبارە تاقی بکەرەوە!' :
          lang === 'AR' ? 'هذه الحركة خاطئة! يرجى إعادة ضبط المحاولة للتفكير ببديل.' :
          'Hmm, that is not the winning sequence. Reset and try again!'
        );
        setPuzzleState('FAILED');
      }
    }
  };

  const triggerPuzzleSolved = () => {
    if (soundEnabled) playSound('win');
    setPuzzleState('SOLVED');
    setFeedbackMsg(
      lang === 'KU' ? 'پیرۆزە! مەتەڵەکەت بە تەواوی چارەسەر کرد و سەرکەوتیت! 🎉' :
      lang === 'AR' ? 'تهانينا! لقد قمت بحل التحدي الاستراتيجي بالكامل! 🎉' :
      'Splendid! You successfully unlocked this puzzle challenge! 🎉'
    );

    // Persist solved lists
    const updatedSolved = [...solvedList];
    if (!updatedSolved.includes(puzzle.id)) {
      updatedSolved.push(puzzle.id);
      setSolvedList(updatedSolved);
      localStorage.setItem('dama_solved_puzzles', JSON.stringify(updatedSolved));

      // Reward player profiles
      const profiles = getProfiles();
      profiles.p1.coinCount += 25; // 25 coins reward
      profiles.p1.totalJumpsCaptured += 4;
      
      // Save
      saveProfiles(profiles.p1, profiles.p2);
      onCoinsUpdated();

      // Check if all are solved for achievements
      if (updatedSolved.length === PUZZLES.length) {
        if (!profiles.p1.unlockedAchievements.includes('puzzle_all')) {
          profiles.p1.unlockedAchievements.push('puzzle_all');
          if (!profiles.p1.unlockedTitles.includes('puzzle_sage')) {
            profiles.p1.unlockedTitles.push('puzzle_sage');
          }
          saveProfiles(profiles.p1, profiles.p2);
        }
      }

      // Add match log
      addMatchHistory({
        id: 'puz_' + Date.now(),
        date: new Date().toLocaleDateString(),
        mode: 'PUZZLE',
        player1Name: profiles.p1.name,
        player2Name: 'مەتەڵ - ' + puzzle.nameKu,
        winnerName: profiles.p1.name,
        piecesCaptured: 4,
        durationSeconds: 45
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-md flex items-center justify-center z-[110] p-4 pt-[env(safe-area-inset-top,1rem)] pb-[env(safe-area-inset-bottom,1rem)] pl-[env(safe-area-inset-left,1rem)] pr-[env(safe-area-inset-right,1rem)] overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border-2 border-amber-500/35 w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.3)] flex flex-col md:flex-row h-auto md:h-[620px] relative"
      >
        {/* Floating Clean Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/5 hover:bg-neutral-800 border border-white/10 hover:border-amber-500/50 p-1.5 rounded-lg text-neutral-450 hover:text-amber-400 transition-all active:scale-90 cursor-pointer flex items-center justify-center z-50 animate-pulse"
          title={lang === 'KU' ? 'گەڕانەوە' : 'Back'}
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        {/* Play Selector Side Rail */}
        <div className="p-5 md:p-6 w-full md:w-80 bg-slate-950/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-amber-500/15">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-amber-500 animate-pulse" />
              <div>
                <h2 className="text-sm font-black text-amber-400">
                  {lang === 'KU' ? 'مەتەڵەکانی دامێ' : lang === 'AR' ? 'ألغاز وتحديات الدامة' : 'Checkers Puzzles'}
                </h2>
                <p className="text-[10px] text-neutral-400 font-bold">
                  {lang === 'KU' ? 'تواناکانت تاقی بکەرەوە لە کۆتایی یارییەکان' : lang === 'AR' ? 'تحدى ذكائك بحركات تفاعلية' : 'Master crucial endgames'}
                </p>
              </div>
            </div>

            {/* Selector list */}
            <div className="space-y-2 max-h-48 md:max-h-80 overflow-y-auto pr-1">
              {PUZZLES.map((pz) => {
                const isSelected = pz.id === selectedPuzzleId;
                const isSolved = solvedList.includes(pz.id);
                return (
                  <button
                    key={pz.id}
                    onClick={() => setSelectedPuzzleId(pz.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.15)]' 
                        : 'bg-slate-900/40 border-slate-800 text-neutral-400 hover:text-white'}`}
                  >
                    <span>
                      {lang === 'KU' ? pz.nameKu : lang === 'AR' ? pz.nameAr : pz.nameEn}
                    </span>
                    {isSolved && (
                      <span className="text-[11px] bg-emerald-500/20 text-emerald-400 rounded-full px-1.5 py-0.5 animate-pulse border border-emerald-500/40">
                        ✓ {lang === 'KU' ? 'کراوە' : lang === 'AR' ? 'مكتمل' : 'Solved'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 mt-4 text-[10px] text-neutral-500 font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {lang === 'KU' ? 'چارەسەرکردنی هەر مەتەڵێك ٢٥ سکە دەبەخشێت!' :
               lang === 'AR' ? 'حل اللغز يمنحك ٢٥ قطعة ذهبية إضافية!' :
               'Each solved puzzle awards 25 shiny coins!'}
            </span>
          </div>
        </div>

        {/* Interactive Board View Panel */}
        <div className="flex-1 p-6 flex flex-col items-center justify-between relative bg-slate-950/20">
          <div className="w-full text-center">
            <h1 className="text-base font-black text-white">
              {lang === 'KU' ? puzzle.nameKu : lang === 'AR' ? puzzle.nameAr : puzzle.nameEn}
            </h1>
            <p className="text-xs text-neutral-400 font-semibold px-4 max-w-lg mx-auto leading-relaxed mt-1">
              {lang === 'KU' ? puzzle.descKu : lang === 'AR' ? puzzle.descAr : puzzle.descEn}
            </p>
          </div>

          {/* 8x8 Board Container */}
          <div className="my-4 aspect-square w-full max-w-[280px] sm:max-w-[320px] bg-slate-950 border-4 border-slate-700/85 p-1 rounded-2xl shadow-3xl grid grid-cols-8 grid-rows-8 gap-0.5">
            {board.length > 0 && Array.from({ length: 64 }).map((_, idx) => {
              const r = Math.floor(idx / 8);
              const c = idx % 8;
              const isDark = (r + c) % 2 === 1;
              const p = board[r][c];

              const isSelected = selectedPos?.r === r && selectedPos?.c === c;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleSquareClick(r, c)}
                  className={`relative w-full h-full cursor-pointer transition-all duration-200 flex items-center justify-center rounded-sm
                    ${isDark ? 'bg-[#92400e]/75' : 'bg-[#fef3c7]/95'}
                    ${isSelected ? 'ring-4 ring-cyan-400 brightness-110 z-10 animate-pulse' : ''}
                  `}
                >
                  {p && (
                    <motion.div
                      className={`w-[85%] h-[85%] rounded-full flex items-center justify-center border-2 border-black/40 shadow-md ${
                        p.player === 'CYAN' 
                          ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.5)] border-cyan-200' 
                          : 'bg-gradient-to-br from-neutral-100 to-neutral-300 shadow-sm border-neutral-300'
                      }`}
                    >
                      {p.type === 'KING' && (
                        <span className="text-[10px] sm:text-xs">👑</span>
                      )}
                      {/* Inner strip */}
                      <div className="absolute inset-1 rounded-full border border-dashed border-black/10" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Instructions, Tip & Message controls */}
          <div className="w-full text-center space-y-3">
            <AnimatePresence mode="wait">
              {feedbackMsg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-xs font-black p-2.5 rounded-xl border max-w-md mx-auto inline-block
                    ${puzzleState === 'SOLVED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : ''}
                    ${puzzleState === 'FAILED' ? 'bg-rose-500/15 border-rose-500/30 text-rose-450' : ''}
                    ${puzzleState === 'PLAYING' || puzzleState === 'CORRECT' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse' : ''}
                  `}
                >
                  {feedbackMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tip Display box */}
            <AnimatePresence>
              {showTip && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-900 border border-amber-500/20 rounded-2xl p-3 max-w-md mx-auto text-[11px] text-amber-400 font-extrabold"
                >
                  💡 {lang === 'KU' ? puzzle.tipKu : lang === 'AR' ? puzzle.tipAr : puzzle.tipEn}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2.5 justify-center pt-2">
              <button
                onClick={() => setShowTip(prev => !prev)}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-extrabold text-xs rounded-xl border border-white/5 cursor-pointer flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>{lang === 'KU' ? 'ڕێنمایی' : lang === 'AR' ? 'تلميح' : 'Hint'}</span>
              </button>

              <button
                onClick={resetPuzzle}
                className="py-2.5 px-4 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-black text-xs rounded-xl border border-amber-500/30 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lang === 'KU' ? 'ڕێکخستنەوە' : lang === 'AR' ? 'إعادة المحاولة' : 'Reset'}</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white font-black text-xs rounded-xl border border-white/5 cursor-pointer"
              >
                ✕ {lang === 'KU' ? 'داخستن' : lang === 'AR' ? 'إلغاء' : 'Exit'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
