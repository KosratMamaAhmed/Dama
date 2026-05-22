import { getProfiles, saveProfiles, addMatchHistory, checkAndUnlockAchievements } from '../store/profileStore';
import { GameMode, Difficulty } from '../types';

interface EndGameParams {
  winner: 'CYAN' | 'WHITE';
  mode: GameMode;
  difficulty: Difficulty;
  board: any[][];
  activeCampaignBoss: any;
  hintsLeft: number;
}

export function handleEndGameStatistics({
  winner,
  mode,
  difficulty,
  board,
  activeCampaignBoss,
  hintsLeft
}: EndGameParams) {
  const currentCyanCount = board.flat().filter(p => p && p.player === 'CYAN').length;
  const currentWhiteCount = board.flat().filter(p => p && p.player === 'WHITE').length;
  const cyanLost = Math.max(0, 16 - currentCyanCount);
  const whiteLost = Math.max(0, 16 - currentWhiteCount);

  const profiles = getProfiles();
  const isP1Winner = winner === 'CYAN';

  // 1. Update Player 1 Statistics
  profiles.p1.gamesPlayed += 1;
  profiles.p1.totalJumpsCaptured += whiteLost;

  if (isP1Winner) {
    profiles.p1.totalWins += 1;
    profiles.p1.currentWinStreak += 1;
    if (profiles.p1.currentWinStreak > profiles.p1.longestWinStreak) {
      profiles.p1.longestWinStreak = profiles.p1.currentWinStreak;
    }

    // Campaign Reward Logic
    if (mode === 'CAMPAIGN' && activeCampaignBoss) {
      profiles.p1.coinCount += activeCampaignBoss.bounty;

      const currentUnlockedIndex = parseInt(localStorage.getItem('dama_campaign_unlocked_index') || '1', 10);
      if (activeCampaignBoss.id === currentUnlockedIndex) {
        const nextUnlocked = activeCampaignBoss.id + 1;
        localStorage.setItem('dama_campaign_unlocked_index', String(nextUnlocked));
      }

      // Royal title unlock
      if (activeCampaignBoss.id === 12) {
        if (!profiles.p1.unlockedTitles.includes('sovereign')) {
          profiles.p1.unlockedTitles.push('sovereign');
        }
      }
    } else {
      profiles.p1.coinCount += 15;
    }
  } else {
    profiles.p1.totalLosses += 1;
    profiles.p1.currentWinStreak = 0;
  }

  // 2. Update Player 2 Statistics if PVP local Pass & Play (labeled FRIEND)
  if (mode === 'FRIEND') {
    profiles.p2.gamesPlayed += 1;
    profiles.p2.totalJumpsCaptured += cyanLost;

    const isP2Winner = winner === 'WHITE';
    if (isP2Winner) {
      profiles.p2.totalWins += 1;
      profiles.p2.currentWinStreak += 1;
      if (profiles.p2.currentWinStreak > profiles.p2.longestWinStreak) {
        profiles.p2.longestWinStreak = profiles.p2.currentWinStreak;
      }
      profiles.p2.coinCount += 15;
    } else {
      profiles.p2.totalLosses += 1;
      profiles.p2.currentWinStreak = 0;
    }
  }

  // Save base profile updates first
  saveProfiles(profiles.p1, profiles.p2);

  // 3. Trigger achievements check
  // (checkAndUnlockAchievements internally loads profiles, modifies the achievements fields, and saves again)
  const targetDiff = mode === 'AI' ? difficulty : mode === 'CAMPAIGN' ? activeCampaignBoss?.difficulty : undefined;
  
  // Player 1 Achievements
  checkAndUnlockAchievements('p1', {
    won: isP1Winner,
    difficulty: targetDiff,
    hintsLeftMax: 5,
    hintsLeftEnd: hintsLeft,
    playerPiecesRemaining: currentCyanCount,
    opponentPiecesCaptured: whiteLost,
    promotedKingsCount: board.flat().filter(p => p && p.player === 'CYAN' && p.type === 'KING').length
  });

  // Player 2 Achievements (only in FRIEND mode)
  if (mode === 'FRIEND') {
    const isP2Winner = winner === 'WHITE';
    checkAndUnlockAchievements('p2', {
      won: isP2Winner,
      hintsLeftMax: 5,
      hintsLeftEnd: 5,
      playerPiecesRemaining: currentWhiteCount,
      opponentPiecesCaptured: cyanLost,
      promotedKingsCount: board.flat().filter(p => p && p.player === 'WHITE' && p.type === 'KING').length
    });
  }

  // 4. Record to Device Match History LOG
  const finalP2Name = mode === 'AI' 
    ? 'ژێری دەستکرد (مەکینە)' 
    : mode === 'CAMPAIGN' 
    ? (activeCampaignBoss ? activeCampaignBoss.nameKu : 'پاشای دژبەر') 
    : profiles.p2.name;

  addMatchHistory({
    id: `match_${Date.now()}`,
    date: new Date().toLocaleDateString(),
    mode: mode === 'CAMPAIGN' ? 'AI' : mode === 'FRIEND' ? 'FRIEND' : 'AI',
    difficulty: targetDiff,
    player1Name: profiles.p1.name,
    player2Name: finalP2Name,
    winnerName: isP1Winner ? profiles.p1.name : finalP2Name,
    piecesCaptured: isP1Winner ? whiteLost : cyanLost,
    durationSeconds: 120
  });

  // Return the latest profiles for the caller to sync state
  return getProfiles();
}
