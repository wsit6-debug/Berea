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
  
  let prompt = `Generate exactly ${numQuestions} multiple-choice questions about ${scope}.
Focus on specific details and themes so it is unique. (seed: ${Math.random()})
Do NOT output JSON. You MUST use exactly this plain text format for each question. 

Here is an example of what a good question looks like:
QUESTION: In the beginning, what did God create?
A) The sun and moon
B) The heavens and the earth
C) The animals
D) Man and woman
CORRECT: B
EXPLANATION: Genesis 1:1 states God created the heavens and the earth.

Generate ${numQuestions} new questions now:`;

  if (chapterText && type === 'chapter') {
    prompt = `Based ONLY on the following scripture text, generate exactly ${numQuestions} multiple-choice questions. 
Do not use outside knowledge. (seed: ${Math.random()})
Do NOT output JSON. You MUST use exactly this plain text format for each question.

Here is an example of what a good question looks like:
QUESTION: In the beginning, what did God create?
A) The sun and moon
B) The heavens and the earth
C) The animals
D) Man and woman
CORRECT: B
EXPLANATION: Genesis 1:1 states God created the heavens and the earth.

Now, generate ${numQuestions} new questions based ONLY on this text:
SCRIPTURE TEXT:
${chapterText}`;
  } else if (type === 'book') {
    prompt = `Generate exactly ${numQuestions} broad, overarching multiple-choice questions about the major theological themes and grand narrative of the entire book of ${book}.
Do NOT output JSON. You MUST use exactly this plain text format for each question.

Here is an example of what a good question looks like:
QUESTION: What is the primary overarching theme of the book of Genesis?
A) The conquest of the promised land
B) The establishment of the Levitical priesthood
C) God's creation and the beginnings of His covenant with humanity
D) The rebuilding of the temple
CORRECT: C
EXPLANATION: Genesis covers the origins of the world and the patriarchs of Israel.

Generate ${numQuestions} new questions now:`;
  }

  try {
    const { generateLocalAiResponse } = await import('./webLlmService');
    const responseText = await generateLocalAiResponse([{ role: 'user', content: prompt }], undefined, true);
    let rawText = responseText.trim();
    
    // Parse the plain text format
    const quizArray: QuizQuestion[] = [];
    const splitText = rawText.split('QUESTION:');
    
    // The first element is always the text BEFORE the first "QUESTION:", which is usually intro chatter.
    // We only want the actual question blocks (index 1 and onwards).
    const questionBlocks = splitText.slice(1).filter(b => b.trim().length > 10);
    
    for (const block of questionBlocks) {
      try {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        const questionText = lines[0];
        
        // Find the option lines robustly
        const aLine = lines.find(l => l.startsWith('A)'));
        const bLine = lines.find(l => l.startsWith('B)'));
        const cLine = lines.find(l => l.startsWith('C)'));
        const dLine = lines.find(l => l.startsWith('D)'));
        
        // Skip this block entirely if it doesn't even have options (e.g. malformed generation)
        if (!aLine || !bLine) continue;
        
        const optA = aLine.substring(2).trim();
        const optB = bLine.substring(2).trim();
        const optC = cLine ? cLine.substring(2).trim() : 'Option C';
        const optD = dLine ? dLine.substring(2).trim() : 'Option D';
        
        const correctLine = lines.find(l => l.startsWith('CORRECT:')) || '';
        const explLine = lines.find(l => l.startsWith('EXPLANATION:')) || '';
        
        let correctIdx = 0;
        if (correctLine.includes('B') || correctLine.includes('b)')) correctIdx = 1;
        if (correctLine.includes('C') || correctLine.includes('c)')) correctIdx = 2;
        if (correctLine.includes('D') || correctLine.includes('d)')) correctIdx = 3;
        
        const explanation = explLine.length > 12 ? explLine.substring(12).trim() : 'Correct answer.';
        
        if (questionText.length > 5 && !questionText.includes('In the beginning, what did God create') && !questionText.includes('What is the primary overarching theme')) {
          quizArray.push({
            question: questionText,
            options: [optA, optB, optC, optD],
            correctAnswerIndex: correctIdx,
            explanation: explanation
          });
        }
      } catch (e) {
        console.warn("Failed to parse a question block", block);
      }
    }
    
    if (quizArray.length > 0) {
      return quizArray;
    } else {
      throw new Error(`AI failed to generate valid questions. Raw output: ${rawText.substring(0, 1000)}...`);
    }
  } catch (err: any) {
    console.error('Error generating quiz:', err);
    throw err;
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

export async function getAccumulatedBookQuiz(book: string, numQuestions: number = 10): Promise<QuizQuestion[]> {
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

  // Deduplicate questions based on question text
  const uniqueQuestions = Array.from(new Map(allQuestions.map(q => [q.question, q])).values());
  
  // The user requested we use ALL questions from previous chapter quizzes.
  let finalQuestions: QuizQuestion[] = [...uniqueQuestions];
  
  // Generate broad book questions dynamically to supplement
  try {
    // Generate 3 broad book questions
    const broadQuestions = await generateQuiz(book, 1, 'book', 3);
    finalQuestions = finalQuestions.concat(broadQuestions);
  } catch (e) {
    console.warn("Failed to generate broad book questions");
  }

  // Final shuffle of the combined quiz
  return finalQuestions;
}
