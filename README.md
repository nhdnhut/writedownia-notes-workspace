# Writedownia - Journal, Notes, Flashcards & Distraction-Free Workspace

> A minimalist, responsive browser workspace unifying reflective journaling, structured note-taking, and flashcard learning.
> Authors: Nguyen Huynh Dang Nhut (@nhdnhut) & CodliRo
> Architecture: Client-Side Single Page Application (HTML5, Tailwind CSS, Lucide Icons, JavaScript ES6)

[![Frontend](https://img.shields.io/badge/Frontend-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript_ES6-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 1. Overview

Writedownia is a client-side digital writing sanctuary and personal knowledge organizer. Designed to eliminate the cognitive overhead and friction of commercial note-taking applications, Writedownia consolidates daily journals, conceptual notes, flashcard study decks, and productivity metrics into a clean, typography-focused browser interface.

### Key Capabilities

- Unified Workspace: Switch seamlessly between Journal entries, Category-organized Notes, Flashcards, and Focus settings.
- Retro-Minimalist Typography: Distinctive visual identity powered by Google Fonts (Jersey 10) and responsive Tailwind UI layouts.
- Spaced Repetition Decks: Create flashcard pairs with flip-card mechanics to reinforce memory retention.
- Local Data Sovereignty: All content is stored locally within browser `localStorage`. No cloud accounts, external databases, or third-party telemetry.
- Light and Dark Modes: Built-in CSS variable theme toggle for low-light writing sessions.

---

## 2. Directory Structure

```text
writedownia/
|-- index.html          # Single-page application shell and navigation layout
|-- style.css           # Theme styling, CSS variables, and layout overrides
|-- app.js              # Application state machine, DOM rendering, and storage engine
|-- .gitignore          # Git exclusion rules
|-- LICENSE             # MIT License
`-- README.md           # System documentation
```

---

## 3. Quickstart Guide

1. Clone the repository:
   ```bash
   git clone https://github.com/nhdnhut/writedownia.git
   cd writedownia
   ```

2. Open in browser:
   Double-click `index.html` or open via any web browser.

---

## 4. License

This project is licensed under the MIT License. Copyright (c) 2025-2026 CodliRo & Nguyen Huynh Dang Nhut (@nhdnhut).

