import { callAICore } from './aiCore';
import { z } from 'zod';

// 1. Define strict Zod schemas for diagnostic integrity
export const DiagnosticQuestionSchema = z.object({
  questionId: z.string(),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  prompt: z.string(),
  options: z.array(z.string()).length(4),
  correctOptionIndex: z.number().min(0).max(3),
  grammarFocus: z.string(),
});

export const DiagnosticEvaluationSchema = z.object({
  isCorrect: z.boolean(),
  nextLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  explanation: z.string(),
});

export type DiagnosticQuestion = z.infer<typeof DiagnosticQuestionSchema>;
export type DiagnosticEvaluation = z.infer<typeof DiagnosticEvaluationSchema>;

/**
 * Generates an adaptive diagnostic question based on the user's current estimated CEFR level.
 */
export async function getNextDiagnosticQuestion(
  targetLanguage: string,
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
  questionHistory: { questionId: string; correct: boolean }[] = []
): Promise<DiagnosticQuestion> {
  const systemInstruction = `
    You are the Supreme Pedagogical Evaluator for Fluentic. 
    Your task is to generate a precise, high-rigor multiple-choice diagnostic question in ${targetLanguage} at CEFR level ${currentLevel}.
    Ensure absolute linguistic accuracy and native-level grammar standards.
  `.trim();

  const prompt = JSON.stringify({
    task: "generate_diagnostic_question",
    targetLanguage,
    currentLevel,
    historySummary: questionHistory,
  });

  const rawResult = await callAICore({
    system: systemInstruction,
    messages: [{ role: 'user', content: prompt }],
    schema: DiagnosticQuestionSchema,
    temperature: 0.15, // Enforce strict low temperature for academic precision
  });

  return rawResult as DiagnosticQuestion;
}

/**
 * Evaluates the user's selected answer and determines the next adaptive step.
 */
export async function evaluateDiagnosticAnswer(
  targetLanguage: string,
  question: DiagnosticQuestion,
  selectedOptionIndex: number,
  currentLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
): Promise<DiagnosticEvaluation> {
  const isCorrect = selectedOptionIndex === question.correctOptionIndex;
  
  // Simple deterministic CEFR stepping logic combined with AI feedback
  let nextLevel = currentLevel;
  const levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2')[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(currentLevel);

  if (isCorrect && currentIndex < levels.length - 1) {
    nextLevel = levels[currentIndex + 1];
  } else if (!isCorrect && currentIndex > 0) {
    nextLevel = levels[currentIndex - 1];
  }

  return {
    isCorrect,
    nextLevel,
    explanation: question.explanation || (isCorrect ? "Correct! Excellent grasp of the structure." : "Incorrect. Review the target grammar pattern."),
  };
}
