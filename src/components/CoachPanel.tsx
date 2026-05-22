import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Award, ChevronLeft, RefreshCw, Layers, ShieldAlert, 
  Trash2, HelpCircle, Check, Swords, Play, Sparkles, AlertTriangle
} from 'lucide-react';
import { BoardType, Move, Piece, Position } from '../types';
import { getMovesForPiece, inBounds, getInitialBoard, hasAnyJumps } from '../gameLogic';
import PieceComponent from './Piece';

interface CoachPanelProps {
  lang: 'KU' | 'AR' | 'EN';
  onClose: () => void;
}

// 3 Core Grandmaster tactics templates for interactive learning
const SCENARIOS = [
  {
    id: 'double_trap',
    titleKu: 'داوی دەبل: فریودانی دووانی ⚡',
    titleAr: 'فخ الثنائية: استدراج حجرين',
    titleEn: 'Double Trap: Lure & Double Jump',
    descKu: 'دوژمن پەڵکێش بکە بۆ ناوەڕاست بە قوربانیدانی یەک بەرد، پاشان بە یەک جووڵە دوو بەردی سپی بتەقێنەوە!',
    descAr: 'استدرج الخصم للوسط بالتضحية بحجر واحد، ثم قم بالتهام حجرين أبيضين متتاليين بحركة واحدة خاطفة!',
    descEn: 'Lure the opponent into the center by sacrficing one piece, then execute a devastating consecutive double-jump!',
    setup: () => {
      const b: BoardType = Array(8).fill(null).map(() => Array(8).fill(null));
      // Setup specific double jump puzzle state
      b[4][2] = { id: 'c-s1', player: 'CYAN', type: 'MAN' };
      b[3][3] = { id: 'w-s1', player: 'WHITE', type: 'MAN' };
      b[1][3] = { id: 'w-s2', player: 'WHITE', type: 'MAN' };
      return b;
    }
  },
  {
    id: 'king_sweep',
    titleKu: 'ڕاماڵینی پادشا: زاڵبوون بە شا 👑',
    titleAr: 'اجتياح الشاه: السيطرة والتحليق',
    titleEn: 'King Sweep: Slider Domination',
    descKu: 'فێربە چۆن بە هێزی خلیسکانی پاشا (شا) تەواوی لایەنە سەرەکییەکان کنترل بکەیت و دوژمن تێکبشکێنیت.',
    descAr: 'تعلم كيف تستخدم قدرة الشاه المنزلق في اجتياز مسافات طويلة وقطع خطوط إمداد الدفاع الأبيض.',
    descEn: 'Master the sliding powers of the Dama King to control open files and execute attacks from maximum distance.',
    setup: () => {
      const b: BoardType = Array(8).fill(null).map(() => Array(8).fill(null));
      b[6][1] = { id: 'c-s2', player: 'CYAN', type: 'KING' };
      b[3][1] = { id: 'w-s3', player: 'WHITE', type: 'MAN' };
      b[6][4] = { id: 'w-s4', player: 'WHITE', type: 'MAN' };
      return b;
    }
  },
  {
    id: 'block_trap',
    titleKu: 'گوشینی پاشایەتی: بەبێ جووڵە 🔒',
    titleAr: 'الحصار الملكي: الفوز الشامل دون أكل',
    titleEn: 'Royal Pin: Blockade Victory',
    descKu: 'لە دامەدا بردنەوە تەنها بە خواردن نییە! ئەگەر کاتێک ڕکابەر هیچ جووڵەیەکی یاسایی نەمێنێت، تۆ یارییەکە دەبەنیتەوە.',
    descAr: 'الفوز في الدامة لا يقتصر على الأكل! إذا حاصرت خصمك بحيث لا يملك أي حركة قانونية متبقية، فستنتصر فوراً.',
    descEn: 'Winning in Dama doesn\'t require capture! If you trap the opponent so they have 0 legal moves, you win instantly.',
    setup: () => {
      const b: BoardType = Array(8).fill(null).map(() => Array(8).fill(null));
      b[0][1] = { id: 'w-s5', player: 'WHITE', type: 'MAN' };
      b[1][1] = { id: 'c-s3', player: 'CYAN', type: 'MAN' };
      b[0][0] = { id: 'c-s4', player: 'CYAN', type: 'MAN' };
      b[0][2] = { id: 'c-s5', player: 'CYAN', type: 'MAN' };
      return b;
    }
  }
];

export default function CoachPanel({ lang, onClose }: CoachPanelProps) {
  const [board, setBoard] = useState<BoardType>(() => getInitialBoard());
  const [turn, setTurn] = useState<'CYAN' | 'WHITE'>('CYAN');
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [mustJumpPos, setMustJumpPos] = useState<Position | null>(null);
  const [history, setHistory] = useState<{ board: BoardType; turn: 'CYAN' | 'WHITE'; mustJumpPos: Position | null }[]>([]);

  // Sandbox designer states
  const [activeTool, setActiveTool] = useState<'SELECT' | 'ADD_CYAN_MAN' | 'ADD_CYAN_KING' | 'ADD_WHITE_MAN' | 'ADD_WHITE_KING' | 'ERASE'>('SELECT');
  const [showHelp, setShowHelp] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  // Analysis results hold live threat scanner data
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Undo Sandbox action helper
  const saveSandboxHistory = (currentBoard: BoardType, currentTurn: 'CYAN' | 'WHITE', currentMust: Position | null) => {
    const deepClone: BoardType = currentBoard.map(row => row.map(cell => cell ? { ...cell } : null));
    setHistory(prev => [...prev, { board: deepClone, turn: currentTurn, mustJumpPos: currentMust ? { ...currentMust } : null }]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setBoard(last.board);
    setTurn(last.turn);
    setMustJumpPos(last.mustJumpPos);
    setSelectedPos(null);
    setHistory(prev => prev.slice(0, -1));
  };

  // 1. Core Threat Analysis (Scanning weaknesses)
  // Finds which CYAN pieces can be immediately jumped by WHITE
  const scannedVulnerabilities = useMemo(() => {
    const vulnerableSquares: { r: number; c: number }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.player === 'WHITE') {
          const moves = getMovesForPiece(board, r, c);
          moves.forEach(m => {
            if (m.type === 'jump' && m.captured) {
              const capR = m.captured.r;
              const capC = m.captured.c;
              const capPiece = board[capR][capC];
              if (capPiece && capPiece.player === 'CYAN') {
                if (!vulnerableSquares.some(sq => sq.r === capR && sq.c === capC)) {
                  vulnerableSquares.push({ r: capR, c: capC });
                }
              }
            }
          });
        }
      }
    }
    return vulnerableSquares;
  }, [board]);

  // 2. Core Tactical Opportunities (Scanning attack moves)
  // Finds which WHITE pieces can be immediately jumped by CYAN
  const scannedAttacks = useMemo(() => {
    const attackTargets: { r: number; c: number; dest: Position }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.player === 'CYAN') {
          const moves = getMovesForPiece(board, r, c);
          moves.forEach(m => {
            if (m.type === 'jump' && m.captured) {
              const capR = m.captured.r;
              const capC = m.captured.c;
              const capPiece = board[capR][capC];
              if (capPiece && capPiece.player === 'WHITE') {
                if (!attackTargets.some(sq => sq.r === capR && sq.c === capC)) {
                  attackTargets.push({ r: capR, c: capC, dest: m.dest });
                }
              }
            }
          });
        }
      }
    }
    return attackTargets;
  }, [board]);

  // Handle Square interactions (supports both design painting and actual gameplay)
  const handleSquareClick = (r: number, c: number) => {
    saveSandboxHistory(board, turn, mustJumpPos);
    const cellValue = board[r][c];

    // Tool Painting Mode
    if (activeTool !== 'SELECT') {
      const newB = board.map(row => row.map(cell => cell ? { ...cell } : null));
      const gameSeed = Date.now().toString(36);
      
      switch (activeTool) {
        case 'ERASE':
          newB[r][c] = null;
          break;
        case 'ADD_CYAN_MAN':
          newB[r][c] = { id: `cyan-painter-${gameSeed}-${r}-${c}`, player: 'CYAN', type: 'MAN' };
          break;
        case 'ADD_CYAN_KING':
          newB[r][c] = { id: `cyan-painter-k-${gameSeed}-${r}-${c}`, player: 'CYAN', type: 'KING' };
          break;
        case 'ADD_WHITE_MAN':
          newB[r][c] = { id: `white-painter-${gameSeed}-${r}-${c}`, player: 'WHITE', type: 'MAN' };
          break;
        case 'ADD_WHITE_KING':
          newB[r][c] = { id: `white-painter-k-${gameSeed}-${r}-${c}`, player: 'WHITE', type: 'KING' };
          break;
        default:
          break;
      }
      setBoard(newB);
      setSelectedPos(null);
      setMustJumpPos(null);
      return;
    }

    // Standard Interactive Board gameplay within Sandbox
    if (cellValue && cellValue.player === turn) {
      if (mustJumpPos) {
        if (r !== mustJumpPos.r || c !== mustJumpPos.c) {
          // Rule reminder
          return;
        }
      } else {
        // Safe jump validation check
        const globalJumps = hasAnyJumps(board, turn);
        if (globalJumps) {
          const moves = getMovesForPiece(board, r, c);
          if (!moves.some((m) => m.type === 'jump')) {
            return; // Player must pick one that can jump
          }
        }
      }
      setSelectedPos({ r, c });
    } else if (!cellValue && selectedPos) {
      // Execute play step
      const pos = selectedPos;
      const allMoves = getMovesForPiece(board, pos.r, pos.c);
      let validMoves = allMoves;

      const hasJumps = allMoves.some((m) => m.type === 'jump');
      if (hasJumps) {
        validMoves = validMoves.filter((m) => m.type === 'jump');
      }

      const move = validMoves.find((m) => m.dest.r === r && m.dest.c === c);
      if (move) {
        const newBoard = board.map(row => row.map(cell => cell ? { ...cell } : null));
        const piece = newBoard[pos.r][pos.c]!;
        newBoard[pos.r][pos.c] = null;
        newBoard[r][c] = piece;

        if (move.type === 'jump' && move.captured) {
          newBoard[move.captured.r][move.captured.c] = null;
        }

        let endTurn = true;
        let promoted = false;

        // Auto king promotions matching regular game reducer
        if (piece.type === 'MAN') {
          if (piece.player === 'CYAN' && r === 0) {
            piece.type = 'KING';
            promoted = true;
          } else if (piece.player === 'WHITE' && r === 7) {
            piece.type = 'KING';
            promoted = true;
          }
        }

        if (move.type === 'jump' && !promoted) {
          const nextMoves = getMovesForPiece(newBoard, r, c);
          if (nextMoves.some((m) => m.type === 'jump')) {
            endTurn = false;
          }
        }

        setBoard(newBoard);

        if (!endTurn) {
          setSelectedPos({ r, c });
          setMustJumpPos({ r, c });
        } else {
          setTurn(turn === 'CYAN' ? 'WHITE' : 'CYAN');
          setSelectedPos(null);
          setMustJumpPos(null);
        }
      } else {
        setSelectedPos(null);
      }
    } else {
      setSelectedPos(null);
    }
  };

  // Helper values for selected cell movements
  const highlightDestinations = useMemo(() => {
    if (!selectedPos) return [];
    const moves = getMovesForPiece(board, selectedPos.r, selectedPos.c);
    const hasJumps = moves.some(m => m.type === 'jump');
    return hasJumps ? moves.filter(m => m.type === 'jump') : moves;
  }, [board, selectedPos]);

  // Clear Sandbox board state volledig
  const handleClearBoard = () => {
    saveSandboxHistory(board, turn, mustJumpPos);
    setBoard(Array(8).fill(null).map(() => Array(8).fill(null)));
    setSelectedPos(null);
    setMustJumpPos(null);
  };

  // Reset core setup
  const handleResetCore = () => {
    saveSandboxHistory(board, turn, mustJumpPos);
    setBoard(getInitialBoard());
    setTurn('CYAN');
    setSelectedPos(null);
    setMustJumpPos(null);
  };

  // Switch sandbox turn easily
  const toggleTurn = () => {
    saveSandboxHistory(board, turn, mustJumpPos);
    setTurn(turn === 'CYAN' ? 'WHITE' : 'CYAN');
  };

  const loadScenario = (sc: any) => {
    saveSandboxHistory(board, turn, mustJumpPos);
    setSelectedScenario(sc.id);
    setBoard(sc.setup());
    setTurn('CYAN');
    setSelectedPos(null);
    setMustJumpPos(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#030305]/98 overflow-y-auto z-[200] pt-4 px-4 pb-8 flex flex-col items-center"
    >
      {/* Background grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.025)_0%,transparent_75%)] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-20 flex flex-col items-center">
        {/* Upper Action Bar */}
        <div className="w-full flex justify-between items-center pb-4 mb-4 border-b border-white/5">
          <button
            onClick={onClose}
            className="flex items-center justify-center p-1.5 rounded-xl bg-white/5 hover:bg-neutral-800 text-neutral-350 hover:text-cyan-400 font-extrabold transition-all border border-white/10 hover:border-cyan-500/35 active:scale-95 cursor-pointer shadow-md"
            title={lang === 'KU' ? 'گەڕانەوە' : 'Back'}
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180 text-cyan-400" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-sm sm:text-base font-black tracking-wide text-white uppercase flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'KU' ? 'ڕاهێنەری دامە' : lang === 'AR' ? 'سندبوكس مدرب الدامة' : 'Sandbox Coach Analysis'}</span>
            </h1>
          </div>
        </div>

        {/* 2 Column Bento Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          
          {/* LEFT SIDE: Customizable Playable Board + Canvas Designer Tool (6 Columns) */}
          <div className="lg:col-span-7 flex flex-col items-center gap-3">
            
            {/* Toolbar for designing state (Painting pieces) */}
            <div className="w-full bg-neutral-900/90 border border-white/5 rounded-2xl p-2.5 shadow-md">
              <span className="block text-[9px] font-extrabold text-neutral-400 tracking-wider uppercase mb-1.5 text-center">
                {lang === 'KU' ? '🛠️ ئامرازی شێوەکردنی تەختە (Sandbox Painters)' : lang === 'AR' ? '🛠️ أدوات رسم وتصميم الرقعة' : '🛠️ Sandbox Board Painters'}
              </span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                <button
                  onClick={() => setActiveTool('SELECT')}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                    activeTool === 'SELECT'
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35'
                      : 'bg-white/5 text-neutral-400 border-transparent hover:bg-white/10'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>{lang === 'KU' ? 'یاریکردن' : lang === 'AR' ? 'لعب تفاعلي' : 'Play Match'}</span>
                </button>

                <button
                  onClick={() => setActiveTool('ADD_CYAN_MAN')}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                    activeTool === 'ADD_CYAN_MAN'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 scale-102'
                      : 'bg-white/5 text-cyan-400 border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs">🔵</span>
                  <span>{lang === 'KU' ? 'بەردی شین' : lang === 'AR' ? 'أزرق عادي' : '+Cyan Man'}</span>
                </button>

                <button
                  onClick={() => setActiveTool('ADD_CYAN_KING')}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                    activeTool === 'ADD_CYAN_KING'
                      ? 'bg-cyan-600/25 text-cyan-200 border-cyan-500 scale-102'
                      : 'bg-white/5 text-cyan-300 border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs">👑</span>
                  <span>{lang === 'KU' ? 'شای شین' : lang === 'AR' ? 'شاه أزرق' : '+Cyan King'}</span>
                </button>

                <button
                  onClick={() => setActiveTool('ADD_WHITE_MAN')}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                    activeTool === 'ADD_WHITE_MAN'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/35 scale-102'
                      : 'bg-white/5 text-neutral-300 border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs">⚪</span>
                  <span>{lang === 'KU' ? 'بەردی سپی' : lang === 'AR' ? 'أبيض عادي' : '+White Man'}</span>
                </button>

                <button
                  onClick={() => setActiveTool('ADD_WHITE_KING')}
                  className={`px-2 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                    activeTool === 'ADD_WHITE_KING'
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500 scale-102'
                      : 'bg-white/5 text-yellow-300 border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs">👑</span>
                  <span>{lang === 'KU' ? 'شای سپی' : lang === 'AR' ? 'شاه أبيض' : '+White King'}</span>
                </button>

                <button
                  onClick={() => setActiveTool('ERASE')}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                    activeTool === 'ERASE'
                      ? 'bg-red-500/15 text-red-400 border-red-500/35'
                      : 'bg-white/5 text-neutral-400 border-transparent hover:bg-red-500/10 hover:text-red-300'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{lang === 'KU' ? 'سڕینەوەی خانە' : lang === 'AR' ? 'ممحاة القطعة' : 'Eraser'}</span>
                </button>
              </div>

              {/* Instant commands for Sandbox */}
              <div className="flex gap-2 justify-center mt-2 pt-2 border-t border-white/5">
                <button
                  onClick={handleClearBoard}
                  className="py-1 px-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 rounded-lg text-[9px] font-black cursor-pointer uppercase"
                >
                  {lang === 'KU' ? '🛑 پاککردنەوەی گشتی' : lang === 'AR' ? 'مسح كل الرقعة' : 'Clear Board'}
                </button>

                <button
                  onClick={handleResetCore}
                  className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-neutral-300 border border-white/10 rounded-lg text-[9px] font-black cursor-pointer uppercase"
                >
                  {lang === 'KU' ? '🪵 دۆخی فەرمی' : lang === 'AR' ? 'الوضع الإفتراضي' : 'Default Board'}
                </button>

                <button
                  onClick={toggleTurn}
                  className="py-1 px-2 bg-indigo-950/30 hover:bg-indigo-950/50 text-indigo-300 border border-indigo-500/20 rounded-lg text-[9px] font-black cursor-pointer uppercase"
                >
                  {lang === 'KU' ? `نۆرەی: ${turn === 'CYAN' ? 'شین 🔵' : 'سپی ⚪'}` : lang === 'AR' ? `الدور الآن: ${turn === 'CYAN' ? 'أزرق' : 'أبيض'}` : `Turn: ${turn}`}
                </button>

                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="py-1 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 disabled:opacity-30 disabled:pointer-events-none rounded-lg text-[9px] font-black cursor-pointer uppercase"
                >
                  {lang === 'KU' ? '↩️ گەڕانەوەی جوڵە' : lang === 'AR' ? 'تراجع' : 'Undo step'}
                </button>
              </div>
            </div>

            {/* SANDBOX Interactive Board Rendering */}
            <div className="relative flex flex-col items-center select-none w-full max-w-[420px] bg-slate-950/20 p-2.5 rounded-3xl border border-white/5">
              
              {/* Turn & Painter Instructions */}
              <div className="w-full text-center py-1 text-[11px] font-bold text-neutral-400 mb-1 leading-relaxed">
                {activeTool !== 'SELECT' ? (
                  <span className="text-[#fbbf24] animate-pulse">
                    {lang === 'KU' ? '🎨 مۆدی دیزاین پێ کراوە: کلیک لە خانەکان بکە بۆ گۆڕینی بەردەکان' : lang === 'AR' ? '🎨 وضع التصميم نشط: انقر لتغيير أو إضافة القطع' : '🎨 Paint tool active: click squares to painter pieces'}
                  </span>
                ) : (
                  <span>
                    {lang === 'KU' ? `نۆرەی یاریکردن: ` : lang === 'AR' ? 'دور اللاعب: ' : 'Active analytical turn: '}{' '}
                    <span className={turn === 'CYAN' ? 'text-cyan-400 font-extrabold' : 'text-amber-400 font-extrabold'}>
                      {turn === 'CYAN' ? (lang === 'KU' ? 'شین (تۆ)' : lang === 'AR' ? 'الأزرق' : 'CYAN') : (lang === 'KU' ? 'سپی (مەکینە)' : lang === 'AR' ? 'الأبيض' : 'WHITE')}
                    </span>
                  </span>
                )}
              </div>

              {/* Core board grids */}
              <div className="grid grid-cols-8 gap-0 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border-4 border-slate-700 bg-slate-200">
                {board.map((row, r: number) =>
                  row.map((piece, c: number) => {
                    const isDark = (r + c) % 2 === 1;
                    const isSelected = selectedPos?.r === r && selectedPos?.c === c;
                    const isMustJump = mustJumpPos?.r === r && mustJumpPos?.c === c;
                    
                    // Is this square high-lighted as a valid move endpoint?
                    const isDestination = highlightDestinations.some(m => m.dest.r === r && m.dest.c === c);
                    
                    // Is this square a piece under live danger (threatened)?
                    const isVulnerable = showAnalysis && turn === 'CYAN' && scannedVulnerabilities.some(sq => sq.r === r && sq.c === c);
                    
                    // Is this square a tactical white piece that CYAN can jump/attack?
                    const isAttackTarget = showAnalysis && turn === 'CYAN' && scannedAttacks.some(sq => sq.r === r && sq.c === c);

                    return (
                      <div
                        key={`sandbox-cell-${r}-${c}`}
                        onClick={() => handleSquareClick(r, c)}
                        className={`
                          relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center transition-all duration-200 cursor-pointer
                          ${isDark ? 'bg-slate-800' : 'bg-slate-300'}
                          ${isSelected ? 'ring-inset ring-4 ring-cyan-400 brightness-110 z-10 scale-102 rounded-lg' : ''}
                          ${isMustJump ? 'ring-inset ring-4 ring-rose-500 animate-pulse z-10 rounded-lg' : ''}
                          ${isVulnerable ? 'ring-inset ring-3 ring-red-500 shadow-[0_0_12px_rgba(239,68,68,0.85)] z-10 scale-95 duration-100' : ''}
                          ${isAttackTarget ? 'ring-inset ring-3 ring-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.85)] z-10 scale-98 hover:brightness-125' : ''}
                          overflow-visible
                        `}
                      >
                        {/* Interactive Move Highlight Dots */}
                        {isDestination && (
                          <div className="absolute inset-2 border-2 border-dashed border-cyan-400 rounded-full animate-pulse flex items-center justify-center bg-cyan-400/10 pointer-events-none z-10">
                            <div className="w-2 rounded-full h-2 bg-cyan-400" />
                          </div>
                        )}

                        {/* Rendering core pieces */}
                        <AnimatePresence>
                          {piece && (
                            <motion.div
                              key={piece.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                            >
                              <PieceComponent piece={piece} styleType="WHITE_BLACK" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Indicator legend panel */}
              {showAnalysis && (
                <div className="w-full flex justify-center gap-4 mt-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1.5 text-red-400 select-none">
                    <span className="w-2.5 h-2.5 rounded bg-red-500 ring-2 ring-red-300 shadow-md inline-block" />
                    {lang === 'KU' ? 'خاڵی لاواز (مەترسی)' : lang === 'AR' ? 'نقطة ضعف مهددة' : 'Vulnerable'}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400 select-none">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 ring-2 ring-emerald-300 shadow-md inline-block" />
                    {lang === 'KU' ? 'هێرش (کۆینی ئامادە)' : lang === 'AR' ? 'فرصة هجوم ذهبية' : 'Attack Target'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Real-time Smart Analysis Report + Training Scenario Templates (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* 1. SMART ANALYSIS PANEL */}
            <div className="bg-gradient-to-br from-[#0c0d12] via-[#090b10] to-[#040507] border-2 border-cyan-500/20 rounded-2xl p-4 sm:p-5 relative shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    {lang === 'KU' ? 'ڕاپۆرتی شیکاری مەکینە' : lang === 'AR' ? 'تقرير تحليل الذكاء الاصطناعي' : 'Smart Analysis Report'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${
                    showAnalysis
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : 'bg-white/5 text-neutral-400 border-transparent hover:bg-white/10'
                  }`}
                >
                  {showAnalysis ? (lang === 'KU' ? 'سکانەر کارایە' : lang === 'AR' ? 'الماسح نشط' : 'Scanner On') : (lang === 'KU' ? 'ناچالاکە' : lang === 'AR' ? 'الماسح مغلق' : 'Scanner Off')}
                </button>
              </div>

              {showAnalysis ? (
                <div className="space-y-4 text-left">
                  
                  {/* Danger alert if vulnerabilities found */}
                  {scannedVulnerabilities.length > 0 ? (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2.5 items-start">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-extrabold text-red-400 uppercase tracking-wide text-right ltr:text-left">
                          {lang === 'KU' ? 'ئاگاداری: مەترسی ڕاستەوخۆ!' : lang === 'AR' ? 'تحذير: ثغرات خطيرة بالدفاع!' : 'Warning: Direct Danger!'}
                        </h4>
                        <p className="text-[10px] text-neutral-300 mt-0.5 leading-relaxed text-right ltr:text-left">
                          {lang === 'KU' 
                            ? `ڕاهێنەر: سپی دەتوانێت یەکێک لە ${scannedVulnerabilities.length} بەردی شینی دیاریکراو بخۆێت! دەبێت بیانپارێزیت یان پلانەکە بگۆڕیت.`
                            : lang === 'AR'
                            ? `الخبير: يمكن للأبيض التقاط وأكل ${scannedVulnerabilities.length} أحجار من قطعك المحاطة بالأحمر. قم بتحريكها فوراً!`
                            : `White has direct jumps on ${scannedVulnerabilities.length} of your highlighted Cyan pieces. Protect them or block the pathways!`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2.5 items-start">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <h4 className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wide text-right ltr:text-left">
                          {lang === 'KU' ? 'دفاعی نایاب و تۆکمە!' : lang === 'AR' ? 'دفاعاتك قوية ومؤمنة!' : 'Flawless Defenses!'}
                        </h4>
                        <p className="text-[10px] text-neutral-300 mt-0.5 leading-relaxed text-right ltr:text-left">
                          {lang === 'KU' 
                            ? 'هیچ بەردێکی تۆ ناکەوێتە مەترسی بەهۆی جووڵەی دوژمن لەم دۆخەدا. زۆرباشە!' 
                            : lang === 'AR' 
                            ? 'لا توجد قطع زرقاء تحت تهديد الأكل الفوري حالياً من الخصم الأبيض. رائع جداً!' 
                            : 'Good news! None of your pieces are under immediate capture threats on this turns.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Opportunities display */}
                  {scannedAttacks.length > 0 ? (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex gap-2.5 items-start">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wide text-right ltr:text-left">
                          {lang === 'KU' ? 'فرسەتی هێرش: بردنەوە بەدەستبێنە' : lang === 'AR' ? 'فرصة هجومية تكتيكية!' : 'Tactical Attack Found!'}
                        </h4>
                        <p className="text-[10px] text-neutral-200 mt-0.5 leading-relaxed text-right ltr:text-left">
                          {lang === 'KU' 
                            ? `دەتوانیت بەردی سپی باز بدەیت بەسەریدا و بە کۆینی سەوز نیشانت داوە. کلیک بکە لەسەر بەردەت و بە دڵنیاییەوە بیخۆ!` 
                            : lang === 'AR' 
                            ? `لديك القدرة المأذونة للتهام وتدمير أحجار بيضاء محددة بالأخضر. تصرف فوراً لتحقيق النقاط الطائرة!` 
                            : `You have direct opportunities to jump and capture the highlighted green White pieces. Engage them now!`}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Summary of force strength */}
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-[11px] text-neutral-300 space-y-1">
                    <span className="block font-bold text-neutral-400 border-b border-white/5 pb-1 mb-1.5 uppercase text-[9px] tracking-wider text-right ltr:text-left">
                      {lang === 'KU' ? 'پوختەی زیرەکی هێزەکان' : lang === 'AR' ? 'تحليل توازن القوى' : 'Tactical Force Metrics'}
                    </span>
                    <div className="flex justify-between font-semibold">
                      <span>{lang === 'KU' ? 'بەردەکانی تۆ (CYAN):' : lang === 'AR' ? 'قطعك الزرقاء:' : 'Your pieces (Cyan):'}</span>
                      <span className="text-cyan-400 font-extrabold">{board.flat().filter(p => p && p.player === 'CYAN').length}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>{lang === 'KU' ? 'شا (kings) شین:' : lang === 'AR' ? 'الأشواك الزرقاء:' : 'King Cyan Pieces:'}</span>
                      <span className="text-cyan-300 font-extrabold">{board.flat().filter(p => p && p.player === 'CYAN' && p.type === 'KING').length}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>{lang === 'KU' ? 'بەردەکانی سپی:' : lang === 'AR' ? 'قطع الأبيض الخصم:' : 'Enemy pieces (White):'}</span>
                      <span className="text-amber-400 font-extrabold">{board.flat().filter(p => p && p.player === 'WHITE').length}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-6 text-xs text-neutral-500 font-semibold">
                  {lang === 'KU' ? 'سکانەری شیکاری زیرەک کوژاوەتەوە.' : lang === 'AR' ? 'ماسح الخبير مغلق الآن.' : 'Analysis scanner reports are disabled.'}
                </div>
              )}
            </div>

            {/* 2. TRAINING SCENARIOS */}
            <div className="bg-[#0b0c0f] border border-white/5 rounded-2xl p-4 sm:p-5 relative shadow-lg text-left">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/5">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  {lang === 'KU' ? 'مەشقەکانی پاڵەوان (Grandmaster Tactics)' : lang === 'AR' ? 'تدريبات درب الملوك للمحترفين' : 'Grandmaster Scenario Presets'}
                </h3>
              </div>

              <div className="space-y-2.5">
                {SCENARIOS.map((sc) => {
                  const isCur = selectedScenario === sc.id;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => loadScenario(sc)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-right ltr:text-left ${
                        isCur
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-md scale-101'
                          : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5'
                      }`}
                    >
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5 justify-end ltr:justify-start">
                        {isCur && <span className="text-amber-400 animate-pulse">●</span>}
                        <span>{lang === 'KU' ? sc.titleKu : lang === 'AR' ? sc.titleAr : sc.titleEn}</span>
                      </h4>
                      <p className="text-[10px] text-neutral-400 mt-1 font-semibold leading-relaxed">
                        {lang === 'KU' ? sc.descKu : lang === 'AR' ? sc.descAr : sc.descEn}
                      </p>
                      
                      <div className="mt-2 flex justify-end ltr:justify-start">
                        <span className="text-[8.5px] bg-[#fbbf24]/10 text-[#fbbf24] px-1.5 py-0.5 rounded border border-[#fbbf24]/15 font-black uppercase tracking-wider scale-95">
                          {lang === 'KU' ? 'مەشق بکە 🚀' : lang === 'AR' ? 'بدء التمرين 🚀' : 'Load Scenario 🚀'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </motion.div>
  );
}
