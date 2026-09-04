import React, { useEffect, useState } from 'react';
import { User, Card, Rarity } from '../types';
import { INITIAL_CARDS } from '../data';
import { CardView } from './CardView';
import { Clock, Coins } from 'lucide-react';

interface ShopProps {
  user: User;
  onPurchase: (card: Card) => void;
  onRefreshShop: () => void;
}

export const Shop: React.FC<ShopProps> = ({ user, onPurchase, onRefreshShop }) => {
  const [notification, setNotification] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const lastRefresh = user.shopLastRefreshTime || 0;
      const msSinceRefresh = now - lastRefresh;
      const msPerDay = 24 * 60 * 60 * 1000;
      
      if (msSinceRefresh >= msPerDay || !user.shopAvailableCards) {
        onRefreshShop();
        setTimeLeft('00:00:00');
      } else {
        const msLeft = msPerDay - msSinceRefresh;
        const h = Math.floor(msLeft / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((msLeft % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setTimeLeft(`${h}:${m}:${s}`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user.shopLastRefreshTime, user.shopAvailableCards, onRefreshShop]);

  const displayCards = INITIAL_CARDS.filter(card => 
    user.shopAvailableCards?.includes(card.id)
  );

  const canPurchase = (user.shopPurchasesToday || 0) < 1;

  const handlePurchase = (card: Card) => {
    if (!canPurchase) {
      setNotification("Daily purchase limit reached!");
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    if (user.coins >= card.price) {
      onPurchase(card);
      setNotification(`Purchased ${card.name}!`);
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification(`Not enough coins for ${card.name}!`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="flex flex-col max-w-6xl mx-auto relative">
      
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-3 border-4 border-black font-black uppercase text-sm z-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {notification}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-4xl font-black uppercase">Daily Market</h2>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-black p-2 border-2 border-white/20">
            <span className="text-yellow-400 text-xl mr-2">●</span>
            <span className="text-xl font-bold">{user.coins.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#333344] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm font-bold uppercase text-white">{timeLeft}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
        {displayCards.map(card => {
          const canAfford = user.coins >= card.price;
          const isPurchased = user.shopPurchasedCards?.includes(card.id);
          
          return (
            <CardView 
              key={`shop-${card.id}`} 
              card={card} 
              actionButton={
                isPurchased ? (
                  <div className="w-full py-1 text-[10px] font-black uppercase border-2 border-black flex items-center justify-center bg-gray-700 text-gray-400">
                    PURCHASED
                  </div>
                ) : (
                  <button 
                    onClick={() => handlePurchase(card)}
                    disabled={!canPurchase || !canAfford}
                    className={`w-full py-1 text-[10px] font-black uppercase border-2 border-black flex items-center justify-center gap-1 transition-all ${
                      !canPurchase || !canAfford
                        ? 'bg-[#333344] text-gray-500 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-yellow-400 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-px'
                    }`}
                  >
                    BUY: {card.price}C
                  </button>
                )
              }
            />
          );
        })}
      </div>
      
    </div>
  );
};
