import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, syncUserDataToSupabase } from './supabase';
import { User, PairRequest, ActiveCard } from '../types';

export function usePairingSync(
  user: User,
  setUser: React.Dispatch<React.SetStateAction<User>>,
  isAuthenticated: boolean
) {
  const [incomingRequests, setIncomingRequests] = useState<PairRequest[]>([]);
  const [outgoingRequestState, setOutgoingRequestState] = useState<PairRequest | null>(null);
  const outgoingRequestRef = useRef<PairRequest | null>(null);

  const setOutgoingRequest = useCallback((val: any) => {
    setOutgoingRequestState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      outgoingRequestRef.current = next;
      return next;
    });
  }, []);

  const outgoingRequest = outgoingRequestState;
  const channelRef = useRef<any>(null);

  const triggerCloudSync = useCallback((userData: User) => {
    if (userData.id) {
      syncUserDataToSupabase(userData).catch(console.warn);
    }
  }, []);

  useEffect(() => {
    if (!user.id || !isAuthenticated) return;

    const channel = supabase.channel('codecoup_pairing', {
      config: { broadcast: { self: false } }
    });

    channel
      .on('broadcast', { event: 'discover' }, ({ payload }) => {
        if (payload.targetCode?.toUpperCase() === user.pairingCode?.toUpperCase()) {
          // Someone is looking for my code! Reply to them directly.
          channel.send({
            type: 'broadcast',
            event: 'discover_reply',
            payload: {
              toUserId: payload.fromUserId,
              user: {
                userId: user.id,
                email: user.email,
                name: user.name,
                gender: user.gender,
                pairingCode: user.pairingCode,
                dailyStreak: user.dailyStreak
              }
            }
          });
        }
      })
      .on('broadcast', { event: 'discover_reply' }, ({ payload }) => {
        const currentReq = outgoingRequestRef.current;
        if (payload.toUserId === user.id && currentReq && currentReq.status === 'searching') {
          // We found the user we were looking for! Now send the actual pair request.
          const req: PairRequest = {
            id: currentReq.id,
            fromUserId: user.id,
            fromEmail: user.email || '',
            fromName: user.name,
            fromGender: user.gender,
            fromCode: user.pairingCode,
            toUserId: payload.user.userId,
            toEmail: payload.user.email || '',
            toName: payload.user.name || '',
            toCode: payload.user.pairingCode || '',
            status: 'pending',
            createdAt: Date.now(),
          };
          setOutgoingRequest(req);
          channel.send({
            type: 'broadcast',
            event: 'pair_request',
            payload: { req, targetUser: payload.user }
          });
        }
      })
      .on('broadcast', { event: 'pair_request' }, ({ payload }) => {
        if (payload.targetUser?.userId === user.id) {
          setIncomingRequests(prev => {
            if (prev.some(r => r.id === payload.req.id)) return prev;
            return [...prev, payload.req];
          });
        }
      })
      .on('broadcast', { event: 'accept_request' }, ({ payload }) => {
        if (payload.req.fromUserId === user.id) {
          // My request was accepted!
          setOutgoingRequest(null);
          setUser(prev => {
            const updated: User = {
              ...prev,
              partnerId: payload.partner.userId,
              partnerCode: payload.partner.pairingCode,
              partnerName: payload.partner.name,
              partnerEmail: payload.partner.email,
              partnerGender: payload.partner.gender,
              partnerStreak: payload.partner.dailyStreak,
              connectedAt: Date.now(),
            };
            triggerCloudSync(updated);
            return updated;
          });
        }
      })
      .on('broadcast', { event: 'decline_request' }, ({ payload }) => {
        if (payload.req.fromUserId === user.id) {
          setOutgoingRequest(null);
        }
      })
      .on('broadcast', { event: 'cancel_request' }, ({ payload }) => {
        if (payload.req.toUserId === user.id) {
          setIncomingRequests(prev => prev.filter(r => r.id !== payload.req.id));
        }
      })
      .on('broadcast', { event: 'unpair' }, ({ payload }) => {
        if (payload.toUserId === user.id) {
          setUser(prev => {
            const updated: User = {
              ...prev,
              partnerId: null,
              partnerCode: null,
              partnerName: null,
              partnerEmail: null,
              partnerGender: undefined,
              partnerStreak: undefined,
              connectedAt: undefined,
            };
            triggerCloudSync(updated);
            return updated;
          });
        }
      })
      .on('broadcast', { event: 'sync_activity' }, ({ payload }) => {
        if (payload.toUserId === user.id) {
          setUser(prev => {
            if (!prev.partnerId) return prev;
            const updated: User = { ...prev };
            let hasChanges = false;
            
            if (payload.data.dailyStreak !== undefined && updated.partnerStreak !== payload.data.dailyStreak) {
              updated.partnerStreak = payload.data.dailyStreak;
              hasChanges = true;
            }
            if (payload.data.name && updated.partnerName !== payload.data.name) {
              updated.partnerName = payload.data.name;
              hasChanges = true;
            }
            if (payload.data.gender && updated.partnerGender !== payload.data.gender) {
              updated.partnerGender = payload.data.gender;
              hasChanges = true;
            }
            
            if (payload.data.claimedGifts) {
              const incomingClaimed = payload.data.claimedGifts;
              const currentSent = updated.sentGifts || [];
              const newSent = currentSent.filter(g => !incomingClaimed.includes(g.id));
              if (newSent.length !== currentSent.length) {
                updated.sentGifts = newSent;
                hasChanges = true;
              }
            }
            
            if (payload.data.sentGifts) {
              const incomingSent = payload.data.sentGifts;
              const currentClaimed = updated.claimedGifts || [];
              const currentInbox = updated.giftInbox || [];
              
              let inboxChanged = false;
              const mergedInbox = [...currentInbox];
              
              incomingSent.forEach(gift => {
                if (!currentClaimed.includes(gift.id) && !mergedInbox.some(g => g.id === gift.id)) {
                  mergedInbox.push(gift);
                  inboxChanged = true;
                }
              });
              
              if (inboxChanged) {
                updated.giftInbox = mergedInbox;
                hasChanges = true;
              }
            }
            if (payload.data.activeCards) {
              const currentCards = updated.activeCards || [];
              const incomingCards = payload.data.activeCards as ActiveCard[];
              
              // Merge active cards by ID
              const mergedCards = [...currentCards];
              let cardsChanged = false;
              
              incomingCards.forEach(incomingCard => {
                const existingIndex = mergedCards.findIndex(c => c.id === incomingCard.id);
                if (existingIndex >= 0) {
                  // update if completed or if time changed
                  const existing = mergedCards[existingIndex];
                  if (
                    (incomingCard.completed && !existing.completed) ||
                    (incomingCard.expiresAt !== existing.expiresAt)
                  ) {
                    mergedCards[existingIndex] = incomingCard;
                    cardsChanged = true;
                  }
                } else {
                  // it's a new card
                  mergedCards.push(incomingCard);
                  cardsChanged = true;
                }
              });
              
              if (cardsChanged) {
                updated.activeCards = mergedCards;
                hasChanges = true;
              }
            }
            
            if (payload.data.history) {
              const currentHistory = updated.history || [];
              const incomingHistory = payload.data.history as any[];
              
              const mergedHistory = [...currentHistory];
              let historyChanged = false;
              
              incomingHistory.forEach(incomingItem => {
                if (!mergedHistory.some(item => item.id === incomingItem.id)) {
                  mergedHistory.push(incomingItem);
                  historyChanged = true;
                }
              });
              
              if (historyChanged) {
                // sort by timestamp descending
                updated.history = mergedHistory.sort((a, b) => b.timestamp - a.timestamp);
                hasChanges = true;
              }
            }

            if (hasChanges) {
              triggerCloudSync(updated);
              return updated;
            }
            return prev;
          });
        }
      })
      .on('broadcast', { event: 'send_gift' }, ({ payload }) => {
        if (payload.toUserId === user.id) {
          setUser(prev => {
            const currentInbox = prev.giftInbox || [];
            if (currentInbox.some(g => g.id === payload.gift.id)) return prev;
            
            const updated = {
              ...prev,
              giftInbox: [payload.gift, ...currentInbox]
            };
            triggerCloudSync(updated);
            return updated;
          });
        }
      })
      .on('broadcast', { event: 'request_sync' }, ({ payload }) => {
        if (payload.toUserId === user.id) {
          // Partner came online and wants my latest state
          channel.send({
            type: 'broadcast',
            event: 'sync_activity',
            payload: {
              toUserId: payload.fromUserId,
              data: {
                dailyStreak: user.dailyStreak,
                name: user.name,
                activeCards: user.activeCards,
                giftInbox: user.giftInbox,
                sentGifts: user.sentGifts,
                claimedGifts: user.claimedGifts,
                gender: user.gender,
                history: user.history
              }
            }
          });
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && user.partnerId) {
          // When we connect, ask our partner for their latest state
          channel.send({
            type: 'broadcast',
            event: 'request_sync',
            payload: { fromUserId: user.id, toUserId: user.partnerId }
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id, user.pairingCode, isAuthenticated]);

  // Sync my activity to partner whenever my streak, name, activeCards, or history changes
  useEffect(() => {
    if (channelRef.current && user.partnerId) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync_activity',
        payload: {
          toUserId: user.partnerId,
          data: {
            dailyStreak: user.dailyStreak,
            name: user.name,
            activeCards: user.activeCards,
                giftInbox: user.giftInbox,
                sentGifts: user.sentGifts,
                claimedGifts: user.claimedGifts,
                gender: user.gender,
                history: user.history
          }
        }
      });
    }
  }, [user.dailyStreak, user.name, user.activeCards, user.giftInbox, user.sentGifts, user.claimedGifts, user.gender, user.history, user.partnerId]);

  const sendPairRequest = async (targetCode: string) => {
    if (!channelRef.current) return { success: false, message: 'Not connected to real-time sync.' };
    
    const reqId = `req_${Date.now()}`;
    setOutgoingRequest({
      id: reqId,
      fromUserId: user.id,
      fromEmail: user.email || '',
      fromName: user.name,
      fromGender: user.gender,
      fromCode: user.pairingCode,
      toUserId: 'searching',
      toEmail: '',
      toName: '',
      toCode: targetCode,
      status: 'searching',
      createdAt: Date.now()
    });

    // Broadcast discover to find who has this code
    channelRef.current.send({
      type: 'broadcast',
      event: 'discover',
      payload: { targetCode, fromUserId: user.id }
    });

    // Timeout if no reply
    setTimeout(() => {
      setOutgoingRequest(prev => {
        if (prev && prev.id === reqId && prev.status === 'searching') {
          return null;
        }
        return prev;
      });
    }, 5000);

    return { success: true, message: 'Searching for partner online...' };
  };

  const acceptPairRequest = async (requestId: string) => {
    const req = incomingRequests.find(r => r.id === requestId);
    if (!req || !channelRef.current) return;

    const partnerData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      gender: user.gender,
      pairingCode: user.pairingCode,
      dailyStreak: user.dailyStreak
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'accept_request',
      payload: { req, partner: partnerData }
    });

    setUser(prev => {
      const updated: User = {
        ...prev,
        partnerId: req.fromUserId,
        partnerCode: req.fromCode,
        partnerName: req.fromName,
        partnerEmail: req.fromEmail,
        partnerGender: req.fromGender,
        partnerStreak: 0,
        connectedAt: Date.now()
      };
      triggerCloudSync(updated);
      return updated;
    });
    setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const declinePairRequest = async (requestId: string) => {
    const req = incomingRequests.find(r => r.id === requestId);
    if (!req || !channelRef.current) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'decline_request',
      payload: { req }
    });
    setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const cancelPairRequest = async (requestId: string) => {
    if (!outgoingRequest || !channelRef.current) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'cancel_request',
      payload: { req: outgoingRequest }
    });
    setOutgoingRequest(null);
  };

  const sendGift = async (cardId: string) => {
    if (!channelRef.current || !user.partnerId) return false;
    
    const gift = {
      id: 'gift_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      cardId,
      fromName: user.name || 'Your partner',
      timestamp: Date.now()
    };
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'send_gift',
      payload: { toUserId: user.partnerId, gift }
    });
    
    setUser(prev => {
      const updated = {
        ...prev,
        sentGifts: [...(prev.sentGifts || []), gift]
      };
      triggerCloudSync(updated);
      return updated;
    });
    
    return true;
  };

  const requestSync = () => {
    if (channelRef.current && user.partnerId) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'request_sync',
        payload: { fromUserId: user.id, toUserId: user.partnerId }
      });
    }
  };

  const unpairPartners = async () => {
    if (!channelRef.current || !user.partnerId) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'unpair',
      payload: { fromUserId: user.id, toUserId: user.partnerId }
    });

    setUser(prev => {
      const updated: User = {
        ...prev,
        partnerId: null,
        partnerCode: null,
        partnerName: null,
        partnerEmail: null,
        partnerGender: undefined,
        partnerStreak: undefined,
        connectedAt: undefined,
      };
      triggerCloudSync(updated);
      return updated;
    });
  };

  return {
    incomingRequests,
    outgoingRequest,
    sendPairRequest,
    acceptPairRequest,
    declinePairRequest,
    cancelPairRequest,
    sendGift,
    unpairPartners,
    triggerCloudSync,
    requestSync
  };
}
