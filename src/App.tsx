import { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'path' | 'tutor' | 'grammar' | 'diagnostic'>('dashboard');
  const [targetLanguage, setTargetLanguage] = useState<string>('Spanish');
  const [userLevel, setUserLevel] = useState<string>('A2');

  // Diagnostic Quiz State inside the app
  const [diagnosticStarted, setDiagnosticStarted] = useState<boolean>(false);
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadDiagnostic = async () => {
    setLoading(true);
    setSelectedIndex(null);
    setFeedback(null);
    try {
      const systemInstruction = `
        You are the Supreme Pedagogical Evaluator for Fluentic. 
        Output ONLY valid JSON matching this schema:
        {
          "questionId": "string",
          "cefrLevel": "${userLevel}",
          "prompt": "string (diagnostic question in ${targetLanguage})",
          "options": ["string", "string", "string", "string"],
          "correctOptionIndex": 0,
          "grammarFocus": "string",
          "explanation": "string"
        }
      `.trim();

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemInstruction,
          messages: [{ role: 'user', content: `Generate diagnostic question for ${targetLanguage} at level ${userLevel}` }],
          temperature: 0.15,
        }),
      });

      const data = await response.json();
      let cleanText = data.text.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
      setQuestion(JSON.parse(cleanText));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30">
            F
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            Fluentic
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Japanese">Japanese</option>
          </select>
          <span className="bg-indigo-950 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-lg text-xs font-bold">
            {userLevel}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-8">
              <h1 className="text-3xl font-extrabold mb-2">Welcome back, Learner! 👋</h1>
              <p className="text-slate-400 text-sm mb-6">Your adaptive path for {targetLanguage} is ready. Pick up where you left off or take a diagnostic assessment.</p>
              <button
                onClick={() => { setActiveTab('diagnostic'); setDiagnosticStarted(true); loadDiagnostic(); }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm"
              >
                Launch CEFR Diagnostic
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Current Streak</h3>
                <p className="text-3xl font-black text-white">🔥 5 Days</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Modules Mastered</h3>
                <p className="text-3xl font-black text-indigo-400">12 / 40</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Fluency Score</h3>
                <p className="text-3xl font-black text-emerald-400">74%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'path' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Adaptive Learning Path</h2>
            {[
              { title: "Module 1: Essential Foundations", status: "Completed", color: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400" },
              { title: "Module 2: Intermediate Conversation", status: "In Progress", color: "border-indigo-500/40 bg-indigo-950/40 text-indigo-300" },
              { title: "Module 3: Advanced Business Syntax", status: "Locked", color: "border-slate-800 bg-slate-900 text-slate-500" },
            ].map((m, idx) => (
              <div key={idx} className={`p-6 rounded-2xl border ${m.color} flex justify-between items-center`}>
                <div>
                  <h3 className="font-bold text-lg text-white">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">AI-tailored curriculum module for {targetLanguage}</p>
                </div>
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700">{m.status}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tutor' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col h-[500px]">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-slate-800">AI Conversational Tutor</h2>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              <div className="bg-slate-800 p-4 rounded-2xl max-w-[80%] text-sm text-slate-200">
                ¡Hola! I am your AI tutor. Let's practice speaking {targetLanguage}. How was your day?
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Type a message in ${targetLanguage}...`}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold text-sm transition">
                Send
              </button>
            </div>
          </div>
        )}

        {activeTab === 'diagnostic' && (
          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 border border-indigo-500/30 px-3 py-1 rounded-lg">
                Level: {userLevel}
              </span>
              <span className="text-xs text-slate-400 font-medium">Question {questionCount} of 5</span>
            </div>

            {loading && !question ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-3"></div>
                <p className="text-xs text-slate-400">Generating AI question...</p>
              </div>
            ) : question ? (
              <div>
                <h3 className="text-lg font-bold text-white mb-6">{question.prompt}</h3>
                <div className="space-y-3 mb-6">
                  {question.options.map((opt: string, idx: number) => {
                    let btnStyle = "w-full text-left p-4 rounded-xl border text-sm font-medium transition ";
                    if (selectedIndex === null) {
                      btnStyle += "border-slate-800 bg-slate-950 hover:border-indigo-500 text-slate-200";
                    } else if (idx === question.correctOptionIndex) {
                      btnStyle += "border-emerald-500 bg-emerald-950/50 text-emerald-200";
                    } else if (idx === selectedIndex) {
                      btnStyle += "border-rose-500 bg-rose-950/50 text-rose-200";
                    } else {
                      btnStyle += "border-slate-900 opacity-40 text-slate-600";
                    }
                    return (
                      <button
                        key={idx}
                        disabled={selectedIndex !== null}
                        onClick={() => {
                          setSelectedIndex(idx);
                          setTimeout(() => {
                            if (questionCount < 5) {
                              setQuestionCount(c => c + 1);
                              loadDiagnostic();
                            } else {
                              setActiveTab('dashboard');
                            }
                          }, 1500);
                        }}
                        className={btnStyle}
                      >
                        <span className="font-bold text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                      </button>
                    );
                  })}
                </div>
                {feedback && <div className="p-3 rounded-xl text-center text-xs font-semibold bg-indigo-950 text-indigo-300">{feedback}</div>}
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* Persistent Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 py-3 px-6 z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          {[
            { id: 'dashboard', label: 'Home' },
            { id: 'path', label: 'Path' },
            { id: 'tutor', label: 'AI Tutor' },
            { id: 'diagnostic', label: 'Diagnostic' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); if (tab.id === 'diagnostic' && !question) loadDiagnostic(); }}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
