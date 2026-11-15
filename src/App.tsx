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
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl text-center">
          <h1 className="text-3xl font-extrabold mb-2">Assessment Complete!</h1>
          <p className="text-slate-400 mb-6">Your assigned CEFR level is:</p>
          <div className="text-5xl font-black text-indigo-400 bg-indigo-950/50 border border-indigo-500/30 py-6 rounded-2xl mb-6 tracking-wide">
            {completedLevel}
          </div>
          <button
            onClick={() => { setCompletedLevel(null); setStarted(false); setQuestionCount(1); setCurrentLevel('A1'); }}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-indigo-600/30"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl text-center">
          <h1 className="text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Fluentic AI
          </h1>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Choose your target language and initialize your adaptive AI diagnostic assessment.
          </p>
          
          <div className="mb-6 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-lg shadow-indigo-600/30"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4 flex flex-col items-center justify-center">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Fluentic Diagnostic Assessment</h1>
        <p className="text-slate-400 text-sm mt-1">Target Language: <span className="text-indigo-400 font-semibold">{targetLanguage}</span></p>
      </div>

      <div className="max-w-xl w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700/60">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1.5 rounded-lg">
            Level: {currentLevel}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            Question {questionCount} of {totalQuestions}
          </span>
        </div>

        {loading && !question ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-sm font-medium text-slate-400">Generating AI question...</p>
          </div>
        ) : question ? (
          <div>
            <h2 className="text-lg font-semibold text-white mb-6 leading-relaxed">{question.prompt}</h2>

            <div className="space-y-3 mb-6">
              {question.options.map((option: string, idx: number) => {
                let btnStyle = "w-full text-left p-4 rounded-xl border transition-all font-medium text-sm ";
                if (selectedIndex === null) {
                  btnStyle += "border-slate-700 bg-slate-900/50 hover:border-indigo-500 hover:bg-slate-900 text-slate-200";
                } else if (idx === question.correctOptionIndex) {
                  btnStyle += "border-emerald-500 bg-emerald-950/50 text-emerald-200";
                } else if (idx === selectedIndex) {
                  btnStyle += "border-rose-500 bg-rose-950/50 text-rose-200";
                } else {
                  btnStyle += "border-slate-800 bg-slate-900/20 text-slate-500 opacity-50";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={selectedIndex !== null}
                    className={btnStyle}
                  >
                    <span className="inline-block w-6 font-bold text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <div className={`p-4 rounded-xl text-center text-sm font-semibold ${selectedIndex === question.correctOptionIndex ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300' : 'bg-amber-950/80 border border-amber-500/30 text-amber-300'}`}>
                {feedback}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
