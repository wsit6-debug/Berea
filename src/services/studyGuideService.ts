import { StudyGuide, SupportingPassage } from '../types';
import { DenominationalLens, DENOMINATIONS, getTheologicalInsight } from '../data/theologyData';
import { searchDoctrinalCorpus } from './ragService';

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
 * Returns canonical, exegetically verified cross-references for biblical loci
 */
function getCuratedSupportingPassages(book: string, chapter: number, verseNum?: number, verseText?: string): SupportingPassage[] {
  const normBook = book.toLowerCase().trim();
  const v = verseNum || 1;
  const lowerText = (verseText || '').toLowerCase();

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
    (normBook === 'mark' && chapter === 9 && v >= 14 && v <= 29) ||
    lowerText.includes('prayer and fasting') || lowerText.includes('goeth not out')
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

  // General fallback: return empty array; user can dynamically add supporting passages
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
  existingSupportingPassages?: SupportingPassage[]
): StudyGuide {
  const passageRef = `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}`;
  const denom = DENOMINATIONS.find(d => d.id === lens) || DENOMINATIONS[0];
  const insight = getTheologicalInsight(book, chapter, verseNumber, verseText, verseLemmas);
  const lensPerspective = insight.lensPerspectives[lens] || Object.values(insight.lensPerspectives)[0] || '';

  // 1. Retrieve matching confessional document via RAG with strict relevance filter
  const ragMatches = searchDoctrinalCorpus(`${passageRef} ${verseText || ''} ${insight.theologicalThemes.join(' ')}`, {
    lens,
    book,
    chapter,
    verseNumber,
    limit: 1,
    minScore: 30
  });
  const hasExplicitMatch = ragMatches.length > 0 && ragMatches[0].matchReasons.some(r => r.includes('Scripture Citation Match') || r.includes('Exact Document'));
  const doctrinalDoc = hasExplicitMatch ? ragMatches[0].entry : null;
  const extractedCitation = lensPerspective.match(/\((CCC §[\d–, ]+|WCF [\d–, ]+|Augsburg [^)]+|Trent [^)]+|Canons of Dort [^)]+)\)/i);
  const confessionName = doctrinalDoc
    ? `${doctrinalDoc.documentTitle} (${doctrinalDoc.citation})`
    : extractedCitation
      ? `${denom.confessionalStandard.split(',')[0]} (${extractedCitation[1]})`
      : denom.confessionalStandard.split(',')[0];

  // 2. Primary Theological Theme
  const primaryTheme = insight.theologicalThemes && insight.theologicalThemes.length > 0
    ? insight.theologicalThemes[0]
    : 'God’s Covenantal Faithfulness & Grace';

  const secondaryTheme = insight.theologicalThemes && insight.theologicalThemes.length > 1
    ? insight.theologicalThemes[1]
    : 'The Call to Discipleship and Holy Living';

  // 3. Original Language Exegesis Note (Only if verified lemmas exist)
  let langNote: string | undefined = undefined;
  if (insight.originalLanguageInsights && insight.originalLanguageInsights.length > 0) {
    const l = insight.originalLanguageInsights[0];
    langNote = `${l.term} (${l.originalScript}, ${l.transliteration}${l.strongsRef ? ` - ${l.strongsRef}` : ''}): ${l.nuance}`;
  }

  // 4. Rich, Multilayered Context Snapshot
  const contextSnapshot = [
    verseText && verseText.trim().length > 0 ? `Text: "${verseText.trim()}"` : null,
    insight.historicalContext ? `Historical & Literary Setting: ${insight.historicalContext}` : null,
    `Theological Core: ${insight.conciseOverview}`,
    `${denom.name} Confessional Stance (${confessionName}): ${doctrinalDoc ? `"${doctrinalDoc.coreDoctrine}" ` : ''}${lensPerspective}`
  ].filter(Boolean).join('\n\n');

  // 5. Verse-Thematic Icebreakers (2 tailored items)
  const icebreakers: string[] = [
    `When you reflect on the truths revealed in ${passageRef}, in what areas of your daily routine or relationships do you find this easiest—or most challenging—to actively remember?`,
    `If you were explaining the core message of ${passageRef} to someone exploring faith, what aspect of God’s redemptive character would you want them to understand first?`
  ];

  // 6. Rigorous Deep Discussion Prompts (3 Exegetical Tiers)
  const deepPrompts: string[] = [];

  // Tier 1: Textual Exegesis & Original Meaning
  if (insight.originalLanguageInsights && insight.originalLanguageInsights.length > 0) {
    const l = insight.originalLanguageInsights[0];
    deepPrompts.push(
      `Textual & Linguistic Exegesis: Note the key biblical term "${l.term}" (${l.originalScript}, ${l.transliteration} ${l.strongsRef ? `[${l.strongsRef}]` : ''}), which highlights ${l.nuance}. How does understanding this linguistic weight sharpen our reading of ${passageRef}? What divine truths or actions does the inspired text emphasize?`
    );
  } else {
    deepPrompts.push(
      `Textual & Literary Exegesis: Examine the context, key verbs, and narrative flow of ${passageRef}. How does this verse connect to the surrounding passage in ${book} ${chapter}, and what divine promises or call to faith anchor the author's message?`
    );
  }

  // Tier 2: Confessional & Doctrinal Formulation
  if (insight.suggestedQuestions && insight.suggestedQuestions.length > 0) {
    deepPrompts.push(
      `Confessional Theology (${denom.name}): ${insight.suggestedQuestions[0]} Grounding your answer in ${confessionName}: how does ${denom.name} theology interpret this passage in light of ${denom.tagline}? How does this confessional heritage safeguard the text from common misunderstandings?`
    );
  } else {
    deepPrompts.push(
      `Confessional Theology (${denom.name}): The ${denom.name} tradition (${confessionName}) teaches: "${doctrinalDoc ? doctrinalDoc.coreDoctrine.slice(0, 180) + '...' : lensPerspective}". How does ${passageRef} provide the scriptural bedrock for this doctrinal standard, and where have other Christian traditions historically differed in their emphasis?`
    );
  }

  // Tier 3: Christological Fulfillment & Canonical Synthesis
  deepPrompts.push(
    `Canonical Arc & Christological Center: How does ${passageRef} point forward to, find fulfillment in, or flow out of the life, death, and resurrection of Jesus Christ? What spiritual pitfalls arise if a believer attempts to live out this passage apart from living union with Christ?`
  );

  // 7. Actionable Devotional & Community Takeaway
  const application = [
    insight.practicalApplication ? `Focus: ${insight.practicalApplication}` : null,
    `Meditative Prayer: "Heavenly Father, anchor my heart in the truth of ${passageRef}. Forgive where I have neglected Your Word, and grant me the grace of Your Holy Spirit to walk in obedience and steadfast faith this week."`,
    `Community Action: Reach out to a brother or sister in your faith community who may be facing doubts, confusion, or spiritual trials. Share how the promises in ${passageRef} provide steadfast hope and encouragement.`
  ].filter(Boolean).join('\n\n');

  // 8. Supporting Passages & Cross-References
  const supportingPassages = existingSupportingPassages && existingSupportingPassages.length > 0
    ? existingSupportingPassages
    : getCuratedSupportingPassages(book, chapter, verseNumber, verseText);

  return {
    id: `guide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    passageRef,
    contextSnapshot,
    icebreakers,
    deepPrompts,
    application,
    createdAt: Date.now(),
    theologicalThemes: insight.theologicalThemes,
    confessionCited: confessionName,
    originalLanguageNote: langNote,
    supportingPassages
  };
}

/**
 * Formats study guide as clean plain text for clipboard sharing
 */
export function formatStudyGuideForClipboard(guide: StudyGuide): string {
  return [
    `═══════════════════════════════════════════════════`,
    `BEREA THEOLOGICAL STUDY GUIDE: ${guide.passageRef}`,
    guide.confessionCited ? `Confessional Standard: ${guide.confessionCited}` : null,
    `Created: ${new Date(guide.createdAt).toLocaleDateString()}`,
    `═══════════════════════════════════════════════════`,
    ``,
    guide.theologicalThemes && guide.theologicalThemes.length > 0
      ? `THEOLOGICAL THEMES:\n${guide.theologicalThemes.map(t => `• ${t}`).join('\n')}\n`
      : null,
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
