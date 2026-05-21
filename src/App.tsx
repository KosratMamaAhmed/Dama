import React, { useReducer, useState, useEffect } from 'react';
import { initialGameState, gameReducer } from './store/gameReducer';
import { GameMode, Difficulty, BoardTheme } from './types';
import { Language } from './translations';

// Components
import HomeMenu from './components/HomeMenu';
import MatchSetup from './components/MatchSetup';
import GameBoardArea from './components/GameBoardArea';

export type ScreenType = 'HOME' | 'SETUP_AI' | 'SETUP_FRIEND' | 'PLAYING' | 'RULES_PAGE' | 'POLICY_PAGE' | 'ABOUT';

export default function App() {
  // دۆخی سەرەکی یارییەکە
  const [screen, setScreen] = useState<ScreenType>('HOME');
  const [lang, setLang] = useState<Language>('KU');
  const [mode, setMode] = useState<GameMode>('AI');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [theme, setTheme] = useState<BoardTheme>('CLASSIC');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pieceFlag, setPieceFlag] = useState<string>('CLASSIC');

  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [seconds, setSeconds] = useState(0);

  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // ڕێکخستنی کاتژمێر
  useEffect(() => {
    let timerId: any = null;
    if (screen === 'PLAYING' && !gameState.winner) {
      timerId = setInterval(() => setSeconds(p => p + 1), 1000);
    } else if (screen !== 'PLAYING') {
      setSeconds(0);
    }
    return () => clearInterval(timerId);
  }, [screen, gameState.winner]);

  const handleFullReset = () => {
    dispatch({ type: 'RESET_GAME' });
    setSeconds(0);
  };

  const startGame = () => {
    handleFullReset();
    setScreen('PLAYING');
  };

  return (
    <div 
      dir={lang === 'KU' || lang === 'AR' ? 'rtl' : 'ltr'} 
      className="min-h-[100dvh] w-full bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-indigo-950 font-sans text-white selection:bg-cyan-500/30 overflow-x-hidden relative flex flex-col items-center pb-[max(3rem,env(safe-area-inset-bottom))]"
    >
      {/* پاشبنەمای ئەنیمەیشنی مۆدێرن */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {screen === 'HOME' && (
        <HomeMenu 
          setScreen={setScreen} 
          lang={lang} 
          setLang={setLang}
          setMode={setMode}
          theme={theme}
          setTheme={setTheme}
          pieceFlag={pieceFlag}
          setPieceFlag={setPieceFlag}
        />
      )}

      {(screen === 'SETUP_AI' || screen === 'SETUP_FRIEND') && (
        <MatchSetup 
          mode={mode}
          screen={screen}
          setScreen={setScreen}
          lang={lang}
          player1Name={player1Name}
          setPlayer1Name={setPlayer1Name}
          player2Name={player2Name}
          setPlayer2Name={setPlayer2Name}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          startGame={startGame}
        />
      )}

      {screen === 'PLAYING' && (
        <GameBoardArea 
          gameState={gameState}
          dispatch={dispatch}
          mode={mode}
          difficulty={difficulty}
          theme={theme}
          pieceFlag={pieceFlag}
          lang={lang}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          seconds={seconds}
          player1Name={player1Name}
          player2Name={player2Name}
          setScreen={setScreen}
          handleFullReset={handleFullReset}
        />
      )}
    </div>
  );
}