import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'src/data/geoDatabase.json');
const kjvPath = path.resolve(process.cwd(), 'scripts/kjv.json');

const kjvData = JSON.parse(fs.readFileSync(kjvPath, 'utf8'));
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const BOOK_MAP: Record<string, string> = {
  'genesis': 'Genesis', 'exodus': 'Exodus', 'leviticus': 'Leviticus', 'numbers': 'Numbers',
  'deuteronomy': 'Deuteronomy', 'joshua': 'Joshua', 'judges': 'Judges', 'ruth': 'Ruth',
  '1samuel': '1 Samuel', '2samuel': '2 Samuel', '1kings': '1 Kings', '2kings': '2 Kings',
  '1chronicles': '1 Chronicles', '2chronicles': '2 Chronicles', 'ezra': 'Ezra', 'nehemiah': 'Nehemiah',
  'esther': 'Esther', 'job': 'Job', 'psalms': 'Psalm', 'proverbs': 'Proverbs',
  'ecclesiastes': 'Ecclesiastes', 'songofsolomon': 'Song of Solomon', 'isaiah': 'Isaiah',
  'jeremiah': 'Jeremiah', 'lamentations': 'Lamentations', 'ezekiel': 'Ezekiel', 'daniel': 'Daniel',
  'hosea': 'Hosea', 'joel': 'Joel', 'amos': 'Amos', 'obadiah': 'Obadiah', 'jonah': 'Jonah',
  'micah': 'Micah', 'nahum': 'Nahum', 'habakkuk': 'Habakkuk', 'zephaniah': 'Zephaniah',
  'haggai': 'Haggai', 'zechariah': 'Zechariah', 'malachi': 'Malachi', 'matthew': 'Matthew',
  'mark': 'Mark', 'luke': 'Luke', 'john': 'John', 'acts': 'Acts', 'romans': 'Romans',
  '1corinthians': '1 Corinthians', '2corinthians': '2 Corinthians', 'galatians': 'Galatians',
  'ephesians': 'Ephesians', 'philippians': 'Philippians', 'colossians': 'Colossians',
  '1thessalonians': '1 Thessalonians', '2thessalonians': '2 Thessalonians', '1timothy': '1 Timothy',
  '2timothy': '2 Timothy', 'titus': 'Titus', 'philemon': 'Philemon', 'hebrews': 'Hebrews',
  'james': 'James', '1peter': '1 Peter', '2peter': '2 Peter', '1john': '1 John',
  '2john': '2 John', '3john': '3 John', 'jude': 'Jude', 'revelation': 'Revelation'
};

const verseIndex = new Map<string, string>();
for (const v of kjvData) {
  verseIndex.set(v.r, v.t || '');
}

const ALIASES: Record<string, string[]> = {
  'judea': ['judaea', 'judea'],
  'negeb': ['south', 'negeb'],
  'kadesh-barnea': ['kadesh-barnea', 'kadesh', 'meribah-kadesh', 'meribah'],
  'kadesh': ['kadesh'],
  'ai': ['hai', 'ai'],
  'ashkelon': ['askelon', 'ashkelon'],
  'acco': ['accho', 'acco'],
  'sidon': ['zidon', 'sidon'],
  'red sea': ['red sea', 'sea'],
  'mount sinai': ['mount sinai', 'sinai', 'mount'],
  'wilderness of sinai': ['desert of sinai', 'wilderness of sinai', 'sinai'],
  'mount horeb': ['horeb', 'mount horeb'],
  'mount hor': ['mount hor', 'hor'],
  'mount moriah': ['moriah'],
  'mount carmel': ['carmel'],
  'mount hermon': ['hermon'],
  'mount seir': ['seir', 'mount seir'],
  'mount tabor': ['tabor'],
  'mount zion': ['zion', 'sion'],
  'zion': ['zion', 'sion'],
  'dead sea': ['salt sea', 'sea of the plain'],
  'salt sea': ['salt sea'],
  'jordan valley': ['plain of jordan', 'plains of jordan', 'plains of moab'],
  'jahaz': ['jahzah', 'jahaz'],
  'zoar': ['bela', 'zoar'],
  'habor': ['habur', 'habor'],
  'syria': ['syria', 'aram'],
  'aram': ['aram', 'syria'],
  'cush': ['ethiopia', 'cush'],
  'susa': ['shushan', 'susa'],
  'babylonia': ['babylon', 'babel'],
  'babylon': ['babylon', 'babel'],
  'assyria': ['asshur', 'assyria'],
  'philistia': ['philistines', 'philistia', 'palestina'],
  'cos': ['coos', 'cos'],
  'phoenix': ['phenice', 'phoenix'],
  'cauda': ['clauda', 'cauda'],
  'forum of appius': ['appii forum', 'forum of appius'],
  'three taverns': ['three taverns'],
  'chinnereth': ['cinneroth', 'chinnereth', 'chinneroth'],
  'sea of galilee': ['sea of galilee', 'lake of gennesaret', 'sea of tiberias'],
  'euphrates': ['river euphrates', 'euphrates', 'the river', 'river'],
  'nile': ['river of egypt', 'river', 'nile'],
  'brook of egypt': ['river of egypt', 'stream of egypt', 'brook of egypt'],
  'shephelah': ['the valley', 'low country', 'plain', 'vales'],
  'arabah': ['the plain', 'plain', 'desert'],
  'holy place': ['holy place', 'sanctuary'],
  'most holy place': ['most holy place', 'holy of holies', 'oracle'],
  'city of palms': ['city of palm trees', 'city of palms'],
  'abel-beth-maacah': ['abel-beth-maachah', 'abel beth maachah', 'abel-maim', 'abel'],
  'abel-keramim': ['plain of the vineyards', 'abel-keramim'],
  'beth-shan': ['beth-shean', 'beth-shan'],
  'socoh': ['soco', 'socoh', 'socho'],
  'arubboth': ['aruboth', 'arubboth'],
  'havvoth-jair': ['towns of jair', 'havvoth-jair'],
  'zarethan': ['zartanah', 'zaretan', 'zarethan'],
  'jokmeam': ['jokneam', 'jokmeam'],
  'holon': ['hilen', 'holon'],
  'mishal': ['mashal', 'mishal'],
  'kiriathaim': ['kiriathaim', 'kirjathaim'],
  'rimmono': ['rimmon', 'rimmono'],
  'zererah': ['zererath', 'zererah'],
  'gulloth-mayim': ['springs of water', 'gulloth-mayim'],
  'upper gulloth': ['upper springs', 'upper gulloth'],
  'lower gulloth': ['nether springs', 'lower gulloth']
};

function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\*p|\*s/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findPositionInVerse(vText: string, locationName: string): number {
  const normText = ' ' + normalize(vText) + ' ';
  let baseName = locationName.replace(/ \d+$/, '').trim().toLowerCase();
  
  const candidates: string[] = [];
  if (ALIASES[baseName]) {
    candidates.push(...ALIASES[baseName]);
  }
  candidates.push(baseName);

  if (baseName.includes('-')) {
    candidates.push(baseName.replace(/-/g, ' '));
    candidates.push(baseName.replace(/-/g, ''));
  } else {
    if (baseName.startsWith('beth') && baseName.length > 4) {
      candidates.push('beth-' + baseName.slice(4));
      candidates.push('beth ' + baseName.slice(4));
    }
    if (baseName.startsWith('beer') && baseName.length > 4) {
      candidates.push('beer-' + baseName.slice(4));
      candidates.push('beer ' + baseName.slice(4));
    }
    if (baseName.startsWith('abel') && baseName.length > 4) {
      candidates.push('abel-' + baseName.slice(4));
      candidates.push('abel ' + baseName.slice(4));
    }
    if (baseName.startsWith('baal') && baseName.length > 4) {
      candidates.push('baal-' + baseName.slice(4));
      candidates.push('baal ' + baseName.slice(4));
    }
  }

  for (const cand of candidates) {
    const normCand = normalize(cand);
    const regex = new RegExp('(?:^|\\s|-)' + normCand.replace(/[-]/g, '[- ]') + '(?:$|\\s|-)', 'i');
    const m = normText.match(regex);
    if (m && m.index !== undefined) {
      return m.index;
    }
  }

  for (const cand of candidates) {
    const normCand = normalize(cand);
    if (normCand.length >= 4) {
      const idx = normText.indexOf(normCand);
      if (idx !== -1) return idx;
    }
  }

  return -1;
}

let modifiedChaptersCount = 0;
let totalReorderedEvents = 0;

for (const [chKey, chData] of Object.entries<any>(db)) {
  const [bookId, chNumStr] = chKey.split('_');
  const bookName = BOOK_MAP[bookId];
  if (!bookName) continue;
  const chNum = parseInt(chNumStr, 10);

  const events = chData.events || [];
  if (events.length === 0) continue;

  // Chapter-specific reference vs storyline refinements
  for (const ev of events) {
    // Luke 24: Galilee (v6) & Nazareth (v19) are references
    if (chKey === 'luke_24') {
      if (['Galilee 1', 'Nazareth'].includes(ev.locationName) || ev.passageRef === 'Luke 24:6' || ev.passageRef === 'Luke 24:19') {
        ev.isReferencedOnly = true;
      }
    }
    // John 4: Gerizim (v20), Jerusalem (v20), Capernaum (v46) are references
    if (chKey === 'john_4') {
      if (['Mount Gerizim', 'Jerusalem', 'Capernaum'].includes(ev.locationName) || ev.passageRef === 'John 4:20' || ev.locationName === 'Capernaum') {
        ev.isReferencedOnly = true;
      }
    }
    // Matthew 16: Jerusalem (v21) is a future prophecy reference
    if (chKey === 'matthew_16') {
      if (ev.locationName === 'Jerusalem' || ev.passageRef === 'Matt 16:21') {
        ev.isReferencedOnly = true;
      }
    }
    // Acts 14: Lystra and Derbe are physical stops
    if (chKey === 'acts_14') {
      if (['Lystra', 'Derbe'].includes(ev.locationName)) {
        ev.isReferencedOnly = false;
      }
    }
  }

  // Group events by verseRange[0]
  const vGroups: Map<number, any[]> = new Map();
  for (const e of events) {
    const v = e.verseRange ? e.verseRange[0] : 0;
    if (!vGroups.has(v)) vGroups.set(v, []);
    vGroups.get(v)!.push(e);
  }

  let chapterChanged = false;
  const newEvents: any[] = [];

  // Sort verse groups in ascending verse order
  const sortedVerseKeys = Array.from(vGroups.keys()).sort((a, b) => a - b);

  for (const v of sortedVerseKeys) {
    const evList = vGroups.get(v)!;
    if (evList.length === 1) {
      newEvents.push(evList[0]);
    } else {
      const vKey = `kjv:${bookName}:${chNum}:${v}`;
      const vText = verseIndex.get(vKey) || '';
      
      const mapped = evList.map((e, origIdx) => ({
        e,
        origIdx,
        pos: findPositionInVerse(vText, e.locationName)
      }));

      // Sort by position in verse text if found
      mapped.sort((a, b) => {
        if (a.pos !== -1 && b.pos !== -1) {
          // Special departure/arrival preposition check in verse text
          // e.g. "went from A to B"
          return a.pos - b.pos;
        }
        if (a.pos !== -1) return -1;
        if (b.pos !== -1) return 1;
        return a.origIdx - b.origIdx;
      });

      // Check if order changed
      for (let i = 0; i < evList.length; i++) {
        if (evList[i].id !== mapped[i].e.id) {
          chapterChanged = true;
          totalReorderedEvents++;
        }
      }

      mapped.forEach(m => newEvents.push(m.e));
    }
  }

  // Renumber stepNumber strictly: Storyline 1..N and References 1..M
  let storyStep = 0;
  let refStep = 0;
  for (const ev of newEvents) {
    if (ev.isReferencedOnly) {
      refStep++;
      ev.stepNumber = refStep;
    } else {
      storyStep++;
      ev.stepNumber = storyStep;
    }
  }

  if (chapterChanged) {
    modifiedChaptersCount++;
  }

  chData.events = newEvents;
}

console.log(`Reordered events in ${modifiedChaptersCount} chapters across the Bible.`);
console.log(`Total events whose positions were corrected: ${totalReorderedEvents}`);

// Save to geoDatabase.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Successfully updated ${dbPath}!`);
