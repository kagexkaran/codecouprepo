import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, Library, ShoppingCart, Settings as SettingsIcon, Heart } from 'lucide-react';
import { retroAudio } from '../lib/audio';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  hasPartner: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, hasPartner }) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'dashboard', label: 'HOME', icon: <LayoutDashboard size={16} className="text-green-500 fill-current" />, color: 'bg-green-100' },
    { id: 'shop', label: 'SHOP', icon: <ShoppingCart size={16} className="text-yellow-500 fill-current" />, color: 'bg-yellow-100' },
    ...(hasPartner ? [{ id: 'couple', label: 'COUPLE', icon: <Heart size={16} className="text-red-500 fill-current" />, color: 'bg-red-100' } as { id: Tab; label: string; icon: React.ReactNode; color: string }] : []),
    { id: 'collection', label: 'COLLECTION', icon: <Library size={16} className="text-purple-500 fill-current" />, color: 'bg-purple-100' },
    { id: 'settings', label: 'SETTINGS', icon: <SettingsIcon size={16} className="text-blue-500 fill-current" />, color: 'bg-blue-100' },
  ];

  const handleTabClick = (tabId: Tab) => {
    retroAudio.playTabSwitch();
    onTabChange(tabId);
  };

  return (
    <nav className="flex items-center">
      <div className="flex flex-wrap sm:flex-nowrap gap-2">
        {tabs.map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 border-[3px] border-black font-bold uppercase transition-all cursor-pointer text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${isActive ? "bg-gray-200 shadow-none translate-y-0.5" : "bg-[#f5f5f5]"}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
