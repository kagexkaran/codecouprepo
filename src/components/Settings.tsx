import React, { useState } from 'react';
import { User } from '../types';
import { LogOut, Database, Save, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { SUPABASE_PROJECT_ID, BUCKET_NAME } from '../lib/supabase';
import { retroAudio } from '../lib/audio';

interface SettingsProps {
  user: User;
  onUpdateUsername: (newName: string) => void;
  onResetData: () => void;
  onUnpair: () => void;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  user, 
  onUpdateUsername, 
  onResetData, 
  onUnpair, 
  onLogout 
}) => {
  const [nameInput, setNameInput] = useState(user.name);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(retroAudio.getMuted());

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      retroAudio.playButtonClick();
      onUpdateUsername(nameInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } else {
      retroAudio.playError();
    }
  };

  const handleToggleSound = () => {
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      retroAudio.playPurchase();
    }
  };

  return (
    <div className="p-6 bg-[#333344] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl mx-auto">
      <h2 className="text-4xl font-black uppercase mb-8 text-white border-b-4 border-black pb-4">System Config</h2>
      
      <div className="space-y-8">
        {/* Retro 8-Bit Sound Settings */}
        <div className="bg-[#1a1a2e] border-4 border-black p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isMuted ? <VolumeX className="text-red-400" size={24} /> : <Volume2 className="text-yellow-400 animate-pulse" size={24} />}
            <div>
              <p className="text-white font-black uppercase text-sm">8-Bit Retro Sound Effects</p>
              <p className="text-gray-400 text-xs font-bold uppercase">
                {isMuted ? 'Muted (Audio Off)' : 'Active (Chiptune Synthesizer ON)'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleSound}
            className={`px-4 py-2 border-2 border-black font-black uppercase text-xs transition-all cursor-pointer ${
              isMuted
                ? 'bg-gray-600 text-white hover:bg-gray-500'
                : 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-[2px_2px_0_rgba(0,0,0,1)]'
            }`}
          >
            {isMuted ? 'UNMUTE' : 'MUTE'}
          </button>
        </div>

        {/* Supabase Connection Details */}
        <div className="bg-[#1a1a2e] border-4 border-black p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-sm">
            <Database size={18} />
            <span>Supabase Cloud Integration</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-black/40 p-2 border border-black">
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Project ID:</span>
              <span className="text-white font-bold">{SUPABASE_PROJECT_ID}</span>
            </div>
            <div className="bg-black/40 p-2 border border-black">
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Storage Bucket:</span>
              <span className="text-white font-bold">{BUCKET_NAME}</span>
            </div>
            {user.email && (
              <div className="bg-black/40 p-2 border border-black sm:col-span-2">
                <span className="text-gray-400 block uppercase font-bold text-[10px]">Logged In Email:</span>
                <span className="text-yellow-400 font-bold">{user.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Username Edit Form */}
        <form onSubmit={handleSaveName} className="flex flex-col">
          <label className="uppercase font-black text-xs mb-2 text-gray-400">Account Username</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={nameInput} 
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-[#1a1a2e] border-4 border-black p-3 font-bold text-white focus:outline-none focus:border-yellow-400 uppercase"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#4ade80] text-black font-black uppercase border-4 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-1 cursor-pointer"
            >
              <Save size={16} />
              Save
            </button>
          </div>
          {savedSuccess && (
            <p className="text-emerald-400 text-xs font-bold uppercase mt-2 flex items-center gap-1">
              <CheckCircle2 size={14} /> Username updated and synced to Supabase!
            </p>
          )}
        </form>

        {/* Partnership Status */}
        <div className="flex flex-col">
          <label className="uppercase font-black text-xs mb-2 text-gray-400">Partnership Status</label>
          <div className="bg-[#1a1a2e] border-4 border-black p-4 flex justify-between items-center">
            <span className={`font-black uppercase ${user.partnerCode ? 'text-green-400' : 'text-yellow-400'}`}>
              {user.partnerCode ? `PAIRED: ${user.partnerCode}` : 'UNPAIRED'}
            </span>
            {user.partnerCode && (
              <button 
                onClick={() => {
                  retroAudio.playButtonClick();
                  onUnpair();
                }}
                className="px-4 py-2 bg-red-600 text-black font-black uppercase border-2 border-black hover:bg-red-500 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                Unlink
              </button>
            )}
          </div>
        </div>

        {/* Logout & Reset Buttons */}
        <div className="pt-6 border-t-4 border-black space-y-4">
          <button 
            onClick={() => {
              retroAudio.playButtonClick();
              onLogout();
            }}
            className="w-full py-3 bg-yellow-400 text-black border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={18} />
            Log Out of Supabase
          </button>

          <button 
            onClick={() => {
              retroAudio.playButtonClick();
              onResetData();
            }}
            className="w-full py-3 bg-red-600 text-black border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
          >
            Purge Memory (Reset Local Data)
          </button>
        </div>
      </div>
    </div>
  );
};
