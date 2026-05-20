import React, { useReducer, useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initialGameState, gameReducer } from './store/gameReducer';
import Board from './components/Board';
import { Home as HomeIcon, ChevronRight, ChevronLeft, Sparkles, User, Cpu, Users, Play, Palette, Globe, BookOpen, AlertCircle, ShoppingBag, ShieldAlert, MonitorCheck, RefreshCw, Clock, Volume2, VolumeX, Key, Shield, Gift, LogOut, Lock, Settings, CheckCircle } from 'lucide-react';
import { useDropSound } from './useSound';
import { GameMode, Difficulty, BoardTheme } from './types';
import { getAIMove } from './ai';
import { TRANSLATIONS, Language } from './translations';
import { POLICY_TRANSLATIONS } from './policyTranslations';
import AuthSystem, { UserProfile } from './components/AuthSystem';
import AdminPanel from './components/AdminPanel';
import { BACKEND_URL } from './config';
import { AboutPage } from './components/AboutPage';

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
  
  // Custom nested back-history screen stack that scales beautifully!
  type ScreenType = 'HOME' | 'SETUP_AI' | 'SETUP_FRIEND' | 'PLAYING' | 'RULES_PAGE' | 'POLICY_PAGE' | 'LOBBY' | 'REPLAY' | 'ABOUT';
  const [screen, setScreenRaw] = useState<ScreenType>('HOME');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>([]);

  const setScreen = (newScreen: ScreenType) => {
    if (newScreen !== screen) {
      setScreenHistory(prev => [...prev, screen]);
    }
    setScreenRaw(newScreen);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [screen]);

  const handleNavigateBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory(prev => prev.slice(0, -1));
      setScreenRaw(prev);
    } else {
      handleHomeBackPress();
    }
  };

  // Custom premium notifications system
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Google Chrome & iOS Safari PWA Install variables
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [showChromeInstall, setShowChromeInstall] = useState(false);
  const [lastBackPress, setLastBackPress] = useState(0);

  const handleHomeBackPress = () => {
    const now = Date.now();
    if (now - lastBackPress < 2000) {
      showNotification(
        lang === 'KU' ? '👋 لە مێنۆیی یارییەکەت دەرچوویت!' : lang === 'AR' ? '👋 تم الخروج من القائمة بنجاح!' : '👋 Exited the game menu!',
        'info'
      );
    } else {
      setLastBackPress(now);
      showNotification(
        lang === 'KU' ? 'جاری دووەم دابگرە بۆ دەرچوون لە مێنۆ 🚪' : lang === 'AR' ? 'اضغط مرة أخرى للخروج من القائمة 🚪' : 'Press back again to exit game 🚪',
        'info'
      );
    }
  };

  const [mode, setMode] = useState<GameMode>('AI');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [theme, setTheme] = useState<BoardTheme>('CLASSIC');
  const [isLandscape, setIsLandscape] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // New features state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('dama_current_user_v2');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  });

  const [pieceFlag, setPieceFlag] = useState<string>(() => {
    const saved = localStorage.getItem('dama_piece_flag_v1');
    return saved || 'CLASSIC';
  });

  const [lastMoveTimestamp, setLastMoveTimestamp] = useState<number>(Date.now());
  const [afkLossOccurred, setAfkLossOccurred] = useState<boolean>(false);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [titleClicks, setTitleClicks] = useState<number>(0);
  const [showAdminBypass, setShowAdminBypass] = useState<boolean>(false);
  const [bypassPasscode, setBypassPasscode] = useState<string>('');
  const [adminUser, setAdminUser] = useState<string>('');
  
  // Auto Matchmaking State
  const [showAutoMatch, setShowAutoMatch] = useState<boolean>(false);
  const [foundPlayers, setFoundPlayers] = useState<{id: string; name: string; avatar: string}[]>([]);
  const [autoMatchTarget, setAutoMatchTarget] = useState<string>('');

  // Persist current user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dama_current_user_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dama_current_user_v2');
    }
  }, [currentUser]);

  // Persist piece flag selection
  useEffect(() => {
    localStorage.setItem('dama_piece_flag_v1', pieceFlag);
  }, [pieceFlag]);
  
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  // AI Coach Hint state
  const [coachHintSource, setCoachHintSource] = useState<{ r: number; c: number } | null>(null);
  const [coachHintDest, setCoachHintDest] = useState<{ r: number; c: number } | null>(null);
  const [coachHintMessage, setCoachHintMessage] = useState<string>('');
  const [coachHintsLeft, setCoachHintsLeft] = useState<number>(5);

  // Match Replay state
  const [matchStateHistory, setMatchStateHistory] = useState<any[]>([]);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);

  // Lobby Code & Simulated peer connections
  const [roomCode, setRoomCode] = useState<string>('');
  const [isLobbySearching, setIsLobbySearching] = useState<boolean>(false);
  const [lobbyError, setLobbyError] = useState<string>('');
  const [lobbySuccess, setLobbySuccess] = useState<boolean>(false);
  const [typedRoomCode, setTypedRoomCode] = useState<string>('');

  // Real-time multiplayer synchronization
  const [isOnlineMatch, setIsOnlineMatch] = useState<boolean>(false);
  const [onlineRole, setOnlineRole] = useState<'HOST' | 'GUEST' | null>(null);
  const [incomingInvite, setIncomingInvite] = useState<{ sender: string; roomCode: string } | null>(null);

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

  // Compute other registered profiles for the interactive Lobby
  const registeredUsers = useMemo<UserProfile[]>(() => {
    const raw = localStorage.getItem('dama_users_db_v2');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      if (currentUser) {
        return parsed.filter((u: any) => u.username.toLowerCase() !== currentUser.username.toLowerCase());
      }
      return parsed;
    } catch (e) {
      return [];
    }
  }, [currentUser]);

  // Restore saved session on mount (offline continuity support)
  useEffect(() => {
    const savedActive = localStorage.getItem('dama_active_game_v1');
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        if (parsed) {
          if (parsed.lang) setLang(parsed.lang);
          // if (parsed.screen) setScreen(parsed.screen); // Removed to always start at home
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

  // Setup PWA install handlers and deep iOS checks on mount
  useEffect(() => {
    const isStandalone = typeof window !== 'undefined' && (
      (window.navigator && 'standalone' in window.navigator && (window.navigator as any).standalone) ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    );

    const handleBeforePrompt = (e: any) => {
      // If downloaded already, suppress Android prompt completely
      if (isStandalone) {
        return;
      }
      e.preventDefault();
      setDeferredPrompt(e);
      setShowChromeInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforePrompt);

    const isIosDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setShowIosPrompt(true);
      }, 1500);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
    };
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

        // Trigger Token economy update for Online (Friend/Lobby) matches
        if (mode !== 'AI' && currentUser) {
          const isWinner = gameState.winner === 'CYAN';
          
          if (isWinner) {
            const tokenChange = 20;
            const updatedTokens = (currentUser.tokens || 0) + tokenChange;
            const updatedUser = { ...currentUser, tokens: updatedTokens };
            setCurrentUser(updatedUser);

            // Update Users DB locally and on D1 Database by adding 20 tokens
            fetch(`${BACKEND_URL}/api/game/end`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.id,
                isWinner: true
              })
            }).then(res => res.json())
              .then((data: any) => {
                if (data.success && typeof data.newTokens === 'number') {
                  setCurrentUser(prev => prev ? { ...prev, tokens: data.newTokens } : null);
                }
              }).catch(err => console.error("Error syncing endgame tokens:", err));
          }
        }

        setStatsUpdated(true);
      }
    } else {
      setStatsUpdated(false);
    }
  }, [gameState.winner, mode, statsUpdated, currentUser]);

  // Reset lastMoveTimestamp when board state shifts or turns update
  useEffect(() => {
    setLastMoveTimestamp(Date.now());
  }, [gameState.board, gameState.turn]);

  // 4 minutes AFK Inactivity checking routine
  useEffect(() => {
    let intervalId: any = null;
    if (screen === 'PLAYING' && !gameState.winner) {
      intervalId = setInterval(() => {
        const inactiveMs = Date.now() - lastMoveTimestamp;
        if (inactiveMs >= 4 * 60 * 1000) { // 240,000 miliseconds (4 minutes)
          setAfkLossOccurred(true);

          if (mode !== 'AI' && currentUser) {
            const updatedTokens = Math.max(0, (currentUser.tokens || 0) - 10);
            const updatedUser = { ...currentUser, tokens: updatedTokens };
            setCurrentUser(updatedUser);

            // Update Users DB
            const rawDB = localStorage.getItem('dama_users_db_v2');
            if (rawDB) {
              try {
                const db = JSON.parse(rawDB) as UserProfile[];
                const idx = db.findIndex(u => u.id === currentUser.id);
                if (idx > -1) {
                  db[idx].tokens = updatedTokens;
                  localStorage.setItem('dama_users_db_v2', JSON.stringify(db));
                }
              } catch (e) {}
            }
          }

          setScreen('HOME');
          handleFullReset();
        }
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [screen, gameState.winner, lastMoveTimestamp, mode, currentUser]);

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

  // Listen to multiplayer messages over BroadcastChannel
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('dama_multiplayer_channel');
      
      bc.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        // 1. Peer requests to join hosted room
        if (data.type === 'PEER_JOIN_REQUEST') {
          if (roomCode && data.roomCode === roomCode && onlineRole === 'HOST') {
            setLobbySuccess(true);
            setIsLobbySearching(false);
            if (soundEnabled) {
              try { playSound('win'); } catch(e){}
            }
            showNotification(lang === 'KU' ? `دیاری: ${data.guestUser} بەستراوەتەوە بە ژوورەکەت! ⚔️` : `Player ${data.guestUser} joined your room!`, 'success');
            
            // Send feedback back to the guest
            bc.postMessage({
              type: 'PEER_JOIN_ACCEPT',
              roomCode: roomCode,
              hostUser: currentUser?.username || 'Host Player'
            });

            // Start game in 1.2s
            const rival = data.guestUser;
            setTimeout(() => {
              const myName = currentUser ? currentUser.username : 'یاریزان ١';
              setPlayer1Name(`${myName} (You)`);
              setPlayer2Name(`${rival} 🌐`);
              setMode('FRIEND');
              setIsOnlineMatch(true);
              setScreen('PLAYING');
              handleFullReset();
            }, 1200);
          }
        }

        // 2. Guest receives peer acceptance
        if (data.type === 'PEER_JOIN_ACCEPT') {
          if (roomCode && data.roomCode === roomCode && onlineRole === 'GUEST') {
            setLobbySuccess(true);
            setIsLobbySearching(false);
            if (soundEnabled) {
              try { playSound('win'); } catch(e){}
            }
            showNotification(lang === 'KU' ? `بە سەرکەوتوویی بەسترایتەوە لەگەڵ ${data.hostUser}! 🤝` : `Connected with ${data.hostUser}!`, 'success');

            // Start game in 1.2s
            const rival = data.hostUser;
            setTimeout(() => {
              const myName = currentUser ? currentUser.username : 'یاریزان ٢';
              setPlayer1Name(`${rival} 🌐`);
              setPlayer2Name(`${myName} (You)`);
              setMode('FRIEND');
              setIsOnlineMatch(true);
              setScreen('PLAYING');
              handleFullReset();
            }, 1200);
          }
        }

        // 3. Username Direct Invitation
        if (data.type === 'USERNAME_INVITE_SEND') {
          if (currentUser && data.targetUsername.toLowerCase() === currentUser.username.toLowerCase()) {
            setIncomingInvite({
              sender: data.senderUsername,
              roomCode: data.roomCode
            });
            if (soundEnabled) {
              try { playSound('select'); } catch(e){}
            }
          }
        }

        // 4. Accepting direct invitation callback
        if (data.type === 'USERNAME_INVITE_ACCEPT') {
          if (currentUser && data.senderUsername.toLowerCase() === currentUser.username.toLowerCase() && roomCode === data.roomCode) {
            setLobbySuccess(true);
            setIsLobbySearching(false);
            showNotification(lang === 'KU' ? `بەکارهێنەر ${data.acceptorUsername} بانگهێشتەکەی قبوڵ کردیت! ⚔️` : `Player ${data.acceptorUsername} accepted the challenge!`, 'success');
            
            setTimeout(() => {
              const myName = currentUser.username;
              setPlayer1Name(`${myName} (You)`);
              setPlayer2Name(`${data.acceptorUsername} 🌐`);
              setMode('FRIEND');
              setIsOnlineMatch(true);
              setOnlineRole('HOST');
              setScreen('PLAYING');
              handleFullReset();
            }, 1200);
          }
        }

        // 5. Board sync
        if (data.type === 'GAME_STATE_UPDATE') {
          if (isOnlineMatch && data.roomCode === roomCode) {
            dispatch({ type: 'HYDRATE_STATE', payload: data.gameState });
            if (soundEnabled) {
              try { playSound('move'); } catch(e){}
            }
          }
        }

        // 6. Floating emoji/chat messages sync
        if (data.type === 'GAME_CHAT_SYNC') {
          if (isOnlineMatch && data.roomCode === roomCode) {
            if (data.msgType === 'emoji') {
              setFloatingEmojis(prev => [...prev, {
                id: Math.random().toString(),
                emoji: data.content,
                x: Math.floor(Math.random() * 240) - 120,
                y: 0
              }]);
              if (soundEnabled) {
                try { playSound('move'); } catch(e){}
              }
            } else if (data.msgType === 'text') {
              setChatMessage({
                sender: onlineRole === 'HOST' ? 'P2' : 'P1',
                text: data.content,
                id: Math.random().toString()
              });
              if (soundEnabled) {
                try { playSound('move'); } catch(e){}
              }
            }
          }
        }

        // 7. Rematch triggers
        if (data.type === 'GAME_REMATCH_OFFER') {
          if (isOnlineMatch && data.roomCode === roomCode) {
            showNotification(lang === 'KU' ? `بەرامبەرەکەت داوای ململانێ سێتێکی نوێ دەکات! 🔄` : `Opponent wants a rematch!`, 'info');
          }
        }

        if (data.type === 'GAME_REMATCH_ACCEPT') {
          if (isOnlineMatch && data.roomCode === roomCode) {
            showNotification(lang === 'KU' ? `یاریەکە نوێکرایەوە! سەرکەوتووبیت! 🏁` : `Match restarted!`, 'success');
            dispatch({ type: 'RESET_GAME' });
          }
        }
      };

      return () => {
        bc.close();
      };
    } catch(e) {}
  }, [roomCode, onlineRole, isOnlineMatch, currentUser, soundEnabled, lang]);

  // Sync game states over BroadcastChannel on movements
  useEffect(() => {
    if (isOnlineMatch && onlineRole && roomCode) {
      // Determine if the transition change was made by us
      const isMyMoveTransition = 
        (onlineRole === 'HOST' && gameState.turn === 'WHITE') ||
        (onlineRole === 'GUEST' && gameState.turn === 'CYAN');

      if (isMyMoveTransition) {
        try {
          const bc = new BroadcastChannel('dama_multiplayer_channel');
          bc.postMessage({
            type: 'GAME_STATE_UPDATE',
            roomCode: roomCode,
            sender: currentUser?.username || 'Opponent',
            gameState: gameState
          });
          bc.close();
        } catch (e) {}
      }
    }
  }, [gameState.board, gameState.turn, isOnlineMatch, onlineRole, roomCode]);

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
    setCoachHintsLeft(5);
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

    // Broadcast if online match is active
    if (isOnlineMatch && roomCode) {
      try {
        const bc = new BroadcastChannel('dama_multiplayer_channel');
        bc.postMessage({
          type: 'GAME_CHAT_SYNC',
          roomCode,
          msgType: 'emoji',
          content: emoji
        });
        bc.close();
      } catch (e) {}
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

    // Broadcast if online match is active
    if (isOnlineMatch && roomCode) {
      try {
        const bc = new BroadcastChannel('dama_multiplayer_channel');
        bc.postMessage({
          type: 'GAME_CHAT_SYNC',
          roomCode,
          msgType: 'text',
          content: text
        });
        bc.close();
      } catch (e) {}
    }

    setTimeout(() => {
      setChatMessage((prev) => prev?.id === id ? null : prev);
    }, 4500);
  };

  // AI Hint Coach Evaluation
  const handleGetCoachHint = () => {
    if (coachHintsLeft <= 0) {
      showNotification(
        lang === 'KU' 
          ? 'تۆ لەم یارییەدا هەموو ٥ ئامۆژگارییەکەت بەکارهێناوە! ❌' 
          : lang === 'AR'
          ? 'لقد استخدمت جميع النصائح الـ 5 المتاحة لك! ❌'
          : 'You has used all of your 5 hints for this match! ❌', 
        'info'
      );
      return;
    }

    // We evaluate using the AI engine
    const optimal = getAIMove(gameState.board, 'EXPERT', gameState.turn, gameState.mustJumpPos);
    if (optimal) {
      setCoachHintSource({ r: optimal.r, c: optimal.c });
      setCoachHintDest(optimal.dest);
      setCoachHintsLeft((prev) => Math.max(0, prev - 1));
      
      const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const textSrc = `${colLabels[optimal.c]}${8 - optimal.r}`;
      const textDest = `${colLabels[optimal.dest.c]}${8 - optimal.dest.r}`;
      
      const movingPiece = gameState.board[optimal.r][optimal.c];
      const isKing = movingPiece?.type === 'KING';
      const isJump = Math.abs(optimal.dest.r - optimal.r) > 1 || Math.abs(optimal.dest.c - optimal.c) > 1;

      let msg = '';
      if (lang === 'KU') {
        let analysis = 'شیکاریی لۆجیکی مێزەکە: جووڵەیەکی ستراتیژیی گونجاوە بۆ گرتنی فەزا گرنگەکان.';
        if (isJump) {
          analysis = 'خوێندنەوەی هێرشبەری: نەیارت ناچار کردووە زەبردەکێش بێت! لێدانێکی کوشندە و نایاب ئەنجام بدە! ⚔️';
        } else if (isKing) {
          analysis = 'سوود لە هێزی شا وەرگرە: شاکەت پێش بخە و تەواوی پلانەکەیان بە مەکڕ و توانستەوە پووچەڵ بکەرەوە! 👑';
        } else if (optimal.dest.r === (gameState.turn === 'CYAN' ? 0 : 7)) {
          analysis = 'پلان بەرەو تۆمارکردنی شا: ئەم پارچەیە بگەیەنە هێڵی کۆتایی بۆ ئەوەی ببێتە شا و فەرمانڕەوایی بکات! 🎗️';
        } else {
          analysis = 'کۆنتڕۆڵکردنی ناوەڕاستی تەختەکە: هاوسەنگییەکی بێوێنە لە نێوان بەرگری و سوپای پێشڕەودا دروست دەکات!';
        }
        msg = `🧠 زیرەکیی بێ‌وێنەی ڕێبەر: [${textSrc} ➔ ${textDest}] | ${analysis}`;
      } else if (lang === 'AR') {
        let analysis = 'تحليل تكتيكي: حركة استراتيجية ممتازة توفر توازناً رائعاً في السيطرة.';
        if (isJump) {
          analysis = 'فرصة هجومية خارقة: التهام قطعة الخصم وإخراج توازنه الدفاعي عن مساره! ⚔️';
        } else if (isKing) {
          analysis = 'توظيف قوة الملك المذهلة: فرض السيطرة الكاملة على رقعة اللعب وتطويق هجماتهم! 👑';
        } else {
          analysis = 'تأمين الممرات الحيوية: تصرف تكتيكي يمنع هجمات الخصم المفاجئة من الأطراف!';
        }
        msg = `🧠 ذكاء المدرب الخارق: [${textSrc} ➔ ${textDest}] | ${analysis}`;
      } else {
        let analysis = 'Tactical masterpiece: This step secures vital central squares with optimized defense.';
        if (isJump) {
          analysis = 'Lethal strike: Deliver a crushing blow to their ranks and capture their defensive unit! ⚔️';
        } else if (isKing) {
          analysis = 'Emperor\'s rule: Elevate your King to dominate critical corridors and seal the game! 👑';
        } else {
          analysis = 'Positional control: Crafting a precise blockade against future opponent encroachment.';
        }
        msg = `🧠 Master Coach Intelligence: [${textSrc} ➔ ${textDest}] | ${analysis}`;
      }

      setCoachHintMessage(msg);
      if (soundEnabled) {
        try { playSound('move'); } catch(e){}
      }
    } else {
      showNotification(
        lang === 'KU' 
          ? 'هیچ پێشنیارێکی گونجاو لەم شوێنەدا بوونی نییە!' 
          : 'No highly intelligent moves could be computed here!', 
        'info'
      );
    }
  };

  // Create real-time simulation Room Code
  const handleCreateRoom = () => {
    setLobbyError('');
    setLobbySuccess(false);
    
    // Generate randomized code
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(generated);
    setIsLobbySearching(true);
    setOnlineRole('HOST');
    setIsOnlineMatch(true);
  };

  // Join Room with a code
  const handleJoinRoom = () => {
    if (!typedRoomCode || typedRoomCode.length < 4) {
      setLobbyError(lang === 'KU' ? 'کۆدەکە نادروستە!' : lang === 'AR' ? 'الرمز غير صالح!' : 'Invalid code!');
      return;
    }
    setLobbyError('');
    setIsLobbySearching(true);
    setLobbySuccess(false);
    setRoomCode(typedRoomCode);
    setOnlineRole('GUEST');
    setIsOnlineMatch(true);

    try {
      const bc = new BroadcastChannel('dama_multiplayer_channel');
      // Broadcast peer join request
      bc.postMessage({
        type: 'PEER_JOIN_REQUEST',
        roomCode: typedRoomCode,
        guestUser: currentUser ? currentUser.username : (lang === 'KU' ? 'مێوانی کاتی' : 'Guest Player')
      });
      bc.close();
    } catch (e) {}
    
    // Timeout fallback: If no matching host responds within 6 seconds, warn user
    setTimeout(() => {
      setIsLobbySearching((currentSearching) => {
        if (currentSearching) {
          setLobbyError(lang === 'KU' 
            ? 'داوای بەستنەوە سەرکەوتوو نەبوو! دڵنیابە کە هاوڕێکەت ژووری دروستکردووە لە هەمان برۆوسەر/مۆبایل.' 
            : 'Connection request timed out! Make sure your partner created a room first on the same browser context.');
          return false;
        }
        return currentSearching;
      });
    }, 6000);
  };

  // Explicitly simulate player joining (keeps backward compatibility)
  const triggerPeerConnectionSim = () => {
    setIsLobbySearching(false);
    setLobbySuccess(true);
    if (soundEnabled) {
      try { playSound('win'); } catch(e){}
    }
  };

  const handleAcceptIncomingInvite = () => {
    if (!incomingInvite) return;
    setRoomCode(incomingInvite.roomCode);
    setOnlineRole('GUEST');
    setLobbySuccess(true);
    
    try {
      const bc = new BroadcastChannel('dama_multiplayer_channel');
      bc.postMessage({
        type: 'USERNAME_INVITE_ACCEPT',
        roomCode: incomingInvite.roomCode,
        senderUsername: incomingInvite.sender,
        acceptorUsername: currentUser?.username || 'Guest Player'
      });
      bc.close();
    } catch(e) {}

    showNotification(lang === 'KU' ? `داواکاریەکە قبوڵ کرا! بەیەکەوە بەسترانەوە 🎉` : `Invite accepted! Connected 🎉`, 'success');
    
    // Game starts in 1.2s
    const rivalName = incomingInvite.sender;
    setIncomingInvite(null);

    setTimeout(() => {
      const myName = currentUser ? currentUser.username : 'یاریزان ٢';
      setPlayer1Name(`${rivalName} 🔵`);
      setPlayer2Name(`${myName} (You) 🔴`);
      setMode('FRIEND');
      setIsOnlineMatch(true);
      setScreen('PLAYING');
      handleFullReset();
    }, 1200);
  };

  const handleSendInviteToUser = (targetProfile: UserProfile) => {
    if (!currentUser) {
      showNotification(lang === 'KU' ? 'تکایە سەرەتا بچۆ ژوورەوە!' : 'Please log in first!', 'error');
      return;
    }
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(generated);
    setOnlineRole('HOST');
    setIsLobbySearching(true);
    setLobbySuccess(false);

    try {
      const bc = new BroadcastChannel('dama_multiplayer_channel');
      bc.postMessage({
        type: 'USERNAME_INVITE_SEND',
        targetUsername: targetProfile.username,
        senderUsername: currentUser.username,
        roomCode: generated
      });
      bc.close();
    } catch (e) {}

    showNotification(lang === 'KU' ? `ناردنی بانگهێشت بۆ @${targetProfile.username} سەرکەوتووبوو! ⚔️` : `Challenged @${targetProfile.username}! ⚔️`, 'info');
  };

  const handleStartLobbyMatch = () => {
    // If user has insufficient tokens, warn them
    if (currentUser && currentUser.tokens < 10) {
      alert(lang === 'KU' ? 'تۆکنی پێویستت نییە بۆ یاریکردن! لانی کەم پێویستت بە ١٠ تۆکنە.' : 'Insufficient tokens! You need at least 10 tokens to play.');
      return;
    }

    // Assign names
    const myName = currentUser ? currentUser.username : (lang === 'KU' ? 'کۆسرەت' : 'Kosret');
    setPlayer1Name(`${myName} (${lang === 'KU' ? 'تۆ' : 'You'})`);
    setPlayer2Name(lang === 'KU' ? 'هاوڕێی میوان 👤' : 'Guest Friend 👤');
    
    // Deduct 10 tokens up front (if won they will get 20 back: meaning net +10 tokens)
    if (currentUser) {
      const updatedTokens = Math.max(0, currentUser.tokens - 10);
      const updatedUser = { ...currentUser, tokens: updatedTokens };
      setCurrentUser(updatedUser);

      // Sync upfront deduction to Cloudflare D1
      fetch(`${BACKEND_URL}/api/game/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          isWinner: false
        })
      }).then(res => res.json())
        .then((data: any) => {
          if (data.success && typeof data.newTokens === 'number') {
            setCurrentUser(prev => prev ? { ...prev, tokens: data.newTokens } : null);
          }
        }).catch(err => console.error("Error syncing upfront token deduction:", err));
    }

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
          <div className="flex items-center space-x-2 space-x-reverse ml-2">
            {currentUser ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-1.5 space-x-reverse bg-gradient-to-r from-amber-500/15 to-yellow-500/5 hover:from-amber-500/25 border border-amber-500/40 px-3 py-1 rounded-full text-[11px] font-black text-amber-300 transition-all select-none active:scale-95"
              >
                <span>👤 {currentUser.username}</span>
                <span className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px] text-yellow-200">
                  {currentUser.tokens} 🪙
                </span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-1 space-x-reverse bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 py-1 px-3.5 rounded-full text-[10px] font-black transition-all active:scale-95 cursor-pointer"
              >
                <span>👤 {lang === 'KU' ? 'چوونەژوورەوە' : lang === 'AR' ? 'الدخول' : 'Sign In'}</span>
              </button>
            )}

            {currentUser?.is_admin && (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="p-1 px-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-full text-[10px] font-black text-red-300 transition-all active:scale-95 cursor-pointer flex items-center space-x-1 space-x-reverse"
              >
                <Shield className="w-3 h-3 text-red-400" />
                <span>ADMIN</span>
              </button>
            )}
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
              <h1 
                onClick={() => {
                  setTitleClicks(prev => {
                    const next = prev + 1;
                    if (next === 5) {
                      showNotification('٢ کلیکی تر بۆ کردنەوەی پانێڵەکە دابگرە 🔑', 'info');
                    } else if (next === 6) {
                      showNotification('١ کلیکی تر ماوە 🚀', 'info');
                    } else if (next >= 7) {
                      setShowAdminBypass(true);
                      return 0;
                    }
                    return next;
                  });
                }}
                className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-xl py-2 font-sans tracking-tight cursor-pointer select-none active:scale-95 transition-transform"
              >
                {dict.TITLE}
              </h1>
            </div>

            {/* Direct Play Action Modules - Beautiful Upgrade (More Compact and Sleek) */}
            <div className="w-full space-y-3 shrink-0" dir={isRtl ? 'rtl' : 'ltr'}>
              <button
                onClick={() => {
                  setMode('AI');
                  setScreen('SETUP_AI');
                }}
                className="relative group w-full flex items-center justify-center min-h-[72px] p-4 bg-black/45 hover:bg-black/65 border border-cyan-500/30 hover:border-cyan-400 rounded-xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-sm overflow-hidden cursor-pointer text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Icon wrapper - pinned absolutely to the right side */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-cyan-950/80 border border-cyan-400/40 rounded-lg text-cyan-400 group-hover:scale-105 group-hover:bg-cyan-400 group-hover:text-slate-900 transition-all duration-300 shrink-0 select-none">
                  <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Subtext/Main text - beautifully centered and offset to prevent clashing */}
                <div className="px-16 sm:px-20 w-full text-center flex flex-col items-center justify-center">
                  <p className="text-sm sm:text-base font-black text-white drop-shadow-md leading-tight">{dict.PLAY_AI}</p>
                  <p className="text-[10px] text-white/50 tracking-wide mt-1 leading-none">{dict.EASY} • {dict.MEDIUM} • {dict.HARD}</p>
                </div>

                {/* Chevron ornament - pinned absolutely to the left side */}
                <ChevronRight className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors pointer-events-none ${isRtl ? '' : 'rotate-180'}`} />
              </button>

              <button
                onClick={() => {
                  setMode('FRIEND');
                  setScreen('SETUP_FRIEND');
                }}
                className="relative group w-full flex items-center justify-center min-h-[72px] p-4 bg-black/45 hover:bg-black/65 border border-indigo-500/30 hover:border-indigo-400 rounded-xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-sm overflow-hidden cursor-pointer text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                {/* Icon wrapper - pinned absolutely to the right side */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-indigo-950/80 border border-indigo-400/40 rounded-lg text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-400 group-hover:text-slate-900 transition-all duration-300 shrink-0 select-none">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Subtext/Main text - beautifully centered and offset */}
                <div className="px-16 sm:px-20 w-full text-center flex flex-col items-center justify-center">
                  <p className="text-sm sm:text-base font-black text-white drop-shadow-md leading-tight">{dict.PLAY_FRIEND}</p>
                  <p className="text-[10px] text-white/50 tracking-wide mt-1 leading-none">Local Pass & Play</p>
                </div>

                {/* Chevron ornament - pinned absolutely to the left side */}
                <ChevronRight className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-hover:text-indigo-400 transition-colors pointer-events-none ${isRtl ? '' : 'rotate-180'}`} />
              </button>

              {/* ONLINE LOBBY SYSTEM BUTTON */}
              {import.meta.env.VITE_ENABLE_ONLINE === 'show' && (
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setShowAuthModal(true);
                      return;
                    }
                    setScreen('LOBBY');
                    handleCreateRoom(); // Prepare dummy host room key instantly
                  }}
                  className="relative group w-full flex items-center justify-center min-h-[72px] p-4 bg-gradient-to-r from-amber-950/30 to-yellow-950/20 hover:from-amber-950/50 hover:to-yellow-950/30 border border-yellow-600/35 hover:border-yellow-400 rounded-xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-sm overflow-hidden cursor-pointer text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Icon wrapper - pinned absolutely to the right side */}
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-amber-950 border border-amber-500/40 rounded-lg text-amber-400 group-hover:scale-105 group-hover:bg-amber-550 group-hover:text-amber-950 transition-all duration-300 shrink-0 select-none">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                  </span>

                  {/* Subtext/Main text - beautifully centered and offset */}
                  <span className="px-16 sm:px-20 w-full text-center flex flex-col items-center justify-center block">
                    <p className="text-sm sm:text-base font-black text-amber-200 drop-shadow-md leading-tight">{(dict as any).LOBBY_ROOM}</p>
                    <p className="text-[10px] text-amber-200/50 tracking-wide mt-1 leading-none">Online Matchmaking & Lobby</p>
                  </span>

                  {/* Chevron ornament - pinned absolutely to the left side */}
                  <ChevronRight className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/30 group-hover:text-amber-400 transition-colors pointer-events-none ${isRtl ? '' : 'rotate-180'}`} />
                </button>
              )}
            </div>

            {/* Theme & Skins Dashboard Frame */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5 backdrop-blur-md shrink-0">
              <div className="space-y-3">
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
                    { key: 'KURDISH_WOOD', label: (dict as any).THEME_KURDISH_WOOD, color: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-700 via-amber-800 to-amber-950 border border-amber-600' },
                    { key: 'GOLD_BLACK', label: lang === 'KU' ? 'مێکس گۆڵد/ڕەش 🪙' : lang === 'AR' ? 'ذهبي وأسود 🪙' : 'Gold & Black 🪙', color: 'bg-gradient-to-r from-yellow-500 to-black' },
                    { key: 'BLUE_BROWN', label: lang === 'KU' ? 'شین و قاوەیی 💙' : lang === 'AR' ? 'أزرق وبني 💙' : 'Blue & Brown 💙', color: 'bg-sky-400 border border-amber-800' },
                    { key: 'TOKYO_NEON', label: lang === 'KU' ? 'تۆکیۆ نیۆن 🌆' : lang === 'AR' ? 'طوكيو نيون 🌆' : 'Tokyo Neon 🌆', color: 'bg-purple-600 border border-cyan-400' },
                    { key: 'COSMIC_VOID', label: lang === 'KU' ? 'بۆشایی کەت 🌌' : lang === 'AR' ? 'الفضاء الكوني 🌌' : 'Cosmic Void 🌌', color: 'bg-indigo-950 border border-fuchsia-400' }
                  ] as const).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTheme(t.key)}
                      className={`flex items-center space-x-2 space-x-reverse p-2.5 rounded-xl border text-[10px] sm:text-xs font-black transition-all ${
                        theme === t.key 
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10' 
                          : 'bg-black/20 border-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${t.color}`} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Piece design Flag selector */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <div className="flex items-center space-x-2 space-x-reverse text-emerald-400">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-black text-sm">
                    {lang === 'KU' ? 'ئاڵا و ڕووبەڕووبوونەوەی بەردەکان ⚔️' : lang === 'AR' ? 'تصميم ومواجهات الأحجار ⚔️' : 'Piece Matchups & Styles ⚔️'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {([
                    { key: 'CLASSIC', label: lang === 'KU' ? 'کلاسیک شین/سپی' : lang === 'AR' ? 'كلاسيك أزرق/أبيض' : 'Classic Blue/White', flag: '🔵⚪' },
                    { key: 'KURD_IRAQ', label: lang === 'KU' ? 'کوردستان ضد عێراق' : lang === 'AR' ? 'كردستان ضد العراق' : 'Kurd vs Iraq ☀️', flag: '☀️🇮🇶' },
                    { key: 'IRAN_USA', label: lang === 'KU' ? 'ئێران ضد ئەمریکا' : lang === 'AR' ? 'إيران ضد أمريكا' : 'Iran vs USA 🇺🇸', flag: '🇮🇷🇺🇸' },
                    { key: 'IRAQ_KURD', label: lang === 'KU' ? 'عێراق ضد کوردستان' : lang === 'AR' ? 'العراق ضد كردستان' : 'Iraq vs Kurd ☀️', flag: '🇮🇶☀️' },
                    { key: 'USA_IRAQ', label: lang === 'KU' ? 'ئەمریکا ضد عێراق' : lang === 'AR' ? 'أمريكا ضد العراق' : 'USA vs Iraq 🇮🇶', flag: '🇺🇸🇮🇶' },
                    { key: 'BLACK_WHITE', label: lang === 'KU' ? 'ڕەش × سپی 🖤' : lang === 'AR' ? 'أسود ضد أبيض 🖤' : 'Black vs White 🖤', flag: '🖤🤍' },
                    { key: 'BLUE_BLACK', label: lang === 'KU' ? 'شین × ڕەش 💙' : lang === 'AR' ? 'أزرق ضد أسود 💙' : 'Blue vs Black', flag: '💙🖤' },
                    { key: 'GOLD_BLACK', label: lang === 'KU' ? 'گۆڵد × ڕەش 🪙' : lang === 'AR' ? 'ذهبي ضد أسود 🪙' : 'Gold vs Black', flag: '🪙🖤' },
                    { key: 'WHITE_RED', label: lang === 'KU' ? 'سپی × سور 🤍' : lang === 'AR' ? 'أبيض ضد أحمر 🤍' : 'White vs Red ❤️', flag: '🤍❤️' },
                    { key: 'ORANGE_GREEN', label: lang === 'KU' ? 'پرتەقاڵی × سەوز 🧡' : lang === 'AR' ? 'برتقالي ضد أخضر 🧡' : 'Orange vs Green', flag: '🧡💚' }
                  ] as const).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setPieceFlag(f.key)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-[10px] sm:text-xs font-black transition-all ${
                        pieceFlag === f.key 
                          ? 'bg-emerald-500/10 border-emerald-400 text-white shadow-md shadow-emerald-550/10' 
                          : 'bg-black/20 border-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{f.label}</span>
                      <span className="text-sm font-normal select-none shrink-0 ml-1">{f.flag}</span>
                    </button>
                  ))}
                </div>
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
                className="relative group flex flex-col items-center justify-center p-4 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-cyan-400/50 rounded-3xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-3 bg-white/5 border border-white/5 rounded-2xl group-hover:bg-cyan-500/20 group-hover:border-cyan-400/30 transition-all duration-300 mb-2">
                  <BookOpen className="w-6 h-6 text-cyan-400/70 group-hover:text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="relative text-white/70 group-hover:text-white font-bold text-sm tracking-wide">{lang === 'KU' ? 'یاساکان' : lang === 'AR' ? 'القوانين' : 'Rules'}</span>
              </button>

              <button
                onClick={() => setScreen('POLICY_PAGE')}
                className="relative group flex flex-col items-center justify-center p-4 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-rose-400/50 rounded-3xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.15)] overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-rose-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-3 bg-white/5 border border-white/5 rounded-2xl group-hover:bg-rose-500/20 group-hover:border-rose-400/30 transition-all duration-300 mb-2">
                  <ShieldAlert className="w-6 h-6 text-rose-400/70 group-hover:text-rose-400 group-hover:scale-110 transition-transform" />
                </div>
                <span className="relative text-white/70 group-hover:text-white font-bold text-sm tracking-wide">{lang === 'KU' ? 'سیاسەت' : lang === 'AR' ? 'الخصوصية' : 'Policy'}</span>
              </button>
            </div>

            {/* Design & Programming (About Section) Trigger Button with Golden Flame */}
            <button
              onClick={() => setScreen('ABOUT')}
              className="w-full relative group flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent hover:from-amber-500/20 hover:via-yellow-500/10 border border-amber-500/35 hover:border-amber-400 rounded-2xl backdrop-blur-xl transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.08)] overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center space-x-3.5 space-x-reverse pr-1">
                <div className="p-3 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-400 group-hover:scale-105 transition-all duration-300">
                  <Sparkles size={18} className="animate-pulse" />
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-amber-200 group-hover:text-amber-400 transition-colors">
                    {lang === 'KU' ? 'دیزاین و پرۆگرام سازی 👑' : lang === 'AR' ? 'التصميم والبرمجة 👑' : 'Design & Programming 👑'}
                  </p>
                  <p className="text-[10px] text-amber-200/50 tracking-wide mt-0.5 font-bold">کۆسرەت مامە ئەحمەد • Kosrat Mama Ahmed</p>
                </div>
              </div>
              <ChevronLeft size={18} className="text-amber-400/65 group-hover:text-amber-400 transition-colors group-hover:-translate-x-1 duration-300" />
            </button>

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
                  className="w-full max-w-md bg-gradient-to-r from-amber-955 via-yellow-950 to-amber-955 border border-amber-400/40 rounded-2xl p-3 text-center text-xs text-amber-100 shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-center justify-center space-x-2 space-x-reverse z-30 font-sans"
                >
                  <span className="text-base">💡</span>
                  <span className="font-bold leading-relaxed">{coachHintMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Bar: Timer, AI level pill, and AI Hint control in active play */}
            <div className="w-full flex justify-between items-center px-2 shrink-0 select-none z-20">
              <div className="flex items-center space-x-1.5 space-x-reverse">
                <div className="flex items-center space-x-1.5 space-x-reverse bg-black/40 border border-white/5 py-1 px-3 rounded-full text-xs font-bold text-white">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-mono">{formatTime(seconds)}</span>
                </div>

                {mode === 'AI' && (
                  <div className={`hidden sm:flex items-center space-x-1.5 space-x-reverse border py-1 px-3 rounded-full text-[10px] font-black select-none transition-all duration-300 ${
                    difficulty === 'EASY' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : difficulty === 'MEDIUM'
                      ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                      : difficulty === 'HARD'
                      ? 'bg-amber-500/10 border-amber-500/20 text-yellow-300'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)] animate-pulse'
                  }`}>
                    <Cpu className="w-3 h-3 text-current" />
                    <span>
                      {lang === 'KU' ? 'ئاستم:' : lang === 'AR' ? 'المستوى:' : 'Level:'} {
                        difficulty === 'EASY' ? dict.EASY :
                        difficulty === 'MEDIUM' ? dict.MEDIUM :
                        difficulty === 'HARD' ? dict.HARD :
                        dict.EXPERT
                      }
                    </span>
                  </div>
                )}
              </div>
              
              <button
                disabled={coachHintsLeft <= 0}
                onClick={handleGetCoachHint}
                className={`flex items-center space-x-1.5 space-x-reverse border px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.2)] cursor-pointer ${
                  coachHintsLeft <= 0 
                  ? 'bg-slate-800/45 border-slate-700/50 text-slate-500 cursor-not-allowed opacity-55' 
                  : 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/50 hover:border-amber-300 text-amber-200 hover:text-white'
                }`}
              >
                <span>
                  {lang === 'KU' 
                    ? `ئامۆژگاری زیرەک 💡 (${coachHintsLeft}/5)` 
                    : lang === 'AR' 
                    ? `إرشاد ذكي 💡 (${coachHintsLeft}/5)` 
                    : `Smart Hint 💡 (${coachHintsLeft}/5)`}
                </span>
              </button>
            </div>

            {/* Top Avatar (Player 2 / White / Opponent / AI) - Styled to reflect White stone color */}
            <div className="w-full flex items-center justify-center gap-2 sm:gap-4 relative select-none">
              {/* Speech Bubble for P2 */}
              <AnimatePresence>
                {chatMessage?.sender === 'WHITE' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute bottom-16 bg-gradient-to-br from-stone-900 to-amber-950 border border-amber-500/30 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl shadow-xl z-50 flex items-center space-x-1 max-w-[200px]"
                  >
                    <span>{chatMessage.text}</span>
                    <div className="absolute left-[50%] -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-stone-900 border-r border-b border-amber-500/30 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
 
              {/* AI Badge Details Card with corresponding Turn Glow */}
              <div className={`px-3.5 py-2 rounded-2xl border-2 transition-all duration-300 flex items-center space-x-2.5 sm:space-x-3.5 space-x-reverse ${
                gameState.turn === 'WHITE' && !gameState.winner
                  ? 'bg-white/10 border-white shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-105' 
                  : 'bg-black/20 border-transparent opacity-80'
              }`}>
                <div className={`text-3xl sm:text-4xl ${gameState.turn === 'WHITE' && !gameState.winner ? 'animate-bounce' : ''}`}>👴🏽</div>
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-bold text-white/50 block select-none">
                    {lang === 'KU' ? 'زیرەکی دەستکرد 🤖' : lang === 'AR' ? 'الذكاء الاصطناعي 🤖' : 'Artificial Intelligence 🤖'}
                  </span>
                  <p className="font-black text-md sm:text-lg text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.65)] leading-tight mt-0.5">{p2}</p>
                </div>
              </div>

              {/* AI Eaten Stones (Cyan stones eaten by the AI) - Aligned nicely in a small row next to it */}
              <div className="flex flex-col items-start gap-0.5 p-2 bg-cyan-950/25 border border-cyan-400/10 rounded-xl max-w-[130px] shrink-0">
                <span className="text-[8px] sm:text-[9px] font-black text-cyan-300/60 uppercase select-none">
                  {lang === 'KU' ? `خواراوە (x${whiteCaptures})` : `Eaten (x${whiteCaptures})`}
                </span>
                <div className="flex flex-wrap gap-[3px] max-w-[85px] justify-start content-center">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border transition-all duration-300 ${
                        i < whiteCaptures 
                          ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_4px_rgba(34,211,238,0.7)] scale-100 animate-pulse' 
                          : 'bg-stone-800/40 border-cyan-500/5 scale-75 opacity-10'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>
 
            {/* Playable Checkers board area */}
            <div className="w-full flex justify-center flex-none">
              <Board 
                gameState={gameState} 
                dispatch={dispatch} 
                theme={theme} 
                disabled={
                  (mode === 'AI' && gameState.turn === 'WHITE') ||
                  (isOnlineMatch && (
                    (onlineRole === 'HOST' && gameState.turn !== 'CYAN') ||
                    (onlineRole === 'GUEST' && gameState.turn !== 'WHITE')
                  ))
                }
                p1Name={p1}
                p2Name={p2}
                onRestart={handleFullReset}
                onGoHome={() => setScreen('HOME')}
                lang={lang}
                coachHintSource={coachHintSource}
                coachHintDest={coachHintDest}
                pieceStyle={pieceFlag}
              />
            </div>
 
            {/* Bottom Avatar (Player 1 / Cyan / User) - Styled with Cyan color to match Cyan stones and Skilled Avatar 🥷🏽 */}
            <div className="w-full flex items-center justify-center gap-2 sm:gap-4 relative select-none">
              {/* Speech Bubble for P1 */}
              <AnimatePresence>
                {chatMessage?.sender === 'CYAN' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    className="absolute top-16 bg-gradient-to-br from-cyan-900 to-indigo-950 border border-cyan-400/30 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl shadow-xl z-50 flex items-center space-x-1 max-w-[200px]"
                  >
                    <span>{chatMessage.text}</span>
                    <div className="absolute left-[50%] -top-1.5 -translate-x-1/2 w-3 h-3 bg-indigo-950 border-l border-t border-cyan-400/30 rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
 
              {/* User Badge Details Card with corresponding Turn Glow */}
              <div className={`px-3.5 py-2 rounded-2xl border-2 transition-all duration-300 flex items-center space-x-2.5 sm:space-x-3.5 space-x-reverse ${
                gameState.turn === 'CYAN' && !gameState.winner
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] scale-105' 
                  : 'bg-black/20 border-transparent opacity-80'
              }`}>
                <div className={`text-3xl sm:text-4xl ${gameState.turn === 'CYAN' && !gameState.winner ? 'animate-bounce' : ''}`}>🥷🏽</div>
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-bold text-cyan-400/60 block select-none">
                    {lang === 'KU' ? 'بەکارهێنەر 👤' : lang === 'AR' ? 'المستخدم 👤' : 'User 👤'}
                  </span>
                  <p className="font-black text-md sm:text-lg text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.65)] leading-tight mt-0.5">{p1}</p>
                </div>
              </div>

              {/* User Eaten Stones (White stones eaten by the User) - Aligned nicely in a small row next to it */}
              <div className="flex flex-col items-start gap-0.5 p-2 bg-stone-900/40 border border-stone-100/10 rounded-xl max-w-[130px] shrink-0">
                <span className="text-[8px] sm:text-[9px] font-black text-stone-300/60 uppercase select-none">
                  {lang === 'KU' ? `خواراوە (x${cyanCaptures})` : `Eaten (x${cyanCaptures})`}
                </span>
                <div className="flex flex-wrap gap-[3px] max-w-[85px] justify-start content-center">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border transition-all duration-300 ${
                        i < cyanCaptures 
                          ? 'bg-slate-100 border-white shadow-[0_0_4px_rgba(255,255,255,0.7)] scale-100 animate-pulse' 
                          : 'bg-stone-800/40 border-white/5 scale-75 opacity-10'
                      }`} 
                    />
                  ))}
                </div>
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
            className="z-10 flex flex-col w-full max-w-md px-6 pt-4 space-y-6 shrink-0 relative text-right"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center space-x-4 space-x-reverse mb-2 justify-start">
              <button 
                onClick={() => setScreen('HOME')} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-colors cursor-pointer text-white"
              >
                <ChevronRight className={`w-5 h-5`} />
              </button>
              <h2 className="text-3xl font-black text-amber-400">{(dict as any).LOBBY_ROOM} 🌐</h2>
            </div>

            {/* Main Interactive Panel */}
            <div className="bg-black/40 border border-white/10 p-5 rounded-3xl space-y-5 backdrop-blur-xl">
              <div className="text-right space-y-1">
                <p className="text-xs tracking-wider text-cyan-400 uppercase font-black">
                  {lang === 'KU' ? 'لۆبی و ململانێی ڕاستەقینە' : 'Lobby & Matchmaking'}
                </p>
                <p className="text-xs text-white/60 leading-relaxed font-bold">
                  {lang === 'KU' 
                    ? 'ڕووبەری پێک بەستنی راستەوخۆی یاریزانان لە ڕێگەی کۆدی تایبەت یان ناردنی بانگهێشتی ڕاستەوخۆ' 
                    : 'Establish cross-player direct connections using shared room invite codes.'}
                </p>
              </div>

              {/* Box 1: Host Room */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-amber-300 block text-right">
                  {lang === 'KU' ? '١. ژوور دروست بکە و کۆد بۆ هاوڕێکەت بنێرە:' : '1. Create Room & Share Code:'}
                </span>

                <p className="text-[11px] text-white/50 leading-relaxed leading-normal font-medium text-right bg-white/5 p-2 rounded-lg">
                  💡 {lang === 'KU' 
                    ? 'ئەم کۆدەی خوارەوە بۆ برادەرەکەت بنێرە تاوەکو لە مۆبایلەکەی خۆی لە بەشی چوونەژوور بنووسێت.' 
                    : 'Send the code below to your friend to write in their enter section.'}
                </p>

                <div className="flex items-center justify-between bg-black/30 border border-white/10 p-3 rounded-xl">
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block font-mono">Room Invite Code</span>
                    <span className="text-2xl font-black text-cyan-300 font-mono tracking-widest">{roomCode || '----'}</span>
                  </div>
                  {roomCode && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomCode);
                        showNotification(lang === 'KU' ? 'کۆدەکە کۆپی کرا! 📋' : 'Code copied to clipboard!', 'info');
                      }}
                      className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-black active:scale-95 cursor-pointer font-sans"
                    >
                      {lang === 'KU' ? 'کۆپیکردن' : 'Copy'}
                    </button>
                  )}
                </div>

                {isLobbySearching ? (
                  <div className="flex flex-col items-center space-y-2.5 justify-center py-3 bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-xl mt-1">
                    <div className="flex items-center space-x-2 space-x-reverse text-xs text-cyan-300 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>{lang === 'KU' ? 'چاوەڕێی هاوڕێتین بۆ بەستنەوە...' : 'Waiting for opponent to connect...'}</span>
                    </div>
                  </div>
                ) : lobbySuccess ? (
                  <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-xl text-center space-y-2 animate-bounce">
                    <p className="text-xs text-emerald-300 font-bold">
                      🎉 {lang === 'KU' ? 'قبوڵ کرا! یاری دەستپێدەکات...' : 'Accepted! Game is starting...'}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateRoom}
                    className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 py-2.5 text-xs font-black text-amber-200 rounded-xl active:scale-95 transition-all cursor-pointer"
                  >
                    {lang === 'KU' ? 'دروستکردنی ژووری نوێ' : 'Generate Room Code'}
                  </button>
                )}
              </div>

              {/* Box 2: Join Room */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-cyan-300 block text-right">
                  {lang === 'KU' ? '٢. چوونەژوورە بە نووسینی کۆد:' : '2. Enter Shared Invite Code:'}
                </span>

                <p className="text-[11px] text-white/50 leading-relaxed font-medium text-right">
                  📋 {lang === 'KU' 
                    ? 'کۆدەکە لە هاوڕێکەت وەربگرە لێرە بینووسە بۆ دەستپێکردنی ململانێ.' 
                    : 'Get the invite code from your partner and enter it below.'}
                </p>

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
                    className={`px-5 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-35 disabled:pointer-events-none ${
                      typedRoomCode.length < 4 || isLobbySearching
                        ? 'bg-white/5 text-white/40 border border-white/5'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)] font-black animate-pulse hover:animate-none'
                    }`}
                  >
                    {lang === 'KU' ? 'پێک بەستن' : 'Connect'}
                  </button>
                </div>

                {lobbyError && (
                  <p className="text-xs text-rose-400 text-center font-bold">{lobbyError}</p>
                )}
              </div>

              {/* Box 3: Registered Online Users challenge - highly realistic */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-indigo-300 block text-right">
                  {lang === 'KU' ? '٣. مەکۆی یاریزانانی بەردەست:' : '3. Registered Challenger Circle:'}
                </span>

                {registeredUsers.length === 0 ? (
                  <p className="text-[10px] text-white/40 text-center py-2">
                    {lang === 'KU' ? 'هیچ یاریزانێکی تر لەم ئامێرە/مەکۆیە تۆمار نەکراوە.' : 'No other players registered on this server.'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {registeredUsers.map((p) => (
                      <div 
                        key={p.id}
                        className="flex items-center justify-between bg-black/30 border border-white/5 p-2 rounded-xl text-xs"
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="text-lg">⚔️</span>
                          <div className="text-right">
                            <span className="font-black text-slate-100 block">@{p.username}</span>
                            <span className="text-[9px] text-cyan-400/80 font-bold">🪙 {p.tokens} {lang === 'KU' ? 'تۆکن' : 'Tokens'}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSendInviteToUser(p)}
                          className="bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 hover:text-white py-1 px-3 rounded-lg text-[10px] font-black transition-all active:scale-90 cursor-pointer"
                        >
                          {lang === 'KU' ? 'بانگهێشت ⚔️' : 'Invite ⚔️'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Peer-to-peer simulator guidelines */}
            <div className="text-[11px] text-white/40 leading-relaxed text-right font-medium bg-white/5 border border-white/5 rounded-2xl p-3.5">
              <span>⚡ {lang === 'KU' ? 'لیستی بەستراوەیی کڵاودی یاریەکە کارایە بە تەواوی لە رێگەی گێڕانەوەی ڕوندە کورتەکانی کڵاودفلێر.' : 'Standard direct peer-to-peer messaging channel built over low-latency server relays.'}</span>
            </div>
          </motion.div>
        )}

        {screen === 'ABOUT' && (
          <AboutPage onBack={handleNavigateBack} lang={lang} />
        )}
      </AnimatePresence>

      {/* Auto Matchmaking Overlay */}
      <AnimatePresence>
        {showAutoMatch && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm border border-indigo-500/30 bg-black/50 p-6 rounded-3xl space-y-6 text-center shadow-[0_0_50px_rgba(99,102,241,0.15)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
              
              <div className="space-y-2 relative z-10">
                <Globe className="w-10 h-10 text-indigo-400 mx-auto animate-spin" style={{ animationDuration: '3s' }} />
                <h3 className="text-xl font-black text-indigo-300">
                  {lang === 'KU' ? 'گەڕان بۆ یاریزان...' : 'Matching Players...'}
                </h3>
              </div>
              
              <div className="space-y-3 relative z-10">
                {foundPlayers.length === 0 ? (
                  <p className="text-[11px] text-white/50 font-bold animate-pulse">
                    {lang === 'KU' ? 'پشکنینی سێرڤەری گشتی...' : 'Scanning global servers...'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[150px] overflow-hidden">
                    <AnimatePresence>
                      {foundPlayers.map(fp => (
                        <motion.div
                          key={fp.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex items-center space-x-3 space-x-reverse bg-white/5 border p-2.5 rounded-xl ${
                            autoMatchTarget === fp.id ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-lg flex items-center justify-center">
                            {fp.avatar}
                          </div>
                          <div className="flex-1 text-right">
                            <p className="text-sm font-black text-white">{fp.name}</p>
                            <p className="text-[10px] text-emerald-400 font-bold">زیندووە (لە خەتە)</p>
                          </div>
                          {autoMatchTarget === fp.id && (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowAutoMatch(false)}
                className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 py-3 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer relative z-10"
              >
                {lang === 'KU' ? 'پەشیمان بوونەوە' : 'Cancel'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Incoming Challenge Modal */}
      <AnimatePresence>
        {incomingInvite && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-sm bg-[#0C0C0E] border-2 border-cyan-400/40 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(34,211,238,0.25)] relative text-white space-y-5"
              dir="rtl"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto">
                <span className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>⚔️</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-cyan-300">داواکاری یاری ئۆنلاین!</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-bold">
                  یاریزان <strong className="text-white text-cyan-400">@{incomingInvite.sender}</strong> دەیەوێت لەگەڵت دەست بە یاری بکات و تۆی بانگهێشت کردووە بە ژووبی {incomingInvite.roomCode}.
                </p>
              </div>

              <div className="flex space-x-2 space-x-reverse pt-2">
                <button
                  onClick={handleAcceptIncomingInvite}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 py-3 rounded-xl font-bold transition-all active:scale-95 cursor-pointer text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                  پەسەندکردن و یاریکردن 🤝
                </button>
                <button
                  onClick={() => setIncomingInvite(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-bold transition-all active:scale-95 cursor-pointer text-xs text-white"
                >
                  ڕەتکردنەوە ✕
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Beautiful Dynamic Toast Notifications Stack */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-4 rounded-2xl shadow-2xl border text-sm font-bold text-white flex items-center justify-between pointer-events-auto backdrop-blur-xl ${
                t.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-500/30 shadow-emerald-950/25'
                  : t.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/30 shadow-rose-950/25'
                  : 'bg-indigo-950/90 border-indigo-500/30'
              }`}
            >
              <span>{t.message}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="mr-3 opacity-60 hover:opacity-100 text-xs font-black p-1 hover:bg-white/5 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Secret Dev/Admin Bypass Modal */}
      <AnimatePresence>
        {showAdminBypass && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[#0E0E0E] border-2 border-amber-500/30 rounded-3xl p-6 space-y-5 text-right shadow-2xl relative text-white"
              dir="rtl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse text-amber-400 font-black text-sm">
                  <Shield className="w-5 h-5 animate-pulse" />
                  <span>پاراستنی کۆنتڕۆڵ و ئەدمین پانێڵ 🔐</span>
                </div>
                <button 
                  onClick={() => {
                    setShowAdminBypass(false);
                    setAdminUser('');
                    setBypassPasscode('');
                  }} 
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-white hover:bg-white/10 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-black text-amber-300">
                  داخڵکردنی پاسکۆدی پارێزراو
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed font-bold">
                  بۆ ڕێگریکردن لە هەر چوونەژوورەوەیەکی نەخوازراو، تکایە یوزەرنەیم و پاسکۆدی تایبەت بە سەرਪەرشتیاری فەرمی (Admin Key) بنووسە:
                </p>
                
                {currentUser ? (
                  <p className="text-xs text-emerald-400 font-bold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20">
                    بەکارهێنەر بۆ بەرزکردنەوە: 👤 <span className="underline font-mono">{currentUser.username}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-rose-400 font-bold bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20 leading-relaxed">
                    تکایە سەرەتا بچۆ ژوورەوە (Sign In) تا بتوانی بەکارهێنەرەکەت بکەیت بە ئەدمین.
                  </p>
                )}

                <div className="relative mt-2 space-y-2">
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="ناوی بەکارهێنەر (Username)..."
                    className="w-full text-center font-mono text-sm py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500/50 transition-all font-bold"
                  />
                  <input
                    type="password"
                    maxLength={32}
                    value={bypassPasscode}
                    onChange={(e) => setBypassPasscode(e.target.value)}
                    placeholder="پاسکۆدی نهێنی (Password)..."
                    className="w-full text-center tracking-widest font-mono text-sm py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-amber-500/50 transition-all font-bold"
                  />
                  <div className="text-[10px] text-slate-400 text-center mt-1.5 font-bold leading-relaxed">
                    تێبینی: پاسوۆرد و یوزەرنەیم لە ڕێگەی Environment Variables (<span className="text-amber-400 font-mono">VITE_ADMIN_USER</span> و <span className="text-amber-400 font-mono">VITE_ADMIN_PASSWORD</span>) جێگیر دەکرێن. نەبوونیان، دەگۆڕێت بۆ دیفاڵت.
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    const expectedUser = import.meta.env.VITE_ADMIN_USER || 'admin';
                    const expectedPass = import.meta.env.VITE_ADMIN_PASSWORD || '778899';
                    
                    if (adminUser === expectedUser && bypassPasscode === expectedPass) {
                      if (currentUser) {
                        const updatedUser = { ...currentUser, is_admin: true };
                        setCurrentUser(updatedUser);
                        localStorage.setItem('dama_current_user_v2', JSON.stringify(updatedUser));
                        
                        // Also make sure it's in local DB
                        const rawUsers = localStorage.getItem('dama_users_db_v2') || '[]';
                        try {
                          let parsedUsers = JSON.parse(rawUsers);
                          if (!Array.isArray(parsedUsers)) parsedUsers = [];
                          const exists = parsedUsers.find((u: any) => u.id === currentUser.id);
                          if (exists) {
                            exists.is_admin = true;
                          } else {
                            parsedUsers.push({ ...currentUser, is_admin: true });
                          }
                          localStorage.setItem('dama_users_db_v2', JSON.stringify(parsedUsers));
                        } catch (e) {}

                        setShowAdminBypass(false);
                        setAdminUser('');
                        setBypassPasscode('');
                        setShowAdminPanel(true);
                        showNotification('پیرۆزە سەرپەرشتیار! ئێستە تۆ تەنها ئەدمینی یارییەکەی 👑', 'success');
                      } else {
                        // Open as temporary guest admin
                        setShowAdminBypass(false);
                        setAdminUser('');
                        setBypassPasscode('');
                        setShowAdminPanel(true);
                        showNotification('پانێڵ کرایەوە وەک ئەدمینی کاتی (میوان) 🛠️', 'info');
                      }
                    } else {
                      showNotification('زانیارییەکانی دەربازبوون هەڵەیە! ❌', 'error');
                    }
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  🚀 پشتڕاستکردنەوە و چوونە ژوورەوە
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Safari iOS PWA Guide Trigger Modal Overlay */}
      <AnimatePresence>
        {showIosPrompt && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 150 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 150 }}
              className="w-full max-w-sm bg-[#0C0C0C] border border-white/10 rounded-3xl p-6 space-y-5 text-right shadow-2xl relative text-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">📲</span>
                <button onClick={() => setShowIosPrompt(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-white hover:bg-white/10 text-sm cursor-pointer">✕</button>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-amber-400">
                  {lang === 'KU' ? 'بەرنامەکە دابەزێنە بۆ ئایفۆن 🍏' : 'Install App on iPhone 🍏'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-bold">
                  {lang === 'KU' 
                    ? 'بۆ ئەوەی بە تەواوی وەک ئەپەکانی تری مۆبایلەکەت کار بکات، لە خوارەوەی وێبگەڕی سەفاری دوگمەی Share (بڵاوکردنەوە) دابگرە، پاشان بژاردەی "Add to Home Screen" (زیادکردن بۆ پۆشەی سەرەتا) هەڵبژێرە.'
                    : 'To enjoy this game as a native mobile app on your iPhone, tap the Share icon on Safari and then click "Add to Home Screen".'}
                </p>
              </div>
              <button 
                onClick={() => setShowIosPrompt(false)} 
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                {lang === 'KU' ? 'تێگەیشتم، زۆر سوپاس' : 'Got it! Thanks'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google Chrome & Android Native App Install prompt banner/button */}
      <AnimatePresence>
        {showChromeInstall && deferredPrompt && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full bg-gradient-to-r from-cyan-950 via-indigo-950 to-slate-950 border border-cyan-500/40 p-4 rounded-2xl flex items-center justify-between gap-4 pointer-events-auto shadow-2xl text-right"
              dir="rtl"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="text-2xl animate-spin text-cyan-400">🤖</div>
                <div>
                  <h4 className="text-sm font-black text-white">{lang === 'KU' ? 'داگرتنی ڕاستەوخۆ' : 'Download Game Directly'}</h4>
                  <p className="text-[10px] text-white/60 mt-0.5">{lang === 'KU' ? 'دابەزاندن وەک ئەپی فەرمی مۆبایل بە خێرایی بەرز' : 'Install as official ultra-fast native application'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <button
                  onClick={async () => {
                    if (deferredPrompt) {
                      deferredPrompt.prompt();
                      const { outcome } = await deferredPrompt.userChoice;
                      if (outcome === 'accepted') {
                        setDeferredPrompt(null);
                        setShowChromeInstall(false);
                      }
                    }
                  }}
                  className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  {lang === 'KU' ? 'داگرتن' : 'Install'}
                </button>
                <button 
                  onClick={() => setShowChromeInstall(false)}
                  className="p-2 text-white/40 hover:text-white/80 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth System Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md relative"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 left-4 z-50 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white font-bold transition-all"
              >
                ✕
              </button>
              <AuthSystem
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                lang={lang}
                onClose={() => setShowAuthModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal Overlay */}
      <AnimatePresence>
        {showAdminPanel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl relative text-right"
            >
              <AdminPanel
                lang={lang}
                onClose={() => {
                  setShowAdminPanel(false);
                  // Refresh currentUser session to apply real-time changes
                  const rawUser = localStorage.getItem('dama_current_user_v2');
                  const rawDB = localStorage.getItem('dama_users_db_v2');
                  if (rawUser && rawDB) {
                    try {
                      const user = JSON.parse(rawUser);
                      const db = JSON.parse(rawDB);
                      const updatedMe = db.find((u: any) => u.id === user.id);
                      if (updatedMe) {
                        setCurrentUser(updatedMe);
                        localStorage.setItem('dama_current_user_v2', JSON.stringify(updatedMe));
                      }
                    } catch (e) {}
                  }
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AFK Loss Notification Overlay */}
      <AnimatePresence>
        {afkLossOccurred && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg text-right select-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="w-full max-w-sm bg-slate-900 border border-rose-500/30 p-6 rounded-3xl space-y-5 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-rose-500 animate-pulse" />
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-400">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-black text-rose-400">
                  {lang === 'KU' ? 'تایم ئاوت! کاتت تەواو بوو ⏰' : lang === 'AR' ? 'انتهى الوقت المحدد لك! ⏰' : 'Match Time Out! ⏰'}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-bold">
                  {lang === 'KU'
                    ? 'لەبەر ئەوەی بەینی جووڵەکانت زیاتر بوو لە ٤ خولەک، یارییەکەت بۆ بەرامبەر دۆڕاند و ١٠ تۆکنت کەم کرایەوە.'
                    : 'Because you remained inactive for more than 4 minutes, you have been forfeited from the match (-10 tokens penalization applied).'}
                </p>
              </div>
              <button
                onClick={() => setAfkLossOccurred(false)}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
              >
                {lang === 'KU' ? 'تێگەیشتم، بگەڕێوە سەرەتا' : 'Okey, Back to home'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
