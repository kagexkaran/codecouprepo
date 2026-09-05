const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('GiftItem')) {
  code = code.replace('export interface ActiveCard', `export interface GiftItem {
  id: string;
  cardId: string;
  fromName: string;
  timestamp: number;
}

export interface ActiveCard`);
}

if (!code.includes('giftInbox')) {
  code = code.replace('activeCards?: ActiveCard[];', 'activeCards?: ActiveCard[];\n  giftInbox?: GiftItem[];');
}

fs.writeFileSync('src/types.ts', code);
