
import React from 'react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  projectName?: string;
  userName: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, projectName, userName, onLogout }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
    { id: View.MANUSCRIPT, label: 'Manuscript', icon: 'menu_book' },
    { id: View.WORKSHOP, label: 'Workshop Chat', icon: 'auto_awesome' },
    { id: View.CODEX, label: 'Codex', icon: 'book_2' },
    { id: View.REVIEW, label: 'Review', icon: 'bar_chart' },
    { id: View.SETTINGS, label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="w-20 lg:w-64 flex flex-col justify-between border-r border-border-dark bg-[#050505] p-4 shrink-0 transition-all duration-300 z-50">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-full flex items-center justify-center text-black shrink-0 shadow-lg shadow-primary/10">
            <span className="material-symbols-outlined font-bold">edit_note</span>
          </div>
          <div className="hidden lg:flex flex-col overflow-hidden">
            <h1 className="text-white text-base font-bold truncate">NovelAIcraft</h1>
            <p className="text-gray-500 text-[10px] truncate uppercase tracking-widest">{projectName || 'No Project Selected'}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                currentView === item.id 
                  ? 'bg-surface-hover text-white border border-border-dark ring-1 ring-white/5' 
                  : 'text-gray-500 hover:text-white hover:bg-surface-hover'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${currentView === item.id ? 'text-primary' : ''}`}>
                {item.icon}
              </span>
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <div className="hidden lg:flex p-3 rounded-lg bg-surface-dark border border-border-dark items-center gap-3 group transition-all">
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-bold text-white truncate">{userName}</span>
            <span className="text-[10px] text-gray-500">Premium Author</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all group"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="hidden lg:block text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
