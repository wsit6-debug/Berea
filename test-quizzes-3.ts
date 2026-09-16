import { generateQuiz } from './src/services/aiService';

const tests = [
  { book: 'Luke', chapter: 2, type: 'chapter', text: 'In those days Caesar Augustus issued a decree that a census should be taken of the entire Roman world. (This was the first census that took place while Quirinius was governor of Syria.) And everyone went to their own town to register. So Joseph also went up from the town of Nazareth in Galilee to Judea, to Bethlehem the town of David, because he belonged to the house and line of David. He went there to register with Mary, who was pledged to be married to him and was expecting a child.' },
  { book: 'Acts', chapter: 2, type: 'chapter', text: 'When the day of Pentecost came, they were all together in one place. Suddenly a sound like the blowing of a violent wind came from heaven and filled the whole house where they were sitting. They saw what seemed to be tongues of fire that separated and came to rest on each of them. All of them were filled with the Holy Spirit and began to speak in other tongues as the Spirit enabled them.' },
  { book: 'Genesis', chapter: 1, type: 'book', text: '' },
  { book: 'Romans', chapter: 1, type: 'book', text: '' }
];

async function runTests() {
  for (const t of tests) {
    console.log(`\n--- Generating ${t.type.toUpperCase()} Quiz for ${t.book} ---`);
    try {
       const quiz = await generateQuiz(t.book, t.chapter, t.type as 'chapter' | 'book', 3, t.text);
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
