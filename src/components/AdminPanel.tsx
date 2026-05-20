import React, { useState } from 'react';
import { Shield, Users, Search, Trash2, Key, Award, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { UserProfile } from './AuthSystem';
import { Language } from '../translations';

interface AdminPanelProps {
  lang: Language;
  onClose?: () => void;
}

export default function AdminPanel({ lang, onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const raw = localStorage.getItem('dama_users_db_v2');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  // Modals / forms state
  const [newPassword, setNewPassword] = useState('');
  const [tokenAmount, setTokenAmount] = useState<number>(10);
  const [banDuration, setBanDuration] = useState<string>('5_mins'); // 1_min, 5_mins, 1_hour, 1_day, lift

  const [notif, setNotif] = useState('');

  React.useEffect(() => {
    const loadUsers = () => {
      const raw = localStorage.getItem('dama_users_db_v2');
      if (raw) {
        try {
          setUsers(JSON.parse(raw));
        } catch (e) {}
      }
    };
    
    try {
      const bc = new BroadcastChannel('dama_multiplayer_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SYNC_NEW_USER' || event.data?.type === 'SYNC_USER_CHG') {
          loadUsers();
        }
      };
      return () => {
        bc.close();
      };
    } catch (e) {}
  }, []);

  const syncToDB = (updatedList: UserProfile[]) => {
    localStorage.setItem('dama_users_db_v2', JSON.stringify(updatedList));
    setUsers(updatedList);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm(lang === 'KU' ? 'ئایا دڵنیایت لە سڕینەوەی ئەم بەکارهێنەرە؟' : 'Are you sure you want to delete this user?')) {
      const filtered = users.filter(u => u.id !== id);
      syncToDB(filtered);
      if (selectedUser?.id === id) setSelectedUser(null);
      triggerNotification(lang === 'KU' ? 'بەکارهێنەرەکە بە سەرکەوتوویی سڕایەوە!' : 'User deleted successfully!');
    }
  };

  const handleChangePassword = () => {
    if (!selectedUser || !newPassword.trim()) return;
    
    // Simulate encryption
    const simpleHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16);
    };

    const updated = users.map(u => {
      if (u.id === selectedUser.id) {
        return { ...u, passwordHash: simpleHash(newPassword) };
      }
      return u;
    });

    syncToDB(updated);
    setSelectedUser(updated.find(u => u.id === selectedUser.id) || null);
    setNewPassword('');
    triggerNotification(lang === 'KU' ? 'پاسوۆردەکە بە سەرکەوتوویی گۆڕدرا!' : 'Password changed successfully!');
  };

  const handleAdjustTokens = (positive: boolean) => {
    if (!selectedUser) return;
    const amount = positive ? tokenAmount : -tokenAmount;
    
    const updated = users.map(u => {
      if (u.id === selectedUser.id) {
        const currentTokens = u.tokens || 0;
        return { ...u, tokens: Math.max(0, currentTokens + amount) };
      }
      return u;
    });

    syncToDB(updated);
    setSelectedUser(updated.find(u => u.id === selectedUser.id) || null);
    triggerNotification(lang === 'KU' ? `تۆکنی بەکارهێنەرەکە نوێکرایەوە! (${amount > 0 ? '+' : ''}${amount} 🪙)` : `User tokens updated! (${amount > 0 ? '+' : ''}${amount} 🪙)`);
  };

  const handleApplyBan = () => {
    if (!selectedUser) return;
    
    let durationMs = 0;
    if (banDuration === '1_min') durationMs = 60 * 1000;
    else if (banDuration === '5_mins') durationMs = 5 * 60 * 1000;
    else if (banDuration === '1_hour') durationMs = 60 * 60 * 1000;
    else if (banDuration === '1_day') durationMs = 24 * 60 * 60 * 1000;
    else if (banDuration === 'lift') durationMs = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years

    const bannedUntil = Date.now() + durationMs;

    const updated = users.map(u => {
      if (u.id === selectedUser.id) {
        return { ...u, bannedUntil };
      }
      return u;
    });

    syncToDB(updated);
    setSelectedUser(updated.find(u => u.id === selectedUser.id) || null);
    
    let successMsg = '';
    if (lang === 'KU') {
      successMsg = `بەکارهێنەرەکە بە سەرکەوتوویی باندکرا ! 🛑`;
    } else {
      successMsg = `User successfully suspended! 🛑`;
    }
    triggerNotification(successMsg);
  };

  const handleRevokeBan = () => {
    if (!selectedUser) return;

    const updated = users.map(u => {
      if (u.id === selectedUser.id) {
        const { bannedUntil, ...rest } = u;
        return rest;
      }
      return u;
    });

    syncToDB(updated);
    setSelectedUser(updated.find(u => u.id === selectedUser.id) || null);
    triggerNotification(lang === 'KU' ? 'باندەکە هەڵوەشێنرایەوە! ✅' : 'Ban revoked successfully! ✅');
  };

  const triggerNotification = (msg: string) => {
    setNotif(msg);
    setTimeout(() => {
      setNotif('');
    }, 4000);
  };

  // Filter out any users we search for
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email_or_phone.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl bg-slate-900 border border-white/20 rounded-3xl p-5 sm:p-7 backdrop-blur-3xl shadow-2xl relative select-none text-right flex flex-col space-y-5">
      {/* Decorative Top header */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-yellow-500 rounded-t-3xl" />
      
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        {onClose && (
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black text-white/95 transition-all cursor-pointer"
          >
            ✕ {lang === 'KU' ? 'داخستن' : 'Close'}
          </button>
        )}
        <div className="flex items-center space-x-2.5 space-x-reverse text-amber-400">
          <Shield className="w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
            {lang === 'KU' ? 'ئەدمین پانێڵ - کۆنتڕۆڵی تەواو' : 'Admin Control Panel'}
          </h2>
        </div>
      </div>

      {notif && (
        <div className="bg-emerald-500/15 border border-emerald-500/35 p-3 rounded-xl text-emerald-200 text-xs font-bold text-center animate-fade-in flex items-center justify-center space-x-2 space-x-reverse">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Detail controls */}
        <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-5">
          {selectedUser ? (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-3">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">دیاریکراو • Target User</span>
                <h3 className="text-lg font-black text-white">{selectedUser.username}</h3>
                <p className="text-xs text-white/50 font-mono mt-0.5 mt-0.5">ID: {selectedUser.id}</p>
                <p className="text-xs text-white/40 font-mono mt-0.5">{selectedUser.email_or_phone}</p>
                <div className="mt-2.5 flex items-center space-x-3 space-x-reverse">
                  <div className="text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300 py-1 px-3 rounded-full">
                    {selectedUser.tokens} 🪙 تۆکن
                  </div>
                  {selectedUser.bannedUntil && selectedUser.bannedUntil > Date.now() ? (
                    <div className="text-xs font-bold bg-rose-500/10 border border-rose-500/35 text-rose-300 py-1 px-3 rounded-full">
                      🛑 باندکراوە
                    </div>
                  ) : (
                    <div className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 py-1 px-3 rounded-full">
                      🟢 چالاکە
                    </div>
                  )}
                </div>
              </div>

              {/* Adjust tokens */}
              <div className="space-y-1.5 p-3 bg-white/5 border border-white/5 rounded-xl">
                <label className="text-xs font-black text-white/70 block flex items-center space-x-1 space-x-reverse justify-end">
                  <span>تۆکن زیادبکە یان کەم بکە</span>
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                </label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-black/40 border border-white/15 rounded-lg py-1.5 px-3 text-xs text-white font-mono text-center focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => handleAdjustTokens(true)}
                    className="py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-lg transition-colors cursor-pointer"
                  >
                    + پێبدە (+{tokenAmount})
                  </button>
                  <button
                    onClick={() => handleAdjustTokens(false)}
                    className="py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-lg transition-colors cursor-pointer"
                  >
                    - لێببرە (-{tokenAmount})
                  </button>
                </div>
              </div>

              {/* Ban Setup */}
              <div className="space-y-1.5 p-3 bg-white/5 border border-white/5 rounded-xl">
                <label className="text-xs font-black text-white/70 block flex items-center space-x-1 space-x-reverse justify-end">
                  <span>باندکردنی بەکارهێنەر بۆ ماوەی دیاریکراو</span>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                </label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-lg py-1.5 px-3 text-xs text-white/90 text-right focus:outline-none"
                >
                  <option value="1_min">{lang === 'KU' ? '١ خولەک (تاقیکردنەوە)' : '1 Minute (Test)'}</option>
                  <option value="5_mins">{lang === 'KU' ? '٥ خولەک' : '5 Minutes'}</option>
                  <option value="1_hour">{lang === 'KU' ? '١ کاتژمێر' : '1 Hour'}</option>
                  <option value="1_day">{lang === 'KU' ? '١ رۆژ' : '1 Day'}</option>
                  <option value="lift">{lang === 'KU' ? 'هەمیشەیی 💀' : 'Permanent'}</option>
                </select>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={handleApplyBan}
                    className="py-1.5 bg-rose-500 hover:bg-rose-600 border border-rose-400/20 text-white text-xs font-black rounded-lg transition-colors cursor-pointer"
                  >
                    باندکردن 🛑
                  </button>
                  <button
                    onClick={handleRevokeBan}
                    className="py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-black rounded-lg transition-colors cursor-pointer"
                  >
                    لابردنی باند ✅
                  </button>
                </div>
              </div>

              {/* Change Password */}
              <div className="space-y-1.5 p-3 bg-white/5 border border-white/5 rounded-xl">
                <label className="text-xs font-black text-white/70 block flex items-center space-x-1 space-x-reverse justify-end">
                  <span>تەواوکاری پاسوۆرد</span>
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                </label>
                <input
                  type="text"
                  placeholder={lang === 'KU' ? 'پاسوۆردی نوێ هاوشێوەی (123456)' : 'New password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg py-1.5 px-3 text-xs text-white text-right focus:outline-none"
                />
                <button
                  onClick={handleChangePassword}
                  className="w-full mt-2 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-black rounded-lg transition-colors cursor-pointer"
                >
                  چەسپاندنی گۆڕانکاری
                </button>
              </div>

              {/* Delete Account */}
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="w-full py-2.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-300 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1.5 space-x-reverse cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>سڕینەوەی ئەم هەژمارە بە تەواوی</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-10 space-y-2 text-white/40">
              <Users className="w-10 h-10 mx-auto animate-pulse" />
              <p className="text-xs font-bold">
                {lang === 'KU' ? 'بۆ دەستکاریکردن یەکێک لە بەکارهێنەرانی دەستە بەند هەڵبژێرە!' : 'Select a user from the list to manage.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Account Lists */}
        <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col space-y-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={lang === 'KU' ? 'گەڕان بەدوای بەکارهێنەر (ناو، ئایدی، مۆبایل)...' : 'Search users...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-3.5 text-xs text-white text-right focus:outline-none pl-10"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-white/30" />
          </div>

          <div className="text-[10px] uppercase font-black text-white/40 mb-1 flex justify-between items-center px-1">
            <span>{filteredUsers.length} {lang === 'KU' ? 'تۆمار دۆزرایەوە' : 'Users Found'}</span>
            <span>بەکارهێنەرانی ئەپ</span>
          </div>

          {/* User Rows */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center space-x-4 space-x-reverse ${
                    selectedUser?.id === user.id
                      ? 'bg-amber-500/10 border-amber-400 shadow-md'
                      : 'bg-black/20 border-white/5 hover:border-white/15 hover:bg-black/30'
                  }`}
                >
                  <div className="flex items-center space-x-2 space-x-reverse text-right">
                    <Trash2
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id);
                      }}
                      className="w-4 h-4 text-rose-400 hover:text-rose-500 transition-colors cursor-pointer mr-2.5"
                    />
                    <div className="text-xs font-mono text-amber-400 font-bold bg-amber-500/15 py-0.5 px-2 rounded">
                      {user.tokens} 🪙
                    </div>
                    {user.bannedUntil && user.bannedUntil > Date.now() && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold py-0.5 px-1.5 rounded">
                        BANNED
                      </span>
                    )}
                    {user.is_admin && (
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold py-0.5 px-1.5 rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white line-clamp-1">{user.username}</p>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">ID: {user.id}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs text-white/30 font-bold">
                {lang === 'KU' ? 'هیچ بەکارهێنەرێک نەدۆزرایەوە!' : 'No entries found.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
