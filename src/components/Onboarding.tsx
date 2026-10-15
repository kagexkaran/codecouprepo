import React, { useState } from 'react';
import { User, Card } from '../types';
import { INITIAL_CARDS, PROFILE_AVATARS } from '../data';
import { UserCheck, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { retroAudio } from '../lib/audio';

interface OnboardingProps {
  user: User;
  onComplete: (updatedFields: Partial<User>) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState<'username' | 'gender'>(user.name ? 'gender' : 'username');
  const [usernameInput, setUsernameInput] = useState(user.name || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      retroAudio.playError();
      setErrorMsg('Please enter a username.');
      return;
    }
    if (trimmed.length < 2) {
      retroAudio.playError();
      setErrorMsg('Username must be at least 2 characters.');
      return;
    }
    retroAudio.playButtonClick();
    setErrorMsg(null);
    setStep('gender');
  };

  const handleGenderSelect = (gender: 'male' | 'female') => {
    retroAudio.playPairSuccess();
    // Grant starter collection of the chosen gender
    const newCollection = { ...user.collection };
    INITIAL_CARDS.forEach((card: Card) => {
      if (card.category === gender) {
        newCollection[card.id] = (newCollection[card.id] || 0) + 1;
      }
    });

    onComplete({
      name: usernameInput.trim() || user.name || 'Player 1',
      gender: gender,
      collection: newCollection,
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#333344] border-4 border-black p-6 sm:p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative animate-in fade-in zoom-in duration-300">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-black">
              {step === 'username' ? '1' : '2'}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-white">Player Profile Setup</h2>
              <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
                {step === 'username' ? 'Step 1: Choose Username' : 'Step 2: Choose Gender'}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-500 text-black px-2 py-1 border-2 border-black font-black uppercase">
            {step === 'username' ? 'STEP 1 / 2' : 'STEP 2 / 2'}
          </span>
        </div>

        {step === 'username' ? (
          <form onSubmit={handleUsernameSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-pink-500 border-4 border-black mx-auto flex items-center justify-center text-black font-black text-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <UserCheck size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase text-white mt-4">Choose Your Username</h3>
              <p className="text-sm text-gray-300 font-bold uppercase max-w-md mx-auto">
                This is your player callsign displayed to your partner and stored in your Supabase profile.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/20 border-2 border-red-500 text-red-200 text-xs font-bold uppercase text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-gray-400 mb-2">Username / Handle</label>
              <input
                type="text"
                required
                autoFocus
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="E.G. SHADOW_PLAYER, JAYA, ALEX"
                className="w-full bg-[#1a1a2e] border-4 border-black p-4 text-white placeholder-gray-500 font-black uppercase focus:outline-none focus:border-yellow-400 text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#4ade80] text-black border-4 border-black font-black uppercase text-base shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>NEXT: CHOOSE GENDER</span>
              <ArrowRight size={20} />
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black uppercase text-white">Select Your Gender</h3>
              <p className="text-sm text-gray-300 font-bold uppercase max-w-md mx-auto">
                Welcome, <span className="text-yellow-400 font-black">{usernameInput || user.name}</span>! 
                Choose your card category to receive your initial starter deck from the Supabase collection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleGenderSelect('male')}
                className="p-6 bg-blue-500 border-4 border-black text-black font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className="w-20 h-20 bg-black border-4 border-black overflow-hidden group-hover:scale-105 transition-transform shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <img
                    src={PROFILE_AVATARS.male}
                    alt="Male Profile Avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-2xl tracking-wider">MALE</span>
                <span className="text-[11px] bg-black text-white px-2 py-1 uppercase font-mono">
                  Starter Male Cards Deck
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleGenderSelect('female')}
                className="p-6 bg-pink-500 border-4 border-black text-black font-black uppercase shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className="w-20 h-20 bg-black border-4 border-black overflow-hidden group-hover:scale-105 transition-transform shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <img
                    src={PROFILE_AVATARS.female}
                    alt="Female Profile Avatar"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-2xl tracking-wider">FEMALE</span>
                <span className="text-[11px] bg-black text-white px-2 py-1 uppercase font-mono">
                  Starter Female Cards Deck
                </span>
              </button>
            </div>

            <div className="p-3 bg-black/40 border-2 border-dashed border-gray-600 text-center">
              <p className="text-[10px] text-gray-400 uppercase font-bold">
                * Note: Your starter deck unlocks all 7 core cards of your category. Images are loaded from Supabase storage (bucket: codecoup).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
