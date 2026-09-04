import { Card } from './types';
import { getCardImageUrl } from './lib/supabase';

export const INITIAL_CARDS: Card[] = [
  // Male Cards
  { id: 'm_game', name: 'Game night', category: 'male', rarity: 'Common', description: "Let's play a game!", price: 10, imageUrl: getCardImageUrl('male', 'GameCard.png') },
  { id: 'm_sleep', name: 'Sleep in', category: 'male', rarity: 'Common', description: 'Time for sleep!', price: 10, imageUrl: getCardImageUrl('male', 'Sleep card.png') },
  { id: 'm_peace', name: 'peace', category: 'male', rarity: 'Rare', description: 'Silence settles all!', price: 30, imageUrl: getCardImageUrl('male', 'Peace card.png') },
  { id: 'm_18plus', name: '18+ card', category: 'male', rarity: 'Epic', description: 'Time for breakfast!', price: 100, imageUrl: getCardImageUrl('male', '18+ card.png') },
  { id: 'm_surprise', name: 'surprise card', category: 'male', rarity: 'Legendary', description: 'Give me something!', price: 300, imageUrl: getCardImageUrl('male', 'Suprise card.png') },
  { id: 'm_anything', name: 'Anything', category: 'male', rarity: 'Mythic', description: 'Four wishes included!', price: 1000, imageUrl: getCardImageUrl('male', 'Anything card.png') },
  { id: 'm_special', name: 'Cash (special)', category: 'male', rarity: 'Special', description: 'Cash', price: 10000, imageUrl: getCardImageUrl('male', 'Cash Card.png') },
  
  // Female Cards
  { id: 'f_game', name: 'Game night', category: 'female', rarity: 'Common', description: "Let's play a game!", price: 10, imageUrl: getCardImageUrl('female', 'GameCard.png') },
  { id: 'f_sleep', name: 'Sleep in', category: 'female', rarity: 'Common', description: 'Time for sleep!', price: 10, imageUrl: getCardImageUrl('female', 'Sleep card.png') },
  { id: 'f_peace', name: 'peace', category: 'female', rarity: 'Rare', description: 'Silence settles all!', price: 30, imageUrl: getCardImageUrl('female', 'Peace card.png') },
  { id: 'f_18plus', name: '18+ card', category: 'female', rarity: 'Epic', description: 'Time for breakfast!', price: 100, imageUrl: getCardImageUrl('female', '18+ card.png') },
  { id: 'f_surprise', name: 'surprise card', category: 'female', rarity: 'Legendary', description: 'Give me something!', price: 300, imageUrl: getCardImageUrl('female', 'Suprise card.png') },
  { id: 'f_anything', name: 'Anything', category: 'female', rarity: 'Mythic', description: 'Four wishes included!', price: 1000, imageUrl: getCardImageUrl('female', 'Anything card.png') },
  { id: 'f_special', name: 'Cash (special)', category: 'female', rarity: 'Special', description: 'Cash', price: 10000, imageUrl: getCardImageUrl('female', 'Cash Card.png') },
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
