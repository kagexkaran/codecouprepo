import React, { useEffect, useState } from 'react';
import { User, HistoryItem, HistoryEventType, ActiveCard, PairRequest } from '../types';
import { INITIAL_CARDS, PROFILE_AVATARS } from '../data';
import { PairingSection } from './PairingSection';
import { 
  Heart, 
  Clock, 
  CheckCircle2, 
  History, 
  ShoppingCart, 
  ArrowLeftRight, 
  Sparkles, 
  User as UserIcon, 
  Plus, 
  Minus, 
  Lock, 
  Filter, 
  Flame,
  Calendar,
  Layers,
  Mail
} from 'lucide-react';
import { retroAudio } from '../lib/audio';

interface CoupleProps {
  user: User;
  incomingRequests?: PairRequest[];
  outgoingRequest?: PairRequest | null;
  onSendPairRequest?: (code: string) => Promise<{ success: boolean; message: string }>;
  onAcceptPairRequest?: (requestId: string) => Promise<void>;
  onDeclinePairRequest?: (requestId: string) => Promise<void>;
  onCancelPairRequest?: (requestId: string) => Promise<void>;
  onUnpair?: () => Promise<void>;
  onOpenAuth?: () => void;
  onCompleteTask?: (activeCardId: string) => void;
  onUpdateActiveCardTime?: (activeCardId: string, additionalMs: number) => void;
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const Couple: React.FC<CoupleProps> = ({ 
  user, 
  incomingRequests = [],
  outgoingRequest = null,
  onSendPairRequest,
  onAcceptPairRequest,
  onDeclinePairRequest,
  onCancelPairRequest,
  onUnpair,
  onOpenAuth,
  onCompleteTask, 
  onUpdateActiveCardTime 
}) => {
  const [daysConnected, setDaysConnected] = useState(0);
  const [historyFilter, setHistoryFilter] = useState<'all' | HistoryEventType>('all');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showTimeAdjuster, setShowTimeAdjuster] = useState<string | null>(null);

  // Live timer tick every second for real-time countdown updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user.connectedAt) {
      const msDiff = Date.now() - user.connectedAt;
      setDaysConnected(Math.floor(msDiff / (1000 * 60 * 60 * 24)));
    }
  }, [user.connectedAt]);

  const activeCards = (user.activeCards || []).filter(ac => ac.expiresAt > currentTime && !ac.completed);

  // Card history saved up to 1 week
  const cutoffTime = currentTime - ONE_WEEK_MS;
  const recentHistory = (user.history || []).filter(item => item.timestamp >= cutoffTime);

  const filteredHistory = recentHistory.filter(item => {
    if (historyFilter === 'all') return true;
    return item.type === historyFilter;
  });

  const formatCountdown = (expiresAt: number) => {
    const remaining = expiresAt - currentTime;
    if (remaining <= 0) return '00:00:00';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const now = new Date(currentTime);
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today at ${timeStr}`;
    const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStr}, ${timeStr}`;
  };

  const getEventBadge = (type: HistoryEventType) => {
    switch (type) {
      case 'use':
        return {
          label: 'CARD USED',
          icon: <Sparkles size={12} className="text-purple-400" />,
          bg: 'bg-purple-950/80 text-purple-300 border-purple-600',
        };
      case 'purchase':
        return {
          label: 'PURCHASED',
          icon: <ShoppingCart size={12} className="text-yellow-400" />,
          bg: 'bg-yellow-950/80 text-yellow-300 border-yellow-500',
        };
      case 'trade':
        return {
          label: 'EXCHANGED',
          icon: <ArrowLeftRight size={12} className="text-cyan-400" />,
          bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500',
        };
      case 'completed':
        return {
          label: 'TASK COMPLETED',
          icon: <CheckCircle2 size={12} className="text-emerald-400" />,
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500',
        };
      default:
        return {
          label: 'EVENT',
          icon: <History size={12} />,
          bg: 'bg-gray-800 text-gray-300 border-gray-600',
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Top Section: Link Status and Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Connection Link Card */}
        <div className="md:col-span-2 p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-pink-400">Couple Sync Link</h2>
            </div>
            {user.dailyStreak && user.dailyStreak > 0 ? (
              <div className="flex items-center gap-1 bg-black px-2.5 py-1 border-2 border-black text-amber-400 text-xs font-black uppercase">
                <Flame size={14} className="fill-amber-400" />
                <span>{user.dailyStreak}d Streak</span>
              </div>
            ) : null}
          </div>
          
          <div className="space-y-4">
            <div className="bg-black border-4 border-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <span className="text-gray-400 uppercase font-black text-xs block mb-2">Partner Sync Channel</span>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Current User */}
                  <div className="flex items-center gap-2 bg-[#222233] px-3 py-1.5 border-2 border-pink-500 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                    <span className="text-white font-black uppercase text-sm sm:text-base">
                      {user.name || 'You'}
                    </span>
                    <div className="flex items-center gap-1 bg-black px-2 py-0.5 border border-amber-400 text-amber-400 text-xs font-black">
                      <Flame size={13} className="fill-amber-400 text-amber-400" />
                      <span>{user.dailyStreak || 0}d Streak</span>
                    </div>
                  </div>

                  <span className="text-pink-500 font-black text-xl select-none animate-pulse">↔</span>

                  {/* Partner User */}
                  <div className={`flex items-center gap-2 bg-[#222233] px-3 py-1.5 border-2 shadow-[2px_2px_0_rgba(0,0,0,1)] ${
                    user.partnerCode ? 'border-blue-400' : 'border-dashed border-gray-600'
                  }`}>
                    <div className="flex flex-col">
                      <span className="text-white font-black uppercase text-sm sm:text-base">
                        {user.partnerName || (user.partnerCode ? 'Partner' : 'Pending Partner')}
                      </span>
                      {user.partnerEmail && (
                        <span className="text-[10px] font-mono text-gray-400 truncate max-w-[150px]">
                          {user.partnerEmail}
                        </span>
                      )}
                    </div>
                    {user.partnerCode ? (
                      <div className="flex items-center gap-1 bg-black px-2 py-0.5 border border-amber-400 text-amber-400 text-xs font-black">
                        <Flame size={13} className="fill-amber-400 text-amber-400" />
                        <span>{user.partnerStreak !== undefined ? user.partnerStreak : 0}d Streak</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase bg-black px-1.5 py-0.5">
                        Awaiting Link
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtext info for pairing code */}
                <div className="mt-2 text-[11px] font-mono text-gray-400 uppercase flex items-center gap-2 flex-wrap">
                  <span>Pairing ID: <strong className="text-gray-200">{user.pairingCode}</strong></span>
                  {user.partnerCode && (
                    <span>• Partner ID: <strong className="text-green-400">{user.partnerCode}</strong></span>
                  )}
                  {user.partnerGender && (
                    <span>• Partner Deck: <strong className="text-blue-400 uppercase">{user.partnerGender}</strong></span>
                  )}
                </div>
              </div>

              <div className="text-right flex flex-col items-start sm:items-end shrink-0">
                <span className="text-gray-400 uppercase font-black text-xs">Connection Health</span>
                <span className={`text-xs font-black uppercase px-2 py-0.5 border mt-1 ${
                  user.partnerCode 
                    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-600' 
                    : 'text-yellow-400 bg-yellow-950/80 border-yellow-600'
                }`}>
                  ● {user.partnerCode ? 'SYNC ACTIVE' : 'AWAITING PAIR'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black border-4 border-black p-3 flex flex-col items-center justify-center">
                <span className="text-gray-400 uppercase font-black text-[11px] mb-1 text-center">Days Connected</span>
                <div className="text-3xl text-green-400 font-black flex items-center gap-2">
                  <Clock size={22} className="shrink-0 text-green-400" />
                  {daysConnected}
                </div>
              </div>
              <div className="bg-black border-4 border-black p-3 flex flex-col items-center justify-center">
                <span className="text-gray-400 uppercase font-black text-[11px] mb-1 text-center">Active Effects</span>
                <div className="text-3xl text-pink-400 font-black flex items-center gap-2">
                  <Sparkles size={22} className="shrink-0 text-pink-400" />
                  {activeCards.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Partner Avatars Card - Displays Real Users */}
        <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black uppercase text-white mb-3 flex items-center gap-2">
              <UserIcon size={18} className="text-pink-400" />
              Couple Deck
            </h3>
            <p className="text-xs uppercase text-gray-300 font-bold leading-relaxed mb-4">
              Real-time synchronization for card play, active effects, and verification.
            </p>
          </div>

          <div className="flex items-center justify-around bg-black border-4 border-black p-4">
            {/* You */}
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 border-2 border-black overflow-hidden mb-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)] ${
                user.gender === 'male' ? 'bg-blue-600' : 'bg-pink-600'
              }`}>
                <img 
                  src={user.gender === 'female' ? PROFILE_AVATARS.female : PROFILE_AVATARS.male} 
                  alt="You" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="text-[10px] font-black uppercase text-white text-center max-w-[84px] truncate">
                {user.name || 'You'}
              </span>
              <span className="text-[9px] font-mono text-gray-400 uppercase">
                {user.gender || 'starter'}
              </span>
            </div>

            <Heart className={`w-6 h-6 mx-2 shrink-0 ${
              user.partnerCode ? 'text-pink-500 fill-pink-500 animate-bounce' : 'text-gray-600'
            }`} />

            {/* Real Partner */}
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 border-2 border-black overflow-hidden mb-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)] flex items-center justify-center ${
                user.partnerGender === 'male' ? 'bg-blue-600' : user.partnerGender === 'female' ? 'bg-pink-600' : 'bg-gray-800'
              }`}>
                {user.partnerCode ? (
                  <img 
                    src={user.partnerGender === 'female' ? PROFILE_AVATARS.female : PROFILE_AVATARS.male} 
                    alt="Partner" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-xl font-black text-gray-500">?</span>
                )}
              </div>
              <span className="text-[10px] font-black uppercase text-center max-w-[84px] truncate text-pink-400">
                {user.partnerName || (user.partnerCode ? 'Partner' : 'Pending')}
              </span>
              <span className="text-[9px] font-mono text-gray-400 uppercase">
                {user.partnerCode ? (user.partnerGender || 'Deck') : 'Unlinked'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* If Not Paired or has incoming requests, show Pairing Section right here on Couple tab */}
      {(!user.partnerCode || incomingRequests.length > 0 || outgoingRequest) && (
        <PairingSection
          user={user}
          incomingRequests={incomingRequests}
          outgoingRequest={outgoingRequest}
          onSendPairRequest={onSendPairRequest || (async () => ({ success: false, message: '' }))}
          onAcceptPairRequest={onAcceptPairRequest || (async () => {})}
          onDeclinePairRequest={onDeclinePairRequest || (async () => {})}
          onCancelPairRequest={onCancelPairRequest || (async () => {})}
          onUnpair={onUnpair || (async () => {})}
          onOpenAuth={onOpenAuth}
        />
      )}

      {/* Middle Section: Active Effects with Complete Task Button & Time Adjustment */}
      <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-blue-400" />
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-blue-400">Active Effects</h2>
            </div>
            <p className="text-xs uppercase leading-relaxed text-gray-300 mt-1">
              Active cards running in your connection. Confirm task completion once fulfilled!
            </p>
          </div>

          <div className="bg-black px-3 py-1 border-2 border-black text-xs font-black uppercase text-gray-300">
            {activeCards.length} {activeCards.length === 1 ? 'Card Running' : 'Cards Running'}
          </div>
        </div>

        <div className="space-y-4">
          {activeCards.length === 0 ? (
            <div className="bg-black/60 border-4 border-dashed border-gray-700 p-8 text-center">
              <Layers className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                No active cards right now.
              </p>
              <p className="text-xs text-gray-500 uppercase mt-1">
                Go to Collection and click "Play Card" to activate a 24-hour partner effect!
              </p>
            </div>
          ) : (
            activeCards.map(ac => {
              const cardDef = INITIAL_CARDS.find(c => c.id === ac.cardId);
              if (!cardDef) return null;
              
              const activeId = ac.id || ac.cardId;
              const isCreator = !ac.usedByUserId || ac.usedByUserId === user.id;
              const usedByName = ac.usedBy || (isCreator ? user.name : 'Partner');
              const isAdjusting = showTimeAdjuster === activeId;

              return (
                <div 
                  key={activeId} 
                  className="bg-black border-4 border-black p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] hover:border-blue-400/50"
                >
                  {/* Card Thumbnail & Info */}
                  <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                    <div className="w-16 h-20 bg-gray-900 border-2 border-black shrink-0 overflow-hidden relative shadow-[2px_2px_0_rgba(0,0,0,1)]">
                      {cardDef.imageUrl ? (
                        <img 
                          src={cardDef.imageUrl} 
                          alt={cardDef.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-black">
                          CARD
                        </div>
                      )}
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-black uppercase text-center text-white truncate py-0.5">
                        {cardDef.rarity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black uppercase text-lg text-white truncate">{cardDef.name}</h4>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-900/60 text-blue-300 border border-blue-500">
                          {cardDef.category}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 uppercase mt-1 line-clamp-2">
                        {cardDef.description}
                      </p>

                      {/* Card Info: Used By and Start Time */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase bg-[#222233] text-pink-300 border border-pink-500/40 px-2 py-0.5">
                          <UserIcon size={12} className="text-pink-400" />
                          Used by: <strong className="text-white ml-0.5">{usedByName}</strong>
                        </span>

                        {ac.startedAt && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400 bg-black/80 px-2 py-0.5 border border-white/10">
                            <Clock size={10} />
                            Activated {formatTimestamp(ac.startedAt)}
                          </span>
                        )}
                      </div>

                      {/* Selected Card Options / Objectives */}
                      {ac.selectedOptions && ac.selectedOptions.length > 0 && (
                        <div className="mt-2.5 bg-[#181824] border-2 border-yellow-500/40 p-2 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles size={11} className="text-yellow-400" />
                            <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider">
                              Selected Effect Task{ac.selectedOptions.length > 1 ? 's' : ''}:
                            </span>
                          </div>
                          <div className="space-y-1">
                            {ac.selectedOptions.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-start gap-1.5 text-xs text-white uppercase font-bold">
                                <span className="text-yellow-400 font-black">▶</span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Time Display, Time Adjuster, and Completed Task Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto justify-end border-t-2 md:border-t-0 border-white/10 pt-3 md:pt-0">
                    
                    {/* Active Card Countdown Timer with Update Time Trigger */}
                    <div className="flex flex-col items-start sm:items-end">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-red-950/80 border-2 border-red-500 px-3 py-1 text-red-400 font-mono font-bold text-sm shrink-0 flex items-center gap-1.5 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                          <Clock size={14} className="text-red-400 animate-spin" />
                          <span>{formatCountdown(ac.expiresAt)}</span>
                        </div>

                        {/* Button to toggle time extension */}
                        {onUpdateActiveCardTime && (
                          <button
                            onClick={() => {
                              retroAudio.playButtonClick();
                              setShowTimeAdjuster(isAdjusting ? null : activeId);
                            }}
                            title="Adjust / extend active card timer"
                            className="p-1.5 bg-[#333344] hover:bg-[#444455] text-white border-2 border-black text-xs font-black cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-px"
                          >
                            <Clock size={14} />
                          </button>
                        )}
                      </div>

                      {/* Time adjust drawer/controls */}
                      {isAdjusting && onUpdateActiveCardTime && (
                        <div className="mt-2 p-2 bg-[#222233] border-2 border-black flex items-center gap-1 shadow-[2px_2px_0_rgba(0,0,0,1)] animate-in fade-in">
                          <span className="text-[10px] font-black uppercase text-gray-400 mr-1">Extend:</span>
                          <button
                            onClick={() => onUpdateActiveCardTime(activeId, 60 * 60 * 1000)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-black border border-black text-[10px] font-black uppercase cursor-pointer"
                          >
                            +1h
                          </button>
                          <button
                            onClick={() => onUpdateActiveCardTime(activeId, 6 * 60 * 60 * 1000)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-black border border-black text-[10px] font-black uppercase cursor-pointer"
                          >
                            +6h
                          </button>
                          <button
                            onClick={() => onUpdateActiveCardTime(activeId, 24 * 60 * 60 * 1000)}
                            className="px-2 py-1 bg-yellow-400 hover:bg-yellow-300 text-black border border-black text-[10px] font-black uppercase cursor-pointer"
                          >
                            +24h
                          </button>
                          <button
                            onClick={() => onUpdateActiveCardTime(activeId, -60 * 60 * 1000)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-500 text-black border border-black text-[10px] font-black uppercase cursor-pointer"
                            title="Reduce by 1 hour"
                          >
                            -1h
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Completed Task Button: Only confirmation can be done by user who used card */}
                    {isCreator ? (
                      <button
                        onClick={() => {
                          if (onCompleteTask) onCompleteTask(activeId);
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-black font-black uppercase text-xs flex items-center justify-center gap-1.5 shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all cursor-pointer whitespace-nowrap"
                      >
                        <CheckCircle2 size={16} className="text-black" />
                        <span>Completed Task</span>
                      </button>
                    ) : (
                      <div 
                        title={`Only ${usedByName} who activated this card can confirm task completion!`}
                        className="w-full sm:w-auto px-3 py-2 bg-gray-800 text-gray-500 border-2 border-gray-700 font-bold uppercase text-[11px] flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                      >
                        <Lock size={14} className="text-gray-500" />
                        <span>Creator Verification Required</span>
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Section: Card History (Use, Purchased, Trade, Completed) - saved up to 1 week */}
      <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <History className="w-7 h-7 text-yellow-400" />
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-yellow-400">Card & Task History</h2>
            </div>
            <p className="text-xs uppercase text-gray-300 font-bold mt-1">
              Activity log of card uses, market purchases, duplicate trades, and completed tasks (Saved up to 1 week).
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} className="text-gray-400 mr-1 hidden sm:inline" />
            {(['all', 'use', 'completed', 'purchase', 'trade'] as const).map(filterKey => (
              <button
                key={filterKey}
                onClick={() => {
                  retroAudio.playButtonClick();
                  setHistoryFilter(filterKey);
                }}
                className={`px-3 py-1 border-2 text-[11px] font-black uppercase transition-all cursor-pointer ${
                  historyFilter === filterKey
                    ? 'bg-yellow-400 text-black border-black shadow-[2px_2px_0_rgba(0,0,0,1)]'
                    : 'bg-black/60 text-gray-400 border-black hover:text-white'
                }`}
              >
                {filterKey === 'all' ? 'All (7d)' : filterKey}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredHistory.length === 0 ? (
            <div className="bg-black/50 border-4 border-dashed border-gray-700 p-8 text-center">
              <History className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                No history entries in the past 7 days.
              </p>
              <p className="text-xs text-gray-500 uppercase mt-1">
                Purchasing, playing, exchanging, and completing cards will automatically record memories here.
              </p>
            </div>
          ) : (
            filteredHistory.map(item => {
              const badge = getEventBadge(item.type);
              return (
                <div 
                  key={item.id} 
                  className="bg-black border-2 border-black p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[2px_2px_0_rgba(0,0,0,1)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 border shrink-0 ${badge.bg}`}>
                      {badge.icon}
                      {badge.label}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black uppercase text-white text-sm truncate">{item.cardName}</span>
                        {item.cardCategory && (
                          <span className="text-[9px] font-black uppercase text-gray-400 bg-[#222] px-1.5 py-0.2 border border-white/10">
                            {item.cardCategory}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 uppercase mt-0.5">
                        {item.details || 'Card activity recorded'}
                      </p>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedOptions.map((opt, oIdx) => (
                            <span key={oIdx} className="text-[9px] font-black uppercase text-yellow-300 bg-yellow-950/60 border border-yellow-500/40 px-1.5 py-0.5">
                              ★ {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-right border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                    <span className="text-[11px] text-pink-300 uppercase font-black">
                      By {item.userName}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase font-mono">
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Retention Footer Note */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-500 font-bold uppercase">
          <span>Data Retention: 7 Days Rolling Window</span>
          <span>Showing {filteredHistory.length} of {recentHistory.length} items</span>
        </div>
      </div>

    </div>
  );
};
