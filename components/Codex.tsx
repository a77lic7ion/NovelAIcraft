
import React, { useState } from 'react';
import { Project, CodexEntry } from '../types';
import { callAI } from '../aiService';

interface CodexProps {
  project: Project;
  onUpdate: (p: Project) => void;
}

const Codex: React.FC<CodexProps> = ({ project, onUpdate }) => {
  const [filter, setFilter] = useState<string>('All');
  const [editingEntry, setEditingEntry] = useState<CodexEntry | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const categories = ['All', 'Character', 'Location', 'Item', 'Lore'];
  const filteredEntries = filter === 'All' ? project.codex : project.codex.filter(e => e.type === filter);

  const handleAdd = () => {
    const newEntry: CodexEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Entry',
      type: 'Character',
      description: '',
      details: '',
      notes: '',
      isLocked: false
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

  const toggleLock = (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    const updatedCodex = project.codex.map(entry => 
      entry.id === entryId ? { ...entry, isLocked: !entry.isLocked } : entry
    );
    onUpdate({ ...project, codex: updatedCodex });
  };

  const handleScanManuscript = async () => {
    setIsScanning(true);
    const allContent = project.acts.flatMap(act => act.scenes.map(s => s.content)).join('\n\n');
    const existingChars = project.codex.filter(e => e.type === 'Character').map(e => e.name).join(', ');

    try {
      const prompt = `Based on the following manuscript content, identify all characters. For each character, provide their Role, Age, Appearance, Personality, and notable traits. 
      Format your response as a valid JSON array of objects with the following keys: name, role, age, appearance, personality, background, traits.
      Current manuscript content:
      ${allContent.slice(0, 15000)}
      
      Existing characters known: ${existingChars}`;

      const systemInstruction = "You are a literary analyst. Extract precise character data from prose. Return ONLY a JSON array of objects. Do not include markdown code blocks, just the raw JSON.";

      const result = await callAI(prompt, systemInstruction);
      const cleanedResult = result.replace(/```json|```/g, '').trim();
      const extractedCharacters = JSON.parse(cleanedResult);

      let updatedCodex = [...project.codex];
      
      extractedCharacters.forEach((char: any) => {
        const existing = updatedCodex.find(e => e.name.toLowerCase() === char.name.toLowerCase() && e.type === 'Character');
        
        if (existing) {
          if (!existing.isLocked) {
            // Update existing entry
            const index = updatedCodex.indexOf(existing);
            updatedCodex[index] = {
              ...existing,
              description: char.role || existing.description,
              details: `Age: ${char.age || 'Unknown'}\nAppearance: ${char.appearance || 'Unknown'}\nPersonality: ${char.personality || 'Unknown'}\nBackground: ${char.background || 'Unknown'}`,
              notes: `Traits: ${char.traits || 'None'}`
            };
          }
        } else {
          // Add new entry
          updatedCodex.push({
            id: Math.random().toString(36).substr(2, 9),
            name: char.name,
            type: 'Character',
            description: char.role || '',
            details: `Age: ${char.age || 'Unknown'}\nAppearance: ${char.appearance || 'Unknown'}\nPersonality: ${char.personality || 'Unknown'}\nBackground: ${char.background || 'Unknown'}`,
            notes: `Traits: ${char.traits || 'None'}`,
            isLocked: false
          });
        }
      });

      onUpdate({ ...project, codex: updatedCodex });
      alert(`Scan complete. Analyzed ${extractedCharacters.length} characters.`);
    } catch (error) {
      console.error("Scan failed:", error);
      alert("AI Scan failed. Please check your AI configuration or manuscript size.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n');
    const name = lines[0].trim();
    const data: Record<string, string> = {};
    
    let currentKey = '';
    lines.slice(1).forEach(line => {
      const match = line.match(/^([^:]+):(.*)$/);
      if (match) {
        currentKey = match[1].trim();
        data[currentKey] = match[2].trim();
      } else if (currentKey) {
        data[currentKey] += '\n' + line.trim();
      }
    });

    const newEntry: CodexEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      type: 'Character',
      description: data['Role'] || '',
      details: Object.entries(data)
        .filter(([k]) => ['Age', 'Appearance', 'Personality', 'Background', 'Character Arc'].includes(k))
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n'),
      notes: Object.entries(data)
        .filter(([k]) => !['Role', 'Age', 'Appearance', 'Personality', 'Background', 'Character Arc'].includes(k))
        .map(([k, v]) => `${k}:\n${v}`)
        .join('\n\n'),
      isLocked: false
    };

    onUpdate({ ...project, codex: [...project.codex, newEntry] });
    setImportText('');
    setShowImportModal(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-black h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] flex items-center justify-between px-6 border-b border-border-dark shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-xl font-bold tracking-tight">Codex</h2>
            <div className="h-4 w-px bg-border-dark"></div>
            <div className="flex gap-2">
              <button 
                onClick={handleScanManuscript}
                disabled={isScanning}
                className={`flex items-center gap-2 h-9 px-4 rounded-full border transition-all text-xs font-bold uppercase tracking-widest ${
                  isScanning ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                }`}
              >
                <span className={`material-symbols-outlined text-sm ${isScanning ? 'animate-spin' : ''}`}>
                  {isScanning ? 'sync' : 'psychology'}
                </span>
                {isScanning ? 'Analyzing...' : 'Scan Laboratory'}
              </button>
              <button 
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-full border border-border-dark bg-surface-dark text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">input</span>
                Manual Import
              </button>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-primary hover:bg-primary-dark text-black font-bold text-sm transition-all shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined">add</span>
            New Entry
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div className="flex gap-2 overflow-x-auto pb-4 sticky top-0 bg-black z-10">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pb-20">
            {filteredEntries.map(entry => (
              <div 
                key={entry.id}
                onClick={() => setEditingEntry(entry)}
                className={`p-5 bg-surface-dark border rounded-xl hover:border-primary/40 transition-all cursor-pointer group relative ${
                  entry.isLocked ? 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : 'border-border-dark'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${entry.isLocked ? 'text-blue-400' : 'text-primary'}`}>
                      {entry.type}
                    </span>
                    {entry.isLocked && (
                      <span className="material-symbols-outlined text-[14px] text-blue-500" title="Locked from AI updates">lock</span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => toggleLock(e, entry.id)}
                    className={`p-1 rounded-md transition-colors ${entry.isLocked ? 'text-blue-500 hover:bg-blue-500/10' : 'text-gray-700 hover:text-white hover:bg-white/5'}`}
                    title={entry.isLocked ? "Unlock for AI updates" : "Lock from AI updates"}
                  >
                    <span className="material-symbols-outlined text-sm">{entry.isLocked ? 'lock' : 'lock_open'}</span>
                  </button>
                </div>
                <h3 className="text-white font-bold mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                  {entry.name}
                </h3>
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
        <aside className="w-[450px] border-l border-border-dark bg-surface-dark flex flex-col shrink-0 z-[60] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="h-[72px] flex items-center justify-between px-6 border-b border-border-dark sticky top-0 bg-surface-dark/95 backdrop-blur z-20">
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => toggleLock(e, editingEntry.id)}
                className={`size-8 rounded-lg flex items-center justify-center transition-all ${
                  editingEntry.isLocked ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500 hover:text-white'
                }`}
                title={editingEntry.isLocked ? "Unlock entry" : "Lock entry"}
              >
                <span className="material-symbols-outlined text-base">{editingEntry.isLocked ? 'lock' : 'lock_open'}</span>
              </button>
              <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">Laboratory File</span>
            </div>
            <button onClick={() => setEditingEntry(null)} className="text-gray-500 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-8 flex flex-col gap-8">
            <div className="flex gap-6 items-start">
              <div className="size-20 rounded-[1.5rem] bg-black border border-border-dark flex items-center justify-center text-primary shadow-xl">
                <span className="material-symbols-outlined text-4xl">
                  {editingEntry.type === 'Character' ? 'person' : editingEntry.type === 'Location' ? 'location_on' : 'category'}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <input 
                  className="w-full bg-transparent border-none text-3xl font-black text-white focus:ring-0 p-0 tracking-tight" 
                  value={editingEntry.name}
                  onChange={(e) => setEditingEntry({...editingEntry, name: e.target.value})}
                  placeholder="Entry Name"
                />
                <select 
                  className="bg-black border-border-dark rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary focus:ring-primary/50"
                  value={editingEntry.type}
                  onChange={(e) => setEditingEntry({...editingEntry, type: e.target.value as any})}
                >
                  <option>Character</option>
                  <option>Location</option>
                  <option>Item</option>
                  <option>Lore</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3 px-1">Role / Description</label>
                <textarea 
                  className="w-full bg-black border border-border-dark rounded-2xl p-4 text-sm text-white focus:ring-1 focus:ring-primary/50 transition-all resize-none" 
                  rows={2}
                  value={editingEntry.description}
                  onChange={(e) => setEditingEntry({...editingEntry, description: e.target.value})}
                  placeholder="Primary role in the story..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3 px-1">Vital Details (Age, Appearance, etc.)</label>
                <textarea 
                  className="w-full bg-black border border-border-dark rounded-2xl p-4 text-sm text-gray-300 focus:ring-1 focus:ring-primary/50 transition-all font-serif leading-relaxed" 
                  rows={6}
                  value={editingEntry.details}
                  onChange={(e) => setEditingEntry({...editingEntry, details: e.target.value})}
                  placeholder="Physical description and life history..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-3 px-1">Laboratory Notes</label>
                <textarea 
                  className="w-full bg-black border border-border-dark rounded-2xl p-4 text-sm text-gray-400 focus:ring-1 focus:ring-primary/50 transition-all italic" 
                  rows={5}
                  value={editingEntry.notes}
                  onChange={(e) => setEditingEntry({...editingEntry, notes: e.target.value})}
                  placeholder="Relationships, traits, and arcs..."
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={saveEntry}
                className="flex-1 bg-primary text-black font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
              >
                Commit Changes
              </button>
              <button 
                onClick={() => setEditingEntry(null)}
                className="px-6 bg-surface-hover text-white rounded-2xl font-bold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </aside>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-surface-dark border border-border-dark rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(43,238,121,0.05)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">file_import</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Manual Character Import</h2>
                  <p className="text-gray-500 text-xs">Paste your structured character data below.</p>
                </div>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-gray-500 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <textarea 
              className="w-full h-80 bg-black border border-border-dark rounded-2xl p-6 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono leading-relaxed overflow-y-auto"
              placeholder="Name&#10;Role: Protagonist&#10;Age: 22&#10;Appearance: Tall, dark hair...&#10;Notable Traits: Determined..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />

            <div className="flex gap-4 mt-8">
              <button 
                onClick={handleManualImport}
                disabled={!importText.trim()}
                className="flex-1 bg-primary disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/10"
              >
                Initialize Character
              </button>
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-8 bg-surface-hover border border-border-dark text-white font-bold rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Codex;
