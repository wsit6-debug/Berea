import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://raw.githubusercontent.com/BradyStephenson/bible-data/main/BibleData-Person.csv';
const OUTPUT_FILE = path.join(__dirname, '../src/data/characterData.ts');

async function fetchCharacters() {
  console.log('Fetching character list from BradyStephenson/bible-data (BibleData-Person.csv)...');
  
  try {
    const response = await fetch(URL);
    const csvText = await response.text();
    
    // Parse CSV handling quoted commas
    const lines = csvText.split('\n');
    const records = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Split by comma, but ignore commas inside quotes
      const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      if (row.length >= 2) {
        const idRaw = row[0].replace(/^"|"$/g, '').trim();
        const nameRaw = row[1].replace(/^"|"$/g, '').trim();
        const attrRaw = row[3] ? row[3].replace(/^"|"$/g, '').trim() : '';
        const notesRaw = row[6] ? row[6].replace(/^"|"$/g, '').trim() : '';
        
        let meaning = attrRaw;
        if (notesRaw && !meaning) meaning = notesRaw;
        
        const id = nameRaw.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (nameRaw) {
          records.push({ id, name: nameRaw, meaning });
        }
      }
    }
    
    console.log(`Found ${records.length} character entries.`);
    
    let tsContent = `export interface CharacterProfile {\n  id: string;\n  name: string;\n  meaning: string;\n}\n\n`;
    tsContent += `export const characterMap: Record<string, CharacterProfile> = {\n`;
    
    const seen = new Set();
    for (const record of records) {
      if (seen.has(record.id)) continue;
      seen.add(record.id);
      
      const escapedMeaning = record.meaning.replace(/'/g, "\\'");
      tsContent += `  '${record.id}': { id: '${record.id}', name: '${record.name}', meaning: '${escapedMeaning}' },\n`;
    }
    
    tsContent += `};\n`;
    
    fs.writeFileSync(OUTPUT_FILE, tsContent);
    console.log(`Successfully generated ${OUTPUT_FILE} with ${seen.size} unique characters`);
    
  } catch (err) {
    console.error('Failed to fetch and process characters:', err);
  }
}

fetchCharacters();
