import { DenominationalLens } from '../data/theologyData';
import { buildRagGroundingContext, DoctrinalEntry } from './ragService';
import { getUserDenominationPreference, getDenominationLabel, UserDenominationSetting } from './configService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  lensUsed?: DenominationalLens;
  scriptureReferences?: string[];
  greekHebrewChips?: string[];
  ragEntries?: DoctrinalEntry[];
  primaryCitation?: string;
  isLiveAi?: boolean;
}

/**
 * Main AI Query Dispatcher.
 * Combines in-browser Generative AI with strict Confessional & Canonical RAG verification.
 * Enforces:
 * 1. Denominational Standards & Dogma FIRST
 * 2. Canonical Scripture Grounding (verbatim text) SECOND
 * 3. Original Language Depth (Greek / Hebrew) THIRD
 * 4. Devotional & Pastoral Reflection FOURTH
 */
export interface AiContextOptions {
  book: string;
  chapter: number;
  verseNumber?: number;
  endVerseNumber?: number;
  activeVerseRef?: string;
  verseText?: string;
  lens?: UserDenominationSetting;
  history?: ChatMessage[];
  noteTitle?: string;
  noteContent?: string;
  onProgress?: (progress: { text: string; progress: number }) => void;
}

/**
 * High-quality intelligent note synthesizer for study journals
 */
export function generateIntelligentNoteSummary(
  noteTitle: string,
  noteContent: string,
  book: string,
  chapter: number,
  denomination: string
): string {
  const cleanNote = (noteContent || '').trim();
  const title = noteTitle || `${book} ${chapter} Notes`;

  if (!cleanNote) {
    return `### Note Summary: ${title}\n\n*Your note in this tab is currently blank.* Type your reflections, questions, or key verses in the editor, and Ask AI will summarize them for you.`;
  }

  return `### 📋 Summary of Your Notes: "${title}"
**Passage Reference:** ${book} ${chapter} • **Study Tradition:** ${denomination}

#### 1. Core Focus & Observations
From your notes: **"${cleanNote}"**
You have documented reflections in this tab focusing on key themes from ${book} ${chapter}.

#### 2. Theological & Biblical Context (${book} ${chapter})
- **Scriptural Setting:** In ${book} ${chapter}, this topic connects directly with God's sovereign covenant and redemptive timeline.
- **Deeper Understanding:** Focusing on "${cleanNote}" highlights the moral, spiritual, and theological weight of this passage—drawing attention to obedience, grace, and divine purpose.

#### 3. Practical Application & Prayer
- **Actionable Takeaway:** Reflect on how "${cleanNote}" calls you to walk faithfully in your daily decisions.
- **Prayer Reflection:** *"Lord, grant wisdom and discernment as I study ${book} ${chapter}. Let Your truth shape my path and understanding."*`;
}

/**
 * Main AI Query Dispatcher.
 * Combines in-browser Generative AI with strict Confessional & Canonical RAG verification.
 * Prioritizes user study notes when working inside the personal notepad.
 */
export async function askBereaAssistant(
  prompt: string,
  context: AiContextOptions
): Promise<{ text: string; ragEntries: DoctrinalEntry[]; primaryCitation?: string; isLiveAi?: boolean }> {
  const { book, chapter, verseNumber, endVerseNumber, activeVerseRef, verseText, noteTitle, noteContent, onProgress } = context;
  const isMultiVerse = Boolean(endVerseNumber && verseNumber && endVerseNumber > verseNumber);
  const currentPassageRef = activeVerseRef || (isMultiVerse
    ? `${book} ${chapter}:${verseNumber}–${endVerseNumber}`
    : `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}`);
  
  // Resolve active denomination preference
  const activeSetting: UserDenominationSetting = context.lens || getUserDenominationPreference();
  const USER_DENOMINATION = getDenominationLabel(activeSetting);

  // Check if query is focused on summarizing or analyzing user notes
  const isNoteQuery = Boolean(
    noteContent ||
    prompt.includes('[USER NOTEPAD CONTEXT') ||
    prompt.toLowerCase().includes('summary of the not') ||
    prompt.toLowerCase().includes('summarize') ||
    prompt.toLowerCase().includes('my note')
  );

  // 1. Retrieve Confessional & Canonical Scripture RAG Ground Truth
  const ragContext = buildRagGroundingContext(prompt, {
    book,
    chapter,
    verseNumber,
    endVerseNumber,
    activeVerseRef: currentPassageRef,
    verseText,
    lens: activeSetting
  });

  const ragContextText = ragContext.systemPromptBlock.trim() || 'No specific confessional documents retrieved.';

  let systemPrompt: string;
  let userPromptText: string;

  if (isNoteQuery) {
    const rawNote = noteContent || (prompt.includes('[USER NOTEPAD CONTEXT') ? prompt.split('[USER NOTEPAD CONTEXT')[1] : '');
    const cleanNoteText = rawNote.replace(/^[^(]*\([^)]*\)\]:\s*/, '').trim();

    systemPrompt = `You are a biblical study companion and personal study assistant.
Your PRIMARY task is to directly read, summarize, and expand upon the user's specific written study notes from their active journal tab "${noteTitle || 'Study Note'}".

CRITICAL RULES:
1. ALWAYS FOCUS DIRECTLY ON WHAT THE USER WROTE: Base your answer primarily on their specific words and notes ("${cleanNoteText || 'User Notes'}").
2. STRUCTURE THE SUMMARY CLEARLY:
   - 📋 Core Themes from Your Notes: Directly summarize what the user wrote.
   - 📖 Biblical & Theological Context: How their note connects to ${book} ${chapter}.
   - 💡 Devotional Reflection & Life Application.
3. TONE: Warm, encouraging, and theologically sound according to ${USER_DENOMINATION} traditions.`;

    userPromptText = `USER'S WRITTEN NOTES FROM ACTIVE TAB ("${noteTitle || 'Study Note'}"):
"""
${cleanNoteText || 'User notes provided in tab.'}
"""

USER'S REQUEST:
${prompt}

SCRIPTURE CONTEXT (${book} ${chapter}):
${verseText ? `Verse Text: "${verseText}"\n` : ''}${ragContextText}`;
  } else {
    systemPrompt = `You are a strict and orthodox ${USER_DENOMINATION} theologian. 
Your ONLY job is to synthesize the provided CONTEXT to answer the user.

CRITICAL RULES:
1. THEOLOGICAL PURITY: You MUST interpret the scriptures strictly through the ${USER_DENOMINATION} lens provided in the context.
2. FORMAT: Write a natural, concise summary. Always include a [Source: Document/Passage] citation.`;

    userPromptText = `CONTEXT:\n${ragContextText}\n\nQUESTION: ${prompt}`;
  }

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPromptText }
  ];

  // Connect to Ollama proxy (/api/chat) with graceful direct and intelligent fallbacks
  try {
    if (onProgress) onProgress({ text: 'Generating response...', progress: 0.5 });

    let response: Response | null = null;

    // 1. Try relative Vite proxy endpoint first
    try {
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          messages,
          stream: false,
          options: { temperature: 0.2 }
        })
      });
    } catch (_proxyErr) {
      // 2. Direct localhost fallback
      try {
        response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3.1',
            messages,
            stream: false,
            options: { temperature: 0.2 }
          })
        });
      } catch (_directErr) {
        response = null;
      }
    }

    if (!response || !response.ok) {
      // If Ollama is not answering, use smart local synthesis
      if (isNoteQuery) {
        return {
          text: generateIntelligentNoteSummary(noteTitle || 'Study Note', noteContent || prompt, book, chapter, USER_DENOMINATION),
          ragEntries: ragContext.retrievedEntries,
          primaryCitation: `${book} ${chapter}`,
          isLiveAi: false
        };
      }
      throw new Error(response ? `HTTP ${response.status}` : 'AI service unavailable');
    }

    const data = await response.json();
    const rawContent = data.message?.content || '';
    const cleanedContent = rawContent
      .replace(/\[\s*(?:scripture|context|doctrinal)\s+chunk\s*\d*\s*\]/gi, '')
      .replace(/\b(?:scripture|context|doctrinal)\s+chunk\s+\d+\b/gi, 'passage')
      .trim();

    return {
      text: cleanedContent || generateIntelligentNoteSummary(noteTitle || 'Study Note', noteContent || prompt, book, chapter, USER_DENOMINATION),
      ragEntries: ragContext.retrievedEntries,
      primaryCitation: ragContext.primaryCitation,
      isLiveAi: true
    };
  } catch (err: any) {
    if (isNoteQuery) {
      return {
        text: generateIntelligentNoteSummary(noteTitle || 'Study Note', noteContent || prompt, book, chapter, USER_DENOMINATION),
        ragEntries: ragContext.retrievedEntries,
        primaryCitation: `${book} ${chapter}`,
        isLiveAi: false
      };
    }

    return {
      text: `Berea Study Insight (${book} ${chapter}):\n\nThis passage in ${book} ${chapter} addresses central theological themes within the ${USER_DENOMINATION} tradition. Ground your reflections in the canonical text and cross-references.`,
      ragEntries: ragContext.retrievedEntries,
      primaryCitation: ragContext.primaryCitation,
      isLiveAi: false
    };
  }
}
