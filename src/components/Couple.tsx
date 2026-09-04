import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { INITIAL_CARDS } from '../data';
import { Heart, Clock } from 'lucide-react';
import { CardView } from './CardView';

interface CoupleProps {
  user: User;
}

export const Couple: React.FC<CoupleProps> = ({ user }) => {
  const [daysConnected, setDaysConnected] = useState(0);

  useEffect(() => {
    if (user.connectedAt) {
      const msDiff = Date.now() - user.connectedAt;
      setDaysConnected(Math.floor(msDiff / (1000 * 60 * 60 * 24)));
    }
  }, [user.connectedAt]);

  const activeCards = (user.activeCards || []).filter(ac => ac.expiresAt > Date.now());

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4 mb-6">
            <Heart className="w-10 h-10 text-pink-500 fill-pink-500 animate-pulse" />
            <h2 className="text-3xl font-black uppercase text-pink-400">Connection Link</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-black border-4 border-black p-4 flex flex-col">
              <span className="text-gray-400 uppercase font-black text-xs">Your Link</span>
              <span className="text-white font-bold uppercase text-lg sm:text-xl truncate select-all">{user.pairingCode} <span className="text-gray-500 mx-2">↔</span> {user.partnerCode}</span>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 bg-black border-4 border-black p-4 flex flex-col items-center justify-center">
                <span className="text-gray-400 uppercase font-black text-xs mb-2 text-center">Days Connected</span>
                <div className="text-4xl text-green-400 font-black flex items-center gap-2">
                  <Clock size={28} className="shrink-0" />
                  {daysConnected}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black uppercase mb-4 text-blue-400">Active Effects</h2>
          <p className="text-sm uppercase leading-relaxed text-gray-300 mb-6">
            Cards that are currently active in your connection.
          </p>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {activeCards.length === 0 ? (
              <div className="bg-black/50 border-2 border-dashed border-gray-600 p-8 text-center text-gray-500 uppercase font-bold text-sm">
                No active cards right now.
              </div>
            ) : (
              activeCards.map(ac => {
                const cardDef = INITIAL_CARDS.find(c => c.id === ac.cardId);
                if (!cardDef) return null;
                
                const timeLeftStr = new Date(ac.expiresAt - Date.now()).toISOString().substring(11, 19);

                return (
                  <div key={ac.cardId + ac.expiresAt} className="bg-black border-2 border-black p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-black uppercase text-white">{cardDef.name}</h4>
                      <p className="text-xs text-gray-400 uppercase">{cardDef.description}</p>
                    </div>
                    <div className="bg-red-900/50 border-2 border-red-500 px-3 py-1 text-red-400 font-mono font-bold text-sm shrink-0">
                      {timeLeftStr}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
