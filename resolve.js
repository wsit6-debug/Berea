const fs = require('fs');

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/<<<<<<< HEAD\nimport \{ LoginScreen \} from '\.\/components\/LoginScreen';\n=======\n>>>>>>> [a-f0-9]+.*?\n/g, "import { LoginScreen } from './components/LoginScreen';\n");

app = app.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [a-f0-9]+.*?\n/g, (match, head, theirs) => {
  if (head.includes('chapterText=')) return head;
  if (head.includes('onCreateStudyGuide')) {
    return head + theirs;
  }
  return match;
});
fs.writeFileSync('src/App.tsx', app);

// BibleReader.tsx
let bible = fs.readFileSync('src/components/BibleReader.tsx', 'utf8');
bible = bible.replace(/<<<<<<< HEAD\n(import \{ Bookmark.*?Layers \} from 'lucide-react';)\n=======\n(import \{ Bookmark.*?Trophy \} from 'lucide-react';)\n>>>>>>> [a-f0-9]+.*?\n/, "import { Bookmark, Copy, Sparkles, ChevronLeft, ChevronRight, Pause, Check, ZoomIn, ZoomOut, Volume2, AlignLeft, List, FastForward, Rewind, X, BookOpenCheck, Layers, Trophy } from 'lucide-react';\n");

bible = bible.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [a-f0-9]+.*?\n/g, (match, head, theirs) => {
  if (head.includes('onCreateStudyGuide?:')) return head + theirs;
  if (head.includes('onCreateStudyGuide')) return head + ',\n' + theirs;
  return match;
});
fs.writeFileSync('src/components/BibleReader.tsx', bible);

// QuizModal.tsx
let quiz = fs.readFileSync('src/components/QuizModal.tsx', 'utf8');
quiz = quiz.replace(/<<<<<<< HEAD\n(.*?getAccumulatedBookQuiz.*?)\n=======\n.*?\n>>>>>>> [a-f0-9]+.*?\n/, "$1\n");
quiz = quiz.replace(/<<<<<<< HEAD\n(  chapterText\?: string;)\n=======\n>>>>>>> [a-f0-9]+.*?\n/, "$1\n");
quiz = quiz.replace(/<<<<<<< HEAD\n(  quizType,\n  chapterText)\n=======\n.*?\n>>>>>>> [a-f0-9]+.*?\n/, "$1\n");
quiz = quiz.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> [a-f0-9]+.*?\n/g, (match, head, theirs) => {
  if (head.includes('getAccumulatedBookQuiz')) return head;
  if (head.includes('currentQuestion.options || []')) return head;
  return match;
});
fs.writeFileSync('src/components/QuizModal.tsx', quiz);

