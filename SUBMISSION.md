# Berea — Gloo AI Hackathon Submission

**Track:** Track 2 — Scripture Beyond the App (YouVersion & Biblica)  
**Challenge Lane:** Lane 2 — Access (Scripture Where Access Is Constrained)  
**License:** Open-Source [MIT License](LICENSE)  
**Institution:** George Fox University (Applied AI Institute)

---

## Project Overview

**Berea** is a sovereign, open-source theological study workspace built for pastors, scholars, and believers in low-connectivity or persecuted regions where accessing Scripture online creates digital risk. Inspired by Acts 17:11, Berea removes friction in personal and communal study by uniting parallel Scripture reading, ancient archaeological cartography, and interlinear Greek/Hebrew tools with a private, on-device theological AI guide.

Guided by the George Fox University promise to **"Be Known"**, Berea enables believers to engage Scripture across three dimensions:
- **Academically**: Through original Greek and Hebrew lemmas, historical context, and primary confessional standards.
- **Personally**: Through distraction-free study notes, custom view settings, and red-letter text formatting.
- **Spiritually**: Through interactive comprehension quizzes, study guides, and prayerful scripture engagement.

---

## Technical Architecture

- **Client-Side AI Inference:** Runs high-performance LLMs directly in the browser via `@mlc-ai/web-llm` (WebGPU) with automated local Ollama background orchestration (`llama3.1`).
- **Confessional RAG Engine:** Grounded in primary historical documents across Catholic, Reformed, Wesleyan, Anglican, and Evangelical traditions (Aquinas, Luther, Westminster, Trent, 39 Articles, BF&M) to eliminate hallucinations.
- **Biblical GIS & Cartography:** Interactive map tracking ancient Roman highway routes and archaeological sites compiled from Stanford ORBIS and Ancient World Mapping Center (AWMC) datasets.
- **Air-Gapped & Sovereign:** Zero remote server compute, zero tracking telemetry, and 100% offline capability.

---

## Build Period Testing

During the competition build period, Berea was tested and iterated with coworkers and family members engaged in regular Bible study. This feedback led directly to:
1. Adding tradition-specific confessional filtering so users receive answers aligned with their historical heritage.
2. Integrating interactive Chapter Comprehension Quizzes and printable Study Guides for small-group discipleship.
3. Ensuring complete offline functionality so the platform requires zero active internet connectivity once installed.

---

## Getting Started

See [README.md](README.md) for full installation instructions, keyboard shortcuts, and architectural documentation.
