import { getChapterGeoData, getBookGeoData } from '../src/data/geoData';
import { BIBLE_BOOKS } from '../src/data/bibleData';

interface TestResult {
  book: string;
  chapter: number;
  eventCount: number;
  segmentCount: number;
  curatedCount: number;
  fallbackCount: number;
  totalDistance: number;
  validCoords: boolean;
  errors: string[];
}

const sampleChapters = [
  // Pentateuch / Torah
  { book: 'genesis', chapter: 1 },
  { book: 'genesis', chapter: 12 },
  { book: 'genesis', chapter: 22 },
  { book: 'exodus', chapter: 3 },
  { book: 'exodus', chapter: 14 },
  { book: 'exodus', chapter: 19 },
  { book: 'numbers', chapter: 13 },
  { book: 'deuteronomy', chapter: 34 },

  // Historical
  { book: 'joshua', chapter: 6 },
  { book: '1samuel', chapter: 17 },
  { book: '2samuel', chapter: 5 },
  { book: '1kings', chapter: 18 },
  { book: 'nehemiah', chapter: 2 },

  // Wisdom & Prophets
  { book: 'psalms', chapter: 23 },
  { book: 'isaiah', chapter: 6 },
  { book: 'jeremiah', chapter: 1 },
  { book: 'jonah', chapter: 1 },

  // Gospels
  { book: 'matthew', chapter: 2 },
  { book: 'matthew', chapter: 4 },
  { book: 'mark', chapter: 1 },
  { book: 'luke', chapter: 2 },
  { book: 'luke', chapter: 10 },
  { book: 'luke', chapter: 24 },
  { book: 'john', chapter: 2 },
  { book: 'john', chapter: 4 },
  { book: 'john', chapter: 11 },

  // Acts of the Apostles
  { book: 'acts', chapter: 1 },
  { book: 'acts', chapter: 8 },
  { book: 'acts', chapter: 9 },
  { book: 'acts', chapter: 10 },
  { book: 'acts', chapter: 13 },
  { book: 'acts', chapter: 14 },
  { book: 'acts', chapter: 16 },
  { book: 'acts', chapter: 17 },
  { book: 'acts', chapter: 18 },
  { book: 'acts', chapter: 27 },
  { book: 'acts', chapter: 28 },

  // Epistles & Revelation
  { book: 'romans', chapter: 1 },
  { book: '1corinthians', chapter: 1 },
  { book: 'galatians', chapter: 1 },
  { book: 'revelation', chapter: 1 },
  { book: 'revelation', chapter: 21 }
];

console.log('====================================================');
console.log('TESTING GEODATA & ROUTE GENERATION ACROSS THE BIBLE');
console.log('====================================================');

let totalTested = 0;
let totalPassed = 0;
let totalWithRoutes = 0;
let totalSegmentsCount = 0;

for (const test of sampleChapters) {
  totalTested++;
  const errors: string[] = [];
  const data = getChapterGeoData(test.book, test.chapter);

  if (!data) {
    errors.push('No data returned');
    continue;
  }

  // Validate events
  if (!data.events || data.events.length === 0) {
    errors.push('No events array present');
  } else {
    for (const ev of data.events) {
      if (typeof ev.lat !== 'number' || isNaN(ev.lat) || ev.lat < -90 || ev.lat > 90) {
        errors.push(`Invalid lat on event ${ev.id}: ${ev.lat}`);
      }
      if (typeof ev.lng !== 'number' || isNaN(ev.lng) || ev.lng < -180 || ev.lng > 180) {
        errors.push(`Invalid lng on event ${ev.id}: ${ev.lng}`);
      }
    }
  }

  // Validate routes & segments
  let curated = 0;
  let fallback = 0;
  let dist = 0;
  let validCoords = true;

  if (data.routeSegments && data.routeSegments.length > 0) {
    totalWithRoutes++;
    totalSegmentsCount += data.routeSegments.length;

    for (const seg of data.routeSegments) {
      if (!seg.coordinates || seg.coordinates.length < 2) {
        errors.push(`Segment ${seg.id} has < 2 coordinates`);
        validCoords = false;
      } else {
        for (const [lat, lng] of seg.coordinates) {
          if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90 ||
            typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) {
            errors.push(`Invalid coordinate in segment ${seg.id}: [${lat}, ${lng}]`);
            validCoords = false;
          }
        }
      }

      if (seg.distanceMiles < 0 || isNaN(seg.distanceMiles)) {
        errors.push(`Invalid distance on segment ${seg.id}: ${seg.distanceMiles}`);
      }
      if (seg.travelDays < 0 || isNaN(seg.travelDays)) {
        errors.push(`Invalid travelDays on segment ${seg.id}: ${seg.travelDays}`);
      }

      dist += seg.distanceMiles || 0;

      if (seg.id.startsWith('fallback_') || seg.historicalRoadName.includes('Straight Line') || seg.historicalRoadName.includes('Direct Path')) {
        fallback++;
      } else {
        curated++;
      }
    }
  }

  if (errors.length === 0) {
    totalPassed++;
    const segInfo = data.routeSegments?.length
      ? `${data.routeSegments.length} segments (${curated} curated, ${fallback} fallback) • ~${dist} mi`
      : 'Single stop / no routes needed';
    console.log(`✓ [PASS] ${test.book.toUpperCase()} ${test.chapter}: ${data.events?.length || 0} events | ${segInfo}`);
  } else {
    console.error(`✗ [FAIL] ${test.book.toUpperCase()} ${test.chapter}:`, errors);
  }
}

// Test Book-level aggregation
console.log('\n--- Testing Book Aggregations ---');
for (const b of ['genesis', 'acts', 'john', 'romans']) {
  const bookData = getBookGeoData(b);
  if (bookData && bookData.events.length > 0) {
    console.log(`✓ [PASS] ${b.toUpperCase()} Book View: ${bookData.events.length} aggregated places`);
  } else {
    console.error(`✗ [FAIL] ${b.toUpperCase()} Book View: No events`);
  }
}

console.log('\n====================================================');
console.log(`SUMMARY: ${totalPassed} / ${totalTested} chapters passed tests.`);
console.log(`Chapters with active transit routes: ${totalWithRoutes}`);
console.log(`Total transit segments validated: ${totalSegmentsCount}`);
console.log('====================================================');

