import React, { useState } from 'react';
import { User, Card } from '../types';
import { INITIAL_CARDS, RARITY_COIN_VALUES } from '../data';
import { CardView } from './CardView';
import { retroAudio } from '../lib/audio';
import { Check, X, Sparkles, AlertCircle, Flame, Layers, Library } from 'lucide-react';

interface CollectionProps {
  user: User;
  onExchange: (cardId: string, coinValue: number) => void;
  onUseCard: (cardId: string, selectedOptions?: string[]) => void;
  onSendCard: (cardId: string) => void;
}

export const Collection: React.FC<CollectionProps> = ({ user, onExchange, onUseCard, onSendCard }) => {
  const [filter, setFilter] = useState<'send' | 'received'>('send');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Modal state for card options checklist before using
  const [cardToUse, setCardToUse] = useState<Card | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [optionError, setOptionError] = useState<string | null>(null);

  // Modal state for sending card
  
  const collectedCardIds = Object.keys(user.collection).filter(id => user.collection[id] > 0);
  
  // Set of card IDs that currently have an active running effect
  const now = Date.now();
  const activeCardIds = new Set(
    (user.activeCards || [])
      .filter(ac => ac.expiresAt > now && !ac.completed)
      .map(ac => ac.cardId)
  );

  const displayCards = INITIAL_CARDS.filter(card => {
    if (!collectedCardIds.includes(card.id)) return false;
    if (filter === 'send') return card.category === user.gender;
    return card.category !== user.gender; // Received
  });

  
    
  const [cardToSend, setCardToSend] = useState<Card | null>(null);
const [cardToExchange, setCardToExchange] = useState<{card: Card, coinValue: number} | null>(null);

  const handleOpenSendModal = (card: Card, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardToSend(card);
  };

  const handleOpenExchangeModal = (card: Card, e: React.MouseEvent) => {
    e.stopPropagation();
    const value = RARITY_COIN_VALUES[card.rarity] || 10;
    setCardToExchange({ card, coinValue: value });
  };

  const handleConfirmSend = () => {
    if (cardToSend) {
      retroAudio.playPurchase();
      onSendCard(cardToSend.id);
      setCardToSend(null);
    }
  };

  const handleConfirmExchange = () => {
    if (cardToExchange) {
      retroAudio.playPurchase();
      onExchange(cardToExchange.card.id, cardToExchange.coinValue);
      setCardToExchange(null);
    }
  };

  const handleOpenUseModal = (card: Card) => {
    retroAudio.playButtonClick();
    setCardToUse(card);
    setOptionError(null);
    const available = card.options || [];
    // If card has only 1 option (e.g. PEACE CARD), auto-select it for convenience
    if (available.length === 1) {
      setSelectedOptions([available[0]]);
    } else {
      setSelectedOptions([]);
    }
  };

  const handleCloseUseModal = () => {
    retroAudio.playButtonClick();
    setCardToUse(null);
    setSelectedOptions([]);
    setOptionError(null);
  };

  const handleToggleOption = (optionText: string) => {
    if (!cardToUse) return;
    retroAudio.playButtonClick();
    setOptionError(null);

    const isMythic = cardToUse.rarity === 'Mythic';
    const isAlreadySelected = selectedOptions.includes(optionText);

    if (isMythic) {
      // Mythic cards allow up to 2 options
      if (isAlreadySelected) {
        setSelectedOptions(prev => prev.filter(o => o !== optionText));
      } else {
        if (selectedOptions.length >= 2) {
          setOptionError('Mythic cards allow a maximum of 2 options. Unselect an option first to change your choice.');
          retroAudio.playError();
        } else {
          setSelectedOptions(prev => [...prev, optionText]);
        }
      }
    } else {
      // Regular cards: only 1 option allowed
      if (isAlreadySelected) {
        setSelectedOptions([]);
      } else {
        setSelectedOptions([optionText]);
      }
    }
  };

  const handleConfirmUse = () => {
    if (!cardToUse) return;
    const isMythic = cardToUse.rarity === 'Mythic';

    if (selectedOptions.length === 0) {
      retroAudio.playError();
      setOptionError(
        isMythic 
          ? 'Please choose at least 1 option (up to 2 for Mythic cards) before using this card.' 
          : 'Please select 1 option before using this card.'
      );
      return;
    }

    if (isMythic && selectedOptions.length > 2) {
      retroAudio.playError();
      setOptionError('Mythic cards allow at most 2 options.');
      return;
    }

    if (!isMythic && selectedOptions.length > 1) {
      retroAudio.playError();
      setOptionError('Please select only 1 option for this card.');
      return;
    }

    retroAudio.playPairSuccess();
    onUseCard(cardToUse.id, selectedOptions);
    setCardToUse(null);
    setSelectedOptions([]);
    setOptionError(null);
  };

  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-6 pb-20 relative">
      

      {/* HEADER PANEL */}
      <div className="pixel-panel p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-purple-400 to-pink-500">
        <h2 className="text-3xl font-black uppercase text-white" style={{textShadow: "2px 2px 0 #000"}}>COLLECTION</h2>
        
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="flex items-center pixel-border-sm bg-white rounded p-1.5 gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_rgba(0,0,0,1)] text-white font-black">
              <Library size={16} />
            </div>
            <span className="font-vt323 text-xl font-bold text-black px-2">{collectedCardIds.length} / {INITIAL_CARDS.length} CARDS</span>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="pixel-panel p-3 bg-white flex overflow-x-auto">
        <div className="flex space-x-2">
          {['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Special'].map(r => (
            <button
              key={r}
              onClick={() => {
                retroAudio.playTabSwitch();
                setFilter(r as any);
              }}
              className={`px-4 py-2 border-2 border-black font-black uppercase text-xs cursor-pointer rounded ${
                filter === r 
                  ? 'bg-black text-white shadow-none translate-y-[2px]' 
                  : 'bg-gray-100 text-black shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-gray-200 hover:translate-y-[1px] hover:shadow-[1px_1px_0_rgba(0,0,0,1)]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* CARDS GRID */}
      {displayCards.length === 0 ? (
        <div className="pixel-panel p-10 bg-white text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full border-4 border-black mx-auto mb-4 flex items-center justify-center text-gray-400">
            <Library size={24} />
          </div>
          <p className="text-xl font-black uppercase text-gray-400">NO CARDS FOUND</p>
          <p className="text-sm font-vt323 font-bold text-gray-500 mt-2">Try changing your filter or buy some cards in the shop!</p>
        </div>
      ) : (
        <div className="pixel-panel p-6 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
            {displayCards.map(card => {
              const qty = user.collection?.[card.id] || 0;
              const isSelected = selectedCardId === card.id;
              const isActive = (user.activeCards || []).some(ac => ac.cardId === card.id);
              
              return (
                <CardView 
                  key={`collection-${card.id}`} 
                  card={card} 
                  quantity={qty}
                  isSelected={isSelected}
                  isActive={isActive}
                  onSelect={() => setSelectedCardId(card.id)}
                  actionButton={
                    isSelected ? (
                      <div className="flex flex-col gap-1 w-full mt-1">
                        {isActive ? (
                           <div className="w-full py-1 text-[10px] font-black uppercase border-2 border-pink-500 bg-pink-100 text-pink-600 flex items-center justify-center">
                             ACTIVE
                           </div>
                        ) : (
                          <button 
                            onClick={(e) => handleOpenUseModal(card)}
                            className="w-full py-1 text-[10px] font-black uppercase border-2 border-black bg-pink-500 text-white shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all"
                          >
                            USE CARD
                          </button>
                        )}
                        
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => handleOpenSendModal(card, e)}
                            disabled={!user.partnerCode || qty < 1}
                            className="flex-1 py-1 text-[9px] font-black uppercase border-2 border-black bg-cyan-400 text-black shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all disabled:opacity-50"
                          >
                            GIFT
                          </button>
                          <button 
                            onClick={(e) => handleOpenExchangeModal(card, e)}
                            disabled={qty < 1}
                            className="flex-1 py-1 text-[9px] font-black uppercase border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all disabled:opacity-50"
                          >
                            SELL
                          </button>
                        </div>
                      </div>
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* USE CARD MODAL */}
      {cardToUse && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="pixel-panel p-6 bg-white w-full max-w-md border-4 border-black">
            <h3 className="text-2xl font-black uppercase text-black mb-4">Use {cardToUse.name}</h3>
            {cardToUse.options && cardToUse.options.length > 0 ? (
              <div className="space-y-4 mb-6">
                <p className="text-sm font-black uppercase text-gray-500">Select options (Required)</p>
                <div className="space-y-2">
                  {cardToUse.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-3 p-3 border-4 border-black bg-gray-100 hover:bg-gray-200 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={selectedOptions.includes(opt)}
                        onChange={() => {
                          if (selectedOptions.includes(opt)) {
                            setSelectedOptions(selectedOptions.filter(o => o !== opt));
                          } else {
                            setSelectedOptions([...selectedOptions, opt]);
                          }
                          setOptionError(null);
                        }}
                        className="w-5 h-5 accent-pink-500"
                      />
                      <span className="font-vt323 text-lg font-bold">{opt}</span>
                    </label>
                  ))}
                </div>
                {optionError && <p className="text-red-500 font-black uppercase text-xs flex items-center gap-1"><AlertCircle size={12} /> {optionError}</p>}
              </div>
            ) : (
              <p className="text-gray-500 font-black uppercase mb-6">Are you sure you want to use this card? This cannot be undone.</p>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={handleConfirmUse}
                className="flex-1 bg-green-500 text-white font-black uppercase border-4 border-black py-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none"
              >
                CONFIRM
              </button>
              <button 
                onClick={() => { setCardToUse(null); setSelectedOptions([]); setOptionError(null); }}
                className="flex-1 bg-black text-white font-black uppercase border-4 border-black py-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND CARD MODAL */}
      {cardToSend && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="pixel-panel p-6 bg-white w-full max-w-md border-4 border-black text-center">
            <h3 className="text-2xl font-black uppercase text-black mb-4">Send Gift</h3>
            <p className="text-gray-500 font-black uppercase mb-6">Gift {cardToSend.name} to {user.partnerName || user.partnerCode}?</p>
            
            <div className="flex gap-3">
              <button 
                onClick={handleConfirmSend}
                className="flex-1 bg-pink-500 text-white font-black uppercase border-4 border-black py-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none"
              >
                SEND
              </button>
              <button 
                onClick={() => setCardToSend(null)}
                className="flex-1 bg-black text-white font-black uppercase border-4 border-black py-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXCHANGE MODAL */}
      {cardToExchange && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="pixel-panel p-6 bg-white w-full max-w-md border-4 border-black text-center">
            <h3 className="text-2xl font-black uppercase text-black mb-4">Sell Card</h3>
            <p className="text-gray-500 font-black uppercase mb-2">Sell {cardToExchange.card.name} for coins?</p>
            <p className="text-yellow-500 font-black text-2xl mb-6">+{cardToExchange.coinValue} COINS</p>
            
            <div className="flex gap-3">
              <button 
                onClick={handleConfirmExchange}
                className="flex-1 bg-yellow-400 text-black font-black uppercase border-4 border-black py-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none"
              >
                SELL
              </button>
              <button 
                onClick={() => setCardToExchange(null)}
                className="flex-1 bg-black text-white font-black uppercase border-4 border-black py-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};