import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { KeyRound, Mail, UserPlus, LogIn, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { retroAudio } from '../lib/audio';

interface AuthScreenProps {
  onAuthenticated: (authUser: any) => void;
  onGuestContinue: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, onGuestContinue }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      retroAudio.playError();
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      retroAudio.playError();
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
        });

        if (error) {
          retroAudio.playError();
          if (error.message?.includes('rate limit') || (error as any).code === 'over_email_send_rate_limit') {
            setErrorMsg('Supabase hourly email rate limit reached. If you already have an account, please switch to Log In. Or you can test via Guest Play below!');
          } else {
            setErrorMsg(error.message || 'Failed to sign up.');
          }
          return;
        }

        if (data.session && data.user) {
          retroAudio.playPairSuccess();
          setSuccessMsg('Account created successfully! Logging in...');
          setTimeout(() => {
            onAuthenticated(data.user);
          }, 800);
        } else if (data.user) {
          retroAudio.playPairSuccess();
          setSuccessMsg('Account registered! If confirmation is required, check your email, or log in now.');
          // Auto-continue to onboarding with the created user
          setTimeout(() => {
            onAuthenticated(data.user);
          }, 1200);
        }
      } else {
        // Log In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

        if (error) {
          retroAudio.playError();
          setErrorMsg(error.message || 'Invalid email or password.');
          return;
        }

        if (data.user) {
          retroAudio.playPairSuccess();
          setSuccessMsg('Login successful! Loading your cards...');
          setTimeout(() => {
            onAuthenticated(data.user);
          }, 600);
        }
      }
    } catch (err: any) {
      retroAudio.playError();
      setErrorMsg(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#333344] border-4 border-black p-6 sm:p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative">
        {/* Decorative Top Accent */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b-4 border-black">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-500 border-2 border-black flex items-center justify-center font-black text-black text-xl shadow-[3px_3px_0_0_rgba(0,0,0,1)] p-0.5">
              <img src="https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/icnons/ICON.png" alt="Icon" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase text-white tracking-tight">CARDCOUPLE</h2>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500 text-black px-2 py-1 border-2 border-black font-black uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            SECURE
          </span>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => { retroAudio.playButtonClick(); setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2 text-sm font-black uppercase border-2 border-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'login'
                ? 'bg-pink-500 text-black shadow-none translate-y-1'
                : 'bg-[#222233] text-gray-300 hover:text-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
            }`}
          >
            <LogIn size={16} />
            Log In
          </button>
          <button
            type="button"
            onClick={() => { retroAudio.playButtonClick(); setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`py-2 text-sm font-black uppercase border-2 border-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'signup'
                ? 'bg-pink-500 text-black shadow-none translate-y-1'
                : 'bg-[#222233] text-gray-300 hover:text-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
            }`}
          >
            <UserPlus size={16} />
            Sign Up
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-500/20 border-2 border-red-500 text-red-200 text-xs font-bold uppercase flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-200 text-xs font-bold uppercase flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-black text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="PLAYER@EXAMPLE.COM"
                className="w-full bg-[#1a1a2e] border-4 border-black p-3 text-white placeholder-gray-500 font-bold uppercase focus:outline-none focus:border-pink-500 text-sm"
              />
              <Mail size={18} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-black text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1a1a2e] border-4 border-black p-3 text-white placeholder-gray-500 font-bold focus:outline-none focus:border-pink-500 text-sm"
              />
              <KeyRound size={18} className="absolute right-3 top-3.5 text-gray-500 pointer-events-none" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-4 border-4 border-black font-black uppercase text-base tracking-wider transition-all flex items-center justify-center gap-2 ${
              loading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#4ade80] text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'
            }`}
          >
            {loading ? (
              <span>CONNECTING...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn size={20} />
                LOG IN & SYNC
              </>
            ) : (
              <>
                <UserPlus size={20} />
                CREATE ACCOUNT
              </>
            )}
          </button>
        </form>

        {/* Quick Offline / Guest Test */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-600 text-center">
          <p className="text-[11px] text-gray-400 uppercase font-bold mb-3">Or continue locally without an account:</p>
          <button
            type="button"
            onClick={() => { retroAudio.playButtonClick(); onGuestContinue(); }}
            className="w-full py-2 bg-[#222233] border-2 border-black text-gray-300 hover:text-white hover:bg-[#2c2c40] font-bold uppercase text-xs transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles size={14} className="text-yellow-400" />
            GUEST / QUICK PLAY
          </button>
        </div>
      </div>
    </div>
  );
};
