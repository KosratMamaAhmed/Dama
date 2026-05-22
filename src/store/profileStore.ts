import { Player } from '../types';

export interface PlayerProfile {
  id: string; // 'p1' | 'p2'
  name: string;
  avatarId: string;
  selectedTitleId: string | null;
  selectedFrameId: string | null;
  coinCount: number;
  longestWinStreak: number;
  currentWinStreak: number;
  totalWins: number;
  totalLosses: number;
  totalJumpsCaptured: number;
  gamesPlayed: number;
  unlockedAchievements: string[];
  unlockedFrames: string[];
  unlockedTitles: string[];
}

export interface Achievement {
  id: string;
  nameKu: string;
  nameAr: string;
  nameEn: string;
  descKu: string;
  descAr: string;
  descEn: string;
  icon: string;
  rewardKu: string;
  rewardEn: string;
  rewardType: 'title' | 'frame';
  rewardId: string;
}

export interface MatchHistoryItem {
  id: string;
  date: string;
  mode: 'AI' | 'FRIEND' | 'PUZZLE';
  difficulty?: string;
  player1Name: string;
  player2Name: string;
  winnerName: string;
  piecesCaptured: number;
  durationSeconds: number;
}

export const AVATAR_LIST = [
  { id: 'kurdish_man', nameKu: 'پیاوی کورد 👨‍🦱', nameAr: 'الرجل الكردي', nameEn: 'Kurdish Man' },
  { id: 'kurdish_woman', nameKu: 'خانمی کورد 👩‍🦰', nameAr: 'المرأة الكردية', nameEn: 'Kurdish Woman' },
  { id: 'elder', nameKu: 'ڕیش سپی 👴', nameAr: 'الحكيم الكردي', nameEn: 'Kurdish Elder' },
  { id: 'robot', nameKu: 'مەکینەی زیرەک 🤖', nameAr: 'الروبوت الذكي', nameEn: 'Smart AI Bot' },
  { id: 'hawk', nameKu: 'هەڵۆی ڕەسەن 🦅', nameAr: 'الصقر الشجاع', nameEn: 'Brave Falcon' },
  { id: 'crown', nameKu: 'شای زێڕین 👑', nameAr: 'التاج الذهبي', nameEn: 'Golden Crown' },
  { id: 'warrior', nameKu: 'جەنگاوەر ⚔️', nameAr: 'المحارب الصنديد', nameEn: 'Dama Warrior' },
  { id: 'tiger', nameKu: 'بڵنگی خێرا 🐅', nameAr: 'النمر السريع', nameEn: 'Swift Tiger' },
  { id: 'cyber', nameKu: 'نیشانەگر 🎯', nameAr: 'قناص الماتريكس', nameEn: 'Cyber Sniper' },
  { id: 'grandmaster', nameKu: 'پرۆفیسۆر 🎓', nameAr: 'الأستاذ الأعظم', nameEn: 'Grandmaster' }
];

export const FRAMES = [
  { id: 'bronze', nameKu: 'برۆنزی ساده', nameAr: 'برونزي كلاسيكي', nameEn: 'Bronze Border', class: 'border-amber-700 shadow-md' },
  { id: 'cyan_neon', nameKu: 'نیۆنی شین ⚡', nameAr: 'النيون السيان', nameEn: 'Cyan Neon Pulse', class: 'border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse' },
  { id: 'golden_glow', nameKu: 'زێڕینی پاشایەتی 🔥', nameAr: 'الوهج الذهبي', nameEn: 'Royal Golden Glow', class: 'border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.9)] ring-2 ring-yellow-400/55' },
  { id: 'rose_plasma', nameKu: 'پلازمای هێزی مۆر 🎆', nameAr: 'الهالة الأرجوانية', nameEn: 'Rose Plasma Aura', class: 'border-fuchsia-500 shadow-[0_0_20px_rgba(236,72,153,0.9)] ring-2 ring-fuchsia-400' },
  { id: 'rainbow_matrix', nameKu: 'شەبەنگی جادوویی 🌈', nameAr: 'قوس قزح الأسطوري', nameEn: 'Legendary Rainbow', class: 'border-gradient shadow-[0_0_25px_rgba(244,63,94,0.95)] animate-bounce duration-[5000ms] border-red-500 bg-gradient-to-tr from-rose-500 via-amber-400 to-emerald-500' }
];

export const TITLES = [
  { id: 'trainee', nameKu: 'شاگرد', nameAr: 'المبتدئ', nameEn: 'Apprentice', color: 'text-neutral-400' },
  { id: 'fighter', nameKu: 'جەنگاوەر', nameAr: 'المقاتل', nameEn: 'Fighter', color: 'text-cyan-400' },
  { id: 'revolutionary', nameKu: 'شۆڕشگێڕ', nameAr: 'الثائر', nameEn: 'Revolutionary', color: 'text-amber-400 font-extrabold animate-pulse' },
  { id: 'eagle', nameKu: 'هەڵۆی بەرز', nameAr: 'الصقر المحلق', nameEn: 'High Falcon', color: 'text-emerald-400 font-extrabold' },
  { id: 'unbeatable', nameKu: 'نەبەزێنراو', nameAr: 'الذي لا يقهر', nameEn: 'Unbeatable', color: 'text-rose-500 font-black animate-pulse shadow-sm' },
  { id: 'puzzle_sage', nameKu: 'زۆرزانی مەتەڵ', nameAr: 'حكيم الألغاز', nameEn: 'Puzzle Sage', color: 'text-indigo-400' },
  { id: 'sovereign', nameKu: 'پادشا', nameAr: 'الملك المهيب', nameEn: 'Sovereign', color: 'text-yellow-400 font-extrabold shadow-[0_0_8px_gold]' }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'expert_no_hint',
    nameKu: 'شۆڕشگێڕی دامە 🎓',
    nameAr: 'ثائر الدامة والذكاء',
    nameEn: 'Dama Revolutionary',
    descKu: 'بردنەوە لە ئاستی زۆرزان (Expert) بەبێ بەکارهێنانی هیچ ڕێنماییەک.',
    descAr: 'الفوز ضد الذكاء الاصطناعي (خبير) بدون استخدام أي تلميحات.',
    descEn: 'Win a match against Expert difficulty without using any hints.',
    icon: '🔥',
    rewardKu: 'پێشگری [شۆڕشگێڕ]',
    rewardEn: 'Title: [Revolutionary]',
    rewardType: 'title',
    rewardId: 'revolutionary'
  },
  {
    id: 'flawless_victory',
    nameKu: 'هەڵۆی بێ زیان 🦅',
    nameAr: 'طائر النصر الحاسم',
    nameEn: 'Sovereign Eagle',
    descKu: 'بردنەوە لە ماشێن لە ئاستی ناوەند یان بەرزتر بەبێ لەدەستدانی تەنانەت یەک بەرددا!',
    descAr: 'الفوز بالدامة دون خسارة أي حجر خاص بك (١٦ حجر كامل بك).',
    descEn: 'Win the game with a perfect 16-checker flawless state (no pieces lost).',
    icon: '🦅',
    rewardKu: 'پێشگری [هەڵۆی بەرز]',
    rewardEn: 'Title: [High Falcon]',
    rewardType: 'title',
    rewardId: 'eagle'
  },
  {
    id: 'expert_master',
    nameKu: 'شاڵاوی نەبەزین 👑',
    nameAr: 'قاهر الخبراء المنيع',
    nameEn: 'Unbeatable Emperor',
    descKu: 'بردنەوە لە ئاستی زۆرزان (Expert) بەلایەنی کەمەوە ٣ جار.',
    descAr: 'الفوز على مستوى خبير لـ ٣ مرات متتالية.',
    descEn: 'Defeat the Expert difficulty 3 times to prove ultimate checkers mastery.',
    icon: '🛡️',
    rewardKu: 'ڕووناکی گەشی [سوارچاکی نەبەزێنراو]',
    rewardEn: 'Title: [Unbeatable]',
    rewardType: 'title',
    rewardId: 'unbeatable'
  },
  {
    id: 'puzzle_all',
    nameKu: 'زۆرزانی مەتەڵەکان 🧩',
    nameAr: 'مدمر جميع الألغاز',
    nameEn: 'Puzzle Sage Master',
    descKu: 'چارەسەرکردنی سەرجەم مەتەڵەکانی بوردەکە بە سەرکەوتوویی.',
    descAr: 'حل كافة ألغاز وتحديات الدامة بنجاح وبأقل عدد حركات.',
    descEn: 'Solve all interactive tactical puzzles successfully.',
    icon: '🧩',
    rewardKu: 'پێشگری [زۆرزانی مەتەڵ]',
    rewardEn: 'Title: [Puzzle Sage]',
    rewardType: 'title',
    rewardId: 'puzzle_sage'
  },
  {
    id: 'millionaire',
    nameKu: 'پاشای خانەدان 💰',
    nameAr: 'الملك الثري الأبدي',
    nameEn: 'Sovereign Millionaire',
    descKu: 'کۆکردنەوەی زیاتر لە ١٢٠ سکە لە مۆدەکانی یارییکردندا.',
    descAr: 'تجميع ١٢٠ نقطة أو أكثر من الانتصارات.',
    descEn: 'Gather more than 120 copper coins via continuous wins.',
    icon: '👑',
    rewardKu: 'چوارچێوەی درەوشاوەی شەبەنگی [جادوویی]',
    rewardEn: 'Frame: [Legendary Rainbow]',
    rewardType: 'frame',
    rewardId: 'rainbow_matrix'
  }
];

const DEFAULT_P1: PlayerProfile = {
  id: 'p1',
  name: 'یاریزان ١',
  avatarId: 'kurdish_man',
  selectedTitleId: null,
  selectedFrameId: null,
  coinCount: 30,
  longestWinStreak: 0,
  currentWinStreak: 0,
  totalWins: 0,
  totalLosses: 0,
  totalJumpsCaptured: 0,
  gamesPlayed: 0,
  unlockedAchievements: [],
  unlockedFrames: ['bronze'],
  unlockedTitles: ['trainee', 'fighter']
};

const DEFAULT_P2: PlayerProfile = {
  id: 'p2',
  name: 'یاریزان ٢',
  avatarId: 'kurdish_woman',
  selectedTitleId: null,
  selectedFrameId: null,
  coinCount: 20,
  longestWinStreak: 0,
  currentWinStreak: 0,
  totalWins: 0,
  totalLosses: 0,
  totalJumpsCaptured: 0,
  gamesPlayed: 0,
  unlockedAchievements: [],
  unlockedFrames: ['bronze'],
  unlockedTitles: ['trainee', 'fighter']
};

export function getProfiles(): { p1: PlayerProfile; p2: PlayerProfile } {
  const p1Str = localStorage.getItem('dama_profile_p1');
  const p2Str = localStorage.getItem('dama_profile_p2');
  
  const p1 = p1Str ? JSON.parse(p1Str) : { ...DEFAULT_P1 };
  const p2 = p2Str ? JSON.parse(p2Str) : { ...DEFAULT_P2 };

  // Migrations for missing properties
  if (!p1.unlockedFrames.includes('bronze')) p1.unlockedFrames.push('bronze');
  if (!p2.unlockedFrames.includes('bronze')) p2.unlockedFrames.push('bronze');
  if (!p1.unlockedTitles.includes('trainee')) p1.unlockedTitles.push('trainee');
  if (!p2.unlockedTitles.includes('trainee')) p2.unlockedTitles.push('trainee');

  return { p1, p2 };
}

export function saveProfiles(p1: PlayerProfile, p2: PlayerProfile) {
  localStorage.setItem('dama_profile_p1', JSON.stringify(p1));
  localStorage.setItem('dama_profile_p2', JSON.stringify(p2));
}

export function getMatchHistory(): MatchHistoryItem[] {
  const hStr = localStorage.getItem('dama_match_history');
  return hStr ? JSON.parse(hStr) : [];
}

export function addMatchHistory(item: MatchHistoryItem) {
  const history = getMatchHistory();
  history.unshift(item); // Add to beginning
  localStorage.setItem('dama_match_history', JSON.stringify(history.slice(0, 30)));
}

// Logic to check and unlock achievements based on a completed match
export function checkAndUnlockAchievements(
  profileId: 'p1' | 'p2',
  matchDetails: {
    won: boolean;
    difficulty?: string;
    hintsLeftMax: number;
    hintsLeftEnd: number;
    playerPiecesRemaining: number;
    opponentPiecesCaptured: number;
    promotedKingsCount: number;
  }
): { unlockedNow: Achievement[] } {
  const profiles = getProfiles();
  const profile = profileId === 'p1' ? profiles.p1 : profiles.p2;

  const unlockedNow: Achievement[] = [];

  // Update stats
  profile.gamesPlayed += 1;
  if (matchDetails.won) {
    profile.totalWins += 1;
    profile.currentWinStreak += 1;
    if (profile.currentWinStreak > profile.longestWinStreak) {
      profile.longestWinStreak = profile.currentWinStreak;
    }
    // Award standard coins
    profile.coinCount += matchDetails.difficulty === 'EXPERT' ? 15 : matchDetails.difficulty === 'HARD' ? 10 : 6;
  } else {
    profile.totalLosses += 1;
    profile.currentWinStreak = 0;
  }
  profile.totalJumpsCaptured += matchDetails.opponentPiecesCaptured;

  // Let's sweep achievements
  ACHIEVEMENTS.forEach((ach) => {
    if (profile.unlockedAchievements.includes(ach.id)) return;

    let fulfills = false;

    if (ach.id === 'expert_no_hint') {
      // Won on expert with 5 hints left (meaning 0 used)
      if (matchDetails.won && matchDetails.difficulty === 'EXPERT' && matchDetails.hintsLeftEnd === 5) {
        fulfills = true;
      }
    } else if (ach.id === 'flawless_victory') {
      // Must not lose any of the 16 checkers
      if (matchDetails.won && matchDetails.playerPiecesRemaining === 16 && matchDetails.difficulty !== 'EASY') {
        fulfills = true;
      }
    } else if (ach.id === 'expert_master') {
      // Win expert 3 times total
      if (matchDetails.won && matchDetails.difficulty === 'EXPERT' && profile.totalWins >= 3) {
        fulfills = true;
      }
    } else if (ach.id === 'millionaire') {
      // Coin limit
      if (profile.coinCount >= 120) {
        fulfills = true;
      }
    }

    if (fulfills) {
      profile.unlockedAchievements.push(ach.id);
      unlockedNow.push(ach);

      // Award the reward
      if (ach.rewardType === 'title' && !profile.unlockedTitles.includes(ach.rewardId)) {
        profile.unlockedTitles.push(ach.rewardId);
      } else if (ach.rewardType === 'frame' && !profile.unlockedFrames.includes(ach.rewardId)) {
        profile.unlockedFrames.push(ach.rewardId);
      }
    }
  });

  saveProfiles(profiles.p1, profiles.p2);
  return { unlockedNow };
}
