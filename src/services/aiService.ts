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
export async function askBereaAssistant(
  prompt: string,
  context: {
    book: string;
    chapter: number;
    verseNumber?: number;
    endVerseNumber?: number;
    activeVerseRef?: string;
    verseText?: string;
    lens?: UserDenominationSetting;
    history?: ChatMessage[];
    onProgress?: (progress: { text: string; progress: number }) => void;
  }
): Promise<{ text: string; ragEntries: DoctrinalEntry[]; primaryCitation?: string; isLiveAi?: boolean }> {
  const { book, chapter, verseNumber, endVerseNumber, activeVerseRef, verseText, history = [], onProgress } = context;
  const isMultiVerse = Boolean(endVerseNumber && verseNumber && endVerseNumber > verseNumber);
  const currentPassageRef = activeVerseRef || (isMultiVerse
    ? `${book} ${chapter}:${verseNumber}–${endVerseNumber}`
    : `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}`);
  
  // Resolve active denomination preference
  const activeSetting: UserDenominationSetting = context.lens || getUserDenominationPreference();
  const USER_DENOMINATION = getDenominationLabel(activeSetting);

  // 1. Retrieve Confessional & Canonical Scripture RAG Ground Truth (Strictly filtered to active tradition)
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

  const messages = [
    { 
      role: 'system' as const, 
      content: `You are a strict and orthodox ${USER_DENOMINATION} theologian. 
Your ONLY job is to synthesize the provided CONTEXT to answer the user.

CRITICAL RULES:
1. THEOLOGICAL PURITY: You MUST interpret the scriptures strictly through the ${USER_DENOMINATION} lens provided in the context. DO NOT import outside interpretations, secular views, or opposing denominational biases from your pre-training. 
2. NO EXTERNAL KNOWLEDGE: If the context does not explain the verse, do not invent an explanation. 
3. FORMAT: Write a natural, concise summary. Do not copy-paste raw formatting. Never refer to the text as "chunks" or output internal labels like "[scripture chunk]"—refer directly to the scripture passage (e.g. Matthew 16:18) or confessional document. Always include a [Source: Document/Passage] citation.` 
    },
    { role: 'user' as const, content: `CONTEXT:\n${ragContextText}\n\nQUESTION: ${prompt}` }
  ];

  // Connect the LLM Pipeline to Ollama (llama3.1)
  try {
    if (onProgress) onProgress({ text: 'Awaiting response from Ollama (llama3.1)...', progress: 0.5 });

    let response: Response;
    try {
      response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          messages,
          stream: false,
          options: { temperature: 0.1 }
        })
      });
    } catch (_directErr) {
      // In-browser fallback to Vite proxy in case of direct CORS or network error
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          messages,
          stream: false,
          options: { temperature: 0.1 }
        })
      });
    }

    if (!response.ok) {
      const errDetail = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errDetail || response.statusText}`);
    }

    const data = await response.json();
    const rawContent = data.message?.content || '';
    const cleanedContent = rawContent
      .replace(/\[\s*(?:scripture|context|doctrinal)\s+chunk\s*\d*\s*\]/gi, '')
      .replace(/\b(?:scripture|context|doctrinal)\s+chunk\s+\d+\b/gi, 'passage')
      .trim();

    return {
      text: cleanedContent,
      ragEntries: ragContext.retrievedEntries,
      primaryCitation: ragContext.primaryCitation,
      isLiveAi: true
    };
  } catch (err: any) {
    console.error('Ollama generation error:', err);
    return {
      text: `Error connecting to Ollama: ${err?.message || err}. Please ensure Ollama is running with 'ollama run llama3.1' at http://localhost:11434.`,
      ragEntries: ragContext.retrievedEntries,
      primaryCitation: ragContext.primaryCitation,
      isLiveAi: false
    };
  }
}
