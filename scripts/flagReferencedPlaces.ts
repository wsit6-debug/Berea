import fs from 'fs';
import path from 'path';

const GEO_DATABASE = path.resolve(process.cwd(), 'src/data/geoDatabase.json');

// Entire chapters that are purely lists/allotments/oracles
const PURE_REFERENCE_CHAPTERS = [
  'genesis_10', // Table of Nations
  'numbers_33', // Wilderness journey recap
  // Joshua boundary allotments
  'joshua_13', 'joshua_15', 'joshua_16', 'joshua_17', 'joshua_18', 'joshua_19', 'joshua_20', 'joshua_21',
  // Prophetic Oracles against the nations
  'isaiah_13', 'isaiah_14', 'isaiah_15', 'isaiah_16', 'isaiah_17', 'isaiah_18', 'isaiah_19', 'isaiah_21', 'isaiah_23',
  'jeremiah_46', 'jeremiah_47', 'jeremiah_48', 'jeremiah_49', 'jeremiah_50', 'jeremiah_51',
  'ezekiel_25', 'ezekiel_26', 'ezekiel_27', 'ezekiel_28', 'ezekiel_29', 'ezekiel_30', 'ezekiel_31', 'ezekiel_32',
  'amos_1', 'amos_2',
];

function flagReferencedPlaces() {
  console.log("Loading geoDatabase.json...");
  const db = JSON.parse(fs.readFileSync(GEO_DATABASE, 'utf-8'));
  let flaggedCount = 0;

  for (const chapKey in db) {
    const chapterData = db[chapKey];
    const events = chapterData.events;
    
    // 1. If the entire chapter is a known reference list
    if (PURE_REFERENCE_CHAPTERS.includes(chapKey)) {
      for (const ev of events) {
        ev.isReferencedOnly = true;
        flaggedCount++;
      }
      continue;
    }

    // 2. Heuristic: If a single verse contains more than 2 locations, 
    // it's highly likely a list of mentioned places, not physical movement.
    const verseMap: Record<number, any[]> = {};
    for (const ev of events) {
      const vNum = ev.verseRange[0];
      if (!verseMap[vNum]) verseMap[vNum] = [];
      verseMap[vNum].push(ev);
    }

    for (const vNum in verseMap) {
      if (verseMap[vNum].length > 2) {
        // Flag all as references
        for (const ev of verseMap[vNum]) {
          ev.isReferencedOnly = true;
          flaggedCount++;
        }
      } else {
        // Ensure the flag is false/cleared for physical places
        for (const ev of verseMap[vNum]) {
          ev.isReferencedOnly = false;
        }
      }
    }
  }

  console.log(`Successfully flagged ${flaggedCount} places as 'Referenced Only'.`);
  fs.writeFileSync(GEO_DATABASE, JSON.stringify(db, null, 2));
  console.log("geoDatabase.json saved!");
}

flagReferencedPlaces();
