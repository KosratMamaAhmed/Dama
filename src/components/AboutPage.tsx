import React, { useEffect, useState } from 'react';
import { ArrowLeft, Facebook, Send, Globe, Info, Sparkles, ChevronUp, ChevronLeft } from 'lucide-react';

export const AboutPage: React.FC<{ onBack: () => void; lang: 'KU' | 'AR' | 'EN' }> = ({ onBack, lang }) => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openLink = (url: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error("Failed to open link", e);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white animate-fade-in overflow-x-hidden font-sans select-none" dir="rtl" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
      
      {/* پاشبنەمای بلور و ڕەنگەکان (Golden-Blue Gradient Vibe) */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-amber-900/20 via-indigo-900/10 to-transparent"></div>
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl transform-gpu"></div>
          <div className="absolute bottom-0 left-0 w-full h-[40vh] bg-gradient-to-t from-indigo-900/10 to-transparent"></div>
      </div>

      {/* باڕی سەرەوە (Toolbar) */}
      <div className="relative z-50 flex items-center justify-between px-6 bg-[#050505]/85 backdrop-blur-xl border-b border-white/5 sticky top-0"
           style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)', paddingBottom: '1rem' }}>
         <button onClick={onBack} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-300 hover:text-amber-400 active:scale-95 transition-all shadow-sm cursor-pointer">
          <ArrowLeft size={22} className="rotate-0 hover:scale-105" />
        </button>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-700/10 border border-amber-500/30 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">Premium</span>
        </div>
      </div>

      <div className="relative z-10 px-6 mt-8 max-w-lg mx-auto">
         
         {/* بەشی سەرەوەی بەرنامە (App Header) */}
         <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 group">
             <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-amber-400 via-indigo-400 to-amber-600 animate-[spin_6s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity blur-[4px]"></div>
             <div className="absolute inset-0.5 rounded-[2rem] bg-[#0a0a0a] z-10 flex items-center justify-center overflow-hidden border-4 border-[#050505]">
                {/* Visual Avatar fallback structure */}
                <div className="w-full h-full bg-gradient-to-b from-amber-500 to-amber-950 flex items-center justify-center">
                   <span className="text-4xl">👑</span>
                </div>
             </div>
         </div>

         <div className="text-center space-y-3 mb-10">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-yellow-500 tracking-tight">دامەی کوردی</h1>
            <p className="text-sm text-slate-300 leading-relaxed font-medium opacity-90 max-w-[280px] mx-auto">
               مەبەست لە دروستکردنی ئەم یاریە بەسەربردنی کاتێکی خۆشە بۆ یاریزانانی دامەی کوردی بە دیزاینێکی مۆدێرن و سەرنجڕاکێش.
            </p>
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 mt-2">
                <span className="text-slate-300 text-[11px] font-bold tracking-wider">وەشانی 1.0.0 PRO</span>
            </div>
         </div>

         {/* بەشی پەرەپێدەر (Developer Section) */}
         <div className="mb-10">
             <h2 className="text-lg font-bold text-white mb-4 px-2">پەرەپێدەر و دیزاینەر</h2>
             <div className="p-1 rounded-[2rem] bg-gradient-to-br from-amber-500/20 to-indigo-500/10 font-sans">
                 <div className="p-6 rounded-[1.9rem] bg-[#0a0a0a] relative overflow-hidden">
                     {/* Background Glow */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
                     
                     <div className="flex items-center justify-between mb-6 relative z-10">
                         <div>
                             <h3 className="text-xl font-bold text-white mb-1">کۆسرەت مامە ئەحمەد</h3>
                             <p className="text-sm text-amber-400/90 font-medium">دیزاینەری مۆدێرن و پەرەپێدەر</p>
                         </div>
                         <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/30 shadow-lg bg-slate-900 flex items-center justify-center">
                             <span className="text-2xl">👨‍💻</span>
                         </div>
                     </div>

                     <div className="h-[1px] w-full bg-white/10 mb-6"></div>

                     <div className="grid grid-cols-3 gap-3 relative z-10">
                         <button onClick={() => openLink('https://facebook.com/kosratmamaahmed')} className="flex flex-col items-center justify-center gap-2 py-3 bg-white/5 hover:bg-[#1877F2]/20 border border-white/5 hover:border-[#1877F2]/50 rounded-2xl transition-all active:scale-95 group cursor-pointer">
                             <Facebook size={20} className="text-slate-400 group-hover:text-[#1877F2] transition-colors" />
                             <span className="text-xs font-bold text-slate-300">فەیسبووک</span>
                         </button>
                         <button onClick={() => openLink('https://t.me/kosratmama')} className="flex flex-col items-center justify-center gap-2 py-3 bg-white/5 hover:bg-[#26A5E4]/20 border border-white/5 hover:border-[#26A5E4]/50 rounded-2xl transition-all active:scale-95 group cursor-pointer">
                             <Send size={20} className="text-slate-400 group-hover:text-[#26A5E4] transition-colors" />
                             <span className="text-xs font-bold text-slate-300">تێلیگرام</span>
                         </button>
                         <button onClick={() => openLink('https://biokurd.com/kosratdrugs')} className="flex flex-col items-center justify-center gap-2 py-3 bg-white/5 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/50 rounded-2xl transition-all active:scale-95 group cursor-pointer">
                             <Globe size={20} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                             <span className="text-xs font-bold text-slate-300">وێب سایت</span>
                         </button>
                     </div>
                 </div>
             </div>
         </div>

         {/* بەشی بەرنامەکان (Our Products) */}
         <div className="mb-10 text-right">
             <h2 className="text-lg font-bold text-white mb-4 px-2">بەرهەمە نایابەکانمان</h2>
             <div className="space-y-3">
                 
                 {/* Card 1 */}
                 <button onClick={() => openLink('https://play.google.com/store/apps/details?id=com.nmadev.darmanzany&hl=en')} className="w-full flex items-center p-4 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all active:scale-[0.98] group text-right cursor-pointer">
                     <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-amber-500/10 p-2 border border-white/10 flex items-center justify-center text-2xl">
                         💊
                     </div>
                     <div className="mr-4 flex-1">
                         <h4 className="text-base font-bold text-white mb-1">دەرمانزانی</h4>
                         <p className="text-xs text-slate-400">کۆڕسی فێربوونی دەرمانەکان</p>
                     </div>
                     <ChevronLeft size={20} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                 </button>

                 {/* Card 2 */}
                 <button onClick={() => openLink('https://play.google.com/store/apps/dev?id=6744749568381312149&hl=en')} className="w-full flex items-center p-4 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all active:scale-[0.98] group text-right cursor-pointer">
                     <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-blue-500/10 p-2 border border-white/10 flex items-center justify-center text-2xl">
                         🤖
                     </div>
                     <div className="mr-4 flex-1">
                         <h4 className="text-base font-bold text-white mb-1">بەرنامەی زیاتر</h4>
                         <p className="text-xs text-slate-400">هەموو بەرنامەکانم لە پلەی ستۆر - بە هەڵسەنگاندنەکانتان پشتگیریمان بکەن</p>
                     </div>
                     <ChevronLeft size={20} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                 </button>

                 {/* Card 3 */}
                 <button onClick={() => openLink('https://biokurd.com/kosratdrug')} className="w-full flex items-center p-4 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all active:scale-[0.98] group text-right cursor-pointer">
                     <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-purple-500/10 p-2 border border-white/10 flex items-center justify-center text-2xl">
                         🔗
                     </div>
                     <div className="mr-4 flex-1">
                         <h4 className="text-base font-bold text-white mb-1">لینکی بەرنامەکانم</h4>
                         <p className="text-xs text-slate-400">لێرە سەپۆرتمان بکەن</p>
                     </div>
                     <ChevronLeft size={20} className="text-slate-500 group-hover:text-amber-400 transition-colors" />
                 </button>

             </div>
         </div>

         {/* ئاگادارکردنەوەی پزیشکی (Medical Disclaimer) */}
         <div className="mb-12 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-right">
             <div className="mt-0.5 shrink-0">
                 <Info size={22} className="text-red-400" />
             </div>
             <p className="text-xs md:text-sm text-red-300/90 font-medium leading-relaxed">
                 ئەم بەرنامەیە تەنها بۆ مەبەستی زانیارییە و بە هیچ شێوەیەک نابێت وەک جێگرەوەی ڕێنمایی و پشکنینی پزیشکی تایبەتمەند بەکاربهێنرێت.
             </p>
         </div>

      </div>

      {/* دوگمەی گەڕانەوە بۆ سەرەوە */}
      <button 
        onClick={scrollToTop} 
        className={`fixed bottom-24 right-6 w-12 h-12 bg-amber-500 text-black rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center z-50 transition-all duration-300 transform-gpu hover:scale-110 active:scale-95 cursor-pointer ${showScroll ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}
      >
        <ChevronUp size={24} strokeWidth={3} />
      </button>

    </div>
  );
};
