import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

export const SUPABASE_PROJECT_ID = 'jprlwyfffibucbebkebp';
export const SUPABASE_URL = 
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) || 
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_ANON_KEY = 
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || 
  'sb_publishable_A_8tsUu3xob5Q4wQNNcp0A_dJFnLirA';

export const BUCKET_NAME = 'codecoup';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Returns the public URL for a card image stored in Supabase bucket 'codecoup'
 * Folder: 'malecards' or 'femalecards'
 */
export function getCardImageUrl(category: 'male' | 'female', filename: string): string {
  const folder = category === 'male' ? 'malecards' : 'femalecards';
  const encodedFilename = encodeURIComponent(filename);
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${folder}/${encodedFilename}`);
  return data?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${folder}/${encodedFilename}`;
}

/**
 * Synchronize user game data to Supabase (Auth user metadata + profiles table if present)
 */
export async function syncUserDataToSupabase(user: User): Promise<boolean> {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return false;
    }

    // 1. Always update Supabase Auth user metadata (guaranteed persistence without DDL tables)
    await supabase.auth.updateUser({
      data: {
        username: user.name,
        name: user.name,
        gender: user.gender,
        pairingCode: user.pairingCode,
        partnerId: user.partnerId,
        partnerCode: user.partnerCode,
        partnerEmail: user.partnerEmail,
        partnerName: user.partnerName,
        partnerGender: user.partnerGender,
        partnerStreak: user.partnerStreak,
        coins: user.coins,
        collection: user.collection,
        connectedAt: user.connectedAt,
        activeCards: user.activeCards,
        shopLastRefreshTime: user.shopLastRefreshTime,
        shopAvailableCards: user.shopAvailableCards,
        shopPurchasesToday: user.shopPurchasesToday,
        shopPurchasedCards: user.shopPurchasedCards,
        dailyLoginCount: user.dailyLoginCount,
        dailyLoginLastClaim: user.dailyLoginLastClaim,
        dailyStreak: user.dailyStreak,
        history: user.history,
      },
    });

    // 2. Also optionally sync to a profiles or user_data table if the user has created it in SQL
    try {
      await supabase.from('profiles').upsert({
        id: authUser.id,
        email: authUser.email,
        username: user.name,
        gender: user.gender,
        pairing_code: user.pairingCode,
        partner_id: user.partnerId,
        partner_code: user.partnerCode,
        partner_email: user.partnerEmail,
        partner_name: user.partnerName,
        partner_gender: user.partnerGender,
        partner_streak: user.partnerStreak,
        coins: user.coins,
        collection: user.collection,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Ignore if profiles table is not yet created in PostgreSQL
    }

    return true;
  } catch (err) {
    console.warn('Failed to sync user data to Supabase:', err);
    return false;
  }
}

/**
 * Load user state from Supabase auth session and metadata
 */
export function extractUserFromAuth(authUser: any, fallbackPairingCode: string): User {
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email,
    name: meta.username || meta.name || '',
    gender: meta.gender,
    pairingCode: meta.pairingCode || fallbackPairingCode,
    partnerId: meta.partnerId || null,
    partnerCode: meta.partnerCode || null,
    partnerEmail: meta.partnerEmail || null,
    partnerName: meta.partnerName || null,
    partnerGender: meta.partnerGender || undefined,
    partnerStreak: typeof meta.partnerStreak === 'number' ? meta.partnerStreak : 0,
    coins: typeof meta.coins === 'number' ? meta.coins : 500,
    collection: meta.collection || {},
    connectedAt: meta.connectedAt,
    activeCards: meta.activeCards || [],
    shopLastRefreshTime: meta.shopLastRefreshTime,
    shopAvailableCards: meta.shopAvailableCards,
    shopPurchasesToday: meta.shopPurchasesToday,
    shopPurchasedCards: meta.shopPurchasedCards,
    dailyLoginCount: meta.dailyLoginCount,
    dailyLoginLastClaim: meta.dailyLoginLastClaim,
    dailyStreak: typeof meta.dailyStreak === 'number' ? meta.dailyStreak : 0,
    history: meta.history || [],
  };
}
