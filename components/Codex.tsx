
import React, { useState } from 'react';
import { Project, CodexEntry } from '../types';

interface CodexProps {
  project: Project;
  onUpdate: (p: Project) => void;
}

const Codex: React.FC<CodexProps> = ({ project, onUpdate }) => {
  const [filter, setFilter] = useState<string>('All');
  const [editingEntry, setEditingEntry] = useState<CodexEntry | null>(null);

  const categories = ['All', 'Character', 'Location', 'Item', 'Lore'];
  const filteredEntries = filter === 'All' ? project.codex : project.codex.filter(e => e.type === filter);

  const handleAdd = () => {
    const newEntry: CodexEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Entry',
      type: 'Character',
      description: '',
      details: '',
      notes: ''
    };
    setEditingEntry(newEntry);
  };

  const saveEntry = () => {
    if (!editingEntry) return;
    const exists = project.codex.find(e => e.id === editingEntry.id);
    const newCodex = exists 
      ? project.codex.map(e => e.id === editingEntry.id ? editingEntry : e)
      : [...project.codex, editingEntry];
    
    onUpdate({ ...project, codex: newCodex });
    setEditingEntry(null);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-black h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] flex items-center justify-between px-6 border-b border-border-dark shrink-0">
          <h2 className="text-white text-xl font-bold tracking-tight">Codex</h2>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-primary hover:bg-primary-dark text-black font-bold text-sm transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">add</span>
            New Entry
          </button>
        </header>

        <div className="p-6">
          <div className="flex gap-2 overflow-x-auto pb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === cat ? 'bg-primary text-black' : 'bg-surface-dark text-gray-500 border border-border-dark hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredEntries.map(entry => (
              <div 
                key={entry.id}
                onClick={() => setEditingEntry(entry)}
                className="p-5 bg-surface-dark border border-border-dark rounded-xl hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{entry.type}</span>
                  <span className="material-symbols-outlined text-gray-700 text-sm">visibility</span>
                </div>
                <h3 className="text-white font-bold mb-1 group-hover:text-primary transition-colors">{entry.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{entry.description || 'No description provided.'}</p>
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-40">
                <span className="material-symbols-outlined text-4xl mb-2">library_books</span>
                <p>Codex is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingEntry && (
        <aside className="w-[400px] border-l border-border-dark bg-surface-darker flex flex-col shrink-0 z-10 shadow-2xl overflow-y-auto">
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-border-dark sticky top-0 bg-surface-dark/95 backdrop-blur z-20">
            <span className="text-gray-500 text-sm font-medium">Edit Entry</span>
            <button onClick={() => setEditingEntry(null)} className="text-gray-500 hover:text-white"><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="flex gap-4 items-center">
              <div className="size-16 rounded-2xl bg-surface-dark border border-border-dark flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">auto_awesome</span>
              </div>
              <input 
                className="flex-1 bg-transparent border-none text-2xl font-bold text-white focus:ring-0" 
                value={editingEntry.name}
                onChange={(e) => setEditingEntry({...editingEntry, name: e.target.value})}
              />
            </div>
            
            <select 
              className="w-full bg-surface-dark border-border-dark rounded-xl text-white text-sm"
              value={editingEntry.type}
              onChange={(e) => setEditingEntry({...editingEntry, type: e.target.value as any})}
            >
              <option>Character</option>
              <option>Location</option>
              <option>Item</option>
              <option>Lore</option>
            </select>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Description</label>
                <textarea 
                  className="w-full bg-surface-dark border-border-dark rounded-xl p-3 text-sm text-white focus:ring-primary/50" 
                  rows={3}
                  value={editingEntry.description}
                  onChange={(e) => setEditingEntry({...editingEntry, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Details</label>
                <textarea 
                  className="w-full bg-surface-dark border-border-dark rounded-xl p-3 text-sm text-white focus:ring-primary/50" 
                  rows={4}
                  value={editingEntry.details}
                  onChange={(e) => setEditingEntry({...editingEntry, details: e.target.value})}
                />
              </div>
            </div>

            <button 
              onClick={saveEntry}
              className="mt-4 bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors"
            >
              Save Changes
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default Codex;
