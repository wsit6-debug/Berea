import { DOCTRINAL_CORPUS, DoctrinalEntry, getConfessionsForLens } from '../data/doctrinalCorpus';
import { DenominationalLens } from '../data/theologyData';
import { findMatchingScriptures, ScripturePassage } from '../data/scriptureCorpus';

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
 * Semantic & Confessional RAG Search Engine
 * Retrieves authoritative doctrinal texts strictly matching the active theological lens
 */
export function searchDoctrinalCorpus(
  query: string,
  options: {
    lens: DenominationalLens;
    book?: string;
    chapter?: number;
    verseNumber?: number;
    limit?: number;
  }
): RagSearchResult[] {
  const { lens, book, chapter, verseNumber, limit = 2 } = options;
  const queryTokens = tokenize(query);
  const passageQuery = book && chapter ? `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}`.toLowerCase() : '';

  // Use full unabridged compiled corpus if cached, otherwise fallback to in-memory baseline
  const corpusToSearch = compiledCorpusCache.get(lens) || getConfessionsForLens(lens) || DOCTRINAL_CORPUS;

  // Trigger background preloading for subsequent queries if not yet cached
  if (typeof window !== 'undefined' && !compiledCorpusCache.has(lens)) {
    preloadUnabridgedCorpus(lens).catch(() => {});
  }

  const scoredResults: RagSearchResult[] = corpusToSearch.map(entry => {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Scripture Reference Match (+50 points for exact chapter/verse mention)
    let hasScriptureMatch = false;
    if (passageQuery && entry.relatedScriptures && entry.relatedScriptures.some(ref => ref.toLowerCase().includes(passageQuery))) {
      score += 50;
      hasScriptureMatch = true;
      matchReasons.push(`Scripture Citation Match (${passageQuery})`);
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
    const entryKeywords = (entry.keywords || []).map(k => k.toLowerCase());
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
 * Builds grounded RAG context block for LLM prompts and citation chips for the UI
 */
export function buildRagGroundingContext(
  query: string,
  context: {
    book: string;
    chapter: number;
    verseNumber?: number;
    verseText?: string;
    lens: DenominationalLens;
  }
): RagGroundingContext {
  const searchResults = searchDoctrinalCorpus(query, {
    lens: context.lens,
    book: context.book,
    chapter: context.chapter,
    verseNumber: context.verseNumber,
    limit: 2
  });

  const retrievedEntries = searchResults.map(r => r.entry);
  const scripturePassages = findMatchingScriptures(query, 3);
  const citations = retrievedEntries.map(e => `${e.documentTitle} (${e.citation})`);

  let systemPromptBlock = '';

  if (retrievedEntries.length > 0) {
    systemPromptBlock += `
### [RAG GROUND TRUTH 1: OFFICIAL CONFESSIONAL STANDARDS - ${context.lens.toUpperCase()}]:
${retrievedEntries.map((e, idx) => `
[DOC ${idx + 1}]: ${e.documentTitle} (${e.citation} - ${e.yearOrEra})
Topic: ${e.topic}
Core Dogma: "${e.coreDoctrine}"
Verbatim Excerpt: "${e.fullExcerpt}"
${e.relatedScriptures && e.relatedScriptures.length > 0 ? `Related Passages: ${e.relatedScriptures.join(', ')}` : ''}
`).join('\n')}
`;
  }

  if (scripturePassages.length > 0) {
    systemPromptBlock += `
### [RAG GROUND TRUTH 2: AUTHENTIC CANONICAL SCRIPTURES - VERBATIM TEXT]:
${scripturePassages.map((p, idx) => `
[SCRIPTURE ${idx + 1} - ${p.ref} (${p.translation})]:
"${p.verbatimText}"
Theological Topic: ${p.theologicalTopic}
${p.greekHebrew ? `Original Greek/Hebrew Terms: ${p.greekHebrew.map(l => `${l.transliteration} (${l.term} - Strong's ${l.strongs}): ${l.meaning}`).join('; ')}` : ''}
`).join('\n')}
`;
  }

  return {
    systemPromptBlock,
    retrievedEntries,
    scripturePassages,
    citations,
    primaryCitation: citations[0] || (scripturePassages[0] ? scripturePassages[0].ref : undefined)
  };
}
