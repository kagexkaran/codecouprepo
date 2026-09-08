const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "giftInbox?: GiftItem[];",
  "giftInbox?: GiftItem[];\n  sentGifts?: GiftItem[];\n  claimedGifts?: string[];"
);

fs.writeFileSync('src/types.ts', code);
