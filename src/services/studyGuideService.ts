import { StudyGuide, SupportingPassage, StudyGuideAudience } from '../types';
import { DenominationalLens, DENOMINATIONS, getTheologicalInsight } from '../data/theologyData';
import { searchDoctrinalCorpus } from './ragService';
import { findMatchingScriptures } from '../data/scriptureCorpus';

const STORAGE_KEY = 'berea_saved_study_guides';

export function getSavedStudyGuides(): StudyGuide[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load study guides from localStorage:', e);
    return [];
  }
}

export function saveStudyGuide(guide: StudyGuide): StudyGuide[] {
  const existing = getSavedStudyGuides();
  const updated = [guide, ...existing.filter(g => g.id !== guide.id)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save study guide to localStorage:', e);
  }
  return updated;
}

export function deleteStudyGuide(guideId: string): StudyGuide[] {
  const existing = getSavedStudyGuides();
  const updated = existing.filter(g => g.id !== guideId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete study guide from localStorage:', e);
  }
  return updated;
}

export function addSupportingPassageToGuide(
  guide: StudyGuide,
  passage: SupportingPassage
): StudyGuide {
  const existing = guide.supportingPassages || [];
  if (existing.some(p => p.ref.trim().toLowerCase() === passage.ref.trim().toLowerCase())) {
    return guide;
  }
  const updated: StudyGuide = {
    ...guide,
    supportingPassages: [...existing, passage]
  };
  saveStudyGuide(updated);
  return updated;
}

export function removeSupportingPassageFromGuide(
  guide: StudyGuide,
  passageRef: string
): StudyGuide {
  const updated: StudyGuide = {
    ...guide,
    supportingPassages: (guide.supportingPassages || []).filter(
      p => p.ref.trim().toLowerCase() !== passageRef.trim().toLowerCase()
    )
  };
  saveStudyGuide(updated);
  return updated;
}

/**
 * Returns canonical, exegetically verified cross-references for biblical loci,
 * automatically falling back to semantic search across the scripture corpus.
 */
function getCuratedSupportingPassages(book: string, chapter: number, verseNum?: number, verseText?: string): SupportingPassage[] {
  const normBook = book.toLowerCase().trim();
  const v = verseNum || 1;

  // Elijah / Forerunner (Matthew 17:10–13, Mark 9:11–13, Malachi 4)
  if (
    (normBook === 'matthew' && chapter === 17 && v >= 10 && v <= 13) ||
    (normBook === 'mark' && chapter === 9 && v >= 11 && v <= 13) ||
    (normBook === 'malachi' && (chapter === 3 || chapter === 4))
  ) {
    return [
      {
        ref: 'Malachi 4:5–6',
        note: 'Prophetic promise of Elijah as forerunner before the Day of the LORD',
        text: 'Behold, I will send you Elijah the prophet before the great and awesome day of the LORD comes. And he will turn the hearts of fathers to their children and the hearts of children to their fathers...'
      },
      {
        ref: 'Matthew 11:13–14',
        note: 'Jesus explicitly affirms that John the Baptist fulfills the Elijah prophecy',
        text: 'For all the Prophets and the Law prophesied until John, and if you are willing to accept it, he is Elijah who is to come.'
      },
      {
        ref: 'Luke 1:17',
        note: 'Angelic announcement of John coming in the spirit and power of Elijah',
        text: 'And he will go before him in the spirit and power of Elijah, to turn the hearts of the fathers to the children, and the disobedient to the wisdom of the just, to make ready for the Lord a people prepared.'
      }
    ];
  }

  // Spiritual Warfare, Deliverance & Fasting (Matthew 17:14–21, Mark 9:14–29)
  if (
    (normBook === 'matthew' && chapter === 17 && v >= 14 && v <= 21) ||
    (normBook === 'mark' && chapter === 9 && v >= 14 && v <= 29)
  ) {
    return [
      {
        ref: 'Mark 9:28–29',
        note: 'Parallel Gospel account: Jesus declares this kind comes forth only by prayer and fasting',
        text: 'And when he was entered into the house, his disciples asked him privately, Why could not we cast him out? And he said unto them, This kind can come forth by nothing, but by prayer and fasting.'
      },
      {
        ref: 'Matthew 17:19–20',
        note: 'The immediate context: the disciples’ question and Christ’s teaching on mustard-seed faith',
        text: 'Then came the disciples to Jesus apart, and said, Why could not we cast him out? And Jesus said unto them, Because of your unbelief: for verily I say unto you, If ye have faith as a grain of mustard seed, ye shall say unto this mountain, Remove hence to yonder place; and it shall remove...'
      },
      {
        ref: 'Ephesians 6:12',
        note: 'Paul describes the reality of spiritual warfare against demonic forces',
        text: 'For we wrestle not against flesh and blood, but against principalities, against powers, against the rulers of the darkness of this world, against spiritual wickedness in high places.'
      }
    ];
  }

  // Passion Prediction / Son of Man Handed Over (Matthew 17:22–23, Mark 9:30–32, Luke 9:43–45)
  if (
    (normBook === 'matthew' && chapter === 17 && (v === 22 || v === 23)) ||
    (normBook === 'mark' && chapter === 9 && (v === 30 || v === 31 || v === 32)) ||
    (normBook === 'luke' && chapter === 9 && (v === 43 || v === 44 || v === 45))
  ) {
    return [
      {
        ref: 'Daniel 7:13–14',
        note: 'The messianic title Son of Man presented before the Ancient of Days with everlasting dominion',
        text: 'I saw in the night visions, and behold, with the clouds of heaven there came one like a son of man, and he came to the Ancient of Days and was presented before him...'
      },
      {
        ref: 'Isaiah 53:5–6',
        note: 'The Suffering Servant handed over and wounded for our transgressions',
        text: 'But he was pierced for our transgressions; he was crushed for our iniquities; upon him was the chastisement that brought us peace, and with his wounds we are healed.'
      },
      {
        ref: 'Romans 8:32',
        note: 'God spared not His own Son but handed Him over for us all',
        text: 'He who did not spare his own Son but gave him up for us all, how will he not also with him graciously give us all things?'
      }
    ];
  }

  // Sacrificial Discipleship, Renunciation & Heavenly Reward (Matthew 19:16–30, Mark 10:17–31, Luke 18:18–30)
  if (
    (normBook === 'matthew' && chapter === 19 && v >= 16 && v <= 30) ||
    (normBook === 'mark' && chapter === 10 && v >= 17 && v <= 31) ||
    (normBook === 'luke' && chapter === 18 && v >= 18 && v <= 30)
  ) {
    return [
      {
        ref: 'Mark 10:28–30',
        note: 'Parallel Gospel account: Jesus promises the hundredfold reward and eternal life to those who leave all for His sake',
        text: 'Peter began to say to him, "See, we have left everything and followed you." Jesus said, "Truly, I say to you, there is no one who has left house or brothers or sisters or mother or father or children or lands, for my sake and for the gospel, who will not receive a hundredfold now in this time... and in the age to come eternal life."'
      },
      {
        ref: 'Philippians 3:7–8',
        note: 'Paul counts all worldly status and gain as loss for the surpassing worth of knowing Christ',
        text: 'But whatever gain I had, I counted as loss for the sake of Christ. Indeed, I count everything as loss because of the surpassing worth of knowing Christ Jesus my Lord. For his sake I have suffered the loss of all things and count them as rubbish, in order that I may gain Christ.'
      },
      {
        ref: 'Matthew 6:19–21',
        note: 'The Sermon on the Mount: Laying up eternal treasures in heaven rather than earthly wealth',
        text: 'Do not lay up for yourselves treasures on earth, where moth and rust destroy and where thieves break in and steal, but lay up for yourselves treasures in heaven... For where your treasure is, there your heart will be also.'
      }
    ];
  }

  // Papacy & Ecclesiology (Matthew 16:16–19)
  if (normBook === 'matthew' && chapter === 16 && v >= 16 && v <= 19) {
    return [
      {
        ref: 'Isaiah 22:22',
        note: 'Old Testament background of the royal key of David on the steward’s shoulder',
        text: 'And I will place on his shoulder the key of the house of David. He shall open, and none shall shut; and he shall shut, and none shall open.'
      },
      {
        ref: 'Ephesians 2:20',
        note: 'The Church founded on the apostles and prophets with Christ as cornerstone',
        text: 'Built on the foundation of the apostles and prophets, Christ Jesus himself being the cornerstone.'
      },
      {
        ref: '1 Peter 2:4–5',
        note: 'Living stones being built up into a spiritual house upon Christ the living stone',
        text: 'As you come to him, a living stone rejected by men but in the sight of God chosen and precious, you yourselves like living stones are being built up as a spiritual house...'
      }
    ];
  }

  // Justification & Faith (Romans 3–5, James 2, Galatians 2–3)
  if (
    (normBook === 'romans' && (chapter === 3 || chapter === 4 || chapter === 5)) ||
    (normBook === 'james' && chapter === 2) ||
    (normBook === 'galatians' && (chapter === 2 || chapter === 3))
  ) {
    return [
      {
        ref: 'Genesis 15:6',
        note: 'Abraham believed the LORD and it was counted to him as righteousness',
        text: 'And he believed the LORD, and he counted it to him as righteousness.'
      },
      {
        ref: 'Habakkuk 2:4',
        note: 'Prophetic bedrock of justification: the righteous shall live by faith',
        text: 'Behold, his soul is puffed up; it is not upright within him, but the righteous shall live by his faith.'
      },
      {
        ref: 'Ephesians 2:8–10',
        note: 'Saved by grace through faith for good works created beforehand in Christ',
        text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast. For we are his workmanship, created in Christ Jesus for good works...'
      }
    ];
  }

  // Automatic semantic search across canonical scripture corpus
  if (verseText && verseText.trim().length > 0) {
    const matches = findMatchingScriptures(`${book} ${chapter} ${verseText}`, 3);
    const filtered = matches.filter(m => !m.ref.toLowerCase().includes(`${normBook} ${chapter}`));
    if (filtered.length > 0) {
      return filtered.map(m => ({
        ref: m.ref,
        note: m.theologicalTopic,
        text: m.verbatimText.length > 250 ? m.verbatimText.slice(0, 240) + '...' : m.verbatimText
      }));
    }
  }

  return [];
}

/**
 * Generates an accurate, exegesis-driven, confessionally grounded study guide
 * for any biblical passage and theological tradition.
 */
export function generateStudyGuideContent(
  book: string,
  chapter: number,
  verseNumber?: number,
  verseText?: string,
  lens: DenominationalLens = 'catholic',
  verseLemmas?: { word: string; transliteration: string; strongs?: string; definition?: string }[],
  existingSupportingPassages?: SupportingPassage[],
  audience: StudyGuideAudience = 'small_group',
  endVerseNumber?: number
): StudyGuide {
  const isMultiVerse = endVerseNumber && verseNumber && endVerseNumber > verseNumber;
  const passageRef = isMultiVerse
    ? `${book} ${chapter}:${verseNumber}–${endVerseNumber}`
    : `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}`;

  const denom = DENOMINATIONS.find(d => d.id === lens) || DENOMINATIONS[0];
  const insight = getTheologicalInsight(book, chapter, verseNumber, verseText, verseLemmas);
  const lensPerspective = insight.lensPerspectives[lens] || Object.values(insight.lensPerspectives)[0] || '';

  // 1. Retrieve matching confessional document via RAG with strict relevance filter
  const ragMatches = searchDoctrinalCorpus(`${passageRef} ${verseText || ''} ${insight.conciseOverview}`, {
    lens,
    book,
    chapter,
    verseNumber,
    limit: 1,
    minScore: 35
  });
  const hasExplicitMatch = ragMatches.length > 0 && (
    ragMatches[0].matchReasons.some(r => r.includes('Scripture Citation Match') || r.includes('Exact Document')) ||
    (ragMatches[0].matchReasons.some(r => r.includes('Doctrinal Theme Match')) && (ragMatches[0].score || 0) >= 60)
  );
  const doctrinalDoc = hasExplicitMatch ? ragMatches[0].entry : null;
  const extractedCitation = lensPerspective.match(/\((?:[^)]*?)(CCC §[\d–, §]+|WCF [\d–, .]+|Augsburg [^;)]+|Trent [^;)]+|Canons of Dort [^;)]+)/i);
  const confessionName = doctrinalDoc
    ? `${doctrinalDoc.documentTitle} (${doctrinalDoc.citation})`
    : extractedCitation
      ? `${denom.confessionalStandard.split(',')[0]} (${extractedCitation[1]})`
      : denom.confessionalStandard.split(',')[0];

  // 2. Original Language Exegesis Note (Only if verified lemmas exist)
  let langNote: string | undefined = undefined;
  if (insight.originalLanguageInsights && insight.originalLanguageInsights.length > 0) {
    const l = insight.originalLanguageInsights[0];
    langNote = `${l.term} (${l.originalScript}, ${l.transliteration}${l.strongsRef ? ` - ${l.strongsRef}` : ''}): ${l.nuance}`;
  }

  // 3. Rich, Multilayered Context Snapshot tailored to Audience
  const contextSnapshot = [
    verseText && verseText.trim().length > 0 ? `Text: "${verseText.trim()}"` : null,
    insight.historicalContext ? `Historical & Literary Setting: ${insight.historicalContext}` : null,
    `Theological Core: ${insight.conciseOverview}`,
    `${denom.name} Confessional Stance (${confessionName}): ${doctrinalDoc ? `"${doctrinalDoc.coreDoctrine}" ` : ''}${lensPerspective}`
  ].filter(Boolean).join('\n\n');

  // 4. Audience-Tailored Icebreakers
  let icebreakers: string[] = [];
  if (audience === 'youth_family') {
    icebreakers = [
      `If you had to summarize what happens in ${passageRef} as a 10-second headline or video, what would you say?`,
      `Imagine you were right there in the crowd when this happened in ${book} ${chapter}—how would you have felt, and what question would you ask?`
    ];
  } else if (audience === 'deep_exegesis') {
    icebreakers = [
      `Literary Structure: As you examine ${passageRef}, what key grammatical pivot, repetition, or theological tension frames this pericope?`,
      `Canonical Context: How does the immediate literary and covenantal context of ${book} ${chapter} shape the doctrinal locus at stake?`
    ];
  } else {
    // Default: Small Group
    icebreakers = [
      `When you reflect on this specific passage (${passageRef}${verseText ? `: "${verseText.trim()}"` : ''}), what word or phrase strikes you most directly, and why?`,
      `What makes the reality declared in ${passageRef} challenging—or deeply reassuring—in your everyday discipleship?`
    ];
  }

  // 5. Audience-Tailored Deep Discussion Prompts (3 Tiers)
  const deepPrompts: string[] = [];

  if (audience === 'youth_family') {
    deepPrompts.push(
      `Story & Who Jesus Is: In ${passageRef}${verseText ? `, the text tells us: "${verseText.trim()}"` : ''}. What does this passage show us about who God is and how much He cares, and why should that amaze us?`,
      `Real-Life Scenario: Think about school, home, or hanging out with friends. When is it hard to trust or obey God the way this passage describes, and how can remembering God's promises help you?`,
      `Following Jesus: What is one practical way Jesus is inviting you to follow Him or show His love to someone in your life this week?`
    );
  } else if (audience === 'deep_exegesis') {
    // Tier 1: Textual & Linguistic Exegesis
    if (insight.originalLanguageInsights && insight.originalLanguageInsights.length > 0) {
      const l = insight.originalLanguageInsights[0];
      deepPrompts.push(
        `Textual & Linguistic Exegesis: Note the key biblical term "${l.term}" (${l.originalScript}, ${l.transliteration} ${l.strongsRef ? `[${l.strongsRef}]` : ''}), which highlights ${l.nuance}. How does understanding this linguistic weight sharpen our reading of ${passageRef}? What divine truths or actions does the inspired text emphasize?`
      );
    } else {
      deepPrompts.push(
        `Textual & Literary Exegesis: In ${passageRef}${verseText ? `, the text states: "${verseText.trim()}"` : ''}. Examine the key verbs, the speaker, and the immediate audience in ${book} ${chapter}. What divine truth, command, or prophetic purpose is being communicated here, and how does it challenge conventional human assumptions?`
      );
    }

    // Tier 2: Confessional Dogmatics
    if (insight.suggestedQuestions && insight.suggestedQuestions.length > 0) {
      deepPrompts.push(
        `Confessional Dogmatics (${denom.name}): ${insight.suggestedQuestions[0]} Grounding your answer in ${confessionName}: how does ${denom.name} theology interpret this passage in light of ${denom.tagline}? How does this confessional heritage safeguard the text from common misunderstandings?`
      );
    } else {
      deepPrompts.push(
        `Confessional Dogmatics (${denom.name}): Historic ${denom.name} doctrine (${confessionName}) grounds its teaching in ${lensPerspective}. How does ${passageRef} provide the scriptural foundation for this doctrine, and how does this tradition protect the text from common cultural misreadings?`
      );
    }

    // Tier 3: Christological & Canonical Arc
    deepPrompts.push(
      `Canonical Arc & Christological Center: How does ${passageRef} point forward to, find fulfillment in, or flow out of the life, death, and resurrection of Jesus Christ? What spiritual pitfalls arise if a believer attempts to live out this passage apart from living union with Christ?`
    );
  } else {
    // Default: Small Group Discipleship
    deepPrompts.push(
      `Heart of the Text: Looking closely at ${passageRef}${verseText ? ` ("${verseText.trim()}")` : ''}, what is the main truth God wants us to grasp? How does it challenge our human instinct to rely on our own strength or understanding?`,
      `Grounded in Truth (${denom.name}): Historic faith (${confessionName}) reminds us that God’s Word is steadfast. How does understanding ${passageRef} through the lens of ${denom.tagline} give you fresh confidence in God's promises?`,
      `Everyday Walk: If our group truly lived out the reality revealed in ${passageRef} this week, what would look different in our attitudes, our prayers, and how we treat others?`
    );
  }

  // 6. Audience-Tailored Actionable Takeaway
  let application = '';
  if (audience === 'youth_family') {
    application = [
      `Family/Youth Challenge: Put ${passageRef} into action! Pick one concrete way to show kindness, pray for someone who is struggling, or memorize the key truth of this passage together this week.`,
      `Simple Prayer: "Lord God, thank You for Your living Word in ${passageRef}. Help me trust You when things are hard, forgive me when I stumble, and give me joy to follow Jesus every day. Amen."`,
      `Talk Together: Share one thing each person in the group or family is grateful for today based on what we learned about God.`
    ].join('\n\n');
  } else if (audience === 'deep_exegesis') {
    application = [
      insight.practicalApplication ? `Pastoral Focus: ${insight.practicalApplication}` : `Pastoral Focus: Meditate upon ${passageRef} with rigorous self-examination, allowing sound doctrine to bear fruit in holy living.`,
      `Collect of Illumination: "Almighty God, who in Holy Scripture has revealed the mystery of Your redemptive counsel: illuminate our minds by the Holy Spirit, that hearing the truth of ${passageRef}, we may reject all error and cling steadfastly to Christ our Lord."`,
      `Ministerial Charge: Defend and proclaim the theological truth of ${passageRef} in your teaching, pastoral care, and fellowship, building up the Body of Christ in unity and sound doctrine.`
    ].join('\n\n');
  } else {
    application = [
      insight.practicalApplication ? `Focus: ${insight.practicalApplication}` : `Focus: Take time to meditate on the truth of ${passageRef} today. Allow this specific passage to shape your prayers and priorities.`,
      `Meditative Prayer: "Heavenly Father, anchor my heart in the truth of ${passageRef}. Forgive where I have neglected Your Word, and grant me the grace of Your Holy Spirit to walk in obedience and steadfast faith this week."`,
      `Community Action: Reach out to a brother or sister in your faith community who may be facing doubts, confusion, or spiritual trials. Share how the promises in ${passageRef} provide steadfast hope and encouragement.`
    ].join('\n\n');
  }

  // 7. Supporting Passages & Cross-References
  const supportingPassages = existingSupportingPassages && existingSupportingPassages.length > 0
    ? existingSupportingPassages
    : getCuratedSupportingPassages(book, chapter, verseNumber, verseText);

  return {
    id: `guide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    passageRef,
    startVerse: verseNumber,
    endVerse: isMultiVerse ? endVerseNumber : verseNumber,
    audience,
    contextSnapshot,
    icebreakers,
    deepPrompts,
    application,
    createdAt: Date.now(),
    confessionCited: confessionName,
    originalLanguageNote: langNote,
    supportingPassages
  };
}

/**
 * Formats study guide as clean plain text for clipboard sharing
 */
export function formatStudyGuideForClipboard(guide: StudyGuide): string {
  const audienceLabel = guide.audience === 'deep_exegesis'
    ? 'Pastoral & Deep Exegesis'
    : guide.audience === 'youth_family'
      ? 'Youth & Family'
      : 'Small Group Discipleship';

  return [
    `═══════════════════════════════════════════════════`,
    `BEREA THEOLOGICAL STUDY GUIDE: ${guide.passageRef}`,
    `Audience Depth: ${audienceLabel}`,
    guide.confessionCited ? `Confessional Standard: ${guide.confessionCited}` : null,
    `Created: ${new Date(guide.createdAt).toLocaleDateString()}`,
    `═══════════════════════════════════════════════════`,
    ``,
    `CONTEXT SNAPSHOT:`,
    guide.contextSnapshot,
    ``,
    guide.supportingPassages && guide.supportingPassages.length > 0
      ? `SUPPORTING SCRIPTURES & CROSS-REFERENCES:\n${guide.supportingPassages.map(p => `• ${p.ref}${p.note ? ` (${p.note})` : ''}${p.text ? `:\n  "${p.text}"` : ''}`).join('\n\n')}\n`
      : null,
    `ICEBREAKER QUESTIONS:`,
    guide.icebreakers.map((q, i) => `${i + 1}. ${q}`).join('\n\n'),
    ``,
    `DEEP DISCUSSION PROMPTS:`,
    guide.deepPrompts.map((q, i) => `[Prompt ${i + 1}]\n${q}`).join('\n\n'),
    ``,
    `ACTIONABLE TAKEAWAY & SPIRITUAL HABITS:`,
    guide.application,
    ``,
    `═══════════════════════════════════════════════════`,
    `— Berea: Removing Friction in Faith (Acts 17:11)`
  ].filter(Boolean).join('\n');
}
