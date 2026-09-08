import React, { useState } from 'react';
import { User, Card } from '../types';
import { INITIAL_CARDS, RARITY_COIN_VALUES } from '../data';
import { CardView } from './CardView';
import { retroAudio } from '../lib/audio';
import { Check, X, Sparkles, AlertCircle, Flame, Layers } from 'lucide-react';

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
  const [cardToSend, setCardToSend] = useState<Card | null>(null);

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

  const handleConfirmUseCard = () => {
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
    <div className="flex flex-col h-full max-w-6xl mx-auto pb-12">
      {/* Top Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white flex items-center gap-2">
            <span>Your Card Deck</span>
            {activeCardIds.size > 0 && (
              <span className="text-xs bg-pink-500 text-black px-2 py-0.5 font-black border-2 border-black animate-pulse">
                {activeCardIds.size} ACTIVE
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase mt-1">
            Hover to inspect. Active cards emit a pulse glow. Tap "Use" to choose task options!
          </p>
        </div>
        
        <div className="flex space-x-2 sm:space-x-4 text-sm">
          {(['send', 'received'] as const).map(f => (
            <button
              key={f}
              onClick={() => { retroAudio.playButtonClick(); setFilter(f); }}
              className={`px-3 py-1.5 border-2 border-black font-black uppercase transition-all cursor-pointer ${
                filter === f 
                  ? 'bg-pink-500 text-black shadow-[4px_4px_0_rgba(0,0,0,1)] -translate-y-0.5' 
                  : 'bg-[#333344] text-white hover:bg-[#444455]'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {displayCards.length === 0 ? (
        <div className="bg-[#333344] border-4 border-dashed border-gray-600 p-12 text-center">
          <Layers className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-2xl font-black text-gray-400 uppercase">Empty Sector</p>
          <p className="mt-2 text-xs opacity-80 uppercase font-bold text-gray-500">Visit the shop to acquire assets</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
          {displayCards.map(card => {
            const quantity = user.collection[card.id];
            const exchangeValue = RARITY_COIN_VALUES[card.rarity];
            const isSameGender = user.gender === card.category;
            const isActive = activeCardIds.has(card.id);
            const isSelected = selectedCardId === card.id;
            
            return (
              <CardView 
                key={card.id} 
                card={card} 
                quantity={quantity}
                isActive={isActive}
                isSelected={isSelected}
                hoverLift={true}
                onClick={() => {
                  setSelectedCardId(card.id);
                }}
                actionButton={
                  <div className="flex flex-col w-full gap-1.5 mt-2">
                    <button 
                      onClick={() => {
                        if (!isSameGender && user.partnerCode) {
                          handleOpenUseModal(card);
                        } else {
                          retroAudio.playError();
                        }
                      }}
                      disabled={isSameGender || !user.partnerCode}
                      className={`w-full text-[10px] py-1.5 font-black uppercase border-2 border-black transition-all ${
                        isSameGender || !user.partnerCode 
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                          : 'bg-green-500 text-black hover:bg-green-400 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none cursor-pointer'
                      }`}
                    >
                      {user.partnerCode ? (isSameGender ? 'Cannot Use Own' : 'Use') : 'Needs Partner'}
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (user.partnerCode) {
                          retroAudio.playButtonClick();
                          setCardToSend(card);
                        } else {
                          retroAudio.playError();
                        }
                      }}
                      disabled={!user.partnerCode}
                      className={`w-full text-[10px] py-1.5 font-black uppercase border-2 border-black transition-all ${
                        !user.partnerCode 
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-500 text-white hover:bg-blue-400 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none cursor-pointer'
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
                        className={`w-full text-[10px] py-1.5 font-black uppercase border-2 border-black transition-all ${
                          isSameGender 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none cursor-pointer'
                        }`}
                      >
                        {isSameGender ? 'No Exchange' : `Exchange: ${exchangeValue}C`}
                      </button>
                    ) : (
                      <div className="w-full text-center text-[9px] text-gray-400 py-1 border-2 border-dashed border-gray-600 font-black uppercase">
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

      {/* Options Selection Modal for Using a Card */}
      {cardToUse && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
          onClick={handleCloseUseModal}
        >
          <div 
            className="bg-[#2a2a3c] border-4 border-black shadow-[16px_16px_0_rgba(0,0,0,1)] max-w-lg w-full relative p-6 max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-400 text-black border-4 border-black p-1.5 hover:scale-110 transition-transform cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)]"
              onClick={handleCloseUseModal}
              title="Cancel"
            >
              <X size={20} className="stroke-[3]" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 pb-4 border-b-2 border-white/10">
              <div className="w-16 h-20 bg-gray-900 border-2 border-black shrink-0 overflow-hidden shadow-[2px_2px_0_rgba(0,0,0,1)]">
                {cardToUse.imageUrl ? (
                  <img 
                    src={cardToUse.imageUrl} 
                    alt={cardToUse.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-black">
                    CARD
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white truncate">
                    {cardToUse.name}
                  </h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                    cardToUse.rarity === 'Mythic' ? 'bg-red-500 text-black' : 'bg-yellow-400 text-black'
                  }`}>
                    {cardToUse.rarity}
                  </span>
                </div>

                {cardToUse.rarity === 'Mythic' ? (
                  <div className="bg-red-950/90 border-2 border-red-500 px-2.5 py-1 text-red-200 text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)] mt-1">
                    <Sparkles size={14} className="text-red-400 shrink-0" />
                    <span>Mythic Card Perk: Select up to 2 options!</span>
                  </div>
                ) : (
                  <p className="text-xs text-yellow-300 font-bold uppercase mt-1">
                    Choose 1 option before using this card:
                  </p>
                )}
              </div>
            </div>

            {/* Options Checklist Body */}
            <div className="my-4 overflow-y-auto pr-1 flex-1 space-y-3">
              {(!cardToUse.options || cardToUse.options.length === 0) ? (
                <div className="p-4 bg-black/60 border-2 border-black text-center text-gray-400 text-xs font-bold uppercase">
                  Standard 24-hour partner effect will be activated.
                </div>
              ) : (
                cardToUse.options.map((option, idx) => {
                  const isSelected = selectedOptions.includes(option);
                  const isMythic = cardToUse.rarity === 'Mythic';

                  return (
                    <div 
                      key={idx}
                      onClick={() => handleToggleOption(option)}
                      className={`p-3.5 border-3 transition-all cursor-pointer flex items-start gap-3 shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-px ${
                        isSelected 
                          ? 'bg-gradient-to-r from-yellow-950/80 to-amber-950/70 border-yellow-400 text-white' 
                          : 'bg-black/70 border-black hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      {/* Retro Checkbox Box */}
                      <div className={`w-6 h-6 border-2 border-black shrink-0 flex items-center justify-center transition-all ${
                        isSelected 
                          ? (isMythic ? 'bg-red-500 text-black' : 'bg-yellow-400 text-black') 
                          : 'bg-gray-800 text-transparent'
                      }`}>
                        <Check size={16} className={`stroke-[3.5] ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      </div>

                      <div className="flex-1 text-xs sm:text-sm font-bold uppercase leading-snug select-none">
                        <span className={isSelected ? 'text-yellow-200 font-black' : 'text-gray-200'}>
                          {option}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Error Notice */}
              {optionError && (
                <div className="p-2.5 bg-red-950/90 border-2 border-red-500 text-red-200 text-xs font-black uppercase flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{optionError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t-2 border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-black uppercase text-gray-300">
                Selected: <span className="text-yellow-400 font-mono text-sm">{selectedOptions.length}</span>
                <span className="text-gray-500"> / {cardToUse.rarity === 'Mythic' ? '2 Max' : '1'}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleCloseUseModal}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white border-2 border-black font-black uppercase text-xs cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmUseCard}
                  disabled={selectedOptions.length === 0}
                  className={`px-5 py-2 border-2 border-black font-black uppercase text-xs flex items-center gap-1.5 shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all ${
                    selectedOptions.length === 0
                      ? 'bg-gray-600 text-gray-400 border-gray-700 cursor-not-allowed shadow-none'
                      : 'bg-green-500 hover:bg-green-400 text-black cursor-pointer hover:translate-y-px hover:shadow-none'
                  }`}
                >
                  <Sparkles size={15} />
                  <span>Confirm & Activate</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* Modal for Sending a Card */}
      {cardToSend && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
          onClick={() => { setCardToSend(null); retroAudio.playButtonClick(); }}
        >
          <div
            className="bg-[#2a2a3c] border-4 border-black shadow-[16px_16px_0_rgba(0,0,0,1)] max-w-sm w-full relative p-6 flex flex-col items-center text-center"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black uppercase text-white mb-4">Send Gift</h3>
            <div className="w-32 h-40 bg-gray-900 border-2 border-black overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4">
              {cardToSend.imageUrl ? (
                <img src={cardToSend.imageUrl} alt={cardToSend.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-black">CARD</div>
              )}
            </div>
            <p className="text-sm text-gray-300 font-bold uppercase mb-4 leading-relaxed">
              Gift <span className="text-pink-400 font-black">{cardToSend.name}</span> to <span className="text-white font-black">{user.partnerName || 'Your Partner'}</span>?
            </p>
            <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 px-3 py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 mb-6 w-full shadow-[2px_2px_0_rgba(0,0,0,1)]">
              <Sparkles size={16} className="text-yellow-400" />
              Reward: +10 Coins for gifting
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setCardToSend(null); retroAudio.playButtonClick(); }}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white border-2 border-black font-black uppercase text-xs cursor-pointer shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSendCard(cardToSend.id);
                  setCardToSend(null);
                }}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-400 text-white border-2 border-black font-black uppercase text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all"
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

