import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, GraduationCap, Award, ShieldAlert, Zap, Compass, Star } from 'lucide-react';

interface AcademyPanelProps {
  lang: 'KU' | 'AR' | 'EN';
  onClose: () => void;
}

interface Lesson {
  id: number;
  titleKu: string;
  titleAr: string;
  titleEn: string;
  descKu: string;
  descAr: string;
  descEn: string;
  tipKu: string;
  tipAr: string;
  tipEn: string;
  icon: React.ReactNode;
  boardTextKu: string;
  boardTextAr: string;
  boardTextEn: string;
  // A simple 4x4 coordinate-based demo setup
  pieces: { r: number; c: number; player: 'CYAN' | 'WHITE'; type: 'MAN' | 'KING'; id: string }[];
  highlightSquares: { r: number; c: number; color: string }[];
  animSequence: { from: { r: number; c: number }; to: { r: number; c: number }; arrowDirs?: string[] }[];
}

export default function AcademyPanel({ lang, onClose }: AcademyPanelProps) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [animStep, setAnimStep] = useState(0);

  const lessons: Lesson[] = [
    {
      id: 1,
      titleKu: 'وانی ١: بنچینەی جووڵەی کوردی ✈️',
      titleAr: 'الدرس ١: حركات الاتجاه العمودي الكلاسيكية',
      titleEn: 'Lesson 1: The Orthogonal Way',
      descKu: 'لە یاری دامەی کوردیدا، بەردەکان بە هیچ شێوەیەک بە لاری (شێوازی تەور و کەرتی) ناجوڵێن! بەڵکو تەنها بۆ پێشەوە، لای چەپ، و لای ڕاست دەچن. جوڵە بۆ دواوە قەدەغەیە بۆ بەردی ئاسایی.',
      descAr: 'في الدامة الكردية، تتحرك القطع حصرياً للأمام، لليسار، ولليمين بشكل مستقيم. الحركات القطرية (الوربية) وحركة التراجع للخلف ممنوعة تماماً للأفواج العادية.',
      descEn: 'In Kurdish Dama, diagonal steps are strictly forbidden! Regular pieces move only orthogonally: Forward, Left, or Right. Stepping backward is banned for normal checkers.',
      tipKu: 'بەردی ئاسایی تەنها یەک خانە بەرەو پێشەوە یان تەنیشتەکان دەچێت.',
      tipAr: 'يتحرك الحجر خطوة واحدة فقط للأمام أو الجانب بشكل مستقيم.',
      tipEn: 'A regular checker moves exactly one square forward or sideways.',
      icon: <Compass className="w-6 h-6 text-cyan-400" />,
      boardTextKu: 'پیشاندانی جووڵەی ڕاستەوخۆ و لایەنی',
      boardTextAr: 'عرض مرئي للحركة الأمامية والجانبية',
      boardTextEn: 'Orthogonal moves visual animation',
      pieces: [
        { r: 2, c: 1, player: 'CYAN', type: 'MAN', id: 'l1_p1' }
      ],
      highlightSquares: [
        { r: 1, c: 1, color: 'bg-emerald-500/20 border-emerald-400/50' }, // Forward
        { r: 2, c: 0, color: 'bg-emerald-500/20 border-emerald-400/50' }, // Left
        { r: 2, c: 2, color: 'bg-emerald-500/20 border-emerald-400/50' }  // Right
      ],
      animSequence: [
        { from: { r: 2, c: 1 }, to: { r: 1, c: 1 } }, // Forward
        { from: { r: 1, c: 1 }, to: { r: 1, c: 2 } }, // Right
        { from: { r: 1, c: 2 }, to: { r: 1, c: 1 } }
      ]
    },
    {
      id: 2,
      titleKu: 'وانی ٢: خواردنی زۆرەملێ ⚠️',
      titleAr: 'الدرس ٢: قانون الأكل الإجباري الصارم',
      titleEn: 'Lesson 2: Mandatory Captures',
      descKu: 'خواردن لەم یارییەدا یاسایەکی حەتمییە! ئەگەر بەردێکی ڕکابەر بکەوێتە پێش یان لای بەردەکەت، و پشتەوەی چۆڵ بێت، دەبێت باز بدەیت بەسەریدا و بیخۆیت. یارییەکە ڕێگەت پێ نادات هیچ جووڵەیەکی تر بکەیت.',
      descAr: 'التقاط وأكل الحجر المجاور هو تصرف إجباري بقوة القانون! إذا كان حجر الخصم مجاوراً وهنالك مساحة فارغة خلفه، فيجب عليك تخطيه وأكله فوراً، ولن تقبل خطتك بأي حركة بديلة.',
      descEn: 'Jumping and capturing adjacent opponent pieces is 100% compulsory! If a rival checker is adjacent (forward or sideways) and there is an empty space directly beyond, you MUST execute the jump.',
      tipKu: 'خواردنی بەردی سپی ناچارییە چونکە خانەی دوایی بەتاڵە.',
      tipAr: 'أكل الحجر الأبيض إجباري لتواجد مسافة فارغة للهبوط.',
      tipEn: 'Capturing the adjacent White checker is mandatory because the space behind is empty.',
      icon: <ShieldAlert className="w-6 h-6 text-amber-500 animate-pulse" />,
      boardTextKu: 'خواردنی زۆرەملێ: بازدان بەسەر سپیدا',
      boardTextAr: 'لقطة الأكل الإجباري: القفز لالتصام الأبيض',
      boardTextEn: 'Mandatory capture: jump over White',
      pieces: [
        { r: 2, c: 1, player: 'CYAN', type: 'MAN', id: 'l2_p1' },
        { r: 1, c: 1, player: 'WHITE', type: 'MAN', id: 'l2_p2' }
      ],
      highlightSquares: [
        { r: 0, c: 1, color: 'bg-rose-500/20 border-rose-400/50 outline-amber-400' }
      ],
      animSequence: [
        { from: { r: 2, c: 1 }, to: { r: 0, c: 1 } } // Jump
      ]
    },
    {
      id: 3,
      titleKu: 'وانی ٣: زنجیرە خواردنی چەندین بەرد ⚡',
      titleAr: 'الدرس ٣: سلسلة القفزات المتتالية المدمرة',
      titleEn: 'Lesson 3: Multi-Jump Captures',
      descKu: 'ئەگەر دوای نیشتنەوە لە بەردەکە دووبارە دۆخی خواردن هەبێت، نابێت لێی بوەستیت! دەبێت سەرجەم زنجیرەکە بە شێوەی کارلێککار تەواو بکەیت.',
      descAr: 'إذا توفرت فرصة قفز إضافية متتالية بعد الهبوط، فيجب مواصلة الحفل وأكل كافة الأحجار المحاذية تباعاً دون أي وقوف.',
      descEn: 'If landing from a jump leaves you positioned for another capture, you cannot stop. You must fully execute the entire consecutive multi-jump cascade chain!',
      tipKu: 'خواردنی زنجیرەیی یەکبەدوایەک بەبێ وەستان بەردەوام دەبێت.',
      tipAr: 'يستمر الأكل المتتالي في نفس الدور حتى انقطاع مسارات القفز.',
      tipEn: 'Consecutive jumps must be chained continuously in a single turn.',
      icon: <Zap className="w-6 h-6 text-yellow-400 animate-bounce" />,
      boardTextKu: 'گرتنی دوو بەردی سپی بە یەک بەرد',
      boardTextAr: 'سلسلة التهام ثنائية مدمرة',
      boardTextEn: 'Double jump chain illustration',
      pieces: [
        { r: 3, c: 1, player: 'CYAN', type: 'MAN', id: 'l3_p1' },
        { r: 2, c: 1, player: 'WHITE', type: 'MAN', id: 'l3_p2' },
        { r: 1, c: 2, player: 'WHITE', type: 'MAN', id: 'l3_p3' }
      ],
      highlightSquares: [
        { r: 1, c: 1, color: 'bg-amber-500/20' },
        { r: 1, c: 3, color: 'bg-rose-500/20' }
      ],
      animSequence: [
        { from: { r: 3, c: 1 }, to: { r: 1, c: 1 } }, // Step 1
        { from: { r: 1, c: 1 }, to: { r: 1, c: 3 } }  // Step 2
      ]
    },
    {
      id: 4,
      titleKu: 'وانی ٤: بەرزبوونەوە بۆ (شا) و جووڵەی مەکینە 👑',
      titleAr: 'الدرس ٤: الترقية إلى شاه والحركة الحرة اللامحدودة',
      titleEn: 'Lesson 4: King Promotion & Sliders',
      descKu: 'کاتێک بەردەکەت دەگاتە دواین هێڵی بەرامبەر، وەردەگۆڕێت بۆ (شا) و نازناوی "پادشا" وەردەگرێت. پادشا دەتوانێت بە چوار لایەکەدا بۆ پێش و دواوە هەر ژمارەیەک خانەی بەتاڵ ببڕێت و تێر بخوات!',
      descAr: 'عندما ينجح حجر عادي في عبور رقعة الخصم حتى السطر الأخير، يُرقى فوراً لمرتبة (شاه) ويكتسب قدرة السير الحر والانزلاق بأي عدد من المربعات الفارغة مع إمكانية الأكل للخلف!',
      descEn: 'Once a normal piece marks its way to the baseline of your opponent, it is promoted to a King. Kings command unlimited orthogonal range sliding powers (like a Rook in Chess) in all directions!',
      tipKu: 'پادشا (شا) دەتوانێت بە چوار ئاراستەدا بە سەرانسەری خانەکاندا بخلیسکێت.',
      tipAr: 'يمكن للشاه الانزلاق من أي مسافة قانونية عبر المربعات الفارغة.',
      tipEn: 'Kings slide over any distance of empty orthogonal squares.',
      icon: <Award className="w-6 h-6 text-amber-400" />,
      boardTextKu: 'شای شین دەتوانێت بە تەواوی یاریگادا بخلیسکێت',
      boardTextAr: 'الشاه المنزلق يتحرك بأعداد حرة وبكافة الجهات',
      boardTextEn: 'Cyan King slides and targets any distance',
      pieces: [
        { r: 3, c: 0, player: 'CYAN', type: 'KING', id: 'l4_p1' },
        { r: 3, c: 3, player: 'WHITE', type: 'MAN', id: 'l4_p2' }
      ],
      highlightSquares: [
        { r: 3, c: 1, color: 'bg-indigo-500/10' },
        { r: 3, c: 2, color: 'bg-indigo-500/10' },
        { r: 3, c: 4, color: 'bg-rose-500/20' } // Jump landing
      ],
      animSequence: [
        { from: { r: 3, c: 0 }, to: { r: 3, c: 4 } } // Sliding capture!
      ]
    }
  ];

  const lesson = lessons[currentLesson];

  const nextLesson = () => {
    setAnimStep(0);
    setCurrentLesson((prev) => (prev + 1) % lessons.length);
  };

  const prevLesson = () => {
    setAnimStep(0);
    setCurrentLesson((prev) => (prev - 1 + lessons.length) % lessons.length);
  };

  // Run the visual step-by-step animation loop
  React.useEffect(() => {
    const timer = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % (lesson.animSequence.length + 1));
    }, 1800);
    return () => clearInterval(timer);
  }, [currentLesson, lesson.animSequence.length]);

  // Determine current animated position
  const getAnimatedPos = (pId: string) => {
    const p = lesson.pieces.find(x => x.id === pId);
    if (!p) return { r: 0, c: 0 };
    if (p.player === 'CYAN' && animStep > 0 && animStep <= lesson.animSequence.length) {
      const step = lesson.animSequence[animStep - 1];
      return step.to;
    }
    return { r: p.r, c: p.c };
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-amber-500/40 w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col md:flex-row h-auto md:h-[580px]"
      >
        {/* Left/Top Content Area */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-amber-500/15">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                <GraduationCap className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase">
                  {lang === 'KU' ? 'ئەکادیمیای دامەی کوردی' : lang === 'AR' ? 'أكاديمية الدامة الكردية' : 'Kurdish Dama Academy'}
                </span>
                <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {lang === 'KU' ? 'فێربوونی یاساکان' : lang === 'AR' ? 'تعلم مهارات وخطط اللعب' : 'Learn Dama Strategy'}
                </h1>
              </div>
            </div>

            {/* Selector Dots */}
            <div className="flex gap-1.5 mb-6">
              {lessons.map((l, ind) => (
                <button
                  key={l.id}
                  onClick={() => { setCurrentLesson(ind); setAnimStep(0); }}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${ind === currentLesson ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-600'}`}
                />
              ))}
            </div>

            {/* Heading and Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {lesson.icon}
                <h2 className="text-base font-black text-[#fbbf24]">
                  {lang === 'KU' ? lesson.titleKu : lang === 'AR' ? lesson.titleAr : lesson.titleEn}
                </h2>
              </div>
              <p className="text-xs md:text-sm text-neutral-300 font-medium leading-relaxed bg-slate-950/40 p-4 rounded-2xl border border-white/5 shadow-inner">
                {lang === 'KU' ? lesson.descKu : lang === 'AR' ? lesson.descAr : lesson.descEn}
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-white/5">
            <button
              onClick={prevLesson}
              className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-neutral-300 hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer border border-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{lang === 'KU' ? 'پێشوو' : lang === 'AR' ? 'السابق' : 'Previous'}</span>
            </button>

            <span className="text-xs font-mono text-neutral-500 font-bold">
              {currentLesson + 1} / {lessons.length}
            </span>

            <button
              onClick={nextLesson}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:scale-[1.03] active:scale-95 text-black rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-amber-500/10 border border-yellow-300/30"
            >
              <span>{lang === 'KU' ? 'داهاتوو' : lang === 'AR' ? 'التالي' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right/Bottom Interactive Graphics Demo Area */}
        <div className="flex-1 bg-black/40 p-6 md:p-8 flex flex-col items-center justify-center relative min-h-[280px]">
          {/* Decorative Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />

          <span className="absolute top-4 text-[10px] font-mono font-black text-neutral-500 uppercase tracking-widest flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500 animate-spin" />
            {lang === 'KU' ? lesson.boardTextKu : lang === 'AR' ? lesson.boardTextAr : lesson.boardTextEn}
          </span>

          {/* 4x4 Miniature Grid */}
          <div className="relative border-4 border-slate-700 bg-slate-950 p-2 rounded-2xl shadow-2xl grid grid-cols-4 gap-1.5 w-60 h-60 z-10 overflow-hidden">
            {Array.from({ length: 16 }).map((_, idx) => {
              const r = Math.floor(idx / 4);
              const c = idx % 4;
              const isDark = (r + c) % 2 === 1;

              // Check highlights
              const highlight = lesson.highlightSquares.find(sq => sq.r === r && sq.c === c);

              // Check piece animations
              const pieceObj = lesson.pieces.find(p => {
                const currentPos = getAnimatedPos(p.id);
                return currentPos.r === r && currentPos.c === c;
              });

              // Check if white piece was captured in animation
              let isCaptured = false;
              if (pieceObj?.player === 'WHITE' && animStep > 0) {
                // simple check for capture lessons
                if (lesson.id === 2 && animStep === 1) isCaptured = true;
                if (lesson.id === 3 && animStep >= 1) {
                  if (r === 2 && c === 1 && animStep >= 1) isCaptured = true;
                  if (r === 1 && c === 2 && animStep >= 2) isCaptured = true;
                }
                if (lesson.id === 4 && animStep === 1 && r === 3 && c === 3) isCaptured = true;
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative w-full h-full rounded-md flex items-center justify-center transition-all duration-300
                    ${isDark ? 'bg-slate-900 border border-slate-850' : 'bg-slate-950'}
                    ${highlight ? `${highlight.color} border-2 ring-2 ring-emerald-400/20` : ''}
                  `}
                >
                  {/* Coordinate tracker */}
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono text-neutral-700 font-bold">
                    {r},{c}
                  </span>

                  {pieceObj && !isCaptured && (
                    <motion.div
                      layoutId={`acad_p_${pieceObj.id}`}
                      className={`w-[85%] h-[85%] rounded-full relative flex items-center justify-center border-2 border-slate-950 shadow-md ${
                        pieceObj.player === 'CYAN'
                          ? 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)] border-cyan-300'
                          : 'bg-neutral-100 shadow-[0_0_12px_rgba(255,255,255,0.3)] border-neutral-300'
                      }`}
                      animate={pieceObj.player === 'CYAN' ? { scale: [0.95, 1.05, 0.95] } : {}}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                    >
                      {pieceObj.type === 'KING' && (
                        <div className="w-5 h-5 flex items-center justify-center text-[10px] text-yellow-950 font-black">
                          👑
                        </div>
                      )}
                      {/* Inner stripe */}
                      <div className="absolute inset-1.5 rounded-full border border-dashed opacity-50 border-black/30" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Help bubble text */}
          <div className="mt-5 text-center px-4">
            <p className="text-[11px] text-amber-500/85 font-extrabold max-w-xs leading-relaxed animate-pulse">
              💡 {lang === 'KU' ? lesson.tipKu : lang === 'AR' ? lesson.tipAr : lesson.tipEn}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-xs font-black text-neutral-500 hover:text-white transition-all cursor-pointer bg-slate-900 p-2 rounded-xl border border-white/5"
          >
            ✕ {lang === 'KU' ? 'داخستن' : lang === 'AR' ? 'خروج' : 'Exit'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
