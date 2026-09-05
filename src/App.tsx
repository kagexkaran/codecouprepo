import React, { useState, useEffect, useCallback } from 'react';
import { User, Tab, Card, HistoryItem, ActiveCard, PairRequest } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Collection } from './components/Collection';
import { Shop } from './components/Shop';
import { Settings } from './components/Settings';
import { Couple } from './components/Couple';
import { AuthScreen } from './components/AuthScreen';
import { Onboarding } from './components/Onboarding';
import { INITIAL_CARDS, PROFILE_AVATARS } from './data';
import { supabase, syncUserDataToSupabase, extractUserFromAuth } from './lib/supabase';
import { usePairingSync } from './lib/usePairingSync';
import { LogOut, Cloud, CloudCheck, RefreshCw, Volume2, VolumeX, Flame, Heart, Mail } from 'lucide-react';
import { retroAudio } from './lib/audio';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const pruneHistory = (history: HistoryItem[] = []): HistoryItem[] => {
  const cutoff = Date.now() - ONE_WEEK_MS;
  return history.filter(item => item.timestamp >= cutoff);
};

const generatePairingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return `P1-${Array.from({ length: 5 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
};

const DEFAULT_USER: User = {
  id: 'guest_' + Math.random().toString(36).substring(2, 9),
  name: '',
  pairingCode: generatePairingCode(),
  partnerCode: null,
  coins: 500, // Starter coins
  collection: {},
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [isMuted, setIsMuted] = useState<boolean>(retroAudio.getMuted());

  const handleToggleSound = () => {
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      retroAudio.playPurchase();
    }
  };

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('retroCardsUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Check existing Supabase session on initial mount
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user && mounted) {
          setIsAuthenticated(true);
          const loadedUser = extractUserFromAuth(session.user, generatePairingCode());
          
          // Merge with any cached local data
          setUser(prev => {
            const merged = {
              ...prev,
              ...loadedUser,
              // retain name if already present locally and not on metadata
              name: loadedUser.name || prev.name || '',
              gender: loadedUser.gender || prev.gender,
              collection: Object.keys(loadedUser.collection || {}).length > 0 ? loadedUser.collection : prev.collection,
            };
            if (!session.user.user_metadata?.pairingCode) {
              triggerCloudSync(merged);
            }
            return merged;
          });
        } else if (mounted) {
          // Check if previously logged in as guest
          const guestActive = localStorage.getItem('retroCardsGuestActive');
          if (guestActive === 'true') {
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.warn('Error checking Supabase session:', err);
      } finally {
        if (mounted) setAuthChecking(false);
      }
    }

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user && mounted) {
        setIsAuthenticated(true);
        const loadedUser = extractUserFromAuth(session.user, generatePairingCode());
        setUser(prev => {
          const merged = {
            ...prev,
            ...loadedUser,
            name: loadedUser.name || prev.name || '',
            gender: loadedUser.gender || prev.gender,
            collection: Object.keys(loadedUser.collection || {}).length > 0 ? loadedUser.collection : prev.collection,
          };
          if (!session.user.user_metadata?.pairingCode) {
            triggerCloudSync(merged);
          }
          return merged;
        });
      } else if (event === 'SIGNED_OUT' && mounted) {
        setIsAuthenticated(false);
        localStorage.removeItem('retroCardsGuestActive');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Save to localStorage whenever user state updates
  useEffect(() => {
    localStorage.setItem('retroCardsUser', JSON.stringify(user));
  }, [user]);

  const {
    incomingRequests,
    outgoingRequest,
    sendPairRequest,
    acceptPairRequest: handleAcceptPairRequest,
    declinePairRequest: handleDeclinePairRequest,
    cancelPairRequest: handleCancelPairRequest,
    unpairPartners: handleUnpair,
    triggerCloudSync
  } = usePairingSync(user, setUser, isAuthenticated);

  const handleAuthenticated = (authUser: any) => {
    const loaded = extractUserFromAuth(authUser, generatePairingCode());
    const merged: User = {
      ...DEFAULT_USER,
      ...user,
      ...loaded,
      id: authUser.id,
      email: authUser.email,
    };
    setUser(merged);
    setIsAuthenticated(true);
    setShowAuthModal(false);
    localStorage.removeItem('retroCardsGuestActive');
    triggerCloudSync(merged);
  };

  const handleGuestContinue = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    localStorage.setItem('retroCardsGuestActive', 'true');
  };

  const handleOnboardingComplete = (updatedFields: Partial<User>) => {
    setUser(prev => {
      const updated: User = {
        ...prev,
        ...updatedFields,
      };
      triggerCloudSync(updated);
      return updated;
    });
  };

  const handleUnpairAction = async () => {
    retroAudio.playButtonClick();
    await handleUnpair();
  };

  const handlePair = (code: string) => {
    retroAudio.playPairSuccess();
    sendPairRequest(code);
  };

  const handleExchange = (cardId: string, coinValue: number) => {
    retroAudio.playPurchase();
    setUser(prev => {
      const currentQty = prev.collection[cardId] || 0;
      if (currentQty > 1) {
        const cardDef = INITIAL_CARDS.find(c => c.id === cardId);
        const historyItem: HistoryItem = {
          id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          type: 'trade',
          cardId,
          cardName: cardDef?.name || 'Card',
          cardCategory: cardDef?.category,
          cardRarity: cardDef?.rarity,
          timestamp: Date.now(),
          userName: prev.name || 'You',
          details: `Exchanged duplicate card for ${coinValue} coins`,
        };
        const updated: User = {
          ...prev,
          coins: prev.coins + coinValue,
          collection: {
            ...prev.collection,
            [cardId]: currentQty - 1,
          },
          history: pruneHistory([historyItem, ...(prev.history || [])]),
        };
        triggerCloudSync(updated);
        return updated;
      }
      return prev;
    });
  };

  const handlePurchase = (card: Card) => {
    retroAudio.playPurchase();
    setUser(prev => {
      if (prev.coins >= card.price) {
        const historyItem: HistoryItem = {
          id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          type: 'purchase',
          cardId: card.id,
          cardName: card.name,
          cardCategory: card.category,
          cardRarity: card.rarity,
          timestamp: Date.now(),
          userName: prev.name || 'You',
          details: `Purchased from Market for ${card.price} coins`,
        };
        const updated: User = {
          ...prev,
          coins: prev.coins - card.price,
          shopPurchasesToday: (prev.shopPurchasesToday || 0) + 1,
          shopPurchasedCards: [...(prev.shopPurchasedCards || []), card.id],
          collection: {
            ...prev.collection,
            [card.id]: (prev.collection[card.id] || 0) + 1,
          },
          history: pruneHistory([historyItem, ...(prev.history || [])]),
        };
        triggerCloudSync(updated);
        return updated;
      }
      return prev;
    });
  };

  const handleUseCard = (cardId: string, selectedOptions?: string[]) => {
    retroAudio.playCardInspect();
    setUser(prev => {
      const currentQty = prev.collection[cardId] || 0;
      if (currentQty > 0) {
        const cardDef = INITIAL_CARDS.find(c => c.id === cardId);
        const startedAt = Date.now();
        const expiresAt = startedAt + 24 * 60 * 60 * 1000;
        const activeCard: ActiveCard = {
          id: 'act_' + startedAt + '_' + Math.random().toString(36).substring(2, 7),
          cardId,
          startedAt,
          expiresAt,
          usedBy: prev.name || 'You',
          usedByUserId: prev.id,
          completed: false,
          selectedOptions: selectedOptions || [],
        };
        const optionDetails = selectedOptions && selectedOptions.length > 0
          ? `Choice: ${selectedOptions.join(' • ')}`
          : 'Activated couple task effect (24h timer)';
        const historyItem: HistoryItem = {
          id: 'hist_' + startedAt + '_' + Math.random().toString(36).substring(2, 7),
          type: 'use',
          cardId,
          cardName: cardDef?.name || 'Card',
          cardCategory: cardDef?.category,
          cardRarity: cardDef?.rarity,
          timestamp: startedAt,
          userName: prev.name || 'You',
          details: optionDetails,
          selectedOptions: selectedOptions || [],
        };
        const updated: User = {
          ...prev,
          collection: {
            ...prev.collection,
            [cardId]: currentQty - 1,
          },
          activeCards: [...(prev.activeCards || []), activeCard],
          history: pruneHistory([historyItem, ...(prev.history || [])]),
        };
        triggerCloudSync(updated);
        return updated;
      }
      return prev;
    });
  };

  const handleCompleteTask = (activeCardId: string) => {
    setUser(prev => {
      const activeList = prev.activeCards || [];
      const target = activeList.find(a => a.id === activeCardId || a.cardId === activeCardId);
      if (!target) return prev;

      // Verification: confirmation can only be done by the user who used the cards
      if (target.usedByUserId && target.usedByUserId !== prev.id) {
        retroAudio.playError();
        return prev;
      }

      retroAudio.playPairSuccess();
      const cardDef = INITIAL_CARDS.find(c => c.id === target.cardId);
      const completionDetails = target.selectedOptions && target.selectedOptions.length > 0
        ? `Completed: ${target.selectedOptions.join(' • ')}`
        : 'Task completed and verified by creator';

      const historyItem: HistoryItem = {
        id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        type: 'completed',
        cardId: target.cardId,
        cardName: cardDef?.name || 'Card',
        cardCategory: cardDef?.category,
        cardRarity: cardDef?.rarity,
        timestamp: Date.now(),
        userName: prev.name || 'You',
        details: completionDetails,
        selectedOptions: target.selectedOptions,
      };

      const remainingActive = activeList.filter(a => a.id !== activeCardId && a.cardId !== activeCardId);
      const updated: User = {
        ...prev,
        activeCards: remainingActive,
        history: pruneHistory([historyItem, ...(prev.history || [])]),
      };
      triggerCloudSync(updated);
      return updated;
    });
  };

  const handleUpdateActiveCardTime = (activeCardId: string, additionalMs: number) => {
    retroAudio.playButtonClick();
    setUser(prev => {
      const activeList = prev.activeCards || [];
      const updatedActive = activeList.map(a => {
        if (a.id === activeCardId || a.cardId === activeCardId) {
          const newExpiresAt = Math.max(Date.now() + 60000, a.expiresAt + additionalMs);
          return {
            ...a,
            expiresAt: newExpiresAt,
          };
        }
        return a;
      });
      const updated: User = {
        ...prev,
        activeCards: updatedActive,
      };
      triggerCloudSync(updated);
      return updated;
    });
  };

  const handleSendCard = (cardId: string) => {
    retroAudio.playButtonClick();
    alert("Card sent to partner! (Simulated)");
    setUser(prev => {
      const currentQty = prev.collection[cardId] || 0;
      if (currentQty > 0) {
        const updated: User = {
          ...prev,
          collection: {
            ...prev.collection,
            [cardId]: currentQty - 1,
          },
        };
        triggerCloudSync(updated);
        return updated;
      }
      return prev;
    });
  };

  const handleRefreshShop = () => {
    setUser(prev => {
      const availableCards: string[] = [];
      const rarities: import('./types').Rarity[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Special'];
      
      rarities.forEach(rarity => {
        const eligible = INITIAL_CARDS.filter(c => 
          c.rarity === rarity && 
          (c.category !== prev.gender || c.category === 'special')
        );
        if (eligible.length > 0) {
          const randomCard = eligible[Math.floor(Math.random() * eligible.length)];
          availableCards.push(randomCard.id);
        }
      });

      const updated: User = {
        ...prev,
        shopLastRefreshTime: Date.now(),
        shopAvailableCards: availableCards,
        shopPurchasesToday: 0,
        shopPurchasedCards: [],
      };
      triggerCloudSync(updated);
      return updated;
    });
  };

  const handleClaimDailyLogin = (cards: Card[], coins: number) => {
    setUser(prev => {
      const newCollection = { ...prev.collection };
      cards.forEach(c => {
        newCollection[c.id] = (newCollection[c.id] || 0) + 1;
      });

      const now = Date.now();
      let newStreak = 1;
      if (prev.dailyLoginLastClaim) {
        const elapsed = now - prev.dailyLoginLastClaim;
        // If claimed within 48h since previous claim, increment streak; otherwise reset to 1
        if (elapsed <= 48 * 60 * 60 * 1000) {
          newStreak = (prev.dailyStreak || 0) + 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const updated: User = {
        ...prev,
        coins: prev.coins + coins,
        collection: newCollection,
        dailyLoginCount: (prev.dailyLoginCount || 0) + 1,
        dailyLoginLastClaim: now,
        dailyStreak: newStreak,
      };
      triggerCloudSync(updated);
      return updated;
    });
  };

  const handleUpdateUsername = (newName: string) => {
    setUser(prev => {
      const updated: User = { ...prev, name: newName };
      triggerCloudSync(updated);
      return updated;
    });
  };

  const handleReset = () => {
    const resetUser: User = {
      ...DEFAULT_USER,
      name: user.name, // keep username if known
      gender: user.gender,
      pairingCode: generatePairingCode(),
    };
    setUser(resetUser);
    triggerCloudSync(resetUser);
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    localStorage.removeItem('retroCardsGuestActive');
    localStorage.removeItem('retroCardsUser');
    setIsAuthenticated(false);
    setUser(DEFAULT_USER);
  };

  const handleSelectGenderFallback = (gender: 'male' | 'female') => {
    const newCollection = { ...user.collection };
    INITIAL_CARDS.forEach(card => {
      if (card.category === gender) {
        newCollection[card.id] = (newCollection[card.id] || 0) + 1;
      }
    });

    setUser(prev => {
      const updated: User = {
        ...prev,
        gender,
        collection: newCollection,
      };
      triggerCloudSync(updated);
      return updated;
    });
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#222233] text-white flex flex-col items-center justify-center font-mono select-none">
        <div className="w-12 h-12 bg-pink-500 border-4 border-black animate-spin mb-4" />
        <p className="font-black uppercase text-sm tracking-widest text-pink-400">Connecting to Supabase...</p>
      </div>
    );
  }

  // If not logged in, show Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#222233] text-white font-mono select-none overflow-x-hidden">
        <AuthScreen 
          onAuthenticated={handleAuthenticated} 
          onGuestContinue={handleGuestContinue} 
        />
      </div>
    );
  }

  // If authenticated but user hasn't chosen username or gender, show Onboarding
  const needsOnboarding = !user.name || !user.gender;
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-[#222233] text-white font-mono select-none overflow-x-hidden">
        <header className="flex items-center justify-between p-6 bg-[#1a1a2e] border-b-4 border-black mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-pink-500 border-4 border-black flex items-center justify-center text-xl font-bold text-black shadow-[4px_4px_0_rgba(0,0,0,1)]">♥</div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Couple-Dex Onboarding</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-600 border-2 border-black text-xs font-black uppercase text-black hover:bg-red-500 transition-colors flex items-center gap-1 shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-pointer"
          >
            <LogOut size={14} />
            Exit
          </button>
        </header>

        <main className="px-4">
          <Onboarding user={user} onComplete={handleOnboardingComplete} />
        </main>
      </div>
    );
  }

  // Main App Screen
  return (
    <div className="min-h-screen bg-[#222233] text-white font-mono select-none overflow-x-hidden pb-12">
      <header className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 bg-[#1a1a2e] border-b-4 border-black mb-6 gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-500 border-4 border-black flex items-center justify-center text-xl font-bold text-black shadow-[3px_3px_0_rgba(0,0,0,1)]">♥</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Couple-Dex</h1>
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block sm:inline">
                Supabase Connected
              </span>
            </div>
          </div>

          {/* Sync Status Badge on mobile */}
          <div className="sm:hidden flex items-center gap-1 text-[10px] font-black uppercase bg-black/60 px-2 py-1 border border-black">
            <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' : syncStatus === 'syncing' ? 'bg-yellow-400 animate-spin' : 'bg-gray-400'}`} />
            <span className="text-gray-300">{syncStatus}</span>
          </div>
        </div>

        {/* User Status Bar & Logout */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Desktop Sync Badge */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-black uppercase bg-black/60 px-3 py-1.5 border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
            <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400 animate-pulse' : syncStatus === 'syncing' ? 'bg-yellow-400' : 'bg-gray-400'}`} />
            <span className="text-gray-300">Supabase: {syncStatus}</span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center bg-[#333344] border-2 border-black px-2.5 py-1 gap-2 shadow-[2px_2px_0_rgba(0,0,0,1)]">
            <div className="w-6 h-6 border border-black overflow-hidden bg-black shrink-0 flex items-center justify-center">
              {user.gender ? (
                <img 
                  src={user.gender === 'female' ? PROFILE_AVATARS.female : PROFILE_AVATARS.male} 
                  alt={user.gender} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-[10px] font-bold">?</span>
              )}
            </div>
            <span className="text-xs font-black uppercase text-white truncate max-w-[100px]">
              {user.name}
            </span>
            {user.dailyStreak && user.dailyStreak > 0 ? (
              <span className="flex items-center text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-black px-1.5 py-0.5 border border-black" title={`${user.dailyStreak} Day Streak!`}>
                <Flame size={10} className="fill-black mr-0.5" />
                {user.dailyStreak}d
              </span>
            ) : null}
          </div>

          {/* Sound Mute/Unmute Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? "Enable 8-bit Sound Effects" : "Mute Sound Effects"}
            className={`px-2.5 py-1.5 border-2 border-black text-xs font-black uppercase transition-all flex items-center gap-1 cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-px ${
              isMuted ? 'bg-gray-700 text-gray-400' : 'bg-yellow-400 text-black'
            }`}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span className="hidden md:inline">{isMuted ? 'SFX OFF' : 'SFX ON'}</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="px-3 py-1.5 bg-red-600 text-black border-2 border-black text-xs font-black uppercase hover:bg-red-500 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-px transition-all flex items-center gap-1 cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Global Incoming Request Alert Banner */}
      {incomingRequests.length > 0 && (
        <div className="mx-4 mb-4 p-3.5 bg-pink-500 text-black border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-bounce-short">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black text-pink-400 flex items-center justify-center font-black border-2 border-black shrink-0">
              💌
            </div>
            <div>
              <p className="font-black uppercase text-sm leading-tight">
                Pair Request From: <span className="underline">{incomingRequests[0].fromName}</span>
              </p>
              <p className="text-xs font-mono font-bold text-gray-900">
                {incomingRequests[0].fromEmail} • Code: {incomingRequests[0].fromCode}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleAcceptPairRequest(incomingRequests[0].id)}
              className="px-4 py-1.5 bg-green-400 text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px active:shadow-none transition-all cursor-pointer"
            >
              Accept & Link
            </button>
            <button
              onClick={() => handleDeclinePairRequest(incomingRequests[0].id)}
              className="px-3 py-1.5 bg-black text-white border-2 border-black font-black uppercase text-xs hover:bg-gray-800 transition-all cursor-pointer"
            >
              Decline
            </button>
            <button
              onClick={() => setCurrentTab('couple')}
              className="px-3 py-1.5 bg-yellow-300 text-black border-2 border-black font-black uppercase text-xs hover:bg-yellow-400 transition-all cursor-pointer"
            >
              View
            </button>
          </div>
        </div>
      )}

      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} hasPartner={!!user.partnerCode} />

      <main className="px-4">
        <div className="animate-in fade-in duration-300">
          {currentTab === 'dashboard' && (
            <Dashboard 
              user={user} 
              incomingRequests={incomingRequests}
              outgoingRequest={outgoingRequest}
              onSendPairRequest={sendPairRequest}
              onAcceptPairRequest={handleAcceptPairRequest}
              onDeclinePairRequest={handleDeclinePairRequest}
              onCancelPairRequest={handleCancelPairRequest}
              onUnpair={handleUnpairAction}
              onOpenAuth={() => setShowAuthModal(true)}
              onPair={handlePair} 
              onSelectGender={handleSelectGenderFallback} 
              onClaimDaily={handleClaimDailyLogin} 
            />
          )}
          {currentTab === 'collection' && (
            <Collection 
              user={user} 
              onExchange={handleExchange} 
              onUseCard={handleUseCard} 
              onSendCard={handleSendCard} 
            />
          )}
          {currentTab === 'shop' && (
            <Shop 
              user={user} 
              onPurchase={handlePurchase} 
              onRefreshShop={handleRefreshShop} 
            />
          )}
          {currentTab === 'settings' && (
            <Settings 
              user={user} 
              onUpdateUsername={handleUpdateUsername}
              onResetData={handleReset} 
              onUnpair={handleUnpairAction}
              onLogout={handleLogout}
            />
          )}
          {currentTab === 'couple' && (
            <Couple 
              user={user} 
              incomingRequests={incomingRequests}
              outgoingRequest={outgoingRequest}
              onSendPairRequest={sendPairRequest}
              onAcceptPairRequest={handleAcceptPairRequest}
              onDeclinePairRequest={handleDeclinePairRequest}
              onCancelPairRequest={handleCancelPairRequest}
              onUnpair={handleUnpairAction}
              onOpenAuth={() => setShowAuthModal(true)}
              onCompleteTask={handleCompleteTask}
              onUpdateActiveCardTime={handleUpdateActiveCardTime}
            />
          )}
        </div>
      </main>

      {/* Auth Modal for Guests connecting their real email */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -right-3 z-10 bg-red-600 text-black font-black w-8 h-8 border-2 border-black flex items-center justify-center cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-red-500"
            >
              ✕
            </button>
            <AuthScreen 
              onAuthenticated={handleAuthenticated} 
              onGuestContinue={() => setShowAuthModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
