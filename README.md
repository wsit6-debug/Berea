# Berea — Removing Friction in Faith 📖✨

> *"Now the Bereans were of more noble character than the Thessalonians, for they received the word with all readiness of mind, and searched the scriptures daily, whether those things were so."*  
> — **Acts 17:11**

**Berea** is an advanced, high-performance theological workspace and Scripture study application designed for pastors, scholars, and everyday believers. It combines authentic multi-translation Scripture reading with the **Berea AI Guide**—a context-aware theological intelligence engine grounded in official historical confessional standards (Catholic, Reformed, Wesleyan, Anglican, Evangelical, and Historical-Grammatical traditions).

---

## 🚀 Quickstart & Installation

### Prerequisites
* **Node.js**: Version 18.0 or higher ([Download Node.js](https://nodejs.org/))
* **npm**: Version 9.0 or higher (comes bundled with Node.js)

### 1. Installation
Clone the repository and install all dependencies:
```bash
cd /Users/wsit6/Berea
npm install
```

### 2. Run the Local Development Server
Start Vite's ultra-fast development server:
```bash
npm run dev
```

Once started, open your browser and navigate to:
```
http://localhost:5173/
```

### 3. Build for Production
To compile and bundle the application for production deployment:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Cmd + K`** / **`Ctrl + K`** | Open Global Scripture & Theology Search |
| **`Cmd + I`** / **`Ctrl + I`** | Toggle the **Berea AI Guide** Sidebar |
| **`Esc`** | Close active modals / drawers |

---

## 🌟 Key Features

### 1. 🛡️ Official Doctrinal RAG (Retrieval-Augmented Generation)
* **Anti-Hallucination Engine:** Built-in semantic retrieval over authentic historical confessional documents:
  * **Catholic & Orthodox:** *Catechism of the Catholic Church (CCC)*, *Council of Trent*, *Second Vatican Council (Dei Verbum & Lumen Gentium)*, *St. Thomas Aquinas*, *St. Augustine*.
  * **Reformed & Covenantal:** *Westminster Confession of Faith (WCF)*, *Heidelberg Catechism*.
  * **Wesleyan & Arminian:** *John Wesley's Standard Sermons*, *Explanatory Notes on the NT*, *Methodist Articles of Religion*.
  * **Anglican & Liturgical:** *The Thirty-Nine Articles of Religion*, *Book of Common Prayer (BCP)*.
  * **Evangelical & Baptist:** *The Chicago Statement on Biblical Inerrancy*, *The Baptist Faith & Message (BF&M 2000)*, *The Lausanne Covenant*.
  * **Historical-Grammatical:** Scholarly ANE/Greco-Roman lexical and epistolary synthesis.

### 2. 📚 Multi-Translation Scripture Reader
* Fluid switching and side-by-side comparison across 6 major English translations: **KJV**, **ESV**, **NIV**, **NLT**, **NASB**, and **CSB**.
* Two reading modes: **Paragraph Flow** (narrative immersion) and **Verse-by-Verse** (analytical study).
* Adjustable typography sizing and high-contrast warm palette (`#FAF7F2` canvas, `#26221F` warm espresso text).

### 3. 🔴 Authentic Words of Christ (Red-Letter)
* Context-aware red-letter highlighting in rich biblical crimson (`#DC2626`).
* Intelligently separates dialogue narrative intro formulas (e.g. *"Jesus answered and said unto him,"*) from direct spoken discourse.

### 4. 🏛️ Original Language Depth (Greek & Hebrew)
* Instant access to Strong's Concordance references, original script (Greek/Hebrew), phonetic transliterations, and exegetical nuances for key lemmas.

### 5. 🗺️ OpenFreeMap Biblical Cartography
* Interactive geospatial atlas mapping biblical cities and ancient missionary routes (Jerusalem, Antioch, Athens, Rome, Ephesus, Berea, etc.).
* Switchable between **OpenFreeMap Vector** and **Esri Satellite Cartography**.

### 6. 🎙️ Text-to-Speech Audio Narration
* Integrated auditory narration with custom speed control (0.75x – 1.25x), auto-advancing verse playback, and audio cue feedback.

### 7. 📝 Study Notes & Offline Journal
* Save personal study notes and theological takeaways tied directly to specific scripture verses, persisted in secure browser local storage.

---

## 📂 Project Architecture

```text
Berea/
├── public/                 # Static assets & public files
├── src/
│   ├── components/         # React UI Components
│   │   ├── BibleReader.tsx               # Main Scripture Reader pane
│   │   ├── BereaAiPanel.tsx              # Berea AI Guide sidebar
│   │   ├── Header.tsx                    # Top navigation & controls
│   │   ├── BookSelectorModal.tsx         # 66-Book OT/NT picker
│   │   ├── SearchModal.tsx               # Cmd+K global search
│   │   ├── NotesDrawer.tsx               # Study notes journal
│   │   ├── OpenFreeMapWidget.tsx         # Leaflet biblical atlas
│   │   ├── DeviceMockup.tsx              # Mobile responsive preview
│   │   ├── MarkdownTheologyRenderer.tsx  # Scholar-grade markdown renderer
│   │   └── ErrorBoundary.tsx             # Graceful crash protection
│   ├── data/               # Static datasets & corpora
│   │   ├── bibleData.ts                  # Books, chapters, and preloaded verses
│   │   ├── theologyData.ts               # Theological insights, themes & lemmas
│   │   ├── doctrinalCorpus.ts            # Authoritative RAG confessional texts
│   │   └── geoData.ts                    # Biblical coordinates & journey routes
│   ├── services/           # Application logic & APIs
│   │   ├── aiService.ts                  # Berea AI prompt & exegesis engine
│   │   ├── ragService.ts                 # Confessional semantic retrieval engine
│   │   ├── youversionService.ts          # Multi-translation API & caching
│   │   ├── redLetterService.tsx          # Words of Jesus formatter
│   │   └── audioNarrationService.ts      # Web Speech API audio narration
│   ├── App.tsx             # Main Application root
│   ├── main.tsx            # React DOM mounting & ErrorBoundary
│   └── index.css           # Vanilla CSS Design System & Typography
├── index.html              # HTML5 entry point & Google Fonts
├── package.json            # Project dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 🛠️ Technology Stack

* **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Dev Server:** [Vite 6](https://vitejs.dev/)
* **Styling:** Vanilla CSS design system with curated warm aesthetic tokens
* **Icons:** [Lucide React](https://lucide.dev/)
* **Maps & GIS:** [Leaflet](https://leafletjs.com/) with [OpenFreeMap](https://openfreemap.org/) & Esri Satellite
* **Animation & Polish:** [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 📜 License
Private & Proprietary — Developed for the Berea Scripture & Theology Initiative.
