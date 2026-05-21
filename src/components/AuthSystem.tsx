import React, { useState } from 'react';
import { User, Lock, Mail, Phone, ShieldCheck, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { BACKEND_URL } from '../config';
import { Language } from '../translations';

export interface UserProfile {
  id: string;
  username: string;
  tokens: number;
  is_admin?: number;
  bannedUntil?: number;
  email_or_phone: string;
}

interface AuthSystemProps {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  lang: Language;
  onClose: () => void;
}

export default function AuthSystem({ currentUser, setCurrentUser, lang, onClose }: AuthSystemProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const triggerNotification = (msg: string, isError = true) => {
    if (isError) {
      setError(msg);
      setSuccess('');
    } else {
      setSuccess(msg);
      setError('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !emailOrPhone.trim() || !password.trim()) {
      triggerNotification(lang === 'KU' ? 'تکایە هەموو کێڵگەکان پڕبکەرەوە!' : 'Please fill all fields!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // گۆڕدرا بۆ ناونیشانی نوێ: /api/auth/register
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email_or_phone: emailOrPhone.trim(),
          password: password
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Registration failed');
      }

      triggerNotification(data.message || 'Account created!', false);
      
      const localUsersRaw = localStorage.getItem('dama_users_db_v2') || '[]';
      try {
        const localUsers = JSON.parse(localUsersRaw);
        if (Array.isArray(localUsers)) {
          localUsers.push(data.user);
          localStorage.setItem('dama_users_db_v2', JSON.stringify(localUsers));
        }
      } catch (e) {}

      try {
        const bc = new BroadcastChannel('dama_multiplayer_channel');
        bc.postMessage({ type: 'SYNC_NEW_USER', user: data.user });
        bc.close();
      } catch (e) {}

      setTimeout(() => {
        setCurrentUser(data.user);
        onClose();
      }, 1500);

    } catch (err: any) {
      triggerNotification(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password.trim()) {
      triggerNotification(lang === 'KU' ? 'تکایە ئیمێڵ/ژمارە و پاسۆرد بنووسە!' : 'Please fill all fields!');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // گۆڕدرا بۆ ناونیشانی نوێ: /api/auth/login
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_phone: emailOrPhone.trim(),
          password: password
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Login failed');
      }

      triggerNotification(data.message || 'Welcome back!', false);
      
      setTimeout(() => {
        setCurrentUser(data.user);
        onClose();
      }, 1200);

    } catch (err: any) {
      triggerNotification(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    triggerNotification(lang === 'KU' ? 'بە سەرکەوتوویی دەرچوویت! 🚪' : 'Logged out successfully!', false);
  };

  if (currentUser) {
    return (
      <div className="w-full max-w-md bg-slate-900 border border-white/20 rounded-3xl p-6 text-right relative backdrop-blur-3xl shadow-2xl space-y-6">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-t-3xl" />
        <div className="text-center space-y-2">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" style={{ animationDuration: '3s' }} />
          <h2 className="text-2xl font-black text-white">{lang === 'KU' ? 'پڕۆفایلی یاریزان' : 'Player Profile'}</h2>
          <p className="text-xs text-white/50 font-mono">ID: {currentUser.id}</p>
        </div>

        <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3 font-sans">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-sm font-black text-white">@{currentUser.username}</span>
            <span className="text-xs text-white/40">{lang === 'KU' ? 'ناوی بەکارهێنەر' : 'Username'}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-mono font-black text-amber-300">🪙 {currentUser.tokens}</span>
            <span className="text-xs text-white/40">{lang === 'KU' ? 'باڵانسی تۆکن' : 'Tokens Balance'}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-200 text-xs font-black rounded-xl transition-all active:scale-95 cursor-pointer"
        >
          {lang === 'KU' ? 'دەرچوون لە ئەکاونت 🚪' : 'Sign Out'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/95 border border-white/20 rounded-3xl p-6 text-right relative backdrop-blur-3xl shadow-2xl flex flex-col space-y-5">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-t-3xl" />
      
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white">
          {isLogin 
            ? (lang === 'KU' ? 'چوونەژوورەوەی داما' : 'Sign In to Dama') 
            : (lang === 'KU' ? 'دروستکردنی ئەکاونت' : 'Create Challenger Account')
          }
        </h2>
        <p className="text-xs text-white/50">
          {isLogin 
            ? (lang === 'KU' ? 'بۆ بەشداریکردن لە مەکۆی سەرەکی زانیارییەکان بنووسە' : 'Enter your credentials to continue')
            : (lang === 'KU' ? 'پێنجی (٥٠) تۆکنی خۆڕایی وەک دیاری وەربگرە 🎁' : 'Get 50 start gift tokens instantly 🎁')
          }
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-300 text-xs font-bold text-center flex items-center justify-center space-x-2 space-x-reverse animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-300 text-xs font-bold text-center flex items-center justify-center space-x-2 space-x-reverse animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-3.5 font-sans">
        {!isLogin && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-white/60 block">{lang === 'KU' ? 'ناوی بەکارهێنەر (یوزەرنەیم)' : 'Username'}</label>
            <div className="relative">
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="e.g. kosrat_99"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 text-left font-mono"
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-white/60 block">
            {lang === 'KU' ? 'ژمارەی مۆبایل یان ئیمێڵ' : 'Email or Phone Number'}
          </label>
          <div className="relative">
            <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="0750xxxxxxx یان email@domain.com"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 text-right"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-white/60 block">{lang === 'KU' ? 'تێپەڕەوشە (پاسۆرد)' : 'Password'}</label>
          <div className="relative">
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 text-left font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5 space-x-reverse shadow-lg shadow-cyan-500/10"
        >
          {loading && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />}
          <span>
            {isLogin 
              ? (lang === 'KU' ? 'پێشکەشکردن و چوونەژوورەوە 🚀' : 'Sign In Now 🚀') 
              : (lang === 'KU' ? 'تۆمارکردنی فەرمی ئەکاونت 🎉' : 'Register Account 🎉')
            }
          </span>
        </button>
      </form>

      <div className="text-center pt-2 border-t border-white/5">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
          }}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-bold cursor-pointer"
        >
          {isLogin 
            ? (lang === 'KU' ? 'ئەکاونتت نییە؟ لێرە دانەیەکی نوێ دروست بکە' : "Don't have an account? Sign Up") 
            : (lang === 'KU' ? 'پێشتر خۆت تۆمارکردووە؟ لۆگین بکە' : 'Already registered? Log In')
          }
        </button>
      </div>
    </div>
  );
}