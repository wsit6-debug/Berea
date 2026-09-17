import { generateQuiz } from './src/services/aiService';

const tests = [
  { book: 'Genesis', chapter: 1, text: 'In the beginning God created the heavens and the earth. Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters. And God said, "Let there be light," and there was light.' },
  { book: 'Psalms', chapter: 23, text: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name’s sake.' },
  { book: 'Revelation', chapter: 21, text: 'Then I saw a new heaven and a new earth, for the first heaven and the first earth had passed away, and there was no longer any sea. I saw the Holy City, the new Jerusalem, coming down out of heaven from God.' }
];

async function runTests() {
  for (const t of tests) {
    const start = Date.now();
    console.log(`\n--- Starting generation for ${t.book} ${t.chapter} ---`);
    try {
       const quiz = await generateQuiz(t.book, t.chapter, 'chapter', 3, t.text);
       console.log(`Generated in ${Date.now() - start}ms`);
       quiz.forEach((q, i) => {
         console.log(`\nQ${i+1}: ${q.question}`);
         q.options.forEach((opt, j) => console.log(`  [${j}] ${opt}`));
         console.log(`Correct Index: ${q.correctAnswerIndex} (Text: ${q.options[q.correctAnswerIndex]})`);
       });
    } catch (e: any) {
       console.error(`Failed in ${Date.now() - start}ms`, e.message);
    }
  }
}
runTests();
