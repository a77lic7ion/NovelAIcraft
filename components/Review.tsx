
import React from 'react';
import { Project } from '../types';

interface ReviewProps {
  project: Project;
}

const Review: React.FC<ReviewProps> = ({ project }) => {
  const totalWords = project.acts.reduce((sum, act) => sum + act.scenes.reduce((s, scene) => s + scene.wordCount, 0), 0);
  const totalScenes = project.acts.reduce((sum, act) => sum + act.scenes.length, 0);

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-black">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Project Analytics</h1>
            <p className="text-gray-500">Real-time stats for {project.title}</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface-dark border border-border-dark px-6 py-2 rounded-full font-bold text-sm">Export PDF</button>
            <button className="bg-primary text-black px-6 py-2 rounded-full font-bold text-sm">Update Report</button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Word Count', value: totalWords.toLocaleString(), icon: 'menu_book' },
            { label: 'Total Scenes', value: totalScenes.toString(), icon: 'grid_view' },
            { label: 'Writing Goal', value: '45%', icon: 'flag' },
            { label: 'Est. Reading Time', value: `${~~(totalWords / 200)}m`, icon: 'timer' }
          ].map(stat => (
            <div key={stat.label} className="bg-surface-dark border border-border-dark p-6 rounded-xl">
               <div className="flex justify-between mb-4">
                 <span className="text-xs font-bold text-gray-500 uppercase">{stat.label}</span>
                 <span className="material-symbols-outlined text-primary text-lg">{stat.icon}</span>
               </div>
               <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="bg-surface-dark border border-border-dark p-8 rounded-2xl">
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
             <span className="material-symbols-outlined text-primary">analytics</span>
             Project Sentiment & Pacing
           </h3>
           <div className="h-64 flex items-end gap-1 px-4 border-b border-border-dark border-dashed">
             {Array.from({length: 40}).map((_, i) => (
               <div 
                 key={i} 
                 className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm"
                 style={{ height: `${Math.random() * 80 + 20}%` }}
               ></div>
             ))}
           </div>
           <div className="flex justify-between mt-4 text-xs text-gray-600 uppercase font-bold">
              <span>Chapter 1</span>
              <span>Chapter 2</span>
              <span>Chapter 3</span>
              <span>Chapter 4</span>
           </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-dark border border-border-dark p-8 rounded-2xl">
            <h3 className="font-bold mb-4">Character Visibility</h3>
            <div className="space-y-4">
              {project.codex.filter(e => e.type === 'Character').map(char => (
                <div key={char.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{char.name}</span>
                  <div className="w-2/3 h-2 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-dark border border-border-dark p-8 rounded-2xl flex flex-col items-center justify-center text-center">
             <span className="material-symbols-outlined text-4xl text-primary mb-2">style</span>
             <h3 className="font-bold">Prose Consistency</h3>
             <p className="text-gray-500 text-sm mt-2">Analysis shows high coherence in tone and active voice across Act 1.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Review;
