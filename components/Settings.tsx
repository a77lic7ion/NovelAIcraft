
import React, { useState } from 'react';
import { AIConfig } from '../types';
import { testOllama } from '../aiService';

interface SettingsProps {
  config: AIConfig;
  onUpdateConfig: (config: AIConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');

  const handleTest = async () => {
    setTestStatus('testing');
    const ok = await testOllama(config.ollamaEndpoint);
    setTestStatus(ok ? 'success' : 'fail');
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-10 lg:p-16 bg-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4 tracking-tight">Studio Config</h1>
          <p className="text-gray-500 text-lg">Configure your writing engine and laboratory settings.</p>
        </div>

        <div className="space-y-12">
          <section className="bg-surface-dark rounded-[2.5rem] border border-border-dark p-10 shadow-2xl">
            <div className="flex items-center gap-6 mb-10">
              <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-black shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">AI Provider</h3>
                <p className="text-gray-500 text-sm">Choose between high-performance cloud or private local models.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10 p-1 bg-black rounded-2xl border border-border-dark">
              <button 
                onClick={() => onUpdateConfig({...config, provider: 'gemini'})}
                className={`py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
                  config.provider === 'gemini' ? 'bg-surface-dark text-primary shadow-lg ring-1 ring-primary/20' : 'text-gray-500 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">cloud_queue</span>
                Google Gemini
              </button>
              <button 
                onClick={() => onUpdateConfig({...config, provider: 'ollama'})}
                className={`py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
                  config.provider === 'ollama' ? 'bg-surface-dark text-primary shadow-lg ring-1 ring-primary/20' : 'text-gray-500 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">terminal</span>
                Ollama Local
              </button>
            </div>

            {config.provider === 'gemini' ? (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3 px-1">Custom Gemini API Key (Optional)</label>
                  <input 
                    type="password"
                    className="w-full bg-black border border-border-dark rounded-xl p-4 text-white focus:ring-1 focus:ring-primary transition-all font-mono"
                    placeholder="Using default system key..."
                    value={config.geminiApiKey || ''}
                    onChange={(e) => onUpdateConfig({...config, geminiApiKey: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-600 mt-2 px-1 uppercase tracking-wider font-bold">Leave blank to use NovelAIcraft's internal key.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3 px-1">Ollama Endpoint</label>
                    <input 
                      className="w-full bg-black border border-border-dark rounded-xl p-4 text-white focus:ring-1 focus:ring-primary transition-all font-mono"
                      placeholder="http://localhost:11434"
                      value={config.ollamaEndpoint}
                      onChange={(e) => onUpdateConfig({...config, ollamaEndpoint: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3 px-1">Target Model</label>
                    <input 
                      className="w-full bg-black border border-border-dark rounded-xl p-4 text-white focus:ring-1 focus:ring-primary transition-all font-mono"
                      placeholder="llama3"
                      value={config.ollamaModel}
                      onChange={(e) => onUpdateConfig({...config, ollamaModel: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-black rounded-xl border border-border-dark">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleTest}
                      disabled={testStatus === 'testing'}
                      className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                        testStatus === 'success' ? 'bg-green-500 text-black' : testStatus === 'fail' ? 'bg-red-500 text-white' : 'bg-primary text-black'
                      }`}
                    >
                      {testStatus === 'testing' ? 'Connecting...' : testStatus === 'success' ? 'Connected' : testStatus === 'fail' ? 'Failed' : 'Test Connection'}
                    </button>
                    {testStatus === 'success' && <span className="text-green-500 text-xs font-bold animate-pulse">Endpoint reached successfully.</span>}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Model Prefetch</span>
                    <button 
                      onClick={() => onUpdateConfig({...config, prefetch: !config.prefetch})}
                      className={`w-12 h-6 rounded-full transition-all relative ${config.prefetch ? 'bg-primary' : 'bg-surface-hover'}`}
                    >
                      <div className={`absolute top-1 size-4 bg-black rounded-full transition-all ${config.prefetch ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="bg-surface-dark rounded-[2.5rem] border border-border-dark p-10 opacity-50 cursor-not-allowed">
            <h3 className="text-xl font-bold mb-4">Export Preferences</h3>
            <p className="text-gray-500 text-sm mb-6">Manuscript formatting and export destinations.</p>
            <div className="grid grid-cols-3 gap-4">
              {['PDF', 'EPUB', 'DOCX'].map(fmt => (
                <div key={fmt} className="bg-black border border-border-dark p-6 rounded-2xl text-center">
                  <span className="text-lg font-bold text-gray-700">{fmt}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
