import { useState, useEffect } from 'react';

export default function App() {
  const [started, setStarted] = useState<boolean>(false);
  const [targetLanguage, setTargetLanguage] = useState<string>('Spanish');
  const [completedLevel, setCompletedLevel] = useState<string | null>(null);

  // Quiz state
  const [currentLevel, setCurrentLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('A1');
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const totalQuestions = 5;

  const loadNextQuestion = async (level: string, currentHistory: any[]) => {
    setLoading(true);
    setSelectedIndex(null);
    setFeedback(null);
    try {
      const systemInstruction = `
        You are the Supreme Pedagogical Evaluator for Fluentic. 
        Output ONLY valid JSON matching this schema:
        {
          "questionId": "string",
          "cefrLevel": "${level}",
          "prompt": "string (the question in ${targetLanguage})",
          "options": ["string", "string", "string", "string"],
          "correctOptionIndex": 0,
          "grammarFocus": "string",
          "explanation": "string"
        }
        Generate a precise multiple-choice diagnostic question in ${targetLanguage} at CEFR level ${level}.
      `.trim();

      const userPrompt = JSON.stringify({
        task: "generate_diagnostic_question",
        targetLanguage,
        currentLevel: level,
        historySummary: currentHistory,
      });

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemInstruction,
          messages: [{ role: 'user', content: userPrompt }],
          temperature: 0.15,
        }),
      });

      if (!response.ok) throw new Error('AI proxy failed');

      const data = await response.json();
      let cleanText = data.text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsedJson = JSON.parse(cleanText);
      setQuestion(parsedJson);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (started && !completedLevel) {
      loadNextQuestion('A1', []);
    }
  }, [started]);

  const handleSelectOption = (index: number) => {
    if (selectedIndex !== null || !question) return;
    setSelectedIndex(index);

    const isCorrect = index === question.correctOptionIndex;
    const newHistory = [...history, { questionId: question.questionId, correct: isCorrect }];
    setHistory(newHistory);

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

    setTimeout(() => {
      if (questionCount >= totalQuestions) {
        setCompletedLevel(nextLevel);
      } else {
        setQuestionCount(prev => prev + 1);
        loadNextQuestion(nextLevel, newHistory);
      }
    }, 1500);
  };

  if (completedLevel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
          <p className="text-gray-600 mb-6">Your assigned CEFR level is:</p>
          <div className="text-4xl font-extrabold text-indigo-600 bg-indigo-50 py-4 rounded-xl mb-6">
            {completedLevel}
          </div>
          <button
            onClick={() => { setCompletedLevel(null); setStarted(false); setQuestionCount(1); setCurrentLevel('A1'); }}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Fluentic AI</h1>
          <p className="text-gray-600 mb-6">Select your target language and begin your adaptive AI diagnostic test.</p>
          
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-6 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Italian">Italian</option>
            <option value="Japanese">Japanese</option>
          </select>

          <button
            onClick={() => setStarted(true)}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            Start Diagnostic Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center justify-center">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Fluentic Diagnostic Assessment</h1>
        <p className="text-gray-500 text-sm">Target Language: {targetLanguage}</p>
      </div>

      <div className="max-w-xl w-full p-6 bg-white rounded-2xl shadow-xl border border-gray-100 my-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Level: {currentLevel}
          </span>
          <span className="text-sm text-gray-500 font-medium">
            Question {questionCount} of {totalQuestions}
          </span>
        </div>

        {loading && !question ? (
          <div className="flex flex-col items-center justify-center min-h-[250px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
            <p className="text-sm font-medium text-gray-600">Generating next question...</p>
          </div>
        ) : question ? (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-6">{question.prompt}</h2>

            <div className="space-y-3 mb-6">
              {question.options.map((option: string, idx: number) => {
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
        ) : null}
      </div>
    </div>
  );
}
