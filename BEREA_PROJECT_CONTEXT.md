# Berea — System Context & Prompt Engineering Guide for Gemini

> **Purpose**: Provide this document to an external Gemini session to brainstorm and generate prompt specifications for the Antigravity agent in the `wsit6-debug/Berea` repository.

---

## 1. Project Vision & Identity
- **Name**: Berea ("Removing Friction in Faith")
- **Biblical Inspiration**: Acts 17:11 — *“Now the Berean Jews were of more noble character than those in Thessalonica, for they received the message with great eagerness and examined the Scriptures every day to see if what Paul said was true.”*
- **Core Value Proposition**: An all-in-one Bible study platform combining parallel scripture reading, multi-denominational confessional theology, ancient geospatial mapping, Greek/Hebrew language tools, and in-browser AI assistance.

---

## 2. Technology Stack & Architecture
- **Framework**: React 19, TypeScript, Vite 6
- **Styling**: Vanilla CSS (`src/index.css`) + Tailwind CSS utility classes.
- **Design Aesthetic**: Premium, warm editorial "sacred paper" palette:
  - Backgrounds: `#FAF7F2` (cream), `#FAF5ED` (warm parchment), `#FFFFFF` (cards)
  - Borders & Accents: `#EBE5DC` (subtle border), `#B4793D` (gold/amber accent), `#D4A373` (warm secondary)
  - Typography/Text: `#26221F` (rich charcoal header/body), `#57524E` (muted secondary), `#78716C` (metadata)
  - Fonts: *Plus Jakarta Sans*, *Inter*, *JetBrains Mono*
- **Icons**: `lucide-react`
- **Mapping**: `leaflet` (via `OpenFreeMapWidget.tsx`) with zero-road ESRI ancient shaded relief hillshading
- **AI & RAG**:
  - `@mlc-ai/web-llm` (in-browser client-side WebGPU LLM inference)
  - `src/services/ragService.ts` (confessional corpus keyword tokenization and retrieval)
- **Scripture Data**:
  - Primary API: Bolls Life API (`https://bolls.life/get-chapter/...`)
  - Secondary Fallback: Bible-API (`https://bible-api.com/...`)
  - Local cached chapters in `localStorage`
- **Audio & Cues**: Web Speech API (`audioNarrationService.ts`) + Web Audio API synthesizer oscillators for tactile UI audio cues.

---

## 3. Core Features & File Map

### A. Navigation & Shell
- `src/App.tsx`: Central state machine (`bookId`, `chapterNum`, `activeLens`, `activeTranslation`, `selectedVerse`, `isAuthenticated`, modals).
- `src/components/Header.tsx`:
  - **Logo & Vision**: `BereaLogo` -> opens `PitchDeckAboutModal`.
  - **Passage Selector**: Button showing `{Book} {Chapter}` -> opens `BookSelectorModal`.
  - **Confessional Lens Selector**: Dropdown to switch between 7 traditions (automatically filters approved translations).
  - **Translation Selector**: Shows Bible translation badges with confessional approval indicators.
  - **Cmd+K Search**: Opens `SearchModal` (Scripture, locations, and theology search).
  - **Cmd+I Guide Toggle**: Collapses/expands the right-hand `BereaAiPanel`.
  - **Feedback Link**: Header button opening the Google Forms pastor feedback questionnaire in a new tab.
  - **Lock Button**: Clears authentication and triggers `LoginScreen`.

### B. Scripture Workspace
- `src/components/BibleReader.tsx`:
  - Main text viewport with verse-by-verse selection and multi-translation comparison.
  - Red-letter mode (`redLetterService.tsx`) highlighting the spoken words of Christ.
  - Audio narration controls (speed, voice picker, play/pause, tactile audio tone cues).
  - Personal study notes and verse bookmarking (persisted in `localStorage`).

### C. The Berea AI & Study Guide (`src/components/BereaAiPanel.tsx`)
1. **Theological Perspectives**: Confessional breakdowns across 7 traditions:
   - Catholic, Eastern Orthodox, Reformed/Presbyterian, Lutheran, Wesleyan/Methodist, Anglican, Baptist/Evangelical.
   - References Church Fathers, historic councils, and confessions (Trent, Westminster, Augsburg, 39 Articles, etc.).
2. **Historical & Ancient Geography** (`src/components/OpenFreeMapWidget.tsx`):
   - Interactive historical Leaflet map centered on biblical coordinates (`geoData.ts`).
   - Shows archaeological context, biblical events, and ancient travel routes.
3. **Cross References & Chain Links**: Direct cross-references linked to current verse.
4. **Original Languages**: Interlinear Greek (NT) / Hebrew (OT) Strong's concordance numbers and word definitions.
5. **Ask Berea AI**: Interactive chat using WebLLM or theological RAG synthesis.

### D. Modals & Ancillary Screens
- `BookSelectorModal.tsx`: Grid picker for all 66 OT/NT books and chapters.
- `SearchModal.tsx`: Global search across entire scripture corpus, theological entries, and map locations.
- `PitchDeckAboutModal.tsx`: Acts 17:11 vision, mission, and history of ancient Berea.
- `LoginScreen.tsx`: Security gate with SHA-256 timing-safe hash verification.
- `src/data/feedbackConfig.ts`: Direct link to Google Forms questionnaire for pastors and scholars.

---

## 4. How the Antigravity Agent Operates
When writing prompts for the Antigravity assistant in this repo, Gemini must follow these guidelines:

1. **Maximum Token Efficiency**: The agent follows strict operating rules: ultra-concise, zero preamble, immediate code diffs or targeted changes.
2. **Precise File References**: Always specify exact file paths (e.g., `src/components/Header.tsx`, `src/services/youversionService.ts`).
3. **State & Architecture Respect**:
   - Denomination changes must flow through `handleSelectLens` in `App.tsx`.
   - Translations must respect `getApprovedTranslationsForDenomination`.
   - Scripture navigation must call `handleSelectPassage(bookId, chapterNum, verseNum)`.
4. **Styling Consistency**: Retain the Berea warm editorial aesthetic (`#FAF7F2`, `#FAF5ED`, `#EBE5DC`, `#B4793D`, `#26221F`) and `ios-glass-btn` / `ios-icon-btn` utility classes. Do not introduce raw generic Bootstrap/Tailwind colors (e.g., plain blue `bg-blue-500` or raw green).

---

## 5. Ideal Prompt Formula for Gemini to Output

When Gemini produces a prompt for Antigravity, it should format it like this:

```markdown
**Task**: [1-sentence goal]
**Target Files**:
- `src/components/[Component].tsx`
- `src/data/[File].ts`

**Specification**:
1. [Exact state or prop change]
2. [Exact UI / logic modification]
3. [Edge cases, responsive behavior, or persistence]
```
