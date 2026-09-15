import { DOCTRINAL_CORPUS, DoctrinalEntry, getConfessionsForLens } from '../data/doctrinalCorpus';
import { DenominationalLens } from '../data/theologyData';
import { findMatchingScriptures, ScripturePassage } from '../data/scriptureCorpus';
import { getUserDenominationPreference, UserDenominationSetting } from './configService';

export type { DoctrinalEntry };

export interface RagSearchResult {
  entry: DoctrinalEntry;
  score: number;
  matchReasons: string[];
}

export interface RagGroundingContext {
  systemPromptBlock: string;
  retrievedEntries: DoctrinalEntry[];
  scripturePassages: ScripturePassage[];
  citations: string[];
  primaryCitation?: string;
}

/**
 * Stopwords to filter out from search queries
 */
const STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'with', 'to', 'from', 'by',
  'what', 'why', 'how', 'who', 'does', 'did', 'do', 'can', 'about', 'this', 'that', 'these', 'those',
  'her', 'his', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'tell', 'me', 'find', 'give'
]);

/**
 * In-memory client cache for the full unabridged compiled confessional datasets (e.g. all 2,865 CCC paragraphs)
 */
const compiledCorpusCache = new Map<DenominationalLens, DoctrinalEntry[]>();

/**
 * Asynchronously preloads the complete unabridged corpus for a given tradition (all 2,865 CCC paragraphs, etc.)
 */
export async function preloadUnabridgedCorpus(lens: DenominationalLens): Promise<DoctrinalEntry[]> {
  if (compiledCorpusCache.has(lens)) {
    return compiledCorpusCache.get(lens)!;
  }

  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    try {
      const res = await fetch(`/corpus/compiled/${lens}.json`);
      if (res.ok) {
        const fullEntries: DoctrinalEntry[] = await res.json();
        compiledCorpusCache.set(lens, fullEntries);
        return fullEntries;
      }
    } catch (e) {
      console.warn(`Could not fetch compiled corpus for ${lens}, using in-memory baseline:`, e);
    }
  }

  const baseline = getConfessionsForLens(lens);
  compiledCorpusCache.set(lens, baseline);
  return baseline;
}

/**
 * Tokenizes text into normalized semantic terms
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

/**
 * Extracts scripture book and chapter/verse patterns from text (e.g. "John 6", "1 Cor 11:24", "Luke 1:35")
 */
function extractScriptureReferences(text: string): string[] {
  const refs: string[] = [];
  const regex = /\b(?:[123]\s+)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|[12]\s+Samuel|[12]\s+Kings|[12]\s+Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song\s+of\s+Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|[12]\s+Corinthians?|Galatians|Ephesians|Philippians|Colossians|[12]\s+Thessalonians?|[12]\s+Timothy|Titus|Philemon|Hebrews|James|[12]\s+Peter|[123]\s+John|Jude|Revelation|Matt|Mk|Lk|Jn|Rom|1\s*Cor|2\s*Cor|Heb|Rev)\s+\d+(?::\d+(?:[-–]\d+)?)?/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    refs.push(match[0].trim());
  }
  return refs;
}

/**
 * Semantic & Confessional RAG Search Engine
 * Retrieves authoritative doctrinal texts strictly matching the active theological lens
 */
export function searchDoctrinalCorpus(
  query: string,
  options: {
    lens?: UserDenominationSetting;
    book?: string;
    chapter?: number;
    verseNumber?: number;
    activeVerseRef?: string;
    limit?: number;
  }
): RagSearchResult[] {
  // Resolve denomination: parameter -> stored global config -> default
  const targetDenom: UserDenominationSetting = options.lens || getUserDenominationPreference();
  const { book, chapter, verseNumber, activeVerseRef, limit = 8 } = options;

  // Determine active verse reference from context
  const fallbackActiveVerseRef = activeVerseRef || (book && chapter ? `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}` : '');

  // 1. Check if user's prompt explicitly contains a scripture reference
  const extractedRefs = extractScriptureReferences(query);
  const hasExplicitScripture = extractedRefs.length > 0;

  // 2. Smart RAG Query Augmentation (Pre-Search):
  // - IF user's prompt explicitly contains a scripture reference: Use the user's prompt as-is (overriding highlighted verse)
  // - IF user's prompt does NOT contain a scripture reference, BUT an activeVerseRef is provided: Prepend "{activeVerseRef}: {original_prompt}"
  let effectiveQuery = query;
  let primaryPassageTarget = '';

  if (hasExplicitScripture) {
    primaryPassageTarget = extractedRefs[0].toLowerCase();
    effectiveQuery = query;
  } else if (fallbackActiveVerseRef) {
    primaryPassageTarget = fallbackActiveVerseRef.toLowerCase();
    effectiveQuery = `${fallbackActiveVerseRef}: ${query}`;
  }

  const queryTokens = tokenize(effectiveQuery);

  // Determine dataset based on denomination setting (strict metadata filtering vs All/None ecumenical search)
  let rawCorpus: DoctrinalEntry[];
  const normalizedTarget = targetDenom.toLowerCase().trim();

  if (normalizedTarget === 'all' || normalizedTarget === 'none') {
    // Search everything across all traditions without filtering
    rawCorpus = DOCTRINAL_CORPUS;
  } else {
    // Strictly filter to the specific denomination's documents
    rawCorpus = compiledCorpusCache.get(targetDenom as DenominationalLens) || getConfessionsForLens(targetDenom as DenominationalLens) || DOCTRINAL_CORPUS;
    
    // Case-insensitive / fuzzy metadata filter:
    // Matches if tradition matches target, or if entry is tagged as universal/ecumenical (e.g. Apostles/Nicene Creeds)
    rawCorpus = rawCorpus.filter(entry => {
      const entryTrad = (entry.tradition || '').toLowerCase().trim();
      return entryTrad === normalizedTarget ||
             entryTrad.includes(normalizedTarget) ||
             normalizedTarget.includes(entryTrad) ||
             entryTrad === 'ecumenical' ||
             entryTrad === 'universal';
    });

    // Trigger background preloading for subsequent queries if not yet cached
    if (typeof window !== 'undefined' && !compiledCorpusCache.has(targetDenom as DenominationalLens)) {
      preloadUnabridgedCorpus(targetDenom as DenominationalLens).catch(() => {});
    }
  }

  const corpusToSearch = rawCorpus;

  const scoredResults: RagSearchResult[] = corpusToSearch.map(entry => {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Scripture Reference Match (+100 points for book/chapter/verse match)
    let hasScriptureMatch = false;
    const related = (entry.relatedScriptures || []).map(r => r.toLowerCase());
    const lowerExcerpt = entry.fullExcerpt.toLowerCase();
    const entryKeywords = (entry.keywords || []).map(k => k.toLowerCase());

    const checkScriptureMatch = (targetRef: string, bonus: number) => {
      if (!targetRef) return false;
      const cleanTarget = targetRef.toLowerCase().replace(/[^\w\d]/g, ' ').trim();
      const parts = cleanTarget.split(/\s+/);
      const bookPart = parts[0];
      const numPart = parts.slice(1).join('');

      // Direct string containment
      if (related.some(ref => ref.includes(targetRef) || targetRef.includes(ref)) ||
          entryKeywords.some(kw => kw.includes(targetRef) || targetRef.includes(kw))) {
        score += bonus;
        matchReasons.push(`Scripture Citation Match (${targetRef})`);
        return true;
      }

      // Individual verse or chapter match in relatedScriptures (e.g. "Matthew 16:18-19" matches "Matthew 16:18")
      if (bookPart && numPart && related.some(ref => ref.includes(bookPart) && ref.includes(numPart))) {
        score += bonus;
        matchReasons.push(`Scripture Reference Match (${targetRef})`);
        return true;
      }

      if (lowerExcerpt.includes(targetRef) || (bookPart && numPart && lowerExcerpt.includes(bookPart) && lowerExcerpt.includes(numPart))) {
        score += Math.round(bonus * 0.75);
        matchReasons.push(`Scripture Mention in Text (${targetRef})`);
        return true;
      }

      return false;
    };

    if (primaryPassageTarget) {
      if (checkScriptureMatch(primaryPassageTarget, 100)) {
        hasScriptureMatch = true;
      }
    }

    for (const ref of extractedRefs) {
      if (checkScriptureMatch(ref.toLowerCase(), 90)) {
        hasScriptureMatch = true;
      }
    }

    // 2. Exact Paragraph / Article Number Match (e.g. CCC 491, WCF 8.2)
    const lowerQ = query.toLowerCase();
    const cleanCit = entry.citation.toLowerCase().replace(/[^\w\d]/g, '');
    const cleanSec = entry.sectionOrArticle.toLowerCase().replace(/[^\w\d]/g, '');
    for (const token of queryTokens) {
      if (cleanCit.includes(token) || cleanSec.includes(token)) {
        score += 40;
        matchReasons.push(`Exact Document Citation Match (${entry.citation})`);
        break;
      }
    }

    // 3. Keyword & Semantic Overlap
    const entryTextTokens = tokenize(`${entry.documentTitle} ${entry.topic} ${entry.coreDoctrine} ${entry.fullExcerpt}`);

    let keywordMatches = 0;
    queryTokens.forEach(token => {
      if (entryKeywords.includes(token)) {
        score += 25;
        keywordMatches++;
      } else if (entryKeywords.some(k => k.includes(token) || token.includes(k))) {
        score += 15;
        keywordMatches++;
      }

      if (entryTextTokens.includes(token)) {
        score += 8;
      }
    });

    if (keywordMatches > 0) {
      matchReasons.push(`${keywordMatches} Confessional Keyword Match(es)`);
    }

    // 4. Document Title & Topic Semantic Matching
    const docLower = entry.documentTitle.toLowerCase();
    const topicLower = entry.topic.toLowerCase();
    const coreLower = entry.coreDoctrine.toLowerCase();

    for (const token of queryTokens) {
      if (topicLower.includes(token)) {
        score += 15;
      }
      if (docLower.includes(token)) {
        score += 10;
      }
      if (coreLower.includes(token)) {
        score += 5;
      }
    }

    const hasSubstantiveMatch = keywordMatches > 0 || hasScriptureMatch || score >= 20;

    return {
      entry,
      score: hasSubstantiveMatch ? score : 0,
      matchReasons
    };
  });

  // Sort descending by relevance score
  return scoredResults
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Ensures all doctrinal entries carry guaranteed metadata tags (sourceFilename, sectionHeader)
 */
function normalizeEntryMetadata(entry: DoctrinalEntry): DoctrinalEntry {
  const defaultFile = `${entry.documentTitle.toLowerCase().replace(/[^\w\d]/g, '_')}.json`;
  return {
    ...entry,
    sourceFilename: entry.sourceFilename || defaultFile,
    sectionHeader: entry.sectionHeader || entry.topic || entry.sectionOrArticle
  };
}

/**
 * Builds grounded RAG context block for LLM prompts and citation chips for the UI
 */
export function buildRagGroundingContext(
  query: string,
  context: {
    book: string;
    chapter: number;
    verseNumber?: number;
    activeVerseRef?: string;
    verseText?: string;
    lens?: UserDenominationSetting;
  }
): RagGroundingContext {
  const targetLens: UserDenominationSetting = context.lens || getUserDenominationPreference();
  const fallbackActiveVerseRef = context.activeVerseRef || (context.book && context.chapter ? `${context.book} ${context.chapter}${context.verseNumber ? `:${context.verseNumber}` : ''}` : '');

  const extractedRefs = extractScriptureReferences(query);
  const effectiveScriptureQuery = extractedRefs.length > 0 ? query : (fallbackActiveVerseRef ? `${fallbackActiveVerseRef} ${query}` : query);

  const searchResults = searchDoctrinalCorpus(query, {
    lens: targetLens,
    book: context.book,
    chapter: context.chapter,
    verseNumber: context.verseNumber,
    activeVerseRef: context.activeVerseRef,
    limit: 8
  });

  const retrievedEntries = searchResults.map(r => normalizeEntryMetadata(r.entry));
  const scripturePassages = findMatchingScriptures(effectiveScriptureQuery, 3);
  const citations = retrievedEntries.map(e => `[Source: ${e.sourceFilename}, Section: ${e.sectionOrArticle}]`);

  let systemPromptBlock = '';

  if (retrievedEntries.length > 0) {
    systemPromptBlock += `
### [RETRIEVED THEOLOGICAL CONTEXT CHUNKS - ${String(targetLens).toUpperCase()}]:
${retrievedEntries.map((e, idx) => `
---
[CONTEXT CHUNK ${idx + 1}] [Source: ${e.sourceFilename}, Section: ${e.sectionOrArticle}${e.sectionHeader ? `, Section Header: ${e.sectionHeader}` : ''}]:
Document Title: ${e.documentTitle} (${e.citation} - ${e.yearOrEra})
Topic: ${e.topic}
Core Doctrine: "${e.coreDoctrine}"
Verbatim Excerpt:
"${e.fullExcerpt}"
${e.relatedScriptures && e.relatedScriptures.length > 0 ? `Scripture Cross-References: ${e.relatedScriptures.join(', ')}` : ''}
`).join('\n')}
`;
  }

  if (scripturePassages.length > 0) {
    systemPromptBlock += `
### [RETRIEVED SCRIPTURE CONTEXT CHUNKS - VERBATIM CANONICAL TEXT]:
${scripturePassages.map((p, idx) => `
---
[SCRIPTURE CHUNK ${idx + 1}] [Source: Canonical_Scriptures_${p.translation}.json, Section: ${p.ref}]:
Verbatim Text: "${p.verbatimText}"
Theological Topic: ${p.theologicalTopic}
${p.greekHebrew ? `Linguistic Data: ${p.greekHebrew.map(l => `${l.transliteration} (${l.term} - Strong's ${l.strongs}): ${l.meaning}`).join('; ')}` : ''}
`).join('\n')}
`;
  }

  return {
    systemPromptBlock,
    retrievedEntries,
    scripturePassages,
    citations,
    primaryCitation: citations[0] || (scripturePassages[0] ? `[Source: Canonical_Scriptures_${scripturePassages[0].translation}.json, Section: ${scripturePassages[0].ref}]` : undefined)
  };
}
