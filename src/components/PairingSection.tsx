import React, { useState } from 'react';
import { User, PairRequest } from '../types';
import { 
  Heart, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  X, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Unlink, 
  Flame,
  Loader2
} from 'lucide-react';
import { retroAudio } from '../lib/audio';
import { PROFILE_AVATARS } from '../data';

interface PairingSectionProps {
  user: User;
  incomingRequests: PairRequest[];
  outgoingRequest: PairRequest | null;
  onSendPairRequest: (targetCode: string) => Promise<{ success: boolean; message: string }>;
  onAcceptPairRequest: (requestId: string) => Promise<void>;
  onDeclinePairRequest: (requestId: string) => Promise<void>;
  onCancelPairRequest: (requestId: string) => Promise<void>;
  onUnpair: () => Promise<void>;
  onOpenAuth?: () => void;
  compact?: boolean;
}

export const PairingSection: React.FC<PairingSectionProps> = ({
  user,
  incomingRequests,
  outgoingRequest,
  onSendPairRequest,
  onAcceptPairRequest,
  onDeclinePairRequest,
  onCancelPairRequest,
  onUnpair,
  onOpenAuth,
  compact = false,
}) => {
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showUnpairConfirm, setShowUnpairConfirm] = useState(false);

  const handleCopyCode = () => {
    if (!user.pairingCode) return;
    navigator.clipboard.writeText(user.pairingCode);
    retroAudio.playButtonClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = partnerCodeInput.trim().toUpperCase();
    if (!code) {
      retroAudio.playError();
      setStatusMessage({ type: 'error', text: 'Please enter a valid pairing code.' });
      return;
    }

    if (!user.email) {
      retroAudio.playError();
      setStatusMessage({ type: 'error', text: 'Please connect your email before pairing.' });
      return;
    }

    if (code === user.pairingCode?.toUpperCase()) {
      retroAudio.playError();
      setStatusMessage({ type: 'error', text: 'You cannot pair with your own code!' });
      return;
    }

    setSending(true);
    setStatusMessage(null);

    try {
      const result = await onSendPairRequest(code);
      if (result.success) {
        retroAudio.playPairSuccess();
        setStatusMessage({ type: 'success', text: result.message });
        setPartnerCodeInput('');
      } else {
        retroAudio.playError();
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      retroAudio.playError();
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to send pair request.' });
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (reqId: string) => {
    setRespondingId(reqId);
    try {
      await onAcceptPairRequest(reqId);
      setStatusMessage({ type: 'success', text: 'Pair request accepted! You are now connected.' });
    } catch (err: any) {
      retroAudio.playError();
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to accept request.' });
    } finally {
      setRespondingId(null);
    }
  };

  const handleDecline = async (reqId: string) => {
    setRespondingId(reqId);
    try {
      await onDeclinePairRequest(reqId);
      setStatusMessage({ type: 'info', text: 'Pair request declined.' });
    } catch (err: any) {
      retroAudio.playError();
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to decline request.' });
    } finally {
      setRespondingId(null);
    }
  };

  const handleCancel = async (reqId: string) => {
    setRespondingId(reqId);
    try {
      await onCancelPairRequest(reqId);
      setStatusMessage({ type: 'info', text: 'Pair request cancelled.' });
    } catch (err: any) {
      retroAudio.playError();
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to cancel request.' });
    } finally {
      setRespondingId(null);
    }
  };

  const handleUnpairClick = async () => {
    setShowUnpairConfirm(false);
    try {
      await onUnpair();
      setStatusMessage({ type: 'info', text: 'Unlinked partner connection. A fresh pairing code was generated.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to unlink.' });
    }
  };

  // Case 1: User is not connected via email
  if (!user.email) {
    return (
      <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-8 h-8 text-pink-400" />
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-pink-400">Real User Pairing</h2>
        </div>

        <div className="bg-amber-950/40 border-4 border-amber-500 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-black uppercase text-sm sm:text-base">Email Connection Required</p>
              <p className="text-gray-300 text-xs sm:text-sm mt-1 leading-relaxed">
                To pair with a real partner and synchronize decks in real-time, both users must be connected with email. 
                This provides each user with a unique, one-time verified pairing code in Supabase.
              </p>
            </div>
          </div>

          {onOpenAuth && (
            <button
              onClick={() => {
                retroAudio.playButtonClick();
                onOpenAuth();
              }}
              className="w-full py-3 bg-pink-500 text-black border-4 border-black font-black uppercase shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail size={16} />
              Connect Email / Sign In
            </button>
          )}
        </div>
      </div>
    );
  }

  // Case 2: User is already paired
  if (user.partnerCode) {
    const partnerAvatar = user.partnerGender === 'female' ? PROFILE_AVATARS.female : PROFILE_AVATARS.male;
    
    return (
      <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-green-400">Pairing Active</h2>
          </div>
          <span className="text-xs font-black uppercase px-2.5 py-1 bg-emerald-950/80 text-emerald-400 border-2 border-emerald-500 shadow-[2px_2px_0_rgba(0,0,0,1)]">
            ● SYNCED IN SUPABASE
          </span>
        </div>

        <div className="bg-black border-4 border-black p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border-4 border-black bg-purple-900 overflow-hidden shrink-0 shadow-[2px_2px_0_rgba(0,0,0,1)]">
                {user.partnerGender ? (
                  <img 
                    src={partnerAvatar} 
                    alt={user.partnerName || 'Partner'} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-pink-400 font-black text-2xl">
                    ♥
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xl font-black uppercase text-white">
                    {user.partnerName || 'Paired Partner'}
                  </p>
                  {user.partnerGender && (
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                      user.partnerGender === 'female' ? 'bg-pink-400 text-black' : 'bg-blue-400 text-black'
                    }`}>
                      {user.partnerGender} Deck
                    </span>
                  )}
                </div>
                {user.partnerEmail && (
                  <p className="text-xs font-mono text-gray-400 flex items-center gap-1 mt-0.5">
                    <Mail size={12} /> {user.partnerEmail}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs font-mono text-gray-400">
                  <span>Partner Code: <strong className="text-green-400">{user.partnerCode}</strong></span>
                  {user.partnerStreak !== undefined && (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Flame size={12} className="fill-amber-400" />
                      {user.partnerStreak}d Streak
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowUnpairConfirm(true)}
              className="px-3 py-2 bg-red-950/80 text-red-300 border-2 border-red-600 hover:bg-red-900 text-xs font-black uppercase shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 cursor-pointer self-end sm:self-auto"
            >
              <Unlink size={14} />
              Unlink Partner
            </button>
          </div>

          <p className="text-xs uppercase text-gray-400 border-t border-white/10 pt-3">
            Deck sharing and daily bonuses are synchronized. Actions taken on cards reflect between both users.
          </p>
        </div>

        {/* Unpair Confirmation Dialog */}
        {showUnpairConfirm && (
          <div className="mt-4 p-4 bg-red-950/90 border-4 border-red-500 space-y-3 animate-in fade-in">
            <p className="text-white font-black uppercase text-sm">
              Are you sure you want to unlink from {user.partnerName || 'your partner'}?
            </p>
            <p className="text-gray-300 text-xs">
              Both players will be unlinked, and a fresh one-time pairing code will be generated for your next partner.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowUnpairConfirm(false)}
                className="px-4 py-1.5 bg-gray-700 text-white font-black uppercase text-xs border-2 border-black"
              >
                Cancel
              </button>
              <button
                onClick={handleUnpairClick}
                className="px-4 py-1.5 bg-red-500 text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]"
              >
                Confirm Unlink
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Case 3: User is connected with email, but not yet paired
  return (
    <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-pink-400">Couple Pairing</h2>
        <span className="text-[10px] font-black uppercase px-2 py-1 bg-blue-950/80 text-blue-400 border border-blue-500 flex items-center gap-1">
          <ShieldCheck size={12} /> Email Verified
        </span>
      </div>

      {/* Notification / Feedback Banner */}
      {statusMessage && (
        <div className={`p-3 border-2 text-xs font-black uppercase flex items-start gap-2 animate-in fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' 
            : statusMessage.type === 'error'
            ? 'bg-red-950/80 border-red-500 text-red-300'
            : 'bg-blue-950/80 border-blue-500 text-blue-300'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* INCOMING PAIR REQUESTS (Highest Priority - Prominent Attention) */}
      {incomingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase text-amber-400 flex items-center gap-1.5 animate-pulse">
            <Sparkles size={16} /> Incoming Pair Request ({incomingRequests.length})
          </h3>
          
          {incomingRequests.map((req) => (
            <div 
              key={req.id} 
              className="p-4 bg-gradient-to-r from-amber-950/80 to-purple-950/80 border-4 border-amber-400 shadow-[4px_4px_0_rgba(0,0,0,1)] space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border-2 border-black bg-black overflow-hidden shrink-0">
                    {req.fromGender ? (
                      <img 
                        src={req.fromGender === 'female' ? PROFILE_AVATARS.female : PROFILE_AVATARS.male} 
                        alt={req.fromName} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-pink-400 font-bold">?</div>
                    )}
                  </div>

                  <div>
                    <p className="text-base font-black uppercase text-white">
                      {req.fromName} wants to pair!
                    </p>
                    <p className="text-xs font-mono text-gray-300 flex items-center gap-1">
                      <Mail size={12} /> {req.fromEmail}
                    </p>
                    <p className="text-[11px] text-amber-300 uppercase font-mono mt-0.5">
                      Code: {req.fromCode} • Deck: {req.fromGender || 'starter'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-200 leading-relaxed">
                Accepting will link your accounts, synchronize your card dex, and activate daily login streaks!
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={respondingId === req.id}
                  className="flex-1 py-2.5 bg-[#4ade80] text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {respondingId === req.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserCheck size={16} />
                  )}
                  Accept Pair
                </button>

                <button
                  onClick={() => handleDecline(req.id)}
                  disabled={respondingId === req.id}
                  className="px-4 py-2.5 bg-red-600 text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X size={16} />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OUTGOING REQUEST PENDING (If user already sent a request to someone) */}
      {outgoingRequest && (
        <div className="p-4 bg-purple-950/60 border-4 border-purple-500 shadow-[4px_4px_0_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400 animate-spin" />
              <h3 className="text-sm font-black uppercase text-purple-300">Pair Request Pending</h3>
            </div>
            <span className="text-[10px] font-black uppercase bg-purple-900 px-2 py-0.5 border border-purple-400 text-purple-200">
              WAITING FOR PARTNER
            </span>
          </div>

          <div className="bg-black/60 p-3 border-2 border-purple-800 space-y-1">
            <p className="text-white text-xs font-bold uppercase">
              Sent to: <strong className="text-purple-300">{outgoingRequest.toName}</strong> ({outgoingRequest.toEmail})
            </p>
            <p className="text-gray-400 text-xs font-mono">
              Target Code: <span className="text-purple-400">{outgoingRequest.toCode}</span>
            </p>
            <p className="text-[11px] text-gray-400 italic">
              Once they open Couple-Dex and tap Accept, your accounts will pair automatically.
            </p>
          </div>

          <button
            onClick={() => handleCancel(outgoingRequest.id)}
            disabled={respondingId === outgoingRequest.id}
            className="w-full py-2 bg-gray-800 text-gray-300 hover:text-white border-2 border-black text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {respondingId === outgoingRequest.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
            Cancel Pair Request
          </button>
        </div>
      )}

      {/* YOUR UNIQUE ONE-TIME PAIRING CODE */}
      <div className="bg-black border-4 border-black p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 uppercase font-black text-xs">Your Unique Pairing Code</span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-500">
            ONE-TIME UNIQUE CODE
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 bg-[#1a1a2e] p-3 border-2 border-white/20">
          <span className="text-2xl sm:text-3xl font-mono font-black text-pink-400 tracking-wider select-all">
            {user.pairingCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 bg-pink-500 text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <p className="text-[11px] text-gray-400 leading-relaxed">
          Share this code with your real partner. When they enter it in their app, you will receive an incoming request here to accept!
        </p>
      </div>

      {/* ENTER PARTNER'S CODE (Only if not already waiting on an outgoing request) */}
      {!outgoingRequest && (
        <form onSubmit={handleSend} className="space-y-3">
          <span className="text-gray-400 uppercase font-black text-xs block">
            Enter Partner's Pairing Code
          </span>
          
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="ENTER CP-XXXXX..." 
              value={partnerCodeInput}
              onChange={(e) => setPartnerCodeInput(e.target.value.toUpperCase())}
              disabled={sending}
              className="flex-1 bg-black border-4 border-black p-3 text-white placeholder-gray-600 focus:outline-none uppercase font-bold font-mono tracking-wider w-full min-w-0 text-base sm:text-lg"
            />
            <button 
              type="submit"
              disabled={sending || !partnerCodeInput.trim()}
              className="px-6 py-3 bg-[#4ade80] text-black border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span>Send Request</span>
            </button>
          </div>
          <p className="text-[11px] text-gray-400 italic">
            Enter your partner's code to send them a pair request. They can review and accept from their device.
          </p>
        </form>
      )}

    </div>
  );
};
