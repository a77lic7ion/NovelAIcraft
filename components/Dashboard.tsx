
import React, { useState, useMemo } from 'react';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onSelect: (id: string) => void;
  onNew: (title: string, genre: string, tags: string[]) => void;
  onDelete: (id: string) => void;
  onUpdate: (project: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onSelect, onNew, onDelete, onUpdate }) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('Fantasy');
  const [newTags, setNewTags] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);

  const genres = ['Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance', 'Historical', 'Non-Fiction'];

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => p.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            project.genre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !activeFilterTag || project.tags?.includes(activeFilterTag);
      return matchesSearch && matchesTag;
    });
  }, [projects, searchQuery, activeFilterTag]);

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArr = newTags.split(',').map(t => t.trim()).filter(Boolean);
    onNew(newTitle, newGenre, tagsArr);
    setShowNewModal(false);
    setNewTitle('');
    setNewTags('');
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editProject) {
      onUpdate(editProject);
      setEditProject(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <h2 className="text-5xl font-black text-white tracking-tight">Studio Dashboard</h2>
            <p className="text-gray-500 text-lg max-w-lg">Organize your manuscripts, characters, and world-building codex in one place.</p>
          </div>
          <button 
            onClick={() => setShowNewModal(true)}
            className="flex items-center justify-center gap-3 bg-primary hover:brightness-110 text-black px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 shadow-xl shadow-primary/20"
          >
            <span className="material-symbols-outlined font-bold">add_box</span>
            <span>New Manuscript</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mb-10 flex flex-col gap-6 p-6 bg-surface-dark border border-border-dark rounded-[2.5rem]">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
            <input 
              type="text" 
              placeholder="Search by title or genre..."
              className="w-full bg-black border border-border-dark rounded-xl pl-12 pr-4 py-4 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mr-2">Filter Tags:</span>
            <button 
              onClick={() => setActiveFilterTag(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${!activeFilterTag ? 'bg-primary text-black border-primary' : 'bg-black text-gray-500 border-border-dark hover:border-gray-600'}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button 
                key={tag}
                onClick={() => setActiveFilterTag(activeFilterTag === tag ? null : tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${activeFilterTag === tag ? 'bg-primary text-black border-primary' : 'bg-black text-gray-500 border-border-dark hover:border-gray-600'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div 
            onClick={() => setShowNewModal(true)}
            className="group flex flex-col items-center justify-center bg-surface-dark/30 border-2 border-dashed border-border-dark rounded-[2.5rem] min-h-[340px] hover:border-primary hover:bg-surface-dark/50 transition-all cursor-pointer gap-5"
          >
            <div className="size-20 rounded-3xl bg-surface-dark border border-border-dark flex items-center justify-center text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all shadow-xl">
              <span className="material-symbols-outlined text-5xl">add</span>
            </div>
            <p className="text-gray-500 font-bold tracking-wide group-hover:text-white uppercase text-xs">Start a new story</p>
          </div>

          {filteredProjects.map(project => (
            <div 
              key={project.id}
              onClick={() => onSelect(project.id)}
              className="group flex flex-col p-8 bg-surface-dark border border-border-dark rounded-[2.5rem] min-h-[340px] hover:border-primary/50 transition-all cursor-pointer relative shadow-lg hover:shadow-primary/5"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">auto_stories</span>
                </div>
                <div className="flex gap-1">
                   <button 
                    onClick={(e) => { e.stopPropagation(); setEditProject(project); }}
                    className="p-2 text-gray-700 hover:text-primary transition-colors"
                    title="Edit Tags & Meta"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(confirm('Delete project?')) onDelete(project.id); }}
                    className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">{project.title}</h3>
              <p className="text-sm font-medium text-gray-500 mb-4">{project.genre}</p>
              
              <div className="flex flex-wrap gap-2 mb-auto">
                {project.tags?.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tag}</span>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border-dark flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">edit_note</span>
                  {project.wordCount.toLocaleString()} Words
                </div>
                <span>{new Date(project.lastEdited).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-surface-dark border border-border-dark p-10 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-3xl font-bold mb-2">New Manuscript</h2>
            <p className="text-gray-500 mb-8">Define your story's core before drafting.</p>
            
            <form onSubmit={handleSubmitNew} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Project Title</label>
                <input 
                  className="w-full bg-black border border-border-dark rounded-xl px-4 py-4 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-lg font-bold"
                  placeholder="The Midnight Library..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Genre</label>
                  <select 
                    className="w-full bg-black border border-border-dark rounded-xl px-4 py-4 text-white focus:ring-1 focus:ring-primary appearance-none font-medium"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                  >
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Tags (Comma separated)</label>
                  <input 
                    className="w-full bg-black border border-border-dark rounded-xl px-4 py-4 text-white focus:ring-1 focus:ring-primary transition-all font-medium"
                    placeholder="Noir, AI, Short Story"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-primary text-black font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/10">
                  Create Studio
                </button>
                <button type="button" onClick={() => setShowNewModal(false)} className="px-8 bg-surface-hover border border-border-dark text-white font-bold rounded-2xl transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-surface-dark border border-border-dark p-10 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-3xl font-bold mb-2">Edit Manuscript</h2>
            <p className="text-gray-500 mb-8">Update your project metadata and tags.</p>
            
            <form onSubmit={handleSubmitEdit} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Project Title</label>
                <input 
                  className="w-full bg-black border border-border-dark rounded-xl px-4 py-4 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-lg font-bold"
                  value={editProject.title}
                  onChange={(e) => setEditProject({...editProject, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Genre</label>
                  <select 
                    className="w-full bg-black border border-border-dark rounded-xl px-4 py-4 text-white focus:ring-1 focus:ring-primary appearance-none font-medium"
                    value={editProject.genre}
                    onChange={(e) => setEditProject({...editProject, genre: e.target.value})}
                  >
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Tags (Comma separated)</label>
                  <input 
                    className="w-full bg-black border border-border-dark rounded-xl px-4 py-4 text-white focus:ring-1 focus:ring-primary transition-all font-medium"
                    placeholder="Noir, AI, Short Story"
                    value={editProject.tags?.join(', ')}
                    onChange={(e) => setEditProject({...editProject, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-primary text-black font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/10">
                  Update Project
                </button>
                <button type="button" onClick={() => setEditProject(null)} className="px-8 bg-surface-hover border border-border-dark text-white font-bold rounded-2xl transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
