import React, { useReducer, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { initialGameState, gameReducer } from './store/gameReducer';
import Board from './components/Board';
import InstallPrompt from './components/InstallPrompt';
import { RobotAvatar, KurdishManAvatar } from './components/Avatars';
import { getTokens, saveTokens, addWinTokens, deductLossTokens, claimHourlyTokens, getZeroTokensTime } from './store/tokenStore';
import { Play, Users, Cpu, Settings, Volume2, VolumeX, Home as HomeIcon, RefreshCw, Trophy, AlertCircle, ChevronLeft, Bot, User, Coins, Lightbulb, ShieldCheck, BookOpen, UserCheck } from 'lucide-react';
import { useDropSound } from './useSound';
import { GameMode, Difficulty, BoardTheme, Player } from './types';
import { TRANSLATIONS, Language } from './translations';
import { getAIMove } from './ai';
import MarkdownParser from './components/MarkdownParser';
import AcademyPanel from './components/AcademyPanel';
import PuzzlesPanel from './components/PuzzlesPanel';
import StatsDashboard from './components/StatsDashboard';
import ProfilesModal, { AvatarRenderer } from './components/ProfilesModal';
import { getProfiles, TITLES } from './store/profileStore';
import { handleEndGameStatistics } from './utils/gameMatchManager';
import CampaignPanel, { CAMPAIGN_BOSSES } from './components/CampaignPanel';
import CoachPanel from './components/CoachPanel';
import { PlayStorePoliciesModal, DamaRulesModal, AboutUsPortfolioModal } from './components/ExtraModals';
import AnimatedBackground from './components/AnimatedBackground';
import AISetupModal from './components/AISetupModal';
import { BOT_CAPTURE_COMMENTS, BOT_SHOCKED_COMMENTS } from './data/botComments';
import { App as CapApp } from '@capacitor/app';
import GameHeader from './components/GameHeader';
import HomeView from './components/HomeView';
import PlayingView from './components/PlayingView';
import RulesView from './components/RulesView';
import DhikrNotification from './components/DhikrNotification';

type ScreenType = 'HOME' | 'PLAYING' | 'RULES';


export default function App() {
  const [lang, setLangInternal] = useState<Language>(() => {
    const saved = localStorage.getItem('dama_lang');
    if (saved === 'KU' || saved === 'EN' || saved === 'AR') {
      return saved as Language;
    }
    return 'KU';
  });

  const setLang = (newLang: Language) => {
    setLangInternal(newLang);
    localStorage.setItem('dama_lang', newLang);
  };
  const [screen, setScreen] = useState<ScreenType>('HOME');
  const [mode, setMode] = useState<GameMode>('AI');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [theme, setTheme] = useState<BoardTheme>('CLASSIC_WOOD');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [p1Profile, setP1Profile] = useState(() => getProfiles().p1);
  const [p2Profile, setP2Profile] = useState(() => getProfiles().p2);

  const [player1Name, setPlayer1Name] = useState(() => getProfiles().p1.name);
  const [player2Name, setPlayer2Name] = useState(() => getProfiles().p2.name);
  
  const [tokens, setTokens] = useState<number>(100);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [showAiSetupModal, setShowAiSetupModal] = useState(false);

  const [showPuzzles, setShowPuzzles] = useState(false);
  const [showAcademy, setShowAcademy] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [showPlayStorePolicies, setShowPlayStorePolicies] = useState(false);
  const [showDamaRules, setShowDamaRules] = useState(false);
  const [showAboutUsPortfolio, setShowAboutUsPortfolio] = useState(false);
  const [activeCampaignBoss, setActiveCampaignBoss] = useState<any>(null);

  // Time-Attack variables
  const [timeAttack, setTimeAttack] = useState(false);
  const [timeAttackP1, setTimeAttackP1] = useState(180);
  const [timeAttackP2, setTimeAttackP2] = useState(180);

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
  let backListener: any;
  
  const setupBackListener = async () => {
    backListener = await CapApp.addListener('backButton', () => {
      // بەکارهێنانی لۆجیکی handleBack کە بە وردی مۆداڵە گەشەکردووەکانی یارییەکە دادەخات
      handleBack();
    });
  };

  setupBackListener();

  return () => {
    if (backListener) {
      backListener.remove();
    }
  };
}, [handleBack]);

  useEffect(() => {
    if (screen !== 'PLAYING' || !timeAttack || gameState.winner) return;

    const timer = setInterval(() => {
      if (gameState.turn === 'CYAN') {
        setTimeAttackP1((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            dispatch({ type: 'SET_WINNER', payload: 'WHITE' });
            playSound('error');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setTimeAttackP2((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            dispatch({ type: 'SET_WINNER', payload: 'CYAN' });
            playSound('win');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, timeAttack, gameState.turn, gameState.winner, playSound]);

  useEffect(() => {
    if (gameState.winner && !prevWinner.current) {
      if (soundEnabled) playSound('win');
      
      // Token state logic
      if (mode === 'AI') {
        if (gameState.winner === 'CYAN') {
          addWinTokens();
        } else {
          deductLossTokens();
        }
        setTokens(getTokens());
      }

      // Profiles Statistics Updating on Game Over (offline analytics)
      const latestProfiles = handleEndGameStatistics({
        winner: gameState.winner as 'CYAN' | 'WHITE',
        mode,
        difficulty,
        board: gameState.board,
        activeCampaignBoss,
        hintsLeft: gameState.hintsLeft
      });
      setP1Profile(latestProfiles.p1);
      setP2Profile(latestProfiles.p2);
    } else if (gameState.board !== prevBoard.current) {
      // Detect captures & king actions
      const prevCyan = prevBoard.current?.flat().filter(p => p && p.player === 'CYAN').length ?? 16;
      const currentCyan = gameState.board.flat().filter(p => p && p.player === 'CYAN').length;
      const prevWhite = prevBoard.current?.flat().filter(p => p && p.player === 'WHITE').length ?? 16;
      const currentWhite = gameState.board.flat().filter(p => p && p.player === 'WHITE').length;

      const userLoss = currentCyan < prevCyan;
      const botLoss = currentWhite < prevWhite;

      if (soundEnabled) {
        const prevKings = prevBoard.current?.flat().filter(p => p && p.type === 'KING').length ?? 0;
        const currentKings = gameState.board.flat().filter(p => p && p.type === 'KING').length;

        if (currentKings > prevKings) {
          playSound('king');
        } else if (userLoss || botLoss) {
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
    const isBotTurn = (mode === 'AI' || mode === 'CAMPAIGN') && gameState.turn === 'WHITE';
    if (screen === 'PLAYING' && isBotTurn && !gameState.winner) {
      const targetDifficulty = mode === 'CAMPAIGN' && activeCampaignBoss ? activeCampaignBoss.difficulty : difficulty;
      const timer = setTimeout(() => {
        workerRef.current?.postMessage({
          board: gameState.board,
          difficulty: targetDifficulty,
          turn: 'WHITE',
          mustJumpPos: gameState.mustJumpPos
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [screen, mode, difficulty, gameState.turn, gameState.winner, gameState.board, activeCampaignBoss]);

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
    setTimeAttackP1(180);
    setTimeAttackP2(180);
  };

  const startCampaignChallenge = (boss: any) => {
    setActiveCampaignBoss(boss);
    setMode('CAMPAIGN');
    const nameInLang = lang === 'KU' ? boss.nameKu : lang === 'AR' ? boss.nameAr : boss.nameEn;
    setPlayer2Name(nameInLang);
    dispatch({ type: 'RESET_GAME' });
    setScreen('PLAYING');
    setTimeAttackP1(180);
    setTimeAttackP2(180);
    setShowCampaign(false);
  };

  const handleStartAction = () => {
    if (cooldownRemaining > 0 || tokens <= 0) {
      return; // Locked out!
    }
    if (mode === 'CAMPAIGN') {
      if (!activeCampaignBoss) {
        setShowCampaign(true);
      } else {
        startGame();
      }
    } else if (mode === 'AI') {
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

  const handleBack = () => {
    const hasActiveModal = 
      showPuzzles || showAcademy || showStats || showProfiles || 
      showCampaign || showCoach || showPlayStorePolicies || 
      showDamaRules || showAboutUsPortfolio || showAiSetupModal;

    if (hasActiveModal || screen !== 'HOME') {
      if (screen === 'PLAYING') {
        deductActivePenalty();
      }
      
      // Step backward in history cleanly
      window.history.back();
    } else {
      // Double press back on root home screen (fallback for back key click)
      const now = Date.now();
      if (now - backPressTimeRef.current < 2000) {
        setExitToast(false);
        window.history.go(-1);
      } else {
        backPressTimeRef.current = now;
        setExitToast(true);
        setTimeout(() => setExitToast(false), 2000);
      }
    }
  };

  // Initialize window history state on first-load to enable robust backtracking support
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({
        screen: 'HOME',
        showPuzzles: false,
        showAcademy: false,
        showStats: false,
        showProfiles: false,
        showCampaign: false,
        showCoach: false,
        showPlayStorePolicies: false,
        showDamaRules: false,
        showAboutUsPortfolio: false,
        showAiSetupModal: false
      }, '');
    }
  }, []);

  // Synchronise state transitions (panels and active screens) to custom browser history state
  useEffect(() => {
    const currentState = {
      screen,
      showPuzzles,
      showAcademy,
      showStats,
      showProfiles,
      showCampaign,
      showCoach,
      showPlayStorePolicies,
      showDamaRules,
      showAboutUsPortfolio,
      showAiSetupModal
    };

    const hasActiveModal = 
      showPuzzles || showAcademy || showStats || showProfiles || 
      showCampaign || showCoach || showPlayStorePolicies || 
      showDamaRules || showAboutUsPortfolio || showAiSetupModal;

    const currentHistoryState = window.history.state;

    // Check if configuration matches to prevent duplicate histories
    const matches = currentHistoryState &&
      currentHistoryState.screen === screen &&
      !!currentHistoryState.showPuzzles === !!showPuzzles &&
      !!currentHistoryState.showAcademy === !!showAcademy &&
      !!currentHistoryState.showStats === !!showStats &&
      !!currentHistoryState.showProfiles === !!showProfiles &&
      !!currentHistoryState.showCampaign === !!showCampaign &&
      !!currentHistoryState.showCoach === !!showCoach &&
      !!currentHistoryState.showPlayStorePolicies === !!showPlayStorePolicies &&
      !!currentHistoryState.showDamaRules === !!showDamaRules &&
      !!currentHistoryState.showAboutUsPortfolio === !!showAboutUsPortfolio &&
      !!currentHistoryState.showAiSetupModal === !!showAiSetupModal;

    if (!matches) {
      window.history.pushState(currentState, '');
    }
  }, [
    screen,
    showPuzzles,
    showAcademy,
    showStats,
    showProfiles,
    showCampaign,
    showCoach,
    showPlayStorePolicies,
    showDamaRules,
    showAboutUsPortfolio,
    showAiSetupModal
  ]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        const s = e.state;
        
        // Return with animations and penalty warnings if exiting game
        if (screen === 'PLAYING' && s.screen !== 'PLAYING') {
          deductActivePenalty();
        }

        setScreen(s.screen || 'HOME');
        setShowPuzzles(!!s.showPuzzles);
        setShowAcademy(!!s.showAcademy);
        setShowStats(!!s.showStats);
        setShowProfiles(!!s.showProfiles);
        setShowCampaign(!!s.showCampaign);
        setShowCoach(!!s.showCoach);
        setShowPlayStorePolicies(!!s.showPlayStorePolicies);
        setShowDamaRules(!!s.showDamaRules);
        setShowAboutUsPortfolio(!!s.showAboutUsPortfolio);
        setShowAiSetupModal(!!s.showAiSetupModal);
      } else {
        // Fallback default back sequence
        const hasActiveModal = 
          showPuzzles || showAcademy || showStats || showProfiles || 
          showCampaign || showCoach || showPlayStorePolicies || 
          showDamaRules || showAboutUsPortfolio || showAiSetupModal;

        if (hasActiveModal) {
          setShowPuzzles(false);
          setShowAcademy(false);
          setShowStats(false);
          setShowProfiles(false);
          setShowCampaign(false);
          setShowCoach(false);
          setShowPlayStorePolicies(false);
          setShowDamaRules(false);
          setShowAboutUsPortfolio(false);
          setShowAiSetupModal(false);
        } else if (screen !== 'HOME') {
          if (screen === 'PLAYING') {
            deductActivePenalty();
          }
          setScreen('HOME');
        } else {
          // Double press back on root home screen
          const now = Date.now();
          if (now - backPressTimeRef.current < 2000) {
            setExitToast(false);
            window.history.go(-1);
          } else {
            backPressTimeRef.current = now;
            setExitToast(true);
            setTimeout(() => setExitToast(false), 2000);
            window.history.pushState({ screen: 'HOME' }, '');
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Add custom Cordova / Capacitor physical backbutton listener to prevent immediate WebView exits
    const handleAndroidBackButton = (e: Event) => {
      e.preventDefault();
      handleBack();
    };
    document.addEventListener('backbutton', handleAndroidBackButton, false);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('backbutton', handleAndroidBackButton, false);
    };
  }, [
    screen, 
    showPuzzles, 
    showAcademy, 
    showStats, 
    showProfiles, 
    showCampaign, 
    showCoach, 
    showPlayStorePolicies, 
    showDamaRules, 
    showAboutUsPortfolio,
    showAiSetupModal,
    tokens
  ]);
  const cyanCount = gameState.board.flat().filter((p: any) => p && p.player === 'CYAN').length;
  const whiteCount = gameState.board.flat().filter((p: any) => p && p.player === 'WHITE').length;
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#010915] text-neutral-100 flex flex-col font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200 relative pt-[env(safe-area-inset-top,1.2rem)] pb-[env(safe-area-inset-bottom,1.5rem)] pl-[env(safe-area-inset-left,0.5rem)] pr-[env(safe-area-inset-right,0.5rem)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0b213c,#01050e)] opacity-100 -z-20" />
      
      {/* Dynamic Animated Checkers Board Floating background */}
      <AnimatedBackground />

      {/* HEADER - Slim, optimized, responsive and professional */}
      <GameHeader
        lang={lang}
        setLang={setLang}
        screen={screen}
        setScreen={setScreen}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        tokens={tokens}
        handleClearCacheAndRefresh={handleClearCacheAndRefresh}
        deductActivePenalty={deductActivePenalty}
        dispatch={dispatch}
        handleFullReset={handleFullReset}
        handleBack={handleBack}
      />

      <main className="flex-1 w-full flex flex-col items-center p-4 sm:p-6 md:p-8 relative z-10 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          {screen === 'HOME' && (
            <HomeView
              lang={lang}
              setLang={setLang}
              screen={screen}
              setScreen={setScreen}
              mode={mode}
              setMode={setMode}
              theme={theme}
              setTheme={setTheme}
              pieceStyle={pieceStyle}
              setPieceStyle={setPieceStyle}
              timeAttack={timeAttack}
              setTimeAttack={setTimeAttack}
              tokens={tokens}
              cooldownRemaining={cooldownRemaining}
              activeCampaignBoss={activeCampaignBoss}
              setShowCampaign={setShowCampaign}
              setShowStats={setShowStats}
              setShowProfiles={setShowProfiles}
              setShowCoach={setShowCoach}
              setShowPuzzles={setShowPuzzles}
              setShowAcademy={setShowAcademy}
              setShowPlayStorePolicies={setShowPlayStorePolicies}
              setShowDamaRules={setShowDamaRules}
              setShowAboutUsPortfolio={setShowAboutUsPortfolio}
              p1Profile={p1Profile}
              getCooldownString={getCooldownString}
              handleStartAction={handleStartAction}
              t={t}
            />
          )}

          {screen === 'PLAYING' && (
            <PlayingView
              lang={lang}
              mode={mode}
              theme={theme}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              player1Name={player1Name}
              setPlayer1Name={setPlayer1Name}
              player2Name={player2Name}
              setPlayer2Name={setPlayer2Name}
              gameState={gameState}
              dispatch={dispatch}
              timeAttack={timeAttack}
              timeAttackP1={timeAttackP1}
              timeAttackP2={timeAttackP2}
              whiteCount={whiteCount}
              cyanCount={cyanCount}
              shakeBoard={shakeBoard}
              bubbleText={bubbleText}
              bubbleSender={bubbleSender}
              pieceStyle={pieceStyle}
              requestHint={requestHint}
              deductActivePenalty={deductActivePenalty}
              handleBack={handleBack}
              handleFullReset={handleFullReset}
              t={t}
            />
          )}

          {screen === 'RULES' && (
            <RulesView
              lang={lang}
              onBack={handleBack}
              t={t}
            />
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
        <AISetupModal
          isOpen={showAiSetupModal}
          onClose={handleBack}
          lang={lang}
          playerName={player1Name}
          setPlayerName={setPlayer1Name}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          onStartGame={startGame}
          t={t}
        />
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

      {/* Independent 2-Second Arabic Dhikr Periodic Notification Overlay */}
      <DhikrNotification />

      {/* 4 Custom Offline Modules Overlay/Modals */}
      <AnimatePresence>
        {showAcademy && (
          <AcademyPanel
            lang={lang}
            onClose={handleBack}
          />
        )}
        
        {showPuzzles && (
          <PuzzlesPanel
            lang={lang}
            onClose={handleBack}
            playSound={playSound}
            soundEnabled={soundEnabled}
            onCoinsUpdated={() => {
              setP1Profile(getProfiles().p1);
              setP2Profile(getProfiles().p2);
            }}
          />
        )}

        {showStats && (
          <StatsDashboard
            lang={lang}
            onClose={handleBack}
            onProfileUpdated={() => {
              setP1Profile(getProfiles().p1);
              setP2Profile(getProfiles().p2);
            }}
          />
        )}

        {showProfiles && (
          <ProfilesModal
            lang={lang}
            onClose={handleBack}
            onSaved={() => {
              const updated = getProfiles();
              setP1Profile(updated.p1);
              setP2Profile(updated.p2);
              setPlayer1Name(updated.p1.name);
              setPlayer2Name(updated.p2.name);
            }}
          />
        )}

        {showCampaign && (
          <CampaignPanel
            lang={lang}
            onClose={handleBack}
            onChallenge={startCampaignChallenge}
          />
        )}

        {showCoach && (
          <CoachPanel
            lang={lang}
            onClose={handleBack}
          />
        )}

        {showPlayStorePolicies && (
          <PlayStorePoliciesModal
            lang={lang}
            onClose={handleBack}
          />
        )}

        {showDamaRules && (
          <DamaRulesModal
            lang={lang}
            onClose={handleBack}
          />
        )}

        {showAboutUsPortfolio && (
          <AboutUsPortfolioModal
            lang={lang}
            onClose={handleBack}
          />
        )}
      </AnimatePresence>

      <InstallPrompt />
    </div>
  );
}
