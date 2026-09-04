import { User, PairRequest } from '../types';

export interface PairingStatusResponse {
  user: any;
  isPaired: boolean;
  partner: any | null;
  incomingRequests: PairRequest[];
  outgoingRequest: PairRequest | null;
}

export async function registerWithPairingDatabase(user: User): Promise<{
  success: boolean;
  record?: any;
  status?: PairingStatusResponse;
  error?: string;
}> {
  if (!user.email) {
    return { success: false, error: 'Email is required for real pairing synchronization.' };
  }

  try {
    const res = await fetch('/api/pair/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        gender: user.gender,
        pairingCode: user.pairingCode,
        dailyStreak: user.dailyStreak,
        activeCards: user.activeCards,
        history: user.history,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('registerWithPairingDatabase failed:', err);
    return { success: false, error: err?.message || 'Network error connecting to pairing service' };
  }
}

export async function fetchPairingStatus(userId: string): Promise<PairingStatusResponse | null> {
  if (!userId) return null;
  try {
    const res = await fetch(`/api/pair/status?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('fetchPairingStatus failed:', err);
    return null;
  }
}

export async function sendPairRequest(fromUserId: string, targetCode: string): Promise<{
  success: boolean;
  message: string;
  request?: PairRequest;
  status?: PairingStatusResponse;
}> {
  try {
    const res = await fetch('/api/pair/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromUserId, targetCode }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error sending pair request.' };
  }
}

export async function acceptPairRequest(requestId: string, userId: string): Promise<{
  success: boolean;
  message: string;
  partner?: any;
  status?: PairingStatusResponse;
}> {
  try {
    const res = await fetch('/api/pair/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error accepting pair request.' };
  }
}

export async function declinePairRequest(requestId: string, userId: string): Promise<{
  success: boolean;
  message: string;
  status?: PairingStatusResponse;
}> {
  try {
    const res = await fetch('/api/pair/decline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error declining request.' };
  }
}

export async function cancelPairRequest(requestId: string, userId: string): Promise<{
  success: boolean;
  message: string;
  status?: PairingStatusResponse;
}> {
  try {
    const res = await fetch('/api/pair/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error cancelling request.' };
  }
}

export async function unpairPartners(userId: string): Promise<{
  success: boolean;
  message: string;
  status?: PairingStatusResponse;
}> {
  try {
    const res = await fetch('/api/pair/unpair', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error unpairing.' };
  }
}

export async function syncActivityData(userId: string, data: {
  activeCards?: any[];
  history?: any[];
  dailyStreak?: number;
  coins?: number;
}): Promise<{
  success: boolean;
  partnerData?: any;
}> {
  try {
    const res = await fetch('/api/pair/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false };
  }
}
