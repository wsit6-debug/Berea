import fs from 'fs';
import path from 'path';

const OUTPUT_PATH = path.resolve(process.cwd(), 'src/data/redLetterData.json');

const NT_BOOKS = [
  { name: 'Matthew', id: 'matthew' },
  { name: 'Mark', id: 'mark' },
  { name: 'Luke', id: 'luke' },
  { name: 'John', id: 'john' },
  { name: 'Acts', id: 'acts' },
  { name: 'Romans', id: 'romans' },
  { name: '1 Corinthians', id: '1corinthians' },
  { name: '2 Corinthians', id: '2corinthians' },
  { name: 'Galatians', id: 'galatians' },
  { name: 'Ephesians', id: 'ephesians' },
  { name: 'Philippians', id: 'philippians' },
  { name: 'Colossians', id: 'colossians' },
  { name: '1 Thessalonians', id: '1thessalonians' },
  { name: '2 Thessalonians', id: '2thessalonians' },
  { name: '1 Timothy', id: '1timothy' },
  { name: '2 Timothy', id: '2timothy' },
  { name: 'Titus', id: 'titus' },
  { name: 'Philemon', id: 'philemon' },
  { name: 'Hebrews', id: 'hebrews' },
  { name: 'James', id: 'james' },
  { name: '1 Peter', id: '1peter' },
  { name: '2 Peter', id: '2peter' },
  { name: '1 John', id: '1john' },
  { name: '2 John', id: '2john' },
  { name: '3 John', id: '3john' },
  { name: 'Jude', id: 'jude' },
  { name: 'Revelation', id: 'revelation' }
];

interface RawVerse {
  o?: number;
  r: string; // e.g. "kjv:Matthew:4:4"
  h?: number;
  t?: string; // verse text with * flags
}

interface RedLetterVerseEntry {
  isEntireVerse: boolean;
  segments: { text: string; isSpeech: boolean }[];
  speechPhrases: string[];
}

async function fetchBookData(bookName: string): Promise<RawVerse[]> {
  const encodedBook = encodeURIComponent(bookName);
  const url = `https://raw.githubusercontent.com/jburson/bible-data/main/data/kjv/books/${encodedBook}/${encodedBook}.json`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
  }
  return await res.json();
}

function parseTokensToSegments(rawText: string): { segments: { text: string; isSpeech: boolean }[]; speechPhrases: string[]; isEntireVerse: boolean } {
  const tokens = rawText.split(' ');
  const segments: { text: string; isSpeech: boolean }[] = [];
  let currentIsSpeech: boolean | null = null;
  let currentWords: string[] = [];

  let totalWords = 0;
  let speechWords = 0;

  for (const token of tokens) {
    if (!token.trim()) continue;
    totalWords++;
    
    // Check if token has * and the flag contains 'r' (red letter)
    const isSpeech = /\*[a-z]*r[a-z]*/i.test(token);
    if (isSpeech) speechWords++;

    // Clean word by stripping formatting flags *[a-z]+
    const cleanWord = token.replace(/\*[a-z]+/gi, '');

    if (currentIsSpeech === null || currentIsSpeech === isSpeech) {
      currentIsSpeech = isSpeech;
      currentWords.push(cleanWord);
    } else {
      segments.push({ text: currentWords.join(' '), isSpeech: currentIsSpeech });
      currentIsSpeech = isSpeech;
      currentWords = [cleanWord];
    }
  }

  if (currentWords.length > 0 && currentIsSpeech !== null) {
    segments.push({ text: currentWords.join(' '), isSpeech: currentIsSpeech });
  }

  const speechPhrases = segments.filter(s => s.isSpeech).map(s => s.text.trim()).filter(Boolean);
  const isEntireVerse = speechWords === totalWords && totalWords > 0;

  return { segments, speechPhrases, isEntireVerse };
}

async function buildDatabase() {
  console.log("Fetching and compiling authoritative red-letter dataset from jburson/bible-data...");
  const db: Record<string, RedLetterVerseEntry> = {};
  let totalVersesWithSpeech = 0;
  let totalEntireVerses = 0;
  let totalPartialVerses = 0;

  for (const book of NT_BOOKS) {
    console.log(`Processing ${book.name}...`);
    try {
      const verses = await fetchBookData(book.name);
      let bookSpeechCount = 0;

      for (const item of verses) {
        if (!item.t || !item.r) continue;
        
        // Parse reference e.g. "kjv:Matthew:4:4" or "kjv:1 Corinthians:11:24"
        const parts = item.r.split(':');
        if (parts.length < 4) continue;
        
        const ch = parseInt(parts[2], 10);
        const v = parseInt(parts[3], 10);
        const key = `${book.id}_${ch}_${v}`;

        // Check if verse contains red letter marker *r
        if (/\*[a-z]*r[a-z]*/i.test(item.t)) {
          const parsed = parseTokensToSegments(item.t);
          db[key] = {
            isEntireVerse: parsed.isEntireVerse,
            segments: parsed.segments,
            speechPhrases: parsed.speechPhrases
          };
          bookSpeechCount++;
          totalVersesWithSpeech++;
          if (parsed.isEntireVerse) totalEntireVerses++;
          else totalPartialVerses++;
        }
      }

      console.log(`  ${book.name}: ${bookSpeechCount} red-letter verses.`);
    } catch (err) {
      console.error(`Error processing ${book.name}:`, err);
    }
  }

  console.log("\n========================================================");
  console.log("RED-LETTER COMPILATION COMPLETE:");
  console.log(`  Total Verses with Words of Christ: ${totalVersesWithSpeech}`);
  console.log(`  Entire Spoken Verses: ${totalEntireVerses}`);
  console.log(`  Partial Verses (Dialogue/Narrative Mix): ${totalPartialVerses}`);
  console.log("========================================================");

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(db, null, 2));
  console.log(`Saved database to ${OUTPUT_PATH}`);
}

buildDatabase();
