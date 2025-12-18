
# 🖋️ NovelAIcraft

### *The Professional Laboratory for Modern Novelists*

[![License: MIT](https://img.shields.io/badge/License-MIT-primary.svg)](https://opensource.org/licenses/MIT)
[![Engine: Gemini 3](https://img.shields.io/badge/AI-Gemini%203-blue.svg)](#)
[![Engine: Ollama](https://img.shields.io/badge/Local-Ollama-orange.svg)](#)
[![UI: Tailwind](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4.svg)](#)

**NovelAIcraft** is a high-performance, aesthetically driven writing studio. It combines structured narrative planning with cutting-edge AI assistance, allowing authors to orchestrate complex plots and manage deep lore in a singular, distraction-free environment.

---

## 🚀 Deployment on Vercel

NovelAIcraft is built using a modern **ESM-only architecture** (no-build) for maximum portability. When deploying to Vercel, keep the following in mind:

### 1. Environment Variables
To enable the AI laboratory, you must add your API key to Vercel:
- Go to **Project Settings > Environment Variables**.
- Add `API_KEY` with your Google Gemini API Key.
- Redeploy the project.

### 2. Console Warnings
You may notice a few warnings in the browser console during production:
- **Tailwind Play CDN:** The app currently uses the Play CDN for JIT styling. In a high-traffic production environment, it is recommended to transition to a compiled PostCSS build, but for personal studios, the current setup is fully functional.
- **Source Maps:** 404 errors for `.map` files can be ignored; these are only used for debugging in local development.

---

## ✨ Key Features

### 🏛️ Structured Manuscript Planning
Organize your narrative into **Acts and Scenes**. Each scene tracks word counts, reading time, and status, providing a macro view of your story's momentum.

### 🧪 The Workshop (AI Lab)
*   **Dual-Engine Support:** Seamlessly switch between **Google Gemini 3 Pro** (Cloud) and **Ollama** (Local/Private) models.
*   **Prose Synthesis:** Generate high-quality drafts or brainstorm plot twists directly within the editor.
*   **AI Synopsis:** Automatically generate one-sentence scene summaries to keep your outline current.

### 📖 World-Building Codex
A dedicated repository for your Characters, Locations, Lore, and Items. Cross-reference your world-building while you write.

---

## ⚙️ Configuration

| Setting | Description |
| :--- | :--- |
| **Provider** | Toggle between Cloud (Gemini) or Local (Ollama). |
| **Gemini API Key** | Enter your key for premium cloud models. |
| **Ollama Endpoint** | Default: `http://localhost:11434`. |

---

## 🎨 Design Philosophy
NovelAIcraft utilizes a **Noir-Industrial** aesthetic:
- **Primary:** `#2bee79` (Laboratory Green)
- **Surface:** `#121212` (Onyx Black)
- **Typography:** Spline Sans & Lora Serif for immersive reading.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
