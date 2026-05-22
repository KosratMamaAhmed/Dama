import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import MarkdownParser from './MarkdownParser';
import { Language } from '../translations';

interface RulesViewProps {
  lang: Language;
  onBack: () => void;
  t: any;
}

export default function RulesView({ lang, onBack, t }: RulesViewProps) {
  return (
    <motion.div
      key="rules"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl bg-neutral-900 border border-white/5 p-6 md:p-8 rounded-3xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -translate-y-10 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl translate-y-10 -translate-x-10" />

      <button 
        onClick={onBack}
        className="flex items-center space-x-2 space-x-reverse text-neutral-300 hover:text-white mb-6 py-2 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer text-xs font-black shadow-inner"
      >
        <ChevronLeft className="w-4 h-4 rtl:scale-x-[-1] text-cyan-400" />
        <span>{lang === 'KU' ? 'گەڕانەوە' : lang === 'AR' ? 'عودة' : 'Back'}</span>
      </button>
      
      <div className="relative mb-6">
        <h2 className="text-2.5xl font-black text-white bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent pb-1.5 border-b border-white/5 tracking-wide">
          {t.RULES_TITLE}
        </h2>
        <div className="h-[2px] w-20 bg-gradient-to-r from-cyan-400 to-indigo-500 absolute bottom-0 left-0" />
      </div>
      
      <div className="mb-10">
        <MarkdownParser markdown={t.RULES_CONTENT} />
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 relative">
        <div className="relative mb-6">
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-450 to-orange-500 pb-1.5 border-b border-white/5 tracking-wide">
            {t.PLAYSTORE_RULES_TITLE}
          </h2>
          <div className="h-[2px] w-20 bg-gradient-to-r from-amber-400 to-orange-500 absolute bottom-0 left-0" />
        </div>
        
        <MarkdownParser markdown={t.PLAYSTORE_RULES_CONTENT} />
      </div>
    </motion.div>
  );
}
