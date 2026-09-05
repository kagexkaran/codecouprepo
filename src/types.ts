export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Special';

export interface Card {
  id: string;
  name: string;
  category: 'male' | 'female' | 'special';
  rarity: Rarity;
  description: string;
  imageUrl?: string;
  price: number;
  options?: string[];
}

export type HistoryEventType = 'use' | 'purchase' | 'trade' | 'completed';

export interface HistoryItem {
  id: string;
  type: HistoryEventType;
  cardId: string;
  cardName: string;
  cardCategory?: 'male' | 'female' | 'special';
  cardRarity?: Rarity;
  timestamp: number;
  userName: string;
  details?: string;
  selectedOptions?: string[];
}

export interface GiftItem {
  id: string;
  cardId: string;
  fromName: string;
  timestamp: number;
}

export interface ActiveCard {
  id: string;
  cardId: string;
  expiresAt: number;
  startedAt?: number;
  usedBy: string;
  usedByUserId: string;
  completed?: boolean;
  completedAt?: number;
  selectedOptions?: string[];
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
  giftInbox?: GiftItem[];
  shopLastRefreshTime?: number;
  shopAvailableCards?: string[];
  shopPurchasesToday?: number;
  shopPurchasedCards?: string[];
  dailyLoginCount?: number;
  dailyLoginLastClaim?: number;
  dailyStreak?: number;
  partnerId?: string | null;
  partnerEmail?: string | null;
  partnerName?: string | null;
  partnerGender?: 'male' | 'female';
  partnerStreak?: number;
  history?: HistoryItem[];
}

export interface PairRequest {
  id: string;
  fromUserId: string;
  fromEmail: string;
  fromName: string;
  fromGender?: 'male' | 'female';
  fromCode: string;
  toUserId: string;
  toEmail: string;
  toName: string;
  toCode: string;
  status: 'searching' | 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: number;
}

export type Tab = 'dashboard' | 'collection' | 'shop' | 'settings' | 'couple';
