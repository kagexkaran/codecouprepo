const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "giftInbox: prev.giftInbox?.filter(g => g.id !== giftId) || []",
  "giftInbox: prev.giftInbox?.filter(g => g.id !== giftId) || [],\n        claimedGifts: [...(prev.claimedGifts || []), giftId]"
);

fs.writeFileSync('src/App.tsx', code);
