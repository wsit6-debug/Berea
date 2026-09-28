import fs from 'fs';
import path from 'path';
import { getChapterGeoData } from '../src/data/geoData';
import { HISTORICAL_ROAD_SEGMENTS, CHAPTER_ROUTE_SEGMENT_KEYS } from '../src/data/historicalRoutes';

console.log("===============================================================================");
console.log("DETAILED AUDIT OF ROUTE DIRECTIONALITY & EVENT ORDER");
console.log("===============================================================================");

for (const [chKey, segKeys] of Object.entries(CHAPTER_ROUTE_SEGMENT_KEYS)) {
  const [book, chStr] = chKey.split('_');
  const chNum = parseInt(chStr, 10);
  const data = getChapterGeoData(book, chNum);
  if (!data) continue;

  const storyline = data.events.filter(e => !e.isReferencedOnly);
  console.log(`\n--- Chapter: ${chKey} ---`);
  console.log(`  Storyline events in order:`);
  storyline.forEach(e => {
    console.log(`    Step ${e.stepNumber}: ${e.locationName} (${e.passageRef})`);
  });

  console.log(`  Curated route segments:`);
  segKeys.forEach((segKey, idx) => {
    const seg = HISTORICAL_ROAD_SEGMENTS[segKey];
    if (seg) {
      console.log(`    Seg ${idx + 1}: ${seg.fromName} -> ${seg.toName} [${seg.historicalRoadName || ''}]`);
    } else {
      console.log(`    Seg ${idx + 1}: MISSING ${segKey}`);
    }
  });

  // Check if first segment starts where storyline starts
  const firstSeg = HISTORICAL_ROAD_SEGMENTS[segKeys[0]];
  const firstStory = storyline[0];
  const lastSeg = HISTORICAL_ROAD_SEGMENTS[segKeys[segKeys.length - 1]];
  const lastStory = storyline[storyline.length - 1];

  if (firstSeg && firstStory) {
    const matchStart = firstSeg.fromName.toLowerCase().includes(firstStory.locationName.toLowerCase()) ||
      firstStory.locationName.toLowerCase().includes(firstSeg.fromName.toLowerCase());
    if (!matchStart) {
      console.log(`  ⚠️ MISMATCH START: First event is "${firstStory.locationName}" but first segment starts at "${firstSeg.fromName}"`);
    }
  }

  // Check continuity between segments
  for (let i = 0; i < segKeys.length - 1; i++) {
    const s1 = HISTORICAL_ROAD_SEGMENTS[segKeys[i]];
    const s2 = HISTORICAL_ROAD_SEGMENTS[segKeys[i + 1]];
    if (s1 && s2) {
      // Check if s1.toName connects to s2.fromName
      const to1 = s1.toName.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
      const from2 = s2.fromName.toLowerCase().split(' ')[0].replace(/[^a-z]/g, '');
      if (to1 !== from2 && !s1.toName.toLowerCase().includes(from2) && !s2.fromName.toLowerCase().includes(to1)) {
        console.log(`  ⚠️ GAP/DISCONTINUITY between Seg ${i + 1} (${s1.fromName} -> ${s1.toName}) and Seg ${i + 2} (${s2.fromName} -> ${s2.toName})`);
      }
    }
  }
}
