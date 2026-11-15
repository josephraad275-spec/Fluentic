import React, { useState, useEffect } from 'react';
import { getNextDiagnosticQuestion, DiagnosticQuestion } from '../services/diagnosticService';

interface DiagnosticQuizProps {
  targetLanguage: string;
  onComplete: (finalLevel: string) => void;
}

export const DiagnosticQuiz: React.FC<DiagnosticQuizProps> = ({ targetLanguage, onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1');
  const [question, setQuestion] = useState<DiagnosticQuestion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const totalQuestions = 5; // Length of the diagnostic assessment

  // Load initial question
  useEffect(() => {
    loadNextQuestion('A1', []);
  }, []);

  const loadNextQuestion = async (level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', currentHistory: any[]) => {
    setLoading(true);
    setSelectedIndex(null);
    setFeedback(null);
    try {
      const nextQ = await getNextDiagnosticQuestion(targetLanguage, level, currentHistory);
      setQuestion(nextQ);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (selectedIndex !== null || !question) return; // Prevent multiple clicks
    setSelectedIndex(index);

    const isCorrect = index === question.correctOptionIndex;
    const newHistory = [...history, { questionId: question.questionId, correct: isCorrect }];
    setHistory(newHistory);

    // Simple adaptive level progression
    const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(currentLevel);
    let nextLevel = currentLevel;

    if (isCorrect && currentIndex < levels.length - 1) {
      nextLevel = levels[currentIndex + 1];
    } else if (!isCorrect && currentIndex > 0) {
      nextLevel = levels[currentIndex - 1];
    }

    setFeedback(isCorrect ? 'Correct! Excellent grasp.' : 'Incorrect. Adapting level...');
    setCurrentLevel(nextLevel);

    // Delay before next question or completion
    setTimeout(() => {
      if (questionCount >= totalQuestions) {
        onComplete(nextLevel);
      } else {
        setQuestionCount(prev => prev + 1);
        loadNextQuestion(nextLevel, newHistory);
      }
    }, 1500);
  };

  if (loading && !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-lg font-medium">Generating your adaptive diagnostic test...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100 my-8">
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Level: {currentLevel}
        </span>
        <span className="text-sm text-gray-500 font-medium">
          Question {questionCount} of {totalQuestions}
        </span>
      </div>

      {question && (
        <>
          <h2 className="text-xl font-bold text-gray-900 mb-6">{question.prompt}</h2>

          <div className="space-y-3 mb-6">
            {question.options.map((option, idx) => {
              let btnStyle = "w-full text-left p-4 rounded-xl border transition-all font-medium ";
              if (selectedIndex === null) {
                btnStyle += "border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-gray-800";
              } else if (idx === question.correctOptionIndex) {
                btnStyle += "border-green-500 bg-green-50 text-green-900";
              } else if (idx === selectedIndex) {
                btnStyle += "border-red-500 bg-red-50 text-red-900";
              } else {
                btnStyle += "border-gray-200 opacity-50 text-gray-600";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedIndex !== null}
                  className={btnStyle}
                >
                  <span className="inline-block w-6 font-bold text-gray-400 mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div className={`p-4 rounded-xl text-center font-semibold ${selectedIndex === question.correctOptionIndex ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {feedback}
            </div>
          )}
        </>
      )}
    </div>
  );
};
