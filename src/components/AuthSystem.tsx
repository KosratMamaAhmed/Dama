import React, { useState } from 'react';
import { User, ShieldAlert, Key, Smartphone, Mail, Lock, Gift, LogOut, Eye, EyeOff, Sparkles, LogIn } from 'lucide-react';
import { Language } from '../translations';
import { BACKEND_URL } from '../config';
import { motion, AnimatePresence } from 'motion/react';

export interface UserProfile {
  id: string;
  username: string;
  email_or_phone: string;
  passwordHash: string;
  tokens: number;
  is_admin: boolean;
  bannedUntil?: number; // timestamp
}

interface AuthSystemProps {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  lang: Language;
  onClose?: () => void;
}

// Helpers for password hashing (using the same client-side hash algorithm as before)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export default function AuthSystem({
  currentUser,
  setCurrentUser,
  lang,
  onClose,
}: AuthSystemProps) {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState(() => localStorage.getItem('dama_rem_email_phone') || '');
  const [password, setPassword] = useState(() => {
    const saved = localStorage.getItem('dama_rem_pass');
    if (!saved) return '';
    try {
      return atob(saved);
    } catch (e) {
      return '';
    }
  });
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('dama_rem_me') !== 'false');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');

    if (!username.trim() || !emailOrPhone.trim() || !password.trim()) {
      setError(lang === 'KU' ? 'پێویستە هەموو خانەکان پڕبکەیتەوە!' : lang === 'AR' ? 'يرجى ملء جميع الحقول!' : 'Please fill all fields!');
      return;
    }

    // Safety check against local database to prevent duplicate registrations
    const cachedUsers = localStorage.getItem('dama_users_db_v2');
    if (cachedUsers) {
      try {
        const parsed = JSON.parse(cachedUsers);
        if (Array.isArray(parsed)) {
          const dupName = parsed.find((u: any) => u.username.toLowerCase() === username.trim().toLowerCase());
          const dupEmail = parsed.find((u: any) => u.email_or_phone.toLowerCase() === emailOrPhone.trim().toLowerCase());
          if (dupName || dupEmail) {
            setError(lang === 'KU' ? 'ئەم ناوە یان ئیمێڵ/مۆبایلە پێشتر تۆمارکراوە!' : 'Username or email/phone already exists!');
            return;
          }
        }
      } catch (e) {}
    }

    try {
      setLoading(true);

      // Call Cloudflare backend /api/register
      const response = await fetch(`${BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email_or_phone: emailOrPhone.trim(),
          passwordHash: simpleHash(password),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedErr;
        try {
          parsedErr = JSON.parse(errorText);
        } catch(e) {}
        throw new Error(parsedErr?.error || parsedErr?.message || errorText || 'Error occurred!');
      }

      const data = await response.json() as any;

      // Automatically log the user in
      const loginResponse = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: emailOrPhone.trim(),
          passwordHash: simpleHash(password),
        }),
      });

      if (!loginResponse.ok) {
        throw new Error(lang === 'KU' ? 'هەژمار دروستکرا، بەڵام چوونەژوورە سەرکەوتوو نەبوو. تکایە پاشان بچۆ ژوورەوە!' : 'Account created but automatic login failed. Please sign in manually!');
      }

      const loginData = await loginResponse.json() as any;

      setSuccess(lang === 'KU' ? 'هەژمارەکە بە سەرکەوتوویی دروستکرا! ٥٠ تۆکن پێشکەش کرا 🎁' : 'Account created successfully! You received 50 tokens 🎁');
      
      const loggedUser: UserProfile = {
        id: String(loginData.user.id),
        username: loginData.user.username,
        email_or_phone: emailOrPhone.trim(),
        passwordHash: simpleHash(password),
        tokens: loginData.user.tokens,
        is_admin: loginData.user.is_admin === 1,
      };

      // Add user to the local admin database
      const rawDB = localStorage.getItem('dama_users_db_v2') || '[]';
      try {
        let dbList = JSON.parse(rawDB);
        if (!Array.isArray(dbList)) dbList = [];
        const existsIdx = dbList.findIndex((u: any) => u.id === loggedUser.id || u.username === loggedUser.username);
        if (existsIdx > -1) {
          dbList[existsIdx] = { ...dbList[existsIdx], ...loggedUser };
        } else {
          dbList.push(loggedUser);
        }
        localStorage.setItem('dama_users_db_v2', JSON.stringify(dbList));
      } catch (e) {}

      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('dama_rem_email_phone', emailOrPhone.trim());
        try {
          localStorage.setItem('dama_rem_pass', btoa(password));
        } catch(e) {}
        localStorage.setItem('dama_rem_me', 'true');
      } else {
        localStorage.removeItem('dama_rem_email_phone');
        localStorage.removeItem('dama_rem_pass');
        localStorage.setItem('dama_rem_me', 'false');
      }

      // Live Sync via BroadcastChannel
      try {
        const bc = new BroadcastChannel('dama_multiplayer_channel');
        bc.postMessage({ type: 'SYNC_NEW_USER', user: loggedUser });
        bc.close();
      } catch (e) {}

      setTimeout(() => {
        setCurrentUser(loggedUser);
        if (onClose) onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      const isNetworkError = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('TypeError');
      if (isNetworkError) {
        setError(
          lang === 'KU' 
            ? 'پەیوەندی بە سێرڤەرەوە نەکرا! دڵنیابە لە کارکردنی Workers key و هێڵەکەت.' 
            : 'Could not connect to the backend server! Please verify your Workers and network.'
        );
      } else {
        let localizedMsg = err.message;
        if (err.message?.includes('UNIQUE constraint failed') || err.message?.includes('already exists')) {
          localizedMsg = lang === 'KU' ? 'ئەم ناوە یان ئیمێڵ/مۆبایلە پێشتر تۆمارکراوە!' : 'Username or email/phone already exists!';
        }
        setError(localizedMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');

    if (!emailOrPhone.trim() || !password.trim()) {
      setError(lang === 'KU' ? 'تکایە خانەکان پڕبکەرەوە!' : 'Please fill required fields!');
      return;
    }

    try {
      setLoading(true);

      // Call Cloudflare backend /api/login
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrPhone: emailOrPhone.trim(),
          passwordHash: simpleHash(password),
        }),
        referrerPolicy: 'no-referrer',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedErr;
        try {
          parsedErr = JSON.parse(errorText);
        } catch(e) {}
        throw new Error(parsedErr?.error || parsedErr?.message || errorText || 'Incorrect credentials!');
      }

      const data = await response.json() as any;

      setSuccess(lang === 'KU' ? 'چوونەژوورەوە سەرکەوتوو بوو!' : 'Login successful!');
      
      const loggedUser: UserProfile = {
        id: String(data.user.id),
        username: data.user.username,
        email_or_phone: emailOrPhone.trim(),
        passwordHash: simpleHash(password),
        tokens: data.user.tokens,
        is_admin: data.user.is_admin === 1,
      };

      // Add or update the user in the local admin database
      const rawUsersList = localStorage.getItem('dama_users_db_v2') || '[]';
      try {
        let parsedList = JSON.parse(rawUsersList);
        if (!Array.isArray(parsedList)) parsedList = [];
        const foundIdx = parsedList.findIndex((u: any) => u.id === loggedUser.id);
        if (foundIdx > -1) {
          parsedList[foundIdx] = { ...parsedList[foundIdx], ...loggedUser };
        } else {
          parsedList.push(loggedUser);
        }
        localStorage.setItem('dama_users_db_v2', JSON.stringify(parsedList));
      } catch (e) {}

      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('dama_rem_email_phone', emailOrPhone.trim());
        try {
          localStorage.setItem('dama_rem_pass', btoa(password));
        } catch (e) {}
        localStorage.setItem('dama_rem_me', 'true');
      } else {
        localStorage.removeItem('dama_rem_email_phone');
        localStorage.removeItem('dama_rem_pass');
        localStorage.setItem('dama_rem_me', 'false');
      }

      // Live Sync via BroadcastChannel
      try {
        const bc = new BroadcastChannel('dama_multiplayer_channel');
        bc.postMessage({ type: 'SYNC_NEW_USER', user: loggedUser });
        bc.close();
      } catch (e) {}

      setTimeout(() => {
        setCurrentUser(loggedUser);
        if (onClose) onClose();
      }, 1000);

    } catch (err: any) {
      console.error(err);
      const isNetworkError = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError') || err.message?.includes('TypeError');
      if (isNetworkError) {
        setError(
          lang === 'KU' 
            ? 'پەیوەندی بە سێرڤەرەوە نەکرا! دڵنیابە لە کارکردنی Workers key و هێڵەکەت.' 
            : 'Could not connect to the backend server! Please verify your Workers and network.'
        );
      } else {
        setError(err.message || (lang === 'KU' ? 'زانیارییەکان تەواو نین یان هەڵەن!' : 'Incorrect credentials or backend connection issue!'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-[420px] bg-slate-950/80 border border-white/10 rounded-[2rem] p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden font-sans text-right"
    >
      {/* Decorative gradient glowing orb */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Decorative top bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
      
      {currentUser ? (
        <div className="space-y-8 text-center relative z-10 w-full">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-white/10 p-2 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex items-center justify-center">
             <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border border-white/5">
                <User className="w-10 h-10 text-cyan-400 opacity-80" />
             </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-wide">{currentUser.username}</h3>
            <p className="text-xs text-white/40 font-mono mt-1 font-medium tracking-widest uppercase">ID: {currentUser.id}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex justify-between items-center space-x-4 space-x-reverse relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center space-x-3 space-x-reverse text-amber-300 relative z-10">
              <Gift className="w-6 h-6 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] text-amber-400" />
              <span className="font-bold text-sm tracking-wide text-white/90">{lang === 'KU' ? 'تۆکنەکانی تۆ:' : 'Your Tokens:'}</span>
            </div>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-200 to-amber-500 font-mono drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)] relative z-10">
              {currentUser.tokens} 🪙
            </span>
          </div>

          <button
            onClick={() => {
              setCurrentUser(null);
              setSuccess('');
              setError('');
            }}
            className="w-full py-3.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500/20 hover:border-rose-500/40 text-rose-300 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse cursor-pointer group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>{lang === 'KU' ? 'دەرچوون لە هەژمار' : 'Logout'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-7 relative z-10">
          <div className="text-center space-y-2">
            <motion.div 
               initial={{ y: -10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/10 mb-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >
              {authMode === 'LOGIN' ? <LogIn className="w-6 h-6 text-cyan-300" /> : <Sparkles className="w-6 h-6 text-cyan-300" />}
            </motion.div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-cyan-300">
              {authMode === 'LOGIN' 
                ? (lang === 'KU' ? 'ژووری ئۆنلاین' : 'Online Lobby')
                : (lang === 'KU' ? 'هەژماری نوێ' : 'New Account')}
            </h2>
            <p className="text-sm text-cyan-100/60 font-medium">
              {authMode === 'LOGIN'
                ? (lang === 'KU' ? 'چوونەژوورەوە بۆ کێبڕکێ و گرتنی پۆینت' : 'Login to compete and save tokens')
                : (lang === 'KU' ? 'بە خۆڕایی ناوت بنووسە و ٥٠ تۆکن وەربگرە!' : 'Sign up free & get 50 tokens reward!')}
            </p>
          </div>

          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl text-[13px] text-rose-200 flex items-center space-x-3 space-x-reverse justify-end font-sans shadow-[0_0_15px_rgba(244,63,94,0.1)]"
              >
                <span className="font-medium text-right flex-1">{error}</span>
                <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-[13px] text-emerald-200 flex items-center space-x-3 space-x-reverse justify-end font-sans shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                <span className="font-medium text-right flex-1">{success}</span>
                <Gift className="w-5 h-5 shrink-0 text-emerald-400" />
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={authMode === 'LOGIN' ? handleLogin : handleRegister} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {authMode === 'REGISTER' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-white/70 block px-1">{lang === 'KU' ? 'ناوی بەکارهێنەر (یوزەر)' : 'Username'}</label>
                  <div className="relative group">
                    <input
                      id="username"
                      name="username"
                      autoComplete="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. kosret99"
                      className="w-full bg-slate-900/50 border-2 border-white/5 rounded-2xl py-3.5 px-4 text-sm text-white text-right focus:outline-none focus:border-cyan-500/50 hover:border-white/10 transition-all font-mono placeholder:text-white/20"
                    />
                    <User className="absolute left-4 top-4 w-5 h-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 block px-1">
                {lang === 'KU' ? 'ئیمێڵ یان ژمارەی مۆبایل' : 'Email or Mobile'}
              </label>
              <div className="relative group">
                <input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  autoComplete="email"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="name@domain.com or 0750..."
                  className="w-full bg-slate-900/50 border-2 border-white/5 rounded-2xl py-3.5 px-4 text-sm text-white text-right focus:outline-none focus:border-cyan-500/50 hover:border-white/10 transition-all font-mono placeholder:text-white/20"
                />
                <Smartphone className="absolute left-4 top-4 w-5 h-5 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 block px-1">{lang === 'KU' ? 'پاسوۆرد' : 'Password'}</label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border-2 border-white/5 rounded-2xl py-3.5 px-4 pl-12 text-sm text-white text-right focus:outline-none focus:border-cyan-500/50 hover:border-white/10 transition-all font-mono placeholder:text-white/20"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 p-1.5 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-2">
              <div></div>
              <label className="flex items-center space-x-3 space-x-reverse cursor-pointer group text-sm text-white/60 select-none">
                <span className="group-hover:text-white transition-colors font-medium">
                  {lang === 'KU' ? 'هه‌ڵگرتنی زانیارییه‌كانم' : 'Remember Me'}
                </span>
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-2 border-white/20 bg-slate-900/50 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none checked:bg-cyan-500 checked:border-cyan-500 transition-all"
                  />
                  {rememberMe && <Sparkles className="w-3 h-3 text-black absolute pointer-events-none" />}
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.98] cursor-pointer text-base disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center space-x-2 space-x-reverse relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_1.5s_infinite]" />
              {loading ? (
                <span className="flex items-center space-x-2 space-x-reverse justify-center w-full">
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <span>{lang === 'KU' ? 'چاوەڕوان بە...' : 'Please wait...'}</span>
                </span>
              ) : authMode === 'LOGIN' ? (
                <span className="flex items-center space-x-2 space-x-reverse text-shadow-sm">
                   <LogIn className="w-5 h-5" />
                   <span>{lang === 'KU' ? 'چوونەژوورەوە' : 'Sign In'}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2 space-x-reverse text-shadow-sm">
                   <Gift className="w-5 h-5 text-amber-200" />
                   <span>{lang === 'KU' ? 'تۆمارکردن و وەرگرتنی دیاری' : 'Get Starter Gift'}</span>
                </span>
              )}
            </button>
          </form>

          <div className="text-center pt-5 border-t border-white/10 font-sans">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                setError('');
                setSuccess('');
              }}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-bold group inline-flex items-center space-x-2 space-x-reverse cursor-pointer"
            >
              <span>
                {authMode === 'LOGIN'
                ? (lang === 'KU' ? 'هێشتا هەژمارت نییە؟ ' : "Don't have an account? ")
                : (lang === 'KU' ? 'ھەژمارت ھەیە؟ ' : 'Have an account? ')}
              </span>
              <span className="underline group-hover:no-underline underline-offset-4 opacity-80 group-hover:opacity-100">
                {authMode === 'LOGIN'
                  ? (lang === 'KU' ? 'هەژمار دروستبکە' : "Sign up")
                  : (lang === 'KU' ? 'بچۆ ژورەوە' : 'Login')}
              </span>
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </motion.div>
  );
}
