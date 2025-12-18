
export enum View {
  DASHBOARD = 'dashboard',
  MANUSCRIPT = 'manuscript',
  EDITOR = 'editor',
  CODEX = 'codex',
  WORKSHOP = 'workshop',
  REVIEW = 'review',
  SETTINGS = 'settings'
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
}

export interface AIConfig {
  provider: 'gemini' | 'ollama';
  geminiApiKey?: string;
  ollamaEndpoint: string;
  ollamaModel: string;
  prefetch: boolean;
}

export interface PromptLog {
  id: string;
  text: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  lastEdited: number;
  wordCount: number;
  acts: Act[];
  codex: CodexEntry[];
  tags: string[];
  backSynopsis?: string;
  frontCover?: string; // Base64
  backCover?: string;  // Base64
  printSize?: 'A4' | 'A5' | 'US Letter';
}

export interface Act {
  id: string;
  title: string;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  synopsis: string;
  status: 'Draft' | 'In Progress' | 'Done';
  wordCount: number;
  image?: string; // Base64 image string
}

export interface CodexEntry {
  id: string;
  name: string;
  type: 'Character' | 'Location' | 'Item' | 'Lore';
  description: string;
  details: string;
  notes: string;
  isLocked?: boolean;
  image?: string; // Base64 image string
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
