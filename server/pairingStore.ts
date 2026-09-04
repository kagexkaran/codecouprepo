import fs from 'fs';
import path from 'path';

export interface UserRecord {
  userId: string;
  email: string;
  name: string;
  gender?: 'male' | 'female';
  pairingCode: string;
  partnerId?: string | null;
  partnerCode?: string | null;
  partnerEmail?: string | null;
  partnerName?: string | null;
  partnerGender?: 'male' | 'female';
  partnerStreak?: number;
  dailyStreak?: number;
  connectedAt?: number | null;
  activeCards?: any[];
  history?: any[];
  updatedAt: number;
}

export interface PairRequestRecord {
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
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: number;
  respondedAt?: number | null;
}

interface DatabaseData {
  users: Record<string, UserRecord>; // keyed by userId
  requests: Record<string, PairRequestRecord>; // keyed by requestId
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pairing_db.json');

class PairingStore {
  private data: DatabaseData = { users: {}, requests: {} };
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('PairingStore init fallback to in-memory:', err);
    }
    this.initialized = true;
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('PairingStore save error:', err);
    }
  }

  public generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit easily confused chars (I, O, 0, 1)
    let code = '';
    let attempts = 0;
    do {
      let segment = '';
      for (let i = 0; i < 5; i++) {
        segment += chars[Math.floor(Math.random() * chars.length)];
      }
      code = `CP-${segment}`;
      attempts++;
    } while (this.findUserByCode(code) && attempts < 100);
    return code;
  }

  public findUserById(userId: string): UserRecord | undefined {
    return this.data.users[userId];
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    const lower = email.trim().toLowerCase();
    return Object.values(this.data.users).find(u => u.email?.toLowerCase() === lower);
  }

  public findUserByCode(code: string): UserRecord | undefined {
    const trimmed = code.trim().toUpperCase();
    return Object.values(this.data.users).find(u => u.pairingCode?.toUpperCase() === trimmed);
  }

  public registerUser(profile: {
    userId: string;
    email: string;
    name: string;
    gender?: 'male' | 'female';
    pairingCode?: string;
    dailyStreak?: number;
    activeCards?: any[];
    history?: any[];
  }): UserRecord {
    const existing = this.data.users[profile.userId] || this.findUserByEmail(profile.email);
    
    // Assign or preserve unique pairing code
    let code = existing?.pairingCode;
    if (!code || code.startsWith('P1-')) {
      code = profile.pairingCode && !profile.pairingCode.startsWith('P1-') 
        ? profile.pairingCode.trim().toUpperCase() 
        : this.generateUniqueCode();
    }

    const record: UserRecord = {
      ...existing,
      userId: profile.userId,
      email: profile.email.trim().toLowerCase(),
      name: profile.name || existing?.name || profile.email.split('@')[0],
      gender: profile.gender || existing?.gender,
      pairingCode: code,
      partnerId: existing?.partnerId || null,
      partnerCode: existing?.partnerCode || null,
      partnerEmail: existing?.partnerEmail || null,
      partnerName: existing?.partnerName || null,
      partnerGender: existing?.partnerGender,
      partnerStreak: existing?.partnerStreak,
      dailyStreak: typeof profile.dailyStreak === 'number' ? profile.dailyStreak : existing?.dailyStreak || 0,
      connectedAt: existing?.connectedAt || null,
      activeCards: profile.activeCards || existing?.activeCards || [],
      history: profile.history || existing?.history || [],
      updatedAt: Date.now(),
    };

    this.data.users[profile.userId] = record;
    this.save();
    return record;
  }

  public createPairRequest(fromUserId: string, targetCode: string): { 
    success: boolean; 
    message: string; 
    request?: PairRequestRecord 
  } {
    const fromUser = this.findUserById(fromUserId);
    if (!fromUser || !fromUser.email) {
      return { success: false, message: 'You must connect with your email before pairing.' };
    }

    if (fromUser.partnerId) {
      return { success: false, message: 'You are already paired with a partner. Unpair first to link with someone else.' };
    }

    const trimmedCode = targetCode.trim().toUpperCase();
    const targetUser = this.findUserByCode(trimmedCode);

    if (!targetUser) {
      return { 
        success: false, 
        message: 'No active user found with that pairing code. Please make sure your partner is logged in with email.' 
      };
    }

    if (targetUser.userId === fromUser.userId || targetUser.email.toLowerCase() === fromUser.email.toLowerCase()) {
      return { success: false, message: 'You cannot pair with your own code!' };
    }

    if (targetUser.partnerId) {
      return { success: false, message: 'This user is already paired with another partner.' };
    }

    // Check if there is already a pending request from targetUser to fromUser
    const reverseReq = Object.values(this.data.requests).find(
      r => r.fromUserId === targetUser.userId && r.toUserId === fromUser.userId && r.status === 'pending'
    );
    if (reverseReq) {
      // Auto-accept reciprocal pairing!
      return this.acceptPairRequest(reverseReq.id, fromUser.userId);
    }

    // Check if user already sent a pending request to targetUser
    const existingReq = Object.values(this.data.requests).find(
      r => r.fromUserId === fromUser.userId && r.toUserId === targetUser.userId && r.status === 'pending'
    );
    if (existingReq) {
      return { 
        success: true, 
        message: `Pair request is already pending for ${targetUser.name} (${targetUser.email}).`,
        request: existingReq
      };
    }

    // Cancel any previous pending requests sent by fromUser
    Object.values(this.data.requests).forEach(r => {
      if (r.fromUserId === fromUser.userId && r.status === 'pending') {
        r.status = 'cancelled';
        r.respondedAt = Date.now();
      }
    });

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newRequest: PairRequestRecord = {
      id: requestId,
      fromUserId: fromUser.userId,
      fromEmail: fromUser.email,
      fromName: fromUser.name,
      fromGender: fromUser.gender,
      fromCode: fromUser.pairingCode,
      toUserId: targetUser.userId,
      toEmail: targetUser.email,
      toName: targetUser.name,
      toCode: targetUser.pairingCode,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.data.requests[requestId] = newRequest;
    this.save();

    return { 
      success: true, 
      message: `Pair request sent to ${targetUser.name} (${targetUser.email})! Waiting for them to accept.`, 
      request: newRequest 
    };
  }

  public getStatus(userId: string): {
    user: UserRecord | null;
    isPaired: boolean;
    partner: UserRecord | null;
    incomingRequests: PairRequestRecord[];
    outgoingRequest: PairRequestRecord | null;
  } {
    const user = this.findUserById(userId);
    if (!user) {
      return {
        user: null,
        isPaired: false,
        partner: null,
        incomingRequests: [],
        outgoingRequest: null,
      };
    }

    let partner: UserRecord | null = null;
    if (user.partnerId) {
      partner = this.findUserById(user.partnerId) || null;
      if (partner) {
        // Keep partner's latest details in sync
        user.partnerName = partner.name;
        user.partnerEmail = partner.email;
        user.partnerGender = partner.gender;
        user.partnerStreak = partner.dailyStreak;
        user.partnerCode = partner.pairingCode;
      }
    }

    const incomingRequests = Object.values(this.data.requests).filter(
      r => (r.toUserId === userId || (user.email && r.toEmail.toLowerCase() === user.email.toLowerCase())) && r.status === 'pending'
    );

    const outgoingRequest = Object.values(this.data.requests).find(
      r => r.fromUserId === userId && r.status === 'pending'
    ) || null;

    return {
      user,
      isPaired: Boolean(user.partnerId),
      partner,
      incomingRequests,
      outgoingRequest,
    };
  }

  public acceptPairRequest(requestId: string, userId: string): { 
    success: boolean; 
    message: string; 
    partner?: UserRecord 
  } {
    const req = this.data.requests[requestId];
    if (!req) {
      return { success: false, message: 'Pair request not found.' };
    }

    if (req.toUserId !== userId && req.fromUserId !== userId) {
      // Check email match
      const currentUser = this.findUserById(userId);
      if (!currentUser || currentUser.email.toLowerCase() !== req.toEmail.toLowerCase()) {
        return { success: false, message: 'You are not authorized to respond to this request.' };
      }
    }

    const userA = this.findUserById(req.fromUserId);
    const userB = this.findUserById(req.toUserId);

    if (!userA || !userB) {
      return { success: false, message: 'One of the users is no longer available.' };
    }

    const now = Date.now();
    req.status = 'accepted';
    req.respondedAt = now;

    // Link userA and userB
    userA.partnerId = userB.userId;
    userA.partnerCode = userB.pairingCode;
    userA.partnerEmail = userB.email;
    userA.partnerName = userB.name;
    userA.partnerGender = userB.gender;
    userA.partnerStreak = userB.dailyStreak;
    userA.connectedAt = now;
    userA.updatedAt = now;

    userB.partnerId = userA.userId;
    userB.partnerCode = userA.pairingCode;
    userB.partnerEmail = userA.email;
    userB.partnerName = userA.name;
    userB.partnerGender = userA.gender;
    userB.partnerStreak = userA.dailyStreak;
    userB.connectedAt = now;
    userB.updatedAt = now;

    // Cancel any remaining pending requests for both users
    Object.values(this.data.requests).forEach(r => {
      if (r.id !== requestId && (r.fromUserId === userA.userId || r.fromUserId === userB.userId || r.toUserId === userA.userId || r.toUserId === userB.userId)) {
        if (r.status === 'pending') {
          r.status = 'cancelled';
          r.respondedAt = now;
        }
      }
    });

    this.save();

    const partnerRecord = userId === userA.userId ? userB : userA;
    return {
      success: true,
      message: `Successfully paired with ${partnerRecord.name} (${partnerRecord.email})!`,
      partner: partnerRecord,
    };
  }

  public declinePairRequest(requestId: string, userId: string): { success: boolean; message: string } {
    const req = this.data.requests[requestId];
    if (!req) {
      return { success: false, message: 'Pair request not found.' };
    }

    req.status = 'declined';
    req.respondedAt = Date.now();
    this.save();

    return { success: true, message: 'Pair request declined.' };
  }

  public cancelPairRequest(requestId: string, userId: string): { success: boolean; message: string } {
    const req = this.data.requests[requestId];
    if (!req) {
      return { success: false, message: 'Pair request not found.' };
    }

    if (req.fromUserId !== userId) {
      return { success: false, message: 'You cannot cancel a request you did not send.' };
    }

    req.status = 'cancelled';
    req.respondedAt = Date.now();
    this.save();

    return { success: true, message: 'Pair request cancelled.' };
  }

  public unpairUser(userId: string): { success: boolean; message: string } {
    const user = this.findUserById(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const partnerId = user.partnerId;
    user.partnerId = null;
    user.partnerCode = null;
    user.partnerEmail = null;
    user.partnerName = null;
    user.partnerGender = undefined;
    user.partnerStreak = undefined;
    user.connectedAt = null;
    // Generate a fresh unique one-time pairing code for security
    user.pairingCode = this.generateUniqueCode();
    user.updatedAt = Date.now();

    if (partnerId) {
      const partner = this.findUserById(partnerId);
      if (partner) {
        partner.partnerId = null;
        partner.partnerCode = null;
        partner.partnerEmail = null;
        partner.partnerName = null;
        partner.partnerGender = undefined;
        partner.partnerStreak = undefined;
        partner.connectedAt = null;
        partner.pairingCode = this.generateUniqueCode();
        partner.updatedAt = Date.now();
      }
    }

    this.save();
    return { success: true, message: 'Successfully unlinked partner connection.' };
  }

  public syncActivity(userId: string, data: {
    activeCards?: any[];
    history?: any[];
    dailyStreak?: number;
    coins?: number;
  }): {
    success: boolean;
    partnerData?: {
      activeCards?: any[];
      history?: any[];
      dailyStreak?: number;
      name?: string;
      email?: string;
      gender?: 'male' | 'female';
    };
  } {
    const user = this.findUserById(userId);
    if (!user) {
      return { success: false };
    }

    if (data.activeCards) user.activeCards = data.activeCards;
    if (data.history) user.history = data.history;
    if (typeof data.dailyStreak === 'number') user.dailyStreak = data.dailyStreak;
    user.updatedAt = Date.now();

    let partnerData;
    if (user.partnerId) {
      const partner = this.findUserById(user.partnerId);
      if (partner) {
        partnerData = {
          activeCards: partner.activeCards || [],
          history: partner.history || [],
          dailyStreak: partner.dailyStreak || 0,
          name: partner.name,
          email: partner.email,
          gender: partner.gender,
        };
      }
    }

    this.save();
    return { success: true, partnerData };
  }
}

export const pairingStore = new PairingStore();
