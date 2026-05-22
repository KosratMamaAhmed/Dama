import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// A collection of beautiful and blessed Arabic Dhikrs
const ARABIC_DHIKRS = [
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
  "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ وَأَتُوبُ إِلَيْهِ",
  "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ",
  "سُبْحَانَ اللَّهِ الْعَظِيمِ",
  "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
  "اللَّهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا",
  "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
  "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ",
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
  "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
  "اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ"
];

export default function DhikrNotification() {
  const [currentDhikr, setCurrentDhikr] = useState<string | null>(null);

  useEffect(() => {
    // Phase 1: Show first dhikr after 15 seconds
    const initialDelay = setTimeout(() => {
      triggerDhikr();
    }, 15000);

    // Phase 2: Show every 30 seconds from then on (30000ms interval)
    const interval = setInterval(() => {
      triggerDhikr();
    }, 30000);

    function triggerDhikr() {
      const randomIndex = Math.floor(Math.random() * ARABIC_DHIKRS.length);
      setCurrentDhikr(ARABIC_DHIKRS[randomIndex]);

      // Keep it visible for exactly 2 seconds (2000ms) as requested
      setTimeout(() => {
        setCurrentDhikr(null);
      }, 2000);
    }

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {currentDhikr && (
        <motion.div
          key={currentDhikr}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 16, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-2.5 rounded-full bg-[#031c12]/95 border-2 border-emerald-500/50 shadow-[0_12px_40px_rgba(16,185,129,0.4)] text-emerald-300 text-sm font-bold flex items-center gap-3 backdrop-blur-xl cursor-default pointer-events-none text-center select-none"
          dir="rtl"
          id="dhikr-overlay-bubble"
        >
          {/* Glowing Green Animated Pulse dot */}
          <div className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          </div>

          {/* Elegant typography context with traditional border accent */}
          <div className="border-r border-emerald-500/25 pr-3 pl-1 flex flex-col items-start text-right">
            <span className="text-[9px] text-emerald-400/70 font-black tracking-widest uppercase leading-none mb-0.5 font-sans">
              Remembrance • زِكْرٌ طَيِّبٌ
            </span>
            <span className="font-extrabold text-[13px] sm:text-[14.5px] leading-tight select-none text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)] font-sans">
              {currentDhikr}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
