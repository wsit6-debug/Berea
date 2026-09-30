import { getTheologicalInsight } from "../data/theologyData";
import { DenominationalLens } from '../data/theologyData';
import { buildRagGroundingContext, DoctrinalEntry } from './ragService';
import { getUserDenominationPreference, getDenominationLabel, UserDenominationSetting } from './configService';
import { MLCEngine } from '@mlc-ai/web-llm';
import { generateLocalAiResponse } from './webLlmService';
import { ScripturePassage } from '../data/scriptureCorpus';
import { getBook } from '../data/bibleData';
import { TypologyMotif, TypologyNode } from '../types';
import { getTypologyFromDatabase } from '../data/typologyDatabase';
import { searchApologetics, formatApologeticsForPrompt, apologeticToCitationEntry, ApologeticMatch } from './apologeticsService';

export type QuizStyle = 'multiple_choice' | 'true_false' | 'written' | 'mixed';

export interface WrittenGradingResult {
  score: number;
  grade: 'Excellent' | 'Good' | 'Needs Review';
  isCorrect: boolean;
  feedback: string;
  biblicalInsights?: string;
  modelAnswer?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  reference?: string;
  style?: QuizStyle;
  sampleAnswer?: string;
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

  // 1b. Retrieve Matching Christian Apologetics & Classical Defenses
  const apologeticMatches = searchApologetics(prompt, book, chapter);
  const primaryApologetic = apologeticMatches.length > 0 && apologeticMatches[0].score >= 6 ? apologeticMatches[0] : null;
  const apologeticsPromptBlock = primaryApologetic ? formatApologeticsForPrompt(apologeticMatches) : '';

  if (primaryApologetic) {
    ragContext.retrievedEntries.unshift(
      apologeticToCitationEntry(primaryApologetic, (activeSetting as any) || 'reformed')
    );
  }

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
  } else if (primaryApologetic) {
    systemPrompt = `You are a distinguished, orthodox ${USER_DENOMINATION} theologian and classical Christian apologist.
Your task is to synthesize the provided CONTEXT to answer the user's inquiry regarding biblical difficulties, theological questions, and apologetics.

CRITICAL RULES:
1. APOLOGETICS & DEFENSE INTEGRATION: A curated classical Christian defense addressing this specific challenge has been provided in the CONTEXT. You MUST formulate your response directly along the lines of this defense ("${primaryApologetic.defense}"). Emphasize these specific arguments, historical/linguistic distinctions, and theological resolutions.
2. THEOLOGICAL PURITY & SCRIPTURAL COHERENCE: Interpret the scriptures strictly through the ${USER_DENOMINATION} lens and the biblical defense provided. Defend the coherence, truthfulness, and divine inspiration of Scripture.
3. OBJECTIVE & UNBIASED SCHOLARLY TONE: Maintain a reverent, objective, and scholarly tone. Do NOT adopt, repeat, or echo loaded, pejorative, or biased language (e.g., never describe biblical texts, apostolic instructions, or Christian teachings as "oppressive", "draconian", "harmful", or "misogynistic"). State the passage and question neutrally (e.g., "In 1 Corinthians 14, Paul addresses the order and decorum of the gathered church..."). Address the theological and cultural context with clarity, charity, and historical depth.
4. CLEAR EXEGESIS: Clearly explain the literary genre, Hebrew/Greek terms, or historical backdrop mentioned in the defense to dismantle the objection.
5. FORMAT: Write a natural, articulate, and well-structured response. Never refer to "chunks" or internal labels. Cite the relevant biblical passage (${primaryApologetic.book} ${primaryApologetic.chapter}) and classical apologetics principles. Always include a [Source: Christian Apologetics (${primaryApologetic.book} ${primaryApologetic.chapter})] citation.`;

    userPromptText = `CONTEXT:
${apologeticsPromptBlock}

${ragContextText}

QUESTION: ${prompt}`;
  } else {
    systemPrompt = `You are a strict and orthodox ${USER_DENOMINATION} theologian. 
Your ONLY job is to synthesize the provided CONTEXT to answer the user.

CRITICAL RULES:
1. THEOLOGICAL PURITY: You MUST interpret the scriptures strictly through the ${USER_DENOMINATION} lens provided in the context. DO NOT import outside interpretations, secular views, or opposing denominational biases from your pre-training. 
2. NO EXTERNAL KNOWLEDGE: If the context does not explain the verse, do not invent an explanation. 
3. FORMAT: Write a natural, concise summary. Do not copy-paste raw formatting. Never refer to the text as "chunks" or output internal labels like "[scripture chunk]"—refer directly to the scripture passage (e.g. Matthew 16:18) or confessional document. Always include a [Source: Document/Passage] citation.`;

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
      if (primaryApologetic) {
        return {
          text: `### 🛡️ Classical Christian Defense: ${primaryApologetic.title} (${primaryApologetic.book} ${primaryApologetic.chapter})\n**Category:** ${primaryApologetic.category}\n\n#### The Common Objection / Question\n> "${primaryApologetic.objection}"\n\n#### The Classical Defense\n${primaryApologetic.defense}\n\n#### Contextual & Theological Harmonization\n- **Literary & Canonical Setting:** In ${primaryApologetic.book} ${primaryApologetic.chapter}, the passage is understood according to its authentic historical genre rather than modern secular assumptions.\n- **Resolution:** The apparent difficulty is harmonized through proper understanding of the biblical language, cultural setting, and classical theological consensus.\n- **Faith & Reason:** Classical Christian apologetics demonstrates that Scripture withstands critical scrutiny when evaluated with scholarly historical rigor.\n\n*[Source: Christian Apologetics (${primaryApologetic.book} ${primaryApologetic.chapter})]*`,
          ragEntries: ragContext.retrievedEntries,
          primaryCitation: `${primaryApologetic.book} ${primaryApologetic.chapter}`,
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
      primaryCitation: primaryApologetic ? `Christian Apologetics (${primaryApologetic.book} ${primaryApologetic.chapter})` : ragContext.primaryCitation,
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

    if (primaryApologetic) {
      return {
        text: `### 🛡️ Classical Christian Defense: ${primaryApologetic.title} (${primaryApologetic.book} ${primaryApologetic.chapter})\n**Category:** ${primaryApologetic.category}\n\n#### The Common Objection / Question\n> "${primaryApologetic.objection}"\n\n#### The Classical Defense\n${primaryApologetic.defense}\n\n#### Contextual & Theological Harmonization\n- **Literary & Canonical Setting:** In ${primaryApologetic.book} ${primaryApologetic.chapter}, the passage is understood according to its authentic historical genre rather than modern secular assumptions.\n- **Resolution:** The apparent difficulty is harmonized through proper understanding of the biblical language, cultural setting, and classical theological consensus.\n- **Faith & Reason:** Classical Christian apologetics demonstrates that Scripture withstands critical scrutiny when evaluated with scholarly historical rigor.\n\n*[Source: Christian Apologetics (${primaryApologetic.book} ${primaryApologetic.chapter})]*`,
        ragEntries: ragContext.retrievedEntries,
        primaryCitation: `${primaryApologetic.book} ${primaryApologetic.chapter}`,
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

/**
 * Curated, zero-hallucination fallback question generator for any Biblical book and chapter.
 * Used when WebLLM / WebGPU is unavailable, slow, or generates malformed output.
 */
/**
 * Shuffles an array of options while tracking and updating the correct answer index.
 * Guarantees that the correct answer is NOT always in the first position (Option A).
 */
export function shuffleQuizQuestion(q: QuizQuestion): QuizQuestion {
  const correctOptionText = q.options[q.correctAnswerIndex];
  // Create a shallow copy and Fisher-Yates shuffle
  const shuffled = [...q.options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const newIndex = shuffled.indexOf(correctOptionText);
  return {
    ...q,
    options: shuffled,
    correctAnswerIndex: newIndex >= 0 ? newIndex : 0,
    reference: q.reference
  };
}

/**
 * Curated, high-fidelity fallback question generator for any Biblical book and chapter.
 * Uses verified canonical metadata, original language lemmas, and theological loci
 * with authentic, challenging distractors and randomized answer positions.
 */
// Curated high-fidelity question library for prominent biblical chapters
export const CURATED_CHAPTER_QUIZZES: Record<string, QuizQuestion[]> = {
  'matthew_19': [
    {
      question: "In Matthew 19:3–9, when the Pharisees asked whether it is lawful for a man to divorce his wife for any cause, what foundational biblical basis did Jesus cite to affirm the lifelong union of marriage?",
      options: [
        "God's original creation order in Genesis ('He who created them from the beginning made them male and female... what God has joined together, let not man separate')",
        "Moses' certificate of divorce as the perpetual divine standard for marital separation",
        "Roman civil jurisprudence regarding marital dissolution and property division",
        "Rabbinic dispensations based on mutual financial incompatibility"
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 19:4–6, Jesus cites Genesis 1:27 and Genesis 2:24, declaring that marriage was instituted from the beginning as an indissoluble covenant union joined together by God Himself."
    },
    {
      question: "What did Jesus instruct the rich young ruler to do when he asked what he lacked to inherit eternal life (Matthew 19:16–22)?",
      options: [
        "Sell what you possess, give to the poor to have treasure in heaven, and come, follow Me.",
        "Devote himself to full-time rabbinic scholarship and fast three days every week.",
        "Offer a lavish peace offering at the temple altar in Jerusalem.",
        "Take a vow of silence and retreat to a desert monastic community."
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 19:21, Jesus exposed the young ruler's idol of earthly riches: 'If you would be perfect, go, sell what you possess and give to the poor, and you will have treasure in heaven; and come, follow me.'"
    },
    {
      question: "In Matthew 19:27–29, Peter asked what reward the disciples would receive for having left everything to follow Jesus. What did Christ promise them?",
      options: [
        "In the renewal of all things (palingenesia), they will sit on twelve thrones judging the twelve tribes, receive a hundredfold reward, and inherit eternal life.",
        "They will receive immediate immunity from Roman taxation and civic rule in Judea.",
        "They will inherit worldly palaces and executive positions in the Jerusalem Sanhedrin.",
        "They will be completely spared from earthly trials, persecutions, and physical death."
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 19:28–29, Jesus promises that in the regeneration of all things (palingenesia), the Twelve will sit on twelve thrones, and whoever has left houses, family, or lands for His name will receive a hundredfold and inherit eternal life."
    },
    {
      question: "How did Jesus respond when the disciples rebuked people for bringing little children to Him (Matthew 19:13–15)?",
      options: [
        "He welcomed them, declaring, 'Let the little children come to me and do not hinder them, for to such belongs the kingdom of heaven.'",
        "He told the parents that children should not interrupt serious rabbinic theological instruction.",
        "He instructed the parents to wait until the children reached twelve years of age.",
        "He sent the crowd away so the disciples could rest from their arduous journey."
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 19:14, Jesus welcomed the children with open arms, placing His hands on them in blessing and declaring that the kingdom belongs to those with childlike humility and trust."
    },
    {
      question: "After the rich young man walked away sorrowful, what did Jesus teach concerning wealth and the kingdom of God (Matthew 19:23–26)?",
      options: [
        "It is easier for a camel to go through the eye of a needle than for a rich person to enter the kingdom of God, but with God all things are possible.",
        "Material abundance is an infallible sign of moral perfection and divine favor in the kingdom.",
        "Wealthy individuals are automatically excluded from any possibility of divine redemption.",
        "Only people who take lifetime vows of poverty are capable of entering heaven."
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 19:24–26, Jesus declared the spiritual peril of wealth: 'It is easier for a camel to go through the eye of a needle than for a rich person to enter the kingdom of God,' adding, 'With man this is impossible, but with God all things are possible.'"
    }
  ],
  'matthew_16': [
    {
      question: "At Caesarea Philippi, what was Peter's confession when Jesus asked, 'Who do you say that I am?' (Matthew 16:15–16)",
      options: [
        "'You are the Christ, the Son of the living God.'",
        "'You are John the Baptist returned from the dead.'",
        "'You are Elijah the prophet preparing the way of the Lord.'",
        "'You are Jeremiah or one of the ancient prophets.'"
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 16:16, Simon Peter famously declares: 'You are the Christ, the Son of the living God,' to which Jesus answers that flesh and blood did not reveal this, but His Father in heaven."
    },
    {
      question: "In Matthew 16:18–19, what authority does Jesus confer following Peter's confession?",
      options: [
        "The keys of the kingdom of heaven, with authority to bind and loose on earth.",
        "Civil governorship over the province of Galilee and Judea.",
        "Hereditary high priesthood over the temple sacrifices in Jerusalem.",
        "Military command over the angelic legions at the Day of the Lord."
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 16:19, Jesus says: 'I will give you the keys of the kingdom of heaven, and whatever you bind on earth shall be bound in heaven, and whatever you loose on earth shall be loosed in heaven.'"
    },
    {
      question: "When Jesus revealed that He must go to Jerusalem, suffer many things, be killed, and on the third day be raised, what did He say when Peter rebuked Him (Matthew 16:21–23)?",
      options: [
        "'Get behind me, Satan! You are a hindrance to me; for you are not setting your mind on the things of God, but on the things of man.'",
        "'Blessed are you, Simon, for protecting your Master from harm.'",
        "'Go back to Galilee until you are ready to understand the prophets.'",
        "'Prepare a defense before the Roman governor Pontius Pilate.'"
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 16:23, Jesus strongly rebukes Peter for opposing the necessity of the Cross, identifying his protest as worldly thinking that aligns with the adversary."
    },
    {
      question: "What core condition does Jesus lay down for any who desire to come after Him (Matthew 16:24)?",
      options: [
        "'If anyone would come after me, let him deny himself and take up his cross and follow me.'",
        "'If anyone would come after me, let him acquire wealth to fund the disciples' journey.'",
        "'If anyone would come after me, let him achieve mastery of rabbinic oral tradition.'",
        "'If anyone would come after me, let him avoid all hardship and controversy.'"
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 16:24, Jesus presents self-denial and bearing the cross as the indispensable mark of true discipleship."
    }
  ],
  'matthew_17': [
    {
      question: "Which disciples accompanied Jesus up the high mountain where He was transfigured before them (Matthew 17:1)?",
      options: [
        "Peter, James, and John his brother",
        "Andrew, Philip, and Bartholomew",
        "Thomas, Matthew, and Simon the Zealot",
        "Judas Iscariot, Thaddaeus, and James the son of Alphaeus"
      ],
      correctAnswerIndex: 0,
      explanation: "Matthew 17:1 states that Jesus took with Him Peter and James, and John his brother, and led them up a high mountain by themselves."
    },
    {
      question: "Who appeared on the mountain talking with the transfigured Christ (Matthew 17:3)?",
      options: [
        "Moses and Elijah",
        "Abraham and David",
        "Isaiah and Jeremiah",
        "Enoch and Noah"
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 17:3, Moses (representing the Law) and Elijah (representing the Prophets) appeared, conversing with the glorious Christ."
    },
    {
      question: "When the disciples asked why the scribes say Elijah must come first, how did Jesus clarify the prophecy of Malachi (Matthew 17:10–13)?",
      options: [
        "He revealed that Elijah had already come in John the Baptist, who suffered at the hands of men.",
        "He stated that the scribes completely fabricated the prophecy of Elijah.",
        "He said Elijah would only appear at the final judgment after Jerusalem's fall.",
        "He told them that Peter was the literal reincarnation of Elijah."
      ],
      correctAnswerIndex: 0,
      explanation: "In Matthew 17:12–13, Jesus explained that Elijah had indeed come already, and the disciples understood that He was speaking of John the Baptist."
    }
  ],
  'john_3': [
    {
      question: "Who came to Jesus by night to inquire about His signs and divine authority (John 3:1–2)?",
      options: [
        "Nicodemus, a ruler of the Jews and member of the Pharisees",
        "Joseph of Arimathea, a wealthy counselor",
        "Caiaphas, the presiding high priest",
        "Zacchaeus, the chief tax collector in Jericho"
      ],
      correctAnswerIndex: 0,
      explanation: "John 3:1–2 introduces Nicodemus, a Pharisee and member of the Jewish ruling council (Sanhedrin), visiting Jesus at night."
    },
    {
      question: "According to Jesus in John 3:3–5, what is necessary for anyone to see and enter the kingdom of God?",
      options: [
        "One must be born again of water and the Spirit",
        "One must scrupulously fulfill all 613 precepts of the Mosaic code",
        "One must prove unbroken genealogical descent from Abraham",
        "One must undergo ceremonial ritual washings three times daily"
      ],
      correctAnswerIndex: 0,
      explanation: "In John 3:3–5, Jesus solemnly teaches: 'Truly, truly, I say to you, unless one is born again of water and the Spirit, he cannot enter the kingdom of God.'"
    },
    {
      question: "What Old Testament historical event does Jesus cite in John 3:14 to foreshadow His own saving crucifixion?",
      options: [
        "Moses lifting up the bronze serpent in the wilderness",
        "Abraham offering his son Isaac upon Mount Moriah",
        "The parting of the Red Sea during the Exodus",
        "Elijah calling down fire on Mount Carmel"
      ],
      correctAnswerIndex: 0,
      explanation: "In John 3:14–15, Jesus says: 'And as Moses lifted up the serpent in the wilderness, so must the Son of Man be lifted up, that whoever believes in him may have eternal life.'"
    }
  ],
  'romans_8': [
    {
      question: "What triumphant truth does Paul declare in the opening verse of Romans 8?",
      options: [
        "'There is therefore now no condemnation for those who are in Christ Jesus.'",
        "'The law is abolished and sin has no further consequence.'",
        "'All Israel will be redeemed without reference to faith.'",
        "'Tribulation and distress will never touch the believer's earthly body.'"
      ],
      correctAnswerIndex: 0,
      explanation: "Romans 8:1 proclaims the believer's secure justification: 'There is therefore now no condemnation for those who are in Christ Jesus.'"
    },
    {
      question: "According to Romans 8:28, what assurance is given to those who love God and are called according to His purpose?",
      options: [
        "All things work together for good for those who love God.",
        "Believers will achieve immediate worldly wealth and uninterrupted health.",
        "Persecution will cease completely in this present age.",
        "God guarantees exemption from physical mortality before the parousia."
      ],
      correctAnswerIndex: 0,
      explanation: "Romans 8:28 gives the enduring comfort: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.'"
    },
    {
      question: "In Romans 8:38–39, what does Paul triumphantly declare about the love of God in Christ Jesus?",
      options: [
        "Neither death nor life, angels nor rulers, nor anything else in all creation will be able to separate us from the love of God.",
        "God's love is conditional upon continuous perfect adherence to ceremonial laws.",
        "God's love is restricted exclusively to one earthly nation.",
        "Angelic powers have authority to sever a believer from divine grace."
      ],
      correctAnswerIndex: 0,
      explanation: "Romans 8:38–39 concludes with the unbreakable promise of eternal security and communion with God in Christ Jesus our Lord."
    }
  ],
  'genesis_1': [
    {
      question: "What were the very first words spoken by God in the creation account of Genesis 1 (Genesis 1:3)?",
      options: [
        "'Let there be light,' and there was light.",
        "'Let the waters under the heavens be gathered into one place.'",
        "'Let the earth bring forth living creatures according to their kinds.'",
        "'Let us make man in our image, after our likeness.'"
      ],
      correctAnswerIndex: 0,
      explanation: "Genesis 1:3 records God's first creative fiat: 'And God said, \"Let there be light,\" and there was light.'"
    },
    {
      question: "According to Genesis 1:26–27, what distinctive dignity distinguishes humanity from all other created animals?",
      options: [
        "Human beings were created in the image and likeness of God, male and female.",
        "Human beings were formed with physical immortality exempt from all earthly need.",
        "Human beings were endowed with supernatural angelic wings.",
        "Human beings were given absolute autonomous power independent of God."
      ],
      correctAnswerIndex: 0,
      explanation: "Genesis 1:26–27 reveals that God created man in His own image (Imago Dei), in the image of God He created them, male and female He created them."
    },
    {
      question: "On the sixth day, after completing the creation of the earth, animals, and humanity, how did God pronounce His creation (Genesis 1:31)?",
      options: [
        "'And God saw everything that he had made, and behold, it was very good.'",
        "'And God saw that the world was deficient and required immediate revision.'",
        "'And God saw that human nature was inherently corrupt from its origin.'",
        "'And God rested because His creative strength was depleted.'"
      ],
      correctAnswerIndex: 0,
      explanation: "Genesis 1:31 records that at the culmination of the creation week, 'God saw everything that he had made, and behold, it was very good.'"
    }
  ]
};

/**
 * Curated, high-fidelity fallback question generator for any Biblical book and chapter.
 * Supports multiple_choice, true_false, and written formats, and can dynamically produce
 * between 5 and 100 questions across canonical themes, verses, and theological insights.
 */
export function getCuratedFallbackQuiz(
  book: string,
  chapter: number,
  type: 'chapter' | 'book',
  chapterText?: string,
  numQuestions: number = 5,
  style: QuizStyle = 'multiple_choice'
): QuizQuestion[] {
  const normBook = book.toLowerCase().replace(/[^a-z0-9]/g, '');
  const bibleBook = getBook(book);
  const theme = bibleBook?.theme || 'God’s revelation and redemptive history';
  const author = bibleBook?.author || 'Biblical author';
  const category = bibleBook?.category || 'Scripture';
  const keyVerse = bibleBook?.keyVerse || `${book} ${chapter}`;
  const totalChapters = bibleBook?.chaptersCount || 1;

  // Plausible alternative biblical authors for distractors
  const candidateAuthors = ['Apostle Paul', 'Moses', 'David', 'John the Apostle', 'Jeremiah', 'Luke the Physician', 'Solomon', 'Isaiah', 'Peter']
    .filter(a => !author.toLowerCase().includes(a.toLowerCase()));

  // Plausible alternative themes for distractors
  const candidateThemes = [
    'Wilderness wanderings and tabernacle sacrificial regulations',
    'Rebuilding the walls of Jerusalem amidst Persian political opposition',
    'Apocalyptic visions of world empires and the Son of Man in Daniel',
    'Cycles of judges, moral apostasy, and tribal warfare in Canaan',
    'Wisdom discourses on the fleeting vanity of life under the sun',
    'Genealogies of post-exilic temple guards and levitical musicians',
    'Tactical defensive fortifications of ancient Jericho under Joshua',
    'Astronomical calendars for pagan agricultural festivals in Mesopotamia',
    'Roman civil tax registries and provincial administrative edicts in Samaria',
    'Disputations over Pharisaic oral traditions and ceremonial handwashing'
  ].filter(t => !theme.toLowerCase().includes(t.toLowerCase().slice(0, 15)));

  const baseQuestions: QuizQuestion[] = [];
  const seenQuestions = new Set<string>();

  const addUnique = (q: QuizQuestion) => {
    const key = q.question.toLowerCase().trim();
    if (!seenQuestions.has(key)) {
      seenQuestions.add(key);
      baseQuestions.push(q);
    }
  };

  // 1. Check curated chapter question bank
  const chapterKey = `${normBook}_${chapter}`;
  if (type === 'chapter' && CURATED_CHAPTER_QUIZZES[chapterKey]) {
    CURATED_CHAPTER_QUIZZES[chapterKey].forEach(q => addUnique({ ...q }));
  }

  // 2. Parse prominent spoken statements or key sentences from chapterText if available
  if (chapterText && chapterText.trim().length > 120) {
    const cleanText = chapterText.replace(/\s+/g, ' ').trim();
    const sentences = cleanText.split(/(?<=[.?!])\s+/).filter(s => s.length > 25 && s.length < 220);
    const spokenSentences = sentences.filter(s => /said|answered|commanded|cried|spoke|written|saith|declared|blessed|verily/i.test(s));

    spokenSentences.slice(0, 20).forEach((sent, sIdx) => {
      const cleanSent = sent.replace(/^["']|["']$/g, '').trim();
      const snippet = cleanSent.length > 45 ? `${cleanSent.slice(0, 42)}...` : cleanSent;
      const dist1 = candidateThemes[sIdx % candidateThemes.length];
      const dist2 = candidateThemes[(sIdx + 2) % candidateThemes.length];
      const dist3 = candidateThemes[(sIdx + 4) % candidateThemes.length];
      addUnique({
        question: `In ${book} ${chapter}, which biblical teaching corresponds to the proclamation "${snippet}"?`,
        options: [
          `"${cleanSent}"`,
          `"Depart from the covenant of your fathers and follow ${dist1}."`,
          `"Disregard divine law and establish ${dist2}."`,
          `"Place your reliance entirely upon ${dist3}."`
        ],
        correctAnswerIndex: 0,
        explanation: `In ${book} ${chapter}, scripture records: "${cleanSent.slice(0, 160)}..."`,
        reference: `${book} ${chapter}`
      });
    });
  }

  // 3. Generate dynamic theology & verse-grounded questions across verses / chapters
  const maxIterations = Math.max(numQuestions * 3, 60);
  for (let step = 1; step <= maxIterations; step++) {
    const sampleChapter = type === 'book' ? ((step % totalChapters) + 1) : chapter;
    const sampleVerse = Math.max(1, ((step * 3) % 25) + 1);
    const insight = getTheologicalInsight(book, sampleChapter, sampleVerse);
    const currentTheme = insight.theologicalThemes[0] || `${theme} in ${book} ${sampleChapter}`;
    const practicalApp = insight.practicalApplication || `Live in humble obedience and faith according to God's Word in ${book} ${sampleChapter}.`;
    const distractorA = candidateThemes[(step) % candidateThemes.length];
    const distractorB = candidateThemes[(step + 2) % candidateThemes.length];
    const distractorC = candidateThemes[(step + 4) % candidateThemes.length];

    // Theme question
    addUnique({
      question: type === 'book'
        ? `In chapter ${sampleChapter} of ${book}, what central theological theme is highlighted (related to verse ${sampleVerse})?`
        : `In ${book} ${chapter}, what core spiritual principle is emphasized in verse ${sampleVerse} and its context?`,
      options: [
        currentTheme,
        distractorA,
        distractorB,
        distractorC
      ],
      correctAnswerIndex: 0,
      explanation: `${book} ${sampleChapter} canonically articulates ${currentTheme.toLowerCase()}.`,
      reference: `${book} ${sampleChapter}:${sampleVerse}`
    });

    // Practical application question
    addUnique({
      question: type === 'book'
        ? `How does the inspired message of ${book} ${sampleChapter} (around verse ${sampleVerse}) guide Christian discipleship?`
        : `According to the message of ${book} ${chapter}:${sampleVerse}, how are believers called to respond in practical faithfulness?`,
      options: [
        practicalApp,
        'Encourages treating divine truth as purely abstract speculation divorced from righteous living',
        'Teaches believers to rely on self-righteous moral performance rather than divine grace',
        'Directs followers to isolate from Christian community and scriptural fellowship'
      ],
      correctAnswerIndex: 0,
      explanation: `Takeaway for ${book} ${sampleChapter}:${sampleVerse}: ${practicalApp}`,
      reference: `${book} ${sampleChapter}:${sampleVerse}`
    });

    // Original language / doctrinal question
    if (insight.originalLanguageInsights && insight.originalLanguageInsights.length > 0) {
      const lemma = insight.originalLanguageInsights[step % insight.originalLanguageInsights.length];
      if (lemma && lemma.term) {
        addUnique({
          question: `In biblical scholarship for ${book} ${sampleChapter}, what theological truth is conveyed through the term "${lemma.term}"?`,
          options: [
            lemma.nuance || `It underscores divine covenant faithfulness and truth.`,
            `It signifies administrative Roman civil taxation units in Judea`,
            `It describes ancient Phoenician maritime trading vessels`,
            `It denotes ceremonial harvest rations for desert nomads`
          ],
          correctAnswerIndex: 0,
          explanation: `In ${book}, "${lemma.term}" communicates: ${lemma.nuance || 'core theological truth'}.`,
          reference: `${book} ${sampleChapter}`
        });
      }
    }

    // Canonical & Authorial questions for book review (only added once)
    if (type === 'book' && step === 1) {
      const altAuthor1 = candidateAuthors[0];
      const altAuthor2 = candidateAuthors[1] || candidateAuthors[0];
      const altAuthor3 = candidateAuthors[2] || candidateAuthors[0];
      addUnique({
        question: `Which biblical author is canonically associated with the composition or primary witness of ${book}?`,
        options: [
          author,
          altAuthor1,
          altAuthor2,
          altAuthor3
        ],
        correctAnswerIndex: 0,
        explanation: `${book} is traditionally and canonically attributed to ${author}.`,
        reference: keyVerse
      });

      addUnique({
        question: `Within the biblical canon, which canonical genre does the book of ${book} represent?`,
        options: [
          category,
          category === 'Gospels' ? 'Apocalyptic Wisdom' : category === 'Pauline Epistles' ? 'Old Testament History' : 'General Epistles',
          category === 'Major Prophets' ? 'Minor Prophets' : category === 'Law' ? 'Poetry & Wisdom' : 'Historical Narrative',
          'Post-exilic Wisdom Poetry'
        ],
        correctAnswerIndex: 0,
        explanation: `${book} is classified canonically as ${category}.`,
        reference: keyVerse
      });
    }

    if (baseQuestions.length >= numQuestions * 3) break;
  }

  // Shuffle pool before styling
  for (let i = baseQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [baseQuestions[i], baseQuestions[j]] = [baseQuestions[j], baseQuestions[i]];
  }

  // 4. Adapt to requested QuizStyle
  const styledQuestions: QuizQuestion[] = [];
  const targetCount = Math.max(5, Math.min(100, numQuestions));
  const seenStyledKeys = new Set<string>();

  for (let i = 0; i < baseQuestions.length && styledQuestions.length < targetCount; i++) {
    const rawQ = baseQuestions[i];
    const qStyle: 'multiple_choice' | 'true_false' | 'written' =
      style === 'mixed'
        ? (i % 3 === 0 ? 'multiple_choice' : i % 3 === 1 ? 'true_false' : 'written')
        : style;

    let candidateQ: QuizQuestion;

    if (qStyle === 'true_false') {
      const isTrue = i % 2 === 0;
      let statement = '';
      let explanation = '';

      if (isTrue) {
        // True statement: using correct answer
        const cleanAns = rawQ.options[rawQ.correctAnswerIndex] || '';
        statement = rawQ.question.includes('?')
          ? `In ${rawQ.reference || `${book} ${chapter}`}, ${cleanAns.replace(/^["']|["']$/g, '').trim()}.`
          : `${rawQ.question}: ${cleanAns}`;
        explanation = rawQ.explanation || `This statement is true according to ${rawQ.reference || book}.`;
      } else {
        // False statement: using distractor
        const falseAns = rawQ.options[(rawQ.correctAnswerIndex + 1) % rawQ.options.length] || candidateThemes[0];
        statement = rawQ.question.includes('?')
          ? `In ${rawQ.reference || `${book} ${chapter}`}, scripture asserts that ${falseAns.replace(/^["']|["']$/g, '').trim()}.`
          : `${rawQ.question}: ${falseAns}`;
        explanation = `This statement is false. ${rawQ.explanation || `Scripture teaches the contrary in ${rawQ.reference || book}.`}`;
      }

      candidateQ = {
        question: statement.replace(/\s+/g, ' ').trim(),
        options: ['True', 'False'],
        correctAnswerIndex: isTrue ? 0 : 1,
        explanation,
        reference: rawQ.reference,
        style: 'true_false'
      };
    } else if (qStyle === 'written') {
      const sample = rawQ.options[rawQ.correctAnswerIndex] || rawQ.explanation;
      candidateQ = {
        question: rawQ.question.replace(/^In [^,]+,\s*/, '').replace(/\?$/, '') +
          `? Explain the biblical basis and theological significance based on ${rawQ.reference || `${book} ${chapter}`}.`,
        options: [],
        correctAnswerIndex: -1,
        sampleAnswer: `${sample}. ${rawQ.explanation || ''}`.trim(),
        explanation: rawQ.explanation,
        reference: rawQ.reference,
        style: 'written'
      };
    } else {
      // Multiple Choice
      candidateQ = shuffleQuizQuestion({
        ...rawQ,
        style: 'multiple_choice'
      });
    }

    const normKey = candidateQ.question.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenStyledKeys.has(normKey)) {
      seenStyledKeys.add(normKey);
      styledQuestions.push(candidateQ);
    }
  }

  // Safety fill: If still short of targetCount, synthesize distinctly numbered verse questions without duplicates
  let extraVerse = 1;
  while (styledQuestions.length < targetCount && extraVerse <= 60) {
    const qText = `According to ${book} ${chapter}, what spiritual lesson is demonstrated through verse ${extraVerse}?`;
    const normKey = qText.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenStyledKeys.has(normKey)) {
      seenStyledKeys.add(normKey);
      styledQuestions.push({
        question: qText,
        options: [
          `Faithful endurance and adherence to God's covenant Word`,
          `Worldly self-reliance apart from divine revelation`,
          `Adoption of regional pagan traditions and ceremonies`,
          `Abandonment of prayer and scriptural obedience`
        ],
        correctAnswerIndex: 0,
        explanation: `${book} ${chapter}:${extraVerse} calls believers to godly faithfulness and obedience.`,
        reference: `${book} ${chapter}:${extraVerse}`,
        style: style === 'mixed' ? (styledQuestions.length % 2 === 0 ? 'multiple_choice' : 'true_false') : style
      });
    }
    extraVerse++;
  }

  return styledQuestions.slice(0, targetCount);
}

function parseQuizQuestionObject(q: any, style: QuizStyle = 'multiple_choice'): QuizQuestion {
  let effectiveStyle: 'multiple_choice' | 'true_false' | 'written' = 'multiple_choice';

  if (q.style === 'written' || style === 'written') {
    effectiveStyle = 'written';
  } else if (q.style === 'true_false' || style === 'true_false') {
    effectiveStyle = 'true_false';
  } else if (style === 'mixed') {
    if (q.sampleAnswer || (Array.isArray(q.options) && q.options.length === 0) || q.type === 'written') {
      effectiveStyle = 'written';
    } else if (q.isTrue !== undefined || (Array.isArray(q.options) && q.options.length === 2 && q.options.includes('True'))) {
      effectiveStyle = 'true_false';
    } else {
      effectiveStyle = 'multiple_choice';
    }
  }

  if (effectiveStyle === 'true_false') {
    const isTrue = q.isTrue !== undefined
      ? Boolean(q.isTrue)
      : (typeof q.correctAnswer === 'string' && q.correctAnswer.toLowerCase().startsWith('t')) ||
        q.correctAnswerIndex === 0;

    return {
      question: q.question || 'True or False statement based on scripture',
      options: ['True', 'False'],
      correctAnswerIndex: isTrue ? 0 : 1,
      explanation: q.explanation || (isTrue ? 'This statement is factually true according to scripture.' : 'This statement is false according to scripture.'),
      reference: q.reference,
      style: 'true_false'
    };
  }

  if (effectiveStyle === 'written') {
    return {
      question: q.question || 'Written comprehension question based on the text',
      options: [],
      correctAnswerIndex: -1,
      sampleAnswer: q.sampleAnswer || q.correctAnswer || q.explanation || 'Accurate biblical comprehension of the passage.',
      explanation: q.explanation || '',
      reference: q.reference,
      style: 'written'
    };
  }

  // Multiple Choice
  let options: string[] = [];
  let index = 0;

  if (q.incorrectAnswers && q.correctAnswer) {
    options = [q.correctAnswer, ...q.incorrectAnswers];
    index = 0;
  } else if (q.options && q.correctAnswerText) {
    options = q.options;
    index = options.indexOf(q.correctAnswerText);
    if (index === -1) {
      index = options.findIndex((opt: string) => opt.includes(q.correctAnswerText) || q.correctAnswerText.includes(opt));
      if (index === -1) {
        options[0] = q.correctAnswerText;
        index = 0;
      }
    }
  } else if (Array.isArray(q.options) && typeof q.correctAnswerIndex === 'number') {
    options = q.options;
    index = q.correctAnswerIndex;
  } else {
    throw new Error('Malformed question format generated by AI.');
  }

  return shuffleQuizQuestion({
    question: q.question,
    options: options,
    correctAnswerIndex: index,
    explanation: q.explanation || '',
    reference: q.reference,
    style: 'multiple_choice'
  });
}

export async function generateQuiz(
  book: string,
  chapter: number,
  type: 'chapter' | 'book',
  numQuestions: number = 5,
  chapterText?: string,
  onProgress?: (generated: number, total: number) => void,
  abortSignal?: AbortSignal,
  style: QuizStyle = 'multiple_choice'
): Promise<QuizQuestion[]> {
  const bibleBook = getBook(book);
  const bookTheme = bibleBook?.theme || 'God’s revelation and redemptive history';
  const insight = getTheologicalInsight(book, chapter, 1);
  const targetCount = Math.max(5, Math.min(100, numQuestions));

  // Grounding context: Ensure the model ONLY sees facts from this chapter/book
  const contextPassage = chapterText && chapterText.trim().length > 40
    ? chapterText.slice(0, 3000)
    : `Book: ${book}, Chapter: ${chapter}. Central themes: ${insight.theologicalThemes.join(', ')}. Overview: ${insight.conciseOverview}`;

  const questions: QuizQuestion[] = [];
  const { generateLocalAiResponse } = await import('./webLlmService');

  onProgress?.(0, targetCount);

  // Generate in efficient batches of up to 4 questions per AI call to scale easily up to 100
  const batchSize = targetCount >= 15 ? 4 : targetCount >= 8 ? 3 : 1;

  while (questions.length < targetCount) {
    if (abortSignal?.aborted) {
      throw new Error('Quiz generation aborted');
    }

    const currentBatch = Math.min(batchSize, targetCount - questions.length);
    const previousTopics = questions.length > 0
      ? `\nQuestions already created (DO NOT duplicate):\n` +
        questions.slice(-6).map((q, idx) => `${idx + 1}. ${q.question}`).join('\n')
      : '';

    let prompt = '';
    if (style === 'true_false') {
      prompt = `You are a biblical scholar creating ${currentBatch} True or False question(s) (questions #${questions.length + 1} to #${questions.length + currentBatch} of ${targetCount}) based on ${type === 'chapter' ? `${book} ${chapter}` : `the book of ${book}`}.${previousTopics}
PASSAGE/THEMES: ${contextPassage}

Output ONLY a JSON array of ${currentBatch} object(s) with these exact keys:
- "question": string (A clear factual or counter-factual biblical statement to be judged True or False)
- "isTrue": boolean (true if factually true, false if false)
- "explanation": string (Clear theological reason why it is true or false)
- "reference": string (Scripture citation, e.g. ${book} ${chapter}:1)

DO NOT include markdown formatting. Output raw JSON only.`;
    } else if (style === 'written') {
      prompt = `You are a distinguished theological professor creating ${currentBatch} open-ended written comprehension question(s) (questions #${questions.length + 1} to #${questions.length + currentBatch} of ${targetCount}) based on ${type === 'chapter' ? `${book} ${chapter}` : `the book of ${book}`}.${previousTopics}
PASSAGE/THEMES: ${contextPassage}

Output ONLY a JSON array of ${currentBatch} object(s) with these exact keys:
- "question": string (An open-ended question prompting a written response testing biblical comprehension and practical theology)
- "sampleAnswer": string (The ideal comprehensive answer highlighting core truths and theological points)
- "explanation": string (Detailed theological context)
- "reference": string (Scripture citation)

DO NOT include markdown formatting. Output raw JSON only.`;
    } else if (style === 'mixed') {
      prompt = `You are a distinguished biblical scholar creating ${currentBatch} mixed-format question(s) (questions #${questions.length + 1} to #${questions.length + currentBatch} of ${targetCount}) based on ${type === 'chapter' ? `${book} ${chapter}` : `the book of ${book}`}.${previousTopics}
PASSAGE/THEMES: ${contextPassage}

Combine multiple formats into a varied examination. For each question, choose one format: "multiple_choice", "true_false", or "written".
Output ONLY a JSON array of ${currentBatch} object(s) matching their format:
For "multiple_choice":
- "style": "multiple_choice"
- "question": string
- "correctAnswer": string
- "incorrectAnswers": string[3]
- "explanation": string
- "reference": string

For "true_false":
- "style": "true_false"
- "question": string (Clear statement to be judged True or False)
- "isTrue": boolean
- "explanation": string
- "reference": string

For "written":
- "style": "written"
- "question": string (Open-ended analytical / theological prompt)
- "sampleAnswer": string
- "explanation": string
- "reference": string

DO NOT include markdown formatting. Output raw JSON only.`;
    } else {
      // Multiple Choice
      prompt = `You are a biblical scholar creating ${currentBatch} multiple-choice question(s) (questions #${questions.length + 1} to #${questions.length + currentBatch} of ${targetCount}) based on ${type === 'chapter' ? `${book} ${chapter}` : `the book of ${book}`}.${previousTopics}
PASSAGE/THEMES: ${contextPassage}

Output ONLY a JSON array of ${currentBatch} object(s) with these exact keys:
- "question": string
- "correctAnswer": string (the only factual, correct answer)
- "incorrectAnswers": string array of exactly 3 choices (These MUST FACTUALLY CONTRADICT the text and be UNEQUIVOCALLY FALSE)
- "explanation": string
- "reference": string (Scripture citation, e.g. ${book} ${chapter}:1)

DO NOT include markdown formatting. Output raw JSON only.`;
    }

    try {
      const responseText = await generateLocalAiResponse([{ role: 'user', content: prompt }], undefined, true);
      const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

      let parsedBatch: any[] = [];
      const arrayMatch = cleanText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        try {
          const arr = JSON.parse(arrayMatch[0]);
          if (Array.isArray(arr)) parsedBatch = arr;
        } catch {}
      }
      if (parsedBatch.length === 0) {
        const objMatch = cleanText.match(/\{[\s\S]*\}/);
        if (objMatch) {
          try {
            const obj = JSON.parse(objMatch[0]);
            if (obj && obj.question) parsedBatch = [obj];
          } catch {}
        }
      }

      if (parsedBatch.length > 0) {
        for (const item of parsedBatch) {
          if (questions.length < targetCount && item && item.question) {
            const candidate = parseQuizQuestionObject(item, style);
            const normKey = candidate.question.toLowerCase().replace(/[^a-z0-9]/g, '');
            const isDuplicate = questions.some(q => q.question.toLowerCase().replace(/[^a-z0-9]/g, '') === normKey);
            if (!isDuplicate) {
              questions.push(candidate);
            }
          }
        }
        onProgress?.(questions.length, targetCount);
      } else {
        throw new Error('Could not parse JSON question array');
      }
    } catch (err) {
      console.warn(`Fallback triggered during question generation at index ${questions.length}:`, err);
      const fallbackList = getCuratedFallbackQuiz(book, chapter, type, chapterText, targetCount * 2, style);
      for (const fb of fallbackList) {
        if (questions.length >= targetCount) break;
        const normKey = fb.question.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isDuplicate = questions.some(q => q.question.toLowerCase().replace(/[^a-z0-9]/g, '') === normKey);
        if (!isDuplicate) {
          questions.push({ ...fb });
        }
      }
      onProgress?.(questions.length, targetCount);
      break;
    }
  }

  // Final deduplication pass to guarantee zero duplicates
  const seenFinal = new Set<string>();
  const deduplicated = questions.filter(q => {
    const key = q.question.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenFinal.has(key)) return false;
    seenFinal.add(key);
    return true;
  });

  return deduplicated.slice(0, targetCount);
}

// Local Storage Keys for Quiz Accumulation
const QUIZ_HISTORY_KEY_PREFIX = 'berea_quiz_history_';

export function saveChapterQuizToHistory(
  book: string,
  chapter: number,
  questions: QuizQuestion[],
  style: QuizStyle = 'multiple_choice'
) {
  try {
    const key = `${QUIZ_HISTORY_KEY_PREFIX}${book}_${chapter}_${style}`;
    localStorage.setItem(key, JSON.stringify(questions));
  } catch (e) {
    console.warn('Failed to save quiz history to local storage', e);
  }
}

export async function getAccumulatedBookQuiz(
  book: string,
  numQuestions: number = 10,
  onProgress?: (generated: number, total: number) => void,
  abortSignal?: AbortSignal,
  style: QuizStyle = 'multiple_choice'
): Promise<QuizQuestion[]> {
  const targetCount = Math.max(5, Math.min(100, numQuestions));
  let allQuestions: QuizQuestion[] = [];

  // Search local storage for cached chapter quizzes for this book matching the style
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${QUIZ_HISTORY_KEY_PREFIX}${book}_`)) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data) as QuizQuestion[];
          const matching = style === 'mixed'
            ? parsed
            : parsed.filter(q => (q.style || 'multiple_choice') === style);
          allQuestions = allQuestions.concat(matching);
        }
      } catch (e) {
        // ignore invalid json
      }
    }
  }

  // Deduplicate questions based on question text
  const uniqueQuestions = Array.from(new Map(allQuestions.map(q => [q.question.toLowerCase().trim(), q])).values());
  let finalQuestions: QuizQuestion[] = [...uniqueQuestions];
  const initialCount = Math.min(finalQuestions.length, targetCount);
  onProgress?.(initialCount, targetCount);

  const needed = Math.max(0, targetCount - finalQuestions.length);
  if (needed > 0) {
    if (abortSignal?.aborted) throw new Error('Book quiz generation aborted');
    const bookQuestions = await generateQuiz(
      book,
      1,
      'book',
      needed,
      undefined,
      (currentGen) => {
        onProgress?.(Math.min(targetCount, initialCount + currentGen), targetCount);
      },
      abortSignal,
      style
    );
    finalQuestions = finalQuestions.concat(bookQuestions);
  }

  // Deduplicate combined accumulated questions and generated questions
  const seenBookKeys = new Set<string>();
  const deduplicatedBook = finalQuestions.filter(q => {
    const key = q.question.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenBookKeys.has(key)) return false;
    seenBookKeys.add(key);
    return true;
  });

  if (deduplicatedBook.length < targetCount) {
    const extraFallbacks = getCuratedFallbackQuiz(book, 1, 'book', undefined, targetCount * 2, style);
    for (const fb of extraFallbacks) {
      if (deduplicatedBook.length >= targetCount) break;
      const key = fb.question.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenBookKeys.has(key)) {
        seenBookKeys.add(key);
        deduplicatedBook.push(fb);
      }
    }
  }

  return deduplicatedBook.slice(0, targetCount);
}

/**
 * Intelligent local semantic evaluation fallback for student written answers
 */
export function evaluateWrittenAnswerLocally(
  question: string,
  userAnswer: string,
  sampleAnswer?: string,
  reference?: string
): WrittenGradingResult {
  const cleanAnswer = userAnswer.trim();
  const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;

  if (wordCount < 4) {
    return {
      score: 35,
      grade: 'Needs Review',
      isCorrect: false,
      feedback: 'Your answer is very brief. Try elaborating with more specific biblical context or theological reflection.',
      biblicalInsights: sampleAnswer || 'Consider the main themes of the passage and their application to faith.',
      modelAnswer: sampleAnswer
    };
  }

  // Key theological vocabulary to identify biblical depth
  const keyTheologyTerms = [
    'god', 'christ', 'jesus', 'lord', 'faith', 'grace', 'covenant', 'salvation',
    'righteousness', 'love', 'spirit', 'holy', 'prayer', 'gospel', 'redemption',
    'mercy', 'church', 'truth', 'resurrection', 'cross', 'forgiveness', 'sin',
    'repentance', 'law', 'promise', 'hope', 'discipleship', 'word', 'scripture',
    'father', 'sovereign', 'glory', 'eternal', 'obedience', 'creation', 'kingdom'
  ];

  const benchmarkWords = new Set<string>();
  const combinedBenchmark = `${question} ${sampleAnswer || ''}`.toLowerCase();
  combinedBenchmark.replace(/[^\w\s]/g, '').split(/\s+/).forEach(w => {
    if (w.length > 3) benchmarkWords.add(w);
  });

  const answerWords = cleanAnswer.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  let matches = 0;
  let theologyMatches = 0;

  answerWords.forEach(w => {
    if (benchmarkWords.has(w)) matches++;
    if (keyTheologyTerms.includes(w)) theologyMatches++;
  });

  let baseScore = 65;
  if (wordCount >= 25) baseScore += 15;
  else if (wordCount >= 12) baseScore += 10;
  else if (wordCount >= 7) baseScore += 5;

  if (matches >= 4) baseScore += 12;
  else if (matches >= 2) baseScore += 6;

  if (theologyMatches >= 3) baseScore += 8;
  else if (theologyMatches >= 1) baseScore += 4;

  const score = Math.min(98, Math.max(40, baseScore));
  const isCorrect = score >= 70;
  const grade: 'Excellent' | 'Good' | 'Needs Review' = score >= 88 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Review';

  let feedback = '';
  if (score >= 88) {
    feedback = `Exceptional response! You demonstrated strong theological grasp of the passage and articulated sound biblical principles clearly.`;
  } else if (score >= 70) {
    feedback = `Well stated. Your answer captures the central biblical truths of the text with solid comprehension.`;
  } else {
    feedback = `Good beginning. To strengthen your answer, incorporate more specific scripture context and doctrinal depth from the passage.`;
  }

  return {
    score,
    grade,
    isCorrect,
    feedback,
    biblicalInsights: sampleAnswer || `Key theological theme from ${reference || 'the active passage'}.`,
    modelAnswer: sampleAnswer
  };
}

/**
 * AI-powered grading function for student written responses
 */
export async function gradeWrittenAnswer(
  question: string,
  userAnswer: string,
  passageContext: string = '',
  sampleAnswer?: string,
  reference?: string
): Promise<WrittenGradingResult> {
  const trimmed = userAnswer.trim();
  if (!trimmed || trimmed.length < 5) {
    return {
      score: 0,
      grade: 'Needs Review',
      isCorrect: false,
      feedback: 'No substantive answer was provided. Please write a thoughtful response addressing the theological question.',
      biblicalInsights: sampleAnswer || 'Review the passage to understand the core biblical message.',
      modelAnswer: sampleAnswer
    };
  }

  try {
    const { generateLocalAiResponse } = await import('./webLlmService');
    const prompt = `You are a distinguished, encouraging biblical theology professor.
Grade the student's written response to this scripture quiz question.

QUESTION: "${question}"
PASSAGE REFERENCE: "${reference || ''}"
PASSAGE CONTEXT: "${passageContext.slice(0, 1200)}"
MODEL/BENCHMARK ANSWER: "${sampleAnswer || 'Scripturally sound comprehension of the passage'}"
STUDENT'S ANSWER: "${trimmed}"

Evaluate fairly based on theological accuracy and scriptural understanding:
- Score: integer between 0 and 100 (>= 70 is passing/correct)
- Grade: "Excellent" (score >= 88), "Good" (70-87), or "Needs Review" (< 70)
- isCorrect: boolean (true if score >= 70)
- feedback: 1-3 sentences of constructive, encouraging theological feedback
- biblicalInsights: A concise 1-2 sentence biblical insight or key canonical principle

Output ONLY a single raw JSON object with keys:
{
  "score": number,
  "grade": "Excellent" | "Good" | "Needs Review",
  "isCorrect": boolean,
  "feedback": string,
  "biblicalInsights": string
}
Do NOT include markdown formatting like \`\`\`json. Output raw JSON only.`;

    const response = await generateLocalAiResponse([{ role: 'user', content: prompt }], undefined, true);
    const cleaned = response.replace(/```json/gi, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (typeof parsed.score === 'number' && parsed.feedback) {
        const score = Math.min(100, Math.max(0, Math.round(parsed.score)));
        return {
          score,
          grade: parsed.grade || (score >= 88 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Review'),
          isCorrect: typeof parsed.isCorrect === 'boolean' ? parsed.isCorrect : score >= 70,
          feedback: parsed.feedback,
          biblicalInsights: parsed.biblicalInsights || sampleAnswer || '',
          modelAnswer: sampleAnswer
        };
      }
    }
  } catch (err) {
    console.warn('AI grading unavailable, using local semantic evaluator:', err);
  }

  return evaluateWrittenAnswerLocally(question, trimmed, sampleAnswer, reference);
}

export async function generateCharacterProfile(
  characterName: string, 
  book: string, 
  chapter: number, 
  textContext: string,
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<string> {
  const prompt = `You are a biblical scholar. The user wants to learn about "${characterName}".
Context: They are reading ${book} Chapter ${chapter}.

Task: Write a concise, theological, and historical biography of ${characterName}.
Include:
1. Who they are broadly in the biblical narrative.
2. What their specific role or action is in ${book} Chapter ${chapter}.

Format as 2-3 short, readable paragraphs. Do not use markdown headers, just plain text paragraphs.`;

  try {
    const response = await generateLocalAiResponse([{ role: 'user', content: prompt }], onProgress);
    return response || 'No profile generated.';
  } catch (err: any) {
    throw new Error('Failed to generate character profile: ' + err.message);
  }
}

/**
 * Evaluates whether a scripture verse is appropriate for a public, all-ages daily devotional.
 * Filters out sexual content, graphic violence, bloodshed, or jarring inappropriate themes.
 */
export function evaluateVerseAppropriateness(reference: string, text: string): { isAppropriate: boolean; reason?: string } {
  const combined = `${reference} ${text}`.toLowerCase();

  // 1. Sexual content, adultery, lust, explicit bodily descriptions
  const sexualTerms = [
    /\b(fornicat\w*|adulter\w*|prostitut\w*|whore\w*|harlot\w*|concubine\w*|nakedness|uncover\w* nakedness|circumcis\w*|womb|breast\w*|semen|carnal\b|lust\w*|defiled)\b/i,
  ];

  // 2. Graphic violence, slaughter, bloodshed, torture, brutality
  const violenceTerms = [
    /\b(slaughter\w*|bloodshed|dismember\w*|smote\b|behead\w*|massacre\w*|crush\w* heads|infant\w* dashed|dashed against|ravished|disembowel\w*|impale\w*|stoned to death|blood out of)\b/i,
  ];

  for (const pattern of sexualTerms) {
    if (pattern.test(combined)) {
      return { isAppropriate: false, reason: 'sexual themes or explicit bodily references' };
    }
  }

  for (const pattern of violenceTerms) {
    if (pattern.test(combined)) {
      return { isAppropriate: false, reason: 'graphic violence, brutality, or bloodshed' };
    }
  }

  return { isAppropriate: true };
}

export async function generateDailyVerseAndReflection(
  dateString: string,
  lens: string,
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<{ text: string; reference: string; reflection: string }> {
  let attempt = 0;
  const maxAttempts = 3;
  let rejectionFeedback = '';

  while (attempt < maxAttempts) {
    attempt++;
    const prompt = `You are a pastoral theologian from the ${lens} Christian tradition.
Task: Select an inspiring, edifying Verse of the Day for ${dateString} and write a short, 3-sentence devotional reflection on it strictly from a ${lens} theological perspective.

CRITICAL CONTENT EVALUATION RULES:
Before confirming your verse choice, you MUST evaluate it against strict devotional editorial standards:
1. REJECT INAPPROPRIATE CONTENT: Do NOT select any verse containing sexual themes, adultery, lust, explicit bodily descriptions, graphic violence, slaughter, gore, severe imprecatory curses, or obscure genealogies.
2. MUST SELECT EDIFYING PASSAGES: Choose a passage focused on God's grace, love, peace, faithfulness, comfort, wisdom, prayer, or holy living.
${rejectionFeedback ? `\nPREVIOUS REJECTION NOTICE: ${rejectionFeedback}\nPlease evaluate carefully and pick an entirely different, wholesome verse.` : ''}

Respond ONLY with a valid JSON object in exactly this format, with no markdown wrappers or additional text:
{
  "reference": "Book Chapter:Verse",
  "text": "The bible verse text...",
  "reflection": "Your 3-sentence devotional reflection..."
}`;

    if (onProgress) {
      onProgress({
        text: attempt === 1 ? 'Selecting and evaluating Verse of the Day...' : 'Re-evaluating verse selection for appropriateness...',
        progress: 0.3 * attempt
      });
    }

    try {
      const response = await generateLocalAiResponse([{ role: 'user', content: prompt }], onProgress);
      if (!response) throw new Error('Empty response');

      // Extract JSON block if it wrapped it in markdown
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      const data = JSON.parse(jsonStr);

      if (!data.reference || !data.text || !data.reflection) {
        throw new Error('Invalid format returned by AI');
      }

      // Perform evaluation check
      const evalResult = evaluateVerseAppropriateness(data.reference, data.text);
      if (!evalResult.isAppropriate) {
        console.warn(`[VOTD Evaluator] Rejected "${data.reference}" (${evalResult.reason}). Re-prompting for a different verse...`);
        rejectionFeedback = `The candidate "${data.reference}" was rejected during evaluation because it contains ${evalResult.reason}.`;
        continue;
      }

      return {
        reference: data.reference.trim(),
        text: data.text.trim(),
        reflection: data.reflection.trim()
      };
    } catch (err: any) {
      if (attempt >= maxAttempts) {
        console.warn('Failed to generate daily verse after max attempts:', err);
        break;
      }
    }
  }

  // Fallback to Psalm 119:105 if AI fails or exceeds retries
  return {
    reference: 'Psalm 119:105',
    text: 'Your word is a lamp to my feet and a light to my path.',
    reflection: 'Even when the way ahead seems uncertain, God\'s Word provides divine illumination and wisdom for each faithful step.'
  };
}

export { TYPOLOGY_CHAPTER_HASHMAP, getTypologyFromDatabase, hasAlternateMotif } from '../data/typologyDatabase';

export async function generateTypologyTracker(
  passageRef: string,
  _passageText: string,
  onProgress?: (progress: { text: string; progress: number }) => void,
  excludeMotif?: string
): Promise<TypologyMotif> {
  // Instant O(1) canonical database & hashmap retrieval (sub-150ms)
  if (onProgress) {
    onProgress({ text: `Locating canonical motifs for ${passageRef}...`, progress: 0.35 });
  }

  // Smooth, snappy micro-tick for UI feedback
  await new Promise((r) => setTimeout(r, 60));
  if (onProgress) {
    onProgress({ text: 'Tracing covenant trajectory across 6 biblical eras...', progress: 0.85 });
  }
  await new Promise((r) => setTimeout(r, 60));

  const result = getTypologyFromDatabase(passageRef, excludeMotif);
  if (onProgress) {
    onProgress({ text: 'Canonical tapestry complete.', progress: 1.0 });
  }
  return result;
}

export async function generateChapterSymbolism(
  book: string,
  chapter: number,
  lens: string,
  chapterText?: string,
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<string> {
  const { generateLocalAiResponse } = await import('./webLlmService');
  
  const prompt = `You are a biblical scholar specialized in typology, symbolism, and theology.
Analyze the biblical chapter ${book} ${chapter}. 
Identify 3-4 key symbols, motifs, or typological elements in the chapter and explain their significance according to the ${lens} theological tradition.
Format your response as a bulleted list of the specific symbols found in the chapter with a short explanation for each (e.g. - **The Lamb**: explanation).

PASSAGE TEXT (if available):
${chapterText || "Use your canonical knowledge of this chapter."}
`;

  try {
    if (onProgress) onProgress({ text: 'Analyzing symbolism...', progress: 0.1 });
    const responseText = await generateLocalAiResponse([{ role: 'user', content: prompt }], onProgress, true);
    
    if (onProgress) onProgress({ text: 'Done.', progress: 1.0 });
    return responseText;
  } catch (err) {
    console.error('Error generating symbolism summary:', err);
    throw new Error('Failed to generate symbolism summary.');
  }
}

export async function generateHistoricalCommentary(
  passageRef: string,
  passageText: string,
  commentatorName: string,
  denomination: string,
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<string> {
  const { generateLocalAiResponse } = await import('./webLlmService');
  
  const prompt = `You are a strict historical and patristic citation engine for biblical scholarship.
You are tasked with providing authentic commentary from ${commentatorName} (${denomination} tradition) on the biblical passage ${passageRef}.

CRITICAL ANTI-HALLUCINATION & AUTHENTICITY RULES:
1. DIRECT QUOTATIONS ONLY: Only output genuine, authentic, documented historical quotes or direct excerpts written or preached by ${commentatorName} on this passage (e.g., from their published commentaries, homilies, sermons, or theological treatises).
2. NEVER SIMULATE OR FABRICATE: DO NOT fabricate, roleplay, simulate, or generate modern AI text in the style of ${commentatorName}. Every quotation must be a real historical statement by ${commentatorName}.
3. CITATION / WORK TITLE: Always specify the source work where the quotation appears (e.g., work title, treatise, homily number, or volume) if known.
4. HONEST FALLBACK: If you do not have verified, verbatim commentary from ${commentatorName} specifically addressing ${passageRef}, output EXACTLY:
"No direct historical quotation from ${commentatorName} is verified for ${passageRef}."
Do not invent or guess commentary.

PASSAGE TEXT:
${passageText}
`;

  try {
    if (onProgress) onProgress({ text: `Searching writings of ${commentatorName}...`, progress: 0.1 });
    const responseText = await generateLocalAiResponse([{ role: 'user', content: prompt }], onProgress, true);
    
    if (onProgress) onProgress({ text: 'Done.', progress: 1.0 });
    return responseText;
  } catch (err) {
    console.error('Error retrieving historical commentary:', err);
    throw new Error('Failed to retrieve commentary.');
  }
}
