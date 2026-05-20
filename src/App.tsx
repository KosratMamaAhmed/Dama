import React, { useReducer, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initialGameState, gameReducer } from './store/gameReducer';
import Board from './components/Board';
import { Home as HomeIcon, ChevronRight, User, Cpu, Users, Play, Palette, Globe, BookOpen, AlertCircle, ShoppingBag, ShieldAlert, MonitorCheck, RefreshCw, Clock, Volume2, VolumeX } from 'lucide-react';
import { useDropSound } from './useSound';
import { GameMode, Difficulty, BoardTheme } from './types';
import { getAIMove } from './ai';
import { TRANSLATIONS, Language } from './translations';
import { POLICY_TRANSLATIONS } from './policyTranslations';

const STATS_DICT = {
  KU: {
    TITLE: 'ئامار و ئەنجامەکان 🏆',
    TOTAL: 'کۆی یارییەکان:',
    P1: 'یاریزانی ١ (کڵاو سپی):',
    P2: 'یاریزانی ٢ (جامانە):',
    AI: 'ڕکابەری زیرەک (AI):',
    WIN_RATE: 'بردنەوە:',
    RESET: 'پاكکردنەوەی پۆینت',
  },
  EN: {
    TITLE: 'Game Statistics 🏆',
    TOTAL: 'Total Matches:',
    P1: 'Player 1 (Blue):',
    P2: 'Player 2 (White):',
    AI: 'Gemini AI Robot:',
    WIN_RATE: 'Wins:',
    RESET: 'Reset Stats',
  },
  AR: {
    TITLE: 'إحصائيات اللعب 🏆',
    TOTAL: 'إجمالي المباريات:',
    P1: 'اللاعب ١ (الأزرق):',
    P2: 'اللاعب ٢ (الأبيض):',
    AI: 'الذكاء الاصطناعي:',
    WIN_RATE: 'الفوز:',
    RESET: 'تصفير النقاط',
  }
};

const QUICK_PHRASES = {
  KU: [
    "دەستت خۆش بێت! 👏",
    "جووڵەیەکی زۆر نایاب بوو! ⚡",
    "بەختێکی باش تر بۆ جاری داهاتوو! 🍀",
    "هەر لێرەوە یارییەکە تەواوە! 💀",
    "یارییەکی زۆر بەهێز بوو! 💪"
  ],
  EN: [
    "Well played! 👏",
    "What a brilliant move! ⚡",
    "Better luck next time! 🍀",
    "GG WP! 💀",
    "This is an intense match! 💪"
  ],
  AR: [
    "لعب جميل! 👏",
    "حركة ذكية ورهيبة! ⚡",
    "حظاً موفقاً المرة القادمة! 🍀",
    "مباراة منتهية بالفعل! 💀",
    "يا لها من مباراة حماسية! 💪"
  ]
};

export default function App() {
  const [lang, setLang] = useState<Language>('KU');
  const [screen, setScreen] = useState<'HOME' | 'SETUP_AI' | 'SETUP_FRIEND' | 'PLAYING' | 'RULES_PAGE' | 'POLICY_PAGE' | 'LOBBY' | 'REPLAY'>('HOME');
  const [mode, setMode] = useState<GameMode>('AI');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [theme, setTheme] = useState<BoardTheme>('CLASSIC');
  const [isLandscape, setIsLandscape] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  // AI Coach Hint state
  const [coachHintSource, setCoachHintSource] = useState<{ r: number; c: number } | null>(null);
  const [coachHintDest, setCoachHintDest] = useState<{ r: number; c: number } | null>(null);
  const [coachHintMessage, setCoachHintMessage] = useState<string>('');

  // Match Replay state
  const [matchStateHistory, setMatchStateHistory] = useState<any[]>([]);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);

  // Lobby Code & Simulated peer connections
  const [roomCode, setRoomCode] = useState<string>('');
  const [isLobbySearching, setIsLobbySearching] = useState<boolean>(false);
  const [lobbyError, setLobbyError] = useState<string>('');
  const [lobbySuccess, setLobbySuccess] = useState<boolean>(false);
  const [typedRoomCode, setTypedRoomCode] = useState<string>('');

  // In-Game Chat / Floating Emojis
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [chatMessage, setChatMessage] = useState<{ sender: 'P1' | 'P2'; text: string; id: string } | null>(null);

  // Built-in Live Game Timer
  const [seconds, setSeconds] = useState(0);

  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('dama_stats_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { p1Wins: 0, p2Wins: 0, aiWins: 0, totalGames: 0 };
  });

  const [hasRestored, setHasRestored] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState(false);

  // Restore saved session on mount (offline continuity support)
  useEffect(() => {
    const savedActive = localStorage.getItem('dama_active_game_v1');
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (parsed) {
          if (parsed.lang) setLang(parsed.lang);
          if (parsed.screen) setScreen(parsed.screen);
          if (parsed.mode) setMode(parsed.mode);
          if (parsed.difficulty) setDifficulty(parsed.difficulty);
          if (parsed.theme) setTheme(parsed.theme);
          if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
          if (parsed.player1Name) setPlayer1Name(parsed.player1Name);
          if (parsed.player2Name) setPlayer2Name(parsed.player2Name);
          if (parsed.seconds !== undefined) setSeconds(parsed.seconds);
          if (parsed.gameState) {
            dispatch({ type: 'HYDRATE_STATE', payload: parsed.gameState });
          }
        }
      } catch (e) {
        console.error("Failed to restore active game:", e);
      }
    }
    setHasRestored(true);
  }, []);

  // Save game automatically on change
  useEffect(() => {
    if (!hasRestored) return;
    const dataToSave = {
      screen,
      mode,
      difficulty,
      theme,
      soundEnabled,
      lang,
      player1Name,
      player2Name,
      seconds,
      gameState,
    };
    localStorage.setItem('dama_active_game_v1', JSON.stringify(dataToSave));
  }, [screen, mode, difficulty, theme, soundEnabled, lang, player1Name, player2Name, seconds, gameState, hasRestored]);

  // Statistics Win/Loss logic
  useEffect(() => {
    if (gameState.winner) {
      if (!statsUpdated) {
        setStats((prev: any) => {
          const isAI = mode === 'AI';
          const updated = { ...prev };
          updated.totalGames += 1;
          if (gameState.winner === 'CYAN') {
            updated.p1Wins += 1;
          } else if (gameState.winner === 'WHITE') {
            if (isAI) {
              updated.aiWins += 1;
            } else {
              updated.p2Wins += 1;
            }
          }
          localStorage.setItem('dama_stats_v1', JSON.stringify(updated));
          return updated;
        });
        setStatsUpdated(true);
      }
    } else {
      setStatsUpdated(false);
    }
  }, [gameState.winner, mode, statsUpdated]);

  const playSound = useDropSound();
  
  const prevBoard = useRef(gameState.board);
  const prevCaptures = useRef(0);
  const prevWinner = useRef(gameState.winner);

  // Calculate captures
  let whiteCount = 0;
  let cyanCount = 0;
  gameState.board.forEach(row => row.forEach(p => {
    if (p?.player === 'WHITE') whiteCount++;
    if (p?.player === 'CYAN') cyanCount++;
  }));
  const cyanCaptures = 16 - whiteCount;
  const whiteCaptures = 16 - cyanCount;

  // Sound triggering effect
  useEffect(() => {
    if (gameState.winner && !prevWinner.current) {
      if (soundEnabled) playSound('win');
    } else if (gameState.board !== prevBoard.current) {
      if (soundEnabled) {
        const totalCaptures = cyanCaptures + whiteCaptures;
        if (totalCaptures > prevCaptures.current) {
          playSound('capture');
        } else {
          playSound('move');
        }
      }
    }
    prevBoard.current = gameState.board;
    prevCaptures.current = cyanCaptures + whiteCaptures;
    prevWinner.current = gameState.winner;
  }, [gameState.board, gameState.winner, cyanCaptures, whiteCaptures, playSound, soundEnabled]);

  // Timer interval for playing screen
  useEffect(() => {
    let timerId: any = null;
    if (screen === 'PLAYING' && !gameState.winner) {
      timerId = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (screen !== 'PLAYING') {
      setSeconds(0);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [screen, gameState.winner]);

  // AI execution routine
  useEffect(() => {
    if (screen === 'PLAYING' && mode === 'AI' && gameState.turn === 'WHITE' && !gameState.winner) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(gameState.board, difficulty, 'WHITE', gameState.mustJumpPos);
        if (aiMove) {
          dispatch({ type: 'SELECT_OR_MOVE', payload: { r: aiMove.r, c: aiMove.c } });
          setTimeout(() => {
            dispatch({ type: 'SELECT_OR_MOVE', payload: { r: aiMove.dest.r, c: aiMove.dest.c } });
          }, 350);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [screen, mode, difficulty, gameState.turn, gameState.winner, gameState.board]);

  // Clear Coach Hint when the board state shifts
  useEffect(() => {
    setCoachHintSource(null);
    setCoachHintDest(null);
    setCoachHintMessage('');
  }, [gameState.board, gameState.turn]);

  // Keep track of board positions for the current match to feed the Replay system
  useEffect(() => {
    if (screen === 'PLAYING') {
      setMatchStateHistory((prev) => {
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && JSON.stringify(lastEntry.board) === JSON.stringify(gameState.board)) {
          return prev;
        }
        return [...prev, { board: gameState.board, turn: gameState.turn, winner: gameState.winner }];
      });
    }
  }, [gameState.board, screen, gameState.winner]);

  // Safe manual clean refresh of state to avoid cache leaks
  const handleFullReset = () => {
    dispatch({ type: 'RESET_GAME' });
    setSeconds(0);
    setMatchStateHistory([]);
  };

  const startGame = () => {
    handleFullReset();
    setScreen('PLAYING');
  };

  // Trigger floating emoji animation
  const triggerFloatingEmoji = (emoji: string) => {
    const id = Math.random().toString();
    const x = Math.floor(Math.random() * 240) - 120; // safe horizontal offset
    setFloatingEmojis((prev) => [...prev, { id, emoji, x, y: 0 }]);
    if (soundEnabled) {
      try { playSound('move'); } catch(e){}
    }
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2800);
  };

  // Speaks a quick chat phrase
  const sendQuickChatMessage = (sender: 'P1' | 'P2', text: string) => {
    const id = Math.random().toString();
    setChatMessage({ sender, text, id });
    if (soundEnabled) {
      try { playSound('move'); } catch(e){}
    }
    setTimeout(() => {
      setChatMessage((prev) => prev?.id === id ? null : prev);
    }, 4500);
  };

  // AI Hint Coach Evaluation
  const handleGetCoachHint = () => {
    // We evaluate using the AI engine
    const optimal = getAIMove(gameState.board, 'EXPERT', gameState.turn, gameState.mustJumpPos);
    if (optimal) {
      setCoachHintSource({ r: optimal.r, c: optimal.c });
      setCoachHintDest(optimal.dest);
      
      const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const textSrc = `${colLabels[optimal.c]}${8 - optimal.r}`;
      const textDest = `${colLabels[optimal.dest.c]}${8 - optimal.dest.r}`;
      
      let msg = '';
      if (lang === 'KU') {
        msg = `💡 ڕێبەری زیرەک پێشنیار دەکات: لێدان لە خانەی ${textSrc} بەرەو خانەی ئامانجی ${textDest}!`;
      } else if (lang === 'AR') {
        msg = `💡 المدرب ينصحك باللعب: من خانة ${textSrc} إلى خانة الهدف ${textDest}!`;
      } else {
        msg = `💡 Coach recommends: Move piece from ${textSrc} to destination ${textDest}!`;
      }
      setCoachHintMessage(msg);
      if (soundEnabled) {
        try { playSound('move'); } catch(e){}
      }
    }
  };

  // Create real-time simulation Room Code
  const handleCreateRoom = () => {
    setIsLobbySearching(true);
    setLobbyError('');
    setLobbySuccess(false);
    
    // Generate randomized code
    const mockCode = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(mockCode);
    
    // Set simulated peer join after 6 seconds
    setTimeout(() => {
      setIsLobbySearching(false);
      setLobbySuccess(true);
      if (soundEnabled) {
        try { playSound('win'); } catch(e){}
      }
    }, 5000);
  };

  // Join Room with a code
  const handleJoinRoom = () => {
    if (!typedRoomCode || typedRoomCode.length < 4) {
      setLobbyError(lang === 'KU' ? 'کۆدەکە نادروستە!' : lang === 'AR' ? 'الرمز غير صالح!' : 'Invalid code!');
      return;
    }
    setIsLobbySearching(true);
    setLobbyError('');
    setLobbySuccess(false);
    
    setTimeout(() => {
      setIsLobbySearching(false);
      setRoomCode(typedRoomCode);
      setLobbySuccess(true);
      if (soundEnabled) {
        try { playSound('win'); } catch(e){}
      }
    }, 2500);
  };

  const handleStartLobbyMatch = () => {
    setPlayer1Name(lang === 'KU' ? 'کۆسرەت (تۆ)' : 'Kosret (You)');
    setPlayer2Name(lang === 'KU' ? 'هاوڕێی میوان 👤' : 'Guest Friend 👤');
    setMode('FRIEND');
    setScreen('PLAYING');
    handleFullReset();
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Safari Home Screen/PWA detection helper
  const isIos = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const p1 = player1Name.trim() || (lang === 'KU' ? 'کۆسرەت' : lang === 'AR' ? 'كوسرت' : 'Kosret');
  const p2 = mode === 'AI' 
    ? TRANSLATIONS[lang].AI_NAME 
    : (player2Name.trim() || (lang === 'KU' ? 'هەڵۆ' : lang === 'AR' ? 'عقاب' : 'Halo'));

  const dict = TRANSLATIONS[lang];
  const policyDict = POLICY_TRANSLATIONS[lang];
  const isRtl = lang === 'KU' || lang === 'AR';

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'} 
      className="min-h-[100dvh] w-full bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-indigo-950 font-sans text-white selection:bg-cyan-500/30 overflow-x-hidden relative flex flex-col items-center pb-[max(3rem,env(safe-area-inset-bottom))]"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Global Checkers Pattern Amazing Background Layer */}
      <div 
        className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${
          screen === 'PLAYING' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: 'conic-gradient(rgba(255,255,255,0.05) 90deg, transparent 90deg 180deg, rgba(255,255,255,0.05) 180deg 270deg, transparent 270deg)',
          backgroundSize: '80px 80px',
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Decorative environment background lights */}
      <div className="fixed top-[-5%] left-[-5%] w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-5%] right-[-5%] w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Floating Animated Checkers Pieces on Home Screen */}
      <AnimatePresence>
        {screen === 'HOME' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
          >
            {/* Top Right Cyan Piece */}
            <motion.div 
              className="absolute top-[15%] right-[10%] w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-cyan-300/50 shadow-[inset_0_-4px_15px_rgba(0,0,0,0.3),_0_10px_30px_rgba(34,211,238,0.3)] opacity-60"
              animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <div className="absolute inset-2 sm:inset-3 rounded-full border-2 border-white/20" />
              <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] bg-white/30 rounded-full blur-[2px]" />
            </motion.div>

            {/* Bottom Left White Piece */}
            <motion.div 
              className="absolute bottom-[20%] left-[5%] w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-100 to-slate-400 border-2 border-white/80 shadow-[inset_0_-4px_15px_rgba(0,0,0,0.3),_0_10px_30px_rgba(255,255,255,0.3)] opacity-40"
              animate={{ y: [0, 40, 0], rotate: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
            >
              <div className="absolute inset-2 sm:inset-4 rounded-full border-2 border-slate-400/20" />
              <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] bg-white/60 rounded-full blur-[3px]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Compact Sticky Toolbar */}
      <div className="sticky top-[max(0.75rem,env(safe-area-inset-top))] z-50 flex justify-between items-center bg-black/50 border border-white/20 rounded-full p-1.5 backdrop-blur-2xl shadow-xl mt-[max(0.75rem,env(safe-area-inset-top))] w-[calc(100%-2rem)] max-w-2xl shrink-0 transition-all duration-300">
        {screen === 'PLAYING' ? (
          <div className="flex items-center space-x-1 sm:space-x-1.5 space-x-reverse mx-1">
            <button
              onClick={() => setScreen('HOME')}
              className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/90 active:scale-95"
            >
              <HomeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/90 active:scale-95"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />}
            </button>
            <button
              onClick={handleFullReset}
              className="p-1.5 sm:p-2 bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-300 rounded-full transition-colors active:scale-95"
              title={dict.RESTART}
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="flex items-center space-x-1 space-x-reverse bg-indigo-500/30 px-2 py-1 rounded-full font-mono text-[10px] sm:text-xs text-cyan-300 ml-2">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>{formatTime(seconds)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center mx-3 text-[10px] font-black text-cyan-500/50 tracking-widest uppercase">
            DAMA
          </div>
        )}

        <div className="flex items-center space-x-1 space-x-reverse mr-1">
          {(['KU', 'EN', 'AR'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-1 rounded-full text-[10px] font-black transition-all ${
                lang === l ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {l === 'KU' ? 'کوردی' : l === 'AR' ? 'عربي' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {screen === 'HOME' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 flex flex-col items-center w-full max-w-md pt-8 px-5 space-y-8"
          >
            <div className="text-center space-y-2 mt-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-cyan-400 font-bold bg-cyan-900/30 px-4 py-1.5 rounded-full border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] backdrop-blur-sm">
                DAMA CURDISH • ڕەسەن و جیهانی
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-xl py-2 font-sans tracking-tight">
                {dict.TITLE}
              </h1>
            </div>

            {/* Direct Play Action Modules - Beautiful Upgrade (More Compact and Sleek) */}
            <div className="w-full space-y-3 shrink-0">
              <button
                onClick={() => {
                  setMode('AI');
                  setScreen('SETUP_AI');
                }}
                className="relative group w-full flex items-center justify-between p-3.5 bg-black/40 hover:bg-black/60 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center space-x-3.5 space-x-reverse">
                  <div className="p-2.5 bg-cyan-950/80 border border-cyan-400/40 rounded-xl text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-400 group-hover:text-slate-900 transition-all duration-300 shadow-inner">
                    <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-black text-white drop-shadow-md">{dict.PLAY_AI}</p>
                    <p className="text-[11px] text-white/50 tracking-wide mt-0.5">{dict.EASY} • {dict.MEDIUM} • {dict.HARD}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-cyan-400 transition-colors relative" />
              </button>

              <button
                onClick={() => {
                  setMode('FRIEND');
                  setScreen('SETUP_FRIEND');
                }}
                className="relative group w-full flex items-center justify-between p-3.5 bg-black/40 hover:bg-black/60 border border-indigo-500/30 hover:border-indigo-400 rounded-2xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center space-x-3.5 space-x-reverse">
                  <div className="p-2.5 bg-indigo-950/80 border border-indigo-400/40 rounded-xl text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-400 group-hover:text-slate-900 transition-all duration-300 shadow-inner">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-black text-white drop-shadow-md">{dict.PLAY_FRIEND}</p>
                    <p className="text-[11px] text-white/50 tracking-wide mt-0.5">Local Pass & Play</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-indigo-400 transition-colors relative" />
              </button>

              {/* ONLINE LOBBY SYSTEM BUTTON */}
              <button
                onClick={() => {
                  setScreen('LOBBY');
                  handleCreateRoom(); // Prepare dummy host room key instantly
                }}
                className="relative group w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-950/20 to-yellow-950/10 hover:from-amber-950/40 hover:to-yellow-905/20 border border-yellow-600/30 hover:border-yellow-400 rounded-2xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center space-x-3.5 space-x-reverse">
                  <div className="p-2.5 bg-amber-950 border border-amber-500/40 rounded-xl text-amber-400 group-hover:scale-105 group-hover:bg-amber-550 group-hover:text-amber-950 transition-all duration-300 shadow-inner">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-lg sm:text-xl font-black text-amber-200 drop-shadow-md">{(dict as any).LOBBY_ROOM}</p>
                    <p className="text-[11px] text-amber-200/50 tracking-wide mt-0.5">Online Lobby Code System</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400/50 group-hover:text-amber-400 transition-colors relative" />
              </button>
            </div>

            {/* Theme & Skins Dashboard Frame */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md shrink-0">
              <div className="flex items-center space-x-2 space-x-reverse mb-1 text-cyan-400">
                <Palette className="w-5 h-5" />
                <h3 className="font-black text-sm">{dict.BOARD_THEME}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {([
                  { key: 'CLASSIC', label: dict.THEME_CLASSIC, color: 'bg-slate-700' },
                  { key: 'EMERALD', label: dict.THEME_EMERALD, color: 'bg-emerald-700' },
                  { key: 'GOLD', label: dict.THEME_GOLD, color: 'bg-amber-600' },
                  { key: 'ROYAL', label: dict.THEME_ROYAL, color: 'bg-violet-700' },
                  { key: 'KURDISH_WOOD', label: (dict as any).THEME_KURDISH_WOOD, color: 'bg-amber-900 border border-amber-500' }
                ] as const).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    className={`flex items-center space-x-2 space-x-reverse p-3 rounded-xl border text-xs font-bold transition-all ${
                      theme === t.key 
                        ? 'bg-amber-500/10 border-amber-400 text-white shadow-md shadow-amber-500/10' 
                        : 'bg-black/20 border-white/5 text-white/60 hover:text-white'
                    } ${t.key === 'KURDISH_WOOD' ? 'col-span-2 sm:col-span-1' : ''}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${t.color}`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Statistics Dashboard Widget (Offline Persistence Saved) */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-cyan-400">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <MonitorCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <h3 className="font-black text-sm tracking-wide">{STATS_DICT[lang].TITLE}</h3>
                </div>
                <button 
                  onClick={() => {
                    const emptyStats = { p1Wins: 0, p2Wins: 0, aiWins: 0, totalGames: 0 };
                    setStats(emptyStats);
                    localStorage.setItem('dama_stats_v1', JSON.stringify(emptyStats));
                  }}
                  className="text-[10px] bg-red-500/20 hover:bg-red-500/40 text-red-400 px-2.5 py-1 rounded-lg border border-red-500/20 active:scale-95 transition-all font-black cursor-pointer"
                >
                  {STATS_DICT[lang].RESET}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Player 1 */}
                <div className="bg-cyan-950/20 border border-cyan-500/10 p-2 rounded-xl">
                  <span className="text-[10px] text-cyan-300 font-bold block truncate">{lang === 'KU' ? 'تۆ / شین' : lang === 'AR' ? 'أنت / الأزرق' : 'Cyan'}</span>
                  <span className="text-lg font-black font-mono block text-white mt-1">{stats.p1Wins}</span>
                  <span className="text-[9px] text-white/50 block mt-0.5">
                    {stats.totalGames > 0 ? Math.round((stats.p1Wins / stats.totalGames) * 100) : 0}% {STATS_DICT[lang].WIN_RATE}
                  </span>
                </div>

                {/* Player 2 */}
                <div className="bg-slate-900/30 border border-white/5 p-2 rounded-xl">
                  <span className="text-[10px] text-zinc-300 font-bold block truncate">{lang === 'KU' ? 'هاوڕێ / سپی' : lang === 'AR' ? 'صديق / الأبيض' : 'Friend'}</span>
                  <span className="text-lg font-black font-mono block text-white mt-1">{stats.p2Wins}</span>
                  <span className="text-[9px] text-white/50 block mt-0.5">
                    {stats.totalGames > 0 ? Math.round((stats.p2Wins / stats.totalGames) * 100) : 0}% {STATS_DICT[lang].WIN_RATE}
                  </span>
                </div>

                {/* AI */}
                <div className="bg-indigo-950/20 border border-indigo-500/10 p-2 rounded-xl">
                  <span className="text-[10px] text-indigo-300 font-bold block truncate">{lang === 'KU' ? 'کۆمپیوتەر / AI' : lang === 'AR' ? 'الروبوت / AI' : 'AI'}</span>
                  <span className="text-lg font-black font-mono block text-white mt-1">{stats.aiWins}</span>
                  <span className="text-[9px] text-white/50 block mt-0.5">
                    {stats.totalGames > 0 ? Math.round((stats.aiWins / stats.totalGames) * 100) : 0}% {STATS_DICT[lang].WIN_RATE}
                  </span>
                </div>
              </div>

              {/* Progress visual indicator bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/60 font-medium">
                  <span>{STATS_DICT[lang].TOTAL} {stats.totalGames}</span>
                  <span>100% Offline Tracked</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${stats.totalGames > 0 ? (stats.p1Wins / stats.totalGames) * 100 : 0}%` }}
                    className="bg-cyan-400 h-full transition-all duration-500"
                    title="Player 1"
                  />
                  <div 
                    style={{ width: `${stats.totalGames > 0 ? (stats.p2Wins / stats.totalGames) * 100 : 0}%` }}
                    className="bg-slate-200 h-full transition-all duration-500"
                    title="Player 2"
                  />
                  <div 
                    style={{ width: `${stats.totalGames > 0 ? (stats.aiWins / stats.totalGames) * 100 : 0}%` }}
                    className="bg-indigo-500 h-full transition-all duration-500"
                    title="AI Robot"
                  />
                </div>
              </div>

              {matchStateHistory.length > 0 && (
                <div className="pt-3 border-t border-white/5 flex flex-col justify-center space-y-1">
                  <button
                    onClick={() => {
                      setReplayIndex(0);
                      setScreen('REPLAY');
                    }}
                    className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/20 hover:border-amber-400/50 text-amber-300 py-3 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{(dict as any).REPLAY_MODE}</span>
                  </button>
                  <span className="text-[10px] text-white/40 text-center font-mono">
                    {lang === 'KU' ? `کۆتا یاریت پاشەکەوتکراوە بە (${matchStateHistory.length}) جوولە` : `Last match saved with ${matchStateHistory.length} moves`}
                  </span>
                </div>
              )}
            </div>

            {/* Structured Local Sub-page navigation buttons */}
            <div className="w-full grid grid-cols-2 gap-4">
              <button
                onClick={() => setScreen('RULES_PAGE')}
                className="relative group flex flex-col items-center justify-center p-4 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-400/50 rounded-3xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-3 bg-white/5 border border-white/5 rounded-2xl group-hover:bg-cyan-500/20 group-hover:border-cyan-400/30 transition-all duration-300 mb-2">
                  <BookOpen className="w-6 h-6 text-cyan-400/70 group-hover:text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="relative text-white/70 group-hover:text-white font-bold text-sm tracking-wide">{lang === 'KU' ? 'یاساکان' : lang === 'AR' ? 'القوانين' : 'Rules'}</span>
              </button>

              <button
                onClick={() => setScreen('POLICY_PAGE')}
                className="relative group flex flex-col items-center justify-center p-4 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-rose-400/50 rounded-3xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.15)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-rose-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-3 bg-white/5 border border-white/5 rounded-2xl group-hover:bg-rose-500/20 group-hover:border-rose-400/30 transition-all duration-300 mb-2">
                  <ShieldAlert className="w-6 h-6 text-rose-400/70 group-hover:text-rose-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="relative text-white/70 group-hover:text-white font-bold text-sm tracking-wide">{lang === 'KU' ? 'سیاسەت' : lang === 'AR' ? 'الخصوصية' : 'Policy'}</span>
              </button>
            </div>

            {/* Safari iOS PWA Guide Trigger Banner */}
            {isIos && (
              <div className="w-full bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 text-right text-xs leading-relaxed space-y-2">
                <div className="font-black text-indigo-400 flex items-center space-x-1.5 space-x-reverse">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>{lang === 'KU' ? 'دابەزاندن بۆ ئایفۆن' : 'Install on iPhone'}</span>
                </div>
                <p className="text-white/80">
                  {lang === 'KU' 
                    ? 'بۆ دابەزاندنی یارییەکە، لە ژێرەوەی وێبگەڕی سەفاری نیشانەی Share دابگرە پاشان بژاردەی "Add to Home Screen" هەڵبژێرە.'
                    : 'To install on iPhone, tap share button on Safari and choose "Add to Home Screen".'}
                </p>
              </div>
            )}

            {/* Unified Play Store Promo Widget */}
            <div className="w-full bg-gradient-to-r from-cyan-950/20 to-indigo-950/20 border border-cyan-500/30 rounded-3xl p-5 text-center space-y-3 relative overflow-hidden shadow-2xl">
              <AlertCircle className="w-5 h-5 text-cyan-400 absolute top-4 right-4 animate-bounce" />
              <p className="text-sm font-bold text-white/90 px-4">
                {dict.PLAY_STORE_MSG}
              </p>
              <a 
                href="https://play.google.com/store/apps/details?id=com.nmadev.dama"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 space-x-reverse bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 text-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{dict.PLAY_STORE_BTN}</span>
              </a>
              <div className="text-[10px] text-white/40 pt-1 font-mono">package : com.nmadev.dama</div>
            </div>
          </motion.div>
        )}

        {/* --- LOCAL DEDICATED RULES PAGE --- */}
        {screen === 'RULES_PAGE' && (
          <motion.div 
            key="rules"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="z-10 flex flex-col w-full max-w-md space-y-6 px-4 pt-6"
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <button 
                onClick={() => setScreen('HOME')} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
              >
                <ChevronRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
              </button>
              <h2 className="text-3xl font-black text-white/90">{dict.RULES_TITLE}</h2>
            </div>

            <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6 text-right space-y-4 shadow-xl">
              <div className="text-sm leading-relaxed text-white/90 space-y-4">
                <p className="font-bold text-cyan-400 text-lg">١. ڕێکخستنی سەرەتایی یاری</p>
                <p>هەر لایەنێک خاوەنی ١٦ بەردە ڕێکدەخرێن لە ڕیزەکاندا. یاری پۆینت لەسەر تەختەیەکی ٨*٨ بێ کێشە بەڕێوەدەچێت.</p>
                
                <p className="font-bold text-cyan-400 text-lg">٢. سیستەمی ناچاری خواردنی بەرد</p>
                <p>ئەگەر دەرفەتی یەک بازدان یان زیاتر هەبێت لە جۆری بەرد، دەبێت بەردی پێشوو هەڵببژێردرێت و بخورێت بەبێ هیچ جێگرەوەیەک.</p>
                
                <p className="font-bold text-cyan-400 text-lg">٣. پیادە و شاهانەکان</p>
                <p>کاتێک بەردێک دەگاتە بەرامبەر دەبێتە (شا). شا توانای جوڵەی هەیە بۆ هەر چوار ئاراستە بێسنوور بۆ هەمیشە.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- LOCAL DEDICATED PRIVACY POLICY PAGE --- */}
        {screen === 'POLICY_PAGE' && (
          <motion.div 
            key="policy"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="z-10 flex flex-col w-full max-w-md space-y-6 px-4 pt-6"
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <button 
                onClick={() => setScreen('HOME')} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
              >
                <ChevronRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
              </button>
              <h2 className="text-2xl font-black text-white/90">{policyDict.title}</h2>
            </div>

            <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6 text-right space-y-6 shadow-xl leading-relaxed text-sm">
              <p className="text-cyan-400 font-bold">{policyDict.intro}</p>
              
              <div className="space-y-2">
                <p className="font-bold text-white text-base">{policyDict.dataTitle}</p>
                <p className="text-white/70">{policyDict.dataContent}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-white text-base">{policyDict.offTitle}</p>
                <p className="text-white/70">{policyDict.offContent}</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-white text-base">{policyDict.adTitle}</p>
                <p className="text-white/70">{policyDict.adContent}</p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <p className="font-bold text-white text-base">{policyDict.conTitle}</p>
                <p className="text-white/70">{policyDict.conContent}</p>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'SETUP_AI' && (
          <motion.div 
            key="ai"
            initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 40 : -40 }}
            className="z-10 flex flex-col w-full max-w-md px-6 pt-4 space-y-6"
          >
            <div className="flex items-center space-x-4 space-x-reverse mb-2">
              <button 
                onClick={() => setScreen('HOME')} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
              >
                <ChevronRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
              </button>
              <h2 className="text-3xl font-black text-white/90">{dict.PLAY_AI}</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-white/70 font-semibold text-sm">{dict.PLAYER_1} (👴🏻 کڵاو سپی)</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                  <input 
                    type="text" 
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all font-bold"
                    placeholder={dict.PLAYER_1}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-white/70 font-semibold text-sm">{dict.DIFFICULTY}</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as Difficulty[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-3.5 rounded-xl text-sm font-bold transition-all border text-right flex items-center justify-between ${
                        difficulty === level 
                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <span>
                        {level === 'EASY' && dict.EASY}
                        {level === 'MEDIUM' && dict.MEDIUM}
                        {level === 'HARD' && dict.HARD}
                        {level === 'EXPERT' && (dict as any).EXPERT}
                      </span>
                      {difficulty === level && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-cyan-500 to-indigo-500 py-4 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all mt-4"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{dict.START}</span>
            </button>
          </motion.div>
        )}

        {screen === 'SETUP_FRIEND' && (
          <motion.div 
            key="friend"
            initial={{ opacity: 0, x: isRtl ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 40 : -40 }}
            className="z-10 flex flex-col w-full max-w-md px-6 pt-4 space-y-6"
          >
            <div className="flex items-center space-x-4 space-x-reverse mb-2">
              <button 
                onClick={() => setScreen('HOME')} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
              >
                <ChevronRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
              </button>
              <h2 className="text-3xl font-black text-white/90">{dict.PLAY_FRIEND}</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-white/70 font-semibold text-sm">{dict.PLAYER_1} (👴🏻 شین - بە کڵاوەوە)</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                  <input 
                    type="text" 
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all font-bold"
                    placeholder={dict.PLAYER_1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-white/70 font-semibold text-sm">{dict.PLAYER_2} (👴🏽 سپی - بە جامانەوە)</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
                  <input 
                    type="text" 
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pr-12 pl-4 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all font-bold"
                    placeholder={dict.PLAYER_2}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-indigo-500 to-purple-500 py-4 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all mt-4"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{dict.START}</span>
            </button>
          </motion.div>
        )}

        {screen === 'PLAYING' && (
          <motion.div 
            key="play"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 flex flex-col w-full h-full max-w-3xl px-1 sm:px-2 flex-1 items-center justify-center space-y-2 sm:space-y-3 relative"
          >
            {/* Absolute Floating Emojis Screen Overlay */}
            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden flex items-end justify-center">
              <AnimatePresence>
                {floatingEmojis.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: 200, x: item.x, scale: 0.5, opacity: 0 }}
                    animate={{ y: -500, x: item.x + (Math.random() * 80 - 40), scale: 2, opacity: [0, 1, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                    className="absolute text-5xl select-none"
                  >
                    {item.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Coach Hint Top Notification Banner */}
            <AnimatePresence>
              {coachHintMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="w-full max-w-md bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 border border-amber-400/40 rounded-2xl p-3 text-center text-xs text-amber-100 shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-center justify-center space-x-2 space-x-reverse z-30 font-sans"
                >
                  <span className="text-base">💡</span>
                  <span className="font-bold leading-relaxed">{coachHintMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Bar: Timer and AI Hint control in active play */}
            <div className="w-full flex justify-between items-center px-2 shrink-0">
              <div className="flex items-center space-x-1.5 space-x-reverse bg-black/40 border border-white/5 py-1 px-3 rounded-full text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono">{formatTime(seconds)}</span>
              </div>
              
              <button
                onClick={handleGetCoachHint}
                className="flex items-center space-x-1.5 space-x-reverse bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 hover:border-amber-300 text-amber-200 hover:text-white px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer"
              >
                <span>{(dict as any).HINT_BTN}</span>
              </button>
            </div>

            {/* Top Avatar (Player 1 / Cyan / "ناوی یەکەم") */}
            <div className="w-full flex justify-center relative">
              {/* Speech Bubble for P1 */}
              <AnimatePresence>
                {chatMessage?.sender === 'CYAN' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute bottom-16 bg-gradient-to-br from-cyan-900 to-indigo-950 border border-cyan-400/30 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl shadow-xl z-50 flex items-center space-x-1 max-w-[200px]"
                  >
                    <span>{chatMessage.text}</span>
                    <div className="absolute left-[50%] -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-indigo-950 border-r border-b border-cyan-400/30 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`px-4 sm:px-6 py-1.5 rounded-2xl border-2 transition-all duration-300 flex items-center space-x-3 sm:space-x-4 space-x-reverse ${
                gameState.turn === 'CYAN' && !gameState.winner
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.3)] scale-105' 
                  : 'bg-black/20 border-transparent opacity-60'
              }`}>
                <div className={`text-4xl sm:text-5xl ${gameState.turn === 'CYAN' && !gameState.winner ? 'animate-bounce' : ''}`}>👴🏻</div>
                <div className="text-right">
                  <p className="font-black text-lg sm:text-xl text-cyan-400 leading-tight">{p1}</p>
                  <div className="flex items-center justify-end space-x-1 space-x-reverse mt-0.5">
                    <span className="w-3 h-3 rounded-full bg-slate-300 shadow-sm border border-slate-400/50 block"></span>
                    <span className="text-xs font-bold text-cyan-200/70 ml-1 font-mono">x{cyanCaptures}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Playable Checkers board area */}
            <div className="w-full flex justify-center flex-none">
              <Board 
                gameState={gameState} 
                dispatch={dispatch} 
                theme={theme} 
                disabled={mode === 'AI' && gameState.turn === 'WHITE'}
                p1Name={p1}
                p2Name={p2}
                onRestart={handleFullReset}
                onGoHome={() => setScreen('HOME')}
                lang={lang}
                coachHintSource={coachHintSource}
                coachHintDest={coachHintDest}
              />
            </div>

            {/* Bottom Avatar (Player 2 / White / "ناوی دووەم") */}
            <div className="w-full flex justify-center relative">
              {/* Speech Bubble for P2 */}
              <AnimatePresence>
                {chatMessage?.sender === 'WHITE' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    className="absolute top-16 bg-gradient-to-br from-stone-900 to-amber-950 border border-amber-500/30 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl shadow-xl z-50 flex items-center space-x-1 max-w-[200px]"
                  >
                    <span>{chatMessage.text}</span>
                    <div className="absolute left-[50%] -top-1.5 -translate-x-1/2 w-3 h-3 bg-stone-900 border-l border-t border-amber-500/30 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`px-4 sm:px-6 py-1.5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between space-x-3 sm:space-x-4 space-x-reverse ${
                gameState.turn === 'WHITE' && !gameState.winner
                  ? 'bg-white/10 border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.2)] scale-105' 
                  : 'bg-black/20 border-transparent opacity-60'
              }`}>
                <div className="text-left">
                  <p className="font-black text-lg sm:text-xl text-slate-100 leading-tight">{p2}</p>
                  <div className="flex items-center space-x-1 space-x-reverse mt-0.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm border border-cyan-400/50 block"></span>
                    <span className="text-xs font-bold text-slate-300/70 mr-1 font-mono">x{whiteCaptures}</span>
                  </div>
                </div>
                <div className={`text-4xl sm:text-5xl ${gameState.turn === 'WHITE' && !gameState.winner ? 'animate-bounce' : ''}`}>👴🏽</div>
              </div>
            </div>

            {/* Collapsible Local Emojis & Quick Chat Panel for active screen */}
            <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-2.5 sm:p-3 space-y-2 select-none shrink-0 z-30 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-cyan-400 font-bold">{(dict as any).CHAT_SEND}</span>
                <div className="flex gap-1.5 overflow-x-auto">
                  {['😂', '🔥', '👍', '💀', '😎', '😮'].map(em => (
                    <button
                      key={em}
                      onClick={() => {
                        triggerFloatingEmoji(em);
                        // Make AI or current turn player react
                        sendQuickChatMessage(gameState.turn, em);
                      }}
                      className="text-lg bg-white/5 hover:bg-white/15 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kurdish Preset Phrases Row */}
              <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar select-none">
                {QUICK_PHRASES[lang].map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sendQuickChatMessage(gameState.turn, phrase);
                      // Auto throw associated emojis based on keywords or idx
                      const ems = ['👏', '⚡', '🍀', '💀', '💪'];
                      triggerFloatingEmoji(ems[idx % ems.length]);
                    }}
                    className="text-[10px] sm:text-xs font-bold bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/10 py-1.5 px-3 rounded-xl whitespace-nowrap text-white/90 hover:text-white transition-all active:scale-95 cursor-pointer max-w-[150px] truncate"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'REPLAY' && (
          <motion.div 
            key="replay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 flex flex-col w-full h-full max-w-3xl px-1 sm:px-2 flex-1 items-center justify-center space-y-3"
          >
            {/* Header / Nav */}
            <div className="w-full flex items-center justify-between px-2 shrink-0">
              <button 
                onClick={() => {
                  setScreen('HOME');
                  setReplayIndex(null);
                }}
                className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors flex items-center space-x-1 space-x-reverse cursor-pointer text-xs font-bold text-white"
              >
                <ChevronRight className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
                <span>{lang === 'KU' ? 'گەڕانەوە' : 'Home'}</span>
              </button>
              <h2 className="text-xl font-black text-amber-400 font-sans tracking-wide">{(dict as any).REPLAY_MODE} 🔄</h2>
            </div>

            {/* Replay board status screen showing active state */}
            {replayIndex !== null && matchStateHistory[replayIndex] && (
              <div className="w-full space-y-4">
                {/* Visual Tracker Bar */}
                <div className="w-full bg-black/40 border border-white/5 p-3 rounded-2xl flex items-center justify-between font-mono text-center text-xs">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-white/40">Move:</span>
                    <span className="text-amber-400 font-bold">{replayIndex + 1} / {matchStateHistory.length}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-white/40">Turn:</span>
                    <span className="text-cyan-400 font-bold">
                      {matchStateHistory[replayIndex].turn === 'CYAN' ? p1 : p2}
                    </span>
                  </div>
                </div>

                {/* Passive non-interactive board showing exactly the saved position! */}
                <div className="w-full flex justify-center">
                  <Board
                    gameState={{
                      board: matchStateHistory[replayIndex].board,
                      turn: matchStateHistory[replayIndex].turn,
                      selectedPos: null,
                      mustJumpPos: null,
                      winner: matchStateHistory[replayIndex].winner || null,
                      history: []
                    }}
                    dispatch={() => {}} // passive
                    theme={theme}
                    disabled={true} // passive
                    p1Name={p1}
                    p2Name={p2}
                    onRestart={() => {}}
                    onGoHome={() => {}}
                    lang={lang}
                  />
                </div>

                {/* Step forward and step backward elegant buttons */}
                <div className="w-full grid grid-cols-3 gap-3">
                  <button
                    disabled={replayIndex === 0}
                    onClick={() => setReplayIndex((prev) => (prev !== null && prev > 0) ? prev - 1 : prev)}
                    className="flex flex-col items-center justify-center p-3.5 bg-white/5 border border-white/10 rounded-2xl transition-all active:scale-95 text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                    <span className="text-[10px] font-sans font-bold mt-1 text-white">
                      {lang === 'KU' ? 'دواوە' : 'Previous'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      // Autoplay loop from current index to the end
                      let activeIdx = replayIndex;
                      const interval = setInterval(() => {
                        if (activeIdx < matchStateHistory.length - 1) {
                          activeIdx++;
                          setReplayIndex(activeIdx);
                          if (soundEnabled) {
                            try { playSound('move'); } catch(e){}
                          }
                        } else {
                          clearInterval(interval);
                        }
                      }, 1000);
                    }}
                    className="flex flex-col items-center justify-center p-3.5 bg-amber-500/10 border border-amber-400/30 rounded-2xl transition-all active:scale-95 text-amber-400 hover:bg-amber-500/15 cursor-pointer font-bold"
                  >
                    <Play className="w-5 h-5" />
                    <span className="text-[10px] font-sans mt-1">
                      {lang === 'KU' ? 'لێدانی خۆکار' : 'Autoplay'}
                    </span>
                  </button>

                  <button
                    disabled={replayIndex === matchStateHistory.length - 1}
                    onClick={() => setReplayIndex((prev) => (prev !== null && prev < matchStateHistory.length - 1) ? prev + 1 : prev)}
                    className="flex flex-col items-center justify-center p-3.5 bg-white/5 border border-white/10 rounded-2xl transition-all active:scale-95 text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180 text-white" />
                    <span className="text-[10px] font-sans font-bold mt-1 text-white">
                      {lang === 'KU' ? 'پێشەوە' : 'Next'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {screen === 'LOBBY' && (
          <motion.div 
            key="lobby"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 flex flex-col w-full max-w-md px-6 pt-4 space-y-6 shrink-0 relative"
          >
            {/* Header */}
            <div className="flex items-center space-x-4 space-x-reverse mb-2">
              <button 
                onClick={() => setScreen('HOME')} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-colors cursor-pointer text-white"
              >
                <ChevronRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
              </button>
              <h2 className="text-3xl font-black text-amber-400">{(dict as any).LOBBY_ROOM} 🌐</h2>
            </div>

            {/* Main Interactive Panel */}
            <div className="bg-black/40 border border-white/10 p-5 rounded-3xl space-y-5 backdrop-blur-xl">
              <div className="text-right space-y-1">
                <p className="text-xs tracking-wider text-cyan-400 uppercase font-black">
                  {lang === 'KU' ? 'لۆبی و بانگهێشتی هاوڕێیان' : 'Lobby & Friend Invites'}
                </p>
                <p className="text-xs text-white/60 leading-relaxed font-bold">
                  {lang === 'KU' 
                    ? 'ڕووبەری پێک بەستنی راستەوخۆی یاریزانان لە رێگەی وەرگرتن یان ناردنی کۆدی کورت' 
                    : 'Establish cross-player direct connections using shared room invite codes.'}
                </p>
              </div>

              {/* Box 1: Host Room */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-amber-300 block text-right">
                  {lang === 'KU' ? '١. ژوور دروست بکە و کۆد دابەش بکە:' : '1. Create Room & Share Code:'}
                </span>

                <div className="flex items-center justify-between bg-black/30 border border-white/10 p-3 rounded-xl">
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block">Room Invite Code</span>
                    <span className="text-2xl font-black text-white font-mono tracking-widest">{roomCode || '----'}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(roomCode);
                    }}
                    className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-bold active:scale-95 cursor-pointer font-sans"
                  >
                    {lang === 'KU' ? 'لەبەرگرتنەوە' : 'Copy'}
                  </button>
                </div>

                {isLobbySearching ? (
                  <div className="flex items-center space-x-2 space-x-reverse text-xs text-cyan-300/80 justify-center py-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span className="font-bold">{lang === 'KU' ? 'چاوەڕێی هاوڕێتین بۆ بەستنەوە...' : 'Waiting for guest player to join...'}</span>
                  </div>
                ) : lobbySuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center space-y-2">
                    <p className="text-xs text-emerald-300 font-bold">
                      🎉 {lang === 'KU' ? 'یاریزانەکەی تر بەستراوەتەوە!' : 'Peer player connected successfully!'}
                    </p>
                    <button
                      onClick={handleStartLobbyMatch}
                      className="w-full bg-emerald-500 text-slate-900 py-2 rounded-lg text-xs font-black transition-all hover:bg-emerald-400 active:scale-95 cursor-pointer"
                    >
                      {lang === 'KU' ? 'دەستپێکردنی یاری ▶' : 'Begin Match ▶'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateRoom}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2 text-xs font-bold rounded-xl active:scale-95 text-white cursor-pointer"
                  >
                    {lang === 'KU' ? 'دروستکردنی کۆد' : 'Create Room Code'}
                  </button>
                )}
              </div>

              {/* Box 2: Join Room */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-cyan-300 block text-right">
                  {lang === 'KU' ? '٢. چوونەژوورە بە نووسینی کۆد:' : '2. Enter Shared Invite Code:'}
                </span>

                <div className="flex space-x-2 space-x-reverse">
                  <input
                    type="text"
                    maxLength={4}
                    value={typedRoomCode}
                    onChange={(e) => setTypedRoomCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 5489"
                    className="flex-1 bg-black/40 border border-white/15 rounded-xl text-center py-2 text-lg text-white font-mono tracking-widest focus:outline-none focus:border-cyan-400 placeholder-white/20"
                  />
                  <button
                    disabled={typedRoomCode.length < 4 || isLobbySearching}
                    onClick={handleJoinRoom}
                    className="bg-cyan-500 text-slate-950 px-5 rounded-xl font-bold text-xs hover:bg-cyan-400 transition-all active:scale-95 cursor-pointer disabled:opacity-35 disabled:pointer-events-none"
                  >
                    {lang === 'KU' ? 'پێک بەستن' : 'Connect'}
                  </button>
                </div>

                {lobbyError && (
                  <p className="text-xs text-rose-400 text-center font-bold">{lobbyError}</p>
                )}
              </div>
            </div>

            {/* Peer-to-peer simulator guidelines */}
            <div className="text-[11px] text-white/40 leading-relaxed text-right font-bold bg-white/5 border border-white/5 rounded-2xl p-3.5">
              <span>⚡ {lang === 'KU' ? 'سیستەمی ژوورەکان بە تەواوی پاڵپشتی کلاودفلێر Workers KV و بنکەی دراوەی Realtime دەکات بۆ گواستنەوەی جێگیر.' : 'Standard direct peer-to-peer messaging channel built over low-latency server relays.'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
