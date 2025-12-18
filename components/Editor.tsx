
import React, { useState, useEffect } from 'react';
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
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = project.acts.flatMap(a => a.scenes).find(s => s.id === sceneId);
    if (s) setScene(s);
  }, [sceneId, project]);

  const saveScene = (updates: Partial<Scene>) => {
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
        `Draft the following for my scene in the novel "${project.title}": ${aiPrompt}`,
        `You are a world-class novelist. Use immersive, high-quality prose. Current scene context: ${scene?.content.slice(-1000)}`
      );
      if (draft) {
        saveScene({ content: (scene?.content || '') + '\n\n' + draft });
        setShowAiModal(false);
        setAiPrompt('');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Draft generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!scene) return <div className="p-8 text-gray-500">Select a scene to start writing...</div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative">
      <header className="h-16 flex items-center justify-between px-6 border-b border-border-dark bg-surface-dark/95 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-surface-hover text-gray-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="h-5 w-px bg-border-dark"></div>
          <nav className="flex items-center text-sm">
            <span className="text-gray-500">Manuscript</span>
            <span className="material-symbols-outlined text-[16px] text-gray-700 mx-1">chevron_right</span>
            <span className="text-white font-medium">{scene.title}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg font-bold text-sm transition-all shadow-lg shadow-primary/5"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>AI Assist</span>
          </button>
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-primary hover:brightness-110 text-black rounded-lg font-bold text-sm transition-all">
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Complete</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full relative">
        <div className="max-w-3xl mx-auto py-20 px-8 min-h-full flex flex-col gap-10 relative z-10">
          <input 
            className="bg-transparent text-5xl font-black text-white placeholder-zinc-800 border-none focus:ring-0 p-0 w-full tracking-tight"
            value={scene.title}
            onChange={(e) => saveScene({ title: e.target.value })}
            placeholder="Untitled Scene"
          />
          
          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-xl text-zinc-300 leading-relaxed font-serif min-h-[600px] resize-none selection:bg-primary/30"
            value={scene.content}
            onChange={(e) => {
              const text = e.target.value;
              saveScene({ content: text, wordCount: text.trim() ? text.split(/\s+/).length : 0 });
            }}
            placeholder="Begin your masterpiece..."
          />
        </div>
      </div>

      <footer className="h-12 border-t border-border-dark bg-surface-dark px-6 py-2 flex items-center justify-between shrink-0 text-[10px] font-bold uppercase tracking-widest text-gray-500">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">sticky_note_2</span>
            {scene.wordCount} Words
          </span>
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">timer</span>
            ${~~(scene.wordCount / 200)}m Reading
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-primary"></span>
          <span>Synced with cloud</span>
        </div>
      </footer>

      {showAiModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-200">
          <div className="bg-surface-dark border border-border-dark rounded-[2.5rem] shadow-[0_0_100px_rgba(43,238,121,0.05)] p-10 w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
                <h3 className="text-2xl font-bold text-white">Laboratory Assistant</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3 px-1">Prompt Specification</label>
                <textarea 
                  className="w-full bg-black border border-border-dark rounded-2xl p-6 text-white text-lg focus:ring-1 focus:ring-primary focus:border-primary transition-all h-40 resize-none font-medium"
                  placeholder="Describe the next turn of events... (e.g., 'A dense conversation about the heist')"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
              </div>

              {history.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4 px-1">Laboratory History</label>
                  <div className="grid grid-cols-1 gap-2">
                    {history.slice(0, 5).map(h => (
                      <button 
                        key={h.id}
                        onClick={() => setAiPrompt(h.text)}
                        className="text-left p-4 rounded-xl bg-black border border-border-dark hover:border-primary/50 text-gray-400 hover:text-white transition-all text-xs truncate font-medium flex items-center gap-3"
                      >
                        <span className="material-symbols-outlined text-sm text-gray-700">history</span>
                        {h.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-xs mt-4 mb-2 font-bold uppercase tracking-widest">{error}</p>}

            <div className="flex gap-4 pt-8">
              <button 
                onClick={handleAiDraft}
                disabled={isGenerating || !aiPrompt.trim()}
                className="flex-1 bg-primary disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold py-5 rounded-2xl text-base transition-all active:scale-[0.98] shadow-lg shadow-primary/10 flex items-center justify-center gap-3"
              >
                {isGenerating ? (
                  <><span className="animate-spin material-symbols-outlined">progress_activity</span> Synthesizing Prose...</>
                ) : (
                  <><span className="material-symbols-outlined">magic_button</span> Generate Draft</>
                )}
              </button>
              <button 
                onClick={() => setShowAiModal(false)}
                className="px-8 bg-surface-hover hover:bg-white/10 text-white rounded-2xl font-bold transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
