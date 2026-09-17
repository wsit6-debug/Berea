import fs from 'fs';
import path from 'path';

const ANCIENT_JSONL = path.resolve(process.cwd(), 'data/openbible/ancient.jsonl');
const GEO_DATABASE = path.resolve(process.cwd(), 'src/data/geoDatabase.json');

async function generateSignificance() {
  console.log("Loading ancient.jsonl for Wikidata IDs...");
  const ancientData = fs.readFileSync(ANCIENT_JSONL, 'utf-8').split('\n').filter(l => l.trim());
  
  // Map friendly_id to Q-Code
  const placeToQCode: Record<string, string> = {};
  for (const line of ancientData) {
    try {
      const anc = JSON.parse(line);
      let qCode = null;
      if (anc.linked_data) {
        for (const [key, value] of Object.entries(anc.linked_data) as [string, any][]) {
          if (value.id && typeof value.id === 'string' && value.id.startsWith('Q') && !value.id.includes('@')) {
            qCode = value.id;
            break;
          }
        }
      }
      if (qCode) {
        placeToQCode[anc.friendly_id] = qCode;
      }
    } catch (e) {}
  }

  console.log(`Found ${Object.keys(placeToQCode).length} Wikidata mappings.`);

  console.log("Loading geoDatabase.json...");
  const geoDb = JSON.parse(fs.readFileSync(GEO_DATABASE, 'utf-8'));

  // Collect unique Q-Codes we actually need
  const neededQCodes = new Set<string>();
  for (const chapterData of Object.values(geoDb) as any[]) {
    for (const ev of chapterData.events) {
      const qCode = placeToQCode[ev.title] || placeToQCode[ev.locationName];
      if (qCode) neededQCodes.add(qCode);
    }
  }

  const qCodeArray = Array.from(neededQCodes);
  console.log(`Fetching descriptions for ${qCodeArray.length} unique Wikidata IDs...`);

  const qCodeToDescription: Record<string, string> = {};

  // Fetch in batches of 50
  for (let i = 0; i < qCodeArray.length; i += 50) {
    const batch = qCodeArray.slice(i, i + 50);
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&props=descriptions&languages=en&format=json&ids=${batch.join('|')}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.entities) {
        for (const [id, entity] of Object.entries(data.entities) as [string, any][]) {
          if (entity.descriptions && entity.descriptions.en) {
            qCodeToDescription[id] = entity.descriptions.en.value;
          }
        }
      }
    } catch (e) {
      console.error(`Failed to fetch batch ${i}:`, e);
    }
  }

  let updatedEvents = 0;
  // Update geoDatabase
  for (const chapterData of Object.values(geoDb) as any[]) {
    for (const ev of chapterData.events) {
      const qCode = placeToQCode[ev.title] || placeToQCode[ev.locationName];
      if (qCode && qCodeToDescription[qCode]) {
        const desc = qCodeToDescription[qCode];
        // Capitalize first letter
        const formattedDesc = desc.charAt(0).toUpperCase() + desc.slice(1) + '.';
        ev.description = formattedDesc;
        updatedEvents++;
      }
    }
  }

  console.log(`Successfully updated ${updatedEvents} events with Wikidata descriptions.`);
  fs.writeFileSync(GEO_DATABASE, JSON.stringify(geoDb, null, 2));
  console.log("geoDatabase.json saved!");
}

generateSignificance();
