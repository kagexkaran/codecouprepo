import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, Library, ShoppingCart, Settings as SettingsIcon, Heart } from 'lucide-react';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
  hasPartner: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, hasPartner }) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard size={18} />, color: 'bg-pink-600' },
    ...(hasPartner ? [{ id: 'couple', label: 'COUPLE', icon: <Heart size={18} />, color: 'bg-red-400' } as { id: Tab; label: string; icon: React.ReactNode; color: string }] : []),
    { id: 'collection', label: 'COLLECTION', icon: <Library size={18} />, color: 'bg-purple-600' },
    { id: 'shop', label: 'SHOP', icon: <ShoppingCart size={18} />, color: 'bg-red-600' },
    { id: 'settings', label: 'SETTINGS', icon: <SettingsIcon size={18} />, color: 'bg-gray-600' },
  ];

  return (
    <nav className="w-full flex justify-center sticky top-0 z-40 mb-8 px-4">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-4 border-black font-bold uppercase transition-all ${
                isActive ? 'bg-[#4ade80] text-black shadow-none translate-y-1' : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none'
              }`}
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
