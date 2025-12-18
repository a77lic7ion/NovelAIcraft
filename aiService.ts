
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
  // Always prioritize the injected process.env.API_KEY for Vercel/Production
  const key = process.env.API_KEY || currentConfig.geminiApiKey || '';
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Executes an AI call using the configured provider.
 * Uses gemini-3-pro-preview for complex creative writing tasks.
 */
export const callAI = async (prompt: string, systemInstruction: string) => {
  if (currentConfig.provider === 'gemini') {
    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Upgraded for high-quality creative synthesis
        contents: prompt,
        config: { 
          systemInstruction,
          temperature: 0.8, // Better for creative writing
          topP: 0.95
        }
      });
      
      if (!response.text) throw new Error("Empty response from laboratory.");
      return response.text;
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found")) {
        // This usually triggers the API Key selection logic in specific environments
        console.error("API Key error. Please check your Studio Config.");
      }
      throw error;
    }
  } else {
    // Ollama integration for local-first privacy
    try {
      const response = await fetch(`${currentConfig.ollamaEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentConfig.ollamaModel,
          prompt: `System: ${systemInstruction}\n\nUser: ${prompt}`,
          stream: false,
        }),
      });
      
      if (!response.ok) throw new Error(`Ollama responded with ${response.status}`);
      const data = await response.json();
      return data.response;
    } catch (error) {
      throw new Error(`Ollama Error: ${error instanceof Error ? error.message : 'Connection to local engine failed'}`);
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
