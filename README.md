
# 🖋️ NovelAIcraft

### *The Professional Laboratory for Modern Novelists*

[![License: MIT](https://img.shields.io/badge/License-MIT-primary.svg)](https://opensource.org/licenses/MIT)
[![Engine: Gemini 3](https://img.shields.io/badge/AI-Gemini%203-blue.svg)](#)
[![Engine: Ollama](https://img.shields.io/badge/Local-Ollama-orange.svg)](#)
[![UI: Tailwind](https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4.svg)](#)

**NovelAIcraft** is a high-performance, aesthetically driven writing studio. It combines structured narrative planning with cutting-edge AI assistance, allowing authors to orchestrate complex plots and manage deep lore in a singular, distraction-free environment.

---

## ✨ Professional Studio Features

### 🏛️ Structured Manuscript Planning
Organize your narrative into **Acts and Scenes**. Each scene tracks word counts, reading time, and status, providing a macro view of your story's momentum.
*   **Plate Illustrations:** Add high-fidelity scene illustrations that are automatically formatted for print-quality "Plate" layouts.
*   **Real-time Analytics:** Track word count progress and pacing directly on your studio dashboard.

### 🧪 AI Laboratory Scan
*   **Manuscript Extraction:** Use the "Scan Lab" tool to parse your entire manuscript. The AI automatically identifies characters, lore, and items, updating your Codex entries with extracted traits, roles, and backgrounds.
*   **The Lock Mechanism:** Mark specific Codex entries as **Locked** to protect your hand-crafted details. The AI will respect your creativity and never overwrite locked files.
*   **Structured Import:** Quickly initialize complex characters like *Kara* or *Mirah* using the "Manual Protocol Import" which parses Role, Age, Personality, and Arcs from raw text.

### 📖 Book Jacket & Publishing Suite
*   **Cover Design:** Upload Front and Back covers with support for professional book dimensions (A5, A4, and US Letter).
*   **AI Marketing Blurbs:** Generate compelling "Back of the Book" synopses using the AI Assist tool, which analyzes your manuscript's themes and hooks.
*   **Professional PDF Export:** A dedicated print engine that generates publication-ready manuscripts. Includes covers, title pages, synopses, and correctly formatted interior chapters with indented paragraphs and serif typography.

### 🧠 The Workshop (AI Lab)
*   **Dual-Engine Support:** Seamlessly switch between **Google Gemini 3 Pro** (Cloud) and **Ollama** (Local/Private) models.
*   **Prose Synthesis:** Generate high-quality drafts or brainstorm plot twists directly within the editor.

---

## ⚙️ Configuration & Privacy

| Setting | Description |
| :--- | :--- |
| **Local Persistence** | Powered by **IndexedDB**. Your manuscripts and high-res images stay in your browser. |
| **Provider** | Toggle between Cloud (Gemini) or Local (Ollama). |
| **Gemini API Key** | Enter your key for premium cloud models (Gemini 3 Pro). |
| **Ollama Endpoint** | Default: `http://localhost:11434`. |

---

## 🎨 Design Philosophy
NovelAIcraft utilizes a **Noir-Industrial** aesthetic:
- **Primary:** `#2bee79` (Laboratory Green)
- **Surface:** `#121212` (Onyx Black)
- **Typography:** Spline Sans (UI) & Lora Serif (Prose) for immersive reading.
- **Layout:** Optimized for wide desktop displays and professional writing workflows.

---

## 🚀 Deployment

NovelAIcraft is built using a modern **ESM-only architecture** (no-build) for maximum portability.

### Environment Variables
To enable the AI laboratory, add your API key to your hosting environment:
- `API_KEY`: Your Google Gemini API Key.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
