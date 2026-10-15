import React, { useState } from 'react';
import { User } from '../types';
import { LogOut, Settings as SettingsIcon, Database, Save, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
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
    <div className="flex flex-col w-full max-w-[800px] mx-auto gap-6 pb-20 relative">
      {/* HEADER PANEL */}
      <div className="pixel-panel p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-gray-400 to-gray-600">
        <h2 className="text-3xl font-black uppercase text-white" style={{textShadow: "2px 2px 0 #000"}}>SETTINGS</h2>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="flex items-center pixel-border-sm bg-white rounded p-1.5 gap-2">
            <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_rgba(0,0,0,1)] text-white font-black">
              <SettingsIcon size={16} />
            </div>
            <span className="font-vt323 text-xl font-bold text-black px-2">SYSTEM</span>
          </div>
        </div>
      </div>

      <div className="pixel-panel p-6 bg-white space-y-8">
        
        {/* Profile Settings */}
        <section className="space-y-4">
          <h3 className="text-xl font-black uppercase text-black border-b-4 border-dashed border-black pb-2">Profile</h3>
          <form onSubmit={handleSaveName} className="flex gap-4">
            <input 
              type="text" 
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-gray-100 border-4 border-black px-4 py-2 font-black uppercase text-black focus:outline-none focus:border-blue-500"
              placeholder="YOUR NAME"
              maxLength={16}
            />
            <button 
              type="submit"
              className="px-6 py-2 bg-green-500 text-white border-4 border-black font-black uppercase shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all flex items-center gap-2"
            >
              <Save size={18} />
              SAVE
            </button>
          </form>
          {savedSuccess && (
            <p className="text-green-600 font-black uppercase text-sm flex items-center gap-1">
              <CheckCircle2 size={16} />
              Saved successfully
            </p>
          )}
        </section>

        {/* Audio Settings */}
        <section className="space-y-4">
          <h3 className="text-xl font-black uppercase text-black border-b-4 border-dashed border-black pb-2">Audio</h3>
          <button 
            onClick={handleToggleSound}
            className={`px-6 py-3 border-4 border-black font-black uppercase flex items-center gap-3 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all ${
              isMuted ? 'bg-red-500 text-white' : 'bg-cyan-400 text-black'
            }`}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            {isMuted ? 'SOUND: OFF' : 'SOUND: ON'}
          </button>
        </section>

        {/* System & Connection Status */}
        <section className="space-y-4">
          <h3 className="text-xl font-black uppercase text-black border-b-4 border-dashed border-black pb-2">System</h3>
          <div className="bg-gray-100 border-4 border-black p-4 text-sm font-vt323 space-y-2">
            <p className="text-gray-500 font-bold">CLOUD_SYNC: <span className="text-green-600 font-black">ONLINE (SUPABASE)</span></p>
            <p className="text-gray-500 font-bold">ASSETS: <span className="text-black">CDN / CLOUD STORAGE</span></p>
            <p className="text-gray-500 font-bold">APP_VERSION: <span className="text-black">1.1.0</span></p>
            <p className="text-gray-500 font-bold">PAIRING_CODE: <span className="text-black">{user.pairingCode}</span></p>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4 pt-8">
          <h3 className="text-xl font-black uppercase text-red-500 border-b-4 border-dashed border-red-500 pb-2">Danger Zone</h3>
          <div className="flex flex-col gap-4 sm:flex-row">
            <button 
              onClick={() => {
                retroAudio.playError();
                if(window.confirm('Are you sure you want to sign out?')) onLogout();
              }}
              className="flex-1 px-6 py-3 bg-black text-white border-4 border-black font-black uppercase shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              SIGN OUT
            </button>
            <button 
              onClick={() => {
                retroAudio.playError();
                if(window.confirm('WARNING: This will permanently delete your account data. Proceed?')) onResetData();
              }}
              className="flex-1 px-6 py-3 bg-red-600 text-white border-4 border-black font-black uppercase shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Database size={18} />
              DELETE ACCOUNT
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};