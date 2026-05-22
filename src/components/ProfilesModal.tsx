import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getProfiles, saveProfiles, AVATAR_LIST, FRAMES, TITLES, PlayerProfile } from '../store/profileStore';
import { User, ShieldAlert, Award, Smile, Save, Check, Star } from 'lucide-react';

interface ProfilesModalProps {
  lang: 'KU' | 'EN' | 'AR';
  onClose: () => void;
  onSaved: () => void;
}

export function AvatarRenderer({ avatarId, frameId, className = 'w-14 h-14' }: { avatarId: string; frameId: string | null; className?: string }) {
  // Find frame config for styles
  const frameObj = FRAMES.find(f => f.id === frameId);
  const frameStyles = frameObj ? frameObj.class : 'border-neutral-700';

  // Choose appropriate background and icon/emoji for the premium avatar list
  const getAvatarContent = () => {
    switch (avatarId) {
      case 'kurdish_man':
        return { emoji: '🧔', bg: 'from-amber-600 via-yellow-700 to-indigo-950' };
      case 'kurdish_woman':
        return { emoji: '👩', bg: 'from-rose-500 via-pink-700 to-slate-900' };
      case 'elder':
        return { emoji: '👴', bg: 'from-amber-700 via-yellow-850 to-emerald-950' };
      case 'robot':
        return { emoji: '🤖', bg: 'from-cyan-400 via-slate-800 to-indigo-950 border border-cyan-400' };
      case 'hawk':
        return { emoji: '🦅', bg: 'from-emerald-600 via-teal-700 to-neutral-900' };
      case 'crown':
        return { emoji: '👑', bg: 'from-yellow-400 via-amber-600 to-slate-950' };
      case 'warrior':
        return { emoji: '⚔️', bg: 'from-red-600 via-slate-800 to-neutral-950' };
      case 'tiger':
        return { emoji: '🐅', bg: 'from-orange-500 via-amber-700 to-slate-900' };
      case 'cyber':
        return { emoji: '🎯', bg: 'from-fuchsia-500 via-violet-700 to-neutral-900' };
      case 'grandmaster':
        return { emoji: '🎓', bg: 'from-indigo-600 via-purple-700 to-slate-950' };
      default:
        return { emoji: '👤', bg: 'from-slate-700 to-slate-900' };
    }
  };

  const c = getAvatarContent();

  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${c.bg} border-2 ${frameStyles} flex items-center justify-center text-2xl shadow-xl overflow-hidden relative group`}>
        <span>{c.emoji}</span>
        {/* Shine gloss layer */}
        <div className="absolute top-0 left-0 w-full h-[50%] bg-white/5 skew-y-12 origin-top-left transition-all duration-300" />
      </div>
    </div>
  );
}

export default function ProfilesModal({ lang, onClose, onSaved }: ProfilesModalProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<'p1' | 'p2'>('p1');
  
  // Store profiles loaded from state
  const [profiles, setProfiles] = useState(() => getProfiles());
  
  // Active editing profile copy
  const activeProfile = selectedPlayer === 'p1' ? profiles.p1 : profiles.p2;

  // Track modified values locally
  const updateActiveProfile = <K extends keyof PlayerProfile>(key: K, value: PlayerProfile[K]) => {
    setProfiles(prev => ({
      ...prev,
      [selectedPlayer]: {
        ...prev[selectedPlayer],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    saveProfiles(profiles.p1, profiles.p2);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/92 backdrop-blur-md flex items-center justify-center z-[110] p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border-2 border-amber-500/35 w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col h-auto md:h-[580px]"
      >
        {/* Selector Header */}
        <div className="bg-slate-950 p-4 sm:p-5 border-b border-amber-500/15 flex flex-col sm:flex-row shadow-md items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-[#fbbf24] animate-pulse" />
            <div>
              <h2 className="text-sm font-black text-white">
                {lang === 'KU' ? 'ڕێکخستنی پڕۆفایلی یاریزانەکان • Pass & Play Profiles' : lang === 'AR' ? 'تجهيز وتعديل ملفات اللاعبين' : 'Player Profiles & Avatar Setup'}
              </h2>
              <p className="text-[10px] text-neutral-400 font-bold">
                {lang === 'KU' ? 'ناوی خۆت و شێوازی پڕۆفایلەکەت بە ئارەزووی خۆت بگۆڕە' : lang === 'AR' ? 'لتخصيص الألقاب والمظاهر اللمعانية' : 'Personalize names, badges, and frames'}
              </p>
            </div>
          </div>

          {/* Quick toggle between player 1 and player 2 */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 self-stretch sm:self-auto">
            <button
              onClick={() => setSelectedPlayer('p1')}
              className={`flex-1 sm:flex-initial py-1.5 px-4 rounded-lg text-xs font-black transition-all cursor-pointer ${selectedPlayer === 'p1' ? 'bg-cyan-500 text-black shadow-md font-extrabold' : 'text-neutral-400'}`}
            >
              {lang === 'KU' ? 'یاریزان ١ (شین)' : lang === 'AR' ? 'اللاعب الأزرق' : 'Player 1 (Cyan)'}
            </button>
            <button
              onClick={() => setSelectedPlayer('p2')}
              className={`flex-1 sm:flex-initial py-1.5 px-4 rounded-lg text-xs font-black transition-all cursor-pointer ${selectedPlayer === 'p2' ? 'bg-neutral-100 text-black shadow-md font-extrabold' : 'text-neutral-400'}`}
            >
              {lang === 'KU' ? 'یاریزان ٢ (سپیت)' : lang === 'AR' ? 'اللاعب الأبيض' : 'Player 2 (White)'}
            </button>
          </div>
        </div>

        {/* Form Grid body */}
        <div className="flex-1 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto bg-slate-950/10">
          {/* Section 1: Name and Big Avatar (Left Bento block) */}
          <div className="md:col-span-4 bg-slate-950/60 p-5 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
            <AvatarRenderer 
              avatarId={activeProfile.avatarId} 
              frameId={activeProfile.selectedFrameId}
              className="w-24 h-24 sm:w-28 sm:h-28"
            />
            
            {/* Display Title badge */}
            {activeProfile.selectedTitleId && (
              <span className={`text-[10px] bg-slate-900 border border-amber-500/20 px-2 py-0.5 rounded-full font-black uppercase text-amber-400 animate-pulse`}>
                {TITLES.find(t => t.id === activeProfile.selectedTitleId)?.nameKu}
              </span>
            )}

            {/* Name Input field */}
            <div className="w-full text-center space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#fbbf24]">{lang === 'KU' ? 'ناوی بڵاوکراوە' : 'Player Name'}</label>
              <input
                type="text"
                value={activeProfile.name}
                maxLength={18}
                onChange={(e) => updateActiveProfile('name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 font-black text-sm text-center text-white px-3 py-2.5 rounded-xl outline-none transition-all placeholder-neutral-600"
              />
            </div>
          </div>

          {/* Section 2: Avatar select, Frame select, Title select (Right Bento block) */}
          <div className="md:col-span-8 bg-slate-950/40 p-5 rounded-3xl border border-white/5 space-y-5 flex flex-col justify-between">
            {/* A. Premium Avatars Selection row */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <span>👤</span>
                <span>{lang === 'KU' ? 'هەڵبژاردنی ئاڤاتاری پڕۆفایل' : 'Select Premium Avatar'}</span>
              </h3>
              <div className="grid grid-cols-5 gap-2.5 max-h-[105px] overflow-y-auto pr-1">
                {AVATAR_LIST.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => updateActiveProfile('avatarId', av.id)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative
                      ${activeProfile.avatarId === av.id 
                        ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/40 scale-105' 
                        : 'bg-slate-950/40 border-slate-900 hover:bg-slate-900/40'}`}
                  >
                    <AvatarRenderer avatarId={av.id} frameId={null} className="w-10 h-10" />
                    {activeProfile.avatarId === av.id && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 rounded-full w-4.5 h-4.5 flex items-center justify-center text-[8px] text-black font-black">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* B. Decorative Frames Selection row */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <span>🔥</span>
                <span>{lang === 'KU' ? 'چوارچێوەی دەستکەوتە باوەڕپێکراوەکان' : 'Select Achievements Frame'}</span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {FRAMES.map((fr) => {
                  const unlocked = activeProfile.unlockedFrames.includes(fr.id);
                  const isSel = activeProfile.selectedFrameId === fr.id;
                  return (
                    <button
                      key={fr.id}
                      disabled={!unlocked}
                      onClick={() => updateActiveProfile('selectedFrameId', isSel ? null : fr.id)}
                      className={`p-2 rounded-xl text-[9px] font-black leading-tight border transition-all text-center flex flex-col items-center justify-center h-14 cursor-pointer
                        ${unlocked 
                          ? isSel
                            ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300 scale-102 ring-1 ring-emerald-400/30'
                            : 'bg-slate-950/40 border-slate-900 text-neutral-300 hover:bg-slate-900/60'
                          : 'bg-slate-950/10 border-dashed border-slate-900 text-neutral-600 cursor-not-allowed opacity-50'
                        }`}
                    >
                      <span>{lang === 'KU' ? fr.nameKu : fr.nameEn}</span>
                      {!unlocked && <span className="text-[8px] text-neutral-500 mt-1">🔐 {lang === 'KU' ? 'داخراوە' : 'Locked'}</span>}
                      {unlocked && isSel && <span className="text-[8.5px] text-emerald-400 font-extrabold mt-0.5">✓ {lang === 'KU' ? 'دیاریکراو' : 'Active'}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. Unlocked Titles Selector row */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <span>🏆</span>
                <span>{lang === 'KU' ? 'نازناوی فەخری بەدەستهاتوو' : 'Select Honor Rank Title'}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TITLES.map((tl) => {
                  const unlocked = activeProfile.unlockedTitles.includes(tl.id);
                  const isSel = activeProfile.selectedTitleId === tl.id;
                  return (
                    <button
                      key={tl.id}
                      disabled={!unlocked}
                      onClick={() => updateActiveProfile('selectedTitleId', isSel ? null : tl.id)}
                      className={`p-2 rounded-xl text-[10px] font-black border transition-all truncate cursor-pointer flex flex-col items-center justify-center gap-0.5 h-12
                        ${unlocked 
                          ? isSel
                            ? 'bg-yellow-500/15 border-yellow-400 text-yellow-300 ring-1 ring-yellow-400/40 scale-102 font-extrabold'
                            : 'bg-slate-950/40 border-slate-900 text-neutral-300 hover:bg-slate-900/60'
                          : 'bg-slate-950/10 border-dashed border-slate-900 text-neutral-600 cursor-not-allowed opacity-50'
                        }`}
                    >
                      <span className={unlocked ? tl.color : ''}>
                        {lang === 'KU' ? tl.nameKu : tl.nameEn}
                      </span>
                      {!unlocked && <span className="text-[8px] text-neutral-500">🔐 {lang === 'KU' ? 'داخراوە' : 'Locked'}</span>}
                      {unlocked && isSel && <span className="text-[8.5px] text-yellow-400 font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-amber-500/15 flex items-center justify-between">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-neutral-450 hover:text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer border border-white/5"
          >
            {lang === 'KU' ? 'پاشگەزبوونەوە' : lang === 'AR' ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            onClick={handleSave}
            className="py-2.5 px-6 bg-gradient-to-r from-amber-400 to-amber-600 hover:scale-[1.03] active:scale-95 text-[#050508] font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/20 border border-yellow-300/30 flex items-center justify-center gap-2 animate-pulse"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'KU' ? 'پاشەکەوتکردن و تەواوکردن' : lang === 'AR' ? 'حفظ وتأكيد' : 'Save Changes'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
