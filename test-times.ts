import { generateQuiz } from './src/services/aiService';

async function runTests() {
  for (let i = 1; i <= 3; i++) {
    const start = Date.now();
    console.log(`Starting generation ${i}...`);
    try {
       const quiz = await generateQuiz('genesis', i, 'chapter', 3, 'In the beginning God created the heavens and the earth.');
       console.log(`Test ${i}: Generated in ${Date.now() - start}ms`);
    } catch (e) {
       console.error(`Test ${i}: Failed in ${Date.now() - start}ms`, e);
    }
  }
}
runTests();
