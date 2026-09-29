import { BIBLE_BOOKS } from '../src/data/bibleData';
import { getChapterGeoData, getBookGeoData } from '../src/data/geoData';

console.log("===============================================================================");
console.log("DEEP AUDIT & VERIFICATION OF ALL 66 BOOKS (1,189 CHAPTERS)");
console.log("===============================================================================");

let chaptersChecked = 0;
let routeChapters = 0;
let totalSegments = 0;
let warnings = 0;
let errors = 0;

const NARRATIVE_BOOKS = new Set([
  'genesis', 'exodus', 'numbers', 'joshua', 'judges', 'ruth',
  '1samuel', '2samuel', '1kings', '2kings', '1chronicles', '2chronicles',
  'ezra', 'nehemiah', 'esther', 'matthew', 'mark', 'luke', 'john', 'acts'
]);

for (const book of BIBLE_BOOKS) {
  let bookStorylineCount = 0;
  let bookMentionCount = 0;
  let bookRouteCount = 0;

  for (let ch = 1; ch <= book.chaptersCount; ch++) {
    chaptersChecked++;
    const key = `${book.id.toLowerCase()}_${ch}`;
    const data = getChapterGeoData(book.id, ch);

    if (!data) {
      console.error(`[ERROR] Missing data for ${key}`);
      errors++;
      continue;
    }

    const storyline = data.events.filter(e => !e.isReferencedOnly);
    const mentions = data.events.filter(e => e.isReferencedOnly);
    bookStorylineCount += storyline.length;
    bookMentionCount += mentions.length;

    // Sanity checks on coordinates
    for (const ev of data.events) {
      if (typeof ev.lat !== 'number' || typeof ev.lng !== 'number' || isNaN(ev.lat) || isNaN(ev.lng)) {
        console.error(`[ERROR] Invalid lat/lng for ${key} event ${ev.id}: (${ev.lat}, ${ev.lng})`);
        errors++;
      }
      if (ev.lat < -90 || ev.lat > 90 || ev.lng < -180 || ev.lng > 180) {
        console.error(`[ERROR] Out of bounds lat/lng for ${key} event ${ev.id}: (${ev.lat}, ${ev.lng})`);
        errors++;
      }
    }

    // Check routes
    if (data.routeSegments && data.routeSegments.length > 0) {
      routeChapters++;
      bookRouteCount++;
      totalSegments += data.routeSegments.length;

      for (const seg of data.routeSegments) {
        if (!seg.coordinates || seg.coordinates.length < 2) {
          console.error(`[ERROR] Malformed segment ${seg.id} in ${key}: coordinates length < 2`);
          errors++;
        }
        if (typeof seg.distanceMiles !== 'number' || isNaN(seg.distanceMiles) || seg.distanceMiles <= 0) {
          console.error(`[ERROR] Invalid distance in segment ${seg.id} of ${key}: ${seg.distanceMiles}`);
          errors++;
        }
        if (seg.distanceMiles > 4500) {
          console.warn(`[WARN] Unusually large distance in ${key} (${seg.fromName} -> ${seg.toName}): ${seg.distanceMiles} mi`);
          warnings++;
        }
      }
    }

    // If narrative chapter has 0 storyline events but > 0 mention events, check if it's expected
    if (NARRATIVE_BOOKS.has(book.id.toLowerCase()) && storyline.length === 0 && mentions.length > 0) {
      // Allowed pure reference lists in narrative books
      const allowedPureMentions = [
        'genesis_10', 'numbers_34', '1chronicles_1', '1chronicles_2', '1chronicles_3', '1chronicles_4',
        '1chronicles_5', '1chronicles_6', '1chronicles_7', '1chronicles_8', '1chronicles_9',
        'joshua_13', 'joshua_15', 'joshua_16', 'joshua_17', 'joshua_18', 'joshua_19', 'joshua_20', 'joshua_21',
        '2kings_20', 'ezra_2', 'nehemiah_7', 'matthew_12', 'luke_3', 'luke_11', 'acts_7'
      ];
      if (!allowedPureMentions.includes(key)) {
        console.warn(`[CHECK] Narrative chapter ${key} has 0 physical storyline events, but has mentions: ${mentions.map(m => m.locationName).join(', ')}`);
      }
    }
  }

  // Also check book aggregation
  const bookGeo = getBookGeoData(book.id);
  if (bookGeo) {
    const bookPhys = bookGeo.events.filter(e => !e.isReferencedOnly);
    const bookRefs = bookGeo.events.filter(e => e.isReferencedOnly);
    if (bookPhys.length === 0 && bookRefs.length === 0) {
      console.error(`[ERROR] Book aggregation for ${book.name} has 0 events`);
      errors++;
    }
  }
}

console.log("\n===============================================================================");
console.log(`AUDIT COMPLETE:`);
console.log(`  Total Chapters Checked: ${chaptersChecked} / 1189`);
console.log(`  Chapters with Active Transit Routes: ${routeChapters}`);
console.log(`  Total Route Segments Verified: ${totalSegments}`);
console.log(`  Errors: ${errors}`);
console.log(`  Warnings: ${warnings}`);
console.log("===============================================================================");

if (errors > 0) {
  process.exit(1);
}
