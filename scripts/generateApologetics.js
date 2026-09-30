import fs from 'fs';
import path from 'path';

// Define paths
const CONTEXT_PATH = path.join(process.cwd(), 'src', 'data', 'apologetics_context.txt');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'generatedApologetics.json');

const OLLAMA_ENDPOINT = 'http://127.0.0.1:11434/api/generate';
const MODEL = 'llama3.2'; // Fast local model

async function generateApologetics() {
  console.log('Starting Apologetics Generation...');
  let contextText = '';
  if (fs.existsSync(CONTEXT_PATH)) {
    contextText = fs.readFileSync(CONTEXT_PATH, 'utf8');
    console.log(`Loaded dataset (${contextText.length} characters)`);
  } else {
    console.warn('No apologetics_context.txt found. Using general knowledge.');
  }

  // Generate a mock hash map for a few key chapters for demonstration purposes,
  // since a full 1189 chapter generation takes too long for a single script run.
  const targetChapters = [
    { book: 'Genesis', chapter: 1 },
    { book: 'Genesis', chapter: 2 },
    { book: 'Exodus', chapter: 14 },
    { book: 'Joshua', chapter: 6 },
    { book: 'Matthew', chapter: 28 },
    { book: 'John', chapter: 14 }
  ];

  const apologeticsMap = {};

  for (const target of targetChapters) {
    const { book, chapter } = target;
    console.log(`Generating apologetics for ${book} ${chapter}...`);
    
    const prompt = `You are a Christian Apologetics expert.
Based on the following dataset of resources (if any):
${contextText.substring(0, 2000)}

Generate the top 1 or 2 apologetic objections and classical defenses specifically related to the book of ${book}, chapter ${chapter}.
If the dataset provided above is mostly library links (like ATLA, EBSCO), you may use your general theological knowledge to generate the objections, but recommend searching those databases for further reading in the defense.

Respond ONLY with a valid JSON array of objects matching this schema:
[{
  "id": "unique-id",
  "title": "Short Title of Objection",
  "objection": "The skeptic's claim",
  "defense": "The Christian defense",
  "category": "Historical" | "Scientific" | "Moral" | "Philosophical" | "Contradiction" | "Theological"
}]

Do not include markdown blocks, just raw JSON. If there are no major objections for this chapter, return an empty array [].`;

    try {
      const response = await fetch(OLLAMA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          prompt,
          stream: false,
          format: 'json'
        })
      });

      const data = await response.json();
      const parsed = JSON.parse(data.response);
      
      if (!apologeticsMap[book]) apologeticsMap[book] = {};
      apologeticsMap[book][chapter] = parsed;
      
    } catch (e) {
      console.error(`Failed on ${book} ${chapter}:`, e.message);
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(apologeticsMap, null, 2));
  console.log('Successfully generated apologetics map to', OUTPUT_PATH);
}

generateApologetics();
