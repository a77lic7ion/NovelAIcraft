
import React, { useState, useEffect, useRef } from 'react';
import { View, Project, User, AIConfig, PromptLog } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Manuscript from './components/Manuscript';
import Editor from './components/Editor';
import Codex from './components/Codex';
import WorkshopChat from './components/WorkshopChat';
import Settings from './components/Settings';
import Review from './components/Review';
import Auth from './components/Auth';
import { updateAIConfig } from './aiService';
import { dbStorage } from './storage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptLog[]>([]);
  const [config, setConfig] = useState<AIConfig>({
    provider: 'gemini',
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'llama3',
    prefetch: true
  });

  // Load user session and basic settings
  useEffect(() => {
    const savedUser = localStorage.getItem('novel-craft-user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    const savedConfig = localStorage.getItem('novel-craft-config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      updateAIConfig(parsed);
    }

    const savedHistory = localStorage.getItem('novel-craft-prompts');
    if (savedHistory) setPromptHistory(JSON.parse(savedHistory));
  }, []);

  // Load projects from IndexedDB when user is authenticated
  useEffect(() => {
    if (currentUser) {
      dbStorage.getAllProjects(currentUser.id)
        .then(setProjects)
        .catch(err => console.error("Database load error:", err));
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('novel-craft-user');
    setCurrentView(View.DASHBOARD);
  };

  const addPromptToHistory = (text: string) => {
    if (!text.trim()) return;
    const newLog: PromptLog = { id: Date.now().toString(), text, timestamp: Date.now() };
    const updated = [newLog, ...promptHistory.slice(0, 49)];
    setPromptHistory(updated);
    localStorage.setItem('novel-craft-prompts', JSON.stringify(updated));
  };

  const updateConfig = (newConfig: AIConfig) => {
    setConfig(newConfig);
    updateAIConfig(newConfig);
    localStorage.setItem('novel-craft-config', JSON.stringify(newConfig));
  };

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const updateProject = async (updatedProject: Project) => {
    // Recalculate total word count
    const totalWords = updatedProject.acts.reduce((sum, act) => 
      sum + act.scenes.reduce((s, scene) => s + (scene.wordCount || 0), 0), 0
    );
    
    const projectWithCorrectCount = { ...updatedProject, wordCount: totalWords };

    // Optimistic UI update
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? projectWithCorrectCount : p));
    
    // Background DB save
    try {
      await dbStorage.saveProject(projectWithCorrectCount);
    } catch (e) {
      console.error("Database save error:", e);
    }
  };

  const createNewProject = async (title: string, genre: string, tags: string[]) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: title || 'Untitled Project',
      genre: genre || 'Fiction',
      lastEdited: Date.now(),
      wordCount: 0,
      acts: [{ id: 'act-1', title: 'Act 1', scenes: [] }],
      codex: [],
      tags: tags || [],
      printSize: 'A5'
    };
    
    try {
      await dbStorage.saveProject(newProject);
      setProjects(prev => [...prev, newProject]);
      setActiveProjectId(newProject.id);
      setCurrentView(View.MANUSCRIPT);
    } catch (e) {
      alert("Failed to create project in laboratory database.");
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await dbStorage.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) setActiveProjectId(null);
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  return (
    <div className="flex h-screen w-full bg-black text-white font-display overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        projectName={activeProject?.title}
        userName={currentUser.name}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {currentView === View.DASHBOARD && (
          <Dashboard 
            projects={projects} 
            onSelect={(id) => { setActiveProjectId(id); setCurrentView(View.MANUSCRIPT); }} 
            onNew={createNewProject}
            onDelete={deleteProject}
            onUpdate={updateProject}
          />
        )}
        {currentView === View.MANUSCRIPT && activeProject && (
          <Manuscript 
            project={activeProject} 
            onUpdate={updateProject} 
            onEditScene={(id) => { setActiveSceneId(id); setCurrentView(View.EDITOR); }}
          />
        )}
        {currentView === View.EDITOR && activeProject && (
          <Editor 
            project={activeProject} 
            sceneId={activeSceneId} 
            onUpdate={updateProject} 
            onBack={() => setCurrentView(View.MANUSCRIPT)}
            history={promptHistory}
            onPromptUse={addPromptToHistory}
          />
        )}
        {currentView === View.CODEX && activeProject && (
          <Codex project={activeProject} onUpdate={updateProject} />
        )}
        {currentView === View.WORKSHOP && (
          <WorkshopChat 
            project={activeProject} 
            history={promptHistory}
            onPromptUse={addPromptToHistory}
          />
        )}
        {currentView === View.REVIEW && activeProject && (
          <Review project={activeProject} onUpdate={updateProject} />
        )}
        {currentView === View.SETTINGS && (
          <Settings config={config} onUpdateConfig={updateConfig} />
        )}
      </main>
    </div>
  );
};

export default App;
