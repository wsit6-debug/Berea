import { DenominationalLens, DENOMINATIONS, getTheologicalInsight } from '../data/theologyData';
import { buildRagGroundingContext, DoctrinalEntry } from './ragService';
import { ScripturePassage } from '../data/scriptureCorpus';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

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
    verseText?: string;
    lens: DenominationalLens;
    history?: ChatMessage[];
    onProgress?: (progress: { text: string; progress: number }) => void;
  }
): Promise<{ text: string; ragEntries: DoctrinalEntry[]; primaryCitation?: string; isLiveAi?: boolean }> {
  const { book, chapter, verseNumber, verseText, lens, history = [], onProgress } = context;
  const currentPassageRef = `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}`;
  const activeDenom = DENOMINATIONS.find(d => d.id === lens) || DENOMINATIONS[0];
  const lensLabel = activeDenom.name;

  // 1. Retrieve Confessional & Canonical Scripture RAG Ground Truth (Strictly filtered to active tradition)
  const ragContext = buildRagGroundingContext(prompt, {
    book,
    chapter,
    verseNumber,
    verseText,
    lens
  });

  // 2. Build Dynamic System Prompt with Absolute Verbatim Quoting Constraints & Confessional Hierarchy
  const systemInstructions = `You are Berea AI, the theological study assistant inside the Berea Bible application.
Active Confessional Tradition: ${lensLabel} (${activeDenom.confessionalStandard})
Active Passage: ${currentPassageRef}${verseText ? ` ("${verseText}")` : ''}

${ragContext.systemPromptBlock}

===================================================================
MANDATORY CITATION & QUOTING INSTRUCTION (ABSOLUTE REQUIREMENT):
1. NEVER MAKE UP, REPHRASE, GUESS, OR PARAPHRASE SCRIPTURE QUOTES OR CONFESSIONAL CITATIONS.
2. IF YOU ARE QUOTING SCRIPTURE OR AN OFFICIAL CHURCH DOCUMENT, YOU MUST QUOTE THE EXACT, VERBATIM TEXT PROVIDED IN THE RAG GROUND TRUTH ABOVE. DO NOT ALTER A SINGLE WORD.
3. If a specific verse or document excerpt is NOT provided verbatim in the RAG Ground Truth above, cite only the book, chapter, and verse reference (e.g. "See Luke 1:35") without placing invented words inside quotation marks.
4. Any attempt to invent, fabricate, or hallucinate quotes is strictly prohibited.
===================================================================

CORE THEOLOGICAL INSTRUCTIONS:
1. ORDER OF ANSWER (DENOMINATIONAL STANDARDS FIRST):
   - Lead immediately with the official ${lensLabel} confessional standards and dogma FIRST (e.g. for Roman Catholic, cite the Catechism of the Catholic Church §490–493, Ineffabilis Deus 1854, Council of Trent, Lumen Gentium; for Orthodox, cite Ecumenical Councils/Fathers; for Reformed, Westminster/Heidelberg; for Lutheran, Augsburg Confession; etc.).
   - Follow with supporting Canonical Scripture passages quoting the exact verbatim text from the RAG Ground Truth above.
   - Include original Greek/Hebrew linguistic depth (lemmas, Strong's numbers, meanings).
   - End with a devotional reflection.

2. DOGMATIC ACCURACY:
   - In Roman Catholic dogma, the Blessed Virgin Mary was preserved immune from all stain of original sin from the moment of her conception (The Immaculate Conception, CCC §491) and lived without personal sin (CCC §493), through the unique merits of Jesus Christ the Savior.
   - In Luke 1:35, the Holy Spirit comes upon Mary and the power of the Most High overshadows her, so the child is called the Son of God. The angel Gabriel was a messenger sent by God, NOT the father of Jesus.

3. FORMATTING:
   - Format cleanly using markdown headers (###), bullet points, and blockquotes for verbatim quotes.`;

  // 3. Assemble Conversation History for Contextual Continuity
  const formattedHistory: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstructions }
  ];

  const recentHistory = history.filter(m => m.id !== 'welcome').slice(-6);
  for (const msg of recentHistory) {
    if (msg.sender === 'user') {
      formattedHistory.push({ role: 'user', content: msg.text });
    } else if (msg.sender === 'assistant') {
      formattedHistory.push({ role: 'assistant', content: msg.text });
    }
  }

  formattedHistory.push({ role: 'user', content: prompt });

  // 4. Execute 100% Live In-Browser WebGPU LLM Generation
  try {
    const { generateLocalAiResponse } = await import('./webLlmService');
    const generatedText = await generateLocalAiResponse(formattedHistory, onProgress);

    // Validate generated output against active dogma and obvious hallucinations
    const isValid = validateGeneratedResponse(generatedText, lens);

    if (isValid && generatedText && generatedText.trim().length > 50) {
      return {
        text: generatedText.trim(),
        ragEntries: ragContext.retrievedEntries,
        primaryCitation: ragContext.primaryCitation,
        isLiveAi: true
      };
    }
  } catch (err: any) {
    console.warn('WebLLM generation error, falling back to verified RAG exegesis:', err);
  }

  // 5. High-Fidelity Confessional RAG Synthesis (Guaranteed Zero Hallucinations)
  const fallbackResult = buildVerifiedRagSynthesis(prompt, {
    book,
    chapter,
    verseNumber,
    verseText,
    lens,
    lensLabel,
    activeDenom,
    ragContext
  });

  return {
    text: fallbackResult.text,
    ragEntries: ragContext.retrievedEntries,
    primaryCitation: ragContext.primaryCitation || fallbackResult.primaryCitation,
    isLiveAi: false
  };
}

/**
 * Validates that the generated LLM response does not contain blatant theological hallucinations
 * or direct contradictions of the active denomination's official dogma.
 */
function validateGeneratedResponse(text: string, lens: DenominationalLens): boolean {
  if (!text || text.length < 50) return false;
  const lower = text.toLowerCase();

  // Check for severe hallucinations (e.g. Gabriel as father of Jesus, fake Hagar/Rebecca adultery stories)
  if (lower.includes('father of jesus') && lower.includes('gabriel')) return false;
  if (lower.includes('deceived by jacob into marrying') || lower.includes('punished for her role in sarah')) return false;
  if (lower.includes('bible does not contain any direct references to the concept of "sins"')) return false;

  // In Catholic mode, check if the model falsely denied Mary's sinlessness
  if (lens === 'catholic') {
    if (lower.includes('not sinless') || lower.includes('not entirely sinless') || lower.includes('may not have been sinless') || lower.includes('mary was not sinless')) {
      return false;
    }
  }

  return true;
}

/**
 * Constructs an authentic, high-fidelity synthesis directly from the retrieved RAG ground truth.
 */
function buildVerifiedRagSynthesis(
  prompt: string,
  context: {
    book: string;
    chapter: number;
    verseNumber?: number;
    verseText?: string;
    lens: DenominationalLens;
    lensLabel: string;
    activeDenom: any;
    ragContext: { retrievedEntries: DoctrinalEntry[]; scripturePassages: ScripturePassage[]; primaryCitation?: string };
  }
): { text: string; primaryCitation?: string } {
  const { book, chapter, verseNumber, verseText, lens, lensLabel, activeDenom, ragContext } = context;
  const currentPassageRef = `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}`;
  const insight = getTheologicalInsight(book, chapter, verseNumber, verseText);

  // 1. Confessional Section (FIRST)
  let confessionalBlock = '';
  if (ragContext.retrievedEntries.length > 0) {
    const topDoc = ragContext.retrievedEntries[0];
    confessionalBlock = `### 1. **Official Confessional Standard & Dogma (${lensLabel})**
> **${topDoc.documentTitle} (${topDoc.citation} - ${topDoc.yearOrEra})**
> *Topic: ${topDoc.topic}*
> "${topDoc.fullExcerpt}"

**Core Confessional Teaching:**
${topDoc.coreDoctrine}`;
  } else {
    confessionalBlock = `### 1. **Official Confessional Standard & Dogma (${lensLabel})**
${insight.lensPerspectives[lens] || Object.values(insight.lensPerspectives)[0] || `According to ${lensLabel} confessional standards (${activeDenom.confessionalStandard}), doctrine is rooted in Scripture and historic ecclesiastical consensus.`}`;
  }

  // 2. Canonical Scripture Section (SECOND)
  let scriptureBlock = '### 2. **Canonical Scriptural Foundations**\n';
  if (ragContext.scripturePassages.length > 0) {
    scriptureBlock += ragContext.scripturePassages.map(p => `
* **${p.ref} (${p.translation}):**
  > *"${p.verbatimText}"*
  *(Theological Significance: ${p.theologicalTopic})*
`).join('\n');
  } else {
    scriptureBlock += `* **${currentPassageRef}:** ${verseText ? `*"${verseText}"*` : insight.conciseOverview}`;
  }

  // 3. Original Language Section (THIRD)
  let languageBlock = '';
  const langItems = ragContext.scripturePassages.flatMap(p => p.greekHebrew || []);
  if (langItems.length > 0) {
    languageBlock = `\n\n### 3. **Original Language Depth (Greek & Hebrew)**\n${langItems.map(l => `* **${l.transliteration}** (\`${l.term}\` - Strong's ${l.strongs}): ${l.meaning}`).join('\n')}`;
  } else if (insight.originalLanguageInsights && insight.originalLanguageInsights.length > 0) {
    languageBlock = `\n\n### 3. **Original Language Depth (Greek & Hebrew)**\n${insight.originalLanguageInsights.map(l => `* **${l.term}** (*${l.transliteration}* / ${l.originalScript} - Strong's ${l.strongsRef}): ${l.nuance}`).join('\n')}`;
  }

  // 4. Devotional Reflection (FOURTH)
  const applicationBlock = `\n\n### 4. **Spiritual & Devotional Reflection**
${insight.practicalApplication || 'Reflecting on this divine truth draws our hearts into deeper reverence for God\'s holiness, covenant love, and the unshakeable sufficiency of Christ\'s grace.'}`;

  const fullText = `${confessionalBlock}\n\n---\n\n${scriptureBlock}${languageBlock}\n\n---\n\n${applicationBlock}`;

  return {
    text: fullText,
    primaryCitation: ragContext.primaryCitation
  };
}

export async function generateQuiz(
  book: string,
  chapter: number,
  type: 'chapter' | 'book',
  numQuestions: number = 3,
  chapterText?: string
): Promise<QuizQuestion[]> {
  const scope = type === 'chapter' ? `chapter ${chapter} of the book of ${book}` : `the entire book of ${book}`;
  
  let prompt = `Generate a multiple-choice quiz about ${scope} with exactly ${numQuestions} questions.
Ensure that the questions focus on specific, randomly selected details, themes, or quotes from the text so that this quiz is unique and different every time it is generated. Avoid asking the same general questions. Include an element of randomness (seed: ${Math.random()}).
Respond strictly with a valid JSON array. Do not include markdown formatting like \`\`\`json or any other text before or after the array.
Each object in the array must match this schema:
{
  "question": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswerIndex": 0, // integer index of the correct option (0-3)
  "explanation": "Brief explanation of why this is the correct answer."
}`;

  if (chapterText && type === 'chapter') {
    prompt = `Based ONLY on the following scripture text from ${book} chapter ${chapter}, generate a multiple-choice quiz with exactly ${numQuestions} questions. 
Do not hallucinate or use outside knowledge. The correct answers MUST be provable from the provided text. Focus on specific details found in this text. (seed: ${Math.random()})
Respond strictly with a valid JSON array. Do not include markdown formatting like \`\`\`json or any other text before or after the array.
Each object in the array must match this schema:
{
  "question": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswerIndex": 0, // integer index of the correct option (0-3)
  "explanation": "Brief explanation referencing the specific part of the text."
}

SCRIPTURE TEXT:
${chapterText}`;
  }

  try {
    const { generateLocalAiResponse } = await import('./webLlmService');
    const responseText = await generateLocalAiResponse([{ role: 'user', content: prompt }]);
    
    // Clean up potential markdown formatting or extra text from the LLM
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('\`\`\`json')) cleanJson = cleanJson.substring(7);
    if (cleanJson.startsWith('\`\`\`')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('\`\`\`')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    cleanJson = cleanJson.trim();

    // Sometimes LLMs put text before the JSON array starts
    const bracketIndex = cleanJson.indexOf('[');
    const endBracketIndex = cleanJson.lastIndexOf(']');
    if (bracketIndex !== -1 && endBracketIndex !== -1) {
      cleanJson = cleanJson.substring(bracketIndex, endBracketIndex + 1);
    }

    const quiz: any = JSON.parse(cleanJson);
    if (Array.isArray(quiz) && quiz.length > 0) {
      const isValid = quiz.every(q => 
        q && 
        typeof q.question === 'string' && 
        Array.isArray(q.options) && 
        q.options.length > 0 && 
        typeof q.correctAnswerIndex === 'number'
      );
      if (isValid) {
        return quiz as QuizQuestion[];
      } else {
        throw new Error('Invalid JSON format returned from LLM: Missing required fields (question, options array, correctAnswerIndex)');
      }
    } else {
      throw new Error('Invalid JSON format returned from LLM: Not a valid non-empty array');
    }
  } catch (err) {
    console.error('Error generating quiz:', err);
    // Fallback static quiz if LLM fails
    const fallbackPool: QuizQuestion[] = [
      {
        question: `What is the overarching narrative purpose of the book of ${book}?`,
        options: ['To provide a detailed historical record of neighboring nations', 'To reveal God\'s character and His relationship with His people', 'To serve primarily as an agricultural manual', 'To document ancient philosophical debates'],
        correctAnswerIndex: 1,
        explanation: 'Biblical books primarily serve to reveal God\'s redemptive plan and His covenant relationship with humanity.'
      },
      {
        question: `When studying ${type === 'chapter' ? `chapter ${chapter} of ${book}` : `the book of ${book}`}, why is it important to consider the original historical context?`,
        options: ['Because it changes the modern literal translation', 'To properly understand the author\'s original intent and audience', 'Because the original languages are no longer understood', 'It is not important; the text only has modern meaning'],
        correctAnswerIndex: 1,
        explanation: 'Understanding the historical and cultural context is essential for accurate biblical exegesis.'
      },
      {
        question: `How does ${type === 'chapter' ? `${book} ${chapter}` : book} fit into the broader biblical canon?`,
        options: ['It is a completely standalone text with no relation to other books', 'It was written much later than the rest of scripture', 'It contributes to the unified narrative of God\'s redemptive history', 'It only applies to a specific ancient civilization'],
        correctAnswerIndex: 2,
        explanation: 'Each book of the Bible contributes uniquely to the overarching story of redemption.'
      },
      {
        question: `What is a common feature of the literary style found in ${book}?`,
        options: ['It utilizes ancient literary forms to convey theological truths', 'It is written entirely in modern scientific terms', 'It actively avoids using any metaphors or symbolism', 'It is primarily a collection of random proverbs'],
        correctAnswerIndex: 0,
        explanation: 'Biblical authors used various literary genres (narrative, poetry, prophecy) to communicate divine truth.'
      }
    ];

    // Shuffle and pick numQuestions
    const shuffled = [...fallbackPool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numQuestions);

    // If we need more questions than the pool has, pad with generic ones
    while (selected.length < numQuestions) {
      selected.push({
        question: `Detail from ${book} (Question ${selected.length + 1})`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswerIndex: 0,
        explanation: 'Fallback question.'
      });
    }

    return selected;
  }
}

// Local Storage Keys for Quiz Accumulation
const QUIZ_HISTORY_KEY_PREFIX = 'berea_quiz_history_';

export function saveChapterQuizToHistory(book: string, chapter: number, questions: QuizQuestion[]) {
  try {
    const key = `${QUIZ_HISTORY_KEY_PREFIX}${book}_${chapter}`;
    localStorage.setItem(key, JSON.stringify(questions));
  } catch (e) {
    console.warn('Failed to save quiz history to local storage', e);
  }
}

export function getAccumulatedBookQuiz(book: string, numQuestions: number = 10): QuizQuestion[] {
  let allQuestions: QuizQuestion[] = [];
  
  // Search local storage for all chapter quizzes for this book
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${QUIZ_HISTORY_KEY_PREFIX}${book}_`)) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data) as QuizQuestion[];
          allQuestions = allQuestions.concat(parsed);
        }
      } catch (e) {
        // ignore invalid json
      }
    }
  }

  if (allQuestions.length === 0) {
    return []; // Handled by caller to show error
  }

  // Deduplicate questions just in case, based on question text
  const uniqueQuestions = Array.from(new Map(allQuestions.map(q => [q.question, q])).values());

  // Shuffle and pick
  const shuffled = uniqueQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numQuestions);
}
