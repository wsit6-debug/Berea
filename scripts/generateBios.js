import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use experimental fetch available in Node 18+
const OLLAMA_URL = 'http://localhost:11434/api/chat';
const DELAY_MS = 2000; // Delay between single requests

const characterDataPath = path.resolve(__dirname, '../src/data/characterData.ts');
const generatedBiosPath = path.resolve(__dirname, '../src/data/generatedBiographies.json');

async function generateBio(characterName) {
  const prompt = `Write a concise, 2-3 sentence theological and historical biography for the biblical character ${characterName}. Focus on their significance in the biblical narrative. Do not use markdown formatting, bold text, or line breaks. Return ONLY the biography text. If you genuinely do not have enough information to write a biography for this specific obscure biblical character, you must reply with exactly "UNKNOWN_CHARACTER" and nothing else.`;

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.1',
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let text = data.message.content.trim();
    if (text === 'UNKNOWN_CHARACTER' || text.startsWith('I ') || text.startsWith('As an AI')) {
      return '';
    }
    return text;
  } catch (error) {
    console.error(`Failed to generate bio for ${characterName}:`, error.message);
    return null;
  }
}

async function run() {
  console.log('Starting bulk character biography generation...');

  // 1. Read existing generated bios
  let generatedBios = {};
  if (fs.existsSync(generatedBiosPath)) {
    generatedBios = JSON.parse(fs.readFileSync(generatedBiosPath, 'utf-8'));
  }

  // 2. Read characterData.ts and parse out characters
  const characterDataStr = fs.readFileSync(characterDataPath, 'utf-8');
  
  const charactersToProcess = [];
  const regex = /'([^']+)':\s*\{\s*id:\s*'[^']+',\s*name:\s*'([^']+)'(.*?)\}/gs;
  let match;
  
  while ((match = regex.exec(characterDataStr)) !== null) {
    const id = match[1];
    const name = match[2];
    const rest = match[3];
    
    // Skip if it already has a hardcoded aiBiography in the TS file
    if (rest.includes('aiBiography:')) {
      continue;
    }
    
    // Skip if we already generated it
    if (generatedBios[id] && generatedBios[id].aiBiography !== undefined) {
      continue;
    }

    charactersToProcess.push({ id, name });
  }

  console.log(`Found ${charactersToProcess.length} characters needing biographies.`);

  // 3. Process them sequentially to avoid overloading the local LLM
  for (let i = 0; i < charactersToProcess.length; i++) {
    const char = charactersToProcess[i];
    console.log(`[${i + 1}/${charactersToProcess.length}] Generating for ${char.name}...`);
    
    const bio = generatedBios[char.id]?.aiBiography || await generateBio(char.name);
    
    generatedBios[char.id] = { 
      aiBiography: bio
    };
    
    // Save after every successful generation so progress is never lost
    fs.writeFileSync(generatedBiosPath, JSON.stringify(generatedBios, null, 2));
    console.log(`  -> Success. Saved.`);

    // Add a delay to let the CPU/GPU breathe
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }

  console.log('Finished bulk generation!');
}

run().catch(console.error);
