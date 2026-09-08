const fs = require('fs');
let code = fs.readFileSync('src/lib/usePairingSync.ts', 'utf8');

// 1. sendGift update
code = code.replace(
  /const sendGift = async \(cardId: string\) => \{[\s\S]*?channelRef\.current\.send\(\{[\s\S]*?type: 'broadcast',[\s\S]*?event: 'send_gift',[\s\S]*?payload: \{ toUserId: user\.partnerId, gift \}[\s\S]*?\}\);[\s\S]*?return true;[\s\S]*?\};/m,
  `const sendGift = async (cardId: string) => {
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
  };`
);

// 2. sync_activity payload updates (there are 2 places where sync_activity is broadcasted: when request_sync is received, and in the useEffect)
code = code.replace(
  /activeCards: user\.activeCards,\s+giftInbox: user\.giftInbox,\s+history: user\.history/g,
  "activeCards: user.activeCards,\n                giftInbox: user.giftInbox,\n                sentGifts: user.sentGifts,\n                claimedGifts: user.claimedGifts,\n                gender: user.gender,\n                history: user.history"
);

// 3. Update useEffect dependencies
code = code.replace(
  /\[user\.dailyStreak, user\.name, user\.activeCards, user\.giftInbox, user\.history, user\.partnerId\]/g,
  "[user.dailyStreak, user.name, user.activeCards, user.giftInbox, user.sentGifts, user.claimedGifts, user.gender, user.history, user.partnerId]"
);

// 4. Update sync_activity handler
const syncHandlerStart = `if (payload.data.name && updated.partnerName !== payload.data.name) {
              updated.partnerName = payload.data.name;
              hasChanges = true;
            }`;

const syncHandlerNew = `if (payload.data.name && updated.partnerName !== payload.data.name) {
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
            }`;

code = code.replace(syncHandlerStart, syncHandlerNew);

fs.writeFileSync('src/lib/usePairingSync.ts', code);
