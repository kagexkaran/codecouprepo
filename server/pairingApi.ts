import { Router, Request, Response } from 'express';
import { pairingStore } from './pairingStore';

const router = Router();

// Register user in pairing store with their email & profile
router.post('/register', (req: Request, res: Response) => {
  try {
    const { userId, email, name, gender, pairingCode, dailyStreak, activeCards, history } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required to register for pairing.' });
    }

    const record = pairingStore.registerUser({
      userId,
      email,
      name,
      gender,
      pairingCode,
      dailyStreak,
      activeCards,
      history,
    });

    const status = pairingStore.getStatus(userId);
    return res.json({ success: true, record, status });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to register user.' });
  }
});

// Check pairing status, incoming requests, and outgoing requests
router.get('/status', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required.' });
    }

    const status = pairingStore.getStatus(userId);
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to fetch pairing status.' });
  }
});

// Send a pairing request by targetCode
router.post('/request', (req: Request, res: Response) => {
  try {
    const { fromUserId, targetCode } = req.body;
    if (!fromUserId || !targetCode) {
      return res.status(400).json({ error: 'fromUserId and targetCode are required.' });
    }

    const result = pairingStore.createPairRequest(fromUserId, targetCode);
    if (!result.success) {
      return res.status(400).json(result);
    }

    const status = pairingStore.getStatus(fromUserId);
    return res.json({ ...result, status });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to create pair request.' });
  }
});

// Accept incoming pair request
router.post('/accept', (req: Request, res: Response) => {
  try {
    const { requestId, userId } = req.body;
    if (!requestId || !userId) {
      return res.status(400).json({ error: 'requestId and userId are required.' });
    }

    const result = pairingStore.acceptPairRequest(requestId, userId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    const status = pairingStore.getStatus(userId);
    return res.json({ ...result, status });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to accept pair request.' });
  }
});

// Decline incoming pair request
router.post('/decline', (req: Request, res: Response) => {
  try {
    const { requestId, userId } = req.body;
    if (!requestId || !userId) {
      return res.status(400).json({ error: 'requestId and userId are required.' });
    }

    const result = pairingStore.declinePairRequest(requestId, userId);
    const status = pairingStore.getStatus(userId);
    return res.json({ ...result, status });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to decline pair request.' });
  }
});

// Cancel outgoing pair request
router.post('/cancel', (req: Request, res: Response) => {
  try {
    const { requestId, userId } = req.body;
    if (!requestId || !userId) {
      return res.status(400).json({ error: 'requestId and userId are required.' });
    }

    const result = pairingStore.cancelPairRequest(requestId, userId);
    const status = pairingStore.getStatus(userId);
    return res.json({ ...result, status });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to cancel pair request.' });
  }
});

// Unpair partners
router.post('/unpair', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const result = pairingStore.unpairUser(userId);
    const status = pairingStore.getStatus(userId);
    return res.json({ ...result, status });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to unpair.' });
  }
});

// Sync activity between paired partners (active cards, history, streak)
router.post('/sync', (req: Request, res: Response) => {
  try {
    const { userId, activeCards, history, dailyStreak, coins } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    const result = pairingStore.syncActivity(userId, { activeCards, history, dailyStreak, coins });
    const status = pairingStore.getStatus(userId);
    return res.json({ ...result, status });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to sync partner activity.' });
  }
});

export default router;
