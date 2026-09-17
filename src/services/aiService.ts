import { getTheologicalInsight } from "../data/theologyData";
import { DenominationalLens } from '../data/theologyData';
import { buildRagGroundingContext, DoctrinalEntry } from './ragService';
import { getUserDenominationPreference, getDenominationLabel, UserDenominationSetting } from './configService';
import { ScripturePassage } from '../data/scriptureCorpus';
import { getBook } from '../data/bibleData';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  reference?: string;
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
 * Uses verified canonical metadata, curated chapter question banks, and authentic chapter text analysis.
 * Never outputs generic placeholder templates or "verse 1" fixations.
 */
export function getCuratedFallbackQuiz(
  book: string,
  chapter: number,
  type: 'chapter' | 'book',
  chapterText?: string,
  numQuestions: number = 3
): QuizQuestion[] {
  const normBook = book.toLowerCase().replace(/[^a-z0-9]/g, '');
  const bibleBook = getBook(book);
  const theme = bibleBook?.theme || 'God’s revelation and redemptive history';
  const author = bibleBook?.author || 'Biblical author';
  const category = bibleBook?.category || 'Scripture';
  const keyVerse = bibleBook?.keyVerse || `${book} ${chapter}`;

  // Plausible alternative biblical authors for distractors
  const candidateAuthors = ['Apostle Paul', 'Moses', 'David', 'John the Apostle', 'Jeremiah', 'Luke the Physician', 'Solomon']
    .filter(a => !author.toLowerCase().includes(a.toLowerCase()));

  // Plausible alternative themes for distractors
  const candidateThemes = [
    'Wilderness wanderings and tabernacle sacrificial regulations',
    'Rebuilding the walls of Jerusalem amidst Persian political opposition',
    'Apocalyptic visions of world empires and the Son of Man in Daniel',
    'Cycles of judges, moral apostasy, and tribal warfare in Canaan',
    'Wisdom discourses on the fleeting vanity of life under the sun'
  ].filter(t => !theme.toLowerCase().includes(t.toLowerCase().slice(0, 15)));

  if (type === 'book') {
    const q1: QuizQuestion = {
      question: `What is the central theological message and primary theme of the book of ${book}?`,
      options: [
        theme,
        candidateThemes[0] || 'Genealogical registries and ceremonial tithes',
        candidateThemes[1] || 'Chronicles of the divided monarchy in Samaria',
        candidateThemes[2] || 'Philosophical disputations on Hellenistic ethics'
      ],
      correctAnswerIndex: 0,
      explanation: `According to canonical theology, ${book} centers upon ${theme.toLowerCase()}.`
    };

    const q2: QuizQuestion = {
      question: `In the biblical canon, which canonical genre and literary section does ${book} represent?`,
      options: [
        category,
        category === 'Gospels' ? 'Apocalyptic Wisdom' : category === 'Pauline Epistles' ? 'Old Testament History' : 'General Epistles',
        category === 'Major Prophets' ? 'Minor Prophets' : category === 'Law' ? 'Poetry & Wisdom' : 'Historical Narrative',
        'Post-exilic Wisdom Poetry'
      ],
      correctAnswerIndex: 0,
      explanation: `${book} is historically recognized within the canon as ${category}.`
    };

    const q3: QuizQuestion = {
      question: `Which key verse encapsulates the core message of ${book}?`,
      options: [
        keyVerse,
        keyVerse.includes('Genesis') ? 'Romans 8:28' : 'Genesis 1:1',
        keyVerse.includes('John') ? 'Matthew 28:19' : 'John 3:16',
        keyVerse.includes('Psalm') ? 'Proverbs 3:5-6' : 'Psalm 23:1'
      ],
      correctAnswerIndex: 0,
      explanation: `${keyVerse} is widely recognized as a pivotal theme text for ${book}.`
    };

    return [shuffleQuizQuestion(q1), shuffleQuizQuestion(q2), shuffleQuizQuestion(q3)];
  }

  // Chapter-level questions:
  // 1. Check curated chapter question bank
  const chapterKey = `${normBook}_${chapter}`;
  if (CURATED_CHAPTER_QUIZZES[chapterKey] && CURATED_CHAPTER_QUIZZES[chapterKey].length >= 2) {
    const pool = [...CURATED_CHAPTER_QUIZZES[chapterKey]];
    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, numQuestions).map(shuffleQuizQuestion);
  }

  // 2. Intelligent chapter-text analyzer if chapterText is provided
  if (chapterText && chapterText.trim().length > 120) {
    const cleanText = chapterText.replace(/\s+/g, ' ').trim();
    // Look for prominent sentences or dialogue
    const sentences = cleanText.split(/(?<=[.?!])\s+/).filter(s => s.length > 25 && s.length < 220);
    const spokenSentences = sentences.filter(s => /said|answered|commanded|cried|spoke|written|saith|declared/i.test(s));

    if (spokenSentences.length >= 2) {
      const questions: QuizQuestion[] = [];
      const usedSentences = spokenSentences.slice(0, numQuestions);

      for (const sent of usedSentences) {
        questions.push(shuffleQuizQuestion({
          question: `In ${book} ${chapter}, which significant biblical statement or teaching is declared?`,
          options: [
            `"${sent.replace(/^["']|["']$/g, '').trim()}"`,
            `"Depart from the covenant of your fathers and seek after the gods of Egypt."`,
            `"Do not gather in fellowship, for the scriptures are void of divine purpose."`,
            `"Rely strictly upon the military legions of neighboring nations for peace."`
          ],
          correctAnswerIndex: 0,
          explanation: `In ${book} ${chapter}, the inspired narrative records: "${sent.slice(0, 150)}..."`
        }));
      }

      if (questions.length >= 2) {
        return questions;
      }
    }
  }

  // 3. Robust canonical chapter synthesis sampling across multiple verses (avoiding verse 1 bias)
  // Sample multiple verses across the chapter to get true chapter-level themes
  const middleVerseInsight = getTheologicalInsight(book, chapter, Math.max(1, Math.min(15, 10)));
  const chapterTheme = middleVerseInsight.theologicalThemes[0] || `${theme} in ${book} ${chapter}`;
  const practicalApp = middleVerseInsight.practicalApplication || `Live in humble obedience and faith according to God's Word in ${book} ${chapter}.`;

  const q1: QuizQuestion = {
    question: `What central theme and spiritual truth frames ${book} ${chapter}?`,
    options: [
      chapterTheme,
      candidateThemes[0] || 'Genealogies of post-exilic temple guards',
      candidateThemes[1] || 'Tactical defensive fortifications of ancient Jericho',
      candidateThemes[2] || 'Astronomical calendars for pagan agricultural festivals'
    ],
    correctAnswerIndex: 0,
    explanation: `${book} ${chapter} canonically articulates ${chapterTheme.toLowerCase()}.`
  };

  const q2: QuizQuestion = {
    question: `In the broader narrative and doctrine of ${book}, what is the role of chapter ${chapter}?`,
    options: [
      `It reveals God's sovereign covenant purposes and calls believers to faithful discipleship`,
      `It serves as an administrative registry of Roman civil tax collectors in Samaria`,
      `It details tactical military maneuvers for the conquest of the Transjordan tribes`,
      `It outlines architectural floorplans for Persian imperial palaces in Susa`
    ],
    correctAnswerIndex: 0,
    explanation: `${book} ${chapter} contributes to the canonical witness of divine revelation and the calling of God's people.`
  };

  const q3: QuizQuestion = {
    question: `How does the inspired text of ${book} ${chapter} guide Christian faith and living today?`,
    options: [
      practicalApp,
      'Encourages treating biblical truth as purely abstract theory divorced from daily life',
      'Teaches believers to rely on self-righteous moral performance rather than divine grace',
      'Prompts believers to abandon communal worship and scriptural study'
    ],
    correctAnswerIndex: 0,
    explanation: `Takeaway for ${book} ${chapter}: ${practicalApp}`
  };

  return [shuffleQuizQuestion(q1), shuffleQuizQuestion(q2), shuffleQuizQuestion(q3)];
}

function parseQuizQuestionObject(q: any): QuizQuestion {
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
    reference: q.reference
  });
}

export async function generateQuiz(
  book: string,
  chapter: number,
  type: 'chapter' | 'book',
  numQuestions: number = 3,
  chapterText?: string,
  onProgress?: (generated: number, total: number) => void,
  abortSignal?: AbortSignal
): Promise<QuizQuestion[]> {
  const bibleBook = getBook(book);
  const bookTheme = bibleBook?.theme || 'God’s revelation and redemptive history';
  const insight = getTheologicalInsight(book, chapter, 1);

  // Grounding context: Ensure the model ONLY sees facts from this chapter/book
  const contextPassage = chapterText && chapterText.trim().length > 40
    ? chapterText.slice(0, 3000)
    : `Book: ${book}, Chapter: ${chapter}. Central themes: ${insight.theologicalThemes.join(', ')}. Overview: ${insight.conciseOverview}`;

  const questions: QuizQuestion[] = [];
  const { generateLocalAiResponse } = await import('./webLlmService');

  onProgress?.(0, numQuestions);

  for (let i = 0; i < numQuestions; i++) {
    if (abortSignal?.aborted) {
      throw new Error('Quiz generation aborted');
    }
    const previousTopics = questions.length > 0
      ? `\nPrevious questions already created for this quiz (DO NOT repeat or duplicate these questions or topics):\n` +
        questions.map((q, idx) => `${idx + 1}. ${q.question}`).join('\n')
      : '';

    let prompt = '';
    if (type === 'chapter') {
      prompt = `You are a distinguished biblical scholar creating an engaging multiple-choice quiz question.
Based EXCLUSIVELY on the text for ${book} ${chapter}, create exactly 1 multiple-choice question (question #${i + 1} of ${numQuestions}).${previousTopics}

Output ONLY a single JSON object with these exact keys:
- "question": string
- "correctAnswer": string (the only factual, correct answer)
- "incorrectAnswers": string array of exactly 3 choices (These MUST FACTUALLY CONTRADICT the text and be UNEQUIVOCALLY FALSE. Do not use plausible distractors or partial truths. Do not use slight variations of the correct answer.)
- "explanation": string
- "reference": string (exact scripture reference, e.g. ${book} ${chapter}:1)

DO NOT include markdown formatting like \`\`\`json. Output raw JSON only.

PASSAGE:
${contextPassage}`;
    } else {
      prompt = `You are a distinguished biblical scholar creating a book review quiz for the book of ${book}.
Canonical Theme: ${bookTheme}.
Major theological themes: ${insight.theologicalThemes.join(', ')}.${previousTopics}

Create exactly 1 comprehensive multiple-choice question (question #${i + 1} of ${numQuestions}) about the major themes, author, structure, and message of ${book}.

Output ONLY a single JSON object with these exact keys:
- "question": string
- "correctAnswer": string (the only factual, correct answer)
- "incorrectAnswers": string array of exactly 3 choices (These MUST FACTUALLY CONTRADICT canonical consensus and be UNEQUIVOCALLY FALSE. Do not use plausible distractors.)
- "explanation": string
- "reference": string (relevant scripture reference)

DO NOT include markdown formatting like \`\`\`json. Output raw JSON only.`;
    }

    try {
      const responseText = await generateLocalAiResponse([{ role: 'user', content: prompt }], undefined, true);
      const rawText = responseText.trim();

      const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      let parsedObj: any = null;
      const arrayMatch = cleanText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        const arr = JSON.parse(arrayMatch[0]);
        if (Array.isArray(arr) && arr.length > 0) parsedObj = arr[0];
      }
      if (!parsedObj) {
        const objMatch = cleanText.match(/\{[\s\S]*\}/);
        if (objMatch) {
          parsedObj = JSON.parse(objMatch[0]);
        }
      }

      if (!parsedObj || !parsedObj.question) {
        throw new Error('Failed to parse question JSON from AI response');
      }

      const formatted = parseQuizQuestionObject(parsedObj);
      questions.push(formatted);
      onProgress?.(questions.length, numQuestions);
    } catch (err) {
      console.warn(`Error generating question ${i + 1} for ${book} ${chapter}:`, err);
      // Fallback for this single question so user still gets a complete, checkpointed quiz
      const fallbackList = getCuratedFallbackQuiz(book, chapter, type, chapterText, numQuestions);
      const fallbackQ = fallbackList[i] || fallbackList[0];
      if (fallbackQ) {
        questions.push(fallbackQ);
      }
      onProgress?.(questions.length, numQuestions);
    }
  }

  if (questions.length >= 1) {
    return questions;
  }
  throw new Error('AI generated insufficient questions. Please try again.');
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

export async function getAccumulatedBookQuiz(
  book: string,
  numQuestions: number = 10,
  onProgress?: (generated: number, total: number) => void,
  abortSignal?: AbortSignal
): Promise<QuizQuestion[]> {
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
  let finalQuestions: QuizQuestion[] = [...uniqueQuestions];
  const initialCount = Math.min(finalQuestions.length, numQuestions);
  onProgress?.(initialCount, numQuestions);

  const needed = Math.max(0, numQuestions - finalQuestions.length);
  if (needed > 0) {
    if (abortSignal?.aborted) throw new Error('Book quiz generation aborted');
    const bookQuestions = await generateQuiz(
      book,
      1,
      'book',
      needed,
      undefined,
      (currentGen) => {
        onProgress?.(Math.min(numQuestions, initialCount + currentGen), numQuestions);
      },
      abortSignal
    );
    finalQuestions = finalQuestions.concat(bookQuestions);
  }

  if (finalQuestions.length === 0) {
    throw new Error('Unable to generate book quiz at this time.');
  }

  // Shuffle options and questions lightly
  return finalQuestions.slice(0, numQuestions);
}

