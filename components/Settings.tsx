
import React, { useState, useEffect } from 'react';
import { AIConfig } from '../types';
import { testOllama, fetchOllamaModels } from '../aiService';

interface SettingsProps {
  config: AIConfig;
  onUpdateConfig: (config: AIConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onUpdateConfig }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [exportSettings, setExportSettings] = useState({
    includeCodex: true,
    fontFamily: 'Serif',
    pageSize: 'A4',
    professionalBleed: false
  });

  // Automatically attempt to fetch models if provider is Ollama on mount or endpoint change
  useEffect(() => {
    if (config.provider === 'ollama') {
      refreshOllamaModels();
    }
  }, [config.ollamaEndpoint]);

  const refreshOllamaModels = async () => {
    const models = await fetchOllamaModels(config.ollamaEndpoint);
    setOllamaModels(models);
    // If current selected model is not in the list and list is not empty, select the first one
    if (models.length > 0 && !models.includes(config.ollamaModel)) {
      onUpdateConfig({ ...config, ollamaModel: models[0] });
    }
  };

  const handleTest = async () => {
    setTestStatus('testing');
    const ok = await testOllama(config.ollamaEndpoint);
    if (ok) {
      setTestStatus('success');
      await refreshOllamaModels();
    } else {
      setTestStatus('fail');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-10 lg:p-16 bg-black">
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4 tracking-tight text-white">Studio Config</h1>
          <p className="text-gray-500 text-lg">Configure your writing engine and laboratory settings.</p>
        </div>

        <div className="space-y-12">
          {/* AI Provider Section */}
          <section className="bg-surface-dark rounded-[2.5rem] border border-border-dark p-10 shadow-2xl">
            <div className="flex items-center gap-6 mb-10">
              <div className="size-16 bg-primary rounded-2xl flex items-center justify-center text-black shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-3xl">hub</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">AI Provider</h3>
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
                    className="w-full bg-black border border-border-dark rounded-xl p-4 text-white focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
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
                    <div className="relative">
                      <input 
                        className="w-full bg-black border border-border-dark rounded-xl p-4 text-white focus:ring-1 focus:ring-primary transition-all font-mono text-sm pr-12"
                        placeholder="http://localhost:11434"
                        value={config.ollamaEndpoint}
                        onChange={(e) => onUpdateConfig({...config, ollamaEndpoint: e.target.value})}
                      />
                      <button 
                        onClick={refreshOllamaModels}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                        title="Refresh models"
                      >
                        <span className="material-symbols-outlined text-xl">refresh</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3 px-1">Target Model</label>
                    {ollamaModels.length > 0 ? (
                      <select 
                        className="w-full bg-black border border-border-dark rounded-xl p-4 text-white focus:ring-1 focus:ring-primary transition-all font-mono text-sm appearance-none"
                        value={config.ollamaModel}
                        onChange={(e) => onUpdateConfig({...config, ollamaModel: e.target.value})}
                      >
                        {ollamaModels.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        className="w-full bg-black border border-border-dark rounded-xl p-4 text-white focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
                        placeholder="llama3"
                        value={config.ollamaModel}
                        onChange={(e) => onUpdateConfig({...config, ollamaModel: e.target.value})}
                      />
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-black rounded-xl border border-border-dark gap-4">
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
                    {testStatus === 'success' && <span className="text-green-500 text-[10px] font-bold animate-pulse uppercase">Endpoint reached</span>}
                    {testStatus === 'fail' && <span className="text-red-500 text-[10px] font-bold uppercase">Connection Refused</span>}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model Prefetch</span>
                    <button 
                      onClick={() => onUpdateConfig({...config, prefetch: !config.prefetch})}
                      className={`w-12 h-6 rounded-full transition-all relative ${config.prefetch ? 'bg-primary' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-1 size-4 bg-black rounded-full transition-all ${config.prefetch ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Export Preferences Section */}
          <section className="bg-surface-dark rounded-[2.5rem] border border-border-dark p-10 shadow-2xl">
            <div className="flex items-center gap-6 mb-10">
              <div className="size-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
                <span className="material-symbols-outlined text-3xl">print</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Export Preferences</h3>
                <p className="text-gray-500 text-sm">Fine-tune the typography and layout for your finished manuscript.</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3 px-1">Global Typography</label>
                  <div className="flex gap-2">
                    {['Serif', 'Sans', 'Mono'].map(font => (
                      <button
                        key={font}
                        onClick={() => setExportSettings({...exportSettings, fontFamily: font})}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                          exportSettings.fontFamily === font 
                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                            : 'bg-black border-border-dark text-gray-500 hover:border-gray-700'
                        }`}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3 px-1">Page Geometry</label>
                  <select 
                    className="w-full bg-black border border-border-dark rounded-xl px-4 py-3 text-white text-sm focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                    value={exportSettings.pageSize}
                    onChange={(e) => setExportSettings({...exportSettings, pageSize: e.target.value})}
                  >
                    <option value="A4">Standard A4 (210 x 297mm)</option>
                    <option value="US Letter">US Letter (8.5 x 11in)</option>
                    <option value="Pocket">Pocket (4.25 x 6.87in)</option>
                    <option value="Custom">Custom Dimensions...</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'PDF', icon: 'picture_as_pdf', desc: 'Ready for print' },
                  { id: 'EPUB', icon: 'book', desc: 'Digital readers' },
                  { id: 'DOCX', icon: 'description', desc: 'Editor exchange' }
                ].map(fmt => (
                  <div key={fmt.id} className="bg-black border border-border-dark p-6 rounded-2xl flex flex-col items-center text-center group hover:border-blue-500/30 transition-all">
                    <span className="material-symbols-outlined text-gray-700 mb-3 text-3xl group-hover:text-blue-400 transition-colors">{fmt.icon}</span>
                    <span className="text-lg font-bold text-white mb-1">{fmt.id}</span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{fmt.desc}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-black rounded-2xl border border-border-dark space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Include World Codex</h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">Append character sheets and lore entries as an appendix.</p>
                  </div>
                  <button 
                    onClick={() => setExportSettings({...exportSettings, includeCodex: !exportSettings.includeCodex})}
                    className={`w-12 h-6 rounded-full transition-all relative ${exportSettings.includeCodex ? 'bg-blue-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`absolute top-1 size-4 bg-black rounded-full transition-all ${exportSettings.includeCodex ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="h-px bg-border-dark"></div>
                <div className="flex items-center justify-between opacity-50">
                  <div>
                    <h4 className="text-sm font-bold text-white">Professional Bleed (Beta)</h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">Adds 3mm margin for industrial publishing machines.</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-zinc-900 cursor-not-allowed">
                    <div className="absolute top-1 left-1 size-4 bg-zinc-700 rounded-full"></div>
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center text-gray-700 gap-2 text-xs italic">
                <span className="material-symbols-outlined text-sm">info</span>
                Export engine is currently in simulation mode. Download buttons will be active in the next release.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
