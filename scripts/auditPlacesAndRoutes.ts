import fs from 'fs';
import path from 'path';
import { BIBLE_BOOKS } from '../src/data/bibleData';
import { getChapterGeoData, calculateDistanceMiles } from '../src/data/geoData';
import { HISTORICAL_ROAD_SEGMENTS, CHAPTER_ROUTE_SEGMENT_KEYS } from '../src/data/historicalRoutes';

const dbPath = path.resolve(process.cwd(), 'src/data/geoDatabase.json');
const rawDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

console.log("===============================================================================");
console.log("COMPREHENSIVE AUDIT OF PLACES, ROUTES, AND REFERENCES");
console.log("===============================================================================");

// 1. Audit coordinates in geoDatabase.json
let totalEvents = 0;
let totalStoryline = 0;
let totalMentions = 0;
const coordinateOutliers: any[] = [];
const largeStorylineJumps: any[] = [];

for (const [chKey, chData] of Object.entries<any>(rawDb)) {
  const events = chData.events || [];
  const physicalEvents: any[] = [];
  
  for (const ev of events) {
    totalEvents++;
    if (ev.isReferencedOnly) {
      totalMentions++;
    } else {
      totalStoryline++;
      physicalEvents.push(ev);
    }

    // Check coordinate bounds (Biblical Mediterranean, Near East, Mesopotamia, Egypt, Persia, Rome: Lat 15 to 50, Lng -5 to 60)
    if (ev.lat < 15 || ev.lat > 50 || ev.lng < -10 || ev.lng > 65) {
      coordinateOutliers.push({
        chKey,
        locationName: ev.locationName,
        lat: ev.lat,
        lng: ev.lng,
        isReferencedOnly: ev.isReferencedOnly
      });
    }
  }

  // Check distance jumps between consecutive physical storyline events
  for (let i = 0; i < physicalEvents.length - 1; i++) {
    const e1 = physicalEvents[i];
    const e2 = physicalEvents[i + 1];
    const dist = calculateDistanceMiles(e1.lat, e1.lng, e2.lat, e2.lng);
    if (dist > 400) {
      largeStorylineJumps.push({
        chKey,
        from: e1.locationName,
        to: e2.locationName,
        dist: Math.round(dist),
        v1: e1.passageRef,
        v2: e2.passageRef
      });
    }
  }
}

console.log(`Total Events in Database: ${totalEvents}`);
console.log(`  Storyline (Physical Presence): ${totalStoryline}`);
console.log(`  Mentions / Non-Physical: ${totalMentions}`);
console.log(`Coordinate Outliers: ${coordinateOutliers.length}`);
if (coordinateOutliers.length > 0) {
  console.log("Coordinate Outliers:", coordinateOutliers.slice(0, 10));
}

console.log(`Large Storyline Jumps (>400 mi within single chapter): ${largeStorylineJumps.length}`);
if (largeStorylineJumps.length > 0) {
  console.log("Sample large jumps:", largeStorylineJumps.slice(0, 15));
}

// 2. Audit Curated Routes in historicalRoutes.ts
const segmentIdsInMap = new Set(Object.keys(HISTORICAL_ROAD_SEGMENTS));
const segmentIdsInChapters = new Set<string>();
const missingSegments: any[] = [];

for (const [chKey, segList] of Object.entries(CHAPTER_ROUTE_SEGMENT_KEYS)) {
  for (const segId of segList) {
    segmentIdsInChapters.add(segId);
    if (!segmentIdsInMap.has(segId)) {
      missingSegments.push({ chKey, segId });
    }
  }
}

console.log(`\nCurated Segments in Master Map: ${segmentIdsInMap.size}`);
console.log(`Segments Referenced in Chapters: ${segmentIdsInChapters.size}`);
console.log(`Missing Segments (referenced in chapter but not defined): ${missingSegments.length}`);
if (missingSegments.length > 0) {
  console.error("Missing segment details:", missingSegments);
}

// Check unused segments in HISTORICAL_ROAD_SEGMENTS
const unusedSegments = [...segmentIdsInMap].filter(id => !segmentIdsInChapters.has(id));
console.log(`Unused Curated Segments: ${unusedSegments.length}`);
if (unusedSegments.length > 0) {
  console.log("Unused segment IDs:", unusedSegments);
}

// 3. Narrative chapters with 0 physical events but known travel / presence
console.log("\nNarrative Chapters check for pure mentions vs physical presence...");
const narrativeChaptersToCheck = [
  'jonah_1', 'jonah_2', 'jonah_3', 'jonah_4',
  '1kings_19', '2kings_5', '2kings_20',
  'acts_8', 'acts_9', 'acts_14', 'acts_15', 'acts_19'
];

for (const key of narrativeChaptersToCheck) {
  const parts = key.split('_');
  const book = parts[0];
  const ch = parseInt(parts[1], 10);
  const data = getChapterGeoData(book, ch);
  if (data) {
    const phys = data.events.filter(e => !e.isReferencedOnly);
    const refs = data.events.filter(e => e.isReferencedOnly);
    const segs = data.routeSegments || [];
    console.log(`  ${key}: Physical=${phys.length} (${phys.map(p => p.shortPlaceName || p.locationName).join(', ')}), Refs=${refs.length}, Routes=${segs.length}`);
  }
}
