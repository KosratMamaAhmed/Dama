import { BoardType, Piece } from '../types';

export interface PuzzleMove {
  from: { r: number; c: number };
  to: { r: number; c: number };
}

export interface Puzzle {
  id: string;
  nameKu: string;
  nameAr: string;
  nameEn: string;
  descKu: string;
  descAr: string;
  descEn: string;
  tipKu: string;
  tipAr: string;
  tipEn: string;
  boardSetup: () => BoardType;
  solution: PuzzleMove[]; // Cyan Correct Move 1, White Move 1, Cyan Correct Move 2, etc.
  opponentsMoves: PuzzleMove[]; // Automated White moves that occur after each correct Cyan move
}

// Simple Helper to generate empty board
function createEmptyBoard(): BoardType {
  const board: BoardType = [];
  for (let r = 0; r < 8; r++) {
    const row: (Piece | null)[] = [];
    for (let c = 0; c < 8; c++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
}

export const PUZZLES: Puzzle[] = [
  {
    id: 'dama_puz_1',
    nameKu: '١. فەڵتەی بازدانی دوانە ⚡',
    nameAr: '١. مصيدة القفز الثنائي المشحون',
    nameEn: '1. The Double Jump Bait',
    descKu: 'لەم جۆرەدا پێویستە بەردێکی خۆت بجوڵێنیت تا ڕکابەر ناچار بکەیت بخوات، پاشان هەردووکیان پاک دەکەیتەوە.',
    descAr: 'حرك حجراً لجعل الخصم يقوم بأكل إجباري، ثم اقفز والتهم جميع أحجاره لتفوز.',
    descEn: 'Move your piece to force the opponent into a mandatory capture trap, then sweep both to win.',
    tipKu: 'جووڵە بە بەردی خانەی (5, 4) بە لای ڕاستدا بۆ (5, 5).',
    tipAr: 'حرّك الحجر الموجود في (5, 4) إلى اليمين (5, 5).',
    tipEn: 'Tip: Slide the piece at row 5 col 4 rightwards to col 5.',
    boardSetup: () => {
      const board = createEmptyBoard();
      // White pieces
      board[3][5] = { id: 'w1', player: 'WHITE', type: 'MAN' };
      board[4][3] = { id: 'w2', player: 'WHITE', type: 'MAN' };
      // Cyan pieces
      board[5][4] = { id: 'c1', player: 'CYAN', type: 'MAN' };
      board[6][3] = { id: 'c2', player: 'CYAN', type: 'MAN' };
      return board;
    },
    solution: [
      { from: { r: 5, c: 4 }, to: { r: 5, c: 5 } }, // Cyan offers bait at (5,5)
      { from: { r: 6, c: 3 }, to: { r: 2, c: 3 } }  // Cyan sweeps: jumps over (4,3) then (3,3) etc.
    ],
    opponentsMoves: [
      { from: { r: 3, c: 5 }, to: { r: 5, c: 5 } }  // White is forced to jump over (5,4)
    ]
  },
  {
    id: 'dama_puz_2',
    nameKu: '٢. هێرشی شای بەهێز 👑',
    nameAr: '٢. غارة الشاه المنزلق الأكبر',
    nameEn: '2. Sliding King Blitz',
    descKu: 'تۆ خاوەنی یەک شایت کە توانای خلیسکانی بێسنوری هەیە. گونجاوترین هێرش بدۆزەرەوە تا ڕکابەر تێکبشکێنیت.',
    descAr: 'تمتلك شاه ذو خيارات حركة منزلقة غير محدودة، اعثر على زاوية الهجوم المثالية وتخلص من خصمك.',
    descEn: 'You command a promoted King with sliding range powers. Find the diagonal baseline to clean White.',
    tipKu: 'شاکەت لە خانەی (7, 1) دایە، بیخلیسکێنە بۆ لای سەرەوە (2, 1) بۆ خواردنی هەردوو بەردەکە.',
    tipAr: 'حرّك الشاه من (7, 1) إلى أعلى السطر (2, 1) لالتصاق صف الشارع.',
    tipEn: 'Tip: Slide your King from (7, 1) up to (1, 1).',
    boardSetup: () => {
      const board = createEmptyBoard();
      // White pieces
      board[2][1] = { id: 'w1', player: 'WHITE', type: 'MAN' };
      board[4][1] = { id: 'w2', player: 'WHITE', type: 'MAN' };
      board[4][4] = { id: 'w3', player: 'WHITE', type: 'MAN' };
      // Cyan pieces
      board[7][1] = { id: 'c1', player: 'CYAN', type: 'KING' };
      board[6][4] = { id: 'c2', player: 'CYAN', type: 'MAN' };
      return board;
    },
    solution: [
      { from: { r: 7, c: 1 }, to: { r: 1, c: 1 } }, // Sweep through (4,1) and (2,1)
      { from: { r: 6, c: 4 }, to: { r: 3, c: 4 } }  // Hunt the remaining piece
    ],
    opponentsMoves: [
      { from: { r: 4, c: 4 }, to: { r: 5, c: 4 } }
    ]
  },
  {
    id: 'dama_puz_3',
    nameKu: '٣. تەڵەی قوربانیکردن 🛡️',
    nameAr: '٣. تضحية الجندي الشجاع',
    nameEn: '3. The Brave Sacrifice Gambit',
    descKu: 'هەندێک جار دەربازبوون لە دۆخی قورس تەنها بە پێشکەشکردنی بەردێک بە ڕکابەر دەبێت تا دۆخەکە بە بەرژەوەندی خۆت پێچەوانە بکەیتەوە.',
    descAr: 'التضحية بقطعة هي الطریق الوحيد لفتح ثغرة في جدار دفاع الخصم ومن ثم حسم المباراة لتفوز.',
    descEn: 'Sacrificing a checker is the only pathway to open up a major defensive hole to dominate.',
    tipKu: 'بەردی خانەی (5, 2) بجوڵێنە بۆ (4, 2) تا سپییەکە ناچار بێت باز بدات.',
    tipAr: 'اضح بقطع السطر (5, 2) وحركها للأعلى لتجبر السفي على القفز.',
    tipEn: 'Tip: Push (5, 2) up to (4, 2) as sweet bait.',
    boardSetup: () => {
      const board = createEmptyBoard();
      // White pieces
      board[3][1] = { id: 'w1', player: 'WHITE', type: 'MAN' };
      board[4][3] = { id: 'w2', player: 'WHITE', type: 'MAN' };
      board[2][3] = { id: 'w3', player: 'WHITE', type: 'MAN' };
      // Cyan pieces
      board[5][2] = { id: 'c1', player: 'CYAN', type: 'MAN' };
      board[6][3] = { id: 'c2', player: 'CYAN', type: 'MAN' };
      return board;
    },
    solution: [
      { from: { r: 5, c: 2 }, to: { r: 4, c: 2 } }, // Bait
      { from: { r: 6, c: 3 }, to: { r: 1, c: 3 } }  // Cyan sweeps and gets a King
    ],
    opponentsMoves: [
      { from: { r: 3, c: 1 }, to: { r: 5, c: 2 } }  // White jumps
    ]
  },
  {
    id: 'dama_puz_4',
    nameKu: '٤. تەڵەی شاکان 🏆',
    nameAr: '٤. كش ملك الدامة الملكية',
    nameEn: '4. Royal Crown Squeeze',
    descKu: 'لەم مەتەڵە ترسناکەدا، دوو شاهی سپی گەمارۆدراون. پێویستە بە سێ جوڵە بردنەوە بەدەستبهێنیت بە کایەکردنی لای ڕاست.',
    descAr: 'في هذا اللغز الفريد، شواية الخصم الملكية محاصرة تماماً. اعثر على هجوم من ٣ خطوات لتفوز بالكامل.',
    descEn: 'Two White Kings are loose. Trap them by triggering consecutive orthogonal corner captures.',
    tipKu: 'بەردی خۆت لە (6, 5) بجوڵێنە بۆ پێشەوە تا تەڵەکە داخەیت.',
    tipAr: 'حرّك القطعة من (6, 5) خطوة للأمام.',
    tipEn: 'Tip: Push col 5 row 6 forward to trigger the multi-jump response.',
    boardSetup: () => {
      const board = createEmptyBoard();
      // White pieces
      board[4][5] = { id: 'w1', player: 'WHITE', type: 'KING' };
      board[2][2] = { id: 'w2', player: 'WHITE', type: 'KING' };
      // Cyan pieces
      board[6][5] = { id: 'c1', player: 'CYAN', type: 'MAN' };
      board[5][3] = { id: 'c2', player: 'CYAN', type: 'MAN' };
      board[7][2] = { id: 'c3', player: 'CYAN', type: 'KING' };
      return board;
    },
    solution: [
      { from: { r: 6, c: 5 }, to: { r: 5, c: 5 } }, // Cyan advances
      { from: { r: 7, c: 2 }, to: { r: 1, c: 2 } }  // King captures White King
    ],
    opponentsMoves: [
      { from: { r: 4, c: 5 }, to: { r: 6, c: 5 } }  // Forced jump
    ]
  }
];
