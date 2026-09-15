import { Card } from './types';

export const INITIAL_CARDS: Card[] = [
  // Male Cards
  { 
    id: 'm_game', 
    name: 'GAMING CARD', 
    category: 'male', 
    rarity: 'Common', 
    description: "Let's play a game!", 
    price: 10, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/GAME%20CARD%20(M).png',
    options: [
      'The universe grants its owner unlimited gaming time today.',
      'Your partner cant say no to any game today!'
    ]
  },
  { 
    id: 'm_sleep', 
    name: 'SLEEPY CARD', 
    category: 'male', 
    rarity: 'Common', 
    description: 'Time for sleep!', 
    price: 50, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/SLEEP%20CARD%20(M).png',
    options: [
      'The universe grants its owner a day of peaceful sleep.',
      'Today, the owner may sleep as long as they wish'
    ]
  },
  { 
    id: 'm_time',
    name: 'TIME CARD',
    category: 'male',
    rarity: 'Rare', 
    description: 'Demand your partner\'s undivided time!', 
    price: 20, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/TIME%20CARD%20(M).png',
    options: [
      'Your partner must spend the next hour entirely with you.',
      'Enjoy uninterrupted quality time together.'
    ]
  },
  { 
    id: 'm_peace', 
    name: 'PEACE CARD', 
    category: 'male', 
    rarity: 'Rare', 
    description: 'Silence settles all!', 
    price: 100, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/PEACE%20CARD%20(M).png',
    options: [
      'Today, the owner cannot lose an argument'
    ]
  },
  { 
    id: 'm_18plus', 
    name: '18+ CARD', 
    category: 'male', 
    rarity: 'Epic', 
    description: 'Time for breakfast!', 
    price: 200, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/18+%20CARD.png',
    options: [
      'The owner gets some extra love today',
      'Something spicy should be attached in the dm'
    ]
  },
  { 
    id: 'm_surprise', 
    name: 'SURPRISE CARD', 
    category: 'male', 
    rarity: 'Legendary', 
    description: 'Give me something!', 
    price: 600, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/SUPRISE%20CARD%20(M).png',
    options: [
      'The universe demands a surprise for its owner.',
      'Suprise me with something hand made!'
    ]
  },
  { 
    id: 'm_anything', 
    name: 'ANYTHING CARD', 
    category: 'male', 
    rarity: 'Mythic', 
    description: 'Four wishes included!', 
    price: 2000, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/ANYTHING%20CARD%20(M).png',
    options: [
      'Sleep Together — VC or IRL',
      'Card Request — Receive a card',
      'Handmade Task — They complete your task',
      'Stand up — Free comedy or drama.'
    ]
  },
  { 
    id: 'm_special', 
    name: 'CASH CARD', 
    category: 'male', 
    rarity: 'Special', 
    description: 'Cash', 
    price: 10000, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/CASH%20CARD%20(M).png',
    options: [
      '100 Cash — Receive ₹100',
      'Treat Instead — Get a snack/meal worth up to ₹100.'
    ]
  },
  
  // Female Cards
  { 
    id: 'f_game', 
    name: 'GAMING CARD', 
    category: 'female', 
    rarity: 'Common', 
    description: "Let's play a game!", 
    price: 10, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/GAME%20CARD%20(F).png',
    options: [
      'The universe grants its owner unlimited gaming time today.',
      'Your partner cant say no to any game today!'
    ]
  },
  { 
    id: 'f_sleep', 
    name: 'SLEEPY CARD', 
    category: 'female', 
    rarity: 'Common', 
    description: 'Time for sleep!', 
    price: 50, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/SLEEP%20CARD%20(F).png',
    options: [
      'The universe grants its owner a day of peaceful sleep.',
      'Today, the owner may sleep as long as they wish'
    ]
  },
  { 
    id: 'f_time',
    name: 'TIME CARD',
    category: 'female',
    rarity: 'Rare', 
    description: 'Demand your partner\'s undivided time!', 
    price: 20, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/TIME%20CARD%20(F).png',
    options: [
      'Your partner must spend the next hour entirely with you.',
      'Enjoy uninterrupted quality time together.'
    ]
  },
  { 
    id: 'f_peace', 
    name: 'PEACE CARD', 
    category: 'female', 
    rarity: 'Rare', 
    description: 'Silence settles all!', 
    price: 100, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/PEACE%20CARD%20(F).png',
    options: [
      'Today, the owner cannot lose an argument'
    ]
  },
  { 
    id: 'f_18plus', 
    name: '18+ CARD', 
    category: 'female', 
    rarity: 'Epic', 
    description: 'Time for breakfast!', 
    price: 200, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/18+%20CARD%20(F).png',
    options: [
      'The owner gets some extra love today',
      'Something spicy should be attached in the dm'
    ]
  },
  { 
    id: 'f_surprise', 
    name: 'SURPRISE CARD', 
    category: 'female', 
    rarity: 'Legendary', 
    description: 'Give me something!', 
    price: 600, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/SUPRISE%20CARD%20(F).png',
    options: [
      'The universe demands a surprise for its owner.',
      'Suprise me with something hand made!'
    ]
  },
  { 
    id: 'f_anything', 
    name: 'ANYTHING CARD', 
    category: 'female', 
    rarity: 'Mythic', 
    description: 'Four wishes included!', 
    price: 2000, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/ANYTHING%20CARD%20(F).png',
    options: [
      'Sleep Together — VC or IRL',
      'Card Request — Receive a card',
      'Handmade Task — They complete your task',
      'Stand up — Free comedy or drama.'
    ]
  },
  { 
    id: 'f_special', 
    name: 'CASH CARD', 
    category: 'female', 
    rarity: 'Special', 
    description: 'Cash', 
    price: 10000, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/CASH%20CARD%20(F).png',
    options: [
      '100 Cash — Receive ₹100',
      'Treat Instead — Get a snack/meal worth up to ₹100.'
    ]
  },
];

export const RARITY_COLORS: Record<string, string> = {
  Common: 'bg-green-500',
  Rare: 'bg-teal-500',
  Epic: 'bg-purple-500',
  Legendary: 'bg-yellow-500',
  Mythic: 'bg-red-500',
  Special: 'bg-indigo-500'
};

export const RARITY_COIN_VALUES: Record<string, number> = {
  Common: 5,
  Rare: 15,
  Epic: 50,
  Legendary: 150,
  Mythic: 500,
  Special: 1000
};

export const PROFILE_AVATARS = {
  male: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/icnons/maleuser.png',
  female: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/icnons/femaleuser.png'
};

