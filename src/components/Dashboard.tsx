import React, { useState } from 'react';
import { User, Card, Rarity } from '../types';
import { Coins, Heart, Users, Calendar, Flame, CheckCircle, ShieldAlert } from 'lucide-react';
import { INITIAL_CARDS, PROFILE_AVATARS } from '../data';
import { retroAudio } from '../lib/audio';

interface DashboardProps {
  user: User;
  onPair: (code: string) => void;
  onSelectGender: (gender: 'male' | 'female') => void;
  onClaimDaily: (cards: Card[], coins: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onPair, onSelectGender, onClaimDaily }) => {
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [rewardNotification, setRewardNotification] = useState<string | null>(null);

  const handlePair = () => {
    if (partnerCodeInput.trim()) {
      retroAudio.playPairSuccess();
      onPair(partnerCodeInput.trim());
      setPartnerCodeInput('');
    } else {
      retroAudio.playError();
    }
  };

  const currentDay = (user.dailyLoginCount || 0) + 1;
  const canClaim = !user.dailyLoginLastClaim || (Date.now() - user.dailyLoginLastClaim > 24 * 60 * 60 * 1000);
  
  // Streak calculation: check if streak was broken (missed day: > 48h since previous claim)
  const isStreakBroken = user.dailyLoginLastClaim 
    ? (Date.now() - user.dailyLoginLastClaim > 48 * 60 * 60 * 1000)
    : false;
  const activeStreak = isStreakBroken ? 0 : (user.dailyStreak || 0);

  const getRewardForDay = (day: number): { rarity?: Rarity, coins: number } => {
    if (day > 30) return { coins: 50 }; // fallback after month
    const rewards: Record<number, Rarity> = {
      3: 'Common', 7: 'Common', 12: 'Common',
      16: 'Rare', 21: 'Rare',
      25: 'Epic', 27: 'Epic',
      29: 'Legendary',
      30: 'Mythic'
    };
    if (rewards[day]) {
      return { rarity: rewards[day], coins: 0 };
    }
    return { coins: 50 };
  };

  const handleClaim = () => {
    retroAudio.playDailyClaim();
    const reward = getRewardForDay(currentDay);
    let cards: Card[] = [];
    if (reward.rarity) {
      const eligible = INITIAL_CARDS.filter(c => c.rarity === reward.rarity && c.category !== user.gender);
      if (eligible.length > 0) {
        cards.push(eligible[Math.floor(Math.random() * eligible.length)]);
      }
    }
    
    onClaimDaily(cards, reward.coins);
    
    const nextStreak = isStreakBroken || !user.dailyLoginLastClaim ? 1 : activeStreak + 1;
    if (cards.length > 0) {
      setRewardNotification(`Claimed ${cards[0].name} (${cards[0].rarity})! 🔥 Streak: ${nextStreak} Days!`);
    } else {
      setRewardNotification(`Claimed ${reward.coins} Coins! 🔥 Streak: ${nextStreak} Days!`);
    }
    setTimeout(() => setRewardNotification(null), 4000);
  };

  if (!user.gender) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-4xl font-black uppercase text-center text-pink-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Choose Your Path</h2>
        <p className="text-xl text-gray-300 font-bold uppercase text-center max-w-md leading-relaxed">
          Select your category to receive your starter collection. This cannot be changed later!
        </p>
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl px-4">
          <button 
            onClick={() => { retroAudio.playButtonClick(); onSelectGender('male'); }}
            className="flex-1 p-8 bg-blue-500 border-4 border-black text-black text-2xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center gap-4 group cursor-pointer"
          >
            <div className="w-24 h-24 bg-black border-4 border-black overflow-hidden group-hover:scale-105 transition-transform">
              <img 
                src={PROFILE_AVATARS.male} 
                alt="Male Profile" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            </div>
            MALE
          </button>
          <button 
            onClick={() => { retroAudio.playButtonClick(); onSelectGender('female'); }}
            className="flex-1 p-8 bg-pink-500 border-4 border-black text-black text-2xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col items-center gap-4 group cursor-pointer"
          >
            <div className="w-24 h-24 bg-black border-4 border-black overflow-hidden group-hover:scale-105 transition-transform">
              <img 
                src={PROFILE_AVATARS.female} 
                alt="Female Profile" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            </div>
            FEMALE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      
      {/* Profile Header */}
      <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-black uppercase text-pink-400">Player Profile</h2>
          {/* Profile Section Streak Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Flame size={14} className="fill-black text-black animate-bounce shrink-0" />
            <span>{activeStreak} {activeStreak === 1 ? 'DAY' : 'DAYS'} STREAK</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar Profile Image */}
          <div className={`w-24 h-24 border-4 border-black overflow-hidden relative shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${user.gender === 'male' ? 'bg-blue-600' : 'bg-pink-600'}`}>
            <img 
              src={user.gender === 'female' ? PROFILE_AVATARS.female : PROFILE_AVATARS.male} 
              alt={user.gender || 'Player Avatar'} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center" 
            />
          </div>

          <div className="min-w-0 flex-1 w-full">
            <div className="flex items-center gap-2">
              <p className="text-xl uppercase font-bold text-white break-all truncate">{user.name}</p>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${user.gender === 'male' ? 'bg-blue-400 text-black' : 'bg-pink-400 text-black'}`}>
                {user.gender}
              </span>
            </div>

            <p className="text-sm text-gray-400 uppercase tracking-widest mt-1">
              Code: <span className="text-white select-all font-mono">{user.pairingCode}</span>
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-black p-2 border-2 border-white/20 w-fit">
                <span className="text-yellow-400 text-xl mr-2">●</span>
                <span className="text-lg sm:text-xl font-bold truncate">{user.coins.toLocaleString()} COINS</span>
              </div>

              {isStreakBroken ? (
                <div className="flex items-center gap-1 text-[11px] text-amber-300 bg-red-950/80 border border-red-500 px-2 py-1 font-bold uppercase">
                  <ShieldAlert size={14} className="text-red-400" />
                  <span>Streak reset! Claim today</span>
                </div>
              ) : activeStreak > 0 ? (
                <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-500/50 px-2 py-1 font-bold uppercase">
                  <Flame size={13} className="fill-amber-400 text-amber-400" />
                  <span>Active Streak Protected</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Pairing Section */}
      <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-3xl font-black uppercase mb-4 text-green-400">Pairing Status</h2>
        
        {user.partnerCode ? (
          <div className="space-y-4">
            <p className="text-sm uppercase leading-relaxed text-gray-300">Connected with your partner to share your collection and earn daily login bonuses!</p>
            <div className="flex items-center justify-center p-6 bg-black border-4 border-black overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Heart className="text-pink-500 w-12 h-12 animate-pulse mr-4 shrink-0" />
              <div className="min-w-0">
                <p className="text-green-400 uppercase font-black text-xl truncate">PAIRED ACTIVE</p>
                <p className="text-sm text-gray-400 uppercase truncate">Code: {user.partnerCode}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm uppercase leading-relaxed text-gray-300">Connect with your partner to share your collection and earn daily login bonuses!</p>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="ENTER CODE..." 
                value={partnerCodeInput}
                onChange={(e) => setPartnerCodeInput(e.target.value)}
                className="flex-1 bg-black border-4 border-black p-2 text-white placeholder-gray-600 focus:outline-none uppercase font-bold w-full min-w-0"
              />
              <button 
                onClick={handlePair}
                className="px-6 py-2 bg-pink-500 text-black border-4 border-black font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all whitespace-nowrap shrink-0 cursor-pointer"
              >
                Pair
              </button>
            </div>
            <p className="text-xs text-pink-400 uppercase font-bold italic truncate">Status: Waiting for partner code...</p>
          </div>
        )}
      </div>

      {/* Daily Login Section */}
      <div className="md:col-span-2 p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl font-black uppercase text-blue-400">Daily Login Bonus</h2>
          </div>

          {/* Daily Streak Highlight Badge */}
          <div className="flex items-center gap-2 bg-black border-2 border-black px-3 py-1 shadow-[2px_2px_0_rgba(0,0,0,1)]">
            <Flame size={18} className="fill-amber-400 text-amber-400 animate-pulse" />
            <span className="text-xs font-black uppercase text-gray-400">Streak:</span>
            <span className="text-sm font-black uppercase text-amber-400">{activeStreak} {activeStreak === 1 ? 'Day' : 'Days'}</span>
          </div>
        </div>
        
        {!user.partnerCode ? (
          <div className="bg-black/50 border-4 border-black p-8 text-center">
            <LockIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest">Locked until pair is established</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Daily Streak Counter Block */}
            <div className="bg-black border-4 border-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <Flame size={28} className="fill-black text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black uppercase text-base sm:text-lg text-amber-400">Daily Streak Counter</h3>
                    <span className="text-xs bg-amber-400 text-black font-black px-2 py-0.5 border border-black">
                      {activeStreak} {activeStreak === 1 ? 'DAY' : 'DAYS'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 uppercase font-bold mt-1">
                    {canClaim
                      ? activeStreak === 0
                        ? '🔥 Claim today to begin your login streak at Day 1!'
                        : `🔥 Claim today to advance to a ${activeStreak + 1}-Day streak!`
                      : '✓ Streak protected for today! Return tomorrow to keep the flame alive.'}
                  </p>
                </div>
              </div>

              {/* Visual Milestone Badges */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                {[1, 3, 7, 14, 30].map(milestone => {
                  const reached = activeStreak >= milestone;
                  return (
                    <div
                      key={milestone}
                      title={`${milestone} Day Streak Milestone`}
                      className={`px-2 py-1 border-2 text-[10px] font-black uppercase transition-all ${
                        reached
                          ? 'bg-amber-400 text-black border-black shadow-[2px_2px_0_rgba(0,0,0,1)] font-black'
                          : 'bg-black/60 text-gray-600 border-gray-800'
                      }`}
                    >
                      {milestone}D
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center bg-black border-4 border-black p-4">
              <span className="font-bold uppercase text-gray-400">Day <span className="text-white text-xl">{currentDay > 30 ? 30 : currentDay}</span> / 30</span>
              <button 
                onClick={handleClaim}
                disabled={!canClaim || currentDay > 30}
                className={`px-6 py-2 border-4 border-black font-black uppercase transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] cursor-pointer ${
                  canClaim && currentDay <= 30
                    ? 'bg-yellow-400 text-black hover:translate-y-1 hover:shadow-none' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none'
                }`}
              >
                {canClaim ? (currentDay > 30 ? 'Completed' : 'Claim Reward') : 'Next Tomorrow'}
              </button>
            </div>

            {rewardNotification && (
              <div className="p-3 bg-green-500 text-black border-4 border-black font-black uppercase text-center animate-in fade-in zoom-in duration-300">
                {rewardNotification}
              </div>
            )}
            
            <p className="text-xs text-gray-500 uppercase font-bold text-center">Rewards include 3x Common, 2x Rare, 2x Epic, 1x Legendary, 1x Mythic</p>
          </div>
        )}
      </div>

      {/* Rules / Info Summary */}
      <div className="md:col-span-2 p-6 border-4 border-dashed border-white/20 bg-black/20">
        <h3 className="uppercase font-black text-gray-500 mb-2">System Rules</h3>
        <div className="text-sm space-y-2 opacity-80 font-bold uppercase tracking-wide">
          <p className="text-green-400">{">"} Collect cards from the shop.</p>
          <p className="text-yellow-400">{">"} Exchange duplicates for coins.</p>
          <p className="text-pink-400">{">"} Play cards in real life with your partner!</p>
        </div>
      </div>

    </div>
  );
};

const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
