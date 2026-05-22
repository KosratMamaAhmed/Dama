import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getProfiles, getMatchHistory, ACHIEVEMENTS, TITLES, FRAMES } from '../store/profileStore';
import { Trophy, BarChart3, History, Award, Calendar, Zap, RefreshCw, Star, Info, Coins, Timer, Smile } from 'lucide-react';

interface StatsDashboardProps {
  lang: 'KU' | 'EN' | 'AR';
  onClose: () => void;
  onProfileUpdated: () => void;
}

export default function StatsDashboard({ lang, onClose, onProfileUpdated }: StatsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'STATS' | 'ACHIEVEMENTS' | 'HISTORY'>('STATS');

  const { p1, p2 } = getProfiles();
  const history = getMatchHistory();

  const totalMatches = p1.gamesPlayed || 0;
  const winRate = totalMatches > 0 ? Math.round((p1.totalWins / totalMatches) * 100) : 0;
  
  // Custom SVG stats definitions
  const circleRadius = 40;
  const strokeDashoffset = 2 * Math.PI * circleRadius * (1 - winRate / 100);

  // Clear log history
  const clearHistory = () => {
    if (confirm(lang === 'KU' ? 'ئایا دڵنیای لە سڕینەوەی تەواوی مێژووی یارییەکانت؟' : 'Are you sure you want to erase match records?')) {
      localStorage.removeItem('dama_match_history');
      onProfileUpdated();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border-2 border-amber-500/35 w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col h-[580px]"
      >
        {/* Top Header with Profile summary */}
        <div className="bg-slate-950 p-4 sm:p-6 border-b border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30`}>
              <BarChart3 className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <span className="text-[9px] font-black tracking-widest text-[#fbbf24] uppercase">
                {lang === 'KU' ? 'ئامار و گەشەی یاریزان' : lang === 'AR' ? 'مركز التحكم والتحليلات الفنية' : 'Player Analytics & Center'}
              </span>
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                <span>{p1.name}</span>
                {p1.selectedTitleId && (
                  <span className={`text-[10px] bg-slate-800 font-extrabold px-1.5 py-0.5 rounded border border-white/5`}>
                    {TITLES.find(t => t.id === p1.selectedTitleId)?.nameKu}
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Quick Stats overview cards */}
          <div className="flex gap-3 text-center sm:text-right">
            <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-[9px] text-neutral-500 font-black uppercase">{lang === 'KU' ? 'سکەکان' : 'Coins'}</p>
                <p className="text-xs font-black text-white">{p1.coinCount}</p>
              </div>
            </div>

            <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500 animate-pulse" />
              <div>
                <p className="text-[9px] text-neutral-500 font-black uppercase">{lang === 'KU' ? 'بەردەوامی ململانێ' : 'Streak'}</p>
                <p className="text-xs font-black text-white">{p1.currentWinStreak} 🔥</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs bar */}
        <div className="bg-slate-950/40 border-b border-white/5 p-2 flex gap-1 justify-around">
          {[
            { id: 'STATS', labelKu: '📊 داتاکان', labelAr: 'مؤشرات الأداء', labelEn: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'ACHIEVEMENTS', labelKu: '🏆 دەستکەوتەکان', labelAr: 'الألقاب المتاحة', labelEn: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
            { id: 'HISTORY', labelKu: '📜 مێژووی یاری', labelAr: 'سجل المنافسات', labelEn: 'Match Logs', icon: <History className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer border
                ${activeTab === tab.id 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                  : 'bg-transparent border-transparent text-neutral-450 hover:text-white'}`}
            >
              {tab.icon}
              <span>{lang === 'KU' ? tab.labelKu : lang === 'AR' ? tab.labelAr : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-950/20">
          <AnimatePresence mode="wait">
            {activeTab === 'STATS' && (
              <motion.div
                key="stats_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
              >
                {/* 1. Circle Win Rate chart */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                  <h3 className="text-xs font-black text-amber-400 mb-4">{lang === 'KU' ? 'ڕێژەی بردنەوە' : 'Win Rate Ratio'}</h3>
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
                      <circle cx="50" cy="50" r={circleRadius} stroke="#1e293b" strokeWidth="10" fill="transparent" />
                      <circle 
                        cx="50" cy="50" r={circleRadius} 
                        stroke="#f59e0b" strokeWidth="10" fill="transparent"
                        strokeDasharray={2 * Math.PI * circleRadius}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-black text-white">{winRate}%</span>
                      <span className="text-[8px] font-extrabold text-neutral-500 uppercase">{lang === 'KU' ? 'بردنەوە' : 'Wins'}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4 w-full justify-around pt-2 border-t border-white/5">
                    <div>
                      <p className="text-[10px] text-neutral-500 font-bold">{lang === 'KU' ? 'بردنەوەکان' : 'Wins'}</p>
                      <p className="text-xs font-black text-emerald-400">{p1.totalWins}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 font-bold">{lang === 'KU' ? 'دۆڕانەکان' : 'Losses'}</p>
                      <p className="text-xs font-black text-rose-400">{p1.totalLosses}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Horizontal Breakdown details */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-4">
                  <h3 className="text-xs font-black text-amber-400 border-b border-white/5 pb-2">
                    {lang === 'KU' ? 'جوانکاری و سەرکێشییەکان' : 'Checkers Captured Details'}
                  </h3>

                  <div className="space-y-3">
                    {/* Captured Checkers bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-black text-neutral-400 mb-1">
                        <span>{lang === 'KU' ? 'کۆی بەردی خوراو' : 'Total Pieces Captured'}</span>
                        <span className="text-white font-mono">{p1.totalJumpsCaptured}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
                          style={{ width: `${Math.min(100, (p1.totalJumpsCaptured / 80) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Total Play matches bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-black text-neutral-400 mb-1">
                        <span>{lang === 'KU' ? 'گەمە ئەنجامدراوەکان' : 'Total Games'}</span>
                        <span className="text-white font-mono">{totalMatches}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                          style={{ width: `${Math.min(100, (totalMatches / 25) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Longest streak record */}
                    <div className="pt-2 flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-[10px] font-black text-neutral-300">{lang === 'KU' ? 'باشترین بردنەوەی لەسەریەک' : 'Best Winning Streak'}</span>
                      </div>
                      <span className="text-xs font-black text-yellow-400">{p1.longestWinStreak} 🔥</span>
                    </div>
                  </div>
                </div>

                {/* 3. Level-wise column visualization */}
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <h3 className="text-xs font-black text-amber-400 border-b border-white/5 pb-2">
                    {lang === 'KU' ? 'شیکاری بەپێی ئاستەکان' : 'Strength indicators'}
                  </h3>

                  <div className="grid grid-cols-4 gap-2 items-end h-28 pt-2">
                    {[
                      { label: 'EASY', color: 'bg-emerald-500', height: p1.totalWins > 0 ? 'h-[25%]' : 'h-1' },
                      { label: 'MED', color: 'bg-amber-500', height: p1.totalWins > 2 ? 'h-[50%]' : 'h-1' },
                      { label: 'HARD', color: 'bg-orange-500', height: p1.totalWins > 5 ? 'h-[75%]' : 'h-1' },
                      { label: 'EXPERT', color: 'bg-rose-500', height: p1.totalWins > 8 ? 'h-[100%]' : 'h-1' }
                    ].map((col, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className={`w-4 ${col.height} ${col.color} rounded-t-md opacity-85 shadow-lg shadow-black/20`} />
                        <span className="text-[7.5px] font-mono text-neutral-500 font-extrabold">{col.label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9px] text-neutral-500 font-bold text-center mt-3">
                    {lang === 'KU' ? 'ئاستە پێبووەکەت نیشان دەدات لە مێژوودا' : 'Visualized match level performance index'}
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'ACHIEVEMENTS' && (
              <motion.div
                key="ach_view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Available list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = p1.unlockedAchievements.includes(ach.id);
                    return (
                      <div
                        key={ach.id}
                        className={`p-4 rounded-xl border flex items-start gap-3 relative overflow-hidden transition-all duration-300
                          ${isUnlocked 
                            ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border-amber-500/40 shadow-md' 
                            : 'bg-slate-950/60 border-slate-900 text-neutral-450'}`}
                      >
                        {/* Status crown glow */}
                        {isUnlocked && (
                          <div className="absolute top-1 right-1 text-[8px] bg-amber-500/20 text-amber-400 font-black uppercase px-1 rounded border border-amber-500/30">
                            {lang === 'KU' ? 'کراوەتەوە' : 'Unlocked'}
                          </div>
                        )}

                        <div className="text-2xl pt-1 bg-slate-900/60 w-10 h-10 flex items-center justify-center rounded-xl border border-white/5 shadow-inner">
                          {ach.icon}
                        </div>

                        <div className="flex-1 space-y-1 text-left">
                          <h4 className={`text-xs font-black ${isUnlocked ? 'text-amber-300' : 'text-neutral-550'}`}>
                            {lang === 'KU' ? ach.nameKu : lang === 'AR' ? ach.nameAr : ach.nameEn}
                          </h4>
                          <p className="text-[10px] text-neutral-400 font-medium leading-normal">
                            {lang === 'KU' ? ach.descKu : lang === 'AR' ? ach.descAr : ach.descEn}
                          </p>

                          <div className="pt-1.5 flex items-center gap-1.5">
                            <span className="text-[8px] font-extrabold uppercase text-amber-500">{lang === 'KU' ? 'خەڵات' : 'Reward'}</span>
                            <span className="text-[9px] font-black text-neutral-300 bg-slate-900/40 px-1.5 py-0.5 rounded border border-white/5">
                              {lang === 'KU' ? ach.rewardKu : ach.rewardEn}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'HISTORY' && (
              <motion.div
                key="history_view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {history.length === 0 ? (
                  <div className="text-center py-14 bg-slate-950/40 rounded-2xl border border-white/5">
                    <Smile className="w-10 h-10 text-neutral-600 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs text-neutral-500 font-black">
                      {lang === 'KU' ? 'هیچ تۆمارێکی یاری نییە لە مێژوودا!' : 'No match logs stored on this device yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-[10px] text-neutral-500 font-black uppercase">{lang === 'KU' ? 'کۆتا ٣٠ یاریی بردنەوە و دۆڕان' : 'Last 30 rounds'}</span>
                      <button
                        onClick={clearHistory}
                        className="text-[9px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-black py-1 px-2.5 rounded border border-rose-550/20 cursor-pointer"
                      >
                        {lang === 'KU' ? 'پاککردنەوەی گشتی' : 'Clear Logs'}
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                      {history.map((log) => {
                        const isWon = log.winnerName === log.player1Name;
                        return (
                          <div
                            key={log.id}
                            className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3 text-left hover:bg-slate-950/80 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${isWon ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                              <div>
                                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                                  <span>{log.player1Name}</span>
                                  <span className="text-neutral-500 font-medium">⚔️</span>
                                  <span className="text-neutral-400 text-[11px]">{log.player2Name}</span>
                                </h4>
                                <div className="flex items-center gap-3 text-[9px] text-neutral-500 font-bold mt-0.5">
                                  <span className="flex items-center gap-1 font-mono">
                                    <Calendar className="w-3 h-3 text-neutral-600" />
                                    {log.date}
                                  </span>
                                  <span className="bg-slate-900 px-1 rounded uppercase font-extrabold text-[#fbbf24]">
                                    {log.mode}
                                  </span>
                                  {log.difficulty && (
                                    <span className="text-[8px] text-neutral-450 uppercase">{log.difficulty}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className={`text-xs font-black ${isWon ? 'text-emerald-400' : 'text-rose-450'}`}>
                                {isWon ? (lang === 'KU' ? 'بردنەوە' : 'Victory') : (lang === 'KU' ? 'دۆڕان' : 'Defeat')}
                              </p>
                              <p className="text-[9px] text-neutral-500 font-mono mt-0.5">
                                +{log.piecesCaptured} {lang === 'KU' ? 'بەردی خوراو' : 'pieces captured'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-amber-500/15 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-amber-500 hover:bg-amber-600 hover:scale-[1.02] active:scale-95 text-[#050508] font-black text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10 border border-yellow-300/30"
          >
            {lang === 'KU' ? 'گەڕانەوە بۆ ماڵەوە' : lang === 'AR' ? 'خروج' : 'Close Dashboard'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
