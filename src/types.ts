export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Special';

export interface Card {
  id: string;
  name: string;
  category: 'male' | 'female' | 'special';
  rarity: Rarity;
  description: string;
  imageUrl?: string;
  price: number;
}

export interface ActiveCard {
  cardId: string;
  expiresAt: number;
}

export interface User {
  id: string;
  email?: string;
  name: string;
  pairingCode: string;
  partnerCode: string | null;
  coins: number;
  collection: Record<string, number>; // cardId -> quantity
  gender?: 'male' | 'female';
  initialCardsClaimed?: boolean;
  connectedAt?: number;
  activeCards?: ActiveCard[];
  shopLastRefreshTime?: number;
  shopAvailableCards?: string[];
  shopPurchasesToday?: number;
  shopPurchasedCards?: string[];
  dailyLoginCount?: number;
  dailyLoginLastClaim?: number;
}

export type Tab = 'dashboard' | 'collection' | 'shop' | 'settings' | 'couple';
