
import React from 'react';
import { Project, Act, Scene } from '../types';

interface ManuscriptProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onEditScene: (id: string) => void;
}

const Manuscript: React.FC<ManuscriptProps> = ({ project, onUpdate, onEditScene }) => {
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

  return (
    <div className="flex-1 flex flex-col h-full bg-black">
      <header className="flex items-center justify-between h-16 px-6 border-b border-border-dark bg-surface-dark/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">auto_awesome_mosaic</span>
          </div>
          <div>
            <h2 className="text-white text-base font-bold">Story Planning</h2>
            <p className="text-gray-500 text-xs">Structure and organize your narrative arcs</p>
          </div>
        </div>
        <button 
          onClick={addAct}
          className="bg-primary/10 border border-primary/20 text-xs font-bold text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Act
        </button>
      </header>

      <div className="flex-1 overflow-x-auto p-6">
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
    </div>
  );
};

export default Manuscript;
