
import React, { useState } from 'react';
import { Project, ChatMessage, PromptLog } from '../types';
import { callAI } from '../aiService';

interface WorkshopChatProps {
  project: Project;
  history: PromptLog[];
  onPromptUse: (text: string) => void;
}

const WorkshopChat: React.FC<WorkshopChatProps> = ({ project, history, onPromptUse }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSend = async () => {
    if (!input || loading) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    onPromptUse(input);

    try {
      const response = await callAI(
        input, 
        `You are NovelCrafter AI. Assistant for the project "${project?.title}". Help the author brainstorm, research, or draft.`
      );
      const modelMsg: ChatMessage = { role: 'model', text: response || "I'm sorry, I couldn't process that request." };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${error instanceof Error ? error.message : 'Unknown failure'}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black">
      <header className="h-[72px] flex items-center justify-between border-b border-border-dark px-8 shrink-0 bg-black">
        <div className="flex items-center gap-4">
          <div className="size-10 text-primary flex items-center justify-center bg-surface-dark rounded-xl border border-border-dark shadow-lg shadow-primary/5">
            <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Workshop Lab</h1>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${showHistory ? 'bg-primary text-black' : 'text-gray-500 hover:text-white bg-surface-dark'}`}
        >
          {showHistory ? 'Close History' : 'Prompt History'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center h-[60vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="size-24 rounded-[2rem] bg-surface-dark border border-border-dark flex items-center justify-center shadow-2xl relative">
              <span className="material-symbols-outlined text-primary text-[48px]">psychology</span>
              <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full -z-10"></div>
            </div>
            <div className="space-y-3 max-w-lg">
              <h2 className="text-3xl font-black text-white">Ready for your next twist?</h2>
              <p className="text-gray-500 text-lg leading-relaxed">Brainstorm characters, outline plots, or ask for research details about your current world.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mt-12">
              {[
                { title: 'Draft Scene', sub: 'Generate prose for current project', icon: 'edit_note', prompt: 'Draft a scene where...' },
                { title: 'Brainstorm Plot', sub: 'Develop unexpected directions', icon: 'cyclone', prompt: 'Give me 5 plot twists for...' },
                { title: 'World Research', sub: 'Fact check historical or sci-fi data', icon: 'travel_explore', prompt: 'Explain the logistics of...' },
                { title: 'Character Arc', sub: 'Deep dive into motivations', icon: 'person_search', prompt: 'Develop a back story for...' }
              ].map(card => (
                <button 
                  key={card.title}
                  onClick={() => setInput(card.prompt)}
                  className="p-6 rounded-[2rem] border border-border-dark bg-surface-dark/40 hover:bg-surface-dark hover:border-primary/40 transition-all text-left flex items-start gap-5 group"
                >
                  <div className="size-12 rounded-2xl bg-black border border-border-dark flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">{card.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{card.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{card.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] rounded-[2rem] px-8 py-5 shadow-xl ${
                  m.role === 'user' ? 'bg-primary text-black font-medium' : 'bg-surface-dark border border-border-dark text-white leading-relaxed'
                }`}>
                  <p className="whitespace-pre-wrap text-base">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-dark border border-border-dark rounded-[2rem] px-8 py-5 animate-pulse flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Processing Intelligence</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-6 md:p-10 bg-black border-t border-border-dark shrink-0 relative">
        {showHistory && history.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 p-6 bg-surface-dark border-t border-border-dark shadow-2xl animate-in slide-in-from-bottom-2 duration-200 z-50">
             <div className="max-w-4xl mx-auto">
               <div className="flex items-center gap-2 mb-4">
                 <span className="material-symbols-outlined text-primary text-sm">history</span>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recent Prompts</span>
               </div>
               <div className="flex flex-wrap gap-2">
                 {history.slice(0, 10).map(h => (
                   <button 
                    key={h.id}
                    onClick={() => { setInput(h.text); setShowHistory(false); }}
                    className="px-4 py-2 bg-black border border-border-dark rounded-full text-xs text-gray-400 hover:text-white hover:border-primary/50 transition-all truncate max-w-[200px]"
                   >
                     {h.text}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto w-full">
          <div className="relative group bg-surface-dark border border-border-dark focus-within:border-primary/50 focus-within:shadow-[0_0_30px_rgba(43,238,121,0.05)] rounded-[2.5rem] transition-all shadow-xl">
            <textarea 
              className="w-full bg-transparent text-white placeholder-gray-600 px-8 py-6 rounded-[2.5rem] focus:outline-none resize-none min-h-[80px] max-h-[300px] leading-relaxed text-lg"
              placeholder="Consult the workshop..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleSend(); }}
            />
            <div className="flex items-center justify-between px-6 pb-4">
              <div className="flex items-center gap-3">
                 <button className="p-3 rounded-full hover:bg-surface-hover text-gray-600 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">mic</span>
                </button>
                <button className="p-3 rounded-full hover:bg-surface-hover text-gray-600 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">attach_file</span>
                </button>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[10px] text-gray-700 font-bold tracking-widest uppercase hidden sm:inline-block">CMD + Enter to consult</span>
                <button 
                  onClick={handleSend}
                  disabled={!input || loading}
                  className={`pl-6 pr-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all active:scale-[0.98] ${
                    input && !loading ? 'bg-primary text-black shadow-lg shadow-primary/10' : 'bg-surface-hover text-gray-600'
                  }`}
                >
                  Consult
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopChat;
