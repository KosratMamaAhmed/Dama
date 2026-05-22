import React, { useReducer, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initialGameState, gameReducer } from './store/gameReducer';
import Board from './components/Board';
import InstallPrompt from './components/InstallPrompt';
import { RobotAvatar, KurdishManAvatar } from './components/Avatars';
import { getTokens, saveTokens, addWinTokens, deductLossTokens, claimHourlyTokens, getZeroTokensTime } from './store/tokenStore';
import { Play, Users, Cpu, Settings, Volume2, VolumeX, Home as HomeIcon, RefreshCw, Trophy, AlertCircle, ChevronLeft, Bot, User, Coins, Lightbulb } from 'lucide-react';
import { useDropSound } from './useSound';
import { GameMode, Difficulty, BoardTheme, Player } from './types';
import { TRANSLATIONS, Language } from './translations';
import { getAIMove } from './ai';
import MarkdownParser from './components/MarkdownParser';

type ScreenType = 'HOME' | 'PLAYING' | 'RULES';

const BOARD_THEMES_3: { id: BoardTheme; nameKu: string; nameEn: string; nameAr: string; colors: string }[] = [
  { id: 'CLASSIC_WOOD', nameKu: 'تەختەی کلاسیک 🪵', nameEn: 'Classic Sablax Wood', nameAr: 'خشب كلاسيكي عتيق', colors: 'from-amber-800 to-stone-900' },
  { id: 'ROYAL_GOLD', nameKu: 'لوکس و شاهانە 👑', nameEn: 'Royal Gold Luxury', nameAr: 'الذهبي الملكي الفاخر', colors: 'from-amber-600 to-yellow-950' },
  { id: 'DARK_MARBLE', nameKu: 'مەڕمەڕی تاریک ✨', nameEn: 'Polished Dark Marble', nameAr: 'الرخام الأسود المصقول', colors: 'from-slate-800 to-slate-950' },
];

const PIECE_MATCHUPS_3 = [
  { id: 'WHITE_BLACK', nameKu: 'سپی کریستاڵ و ڕەش', nameEn: 'Crystal White & Deep Black', nameAr: 'أبيض وأسود كلاسيكي' },
  { id: 'GOLD_BLACK', nameKu: 'زێڕینی شاهانە و ڕەش', nameEn: 'Royal Gold & Jet Black', nameAr: 'ذهبي ملكي وأسود ملكي' },
  { id: 'RUBY_EMERALD', nameKu: 'مرواری سەوز و سوور 💎', nameEn: 'Emerald Green & Ruby Red', nameAr: 'أخضر زمردي وأحمر ياقوتي' },
];

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20">
      {/* Full screen retro checkerboard backdrop with subtle low-intensity warm gold reflections */}
      <div className="absolute inset-0 classic-retro-checkers opacity-15 sm:opacity-20" />
      
      {/* Real-time moving checkers pattern layer to add life */}
      <div className="absolute inset-0 animated-checkers opacity-10" />
      
      {/* Floating high-end cosmic golden stars/globes drifting in background */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-amber-550/10"
          style={{
            width: `${i % 2 === 0 ? 35 : 55}px`,
            height: `${i % 2 === 0 ? 35 : 55}px`,
            background: i % 2 === 0 
              ? 'radial-gradient(circle at 35% 35%, #fcb52c -5%, #b45309 60%, #1c0d02 100%)' 
              : 'radial-gradient(circle at 35% 35%, #fbbf24 10%, #d97706 65%, #2d1000 100%)',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.12), inset 0 2px 4px rgba(255,255,255,0.15)',
            top: `${10 + i * 15}%`,
            left: `${5 + (i * 26) % 85}%`,
            opacity: 0.16,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 25, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 18 + i * 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Elegant deep space backdrop vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.01)_0%,rgba(0,0,0,0.88)_75%,#020202_100%)]" />
      
      {/* Royal gold spotlight effect emanating from above */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.06)_0%,transparent_70%)]" />
    </div>
  );
}

const BOT_CAPTURE_COMMENTS: Record<Language, string[]> = {
  KU: [
    "ئۆمێدی باشت بۆ دەخوازم! بەردێکی ترت ڕفێندرا! 😜🔥",
    "زیرەکی دەستکار بەتەواوی بەهێزە، بیر لەوە بکەوە! 🤖📈",
    "تۆزێک ئاگاداربە، ڕێگاکە زۆر تیژە چاوەکەم! 😎✨",
    "چیتر ئەم بەردەت نەما، مەتامۆرفیک بوو! ♟️",
  ],
  EN: [
    "Better luck next time! Another piece captured! 😜🔥",
    "AI is supreme! Your defenses are falling! 🤖📈",
    "Look closer next time, you can do better! 😎✨",
    "Checkmate ideas? Not on my watch! ♟️",
  ],
  AR: [
    "حظاً موفقاً المرة القادمة! لقد تم أكل حجرك! 😜🔥",
    "أنا الذكاء الاصطناعي، خطتك مكشوفة أمامي! 🤖📈",
    "ركز أكثر يا صديقي، اللعبة ما زالت طويلة! 😎✨",
    "عذراً، ولكن هذا الحجر قد اختفى الآن! ♟️",
  ]
};

const BOT_SHOCKED_COMMENTS: Record<Language, string[]> = {
  KU: [
    "ئای لەو جووڵەیە! زۆر لەوە زیرەکتر بووی کە پێشبینیم دەکرد! 😳💥",
    "دەستخۆش! جوڵەیەکی زۆر سەرسوڕهێنەر بوو! 👏🧠",
    "بۆستە! چۆن توانیت ئەم بەردەم پەلکێش بکەیت؟! 🤖📈",
    "واو! چ چاوێکی دۆزەرەوە و بەهێزت هەیە! 👑🌟",
  ],
  EN: [
    "What a masterstroke! You are brilliant! 😳💥",
    "Exquisite choice! That move was genius! 👏🧠",
    "Wait, how did you find that gap?! 🤖📈",
    "Wow! Incredible foresight! 👑🌟",
  ],
  AR: [
    "يا لها من حركة عبقرية! لم أتوقع هذا أبداً! 😳💥",
    "أبدعت! هذه الحركة تستحق التصفيق! 👏🧠",
    "مهلاً، كيف استطعت كشف هذه الثغرة لابتلاعي؟! 🤖📈",
    "واو! رؤية تكتيكية ممتازة جداً! 👑🌟",
  ]
};

export default function App() {
  const [lang, setLang] = useState<Language>('KU');
  const [screen, setScreen] = useState<ScreenType>('HOME');
  const [mode, setMode] = useState<GameMode>('AI');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [theme, setTheme] = useState<BoardTheme>('CLASSIC_WOOD');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  
  const [tokens, setTokens] = useState<number>(100);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [showAiSetupModal, setShowAiSetupModal] = useState(false);

  // Expanded menu settings items
  const [pieceStyle, setPieceStyle] = useState<string>('WHITE_BLACK');
  const [shakeBoard, setShakeBoard] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [bubbleSender, setBubbleSender] = useState<'CYAN' | 'WHITE' | null>(null);
  const [cacheClearToast, setCacheClearToast] = useState(false);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClearCacheAndRefresh = () => {
    // Keep tokens absolutely safe
    saveTokens(tokens);
    setCacheClearToast(true);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  const playSound = useDropSound();
  const prevBoard = useRef(gameState.board);
  const prevWinner = useRef(gameState.winner);
  
  // AI Worker instance mapping
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    setTokens(getTokens());
    const claimed = claimHourlyTokens();
    if (claimed) {
      setTokens(getTokens());
    }

    const checkCooldown = () => {
      const zeroTime = getZeroTokensTime();
      if (zeroTime) {
        const elapsed = Date.now() - zeroTime;
        const leftSecs = Math.max(0, Math.ceil((3600000 - elapsed) / 1000));
        setCooldownRemaining(leftSecs);
        if (leftSecs <= 0) {
          // Cooldown finished! Refresh tokens
          const refreshed = getTokens();
          setTokens(refreshed);
        }
      } else {
        setCooldownRemaining(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [tokens]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./aiWorker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e) => {
      const move = e.data.move;
      if (move) {
        dispatch({ type: 'SELECT_OR_MOVE', payload: { r: move.r, c: move.c } });
        setTimeout(() => {
          dispatch({ type: 'SELECT_OR_MOVE', payload: { r: move.dest.r, c: move.dest.c } });
        }, 350);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (gameState.winner && !prevWinner.current) {
      if (soundEnabled) playSound('win');
      // Token Logic
      if (mode === 'AI') {
        if (gameState.winner === 'CYAN') {
          addWinTokens();
        } else {
          deductLossTokens();
        }
        setTokens(getTokens());
      }
    } else if (gameState.board !== prevBoard.current) {
      // Detect captures & king actions
      const prevCyan = prevBoard.current?.flat().filter(p => p && p.player === 'CYAN').length ?? 16;
      const currentCyan = gameState.board.flat().filter(p => p && p.player === 'CYAN').length;
      const prevWhite = prevBoard.current?.flat().filter(p => p && p.player === 'WHITE').length ?? 16;
      const currentWhite = gameState.board.flat().filter(p => p && p.player === 'WHITE').length;

      const userLoss = currentCyan < prevCyan;
      const botLoss = currentWhite < prevWhite;

      if (soundEnabled) {
        if (userLoss || botLoss) {
          playSound('capture');
        } else {
          playSound('move');
        }
      }

      let kingCaptured = false;
      if (userLoss || botLoss) {
        const capturer: Player = userLoss ? 'WHITE' : 'CYAN';
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const currentCell = gameState.board[r][c];
            const prevCell = prevBoard.current ? prevBoard.current[r][c] : null;
            if (currentCell && currentCell.player === capturer && currentCell.type === 'KING') {
              if (!prevCell || prevCell.player !== capturer) {
                kingCaptured = true;
                break;
              }
            }
          }
        }
      }

      // Shaking disabled to support smooth performance on all devices (anti-lag & anti-bounce)

      // Voice commentary bubbling
      if (bubbleTimeoutRef.current) {
        clearTimeout(bubbleTimeoutRef.current);
      }

      if (userLoss && mode === 'AI') {
        const comments = BOT_CAPTURE_COMMENTS[lang] || BOT_CAPTURE_COMMENTS['EN'];
        const chosen = comments[Math.floor(Math.random() * comments.length)];
        setBubbleText(chosen);
        setBubbleSender('WHITE');
        bubbleTimeoutRef.current = setTimeout(() => {
          setBubbleText(null);
          setBubbleSender(null);
        }, 5500);
      } else if (botLoss && mode === 'AI') {
        const comments = BOT_SHOCKED_COMMENTS[lang] || BOT_SHOCKED_COMMENTS['EN'];
        const chosen = comments[Math.floor(Math.random() * comments.length)];
        setBubbleText(chosen);
        setBubbleSender('WHITE'); // Bot reacts to being eaten
        bubbleTimeoutRef.current = setTimeout(() => {
          setBubbleText(null);
          setBubbleSender(null);
        }, 5500);
      }
    }
    prevBoard.current = gameState.board;
    prevWinner.current = gameState.winner;
  }, [gameState.board, gameState.winner, playSound, soundEnabled, mode, lang]);

  // Trigger AI via Worker
  useEffect(() => {
    if (screen === 'PLAYING' && mode === 'AI' && gameState.turn === 'WHITE' && !gameState.winner) {
      const timer = setTimeout(() => {
        workerRef.current?.postMessage({
          board: gameState.board,
          difficulty,
          turn: 'WHITE',
          mustJumpPos: gameState.mustJumpPos
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [screen, mode, difficulty, gameState.turn, gameState.winner, gameState.board]);

  // Handle mandatory capture warnings
  useEffect(() => {
    if (gameState.mustJumpWarning) {
      setShakeBoard(true);
      const shakeTimer = setTimeout(() => {
        setShakeBoard(false);
      }, 500);

      if (soundEnabled) {
        playSound('error');
      }

      setBubbleText(
        lang === 'KU' ? 'دەبێت ئەو بەردە بخۆیت! خواردنی ناچارییە.' :
        lang === 'AR' ? 'يجب عليك أكل هذا الحجر! التقاط إلزامي.' :
        'You must capture that piece! Mandatory capture.'
      );
      setBubbleSender('WHITE');

      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      bubbleTimeoutRef.current = setTimeout(() => {
        setBubbleText(null);
        setBubbleSender(null);
      }, 4500);

      dispatch({ type: 'CLEAR_MUST_JUMP_WARNING' });

      return () => clearTimeout(shakeTimer);
    }
  }, [gameState.mustJumpWarning, soundEnabled, playSound, lang]);

  const deductActivePenalty = () => {
    if (screen === 'PLAYING' && !gameState.winner) {
      const nextVal = Math.max(0, tokens - 5);
      saveTokens(nextVal);
      setTokens(nextVal);
    }
  };

  const handleFullReset = () => {
    deductActivePenalty();
    dispatch({ type: 'RESET_GAME' });
  };

  const startGame = () => {
    if (cooldownRemaining > 0 || tokens <= 0) {
      return; // Locked out!
    }
    // Fresh game
    dispatch({ type: 'RESET_GAME' });
    setScreen('PLAYING');
    setShowAiSetupModal(false);
  };

  const handleStartAction = () => {
    if (cooldownRemaining > 0 || tokens <= 0) {
      return; // Locked out!
    }
    if (mode === 'AI') {
      setShowAiSetupModal(true);
    } else {
      startGame();
    }
  };

  const getCooldownString = () => {
    const m = Math.floor(cooldownRemaining / 60);
    const s = cooldownRemaining % 60;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    const sStr = s < 10 ? `0${s}` : `${s}`;
    
    if (lang === 'KU') {
      return `مەکینە داخراوە! ${mStr}:${sStr} چاوەڕوان بە بۆ نوێبوونەوەی 40 کۆین ⏳`;
    } else if (lang === 'AR') {
      return `الحساب مؤمن! متبقي ${mStr}:${sStr} دقيقة للحصول على 40 كوين ⏳`;
    }
    return `Locked! Wait ${mStr}:${sStr} to replenish 40 coins ⏳`;
  };

  const requestHint = () => {
    if (gameState.hintsLeft > 0 && gameState.turn === 'CYAN' && !gameState.winner) {
      const moveOpts = getAIMove(gameState.board, 'EXPERT', 'CYAN', gameState.mustJumpPos);
      if (moveOpts) {
        dispatch({ type: 'USE_HINT', payload: { r: moveOpts.r, c: moveOpts.c, dest: moveOpts.dest } });
      }
    }
  };

  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'KU' || lang === 'AR';

  // Hardware Back Button state synchronizer & double-tap to exit sequence
  const [exitToast, setExitToast] = useState(false);
  const backPressTimeRef = useRef<number>(0);

  useEffect(() => {
    // Standard setup
    window.history.replaceState({ screen: 'HOME' }, '');

    const handlePopState = (e: PopStateEvent) => {
      const stateScreen = e.state?.screen as ScreenType | undefined;

      if (screen !== 'HOME') {
        // Dynamic back behavior: Any non-home page returns to home state
        if (screen === 'PLAYING') {
          deductActivePenalty();
        }
        setScreen('HOME');
        // Restore home item in browser history
        window.history.replaceState({ screen: 'HOME' }, '');
      } else {
        // Back pressed while on HOME screen (exit prompt)
        const now = Date.now();
        if (now - backPressTimeRef.current < 2000) {
          // Double press within 2s, allow browser default exit behaviour
          setExitToast(false);
          window.history.go(-1);
        } else {
          backPressTimeRef.current = now;
          setExitToast(true);
          setTimeout(() => setExitToast(false), 2000);
          // Restore the history stack back-stop
          window.history.pushState({ screen: 'HOME' }, '');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [screen, tokens, gameState.winner]);

  // Sync state transitions to history stack manually
  useEffect(() => {
    if (window.history.state?.screen !== screen) {
      window.history.pushState({ screen }, '');
    }
  }, [screen]);

  const cyanCount = gameState.board.flat().filter(p => p && p.player === 'CYAN').length;
  const whiteCount = gameState.board.flat().filter(p => p && p.player === 'WHITE').length;
  const capturedByCyan = 16 - whiteCount;
  const capturedByWhite = 16 - cyanCount;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#020202] text-neutral-100 flex flex-col font-sans overflow-hidden selection:bg-amber-500/30 selection:text-amber-200 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#140f07,#000000)] -z-20" />
      
      {/* Dynamic Animated Checkers Board Floating background */}
      <AnimatedBackground />

      {/* HEADER - Slim, optimized, responsive and professional */}
      <header className="flex justify-between items-center py-2 px-3 sm:px-4 lg:px-6 border-b border-white/5 backdrop-blur-md relative z-30 bg-black/35 select-none shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tokens counter */}
          <div className="flex items-center space-x-1 space-x-reverse bg-amber-500/10 border border-amber-500/35 text-amber-300 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black shadow-[0_0_10px_rgba(245,158,11,0.15)]">
            <Coins className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0 text-amber-400" />
            <span>{tokens}</span>
          </div>

          {/* If on HOME screen: Instant Flush Cache & Safe Refresh Button */}
          {screen === 'HOME' && (
            <button
              onClick={handleClearCacheAndRefresh}
              title={lang === 'KU' ? 'سڕینەوەی کاش و نوێکردنەوە' : lang === 'AR' ? 'مسح الكاش والتحديث' : 'Flush Cache & Safe Refresh'}
              className="flex items-center space-x-1.5 space-x-reverse py-1 px-2.5 rounded-lg transition-all text-xs font-bold uppercase cursor-pointer bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 active:scale-95 shadow-md shadow-orange-950/20"
            >
              <RefreshCw className="w-3 h-3 text-orange-400 animate-[spin_6s_linear_infinite]" />
              <span className="hidden xs:inline">
                {lang === 'KU' ? 'سڕینەوەی کاش' : lang === 'AR' ? 'مسح الكاش' : 'Safe Reset'}
              </span>
            </button>
          )}

          {/* If on PLAYING screen: Home/Exit, Back/Undo, and Restart */}
          {screen === 'PLAYING' && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Home/Exit button */}
              <button
                onClick={() => {
                  deductActivePenalty();
                  setScreen('HOME');
                }}
                className="flex items-center space-x-1 space-x-reverse py-1 table-cell px-2 sm:px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-black transition-all duration-300 active:scale-95 cursor-pointer"
                title={lang === 'KU' ? 'هۆم' : lang === 'AR' ? 'الرئيسية' : 'Home'}
              >
                <HomeIcon className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xs:inline mr-1 rtl:ml-1">
                  {lang === 'KU' ? 'هۆم' : lang === 'AR' ? 'الرئيسية' : 'Home'}
                </span>
              </button>

              {/* Back / Undo button */}
              <button
                onClick={() => dispatch({ type: 'UNDO_MOVE' })}
                className="flex items-center space-x-1 space-x-reverse py-1 px-2 sm:px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-black transition-all duration-300 active:scale-95 cursor-pointer"
                title={lang === 'KU' ? 'گەڕانەوە' : lang === 'AR' ? 'تراجع' : 'Undo'}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline mr-1 rtl:ml-1">
                  {lang === 'KU' ? 'گەڕانەوە' : lang === 'AR' ? 'تراجع' : 'Back'}
                </span>
              </button>

              {/* Restart button */}
              <button
                onClick={handleFullReset}
                className="flex items-center space-x-1 space-x-reverse py-1 px-2 sm:px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 text-xs font-black transition-all duration-300 active:scale-95 cursor-pointer mr-1 rtl:mr-0 rtl:ml-1"
                title={lang === 'KU' ? 'دوبارەکردنەوەی یاری' : lang === 'AR' ? 'إعادة اللعب' : 'Restart'}
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline mr-1 rtl:ml-1">
                  {lang === 'KU' ? 'دوبارە' : lang === 'AR' ? 'إعادة' : 'Restart'}
                </span>
              </button>

              {/* Hint button for AI gameplay */}
              {mode === 'AI' && (
                <button
                  onClick={requestHint}
                  disabled={gameState.hintsLeft <= 0 || gameState.turn !== 'CYAN' || !!gameState.winner}
                  className={`flex items-center space-x-1.5 space-x-reverse py-1 px-2 sm:px-3 rounded-lg text-xs font-black transition-all duration-300 active:scale-95 cursor-pointer ${
                    gameState.hintsLeft > 0 && gameState.turn === 'CYAN' && !gameState.winner
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-350 border border-amber-500/20 shadow-md shadow-amber-950/20'
                      : 'bg-neutral-800/40 border border-white/5 text-neutral-500 cursor-not-allowed opacity-40'
                  }`}
                  title={lang === 'KU' ? 'ڕێنمایی' : lang === 'AR' ? 'تلميح' : 'Hint'}
                >
                  <Lightbulb className={`w-3.5 h-3.5 ${gameState.hintsLeft > 0 && gameState.turn === 'CYAN' && !gameState.winner ? 'text-amber-400 animate-pulse' : 'text-neutral-500'}`} />
                  <span className="hidden sm:inline mr-1 rtl:ml-1">
                    {lang === 'KU' ? `ڕێنمایی (${gameState.hintsLeft})` : lang === 'AR' ? `تلميح (${gameState.hintsLeft})` : `Hint (${gameState.hintsLeft})`}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>
          
          {/* Language selection toolbar */}
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
            <button onClick={() => setLang('KU')} className={`px-2 py-1 text-[10px] font-black rounded-md transition cursor-pointer ${lang === 'KU' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 shadow-sm' : 'text-neutral-400 hover:text-white'}`}>KU</button>
            <button onClick={() => setLang('EN')} className={`px-2 py-1 text-[10px] font-black rounded-md transition cursor-pointer ${lang === 'EN' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 shadow-sm' : 'text-neutral-400 hover:text-white'}`}>EN</button>
            <button onClick={() => setLang('AR')} className={`px-2 py-1 text-[10px] font-black rounded-md transition cursor-pointer ${lang === 'AR' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 shadow-sm' : 'text-neutral-400 hover:text-white'}`}>AR</button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center p-4 sm:p-6 md:p-8 relative z-10 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {screen === 'HOME' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.95, y: 11 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -11 }}
              className="w-full max-w-lg my-auto bg-[#050508]/98 border-2 border-amber-500/20 shadow-[0_25px_60px_rgba(242,158,11,0.15)] rounded-3xl p-6 sm:p-8 relative z-10 backdrop-blur-2xl animate-fade-in overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(circle at top left, rgba(245, 158, 11, 0.06), transparent)',
              }}
            >
              <div className="space-y-6">
                {/* Visual Header with glowing badge */}
                <div className="text-center relative py-1">
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-40 h-10 bg-gradient-to-r from-amber-500/10 via-yellow-600/10 to-orange-500/10 blur-xl rounded-full" />
                  <span className="text-xs font-black tracking-widest text-[#fbbf24] select-none uppercase bg-white/5 px-4 py-1.5 border border-amber-500/20 rounded-full shadow-inner">
                    Dama / دامە
                  </span>
                </div>

                {/* Mode Selection */}
                <div>
                  <label className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest mb-3 block text-center">
                    {lang === 'KU' ? 'هەڵبژاردنی مۆدی یاری • دەستپێکردن' : lang === 'AR' ? 'اختر نمط اللعب' : 'Select Game Mode'}
                  </label>
                  <div className="flex flex-col gap-3 w-full font-sans">
                    {/* Mode 1: AI (Robot) */}
                    <button
                      onClick={() => setMode('AI')}
                      className={`w-full relative flex items-center justify-center py-[13px] px-[21px] rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group select-none ${
                        mode === 'AI' 
                          ? 'bg-gradient-to-l from-black via-[#0d0a06] to-[#1a1309] border-amber-500 shadow-[0_6px_25px_rgba(245,158,11,0.22)] scale-[1.02]' 
                          : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      {/* Left Side: Mode Explainer (centered) */}
                      <div className="flex flex-col items-center text-center">
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold ${mode === 'AI' ? 'text-amber-400 font-black' : 'text-neutral-500'}`}>
                          {lang === 'KU' ? 'سیستەمی زیرەک' : lang === 'AR' ? 'الذكاء الاصطناعي' : 'CYBER AI'}
                        </span>
                        <span className={`block text-base font-black mt-0.5 ${mode === 'AI' ? 'text-[#fefefe]' : 'text-neutral-300'}`}>
                          {lang === 'KU' ? 'یاری لەگەڵ ژیری دەستکرد' : lang === 'AR' ? 'یاری لەگەڵ ژیری دەستکرد' : t.PLAY_AI}
                        </span>
                      </div>

                      {/* Right Side: Sleek Robot Icon/Avatar at the far right */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0">
                        {mode === 'AI' ? (
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-500/40 shadow-md">
                            <RobotAvatar />
                          </div>
                        ) : (
                          <div className="w-9 h-9 bg-neutral-800 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-neutral-700 transition-all">
                            <Bot className="w-5 h-5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Mode 2: Friend (Traditional Human Player) */}
                    <button
                      onClick={() => setMode('FRIEND')}
                      className={`w-full relative flex items-center justify-center py-[13px] px-[21px] rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group select-none ${
                        mode === 'FRIEND' 
                          ? 'bg-gradient-to-l from-black via-[#0d0a06] to-[#1a1309] border-amber-500 shadow-[0_6px_25px_rgba(245,158,11,0.22)] scale-[1.02]' 
                          : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      {/* Left Side: Mode Explainer (centered) */}
                      <div className="flex flex-col items-center text-center">
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold ${mode === 'FRIEND' ? 'text-amber-400 font-black' : 'text-neutral-500'}`}>
                          {lang === 'KU' ? 'هاوڕێی ئۆفلاین' : lang === 'AR' ? 'صديق أوفلاين' : 'LOCAL DUEL'}
                        </span>
                        <span className={`block text-base font-black mt-0.5 ${mode === 'FRIEND' ? 'text-[#fefefe]' : 'text-neutral-300'}`}>
                          {lang === 'KU' ? 'یاری لەگەڵ هاوڕێ' : lang === 'AR' ? 'یاری لەگەڵ هاوڕێ' : t.PLAY_FRIEND}
                        </span>
                      </div>

                      {/* Right Side: Sleek Kurdish Man Icon/Avatar at the far right */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center shrink-0">
                        {mode === 'FRIEND' ? (
                          <div className="w-9 h-9 rounded-xl overflow-hidden border border-amber-550/40 shadow-md">
                            <KurdishManAvatar />
                          </div>
                        ) : (
                          <div className="w-9 h-9 bg-neutral-800 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-neutral-700 transition-all">
                            <Users className="w-5 h-5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                 {/* BOARD THEMES - 3 Choices directly inside home dashboard */}
                <div>
                  <label className="text-[10px] font-extrabold text-[#fbbf24] uppercase tracking-widest mb-3 block text-center">
                    {t.BOARD_THEME} • دیزاینی تەختەی یاری
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BOARD_THEMES_3.map((themItem) => {
                      const isSelected = theme === themItem.id;
                      let bgGradClass = '';
                      if (isSelected) {
                        if (themItem.id === 'CLASSIC_WOOD') bgGradClass = 'bg-gradient-to-br from-amber-700 to-amber-950 border-amber-500 text-amber-100 shadow-[0_4px_15px_rgba(180,83,9,0.45)]';
                        else if (themItem.id === 'ROYAL_GOLD') bgGradClass = 'bg-gradient-to-br from-amber-500 to-yellow-600 border-yellow-400 text-black shadow-[0_4px_15px_rgba(245,158,11,0.45)]';
                        else if (themItem.id === 'DARK_MARBLE') bgGradClass = 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border-slate-500 text-white shadow-[0_4px_15px_rgba(71,85,105,0.45)]';
                      } else {
                        bgGradClass = 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10';
                      }
                      return (
                        <button
                          key={themItem.id}
                          onClick={() => setTheme(themItem.id)}
                          className={`p-3 rounded-2xl border text-xs flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${bgGradClass} ${isSelected ? 'scale-103 font-black' : 'font-bold'}`}
                        >
                          <span className="text-[11px] truncate text-center leading-tight">
                            {lang === 'KU' ? themItem.nameKu : lang === 'AR' ? themItem.nameAr : themItem.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PIECE DESIGNS - 3 Contrast matchups setup directly inside home dashboard */}
                <div>
                  <label className="text-[10px] font-extrabold text-[#fbbf24] uppercase tracking-widest mb-3 block text-center">
                    Piece Styling • جۆری بەردەکان
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                    {PIECE_MATCHUPS_3.map((pStyle) => {
                      const isSelected = pieceStyle === pStyle.id;
                      let activeClass = '';
                      if (isSelected) {
                        if (pStyle.id === 'WHITE_BLACK') activeClass = 'bg-gradient-to-br from-amber-500/20 to-black text-amber-300 border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.25)]';
                        else if (pStyle.id === 'GOLD_BLACK') activeClass = 'bg-gradient-to-br from-amber-500/20 to-[#0e0c06] text-yellow-300 border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.25)]';
                        else activeClass = 'bg-gradient-to-br from-amber-500/20 to-[#100c06] text-amber-300 border-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.25)]';
                      } else {
                        activeClass = 'bg-white/5 border-transparent hover:bg-white/10 text-neutral-400';
                      }
                      return (
                        <button
                          key={pStyle.id}
                          onClick={() => setPieceStyle(pStyle.id)}
                          className={`p-2.5 rounded-xl border text-xs transition-all duration-300 flex flex-col justify-center items-center text-center cursor-pointer ${activeClass} ${isSelected ? 'scale-102 font-black border-amber-500' : 'font-semibold'}`}
                        >
                          <span className="leading-tight text-[10px]">
                            {lang === 'KU' ? pStyle.nameKu : lang === 'AR' ? pStyle.nameAr : pStyle.nameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Launch Action button - formatted on Golden Ratio height & padding */}
                <div className="pt-2">
                  {cooldownRemaining > 0 ? (
                    <div className="space-y-3">
                      <button
                        disabled
                        className="relative w-full h-14 overflow-hidden rounded-2xl bg-neutral-900 border border-red-500/30 text-red-400 font-extrabold text-sm flex items-center justify-center gap-2 font-sans opacity-85 select-none"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                        <span className="tracking-wide text-[12px] sm:text-xs">
                          {getCooldownString()}
                        </span>
                      </button>
                      <p className="text-[11px] sm:text-xs text-center text-neutral-400 font-bold leading-relaxed max-w-xs mx-auto">
                        {lang === 'KU' 
                          ? 'کۆینەکانت بووە بە ٠! نابێت یاری بکەیت تا ١ سەعات تێنەپەڕێت؛ دواتر خۆکارانە دەبێتەوە بە ٤٠ کۆین بۆ ئەوەی بتوانیت یاری بکەیتەوە.' 
                          : lang === 'AR' 
                          ? 'لقد نفدت الكوينات! لا يمكنك اللعب حتى مرور ساعة واحدة؛ وبعدها ستحصل تلقائياً على 40 كوين لمواصلة اللعب.' 
                          : 'Your coins are 0! You cannot play until 1 hour has passed; then they will automatically restore to 40 coins.'}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartAction}
                      className="relative w-full h-14 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-[#d97706] text-black font-black text-base shadow-[0_0_35px_rgba(245,158,11,0.45)] border border-yellow-250/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_45px_rgba(245,158,11,0.7)] hover:brightness-110 active:scale-[0.97] cursor-pointer flex items-center justify-center gap-3 font-sans group animate-pulse-slow"
                    >
                      <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                      <Play className="w-6 h-6 fill-current text-[#050508]" />
                      <span className="tracking-wide text-[15px] sm:text-base">{t.START} • دەستپێکردنی دامە</span>
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setScreen('RULES')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-[21px] rounded-xl border border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/30 text-amber-400 text-xs font-black transition-all duration-300 cursor-pointer shadow-md"
                >
                  <span className="text-sm">📜</span>
                  <span>{t.RULES_TITLE} • ڕێسا و یاساکانی یاریەکە</span>
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'PLAYING' && (
             <motion.div
               key="playing"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-3xl py-2 md:py-4 flex flex-col items-center"
             >
                {/* OPPONENT AREA (ABOVE THE BOARD) */}
                <div className="w-full max-w-xl bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between relative shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Bot Avatar or Friend Avatar */}
                    {mode === 'AI' ? (
                      <RobotAvatar />
                    ) : (
                      <KurdishManAvatar />
                    )}
                    
                    <div>
                      <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mb-1">
                        {lang === 'KU' ? 'یاریزانی دژبەر' : lang === 'AR' ? 'اللاعب المنافس' : 'Opponent'}
                      </div>
                      {mode === 'FRIEND' ? (
                        <input
                          type="text"
                          value={player2Name}
                          onChange={(e) => setPlayer2Name(e.target.value)}
                          placeholder={t.FRIEND}
                          className="w-24 sm:w-32 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-black px-2 py-0.5 rounded border border-white/10 focus:border-cyan-400 outline-none transition-all text-center"
                        />
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                          <div className="text-xs sm:text-sm font-black text-white">
                            {player2Name.trim() || t.AI_NAME}
                          </div>
                          
                          {/* Beautiful Interactive Choice Select for Difficulty inside the active game */}
                          <div className="flex items-center">
                            <select
                              value={difficulty}
                              onChange={(e) => setDifficulty(e.target.value as any)}
                              className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded border outline-none cursor-pointer transition-all ${
                                difficulty === 'EASY' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' :
                                difficulty === 'MEDIUM' ? 'bg-amber-950/40 border-amber-500/30 text-amber-400' :
                                difficulty === 'HARD' ? 'bg-orange-950/40 border-orange-500/30 text-orange-400' :
                                'bg-red-950/40 border-red-500/30 text-rose-300'
                              }`}
                            >
                              <option value="EASY" className="bg-slate-950 text-emerald-400 font-bold">{t.EASY}</option>
                              <option value="MEDIUM" className="bg-slate-950 text-amber-500 font-bold">{t.MEDIUM}</option>
                              <option value="HARD" className="bg-slate-950 text-orange-400 font-bold">{t.HARD}</option>
                              <option value="EXPERT" className="bg-slate-950 text-red-400 font-bold">{t.EXPERT}</option>
                            </select>
                          </div>
                        </div>
                      )}
                      
                      {/* Count of pieces next to them (Like backend layout design) */}
                      <div className="flex items-center gap-2.5 mt-1.5 text-xs font-bold">
                        <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full select-none text-[10px]">
                          ● {lang === 'KU' ? 'چالاک' : lang === 'AR' ? 'نشط' : 'Active'}: {whiteCount}
                        </span>
                        <span className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full select-none text-[10px]">
                          {lang === 'KU' ? 'خوراو' : lang === 'AR' ? 'المأكول' : 'Captured'}: {16 - cyanCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Turn indicator glow */}
                  <div className="flex flex-col items-center gap-1">
                    <span className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${gameState.turn === 'WHITE' ? 'bg-amber-400 shadow-[0_0_12px_#fbbf24] animate-ping' : 'bg-neutral-800'}`} />
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                      {gameState.turn === 'WHITE' ? 'TURN' : 'WAIT'}
                    </span>
                  </div>

                  {/* Speech Bubble comments floating */}
                  {bubbleText && bubbleSender === 'WHITE' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      className="absolute bottom-full mb-3 left-4 sm:left-12 bg-gradient-to-br from-indigo-950/95 via-purple-950/95 to-slate-900 border border-indigo-400/30 text-indigo-100 text-[11px] font-bold py-2.5 px-4 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.6)] max-w-[260px] z-30"
                    >
                      {bubbleText}
                      <div className="absolute top-full left-6 border-[6px] border-transparent border-t-indigo-900/95" />
                    </motion.div>
                  )}
                </div>

                {/* Mandatory capture reminder banner */}
                {gameState.mustJumpPos && !gameState.winner && (
                   <div className="w-full max-w-xl text-[10px] sm:text-xs text-amber-400 bg-amber-400/10 px-4 py-2 rounded-xl font-bold flex items-center justify-center border border-amber-400/20 mb-3 animate-pulse">
                     <AlertCircle className="w-4 h-4 rtl:ml-2 ltr:mr-2 shrink-0 text-amber-500" /> 
                     <span>{t.MANDATORY}</span>
                   </div>
                )}

                {/* BOARD CONTAINER WITH SHAKE ANIMATION */}
                <motion.div 
                  animate={shakeBoard ? {
                    x: [0, -5, 5, -5, 5, -3, 3, 0],
                    y: [0, 0, 0, 0, 0, 0, 0, 0]
                  } : {}}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="w-full flex justify-center py-2 relative z-10"
                >
                  <Board
                    gameState={gameState}
                    dispatch={dispatch}
                    theme={theme}
                    lang={lang}
                    disabled={gameState.winner !== null || (mode === 'AI' && gameState.turn === 'WHITE')}
                    onGoHome={() => {
                      deductActivePenalty();
                      setScreen('HOME');
                    }}
                    onRestart={handleFullReset}
                    p1Name={player1Name.trim() || t.YOU}
                    p2Name={player2Name.trim() || (mode === 'AI' ? t.AI_NAME : t.FRIEND)}
                    coachHintSource={gameState.hintPos}
                    pieceStyle={pieceStyle}
                  />
                </motion.div>

                {/* HUMAN AREA (BELOW THE BOARD) */}
                <div className="w-full max-w-xl bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-4 mt-4 flex items-center justify-between relative shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Kurdish Man Avatar representing You */}
                    <KurdishManAvatar />
                    
                    <div>
                      <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mb-1">
                        {lang === 'KU' ? 'ناوی تۆ • Your Name' : lang === 'AR' ? 'اسمك الكريم' : 'Your Name'}
                      </div>
                      <input
                        type="text"
                        value={player1Name}
                        onChange={(e) => setPlayer1Name(e.target.value)}
                        placeholder={t.YOU}
                        className="w-24 sm:w-32 bg-cyan-950/20 hover:bg-cyan-950/30 text-cyan-400 text-xs sm:text-sm font-black px-2 py-0.5 rounded border border-cyan-500/20 focus:border-cyan-400 outline-none transition-all text-center"
                      />
                      
                      {/* Count of pieces next to them (Like backend layout design) */}
                      <div className="flex items-center gap-2.5 mt-1.5 text-xs font-bold">
                        <span className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full select-none text-[10px]">
                          ● {lang === 'KU' ? 'چالاک' : lang === 'AR' ? 'نشط' : 'Active'}: {cyanCount}
                        </span>
                        <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full select-none text-[10px]">
                          {lang === 'KU' ? 'خوراو' : lang === 'AR' ? 'المأكول' : 'Captured'}: {16 - whiteCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Turn indicator glow */}
                  <div className="flex flex-col items-center gap-1">
                    <span className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${gameState.turn === 'CYAN' ? 'bg-cyan-400 shadow-[0_0_12px_#06b6d4] animate-ping' : 'bg-neutral-800'}`} />
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                      {gameState.turn === 'CYAN' ? 'TURN' : 'WAIT'}
                    </span>
                  </div>
                </div>
             </motion.div>
          )}

          {screen === 'RULES' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-2xl bg-neutral-900 border border-white/5 p-6 md:p-8 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl translate-y-10 -translate-x-10" />

              <button 
                onClick={() => setScreen('HOME')}
                className="flex items-center space-x-2 space-x-reverse text-neutral-300 hover:text-white mb-6 py-2 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer text-xs font-black shadow-inner"
              >
                <ChevronLeft className="w-4 h-4 rtl:scale-x-[-1] text-cyan-400" />
                <span>{lang === 'KU' ? 'گەڕانەوە' : lang === 'AR' ? 'عودة' : 'Back'}</span>
              </button>
              
              <div className="relative mb-6">
                <h2 className="text-2.5xl font-black text-white bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent pb-1.5 border-b border-white/5 tracking-wide">
                  {t.RULES_TITLE}
                </h2>
                <div className="h-[2px] w-20 bg-gradient-to-r from-cyan-400 to-indigo-500 absolute bottom-0 left-0" />
              </div>
              
              <div className="mb-10">
                <MarkdownParser markdown={t.RULES_CONTENT} />
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 relative">
                <div className="relative mb-6">
                  <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-450 to-orange-500 pb-1.5 border-b border-white/5 tracking-wide">
                    {(t as any).PLAYSTORE_RULES_TITLE}
                  </h2>
                  <div className="h-[2px] w-20 bg-gradient-to-r from-amber-400 to-orange-500 absolute bottom-0 left-0" />
                </div>
                
                <MarkdownParser markdown={(t as any).PLAYSTORE_RULES_CONTENT} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 2-Step Back Exit Warning Toast */}
      <AnimatePresence>
        {exitToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full bg-gradient-to-r from-cyan-950 via-slate-900 to-amber-950 border border-cyan-500/30 shadow-[0_4px_30px_rgba(6,182,212,0.4)] text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-amber-305 to-white text-center flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>
              {lang === 'KU'
                ? 'بۆ چوونەدەرەوە لە یارییەکە، جارێکی تر بگەڕێوە دواوە'
                : lang === 'AR'
                ? 'للخروج والعودة، اضغط زر الرجوع مرة أخرى'
                : 'Press back again to exit the game'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Setup Popup Modal */}
      <AnimatePresence>
        {showAiSetupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[120] p-4 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="bg-gradient-to-br from-slate-900 via-neutral-950 to-slate-900 border-2 border-amber-500/50 p-6 sm:p-8 rounded-3xl text-center shadow-[0_0_60px_rgba(245,158,11,0.5)] max-w-sm w-full relative overflow-hidden"
            >
              {/* Decorative glows */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-x-10 -translate-y-10" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl translate-x-10 translate-y-10" />

              {/* Icon Badge */}
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-amber-400 via-yellow-450 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-yellow-200 mb-4">
                <Bot className="w-8 h-8 text-black" />
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white leading-snug mb-1">
                {lang === 'KU' ? 'ڕێکخستنی یاری ژیری دەستکرد' : lang === 'AR' ? 'تجهيز مباراة الذكاء الاصطناعي' : 'AI Match Setup'}
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 font-bold mb-6">
                {lang === 'KU' ? 'ناوی خۆت و ئاستی زیرەکی دیاریبکە' : lang === 'AR' ? 'يرجى إدخال اسمك واختيار مستوى الصعوبة' : 'Enter details to launch your AI challenge'}
              </p>

              {/* Form Body */}
              <div className="space-y-5 text-left font-sans">
                {/* 1. Name Input */}
                <div>
                  <label className="text-[10px] font-extrabold text-[#fbbf24] uppercase tracking-widest mb-2 block text-center">
                    {lang === 'KU' ? 'ناوی تۆ • Your Name' : lang === 'AR' ? 'اسم اللاعب' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder={t.YOU}
                    className="w-full bg-cyan-950/20 hover:bg-cyan-950/30 text-white text-sm font-black px-4 py-3 rounded-xl border border-amber-500/20 focus:border-amber-400 outline-none transition-all text-center placeholder-neutral-500"
                  />
                </div>

                {/* 2. Difficulty Selection */}
                <div>
                  <label className="text-[10px] font-extrabold text-[#fbbf24] uppercase tracking-widest mb-2 block text-center">
                    {lang === 'KU' ? 'دیاریکردنی ئاستی زیرەکی • AI Level' : lang === 'AR' ? 'درجة الصعوبة' : 'Difficulty Level'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'EASY', nameKu: 'ئاسان (Easy)', nameAr: 'سهل', nameEn: 'Easy', border: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/30', active: 'border-emerald-500 bg-emerald-500 text-black shadow-[0_2px_10px_rgba(16,185,129,0.3)]' },
                      { id: 'MEDIUM', nameKu: 'مامناوەند (Medium)', nameAr: 'متوسط', nameEn: 'Medium', border: 'border-amber-500/30 text-amber-400 bg-amber-950/20 hover:bg-amber-950/30', active: 'border-amber-500 bg-amber-500 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3)]' },
                      { id: 'HARD', nameKu: 'سەخت (Hard)', nameAr: 'صعب', nameEn: 'Hard', border: 'border-orange-500/30 text-orange-400 bg-orange-950/20 hover:bg-orange-950/30', active: 'border-orange-500 bg-orange-500 text-black shadow-[0_2px_10px_rgba(249,115,22,0.3)]' },
                      { id: 'EXPERT', nameKu: 'زۆرزان (Expert)', nameAr: 'خبير', nameEn: 'Expert', border: 'border-rose-500/30 text-rose-400 bg-rose-950/20 hover:bg-rose-950/30', active: 'border-rose-500 bg-rose-500 text-black shadow-[0_2px_10px_rgba(239,68,68,0.3)]' }
                    ].map((lvl) => {
                      const isLvlSel = difficulty === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setDifficulty(lvl.id as Difficulty)}
                          className={`p-2 rounded-xl border text-[11px] font-black transition-all duration-200 cursor-pointer flex flex-col items-center justify-center leading-tight ${isLvlSel ? lvl.active : lvl.border}`}
                        >
                          <span>{lang === 'KU' ? lvl.nameKu : lang === 'AR' ? lvl.nameAr : lvl.nameEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAiSetupModal(false)}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/10"
                  >
                    {lang === 'KU' ? 'پاشگەزبوونەوە' : lang === 'AR' ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="button"
                    onClick={startGame}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:scale-[1.02] active:scale-95 text-[#050508] font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 border border-yellow-300/30 flex items-center justify-center gap-2"
                  >
                    <span>⚔️</span>
                    <span>{lang === 'KU' ? 'دەستپێکردن' : lang === 'AR' ? 'بدء اللعب' : 'Launch'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cache Clear Success Toast */}
      <AnimatePresence>
        {cacheClearToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-950 via-amber-900 to-orange-900 border border-orange-500/35 shadow-[0_10px_35px_rgba(249,115,22,0.45)] text-sm font-black text-white text-center flex items-center gap-2"
          >
            <span>🧹✨</span>
            <span>
              {lang === 'KU'
                ? 'کاش بەسەرکەوتوویی پاککرایەوە! یاریەکە نوێ دەبێتەوە...'
                : lang === 'AR'
                ? 'تم مسح ذاكرة التخزين المؤقت بنجاح! جاري التحديث...'
                : 'Cache cleared successfully! Refreshing...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <InstallPrompt />
    </div>
  );
}
