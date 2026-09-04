import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { RARITY_COLORS } from '../data';
import { X, Gamepad2, Moon, Feather, Flame, Gift, Crown, Banknote } from 'lucide-react';
import { retroAudio } from '../lib/audio';

interface CardViewProps {
  card: Card;
  quantity?: number;
  onClick?: () => void;
  actionButton?: React.ReactNode;
}

const getCardFallbackIcon = (cardName: string) => {
  const lower = cardName.toLowerCase();
  if (lower.includes('game')) return <Gamepad2 size={40} className="text-white drop-shadow-md" />;
  if (lower.includes('sleep')) return <Moon size={40} className="text-white drop-shadow-md" />;
  if (lower.includes('peace')) return <Feather size={40} className="text-white drop-shadow-md" />;
  if (lower.includes('18+')) return <Flame size={40} className="text-red-300 drop-shadow-md animate-pulse" />;
  if (lower.includes('surprise') || lower.includes('suprise')) return <Gift size={40} className="text-yellow-200 drop-shadow-md" />;
  if (lower.includes('cash')) return <Banknote size={40} className="text-emerald-300 drop-shadow-md" />;
  return <Crown size={40} className="text-amber-200 drop-shadow-md" />;
};

export const CardView: React.FC<CardViewProps> = ({ card, quantity, onClick, actionButton }) => {
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const bgColor = RARITY_COLORS[card.rarity] || 'bg-gray-500';

  useEffect(() => {
    setImgError(false);
  }, [card.imageUrl]);

  const handleCardClick = () => {
    retroAudio.playCardInspect();
    if (onClick) onClick();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    retroAudio.playButtonClick();
    setShowModal(false);
  };

  return (
    <>
      <div 
        className={`relative bg-[#444455] border-4 border-black p-2 flex flex-col items-center group w-full max-w-[192px] h-[320px] text-center transition-all cursor-pointer hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_0_rgba(0,0,0,1)]`}
        onClick={handleCardClick}
      >
        {quantity !== undefined && (
          <div className="absolute -top-3 -right-3 bg-pink-500 text-black font-black text-xs px-2 py-1 border-2 border-black z-20 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            x{quantity}
          </div>
        )}
        
        <div className={`w-full aspect-[2/3] ${bgColor} border-2 border-black relative mb-2 overflow-hidden flex flex-col items-center justify-center`}>
          <div className="absolute inset-0 border-8 border-white/20 pointer-events-none z-10"></div>
          {card.imageUrl && !imgError ? (
            <img 
              src={card.imageUrl} 
              alt={card.name} 
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-2 text-center select-none">
              <div className="p-3 bg-black/40 border-2 border-black/40 mb-2">
                {getCardFallbackIcon(card.name)}
              </div>
              <span className="text-[10px] font-black uppercase text-white/90 tracking-wider">
                {card.name}
              </span>
            </div>
          )}
          <div className="absolute top-1 left-1 bg-black/60 text-white font-black text-[0.6rem] px-1 uppercase z-10 border border-black/40">
            {card.category.substring(0, 1)}
          </div>
          <div className="absolute bottom-1 right-1 text-black font-black text-[0.6rem] uppercase flex items-center gap-1 z-10 bg-black/60 px-1 text-white border border-black/40">
            {card.rarity} <span className="text-yellow-400 drop-shadow-md">★</span>
          </div>
        </div>

        <p className="font-black text-[0.65rem] uppercase text-center mb-1 leading-tight flex-1 flex items-center text-white">{card.name}</p>
        
        {actionButton && (
          <div className="w-full mt-auto" onClick={e => e.stopPropagation()}>
            {actionButton}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={handleCloseModal}>
          <div 
            className="bg-[#222233] border-4 border-black shadow-[16px_16px_0_rgba(0,0,0,1)] max-w-md w-full relative flex flex-col items-center p-6"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute -top-4 -right-4 bg-red-500 text-black border-4 border-black p-2 hover:scale-110 transition-transform cursor-pointer"
              onClick={handleCloseModal}
            >
              <X size={24} className="stroke-[3]" />
            </button>
            
            <div className={`w-full max-w-[280px] aspect-[2/3] ${bgColor} border-4 border-black relative mb-6 overflow-hidden shadow-[8px_8px_0_rgba(0,0,0,1)] flex items-center justify-center`}>
              {card.imageUrl && !imgError ? (
                <img 
                  src={card.imageUrl} 
                  alt={card.name} 
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="p-5 bg-black/40 border-4 border-black/50 mb-3 scale-125">
                    {getCardFallbackIcon(card.name)}
                  </div>
                  <span className="text-sm font-black uppercase text-white tracking-widest">
                    {card.name}
                  </span>
                  <span className="text-xs text-white/70 uppercase mt-1 font-mono">
                    Supabase: {card.category}cards
                  </span>
                </div>
              )}
            </div>
            
            <h2 className="text-3xl font-black uppercase text-white text-center mb-2">{card.name}</h2>
            <div className="flex gap-3 mb-4">
              <span className={`px-3 py-1 font-black uppercase text-black border-2 border-black ${bgColor}`}>{card.rarity}</span>
              <span className="px-3 py-1 font-black uppercase text-white border-2 border-gray-500 bg-gray-800">{card.category}</span>
            </div>
            
            <p className="text-gray-300 text-center font-bold uppercase tracking-wide mb-6">"{card.description}"</p>
            
            <div className="w-full flex justify-between bg-black border-4 border-black p-4">
              <span className="text-gray-400 font-black uppercase">Available (Owned):</span>
              <span className="text-yellow-400 font-black text-xl">{quantity || 0}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

