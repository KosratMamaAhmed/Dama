import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Lock, Sword, Check, Coins, ChevronLeft, Bot, Award } from 'lucide-react';

interface Boss {
  id: number;
  nameKu: string;
  nameAr: string;
  nameEn: string;
  titleKu: string;
  titleAr: string;
  titleEn: string;
  descKu: string;
  descAr: string;
  descEn: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  avatarId: string;
  bounty: number;
}

export const CAMPAIGN_BOSSES: Boss[] = [
  {
    id: 1,
    nameKu: 'لاوچاک',
    nameAr: 'الشاب الواعد',
    nameEn: 'Laochak',
    titleKu: 'شاگردی یەکەم 🔰',
    titleAr: 'المبتدئ الواعد',
    titleEn: 'First Apprentice',
    descKu: 'ئاستی ئاسان. ئارەزووی لە جوڵەی خێرا هەیە بەبێ پلان.',
    descAr: 'مستوى سهل. يفضل الحركات العشوائية السريعة بدون تخطيط.',
    descEn: 'Easy difficulty. Enjoys rapid and unplanned moves.',
    difficulty: 'EASY',
    avatarId: 'kurdish_man',
    bounty: 10
  },
  {
    id: 2,
    nameKu: 'کۆسا',
    nameAr: 'خبير كوي',
    nameEn: 'Kosa',
    titleKu: 'شارەزای سەرەتایی 🌱',
    titleAr: 'هاوي الدامة المبتدئ',
    titleEn: 'Dama Hobbyist',
    descKu: 'ئاستی ئاسان. زیاتر دەیەوێت سەرەتا ناوەند بگرێت.',
    descAr: 'مستوى سهل. يحاول السيطرة على مربعات الوسط مبكراً.',
    descEn: 'Easy difficulty. Focuses on asserting early control of the center.',
    difficulty: 'EASY',
    avatarId: 'tiger',
    bounty: 15
  },
  {
    id: 3,
    nameKu: 'مام ڕێبوار',
    nameAr: 'العم ريبوار',
    nameEn: 'Mam Rebwar',
    titleKu: 'ئەزموونداری گوند 🪵',
    titleAr: 'حكيم القرية الهادئ',
    titleEn: 'Village Elder',
    descKu: 'ئاستی ناوەند. هێمن کار دەکات و زیاتر بەرگری کلاسیک دەکات.',
    descAr: 'مستوى متوسط. يلعب بهدوء ويركز على الحياطة والدفاع الكلاسيكي.',
    descEn: 'Medium difficulty. Plays defensively using traditional side walls.',
    difficulty: 'MEDIUM',
    avatarId: 'elder',
    bounty: 20
  },
  {
    id: 4,
    nameKu: 'ئاسنگەر',
    nameAr: 'الحداد الثائر',
    nameEn: 'Asingar',
    titleKu: 'پۆڵایینی یاریگا ⚔️',
    titleAr: 'القبضة الحديدية الغاضبة',
    titleEn: 'Iron Fist Striker',
    descKu: 'ئاستی ناوەند. هێرشبەری خێرا دەکاتە ئامانج بۆ خواردن.',
    descAr: 'مستوى متوسط. يحب كسر الخطوط والهجوم لتبادل الأكل فوراً.',
    descEn: 'Medium difficulty. Loves breaking ranks and forcing captures.',
    difficulty: 'MEDIUM',
    avatarId: 'warrior',
    bounty: 25
  },
  {
    id: 5,
    nameKu: 'خاتوون نیشتمان',
    nameAr: 'السيدة نيشتمان',
    nameEn: 'Khatun Nishtiman',
    titleKu: 'داڕێژەری جادوو 🌟',
    titleAr: 'سيدة الأفخاخ الذكية',
    titleEn: 'Trap Weaver',
    descKu: 'ئاستی ناوەند. تەڵە دادەنێت و بەردەکانت ڕادەکێشێتە ناو کێشە.',
    descAr: 'مستوى متوسط. تقوم بنصب شراك ذكية وتسحب أحجارك لمواقف محروقة.',
    descEn: 'Medium difficulty. Crafty placement of baits to trigger multi-jumps.',
    difficulty: 'MEDIUM',
    avatarId: 'kurdish_woman',
    bounty: 30
  },
  {
    id: 6,
    nameKu: 'هەڵۆی کۆساڵان',
    nameAr: 'صقر كوسالان',
    nameEn: 'Haloyi Kosalan',
    titleKu: 'پارێزەری کوێستان 🦅',
    titleAr: 'صقر الجبل الصامد',
    titleEn: 'Mountain Falcon',
    descKu: 'ئاستی قورس. هێڵەکان زۆر بە دروستی دروست دەکات.',
    descAr: 'مستوى صعب. يقوم ببناء هياكل الجدران بدقة شديدة وعناية.',
    descEn: 'Hard difficulty. Focuses on structural chain integrity across lines.',
    difficulty: 'HARD',
    avatarId: 'hawk',
    bounty: 35
  },
  {
    id: 7,
    nameKu: 'سیاچەمانە',
    nameAr: 'سياجمانه اللحوح',
    nameEn: 'Siyachemana',
    titleKu: 'ئاوازەکەر 🎵',
    titleAr: 'عازف التكتيك البطيء',
    titleEn: 'Rhythmic Strategist',
    descKu: 'ئاستی قورس. پشوودرێژە و چاوەڕێ دەکات تا هەڵە بکەیت.',
    descAr: 'مستوى صعب. صبور للغاية وينتظر حدوث أقل فجوة في تنظيم أحجارك.',
    descEn: 'Hard difficulty. Extremely patient, waits for holes in your structure.',
    difficulty: 'HARD',
    avatarId: 'elder',
    bounty: 40
  },
  {
    id: 8,
    nameKu: 'کاوەی مۆدێرن',
    nameAr: 'كاوه المعاصر',
    nameEn: 'Kaway Modern',
    titleKu: 'داهێنەری پێشکەوتوو ⚡',
    titleAr: 'مخترع الماتريكس الذكي',
    titleEn: 'Modern Innovator',
    descKu: 'ئاستی قورس. خێرا کینگ (پادشا) دروست دەکات و هێڵەکان دەشکێنێت.',
    descAr: 'مستوى صعب. يسعى لترقية أحجاره بسرعة لكي تكتسح كامل اللوحة.',
    descEn: 'Hard difficulty. Moves to promote to Kings fast to dominate files.',
    difficulty: 'HARD',
    avatarId: 'cyber',
    bounty: 45
  },
  {
    id: 9,
    nameKu: 'ژەنەڕاڵی کارامە',
    nameAr: 'الجنرال الصارم',
    nameEn: 'General Karama',
    titleKu: 'سەرکردەی باڵا 🛡️',
    titleAr: 'القائد الحربي المهيب',
    titleEn: 'Grand General',
    descKu: 'ئاستی زۆرزان. خاوەن پلان فەرمی و زۆر وردی مێژوویی.',
    descAr: 'مستوى خبير. ذو استراتيجية متكاملة تمنع ثغرات الزوايا والوسط.',
    descEn: 'Expert difficulty. Operates with precise search lookahead and positioning.',
    difficulty: 'EXPERT',
    avatarId: 'crown',
    bounty: 55
  },
  {
    id: 10,
    nameKu: 'شای شارەزا',
    nameAr: 'الملك الخبير',
    nameEn: 'Shayi Sharaza',
    titleKu: 'ئوستادی بادینان 👑',
    titleAr: 'أستاذ مجالس الدامة',
    titleEn: 'Sage of Badinan Cups',
    descKu: 'ئاستی زۆرزان. شارەزایی تەواو لە بڵاوکردنەوەی بەردەکان.',
    descAr: 'مستوى خبير. أستاذ العريقة الدامة وصاحب أفضل تكتيك لصد الفتحات.',
    descEn: 'Expert difficulty. Excellent piece distribution and board geometry.',
    difficulty: 'EXPERT',
    avatarId: 'grandmaster',
    bounty: 70
  },
  {
    id: 11,
    nameKu: 'ڕابەری دێرین',
    nameAr: 'المرشد القديم',
    nameEn: 'Rabari Derin',
    titleKu: 'ڕابەری مەجلیسەکان 🌟',
    titleAr: 'المرشد المئوي الروحي',
    titleEn: 'Grand Elder Mentor',
    descKu: 'ئاستی زۆرزان. شێوازی بەرگری زۆر پتەوە و هیچ ترپەی پێوە نییە.',
    descAr: 'مستوى خبير. دفاع حديدي مستميت لا يترك ثغرة أو تلمس حافة.',
    descEn: 'Expert difficulty. Maximum protection grid structure.',
    difficulty: 'EXPERT',
    avatarId: 'kurdish_man',
    bounty: 85
  },
  {
    id: 12,
    nameKu: 'مەلیکی دامە',
    nameAr: 'ملك الدامة الكردية',
    nameEn: 'Maliki Dama',
    titleKu: 'سولتان 👑',
    titleAr: 'سلطان الدامة الخالد',
    titleEn: 'Sultan of Dama',
    descKu: 'ئاستی کارامەی بێکۆتایی. زۆرزانترین ئیمپراتۆر کە هیچ هەڵەیەک ناکات!',
    descAr: 'مستوى خبير فائق. الإمبراطور الأخير الذي لا يخطيء الحساب خطوة واحدة!',
    descEn: 'Expert (Grandmaster) difficulty. Maximum depth search. Flawless engine play.',
    difficulty: 'EXPERT',
    avatarId: 'grandmaster',
    bounty: 120
  }
];

interface CampaignPanelProps {
  lang: 'KU' | 'AR' | 'EN';
  onClose: () => void;
  onChallenge: (boss: Boss) => void;
}

export default function CampaignPanel({ lang, onClose, onChallenge }: CampaignPanelProps) {
  // Get progress from localStorage
  const getUnlockedBossIndex = (): number => {
    const val = localStorage.getItem('dama_campaign_unlocked_index');
    return val ? parseInt(val, 10) : 1; // Unlocked up to Boss ID 1 (1-indexed based on ID)
  };

  const unlockedId = getUnlockedBossIndex();

  const handleBossClick = (boss: Boss) => {
    if (boss.id <= unlockedId) {
      onChallenge(boss);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-md flex items-center justify-center z-[110] p-4 pt-[env(safe-area-inset-top,1rem)] pb-[env(safe-area-inset-bottom,1rem)] pl-[env(safe-area-inset-left,1rem)] pr-[env(safe-area-inset-right,1rem)] overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-amber-500/35 w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col h-[600px] max-h-[90vh]"
      >
        {/* Header containing details */}
        <div className="p-5 md:p-6 bg-slate-950/60 border-b border-amber-500/15 flex items-center justify-between relative">
          {/* Floating Clean Back Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/5 hover:bg-neutral-800 border border-white/10 hover:border-amber-500/50 p-1.5 rounded-lg text-neutral-450 hover:text-amber-400 transition-all active:scale-90 cursor-pointer flex items-center justify-center z-10 shadow-lg"
            title={lang === 'KU' ? 'گەڕانەوە' : 'Back'}
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/25">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-[#fbbf24] uppercase">
                {lang === 'KU' ? 'مۆدی کاروانی پاڵەوانێتی' : lang === 'AR' ? 'طور بطولة الدامة الفردية' : 'Offline Campaign Gateway'}
              </p>
              <h2 className="text-lg md:text-xl font-black text-white leading-tight">
                {lang === 'KU' ? 'کێبڕکێی ١٢ بەهێزترین مەکینە' : lang === 'AR' ? 'تحدي ١٢ مستشار من الدكاء الاصطناعي' : 'Defeat 12 Elite Masters'}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Board */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 bg-slate-950/20 custom-scrollbar">
          <div className="p-3 mb-5 rounded-2xl bg-amber-550/5 border border-amber-500/10 flex items-center gap-3 text-xs text-amber-300">
            <span className="text-base">🏆</span>
            <p>
              {lang === 'KU' 
                ? 'بەردەوام بە لە شکاندنی مەکینەکان یەک لە دوای یەک بۆ بەخشینی کۆینی زۆر و ناونیشانی شاهانە! هەر مەکینەیە خاوەن پێگەی تایبەتی هەیە.'
                : lang === 'AR'
                ? 'تقدم في البطولة عبر إلحاق الهزيمة بمستشار تلو الآخر لفتح الألقاب الملكية والمكافآت السخية.'
                : 'Defeat the campaign AI bosses in sequential order to progress, claiming generous coin bounties and unlocking legendary profiles.'}
            </p>
          </div>

          {/* 12 Bosses List/Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAMPAIGN_BOSSES.map((boss) => {
              const isUnlocked = boss.id <= unlockedId;
              const isBeaten = boss.id < unlockedId;
              const isActive = boss.id === unlockedId;

              return (
                <div
                  key={boss.id}
                  className={`relative p-4 rounded-2xl border transition-all flex gap-3.5 items-center overflow-hidden h-[115px] ${
                    isUnlocked
                      ? isBeaten 
                        ? 'bg-emerald-950/15 border-emerald-500/20 shadow-sm'
                        : isActive
                        ? 'bg-amber-500/5 border-amber-500/35 shadow-[0_4px_20px_rgba(245,158,11,0.08)] ring-1 ring-amber-500/20'
                        : 'bg-slate-950/40 border-slate-800'
                      : 'bg-slate-950/80 border-slate-950 opacity-45 select-none'
                  }`}
                >
                  {/* Status Banner ribbon */}
                  {isBeaten && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[8px] font-black px-2.5 py-0.5 rounded-bl-lg flex items-center gap-0.5 uppercase tracking-wider">
                      <Check className="w-2 h-2 stroke-[4]" /> {lang === 'KU' ? 'شکێندرا' : lang === 'AR' ? 'تم الفوز' : 'Defeated'}
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black px-2.5 py-0.5 rounded-bl-lg flex items-center gap-0.5 uppercase tracking-wider animate-pulse">
                      ⚔️ {lang === 'KU' ? 'کارا' : lang === 'AR' ? 'الهدف الحاضر' : 'Current'}
                    </div>
                  )}

                  {/* Left: Avatar representation */}
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border font-bold text-2xl relative ${
                      isUnlocked 
                        ? 'bg-slate-900 border-amber-500/20' 
                        : 'bg-slate-950 border-slate-800'
                    }`}>
                      {/* Placeholder emoji mapping */}
                      {boss.avatarId === 'elder' ? '👴' : boss.avatarId === 'warrior' ? '⚔️' : boss.avatarId === 'hawk' ? '🦅' : boss.avatarId === 'tiger' ? '🐅' : boss.avatarId === 'cyber' ? '🎯' : boss.avatarId === 'crown' ? '👑' : boss.avatarId === 'grandmaster' ? '🎓' : boss.avatarId === 'kurdish_woman' ? '👩‍🦰' : '👨‍🦱'}

                      {/* Locked Overlay badge */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-slate-950/80 rounded-full flex items-center justify-center text-xs">
                          <Lock className="w-4 h-4 text-neutral-500" />
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-slate-950 px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider text-neutral-400 border border-white/5">
                      #{boss.id}
                    </span>
                  </div>

                  {/* Body description */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">
                        {lang === 'KU' ? boss.nameKu : lang === 'AR' ? boss.nameAr : boss.nameEn}
                      </h4>
                      <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                        boss.difficulty === 'EASY' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          : boss.difficulty === 'MEDIUM'
                          ? 'bg-sky-500/10 text-sky-450 border border-sky-500/10'
                          : boss.difficulty === 'HARD'
                          ? 'bg-orange-500/10 text-orange-450 border border-orange-500/10'
                          : 'bg-rose-500/10 text-rose-450 border border-rose-555/15'
                      }`}>
                        {boss.difficulty}
                      </span>
                    </div>

                    <p className="text-[9.5px] text-[#fbbf24] font-black mt-0.5 uppercase tracking-wide">
                      {lang === 'KU' ? boss.titleKu : lang === 'AR' ? boss.titleAr : boss.titleEn}
                    </p>

                    <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {lang === 'KU' ? boss.descKu : lang === 'AR' ? boss.descAr : boss.descEn}
                    </p>
                  </div>

                  {/* Quick call to action button */}
                  <div className="text-right">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleBossClick(boss)}
                        className={`px-3 py-2 text-xs font-black rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 border-amber-600 hover:brightness-110 shadow-[0_4px_12px_rgba(245,158,11,0.22)]'
                            : 'bg-white/5 hover:bg-white/10 text-neutral-200 border-white/5'
                        }`}
                      >
                        <Sword className="w-3.5 h-3.5 fill-current" />
                        <span>{lang === 'KU' ? 'شەڕ' : lang === 'AR' ? 'تحدي' : 'Fight'}</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-[9.5px] font-bold text-neutral-500">
                        <Lock className="w-3 h-3" />
                        <span>{lang === 'KU' ? 'داخراوە' : lang === 'AR' ? 'مقفل' : 'Locked'}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] font-black text-[#fbbf24]">
                      <Coins className="w-3 h-3" />
                      <span>{boss.bounty}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
