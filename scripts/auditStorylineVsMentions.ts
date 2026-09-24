import fs from 'fs';
import path from 'path';

const GEO_DATABASE = path.resolve(process.cwd(), 'src/data/geoDatabase.json');
const KJV_PATH = path.resolve(process.cwd(), 'data/kjv.json');

// Canonical list of books in KJV order (0-indexed)
const BOOK_ORDER = [
  "genesis", "exodus", "leviticus", "numbers", "deuteronomy",
  "joshua", "judges", "ruth", "1samuel", "2samuel",
  "1kings", "2kings", "1chronicles", "2chronicles",
  "ezra", "nehemiah", "esther", "job", "psalms",
  "proverbs", "ecclesiastes", "songofsolomon", "isaiah",
  "jeremiah", "lamentations", "ezekiel", "daniel",
  "hosea", "joel", "amos", "obadiah", "jonah",
  "micah", "nahum", "habakkuk", "zephaniah", "haggai",
  "zechariah", "malachi",
  "matthew", "mark", "luke", "john", "acts",
  "romans", "1corinthians", "2corinthians", "galatians",
  "ephesians", "philippians", "colossians", "1thessalonians",
  "2thessalonians", "1timothy", "2timothy", "titus",
  "philemon", "hebrews", "james", "1peter", "2peter",
  "1john", "2john", "3john", "jude", "revelation"
];

// 1. Entire chapters that are purely reference lists: genealogies, allotments, pure oracles, historical recaps
const PURE_REFERENCE_CHAPTERS = new Set([
  // Genealogies & Table of Nations
  'genesis_10',
  '1chronicles_1', '1chronicles_2', '1chronicles_3', '1chronicles_4', '1chronicles_5',
  '1chronicles_6', '1chronicles_7', '1chronicles_8', '1chronicles_9',
  'ezra_2', 'nehemiah_7',

  // Tribal boundary allotments & city lists
  'joshua_13', 'joshua_15', 'joshua_16', 'joshua_17', 'joshua_18', 'joshua_19', 'joshua_20', 'joshua_21',
  'numbers_34',
  'ezekiel_47', 'ezekiel_48',

  // Prophetic Oracles against foreign nations
  'isaiah_13', 'isaiah_14', 'isaiah_15', 'isaiah_16', 'isaiah_17', 'isaiah_18', 'isaiah_19', 'isaiah_21', 'isaiah_23',
  'jeremiah_46', 'jeremiah_47', 'jeremiah_48', 'jeremiah_49', 'jeremiah_50', 'jeremiah_51',
  'ezekiel_25', 'ezekiel_26', 'ezekiel_27', 'ezekiel_28', 'ezekiel_29', 'ezekiel_30', 'ezekiel_31', 'ezekiel_32',
  'amos_1', 'amos_2',
  'obadiah_1',
  'nahum_2', 'nahum_3',
  'zephaniah_2',

  // Speeches recounting ancient history
  'acts_7',
  'hebrews_11',
  'psalms_78', 'psalms_105', 'psalms_106', 'psalms_135', 'psalms_136'
]);

// Strip Strongs tags, footnotes, etc. from KJV text
function cleanKjvText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/\{[^}]*\}/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface AuditResult {
  promotedToStoryline: number;
  demotedToMentioned: number;
  maintainedStoryline: number;
  maintainedMentioned: number;
  details: string[];
}

export function auditAndClassifyDatabase(dryRun: boolean = true): AuditResult {
  const db = JSON.parse(fs.readFileSync(GEO_DATABASE, 'utf-8'));
  const kjvRaw = fs.readFileSync(KJV_PATH, 'utf-8').replace(/^\uFEFF/, '');
  const kjv = JSON.parse(kjvRaw);

  const result: AuditResult = {
    promotedToStoryline: 0,
    demotedToMentioned: 0,
    maintainedStoryline: 0,
    maintainedMentioned: 0,
    details: []
  };

  for (const chapKey in db) {
    const chapterData = db[chapKey];
    const events: any[] = chapterData.events || [];
    if (events.length === 0) continue;

    const [bookId, chapStr] = chapKey.split('_');
    const chapterNum = parseInt(chapStr, 10);
    const bookIndex = BOOK_ORDER.indexOf(bookId.toLowerCase());
    const kjvBook = bookIndex !== -1 ? kjv[bookIndex] : null;
    const kjvVerses: string[] = (kjvBook && kjvBook.chapters && kjvBook.chapters[chapterNum - 1]) || [];

    const isPureRefChapter = PURE_REFERENCE_CHAPTERS.has(chapKey);

    for (const ev of events) {
      const originalIsRef = Boolean(ev.isReferencedOnly);
      let newIsRef = originalIsRef;

      if (isPureRefChapter) {
        newIsRef = true;
      } else {
        const vNum = ev.verseRange ? ev.verseRange[0] : 1;
        const rawVerseText = kjvVerses[vNum - 1] || '';
        const verseText = cleanKjvText(rawVerseText);
        const locName = (ev.locationName || '').trim();
        const shortName = (ev.shortPlaceName || locName).replace(/\s*\d+$/, '').trim();

        // 1. Check for physical storyline indicators in the verse
        // Verbs of motion, arrival, departure, sailing, encampment, battle, habitation
        const motionPattern = /\b(passed through|passed by|came|went|journeyed|departed|arrived|reached|sailed|landed|loosed from|launched|entered|brought|led them out|walked|fled|returned|escaped|encamped|camped|pitched|dwelt|abode|tarried|lodged|gathered|assembled|built an altar|fought|smote|besieged|took the city)\b/i;

        // 2. Check for mentioned-only indicators (Origins/Epithets, Sayings/Comparisons, Sermons)
        // Demonym / Origin: "man of [City]", "born in [City]", or specific person + "of [City]"
        const personOriginRegex = new RegExp(`\\b(man|men|woman|women|inhabitants|citizen|born|native)\\s+(?:of|in|at)\\s+${shortName}\\b`, 'i');
        const namedPersonOrigin = new RegExp(`\\b(Simon|Lucius|Joseph|Mary|Jesus|Saul|Paul|Gaius|Sopater|Aristarchus|Secundus|Tychicus|Trophimus|Jason|Aquila|Apollos)\\s+(?:of|from)\\s+${shortName}\\b`, 'i');
        const governorRegex = new RegExp(`\\b(governor|tetrarch|proconsul|deputy|king|ruler|kingdom)\\s+of\\s+${shortName}\\b`, 'i');

        // Metaphor / Comparison: "woe unto thee, Chorazin", "like unto Sodom", "even as Gomorrah", "from Dan to Beersheba"
        const comparisonRegex = new RegExp(`\\b(woe\\s+unto\\s+(?:thee|you)[,:]?|like\\s+unto|even\\s+as)\\s+.*\\b${shortName}\\b`, 'i');
        const danToBeersheba = /from\s+Dan\s+(?:even\s+)?to\s+Beer-?sheba/i.test(verseText);

        // Specific narrative chapter calibrations based on text context:
        let isStoryline = false;
        let isMention = false;

        // Specific book / chapter sermon / dialogue checks
        if (chapKey === 'luke_2' && vNum === 2 && locName.toLowerCase().includes('syria')) {
          // Cyrenius governor of Syria dating formula
          isMention = true;
        } else if (chapKey === 'luke_3' && vNum === 1 && (locName.toLowerCase().includes('ituraea') || locName.toLowerCase().includes('trachonitis') || locName.toLowerCase().includes('abilene'))) {
          // Historical dating formula
          isMention = true;
        } else if (chapKey === 'acts_13' && vNum >= 17 && vNum <= 22) {
          // Paul's sermon recounting Egypt / Canaan
          isMention = true;
        } else if (chapKey === 'acts_13' && vNum === 1 && locName.toLowerCase().includes('cyrene')) {
          // Lucius of Cyrene
          isMention = true;
        } else if (chapKey === 'acts_18' && (vNum === 2 && locName.toLowerCase().includes('pontus') || vNum === 24 && locName.toLowerCase().includes('alexandria'))) {
          // Aquila born in Pontus, Apollos born in Alexandria
          isMention = true;
        } else if (chapKey === 'acts_20' && vNum === 4) {
          // Traveling companion origins: Sopater of Berea, Aristarchus of Thessalonica, Gaius of Derbe, Tychicus of Asia
          isMention = true;
        } else if (chapKey === 'acts_27' && vNum === 2 && (locName.toLowerCase().includes('adramyttium') || locName.toLowerCase().includes('thessalonica'))) {
          // Ship of Adramyttium, Aristarchus of Thessalonica
          isMention = true;
        } else if (chapKey === 'acts_16' && (vNum === 6 && locName.toLowerCase().includes('asia') || vNum === 7 && locName.toLowerCase().includes('bithynia'))) {
          // Forbidden to preach in Asia, Spirit suffered them not into Bithynia
          isMention = true;
        } else if (chapKey === 'acts_21' && (vNum === 39 || vNum === 40)) {
          // Paul stating "I am a man of Tarsus, in Cilicia" while in Jerusalem
          isMention = true;
        } else if (chapKey === 'acts_22' && vNum === 3) {
          // Paul stating "born in Tarsus"
          isMention = true;
        } else if (chapKey === 'luke_4' && (vNum === 25 || vNum === 26 || vNum === 27)) {
          // Jesus in Nazareth sermon mentioning Sarepta / Syria
          isMention = true;
        } else if ((chapKey === 'matthew_11' || chapKey === 'luke_10') && (vNum >= 20 && vNum <= 24 || vNum >= 12 && vNum <= 15)) {
          // Woe to Chorazin / Bethsaida / Tyre / Sidon / Sodom
          if (['Chorazin', 'Bethsaida', 'Tyre', 'Sidon', 'Sodom'].some(p => locName.includes(p))) {
            isMention = true;
          }
        } else if (chapKey === 'luke_10' && vNum >= 30 && vNum <= 36) {
          // Good Samaritan Parable (Jerusalem -> Jericho)
          isMention = true;
        } else if (chapKey === 'jonah_1' && (vNum === 2 || vNum === 3)) {
          // Jonah: Nineveh is commanded, Tarshish is target destination, Joppa is physical port
          if (locName.toLowerCase().includes('nineveh') || locName.toLowerCase().includes('tarshish')) {
            isMention = true;
          } else if (locName.toLowerCase().includes('joppa')) {
            isStoryline = true;
          }
        } else if (danToBeersheba && (locName.toLowerCase().includes('dan') || locName.toLowerCase().includes('beersheba'))) {
          isMention = true;
        } else if (personOriginRegex.test(verseText) || namedPersonOrigin.test(verseText)) {
          // Only if the verse is not primarily describing movement to/from that place
          if (!motionPattern.test(verseText)) {
            isMention = true;
          }
        } else if (governorRegex.test(verseText) && !motionPattern.test(verseText)) {
          isMention = true;
        } else if (comparisonRegex.test(verseText)) {
          isMention = true;
        } else if (motionPattern.test(verseText)) {
          // The verse explicitly describes physical movement / arrival / encampment / sailing!
          isStoryline = true;
        }

        // Apply decision
        if (isMention) {
          newIsRef = true;
        } else if (isStoryline) {
          newIsRef = false;
        } else {
          // If no specific match, default to Storyline for narrative books, Reference for prophetic/epistolary
          const isNarrativeBook = ['genesis', 'exodus', 'numbers', 'joshua', 'judges', 'ruth', '1samuel', '2samuel', '1kings', '2kings', '1chronicles', '2chronicles', 'ezra', 'nehemiah', 'esther', 'matthew', 'mark', 'luke', 'john', 'acts'].includes(bookId.toLowerCase());

          if (isNarrativeBook) {
            // In narrative books, places mentioned in narrative context default to physical storyline
            newIsRef = false;
          } else {
            // In Epistles and Prophets, places mentioned default to reference/mention
            newIsRef = true;
          }
        }
      }

      // Track transitions
      if (originalIsRef && !newIsRef) {
        result.promotedToStoryline++;
        result.details.push(`[PROMOTED TO STORYLINE] ${chapKey} (${ev.passageRef}): ${ev.locationName}`);
      } else if (!originalIsRef && newIsRef) {
        result.demotedToMentioned++;
        result.details.push(`[DEMOTED TO MENTIONED] ${chapKey} (${ev.passageRef}): ${ev.locationName}`);
      } else if (!newIsRef) {
        result.maintainedStoryline++;
      } else {
        result.maintainedMentioned++;
      }

      ev.isReferencedOnly = newIsRef;
    }
  }

  if (!dryRun) {
    fs.writeFileSync(GEO_DATABASE, JSON.stringify(db, null, 2));
    console.log(`Updated ${GEO_DATABASE} successfully!`);
  }

  return result;
}

// If run directly from CLI
if (process.argv[1]?.includes('auditStorylineVsMentions.ts')) {
  const isApply = process.argv.includes('--apply');
  console.log(`Running Bible Geo Audit (mode: ${isApply ? 'APPLY' : 'DRY RUN'})...`);
  const res = auditAndClassifyDatabase(!isApply);
  console.log('\nAudit Summary:');
  console.log(`  Promoted to Storyline (Rescued): ${res.promotedToStoryline}`);
  console.log(`  Demoted to Mentioned (Filtered): ${res.demotedToMentioned}`);
  console.log(`  Maintained Storyline: ${res.maintainedStoryline}`);
  console.log(`  Maintained Mentioned: ${res.maintainedMentioned}`);
  console.log('\nSample Promotions (first 25):');
  res.details.filter(d => d.startsWith('[PROMOTED')).slice(0, 25).forEach(d => console.log('  ' + d));
  console.log('\nSample Demotions (first 25):');
  res.details.filter(d => d.startsWith('[DEMOTED')).slice(0, 25).forEach(d => console.log('  ' + d));
}
