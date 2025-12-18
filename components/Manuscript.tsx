
import React, { useState, useRef } from 'react';
import { Project, Act, Scene } from '../types';
import { callAI } from '../aiService';

interface ManuscriptProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onEditScene: (id: string) => void;
}

const Manuscript: React.FC<ManuscriptProps> = ({ project, onUpdate, onEditScene }) => {
  const [activeTab, setActiveTab] = useState<'planning' | 'jacket'>('planning');
  const [isGeneratingSynopsis, setIsGeneratingSynopsis] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const addAct = () => {
    const newAct: Act = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Act ${project.acts.length + 1}`,
      scenes: []
    };
    onUpdate({ ...project, acts: [...project.acts, newAct] });
  };

  const addScene = (actId: string) => {
    const newScene: Scene = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Scene',
      content: '',
      synopsis: '',
      status: 'Draft',
      wordCount: 0
    };
    const updatedActs = project.acts.map(act => 
      act.id === actId ? { ...act, scenes: [...act.scenes, newScene] } : act
    );
    onUpdate({ ...project, acts: updatedActs });
  };

  const handleGenerateBackSynopsis = async () => {
    const allContent = project.acts.flatMap(a => a.scenes.map(s => s.content)).join('\n\n').slice(0, 10000);
    if (!allContent) return alert("Write some scenes first to generate a synopsis!");

    setIsGeneratingSynopsis(true);
    try {
      const res = await callAI(
        `Write a compelling "back of the book" blurb/synopsis for this novel titled "${project.title}". Genre: ${project.genre}. Manuscript summary context: ${allContent}`,
        "You are a professional book marketing expert. Write a hook-filled, intriguing blurb that sells the book to readers. Maximum 200 words."
      );
      onUpdate({ ...project, backSynopsis: res });
    } catch (e) {
      console.error(e);
      alert("Failed to generate synopsis.");
    } finally {
      setIsGeneratingSynopsis(false);
    }
  };

  const handleImageUpload = (side: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...project, [side === 'front' ? 'frontCover' : 'backCover']: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black">
      <header className="flex flex-col border-b border-border-dark bg-surface-dark/80 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">auto_awesome_mosaic</span>
            </div>
            <div>
              <h2 className="text-white text-base font-bold">{project.title}</h2>
              <p className="text-gray-500 text-xs">Studio Planning & Jacket Design</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={addAct}
              className="bg-primary/10 border border-primary/20 text-xs font-bold text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Act
            </button>
          </div>
        </div>
        
        <div className="flex px-6 gap-6">
          <button 
            onClick={() => setActiveTab('planning')}
            className={`pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'planning' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            Planning
          </button>
          <button 
            onClick={() => setActiveTab('jacket')}
            className={`pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'jacket' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            Book Jacket
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'planning' ? (
          <div className="h-full overflow-x-auto p-6">
            <div className="flex h-full gap-6 min-w-max pb-8">
              {project.acts.map(act => (
                <div key={act.id} className="flex flex-col w-80 h-full">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-white font-bold tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#2bee79]"></span>
                      {act.title}
                    </h3>
                    <span className="text-xs font-mono text-gray-600 uppercase">{act.scenes.length} SCENE{act.scenes.length !== 1 ? 'S' : ''}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-20">
                    {act.scenes.map(scene => (
                      <div 
                        key={scene.id}
                        onClick={() => onEditScene(scene.id)}
                        className="group bg-surface-dark border border-border-dark hover:border-primary/50 p-4 rounded-xl cursor-pointer transition-all relative"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                            scene.status === 'Done' ? 'bg-primary/20 text-primary' : 'bg-surface-hover text-gray-500'
                          }`}>
                            {scene.status}
                          </span>
                        </div>
                        <h4 className="text-white font-semibold text-sm mb-2 leading-snug group-hover:text-primary transition-colors">{scene.title}</h4>
                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 italic">{scene.synopsis || 'No synopsis available...'}</p>
                        <div className="mt-4 pt-3 border-t border-border-dark flex justify-between items-center">
                           <span className="text-[10px] text-gray-600">{scene.wordCount} words</span>
                           <span className="material-symbols-outlined text-gray-800 text-[16px]">drag_indicator</span>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={(e) => { e.stopPropagation(); addScene(act.id); }}
                      className="w-full py-4 rounded-xl border border-dashed border-border-dark text-gray-600 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group text-sm font-medium"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Scene
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-10 bg-black">
            <div className="max-w-4xl mx-auto space-y-12">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black tracking-tight text-white">Back of Book Synopsis</h3>
                  <button 
                    onClick={handleGenerateBackSynopsis}
                    disabled={isGeneratingSynopsis}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-sm ${isGeneratingSynopsis ? 'animate-spin' : ''}`}>auto_awesome</span>
                    {isGeneratingSynopsis ? 'Generating...' : 'AI Assist'}
                  </button>
                </div>
                <textarea 
                  className="w-full bg-surface-dark border border-border-dark rounded-3xl p-8 text-lg text-gray-300 focus:ring-1 focus:ring-primary leading-relaxed font-serif min-h-[300px]"
                  placeholder="The blurb that hooks the readers..."
                  value={project.backSynopsis || ''}
                  onChange={(e) => onUpdate({ ...project, backSynopsis: e.target.value })}
                />
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Front Cover</h4>
                  <div 
                    onClick={() => frontInputRef.current?.click()}
                    className="aspect-[5/7] bg-surface-dark border-2 border-dashed border-border-dark rounded-3xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-all group"
                  >
                    {project.frontCover ? (
                      <img src={project.frontCover} className="w-full h-full object-cover" alt="Front Cover" />
                    ) : (
                      <div className="text-center p-6">
                        <span className="material-symbols-outlined text-4xl text-gray-700 group-hover:text-primary mb-2">image</span>
                        <p className="text-[10px] font-bold text-gray-600 uppercase">Upload Front Cover</p>
                        <p className="text-[8px] text-gray-700 mt-1 uppercase">Recommended: 148 x 210mm (A5)</p>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={frontInputRef} hidden accept="image/*" onChange={handleImageUpload('front')} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Back Cover</h4>
                  <div 
                    onClick={() => backInputRef.current?.click()}
                    className="aspect-[5/7] bg-surface-dark border-2 border-dashed border-border-dark rounded-3xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-all group"
                  >
                    {project.backCover ? (
                      <img src={project.backCover} className="w-full h-full object-cover" alt="Back Cover" />
                    ) : (
                      <div className="text-center p-6">
                        <span className="material-symbols-outlined text-4xl text-gray-700 group-hover:text-primary mb-2">image</span>
                        <p className="text-[10px] font-bold text-gray-600 uppercase">Upload Back Cover</p>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={backInputRef} hidden accept="image/*" onChange={handleImageUpload('back')} />
                </div>
              </section>
              
              <section className="bg-surface-dark border border-border-dark p-8 rounded-3xl">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Print Specifications</h4>
                <div className="grid grid-cols-3 gap-4">
                  {(['A4', 'A5', 'US Letter'] as const).map(size => (
                    <button 
                      key={size}
                      onClick={() => onUpdate({ ...project, printSize: size })}
                      className={`py-4 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${project.printSize === size ? 'bg-primary text-black border-primary' : 'bg-black text-gray-500 border-border-dark hover:border-gray-700'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-600 mt-4 text-center italic">Professional export strictly enforces these dimensions for online publication standards.</p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Manuscript;
