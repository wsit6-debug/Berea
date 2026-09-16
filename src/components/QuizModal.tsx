import React, { useState, useEffect } from 'react';
import { X, Trophy, Loader2 } from 'lucide-react';
import { generateQuiz, QuizQuestion, saveChapterQuizToHistory, getAccumulatedBookQuiz } from '../services/aiService';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookName: string;
  chapterNumber: number;
  quizType: 'chapter' | 'book';
  chapterText?: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  bookName,
  chapterNumber,
  quizType,
  chapterText
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setProgress(0);
      // It takes about 45 seconds on average, so 45000ms / 100 = 450ms per 1%
      interval = setInterval(() => {
        setProgress(p => (p < 95 ? p + 1 : p));
      }, 450);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isOpen) {
      loadQuiz();
    } else {
      // Reset state on close
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setError(null);
    }
  }, [isOpen, bookName, chapterNumber, quizType]);

  const loadQuiz = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (quizType === 'book') {
        const historyQuiz = await getAccumulatedBookQuiz(bookName, 10);
        if (historyQuiz.length === 0) {
          setError('No chapter quizzes found for this book. Please read and complete chapter quizzes to build up your final book quiz!');
        } else {
          setQuestions(historyQuiz);
        }
      } else {
        const historyKey = `berea_quiz_pregen_${bookName}_${chapterNumber}`;
        const cachedStr = localStorage.getItem(historyKey);
        if (cachedStr) {
          try {
            const parsed = JSON.parse(cachedStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setQuestions(parsed);
              setIsLoading(false);
              // Clear pregen so next time we get a fresh quiz
              localStorage.removeItem(historyKey);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse cached quiz', e);
          }
        }
        
        const numQuestions = 3;
        const fetchedQuestions = await generateQuiz(bookName, chapterNumber, quizType, numQuestions, chapterText);
        setQuestions(fetchedQuestions);
        // Save to history so the book quiz can use it later
        saveChapterQuizToHistory(bookName, chapterNumber, fetchedQuestions);
      }
    } catch (err: any) {
      setError(`Failed to generate quiz: ${err.message || String(err)}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const score = Object.entries(selectedAnswers).reduce((acc, [qIdx, ansIdx]) => {
    return acc + (questions[parseInt(qIdx)].correctAnswerIndex === ansIdx ? 1 : 0);
  }, 0);

  const handleSelectAnswer = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#EBE5DC] flex flex-col relative"
        style={{ maxHeight: '90vh' }}
      >
        <div className="p-4 border-b border-[#EBE5DC] bg-[#FAF7F2] flex items-center justify-between">
          <h2 className="font-heading font-bold text-[#26221F] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#B4793D]" />
            {quizType === 'chapter' ? `Chapter ${chapterNumber} Quiz` : `${bookName} Book Quiz`}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white text-[#78716C] hover:text-[#26221F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative w-12 h-12">
                <div className="absolute w-full h-full border-4 border-[#EBE5DC] rounded-full"></div>
                <div className="absolute w-full h-full border-4 border-[#B4793D] rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center w-full max-w-[200px]">
                <p className="text-[#78716C] text-sm font-medium animate-pulse mb-3">
                  Generating your {quizType} quiz...
                </p>
                <div className="w-full bg-[#EBE5DC] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#B4793D] h-1.5 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#A8A29E] mt-2 font-medium">{progress}% (Est. 45s)</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={loadQuiz}
                className="px-4 py-2 bg-[#FAF5ED] text-[#B4793D] rounded-full font-semibold hover:bg-[#F5EFE6] transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          ) : questions.length > 0 ? (
            isSubmitted ? (
              <div className="text-center py-8 space-y-6 animate-fadeIn">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#FAF5ED] border-4 border-[#B4793D] text-[#B4793D]">
                  <span className="text-3xl font-bold">{score}/{questions.length}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#26221F]">Quiz Complete!</h3>
                  <p className="text-[#78716C] mt-2">
                    {score === questions.length ? "Perfect score! Outstanding work." : 
                     score >= questions.length / 2 ? "Great job! Keep reading." : 
                     "Good effort! Review the chapter for a better score."}
                  </p>
                </div>
                
                <div className="space-y-4 mt-8 text-left border-t border-[#EBE5DC] pt-6">
                  <h4 className="font-semibold text-[#26221F]">Review Answers:</h4>
                  {questions.map((q, qIdx) => {
                    const selected = selectedAnswers[qIdx];
                    const isCorrect = selected === q.correctAnswerIndex;
                    return (
                      <div key={qIdx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="font-medium text-sm text-[#26221F] mb-2">{q.question}</p>
                        <div className="text-xs space-y-1">
                          <p className={isCorrect ? 'text-green-700' : 'text-red-700 line-through'}>
                            Your answer: {selected !== undefined ? q.options[selected] : 'None'}
                          </p>
                          {!isCorrect && (
                            <p className="text-green-700 font-medium">Correct answer: {q.options[q.correctAnswerIndex]}</p>
                          )}
                          <p className="text-[#78716C] italic mt-2 text-[11px]">{q.explanation}</p>
                          {q.reference && (
                            <p className="text-[#B4793D] font-medium mt-1 text-xs">
                              Scripture: {q.reference}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-6 text-sm font-medium text-[#78716C]">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="flex gap-1">
                    {questions.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full ${idx === currentQuestionIndex ? 'bg-[#B4793D]' : idx < currentQuestionIndex ? 'bg-[#D4A373]' : 'bg-[#EBE5DC]'}`}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#26221F] mb-6 leading-relaxed">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                  {(currentQuestion.options || []).map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(idx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          isSelected 
                            ? 'bg-[#FAF5ED] border-[#B4793D] shadow-sm' 
                            : 'bg-white border-[#EBE5DC] hover:border-[#D4A373] hover:bg-[#FAF9F5]'
                        } flex items-center justify-between group`}
                      >
                        <span className={`text-sm ${isSelected ? 'text-[#78471F] font-medium' : 'text-[#26221F]'}`}>
                          {option}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-[#B4793D] bg-[#B4793D]' : 'border-[#A8A29E] group-hover:border-[#D4A373]'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          ) : null}
        </div>

        {!isLoading && !error && !isSubmitted && questions.length > 0 && (
          <div className="p-4 border-t border-[#EBE5DC] bg-[#FAF7F2] flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-sm font-medium text-[#78716C] hover:text-[#26221F] disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              className="px-6 py-2 bg-[#B4793D] text-white text-sm font-semibold rounded-full hover:bg-[#9A632E] disabled:opacity-50 disabled:hover:bg-[#B4793D] transition-colors shadow-sm"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
