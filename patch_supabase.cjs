const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

code = code.replace(
  "giftInbox: user.giftInbox,",
  "giftInbox: user.giftInbox,\n        sentGifts: user.sentGifts,\n        claimedGifts: user.claimedGifts,"
);

code = code.replace(
  "giftInbox: meta.giftInbox || [],",
  "giftInbox: meta.giftInbox || [],\n    sentGifts: meta.sentGifts || [],\n    claimedGifts: meta.claimedGifts || [],"
);

fs.writeFileSync('src/lib/supabase.ts', code);
