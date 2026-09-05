const fs = require('fs');
let code = fs.readFileSync('src/lib/usePairingSync.ts', 'utf8');

const target = `      .on('broadcast', { event: 'request_sync' }, ({ payload }) => {`;
const newCode = `      .on('broadcast', { event: 'send_gift' }, ({ payload }) => {
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
      .on('broadcast', { event: 'request_sync' }, ({ payload }) => {`;

code = code.replace(target, newCode);
fs.writeFileSync('src/lib/usePairingSync.ts', code);
