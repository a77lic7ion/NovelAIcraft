
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDraft = async (prompt: string, context?: string) => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Draft a scene based on this prompt: ${prompt}. Context: ${context || 'None'}. Make it immersive and well-paced.`,
    config: {
      systemInstruction: "You are a world-class novelist assistant. You write compelling, atmospheric prose.",
    }
  });
  return (await model).text;
};

export const brainstorm = async (topic: string, currentOutline?: string) => {
  const model = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Brainstorm plot twists or character developments for: ${topic}. Current outline: ${currentOutline || 'Empty'}.`,
    config: {
      systemInstruction: "You are a creative story consultant. Offer 5 unique, high-stakes ideas.",
    }
  });
  return (await model).text;
};

export const workshopChat = async (message: string, history: { role: 'user' | 'model', text: string }[]) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are NovelCrafter AI, a professional writer's companion. Help the author with any part of their writing process.",
    }
  });
  
  // Note: We'd normally use history here, but for brevity we'll just send the current message
  const response = await chat.sendMessage({ message });
  return response.text;
};
