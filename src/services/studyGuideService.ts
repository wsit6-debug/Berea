import { StudyGuide } from '../types';
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

/**
 * Generates an accurate, exegesis-driven, confessionally grounded study guide
 * for any biblical passage and theological tradition.
 */
export function generateStudyGuideContent(
  book: string,
  chapter: number,
  verseNumber?: number,
  verseText?: string,
  lens: DenominationalLens = 'catholic'
): StudyGuide {
  const passageRef = `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}`;
  const denom = DENOMINATIONS.find(d => d.id === lens) || DENOMINATIONS[0];
  const insight = getTheologicalInsight(book, chapter, verseNumber, verseText);
  const lensPerspective = insight.lensPerspectives[lens] || Object.values(insight.lensPerspectives)[0] || '';

  // 1. Retrieve matching confessional document via RAG
  const ragMatches = searchDoctrinalCorpus(`${passageRef} ${verseText || ''} ${insight.theologicalThemes.join(' ')}`, {
    lens,
    book,
    chapter,
    verseNumber,
    limit: 1
  });
  const doctrinalDoc = ragMatches.length > 0 ? ragMatches[0].entry : null;
  const confessionName = doctrinalDoc ? `${doctrinalDoc.documentTitle} (${doctrinalDoc.citation})` : denom.confessionalStandard.split(',')[0];

  // 2. Primary Theological Theme
  const primaryTheme = insight.theologicalThemes && insight.theologicalThemes.length > 0
    ? insight.theologicalThemes[0]
    : 'God’s Covenantal Faithfulness & Grace';

  const secondaryTheme = insight.theologicalThemes && insight.theologicalThemes.length > 1
    ? insight.theologicalThemes[1]
    : 'The Call to Discipleship and Holy Living';

  // 3. Original Language Exegesis Note
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
    `When you consider the reality of "${primaryTheme}" presented in ${passageRef}, in what areas of your daily routine or relationships do you find this easiest—or most difficult—to actively remember?`,
    `If you were explaining how this passage addresses "${secondaryTheme}" to someone questioning Christian faith, what aspect of God's character would you want them to understand first?`
  ];

  // 6. Rigorous Deep Discussion Prompts (3 Exegetical Tiers)
  const deepPrompts: string[] = [];

  // Tier 1: Textual Exegesis & Original Meaning
  if (insight.originalLanguageInsights && insight.originalLanguageInsights.length > 0) {
    const l = insight.originalLanguageInsights[0];
    deepPrompts.push(
      `Textual & Linguistic Exegesis: Note the key biblical term "${l.term}" (${l.originalScript}, ${l.transliteration} ${l.strongsRef ? `[${l.strongsRef}]` : ''}), which emphasizes ${l.nuance}. How does understanding this original linguistic weight alter or sharpen our English reading of ${passageRef}? What specific actions or attitudes does the author demand from the audience?`
    );
  } else {
    deepPrompts.push(
      `Textual & Literary Exegesis: Examine the grammatical structure, key verbs, and immediate context of ${passageRef}. How does this verse build upon the preceding arguments in ${book} ${chapter}, and what divine promises or commands anchor the author's primary intention?`
    );
  }

  // Tier 2: Confessional & Doctrinal Formulation
  if (insight.suggestedQuestions && insight.suggestedQuestions.length > 0) {
    // Incorporate curated loci questions when available
    deepPrompts.push(
      `Confessional Theology (${denom.name}): ${insight.suggestedQuestions[0]} Grounding your answer in ${confessionName}: how does ${denom.name} theology interpret this verse in light of ${denom.tagline}? How does this confession protect the passage from common cultural distortions?`
    );
  } else {
    deepPrompts.push(
      `Confessional Theology (${denom.name}): The ${denom.name} tradition (${confessionName}) teaches: "${doctrinalDoc ? doctrinalDoc.coreDoctrine.slice(0, 180) + '...' : lensPerspective}". How does ${passageRef} provide the scriptural bedrock for this doctrinal standard, and where have other Christian traditions historically differed in their emphasis?`
    );
  }

  // Tier 3: Christological Fulfillment & Canonical Synthesis
  deepPrompts.push(
    `Canonical Arc & Christological Center: How does ${passageRef} point forward to, find fulfillment in, or flow out of the life, death, and resurrection of Jesus Christ? What pastoral dangers or spiritual pitfalls arise if a believer attempts to live out this passage apart from union with Christ?`
  );

  // 7. Actionable Devotional & Community Takeaway
  const application = [
    insight.practicalApplication ? `Focus: ${insight.practicalApplication}` : null,
    `Meditative Prayer: "Heavenly Father, anchor my heart in the truth of ${passageRef}. Forgive where I have neglected Your Word, and grant me the grace of Your Spirit to walk in obedience to Your truth this week."`,
    `Community Action: Identify one person in your congregation, family, or small group who is wrestling with ${primaryTheme.toLowerCase()}. Reach out this week with an encouraging note or prayer rooted in this passage.`
  ].filter(Boolean).join('\n\n');

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
    originalLanguageNote: langNote
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
