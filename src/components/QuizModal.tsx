import React, { useState, useEffect } from 'react';
import { X, Trophy, Loader2 } from 'lucide-react';
import { generateQuiz, QuizQuestion } from '../services/aiService';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookName: string;
  chapterNumber: number;
  quizType: 'chapter' | 'book';
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  bookName,
  chapterNumber,
  quizType
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const numQuestions = quizType === 'chapter' ? 3 : 10;
      const fetchedQuestions = await generateQuiz(bookName, chapterNumber, quizType, numQuestions);
      setQuestions(fetchedQuestions);
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
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
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-[#B4793D] animate-spin" />
              <p className="text-[#78716C] text-sm font-medium animate-pulse">
                Generating your {quizType} quiz...
              </p>
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
                  {currentQuestion.options.map((option, idx) => {
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
