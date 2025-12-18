
import React, { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingEntry) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingEntry({ ...editingEntry, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanManuscript = async () => {
    setIsScanning(true);
    const allContent = project.acts.flatMap(act => act.scenes.map(s => s.content)).join('\n\n');
    const existingChars = project.codex.filter(e => e.type === 'Character').map(e => `${e.name} (${e.isLocked ? 'LOCKED' : 'OPEN'})`).join(', ');

    try {
      const prompt = `Analyze the following manuscript and identify all characters.
      Update details for existing characters if they are NOT locked.
      Discover new characters and provide their role, traits, and background.
      Return ONLY a JSON array of objects with keys: name, role, traits, background, age, appearance.
      
      Existing characters: ${existingChars}
      Manuscript content:
      ${allContent.slice(0, 15000)}`;

      const systemInstruction = "You are a literary analyst. Return valid JSON only. If a character is marked LOCKED in the list provided, do not suggest updates for them, but you can still mention them in the context of others.";

      const result = await callAI(prompt, systemInstruction);
      const cleanedResult = result.replace(/```json|```/g, '').trim();
      const extracted = JSON.parse(cleanedResult);

      let updatedCodex = [...project.codex];
      
      extracted.forEach((char: any) => {
        const existing = updatedCodex.find(e => e.name.toLowerCase() === char.name.toLowerCase() && e.type === 'Character');
        
        if (existing) {
          if (!existing.isLocked) {
            const index = updatedCodex.indexOf(existing);
            updatedCodex[index] = {
              ...existing,
              description: char.role || existing.description,
              details: `Age: ${char.age}\nAppearance: ${char.appearance}\nBackground: ${char.background}`,
              notes: `Traits: ${char.traits}`
            };
          }
        } else {
          updatedCodex.push({
            id: Math.random().toString(36).substr(2, 9),
            name: char.name,
            type: 'Character',
            description: char.role || '',
            details: `Age: ${char.age || '?'}\nAppearance: ${char.appearance || '?'}\nBackground: ${char.background || '?'}`,
            notes: `Traits: ${char.traits || '?'}`,
            isLocked: false
          });
        }
      });

      onUpdate({ ...project, codex: updatedCodex });
      alert("Laboratory Scan Complete. World context updated.");
    } catch (error) {
      console.error("Scan error:", error);
      alert("AI Scan failed. Check connection or project size.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualImport = () => {
    if (!importText.trim()) return;

    const lines = importText.split('\n').filter(l => l.trim());
    const name = lines[0].trim();
    const data: Record<string, string> = {};
    
    let currentKey = 'Notes';
    lines.slice(1).forEach(line => {
      const match = line.match(/^([^:]+):(.*)$/);
      if (match) {
        currentKey = match[1].trim();
        data[currentKey] = (data[currentKey] || '') + match[2].trim();
      } else {
        data[currentKey] = (data[currentKey] || '') + '\n' + line.trim();
      }
    });

    const newEntry: CodexEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      type: 'Character',
      description: data['Role'] || '',
      details: `Age: ${data['Age'] || 'Unknown'}\nAppearance: ${data['Appearance'] || 'Unknown'}\nPersonality: ${data['Personality'] || 'Unknown'}\nBackground: ${data['Background'] || 'Unknown'}`,
      notes: `Character Arc: ${data['Character Arc'] || 'None'}\n\nRelationships:\n${data['Key Relationships'] || 'None'}\n\nNotable Traits:\n${data['Notable Traits'] || 'None'}`,
      isLocked: true // Default to locked for manual imports as they are high quality
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
                className="flex items-center gap-2 h-9 px-4 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition-all disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-sm ${isScanning ? 'animate-spin' : ''}`}>
                  {isScanning ? 'sync' : 'psychology'}
                </span>
                {isScanning ? 'Scanning...' : 'Scan Lab'}
              </button>
              <button 
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-full border border-border-dark bg-surface-dark text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">input</span>
                Import Character
              </button>
            </div>
          </div>
          <button onClick={handleAdd} className="h-10 px-6 rounded-full bg-primary text-black font-bold text-sm shadow-lg shadow-primary/20">
            New Entry
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          <div className="flex gap-2 pb-4 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === cat ? 'bg-primary text-black' : 'bg-surface-dark text-gray-500 border border-border-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 pb-24">
            {filteredEntries.map(entry => (
              <div 
                key={entry.id}
                onClick={() => setEditingEntry(entry)}
                className={`group flex flex-col bg-surface-dark border rounded-3xl overflow-hidden hover:border-primary/40 transition-all cursor-pointer relative ${
                  entry.isLocked ? 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)]' : 'border-border-dark'
                }`}
              >
                <div className="aspect-[4/3] bg-black relative overflow-hidden">
                  {entry.image ? (
                    <img src={entry.image} alt={entry.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-800">
                      <span className="material-symbols-outlined text-6xl">person_outline</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {entry.isLocked && (
                      <div className="bg-blue-500 text-white p-1.5 rounded-lg shadow-lg">
                        <span className="material-symbols-outlined text-sm">lock</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">{entry.type}</span>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{entry.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{entry.description || 'No summary available.'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingEntry && (
        <aside className="w-[500px] border-l border-border-dark bg-surface-dark flex flex-col shrink-0 z-[100] animate-in slide-in-from-right duration-300">
          <div className="h-[72px] flex items-center justify-between px-8 border-b border-border-dark bg-surface-dark/95 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => toggleLock(e, editingEntry.id)}
                className={`p-2 rounded-lg transition-all ${editingEntry.isLocked ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-white'}`}
              >
                <span className="material-symbols-outlined">{editingEntry.isLocked ? 'lock' : 'lock_open'}</span>
              </button>
              <h3 className="font-bold text-white uppercase tracking-widest text-xs">Laboratory File</h3>
            </div>
            <button onClick={() => setEditingEntry(null)} className="text-gray-500 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-10">
            {/* Image Section */}
            <div className="space-y-4">
              <div 
                className="aspect-square bg-black border-2 border-dashed border-border-dark rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary/40 transition-all relative group"
                onClick={() => fileInputRef.current?.click()}
              >
                {editingEntry.image ? (
                  <>
                    <img src={editingEntry.image} alt="Portrait" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white font-bold text-sm uppercase">Change Illustration</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-zinc-700 mb-2">add_photo_alternate</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Set Portrait</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest">Resize for print: Automatic 1:1 Aspect</p>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="space-y-6">
              <div>
                <input 
                  className="w-full bg-transparent border-none text-4xl font-black text-white focus:ring-0 p-0 mb-2"
                  value={editingEntry.name}
                  onChange={(e) => setEditingEntry({...editingEntry, name: e.target.value})}
                  placeholder="Subject Name"
                />
                <select 
                  className="bg-black text-primary border-border-dark rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest"
                  value={editingEntry.type}
                  onChange={(e) => setEditingEntry({...editingEntry, type: e.target.value as any})}
                >
                  <option>Character</option>
                  <option>Location</option>
                  <option>Item</option>
                  <option>Lore</option>
                </select>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Role & Purpose</label>
                  <textarea 
                    className="w-full bg-black border border-border-dark rounded-2xl p-5 text-sm text-white focus:ring-1 focus:ring-primary/40 resize-none"
                    rows={2}
                    value={editingEntry.description}
                    onChange={(e) => setEditingEntry({...editingEntry, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Vital Details (Age, Appearance, etc.)</label>
                  <textarea 
                    className="w-full bg-black border border-border-dark rounded-2xl p-5 text-sm text-gray-300 focus:ring-1 focus:ring-primary/40 leading-relaxed font-serif"
                    rows={6}
                    value={editingEntry.details}
                    onChange={(e) => setEditingEntry({...editingEntry, details: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Laboratory Notes & Arcs</label>
                  <textarea 
                    className="w-full bg-black border border-border-dark rounded-2xl p-5 text-sm text-gray-400 focus:ring-1 focus:ring-primary/40 leading-relaxed italic"
                    rows={6}
                    value={editingEntry.notes}
                    onChange={(e) => setEditingEntry({...editingEntry, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={saveEntry}
              className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-xl shadow-primary/10 transition-all active:scale-[0.98]"
            >
              COMMIT TO LABORATORY
            </button>
          </div>
        </aside>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-surface-dark border border-border-dark rounded-[3rem] p-12 shadow-[0_0_100px_rgba(43,238,121,0.05)]">
            <h2 className="text-3xl font-black text-white mb-2">Character Protocol Import</h2>
            <p className="text-gray-500 text-sm mb-8">Paste your structured data. The system will auto-parse fields like Role, Age, and Arc.</p>
            
            <textarea 
              className="w-full h-96 bg-black border border-border-dark rounded-3xl p-8 text-white text-sm focus:ring-1 focus:ring-primary font-mono leading-relaxed"
              placeholder="Name&#10;Role: Protagonist&#10;Age: 22&#10;Character Arc: Starts weak, ends strong...&#10;Key Relationships: ..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />

            <div className="flex gap-4 mt-10">
              <button 
                onClick={handleManualImport}
                disabled={!importText.trim()}
                className="flex-1 bg-primary disabled:bg-zinc-800 text-black font-black py-4 rounded-2xl shadow-lg transition-all"
              >
                INITIALIZE SUBJECT
              </button>
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-8 bg-zinc-900 text-white font-bold rounded-2xl"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Codex;
