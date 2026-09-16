import { generateQuiz } from './src/services/aiService';

const tests = [
  { book: 'Exodus', chapter: 20, text: 'And God spoke all these words: "I am the Lord your God, who brought you out of Egypt, out of the land of slavery. You shall have no other gods before me. You shall not make for yourself an image in the form of anything in heaven above or on the earth beneath or in the waters below. You shall not bow down to them or worship them."' },
  { book: 'John', chapter: 3, text: 'Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council. He came to Jesus at night and said, "Rabbi, we know that you are a teacher who has come from God. For no one could perform the signs you are doing if God were not with him." Jesus replied, "Very truly I tell you, no one can see the kingdom of God unless they are born again."' },
  { book: 'Romans', chapter: 8, text: 'Therefore, there is now no condemnation for those who are in Christ Jesus, because through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death.' },
  { book: 'Proverbs', chapter: 3, text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { book: 'Matthew', chapter: 5, text: 'Now when Jesus saw the crowds, he went up on a mountainside and sat down. His disciples came to him, and he began to teach them. He said: "Blessed are the poor in spirit, for theirs is the kingdom of heaven."' }
];

async function runTests() {
  for (const t of tests) {
    const start = Date.now();
    console.log(`\n--- Generating for ${t.book} ${t.chapter} ---`);
    try {
       const quiz = await generateQuiz(t.book, t.chapter, 'chapter', 3, t.text);
       console.log(`Time: ${Date.now() - start}ms`);
       quiz.forEach((q, i) => {
         console.log(`\nQ${i+1}: ${q.question}`);
         q.options.forEach((opt, j) => console.log(`  [${j}] ${opt}${j === q.correctAnswerIndex ? '  <-- CORRECT' : ''}`));
       });
    } catch (e: any) {
       console.error(`Failed in ${Date.now() - start}ms`, e.message);
    }
  }
}
runTests();
