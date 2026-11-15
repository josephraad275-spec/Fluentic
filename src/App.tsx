import React, { useState } from 'react';
import { DiagnosticQuiz } from './components/DiagnosticQuiz';

export default function App() {
  const [started, setStarted] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [completedLevel, setCompletedLevel] = useState<string | null>(null);

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
            onClick={() => { setCompletedLevel(null); setStarted(false); }}
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Fluentic Diagnostic Assessment</h1>
        <p className="text-gray-500 text-sm">Target Language: {targetLanguage}</p>
      </div>
      <DiagnosticQuiz
        targetLanguage={targetLanguage}
        onComplete={(level) => setCompletedLevel(level)}
      />
    </div>
  );
}
