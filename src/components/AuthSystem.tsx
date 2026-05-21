import React, { useState } from 'react';
import { User, ShieldAlert, Key, Smartphone, Mail, Lock, Gift, LogOut, Eye, EyeOff } from 'lucide-react';
import { Language } from '../translations';
import { BACKEND_URL } from '../config';

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

      setSuccess(lang === 'KU' ? 'هەژمارەکە بە سەرکەوتوویی دروستکرا! ٥٠ تۆکن پێشکەش کرا 🎁' : lang === 'AR' ? 'تم إنشاء الحساب بنجاح! حصلت على 50 توكن 🎁' : 'Account created successfully! You received 50 tokens 🎁');
      
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
            : lang === 'AR'
            ? 'فصل الاتصال بالسيرفر! يرجى التأكد من تشغيل الـ Workers.'
            : 'Could not connect to the backend server! Please verify your Workers and network.'
        );
      } else {
        let localizedMsg = err.message;
        if (err.message?.includes('UNIQUE constraint failed') || err.message?.includes('already exists')) {
          localizedMsg = lang === 'KU' ? 'ئەم ناوە یان ئیمێڵ/مۆبایلە پێشتر تۆمارکراوە!' : lang === 'AR' ? 'هذا الاسم أو الهاتف مسجل مسبقاً!' : 'Username or email/phone already exists!';
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
      setError(lang === 'KU' ? 'تکایە خانەکان پڕبکەرەوە!' : lang === 'AR' ? 'الرجاء ملء الحقول المطلوبة!' : 'Please fill required fields!');
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

      setSuccess(lang === 'KU' ? 'چوونەژوورەوە سەرکەوتوو بوو!' : lang === 'AR' ? 'تم تسجيل الدخول بنجاح!' : 'Login successful!');
      
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
            : lang === 'AR'
            ? 'فصل الاتصال بالسيرفر! يرجى التأكد من تشغيل الـ Workers.'
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
    <div className="w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden font-sans text-right">
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-500" />
      
      {currentUser ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{currentUser.username}</h3>
            <p className="text-xs text-white/50 font-mono mt-0.5">ID: {currentUser.id}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/15 to-yellow-500/5 border border-amber-500/30 rounded-2xl p-4 flex justify-between items-center space-x-4 space-x-reverse">
            <div className="flex items-center space-x-2 space-x-reverse text-amber-300">
              <Gift className="w-5 h-5 animate-pulse" />
              <span className="font-black text-sm">{lang === 'KU' ? 'تۆکنەکانی تۆ:' : lang === 'AR' ? 'التوكنات الخاصة بك:' : 'Your Tokens:'}</span>
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              {currentUser.tokens} 🪙
            </span>
          </div>

          <button
            onClick={() => {
              setCurrentUser(null);
              setSuccess('');
              setError('');
            }}
            className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 space-x-reverse cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'KU' ? 'دەرچوون لە هەژمار' : lang === 'AR' ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300">
              {authMode === 'LOGIN' 
                ? (lang === 'KU' ? 'چوونەژورەوەی ئۆնلاین' : lang === 'AR' ? 'تسجيل الدخول' : 'Online Login')
                : (lang === 'KU' ? 'درۆستکردنی هەژمار' : lang === 'AR' ? 'إنشاء حساب جدید' : 'Sign Up')}
            </h2>
            <p className="text-xs text-white/50">
              {authMode === 'LOGIN'
                ? (lang === 'KU' ? 'بۆ دەستپێکردنی کێبڕکێ و گرتنی پۆینت' : lang === 'AR' ? 'سجل للمنافسة وجمع التوكنات' : 'Login to compete and save tokens')
                : (lang === 'KU' ? 'بە خۆڕایی ناوت بنووسە و ٥٠ تۆکن وەربگرە!' : lang === 'AR' ? 'سجل مجاناً واحصل على 50 توكن هدية!' : 'Sign up free & get 50 tokens reward!')}
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl text-xs text-rose-300 flex items-center space-x-2 space-x-reverse justify-end font-sans">
              <span>{error}</span>
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 space-x-reverse justify-end font-sans">
              <span>{success}</span>
              <Gift className="w-4 h-4 shrink-0 text-emerald-400" />
            </div>
          )}

          <form onSubmit={authMode === 'LOGIN' ? handleLogin : handleRegister} className="space-y-4">
            {authMode === 'REGISTER' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-white/60 block">{lang === 'KU' ? 'ناوی بەکارهێنەر (یوزەر)' : lang === 'AR' ? 'اسم المستخدم' : 'Username'}</label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    autoComplete="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. kosret99"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white text-right focus:outline-none focus:border-cyan-500 transition-all font-mono"
                  />
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-white/60 block">
                {lang === 'KU' ? 'ئیمێڵ یان ژمارەی مۆبایل' : lang === 'AR' ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or Mobile'}
              </label>
              <div className="relative">
                <input
                  id="emailOrPhone"
                  name="emailOrPhone"
                  autoComplete="email"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. user@dama.com or 0750xxxx"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white text-right focus:outline-none focus:border-cyan-500 transition-all font-mono"
                />
                <Smartphone className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-white/60 block">{lang === 'KU' ? 'پاسوۆرد' : lang === 'AR' ? 'كلمة المرور' : 'Password'}</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-3.5 text-sm text-white text-right focus:outline-none focus:border-cyan-500 transition-all font-mono pl-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-2.5 p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <div></div>
              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer group text-xs text-white/60 select-none">
                <span className="group-hover:text-white transition-colors">
                  {lang === 'KU' ? 'بیرم کەرەوە (هه‌ڵگرتنی زانیارییه‌كان)' : 'Remember Me'}
                </span>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-black/40 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black rounded-xl transition-all shadow-md active:scale-95 cursor-pointer text-sm disabled:opacity-50"
            >
              {loading 
                ? (lang === 'KU' ? 'تکایە چاوەڕوان بە... ⏳' : 'Please wait... ⏳') 
                : authMode === 'LOGIN'
                  ? (lang === 'KU' ? 'چوونەژوورەوە 🔑' : lang === 'AR' ? 'تسجيل الدخول' : 'Sign In')
                  : (lang === 'KU' ? 'تۆمارکردن و وەرگرتنی دیاری 🎁' : lang === 'AR' ? 'إنشاء حساب وهدية التوكنات' : 'Get Starter Gift')
              }
            </button>
          </form>

          <div className="text-center pt-2 border-t border-white/5 font-sans">
            <button
              onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
              className="text-xs text-cyan-400 hover:underline font-bold"
            >
              {authMode === 'LOGIN'
                ? (lang === 'KU' ? 'هێشتا هەژمارت نییە؟ دروستی بکە' : lang === 'AR' ? 'ليس لديك حساب؟ سجل الآن' : "Don't have an account? Sign up")
                : (lang === 'KU' ? 'ھەژمارت ھەیە؟ بچۆ ژورەوە' : lang === 'AR' ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Have an account? Login')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
