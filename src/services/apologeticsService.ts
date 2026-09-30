import apologeticsRaw from '../data/generatedApologetics.json';
import { ApologeticObjection, ApologeticsMap } from '../data/apologeticsData';
import { DoctrinalEntry } from './ragService';
import { DenominationalLens } from '../data/theologyData';

export const APOLOGETICS_DATA = apologeticsRaw as unknown as ApologeticsMap;

export interface ApologeticMatch extends ApologeticObjection {
  book: string;
  chapter: number;
  score: number;
}

const STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'with', 'to', 'from', 'by',
  'what', 'why', 'how', 'who', 'does', 'did', 'do', 'can', 'about', 'this', 'that', 'these', 'those',
  'her', 'his', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'tell', 'me', 'find', 'give',
  'there', 'their', 'they', 'you', 'your', 'i', 'im', 'am', 'looking', 'look', 'want', 'dive', 'deeper',
  'unpack', 'help', 'practice', 'defending'
]);

/**
 * Searches the curated apologetics database for objections and classical defenses
 * matching the user's query, active book, and active chapter.
 */
export function searchApologetics(
  query: string,
  currentBook?: string,
  currentChapter?: number,
  limit = 3
): ApologeticMatch[] {
  if (!query || !query.trim()) return [];

  const qLower = query.toLowerCase();
  const rawTokens: string[] = qLower.match(/\w+/g) || [];
  const qTokens = new Set<string>(rawTokens.filter(t => !STOPWORDS.has(t) && t.length > 1));

  const results: ApologeticMatch[] = [];

  for (const [book, chapters] of Object.entries(APOLOGETICS_DATA)) {
    const bookLower = book.toLowerCase();
    const isBookMatch = currentBook && currentBook.toLowerCase() === bookLower;
    const mentionsBook = qLower.includes(bookLower);

    for (const [chStr, objections] of Object.entries(chapters)) {
      const chNum = parseInt(chStr, 10);
      const isChapterMatch = Boolean(isBookMatch && currentChapter === chNum);
      const mentionsChapter = rawTokens.includes(chStr);

      for (const obj of objections) {
        let score = 0;
        const titleLower = obj.title.toLowerCase();
        const objLower = obj.objection.toLowerCase();
        const defLower = obj.defense.toLowerCase();
        const catLower = obj.category.toLowerCase();

        // 1. Contextual boost if user is on this chapter
        if (isChapterMatch) {
          score += 4;
        }

        // 2. Direct title / phrase match
        if (qLower.includes(titleLower)) {
          score += 25;
        } else {
          // Substring / partial title match
          const titleWords = titleLower.match(/\w+/g) || [];
          let titleMatches = 0;
          for (const w of titleWords) {
            if (!STOPWORDS.has(w) && qTokens.has(w)) {
              titleMatches++;
            }
          }
          score += titleMatches * 7;
        }

        // 3. Mentions book and chapter explicitly
        if (mentionsBook) {
          score += 5;
          if (mentionsChapter) {
            score += 12;
          }
        }

        // 4. Token overlap with objection text
        const objWords = objLower.match(/\w+/g) || [];
        for (const w of objWords) {
          if (!STOPWORDS.has(w) && qTokens.has(w)) {
            score += 3;
          }
        }

        // 5. Token overlap with defense text
        const defWords = defLower.match(/\w+/g) || [];
        for (const w of defWords) {
          if (!STOPWORDS.has(w) && qTokens.has(w)) {
            score += 1.5;
          }
        }

        // 6. Category match (e.g. "scientific", "contradiction", "moral")
        if (qTokens.has(catLower)) {
          score += 3;
        }

        // 7. Generic apologetics keywords trigger boost for active chapter
        if (isChapterMatch && (qTokens.has('objection') || qTokens.has('defense') || qTokens.has('apologetics') || qTokens.has('problem') || qTokens.has('contradiction') || qTokens.has('issue'))) {
          score += 8;
        }

        if (score >= 6) {
          results.push({
            ...obj,
            book,
            chapter: chNum,
            score
          });
        }
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/**
 * Returns all apologetic objections and defenses for a specific biblical chapter.
 */
export function getApologeticsForChapter(book: string, chapter: number): ApologeticObjection[] {
  return APOLOGETICS_DATA[book]?.[chapter] || [];
}

/**
 * Formats matched apologetic entries into a grounded context prompt for LLM consumption.
 */
export function formatApologeticsForPrompt(matches: ApologeticMatch[]): string {
  if (matches.length === 0) return '';

  return `
### [CHRISTIAN APOLOGETICS & CLASSICAL DEFENSES]:
The user's query relates to one or more biblical challenges, apparent contradictions, or skeptical objections.
${matches.map(m => `
---
[Topic: ${m.title} (${m.category}) - ${m.book} ${m.chapter}]:
- Question / Objection Examined:
"${m.objection}"

- Verified Classical Christian Defense:
"${m.defense}"
`).join('\n')}
`;
}

/**
 * Converts an apologetic match into a DoctrinalEntry for UI chip citations and RAG display.
 */
export function apologeticToCitationEntry(match: ApologeticMatch, tradition: DenominationalLens = 'reformed'): DoctrinalEntry {
  return {
    id: `apologetics-${match.id}`,
    tradition,
    documentTitle: `Christian Apologetics: ${match.title}`,
    sectionOrArticle: `${match.category} Defense`,
    citation: `${match.book} ${match.chapter}`,
    yearOrEra: 'Classical Christian Apologetics',
    topic: `${match.title} (${match.category})`,
    coreDoctrine: match.defense,
    fullExcerpt: `Skeptical Objection / Challenge: "${match.objection}"\n\nClassical Christian Defense:\n"${match.defense}"`,
    relatedScriptures: [`${match.book} ${match.chapter}`],
    keywords: [match.category, 'Apologetics', match.title, match.book]
  };
}

/**
 * Returns all apologetic objections and classical defenses converted into DoctrinalEntry items
 * for universal availability within the RAG corpus.
 */
export function getAllApologeticsDoctrinalEntries(): DoctrinalEntry[] {
  const entries: DoctrinalEntry[] = [];
  for (const [book, chapters] of Object.entries(APOLOGETICS_DATA)) {
    for (const [chStr, objections] of Object.entries(chapters)) {
      const chNum = parseInt(chStr, 10);
      for (const obj of objections) {
        entries.push({
          id: `apologetics-${obj.id}`,
          tradition: 'universal' as any,
          documentTitle: `Christian Apologetics: ${obj.title}`,
          sectionOrArticle: `${obj.category} Defense`,
          citation: `${book} ${chNum}`,
          yearOrEra: 'Classical Christian Apologetics',
          topic: `${obj.title} (${obj.category})`,
          coreDoctrine: obj.defense,
          fullExcerpt: `Skeptical Objection / Challenge: "${obj.objection}"\n\nClassical Christian Defense:\n"${obj.defense}"`,
          relatedScriptures: [`${book} ${chNum}`],
          keywords: [
            obj.category.toLowerCase(),
            'apologetics',
            'defense',
            'objection',
            'christianity',
            'skepticism',
            'argument',
            book.toLowerCase(),
            ...obj.title.toLowerCase().split(/\s+/),
            ...obj.objection.toLowerCase().split(/\s+/).filter(w => w.length > 4)
          ]
        });
      }
    }
  }
  return entries;
}
