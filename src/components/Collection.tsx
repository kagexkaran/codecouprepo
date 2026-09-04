import React, { useState } from 'react';
import { User, Card } from '../types';
import { INITIAL_CARDS, RARITY_COIN_VALUES } from '../data';
import { CardView } from './CardView';
import { retroAudio } from '../lib/audio';

interface CollectionProps {
  user: User;
  onExchange: (cardId: string, coinValue: number) => void;
  onUseCard: (cardId: string) => void;
  onSendCard: (cardId: string) => void;
}

export const Collection: React.FC<CollectionProps> = ({ user, onExchange, onUseCard, onSendCard }) => {
  const [filter, setFilter] = useState<'send' | 'received'>('send');

  const collectedCardIds = Object.keys(user.collection).filter(id => user.collection[id] > 0);
  
  const displayCards = INITIAL_CARDS.filter(card => {
    if (!collectedCardIds.includes(card.id)) return false;
    if (filter === 'send') return card.category === user.gender;
    return card.category !== user.gender; // Received
  });

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-4xl font-black uppercase">Your Cards</h2>
        
        <div className="flex space-x-2 sm:space-x-4 text-sm">
          {(['send', 'received'] as const).map(f => (
            <button
              key={f}
              onClick={() => { retroAudio.playButtonClick(); setFilter(f); }}
              className={`px-3 py-1 border-2 border-black font-bold uppercase transition-colors cursor-pointer ${filter === f ? 'bg-pink-500 text-black shadow-[4px_4px_0_rgba(0,0,0,1)]' : 'bg-[#333344] text-white hover:bg-[#444455]'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {displayCards.length === 0 ? (
        <div className="bg-[#333344] border-4 border-dashed border-gray-600 p-12 text-center">
          <p className="text-2xl font-black text-gray-500 uppercase">Empty Sector</p>
          <p className="mt-2 text-sm opacity-80 uppercase font-bold text-gray-400">Visit the shop to acquire assets</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
          {displayCards.map(card => {
            const quantity = user.collection[card.id];
            const exchangeValue = RARITY_COIN_VALUES[card.rarity];
            const isSameGender = user.gender === card.category;
            
            return (
              <CardView 
                key={card.id} 
                card={card} 
                quantity={quantity}
                actionButton={
                  <div className="flex flex-col w-full gap-1 mt-2">
                    <button 
                      onClick={() => {
                        if (!isSameGender && user.partnerCode) {
                          retroAudio.playButtonClick();
                          onUseCard(card.id);
                        } else {
                          retroAudio.playError();
                        }
                      }}
                      disabled={isSameGender || !user.partnerCode}
                      className={`w-full text-[10px] py-1 font-bold uppercase border-2 border-black transition-colors ${
                        isSameGender || !user.partnerCode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-black hover:bg-green-400 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none cursor-pointer'
                      }`}
                    >
                      {user.partnerCode ? (isSameGender ? 'Cannot Use Own' : 'Use') : 'Needs Partner'}
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (user.partnerCode) {
                          retroAudio.playButtonClick();
                          onSendCard(card.id);
                        } else {
                          retroAudio.playError();
                        }
                      }}
                      disabled={!user.partnerCode}
                      className={`w-full text-[10px] py-1 font-bold uppercase border-2 border-black transition-colors ${
                        !user.partnerCode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-400 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none cursor-pointer'
                      }`}
                    >
                      Send
                    </button>
                    
                    {quantity > 1 ? (
                      <button 
                        onClick={() => {
                          if (!isSameGender) {
                            retroAudio.playPurchase();
                            onExchange(card.id, exchangeValue);
                          } else {
                            retroAudio.playError();
                          }
                        }}
                        disabled={isSameGender}
                        className={`w-full text-[10px] py-1 font-bold uppercase border-2 border-black transition-colors ${
                          isSameGender ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none cursor-pointer'
                        }`}
                      >
                        {isSameGender ? 'No Exchange' : `Exchange: ${exchangeValue}C`}
                      </button>
                    ) : (
                      <div className="w-full text-center text-[10px] text-gray-400 py-1 border-2 border-dashed border-gray-500 font-bold uppercase">
                        KEEP 1 TO PLAY
                      </div>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
