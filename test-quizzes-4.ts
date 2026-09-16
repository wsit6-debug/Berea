import { getAccumulatedBookQuiz, saveChapterQuizToHistory } from './src/services/aiService';

// We will use node's global to mock localStorage since we're not in the browser
const mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  key: (i: number) => Object.keys(mockStorage)[i],
  get length() { return Object.keys(mockStorage).length; }
};

const fakeQ1 = { question: "Q1", options: ["A", "B", "C", "D"], correctAnswerIndex: 0, explanation: "E1", reference: "R1" };
const fakeQ2 = { question: "Q2", options: ["E", "F", "G", "H"], correctAnswerIndex: 1, explanation: "E2", reference: "R2" };
const fakeQ3 = { question: "Q3", options: ["I", "J", "K", "L"], correctAnswerIndex: 2, explanation: "E3", reference: "R3" };

async function runTests() {
  console.log("--- Testing Quiz History Caching & Deduplication ---");
  
  // 1. Save chapter quizzes to local storage
  saveChapterQuizToHistory('TestBook', 1, [fakeQ1, fakeQ2]);
  // 2. Save duplicate question to test deduplication
  saveChapterQuizToHistory('TestBook', 2, [fakeQ2, fakeQ3]);

  console.log("Storage keys:", Object.keys(mockStorage));

  try {
    // 3. Request an accumulated book quiz. It should grab history, deduplicate fakeQ2, and then generate padding questions via LLM since total is 3 and default numQuestions is 10.
    // Actually, wait, let's ask for 3 questions so it doesn't need to pad, to test pure retrieval first.
    console.log("\nRequesting accumulated book quiz (max 3 questions)...");
    const quiz1 = await getAccumulatedBookQuiz('TestBook', 3);
    console.log(`Returned ${quiz1.length} questions.`);
    quiz1.forEach(q => console.log(`- ${q.question}`));

    console.log("\nRequesting accumulated book quiz (max 5 questions) to test LLM padding...");
    const quiz2 = await getAccumulatedBookQuiz('TestBook', 5);
    console.log(`Returned ${quiz2.length} questions.`);
    quiz2.forEach(q => console.log(`- ${q.question}`));

  } catch (e: any) {
    console.error("Test failed:", e.message);
  }
}

runTests();
