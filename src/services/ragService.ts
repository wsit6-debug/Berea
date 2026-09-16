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
    endVerseNumber?: number;
    limit?: number;
    minScore?: number;
  }
): RagSearchResult[] {
  const { lens, book, chapter, verseNumber, endVerseNumber, limit = 2, minScore = 25 } = options;
  const queryTokens = tokenize(query);
  const isMulti = Boolean(endVerseNumber && verseNumber && endVerseNumber > verseNumber);
  const passageQuery = book && chapter
    ? (isMulti
        ? `${book} ${chapter}:${verseNumber}`
        : `${book} ${chapter}${verseNumber ? `:${verseNumber}` : ''}`
      ).toLowerCase()
    : '';

  // Use full unabridged compiled corpus if cached, otherwise fallback to in-memory baseline
  const corpusToSearch = compiledCorpusCache.get(lens) || getConfessionsForLens(lens) || DOCTRINAL_CORPUS;

  // Trigger background preloading for subsequent queries if not yet cached
  if (typeof window !== 'undefined' && !compiledCorpusCache.has(lens)) {
    preloadUnabridgedCorpus(lens).catch(() => { });
  }

  const scoredResults: RagSearchResult[] = corpusToSearch.map(entry => {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Direct Scripture Reference Match (+60 points for exact chapter & verse, +30 for chapter context)
    let hasScriptureMatch = false;
    if (passageQuery && entry.relatedScriptures) {
      if (entry.relatedScriptures.some(ref => ref.toLowerCase().replace(/\s+/g, ' ').includes(passageQuery))) {
        score += 60;
        hasScriptureMatch = true;
        matchReasons.push(`Scripture Citation Match (${passageQuery})`);
      } else if (book && chapter && entry.relatedScriptures.some(ref => ref.toLowerCase().includes(`${book.toLowerCase()} ${chapter}`))) {
        score += 30;
        hasScriptureMatch = true;
        matchReasons.push(`Scripture Chapter Context Match (${book} ${chapter})`);
      }
    }

    // 2. Explicit Citation Search (only if query explicitly specifies citation notation like "CCC 491", "WCF 8.2", "Art. 4")
    const cleanCit = entry.citation.toLowerCase().replace(/[^\w\d]/g, '');
    const cleanSec = entry.sectionOrArticle.toLowerCase().replace(/[^\w\d]/g, '');
    const explicitCitationMatch = query.match(/\b(ccc\s*§?\s*\d+|wcf\s*\d+(\.\d+)?|art(icle)?\.?\s*[ivx\d]+)\b/i);
    if (explicitCitationMatch) {
      const normCitQuery = explicitCitationMatch[0].toLowerCase().replace(/[^\w\d]/g, '');
      if (cleanCit.includes(normCitQuery) || cleanSec.includes(normCitQuery)) {
        score += 50;
        matchReasons.push(`Exact Document Citation Match (${entry.citation})`);
      }
    }

    // 3. Whole Verse & Thematic Phrase Matching (+35 points for multi-word theological phrases)
    const lowerQuery = query.toLowerCase();
    const entryTopicLower = entry.topic.toLowerCase();
    const entryCoreLower = entry.coreDoctrine.toLowerCase();
    const entryExcerptLower = entry.fullExcerpt.toLowerCase();

    const thematicPhrases = [
      'son of man', 'handed over', 'delivered up', 'third day', 'kill him', 'prayer and fasting',
      'keys of heaven', 'keys of the kingdom', 'faith alone', 'justified by faith', 'original sin',
      'immaculate conception', 'full of grace', 'bread of life', 'this is my body', 'eternal life',
      'holy spirit', 'born again', 'living sacrifice', 'suffering servant', 'purgatory'
    ];
    let phraseMatched = false;
    for (const phrase of thematicPhrases) {
      if (lowerQuery.includes(phrase)) {
        if (entryTopicLower.includes(phrase) || entryCoreLower.includes(phrase) || entryExcerptLower.includes(phrase)) {
          score += 35;
          phraseMatched = true;
          matchReasons.push(`Doctrinal Theme Match ("${phrase}")`);
          break;
        }
      }
    }

    // 4. Word-Boundary Token & Keyword Overlap
    const entryKeywords = new Set((entry.keywords || []).map(k => k.toLowerCase()));
    const entryTopicTokens = new Set(tokenize(entry.topic));
    const entryCoreTokens = new Set(tokenize(entry.coreDoctrine));
    const entryTextTokens = new Set(tokenize(`${entry.documentTitle} ${entry.fullExcerpt}`));

    let keywordMatches = 0;
    queryTokens.forEach(token => {
      if (entryKeywords.has(token)) {
        score += 25;
        keywordMatches++;
      } else if (entryTopicTokens.has(token)) {
        score += 15;
        keywordMatches++;
      } else if (entryCoreTokens.has(token)) {
        score += 10;
        keywordMatches++;
      } else if (entryTextTokens.has(token)) {
        score += 4;
      }
    });

    if (keywordMatches > 0) {
      matchReasons.push(`${keywordMatches} Confessional Keyword Match(es)`);
    }

    const hasSubstantiveMatch = hasScriptureMatch || phraseMatched || (keywordMatches >= 2 && score >= 35);

    return {
      entry,
      score: hasSubstantiveMatch ? score : 0,
      matchReasons
    };
  });

  // Sort descending by relevance score
  return scoredResults
    .filter(r => r.score >= minScore)
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
    endVerseNumber?: number;
    verseText?: string;
    lens: DenominationalLens;
  }
): RagGroundingContext {
  const searchResults = searchDoctrinalCorpus(query, {
    lens: context.lens,
    book: context.book,
    chapter: context.chapter,
    verseNumber: context.verseNumber,
    endVerseNumber: context.endVerseNumber,
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
