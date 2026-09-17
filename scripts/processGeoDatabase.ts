import fs from 'fs';
import path from 'path';

const ANCIENT_JSONL = path.resolve(process.cwd(), 'data/openbible/ancient.jsonl');
const MODERN_JSONL = path.resolve(process.cwd(), 'data/openbible/modern.jsonl');
const OUTPUT_JSON_PATH = path.resolve(process.cwd(), 'src/data/geoDatabase.json');

// Map OSIS Book names to our book IDs
const bookMap: Record<string, string> = {
  "Gen": "genesis", "Exod": "exodus", "Lev": "leviticus", "Num": "numbers", "Deut": "deuteronomy",
  "Josh": "joshua", "Judg": "judges", "Ruth": "ruth", "1Sam": "1samuel", "2Sam": "2samuel",
  "1Kgs": "1kings", "2Kgs": "2kings", "1Chr": "1chronicles", "2Chr": "2chronicles",
  "Ezra": "ezra", "Neh": "nehemiah", "Esth": "esther", "Job": "job", "Ps": "psalms",
  "Prov": "proverbs", "Eccl": "ecclesiastes", "Song": "songofsolomon", "Isa": "isaiah",
  "Jer": "jeremiah", "Lam": "lamentations", "Ezek": "ezekiel", "Dan": "daniel",
  "Hos": "hosea", "Joel": "joel", "Amos": "amos", "Obad": "obadiah", "Jonah": "jonah",
  "Mic": "micah", "Nah": "nahum", "Hab": "habakkuk", "Zeph": "zephaniah", "Hag": "haggai",
  "Zech": "zechariah", "Mal": "malachi",
  "Matt": "matthew", "Mark": "mark", "Luke": "luke", "John": "john", "Acts": "acts",
  "Rom": "romans", "1Cor": "1corinthians", "2Cor": "2corinthians", "Gal": "galatians",
  "Eph": "ephesians", "Phil": "philippians", "Col": "colossians", "1Thess": "1thessalonians",
  "2Thess": "2thessalonians", "1Tim": "1timothy", "2Tim": "2timothy", "Titus": "titus",
  "Phlm": "philemon", "Heb": "hebrews", "Jas": "james", "1Pet": "1peter", "2Pet": "2peter",
  "1John": "1john", "2John": "2john", "3John": "3john", "Jude": "jude", "Rev": "revelation"
};

async function processGeoData() {
  console.log("Processing OpenBible.info JSONL geographical data...");

  if (!fs.existsSync(ANCIENT_JSONL) || !fs.existsSync(MODERN_JSONL)) {
    console.error("Error: ancient.jsonl or modern.jsonl not found in data/openbible/");
    return;
  }

  // 1. Load modern locations into a lookup table
  const modernData = fs.readFileSync(MODERN_JSONL, 'utf-8').split('\n').filter(l => l.trim());
  const modernLookup: Record<string, { lat: number; lng: number, name: string }> = {};

  for (const line of modernData) {
    const mod = JSON.parse(line);
    if (mod.lonlat) {
      const [lon, lat] = mod.lonlat.split(',').map(Number);
      modernLookup[mod.id] = { lat, lng: lon, name: mod.friendly_id };
    }
  }

  // 2. Load ancient locations
  const ancientData = fs.readFileSync(ANCIENT_JSONL, 'utf-8').split('\n').filter(l => l.trim());

  const hashmap: Record<string, any> = {};

  let existingData: Record<string, any> = {};
  if (fs.existsSync(OUTPUT_JSON_PATH)) {
    existingData = JSON.parse(fs.readFileSync(OUTPUT_JSON_PATH, 'utf-8'));
  }

  for (const line of ancientData) {
    const anc = JSON.parse(line);

    // Find highest scoring modern identification
    let bestModId = null;
    let bestScore = 0;

    if (anc.modern_associations) {
      for (const [modId, assoc] of Object.entries(anc.modern_associations) as [string, any][]) {
        if (assoc.score > bestScore) {
          bestScore = assoc.score;
          bestModId = modId;
        }
      }
    }

    if (!bestModId || !modernLookup[bestModId]) continue;

    const modern = modernLookup[bestModId];
    const lat = modern.lat;
    const lng = modern.lng;
    const isEducatedGuess = bestScore < 1000;
    const placeName = anc.friendly_id;

    if (!anc.verses) continue;

    for (const verseObj of anc.verses) {
      // OSIS e.g., "Gen.12.8" or "1Kgs.5.12"
      const parts = verseObj.osis.split('.');
      if (parts.length < 3) continue;

      const bookRaw = parts[0];
      const chapter = parts[1];
      const verse = parts[2];

      const bookId = bookMap[bookRaw];
      if (!bookId) continue;

      const key = `${bookId}_${chapter}`;

      // Keep manual seeds (like matthew_19)
      if (existingData[key] && existingData[key].chapterTitle && key === "matthew_19") continue;

      if (!hashmap[key]) {
        hashmap[key] = {
          bookId,
          chapterNumber: parseInt(chapter),
          chapterTitle: `${bookRaw} ${chapter}`,
          region: "Biblical World",
          centerLat: lat,
          centerLng: lng,
          defaultZoom: 7,
          events: [],
          routeCoordinates: []
        };
      }

      const existingEvent = hashmap[key].events.find((e: any) => e.locationName === placeName);

      if (!existingEvent) {
        const stepNum = hashmap[key].events.length + 1;
        hashmap[key].events.push({
          id: `${key}_event${stepNum}`,
          stepNumber: stepNum,
          title: placeName,
          passageRef: verseObj.readable,
          verseRange: [parseInt(verse), parseInt(verse)],
          locationName: placeName,
          shortPlaceName: placeName,
          modernLocation: modern.name,
          lat: lat,
          lng: lng,
          description: `Location mentioned in ${verseObj.readable}`,
          theologicalSignificance: "",
          isEducatedGuess
        });
        hashmap[key].routeCoordinates.push([lat, lng]);

        if (stepNum === 1) {
          hashmap[key].centerLat = lat;
          hashmap[key].centerLng = lng;
        }
      }
    }
  }

  // 3. Sort events chronologically by verse order
  for (const key in hashmap) {
    hashmap[key].events.sort((a: any, b: any) => a.verseRange[0] - b.verseRange[0]);
    // Reassign step numbers and rebuild routeCoordinates after sorting
    hashmap[key].routeCoordinates = [];
    hashmap[key].events.forEach((ev: any, index: number) => {
      ev.stepNumber = index + 1;
      ev.id = `${key}_event${ev.stepNumber}`;
      hashmap[key].routeCoordinates.push([ev.lat, ev.lng]);
      if (index === 0) {
        hashmap[key].centerLat = ev.lat;
        hashmap[key].centerLng = ev.lng;
      }
    });
  }

  const finalMap = { ...hashmap };
  if (existingData['matthew_19']) {
    finalMap['matthew_19'] = existingData['matthew_19'];
  }

  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(finalMap, null, 2));
  console.log(`JSONL database successfully processed! Saved ${Object.keys(finalMap).length} chapters to src/data/geoDatabase.json`);
}

processGeoData();
