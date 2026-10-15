import React, { useState, useEffect } from 'react';
import { Card } from '../types';
import { RARITY_COLORS } from '../data';
import { 
  X, Gamepad2, Moon, Feather, Flame, Gift, Crown, Banknote, 
  ChevronLeft, ChevronRight, Sparkles, BookOpen, Layers 
} from 'lucide-react';
import { retroAudio } from '../lib/audio';

interface CardViewProps {
  card: Card;
  quantity?: number;
  onClick?: () => void;
  actionButton?: React.ReactNode;
  isActive?: boolean;
  isSelected?: boolean;
  hoverLift?: boolean;
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

export const CardView: React.FC<CardViewProps> = ({ 
  card, 
  quantity, 
  onClick, 
  actionButton,
  isActive = false,
  isSelected = false,
  hoverLift = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const bgColor = RARITY_COLORS[card.rarity] || 'bg-gray-500';

  const hasOptions = Boolean(card.options && card.options.length > 0);
  const totalSlides = hasOptions ? 3 : 2;

  useEffect(() => {
    setImgError(false);
  }, [card.imageUrl]);

  const handleCardClick = () => {
    retroAudio.playCardInspect();
    setCurrentSlide(0);
    if (onClick) onClick();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    retroAudio.playButtonClick();
    setShowModal(false);
  };

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    retroAudio.playButtonClick();
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    retroAudio.playButtonClick();
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for carousel slides
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      } else if (e.key === 'Escape') {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, totalSlides]);

  const glowClass = isActive ? 'card-glow-active' : isSelected ? 'card-glow-selected' : '';
  const liftClass = hoverLift ? 'card-hover-lift' : 'hover:translate-y-1 hover:shadow-none';

  return (
    <>
      <div 
        className={`relative bg-white rounded-lg border-4 border-black p-2 flex flex-col items-center group w-full max-w-[192px] h-[320px] text-center cursor-pointer shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${liftClass} ${glowClass}`}
        onClick={handleCardClick}
      >
        {/* Active Effect Floating Badge */}
        {isActive && (
          <div className="absolute -top-3.5 -left-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-black font-black text-[9px] px-2 py-0.5 border-2 border-black z-30 shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
            ACTIVE
          </div>
        )}

        {/* Selected Floating Badge */}
        {isSelected && !isActive && (
          <div className="absolute -top-3.5 -left-2.5 bg-yellow-400 text-black font-black text-[9px] px-2 py-0.5 border-2 border-black z-30 shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-1">
            SELECTED
          </div>
        )}

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm" onClick={handleCloseModal}>
          <div 
            className="bg-white border-4 border-black rounded-xl shadow-[16px_16px_0_rgba(0,0,0,1)] max-w-md w-full h-[520px] max-h-[92vh] flex flex-col justify-between relative p-4 sm:p-5 overflow-hidden select-none"
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Slide Navigator Indicator & Close Button */}
            <div className="flex items-center justify-between w-full pr-8 mb-2 pb-2 border-b-2 border-black/40 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-pink-400 bg-pink-950/80 px-2 py-0.5 border border-pink-600">
                  PAGE {currentSlide + 1} / {totalSlides}
                </span>
                <span className="text-[10px] font-black uppercase text-gray-300 tracking-wider">
                  {currentSlide === 0 && 'CARD SHOWCASE'}
                  {currentSlide === 1 && 'LORE & STATS'}
                  {currentSlide === 2 && 'EFFECT OPTIONS'}
                </span>
              </div>
            </div>

            <button 
              className="absolute top-3 right-3 bg-red-500 text-black border-2 border-black p-1.5 hover:scale-110 transition-transform cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] z-30"
              onClick={handleCloseModal}
              title="Close info modal"
            >
              <X size={18} className="stroke-[3]" />
            </button>
            
            {/* Carousel Content Slides */}
            <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-1 py-1 w-full">
              {/* SLIDE 0: FULL UNCLIPPED CARD ARTWORK & IDENTITY */}
              {currentSlide === 0 && (
                <div className="flex flex-col items-center justify-center w-full h-full carousel-slide-in">
                  <div className={`h-[280px] sm:h-[305px] aspect-[2/3] ${bgColor} border-4 border-black relative overflow-hidden shadow-[8px_8px_0_rgba(0,0,0,1)] flex items-center justify-center shrink-0`}>
                    <div className="absolute inset-0 border-8 border-white/20 pointer-events-none z-10"></div>
                    {card.imageUrl && !imgError ? (
                      <img 
                        src={card.imageUrl} 
                        alt={card.name} 
                        referrerPolicy="no-referrer"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <div className="p-4 bg-black/40 border-2 border-black/50 mb-3 scale-110">
                          {getCardFallbackIcon(card.name)}
                        </div>
                        <span className="text-sm font-black uppercase text-white tracking-widest">
                          {card.name}
                        </span>
                        <span className="text-[10px] text-white/70 uppercase mt-1 font-mono">
                          Supabase: {card.category}cards
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/80 text-white font-black text-[10px] px-2 py-0.5 uppercase z-20 border border-black/60 shadow">
                      {card.category}
                    </div>
                    <div className="absolute bottom-2 right-2 text-black font-black text-[10px] uppercase flex items-center gap-1 z-20 bg-black/80 px-2 py-0.5 text-white border border-black/60 shadow">
                      {card.rarity} <span className="text-yellow-400">★</span>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black uppercase text-white text-center mt-2.5 tracking-wide leading-tight">
                    {card.name}
                  </h2>
                  <div className="flex gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase text-black border-2 border-black ${bgColor}`}>{card.rarity}</span>
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase text-white border-2 border-gray-600 bg-gray-900">{card.category} DECK</span>
                  </div>
                </div>
              )}

              {/* SLIDE 1: DETAILED LORE, EFFECT DESCRIPTION & INVENTORY */}
              {currentSlide === 1 && (
                <div className="flex flex-col items-center justify-center w-full h-full text-center px-1 carousel-slide-in space-y-3">
                  <div className="w-full">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase text-white leading-tight mb-1">
                      {card.name}
                    </h2>
                    <div className="flex justify-center gap-2">
                      <span className={`px-2.5 py-0.5 text-xs font-black uppercase text-black border-2 border-black ${bgColor}`}>{card.rarity}</span>
                      <span className="px-2.5 py-0.5 text-xs font-black uppercase text-white border-2 border-gray-500 bg-gray-800">{card.category}</span>
                    </div>
                  </div>

                  <div className="w-full bg-black/70 border-2 border-black p-3.5 text-left shadow-[2px_2px_0_rgba(0,0,0,1)]">
                    <span className="text-[10px] font-black uppercase text-pink-400 block mb-1.5 flex items-center gap-1">
                      <BookOpen size={12} />
                      CARD EFFECT & LORE
                    </span>
                    <p className="text-gray-200 font-bold uppercase tracking-wide text-xs sm:text-sm leading-relaxed">
                      "{card.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 w-full">
                    <div className="bg-black/80 border-2 border-black p-2.5 flex flex-col items-center shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      <span className="text-[10px] font-black uppercase text-gray-400">COPIES IN DECK</span>
                      <span className="text-yellow-400 font-black text-xl sm:text-2xl mt-0.5">x{quantity || 0}</span>
                    </div>
                    <div className="bg-black/80 border-2 border-black p-2.5 flex flex-col items-center shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      <span className="text-[10px] font-black uppercase text-gray-400">TASK TIMEFRAME</span>
                      <span className="text-emerald-400 font-black text-sm sm:text-base mt-1">24 HOURS</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 uppercase font-mono leading-tight">
                    Tip: Tap USE on this card in your collection to activate its partner challenge!
                  </div>
                </div>
              )}

              {/* SLIDE 2: AVAILABLE EFFECT OPTIONS CHECKLIST */}
              {currentSlide === 2 && hasOptions && (
                <div className="flex flex-col w-full h-full carousel-slide-in justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-pink-400 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-pink-400" />
                        Activation Checklist:
                      </span>
                      <span className="text-[10px] font-black uppercase bg-black text-amber-300 border border-amber-500/60 px-2 py-0.5">
                        {card.rarity.toLowerCase() === 'mythic' ? 'Select up to 2' : 'Select 1 option'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 uppercase font-bold mb-2.5 leading-snug">
                      When using this card, pick an objective below to challenge your partner:
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[220px]">
                    {card.options?.map((opt, i) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-2.5 bg-black/80 border-2 border-black p-2.5 shadow-[2px_2px_0_rgba(0,0,0,1)]"
                      >
                        <div className="w-5 h-5 bg-pink-500 text-black font-black text-xs flex items-center justify-center shrink-0 border border-black mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-xs font-bold text-gray-100 uppercase leading-snug">
                          {opt}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/90 border-2 border-black p-2 mt-2 text-center text-[10px] text-emerald-400 font-mono uppercase">
                    Partner verifies completion in the Couple Sync Channel
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Carousel Controls: Arrows and Pagination Dots */}
            <div className="w-full pt-2.5 border-t-2 border-black/40 flex items-center justify-between gap-3 shrink-0">
              {/* Left Arrow Button */}
              <button
                onClick={handlePrevSlide}
                className="flex items-center justify-center w-10 h-10 bg-black hover:bg-gray-800 text-white border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="Previous page (Left Arrow)"
              >
                <ChevronLeft size={22} className="stroke-[3]" />
              </button>

              {/* Pagination Dots & Hint */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        retroAudio.playButtonClick();
                        setCurrentSlide(index);
                      }}
                      className={`transition-all border border-black cursor-pointer ${
                        currentSlide === index
                          ? 'w-7 h-3 bg-pink-500 shadow-[2px_2px_0_rgba(0,0,0,1)]'
                          : 'w-3 h-3 bg-gray-600 hover:bg-gray-400'
                      }`}
                      title={`Go to page ${index + 1}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  TAP ARROWS TO BROWSE
                </span>
              </div>

              {/* Right Arrow Button */}
              <button
                onClick={handleNextSlide}
                className="flex items-center justify-center w-10 h-10 bg-black hover:bg-gray-800 text-white border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="Next page (Right Arrow)"
              >
                <ChevronRight size={22} className="stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


