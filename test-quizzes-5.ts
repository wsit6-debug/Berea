import { generateQuiz } from './src/services/aiService';

const tests = [
  { book: 'Exodus', chapter: 1, text: 'These are the names of the sons of Israel who went to Egypt with Jacob, each with his family: Reuben, Simeon, Levi and Judah; Issachar, Zebulun and Benjamin; Dan and Naphtali; Gad and Asher. The descendants of Jacob numbered seventy in all; Joseph was already in Egypt. Now Joseph and all his brothers and all that generation died, but the Israelites were exceedingly fruitful; they multiplied greatly, increased in numbers and became so numerous that the land was filled with them. Then a new king, to whom Joseph meant nothing, came to power in Egypt. "Look," he said to his people, "the Israelites have become far too numerous for us. Come, we must deal shrewdly with them or they will become even more numerous and, if war breaks out, will join our enemies, fight against us and leave the country." So they put slave masters over them to oppress them with forced labor, and they built Pithom and Rameses as store cities for Pharaoh.' },
  { book: 'Genesis', chapter: 1, text: 'In the beginning God created the heavens and the earth. Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters. And God said, "Let there be light," and there was light.' }
];

async function runTests() {
  for (const t of tests) {
    console.log(`\n--- Generating Quiz for ${t.book} ${t.chapter} ---`);
    try {
       const quiz = await generateQuiz(t.book, t.chapter, 'chapter', 3, t.text);
       quiz.forEach((q, i) => {
         console.log(`\nQ${i+1}: ${q.question}`);
         q.options.forEach((opt, j) => console.log(`  [${j}] ${opt}${j === q.correctAnswerIndex ? '  <-- CORRECT' : ''}`));
       });
    } catch (e: any) {
       console.error(`Failed:`, e.message);
    }
  }
}
runTests();
