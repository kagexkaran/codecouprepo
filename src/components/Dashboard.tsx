import React, { useState } from 'react';
import { User, PairRequest } from '../types';
import { Calendar, ShieldAlert, Flame, CheckCircle, Clock } from 'lucide-react';
import { PairingSection } from './PairingSection';
import { retroAudio } from '../lib/audio';
import { INITIAL_CARDS as cards, PROFILE_AVATARS } from '../data';

interface DashboardProps {
  user: User;
  incomingRequests: PairRequest[];
  outgoingRequest: PairRequest | null;
  onSendPairRequest?: (code: string) => Promise<{ success: boolean; message: string }>;
  onAcceptPairRequest?: (id: string) => Promise<void>;
  onDeclinePairRequest?: (id: string) => Promise<void>;
  onCancelPairRequest?: (id: string) => Promise<void>;
  onUnpair?: () => Promise<void>;
  onOpenAuth?: () => void;
  onPair?: (code: string) => void;
  onSelectGender?: (gender: 'male' | 'female') => void;
  onClaimDaily?: (cards: any[], coins: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  incomingRequests,
  outgoingRequest,
  onSendPairRequest,
  onAcceptPairRequest,
  onDeclinePairRequest,
  onCancelPairRequest,
  onUnpair,
  onOpenAuth,
  onPair,
  onSelectGender,
  onClaimDaily
}) => {
  const [rewardNotification, setRewardNotification] = useState<string | null>(null);

  const activeStreak = user.dailyStreak || 0;
  const currentDay = (user.dailyLoginCount || 0) + 1;

  let canClaim = false;
  let isStreakBroken = false;
  if (!user.dailyLoginLastClaim) {
    canClaim = true;
  } else {
    const now = Date.now();
    const elapsed = now - user.dailyLoginLastClaim;
    const hours24 = 24 * 60 * 60 * 1000;
    const hours48 = 48 * 60 * 60 * 1000;
    if (elapsed > hours24 && elapsed <= hours48) {
      canClaim = true;
    } else if (elapsed > hours48) {
      canClaim = true;
      isStreakBroken = true;
    }
  }

  const handleClaim = () => {
    if (!canClaim || currentDay > 30) return;
    retroAudio.playPurchase();
    
    // Just giving a generic reward for now
    const rewardCards = [];
    const rewardCoins = 100 + (activeStreak * 10);
    
    if (onClaimDaily) {
      onClaimDaily(rewardCards, rewardCoins);
    }
    
    setRewardNotification(`Claimed ${rewardCoins} coins!`);
    setTimeout(() => setRewardNotification(null), 3000);
  };

  // Safe avatar handling
  const avatarNumber = (user.name?.length || 0) % 5 + 1;
  const avatarUrl = user.gender === 'female' 
    ? `https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/avatars/f${avatarNumber}.png`
    : `https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/avatars/m${avatarNumber}.png`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-[1200px] mx-auto">
      
      {/* LEFT COLUMN - Profile & Daily */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* PROFILE PANEL */}
        <div className="pixel-panel-green p-4 flex flex-col gap-4">
          <div className="flex items-center justify-center border-b-4 border-black pb-2 mb-2 border-dashed">
             <h2 className="text-2xl font-black uppercase text-black">PROFILE</h2>
          </div>
          
          {/* User Info Row */}
          <div className="flex gap-4">
            <div className="flex-1 pixel-border-sm bg-[#d7c4a1] rounded p-2 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 pointer-events-none"></div>
              <div className="w-12 h-12 bg-white rounded-full border-2 border-black flex items-center justify-center overflow-hidden z-10 shrink-0">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="z-10 flex flex-col min-w-0">
                <span className="font-bold uppercase text-black truncate text-sm">{user.name || 'USER'}</span>
                <span className="text-xs text-black/70 uppercase truncate font-vt323">{user.pairingCode}</span>
              </div>
            </div>
            
            <div className="flex-1 pixel-border-sm gradient-purple-pink rounded p-2 flex items-center gap-3 text-white">
               <div className="w-10 h-10 bg-yellow-400 rounded-full border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_rgba(0,0,0,1)] text-black font-black text-xl">
                 $
               </div>
               <div className="flex flex-col min-w-0">
                  <span className="font-black uppercase text-xs">COINS</span>
                  <span className="font-vt323 text-lg leading-none">{user.coins.toLocaleString()}</span>
               </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex gap-4">
             <div className="flex-1 pixel-border-sm gradient-orange-yellow rounded p-2 flex items-center gap-3 text-black">
                <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_rgba(0,0,0,1)] text-white">
                  <Flame size={20} className="fill-current" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black uppercase text-xs">STREAK</span>
                  <span className="font-vt323 text-lg leading-none">{activeStreak}</span>
               </div>
             </div>

             <div className="flex-1 pixel-border-sm gradient-blue-cyan rounded p-2 flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-pink-500 rounded-full border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_rgba(0,0,0,1)] text-white">
                  <Clock size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black uppercase text-[10px]">NEW DAY IN</span>
                  <span className="font-vt323 text-lg leading-none">24:00:00</span>
               </div>
             </div>
          </div>
        </div>

        {/* DAILY REWARD PANEL */}
        <div className="pixel-panel p-4 bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-between gap-4">
           <div className="flex items-center gap-3 bg-yellow-400 p-2 rounded pixel-border-sm">
             <Calendar className="w-8 h-8 text-blue-600" />
             <div className="flex flex-col bg-white px-2 py-1 border-2 border-black rounded-sm items-center">
                <span className="font-black text-xs">DAILY LOGIN</span>
                <span className="font-vt323 text-blue-600 text-sm">DAY {currentDay > 30 ? 30 : currentDay}</span>
             </div>
           </div>

           <button 
             onClick={handleClaim}
             disabled={!canClaim || currentDay > 30}
             className={`pixel-button ${canClaim && currentDay <= 30 ? 'bg-white text-black' : 'bg-gray-300 text-gray-500 opacity-80 cursor-not-allowed'}`}
           >
             <div className="flex items-center gap-2 px-3 py-2">
                <span className="font-black text-xs">{canClaim ? 'CLAIM REWARD' : 'CHECK BACK TOMORROW'}</span>
             </div>
           </button>
        </div>

        {/* PAIRED USER PANEL */}
        <div className="pixel-panel-green">
           <div className="flex items-center justify-center border-b-4 border-black py-2 border-dashed">
             <h2 className="text-xl font-black uppercase text-black">PAIRED USER</h2>
          </div>
          <div className="p-0">
            <PairingSection
              user={user}
              incomingRequests={incomingRequests}
              outgoingRequest={outgoingRequest}
              onSendPairRequest={onSendPairRequest || (async () => ({ success: true, message: '' }))}
              onAcceptPairRequest={onAcceptPairRequest || (async () => {})}
              onDeclinePairRequest={onDeclinePairRequest || (async () => {})}
              onCancelPairRequest={onCancelPairRequest || (async () => {})}
              onUnpair={onUnpair || (async () => {})}
              onOpenAuth={onOpenAuth}
              compact={true}
            />
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN - Card History & Featured */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* CARD HISTORY */}
        <div className="pixel-panel-green p-4 h-full flex flex-col">
           <div className="flex items-center justify-center border-b-4 border-black pb-2 mb-4 border-dashed">
             <h2 className="text-2xl font-black uppercase text-black text-center">CARD HISTORY</h2>
           </div>
           
           <div className="space-y-3 flex-1">
             {user.history && user.history.slice(0, 3).map((item, idx) => (
                <div key={idx} className="pixel-border-sm rounded-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] p-1.5 flex items-center gap-3">
                   <div className="w-12 h-12 bg-white rounded-full border-2 border-black shrink-0 flex items-center justify-center overflow-hidden">
                     {/* Try to find matching card for image */}
                     {(() => {
                        const cardMatch = cards.find(c => c.name.toLowerCase() === item.cardName.toLowerCase());
                        return cardMatch ? (
                          <img src={cardMatch.imageUrl} alt="card" className="w-8 h-8 object-contain" />
                        ) : (
                          <div className="font-black text-xs">CARD</div>
                        );
                     })()}
                   </div>
                   <div className="flex-1 text-black flex flex-col justify-center">
                     <span className="font-black text-xs sm:text-sm uppercase">{item.cardName}</span>
                     <span className="text-[10px] text-white/90 font-bold uppercase">{item.action}</span>
                   </div>
                   <div className="flex items-center gap-2 pr-2">
                     <div className="text-right hidden sm:block text-black">
                       <span className="block font-black text-xs uppercase">USED BY</span>
                       <span className="block text-[10px] uppercase font-vt323">{item.userId === user.id ? user.name : user.partnerName}</span>
                     </div>
                     <div className="w-10 h-10 bg-white rounded-full border-2 border-black flex items-center justify-center overflow-hidden shrink-0">
                        <img src={item.userId === user.id ? avatarUrl : (user.partnerGender === 'female' ? PROFILE_AVATARS.female : PROFILE_AVATARS.male)} alt="avatar" className="w-full h-full object-cover" />
                     </div>
                   </div>
                </div>
             ))}
             {(!user.history || user.history.length === 0) && (
               <div className="h-24 flex items-center justify-center opacity-50">
                 <p className="font-black text-black uppercase">No recent card activity.</p>
               </div>
             )}
           </div>

           {/* FEATURED CARDS VISUAL */}
           <div className="mt-6 flex-1 min-h-[300px] relative flex justify-center items-end pb-8 overflow-hidden bg-emerald-500 rounded pixel-border-sm pattern-bg">
               {/* Pattern overlay for the green area */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
               
               {/* Static decorative cards like the reference */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full h-full">
                  <div className="w-[180px] h-[260px] bg-black border-4 border-black rounded-lg absolute transform -rotate-[15deg] -translate-x-[60px] shadow-[8px_8px_0_rgba(0,0,0,0.5)] overflow-hidden">
                    <img src="https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/PEACE%20CARD%20(M).png" className="w-full h-full object-cover" alt="card" />
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>
                  <div className="w-[180px] h-[260px] bg-black border-4 border-black rounded-lg absolute transform rotate-[5deg] translate-x-[40px] shadow-[8px_8px_0_rgba(0,0,0,0.5)] overflow-hidden">
                     <img src="https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/PEACE%20CARD%20(F).png" className="w-full h-full object-cover" alt="card" />
                     <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <div className="w-[190px] h-[270px] bg-black border-4 border-black rounded-lg absolute transform rotate-[15deg] translate-x-[100px] shadow-[12px_12px_0_rgba(0,0,0,0.8)] z-10 card-hover-lift cursor-pointer overflow-hidden group">
                     <img src="https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/TIME%20CARD%20(M).png" className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="card" />
                     <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-black flex items-center gap-1">
                        RARE <span className="text-yellow-400">★</span>
                     </div>
                  </div>
               </div>
           </div>

        </div>

      </div>
    </div>
  );
};
