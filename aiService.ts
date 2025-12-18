
import { GoogleGenAI } from "@google/genai";
import { AIConfig } from "./types";

let currentConfig: AIConfig = {
  provider: 'gemini',
  ollamaEndpoint: 'http://localhost:11434',
  ollamaModel: 'llama3',
  prefetch: true
};

export const updateAIConfig = (config: AIConfig) => {
  currentConfig = config;
};

const getGeminiClient = () => {
  // Use user-provided key if available, otherwise fallback to env
  const key = currentConfig.geminiApiKey || process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey: key });
};

export const callAI = async (prompt: string, systemInstruction: string) => {
  if (currentConfig.provider === 'gemini') {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction }
    });
    return response.text;
  } else {
    // Ollama integration
    try {
      const response = await fetch(`${currentConfig.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentConfig.ollamaModel,
          prompt: `${systemInstruction}\n\nUser: ${prompt}`,
          stream: false,
        }),
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      throw new Error(`Ollama Error: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }
  }
};

export const testOllama = async (endpoint: string) => {
  try {
    const res = await fetch(`${endpoint}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
};
