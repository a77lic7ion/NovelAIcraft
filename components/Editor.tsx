
import React, { useState, useEffect, useRef } from 'react';
import { Project, Scene, PromptLog } from '../types';
import { callAI } from '../aiService';

interface EditorProps {
  project: Project;
  sceneId: string | null;
  onUpdate: (project: Project) => void;
  onBack: () => void;
  history: PromptLog[];
  onPromptUse: (text: string) => void;
}

const Editor: React.FC<EditorProps> = ({ project, sceneId, onUpdate, onBack, history, onPromptUse }) => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [localContent, setLocalContent] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSynopsis, setIsGeneratingSynopsis] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const syncTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const s = project.acts.flatMap(a => a.scenes).find(s => s.id === sceneId);
    if (s && (!scene || s.id !== scene.id)) {
      setScene(s);
      setLocalContent(s.content);
    }
  }, [sceneId, project]);

  const debouncedSync = (content: string, updates: Partial<Scene> = {}) => {
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = window.setTimeout(() => {
      if (!scene) return;
      const wordCount = content.trim() ? content.split(/\s+/).length : 0;
      const updatedScene = { ...scene, content, wordCount, ...updates };
      const updatedActs = project.acts.map(act => ({
        ...act,
        scenes: act.scenes.map(s => s.id === scene.id ? updatedScene : s)
      }));
      onUpdate({ ...project, acts: updatedActs, lastEdited: Date.now() });
    }, 500);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setLocalContent(text);
    debouncedSync(text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && scene) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        debouncedSync(localContent, { image: base64 });
        setScene({ ...scene, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSceneTitleOrSynopsis = (updates: Partial<Scene>) => {
    if (!scene) return;
    const newScene = { ...scene, ...updates };
    setScene(newScene);
    const updatedActs = project.acts.map(act => ({
      ...act,
      scenes: act.scenes.map(s => s.id === scene.id ? newScene : s)
    }));
    onUpdate({ ...project, acts: updatedActs, lastEdited: Date.now() });
  };

  const handleAiDraft = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setError('');
    onPromptUse(aiPrompt);
    try {
      const draft = await callAI(
        `Draft the following for my scene: ${aiPrompt}`,
        `Context: ${localContent.slice(-1000)}`
      );
      if (draft) {
        const newContent = localContent + '\n\n' + draft;
        setLocalContent(newContent);
        debouncedSync(newContent);
        setShowAiModal(false);
        setAiPrompt('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!scene) return <div className="p-8 text-gray-500">Loading scene...</div>;

  const currentWordCount = localContent.trim() ? localContent.split(/\s+/).length : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative">
      <header className="h-16 flex items-center justify-between px-6 border-b border-border-dark bg-surface-dark/95 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-surface-hover text-gray-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="h-5 w-px bg-border-dark"></div>
          <span className="text-white font-medium text-sm">{scene.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark text-gray-400 hover:text-white rounded-lg font-bold text-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>Illustration</span>
          </button>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
          <button onClick={() => setShowAiModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg font-bold text-sm">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>AI Assist</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto py-20 px-8 flex flex-col gap-10">
          <input 
            className="bg-transparent text-5xl font-black text-white border-none focus:ring-0 p-0 w-full tracking-tight"
            value={scene.title}
            onChange={(e) => saveSceneTitleOrSynopsis({ title: e.target.value })}
            placeholder="Scene Title"
          />

          {/* Scene Illustration - Resized for Print Context */}
          {scene.image && (
            <div className="w-full relative group">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-3xl shadow-2xl">
                <img src={scene.image} alt="Scene Illustration" className="w-full h-auto rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 shadow-inner" />
                <div className="mt-4 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] px-2">
                  <span>Plate No. {scene.id.slice(0, 4)}</span>
                  <button onClick={() => { debouncedSync(localContent, { image: undefined }); setScene({...scene, image: undefined}); }} className="hover:text-red-500 transition-colors">Remove Plate</button>
                </div>
              </div>
            </div>
          )}

          <textarea 
            className="w-full bg-surface-dark border border-border-dark rounded-2xl px-5 py-4 text-sm text-gray-400 focus:ring-1 focus:ring-primary/40 resize-none font-medium italic"
            value={scene.synopsis}
            onChange={(e) => saveSceneTitleOrSynopsis({ synopsis: e.target.value })}
            placeholder="One sentence synopsis..."
            rows={1}
          />

          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-xl text-zinc-300 leading-relaxed font-serif min-h-[600px] resize-none"
            value={localContent}
            onChange={handleContentChange}
            placeholder="Write your story..."
          />
        </div>
      </div>

      <footer className="h-12 border-t border-border-dark bg-surface-dark px-6 flex items-center justify-between shrink-0 text-[10px] font-bold uppercase text-gray-500">
        <span>{currentWordCount} Words</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span>Studio Active</span>
        </div>
      </footer>

      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-surface-dark border border-border-dark rounded-[2.5rem] p-10 w-full max-w-2xl">
            <h3 className="text-2xl font-bold text-white mb-8">AI Assistant</h3>
            <textarea 
              className="w-full bg-black border border-border-dark rounded-2xl p-6 text-white text-lg focus:ring-1 focus:ring-primary min-h-[160px]"
              placeholder="Describe the draft turn..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <div className="flex gap-4 mt-8">
              <button 
                onClick={handleAiDraft}
                disabled={isGenerating || !aiPrompt.trim()}
                className="flex-1 bg-primary disabled:bg-zinc-800 text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3"
              >
                {isGenerating ? 'Synthesizing...' : 'Generate Draft'}
              </button>
              <button onClick={() => setShowAiModal(false)} className="px-8 bg-zinc-900 text-white rounded-2xl font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
