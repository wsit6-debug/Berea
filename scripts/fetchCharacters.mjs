import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL = 'https://raw.githubusercontent.com/BradyStephenson/bible-data/main/HitchcocksBibleNamesDictionary.csv';
const OUTPUT_FILE = path.join(__dirname, '../src/data/characterData.ts');

async function fetchCharacters() {
  console.log('Fetching character dictionary from BradyStephenson/bible-data...');
  
  try {
    const response = await fetch(URL);
    const csvText = await response.text();
    
    // Parse CSV manually
    const lines = csvText.split('\n');
    const records = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Some meanings contain commas, so we split by the first comma only
      const firstCommaIdx = line.indexOf(',');
      if (firstCommaIdx === -1) continue;
      
      const name = line.substring(0, firstCommaIdx).trim();
      const meaning = line.substring(firstCommaIdx + 1).replace(/^"|"$/g, '').trim(); // Remove surrounding quotes if any
      
      if (name && meaning) {
        records.push({ id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'), name, meaning });
      }
    }
    
    console.log(`Found ${records.length} characters/names.`);
    
    // Generate TypeScript file
    let tsContent = `export interface CharacterProfile {\n  id: string;\n  name: string;\n  meaning: string;\n}\n\n`;
    tsContent += `export const characterMap: Record<string, CharacterProfile> = {\n`;
    
    const seen = new Set();
    for (const record of records) {
      if (seen.has(record.id)) continue;
      seen.add(record.id);
      // Escape single quotes in meaning
      const escapedMeaning = record.meaning.replace(/'/g, "\\'");
      tsContent += `  '${record.id}': { id: '${record.id}', name: '${record.name}', meaning: '${escapedMeaning}' },\n`;
    }
    
    tsContent += `};\n`;
    
    // Write to src/data/characterData.ts
    fs.writeFileSync(OUTPUT_FILE, tsContent);
    console.log(`Successfully generated ${OUTPUT_FILE}`);
    
  } catch (err) {
    console.error('Failed to fetch and process characters:', err);
  }
}

fetchCharacters();
