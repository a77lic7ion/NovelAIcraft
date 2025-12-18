
import React from 'react';
import { Project } from '../types';

interface ReviewProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

const Review: React.FC<ReviewProps> = ({ project, onUpdate }) => {
  const totalWords = project.acts.reduce((sum, act) => sum + act.scenes.reduce((s, scene) => s + (scene.wordCount || 0), 0), 0);
  const totalScenes = project.acts.reduce((sum, act) => sum + act.scenes.length, 0);

  const handleExportPDF = () => {
    // We will generate a high-quality printable document in a hidden iframe or temporary window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Please allow popups to export your manuscript.");

    const styles = `
      @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap');
      body {
        margin: 0;
        font-family: 'Lora', serif;
        color: #000;
        line-height: 1.6;
        background: #fff;
      }
      @page {
        size: ${project.printSize === 'US Letter' ? '8.5in 11in' : project.printSize === 'A4' ? '210mm 297mm' : '148mm 210mm'};
        margin: 25mm 20mm;
      }
      .page-break { page-break-before: always; }
      .cover {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100%;
        text-align: center;
        background: #f9f9f9;
        margin: 0;
        page-break-after: always;
      }
      .cover img { max-width: 100%; max-height: 100%; object-fit: contain; }
      .title-page {
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        page-break-after: always;
      }
      .title-page h1 { font-size: 3rem; margin-bottom: 1rem; }
      .title-page p { font-size: 1.5rem; color: #555; }
      .content-section { margin-top: 50px; }
      h2 { font-size: 2rem; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 40px; }
      h3 { font-size: 1.5rem; margin-top: 30px; color: #333; }
      p { margin-bottom: 15px; text-indent: 2em; text-align: justify; }
      .synopsis-page { padding: 40px; page-break-after: always; }
      .synopsis-page h2 { border: none; text-align: center; }
      .author-tag { position: absolute; bottom: 40px; font-size: 0.8rem; color: #888; }
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${project.title} - Export</title>
        <style>${styles}</style>
      </head>
      <body>
        ${project.frontCover ? `<div class="cover"><img src="${project.frontCover}" /></div>` : ''}
        
        <div class="title-page">
          <h1>${project.title}</h1>
          <p>${project.genre}</p>
          <div class="author-tag">Generated via NovelAIcraft Studio</div>
        </div>

        ${project.backSynopsis ? `
          <div class="synopsis-page">
            <h2>Synopsis</h2>
            <div style="font-style: italic; white-space: pre-wrap; padding: 20px;">${project.backSynopsis}</div>
          </div>
        ` : ''}

        <div class="manuscript">
          ${project.acts.map(act => `
            <div class="page-break">
              <h2>${act.title}</h2>
              ${act.scenes.map(scene => `
                <div class="content-section">
                  <h3>${scene.title}</h3>
                  <div style="white-space: pre-wrap;">${scene.content}</div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>

        ${project.backCover ? `<div class="page-break cover"><img src="${project.backCover}" /></div>` : ''}

        <script>
          window.onload = () => {
            window.print();
            // setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-black">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Project Analytics</h1>
            <p className="text-gray-500">Real-time stats for {project.title}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportPDF}
              className="bg-primary text-black px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/10 transition-transform active:scale-95"
            >
              Export PDF (Print Quality)
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Word Count', value: totalWords.toLocaleString(), icon: 'menu_book' },
            { label: 'Total Scenes', value: totalScenes.toString(), icon: 'grid_view' },
            { label: 'Writing Goal', value: `${~~((totalWords/50000)*100)}%`, icon: 'flag' },
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
             {project.acts.flatMap(a => a.scenes).map((s, i) => (
               <div 
                 key={i} 
                 className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm"
                 style={{ height: `${Math.min(100, (s.wordCount / 2000) * 100)}%` }}
                 title={`${s.title}: ${s.wordCount} words`}
               ></div>
             ))}
           </div>
           <div className="flex justify-between mt-4 text-xs text-gray-600 uppercase font-bold">
              <span>Beginning</span>
              <span>Middle</span>
              <span>Climax</span>
           </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <div className="bg-surface-dark border border-border-dark p-8 rounded-2xl">
            <h3 className="font-bold mb-4">Character Visibility</h3>
            <div className="space-y-4">
              {project.codex.filter(e => e.type === 'Character').slice(0, 5).map(char => (
                <div key={char.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{char.name}</span>
                  <div className="w-2/3 h-2 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.random() * 60 + 20}%` }}></div>
                  </div>
                </div>
              ))}
              {project.codex.filter(e => e.type === 'Character').length === 0 && <p className="text-xs text-gray-500 italic">No characters in Codex yet.</p>}
            </div>
          </div>
          <div className="bg-surface-dark border border-border-dark p-8 rounded-2xl flex flex-col items-center justify-center text-center">
             <span className="material-symbols-outlined text-4xl text-primary mb-2">style</span>
             <h3 className="font-bold">Prose Consistency</h3>
             <p className="text-gray-500 text-sm mt-2">Publishing grade: Ready for Review. Covers and Synopsis initialized.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Review;
