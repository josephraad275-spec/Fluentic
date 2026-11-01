export const FLUENTIC_CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type FluenticCefrLevel = (typeof FLUENTIC_CEFR_LEVELS)[number];
export type LearningIntent = "travel" | "business" | "academic" | "conversational" | "culture";

export const CEFR_PEDAGOGY: Record<FluenticCefrLevel, {
  focus: string;
  requiredEvidence: string;
  prohibitedContent: string;
}> = {
  A1: {
    focus: "Writing-system orientation where relevant, sound-letter correspondences, phonemic contrasts, high-frequency words, core sentence patterns, and essential exchanges.",
    requiredEvidence: "Recognize and construct short, concrete statements; identify common words and basic grammatical forms.",
    prohibitedContent: "Do not assess advanced academic argumentation or literary criticism.",
  },
  A2: {
    focus: "High-frequency structures, everyday transactions, routines, short descriptions, past and future reference, and practical listening/reading.",
    requiredEvidence: "Understand short routine texts and construct connected sentences for familiar situations.",
    prohibitedContent: "Do not use C-level abstract rhetorical tasks as the main evidence.",
  },
  B1: {
    focus: "Situational independence, connected discourse, narration, explaining reasons, opinions, plans, common subordinate clauses, and conversational repair.",
    requiredEvidence: "Explain experiences and plans, justify opinions, and sustain a familiar-topic exchange.",
    prohibitedContent: "Do not use isolated greetings or elementary phrase recognition as B1 evidence.",
  },
  B2: {
    focus: "Nuanced discussion, argument structure, idiomatic meaning in context, register selection, inference, and spontaneous interaction.",
    requiredEvidence: "Defend a position, compare alternatives, infer implied meaning, and communicate with fluency across familiar and abstract topics.",
    prohibitedContent: "Do not use basic greetings, isolated vocabulary matching, or elementary ordering dialogues as B2 evidence.",
  },
  C1: {
    focus: "Advanced academic and professional discourse, rhetorical organization, precise register, implicit meaning, complex syntax, critical reading, and synthesis of multiple positions.",
    requiredEvidence: "Synthesize complex sources, qualify claims, evaluate evidence, and produce coherent formal argumentation.",
    prohibitedContent: "Absolutely exclude elementary phrases, basic greetings, self-introductions, simple café/travel dialogues, and beginner vocabulary questions.",
  },
  C2: {
    focus: "Near-native interpretive precision, stylistic and literary analysis, rhetorical synthesis, subtle irony, ambiguity, register shifts, and sophisticated formal debate.",
    requiredEvidence: "Analyze literary/rhetorical choices, reconcile competing arguments, detect pragmatic implication and irony, and produce nuanced synthesis.",
    prohibitedContent: "Absolutely exclude elementary phrases, basic greetings, self-introductions, simple café/travel dialogues, and beginner vocabulary questions.",
  },
};

export const LEARNING_INTENT_PATHWAYS: Record<LearningIntent, {
  sequence: string[];
  scenario: string;
  transferTask: string;
}> = {
  travel: {
    sequence: ["retrieve essential travel language", "reconstruct a route or service exchange", "solve an unexpected travel problem", "transfer the language to a new destination"],
    scenario: "transport, accommodation, directions, food, safety, and unexpected travel changes",
    transferTask: "Complete a new travel scenario using the same structures without seeing the model answer.",
  },
  business: {
    sequence: ["retrieve professional terminology", "construct a concise workplace message", "negotiate a realistic constraint", "transfer the register to a new business context"],
    scenario: "meetings, presentations, negotiation, email, project updates, and professional disagreement",
    transferTask: "Produce a new professional response with an appropriate register and a defensible rationale.",
  },
  academic: {
    sequence: ["retrieve key concepts", "reconstruct an explanation from memory", "evaluate evidence and counterarguments", "synthesize ideas in a new academic prompt"],
    scenario: "seminars, lectures, research summaries, critical reading, formal argument, and academic writing",
    transferTask: "Synthesize two competing claims and support a conclusion without copying a model.",
  },
  conversational: {
    sequence: ["retrieve useful conversational chunks", "rebuild a complete sentence", "respond to a follow-up or misunderstanding", "transfer the pattern to an unfamiliar topic"],
    scenario: "opinions, personal experiences, follow-up questions, clarification, humor, and natural turn-taking",
    transferTask: "Sustain a fresh conversation turn using the target structure and respond to an unannounced follow-up.",
  },
  culture: {
    sequence: ["retrieve cultural and pragmatic cues", "interpret a contextual exchange", "compare perspectives and register", "transfer the insight to a new cultural situation"],
    scenario: "social conventions, regional variation, media, customs, implicit meaning, and intercultural communication",
    transferTask: "Explain how the same message changes across two contexts and choose an appropriate formulation.",
  },
};

export function normalizeLearningIntent(value: unknown): LearningIntent {
  return value === "travel" || value === "business" || value === "academic" || value === "culture"
    ? value
    : "conversational";
}

export function nextAdaptiveLevel(current: FluenticCefrLevel, correct: boolean): FluenticCefrLevel {
  const index = FLUENTIC_CEFR_LEVELS.indexOf(current);
  const next = correct ? Math.min(index + 1, FLUENTIC_CEFR_LEVELS.length - 1) : Math.max(index - 1, 0);
  return FLUENTIC_CEFR_LEVELS[next];
}

export function estimateLevelFromEvidence(
  answers: Array<{ level?: unknown; correct?: unknown }>
): { level: FluenticCefrLevel; confidence: number; evidence: Record<FluenticCefrLevel, { seen: number; correct: number }> } {
  const evidence = Object.fromEntries(
    FLUENTIC_CEFR_LEVELS.map((level) => [level, { seen: 0, correct: 0 }])
  ) as Record<FluenticCefrLevel, { seen: number; correct: number }>;

  for (const answer of answers) {
    const level = String(answer.level || "").toUpperCase() as FluenticCefrLevel;
    if (!FLUENTIC_CEFR_LEVELS.includes(level)) continue;
    evidence[level].seen += 1;
    if (answer.correct === true) evidence[level].correct += 1;
  }

  let estimated: FluenticCefrLevel = "A1";
  let evaluated = 0;
  let passed = 0;
  for (const level of FLUENTIC_CEFR_LEVELS) {
    const item = evidence[level];
    if (!item.seen) continue;
    evaluated += item.seen;
    const accuracy = item.correct / item.seen;
    if (accuracy >= 0.6) {
      estimated = level;
      passed += item.correct;
    } else {
      break;
    }
  }

  const confidence = evaluated === 0 ? 0 : Math.round(Math.min(95, 45 + (passed / evaluated) * 45 + Math.min(evaluated, 10)));
  return { level: estimated, confidence, evidence };
}

export function buildPlacementAuthoringInstruction(targetLanguage: string, nativeLanguage: string, count: number): string {
  return `You are Fluentic's rigorous CEFR diagnostic assessment author. Create exactly ${count} original, independently answerable questions for ${targetLanguage}; all instructions, explanations, and option glosses must be in ${nativeLanguage}. Use ONLY these six levels: A1, A2, B1, B2, C1, C2. Distribute questions across all six levels, with at least one question at every level. Each question must assess the skill actually named by its level, not merely label a beginner item as advanced. A1: script/sound-letter mechanics where relevant, high-frequency vocabulary, simple forms. A2: routine exchanges, everyday structures, short descriptions. B1: situational independence, narration, reasons, opinions, conversational nuance. B2: argument, inference, register, idiomatic meaning, extended interaction. C1: advanced academic/professional discourse, complex syntax, critical reading, evidence evaluation, rhetorical organization and synthesis. C2: formal debate, complex literary/rhetorical analysis, subtle irony, pragmatic ambiguity, stylistic precision and synthesis of competing positions. ABSOLUTE C1/C2 EXCLUSION: no greetings, introductions, basic phrases, café ordering, travel basics, beginner vocabulary, or elementary present-tense drills. Use target-language authentic orthography only in target-language fields. Never add Latin transliteration, phonetic respelling, English approximations, or pronunciation guides to target-language content. Do not put answer clues in the instruction. Every multiple-choice item must have exactly four plausible options and exactly one defensible correct answer. Return JSON only with shape {"language":"...","questions":[{"id":1,"level":"A1|A2|B1|B2|C1|C2","skill":"...","instruction":"...","prompt":"...","options":[{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],"correctKey":"A","explanation":"..."}]}.`;
}

export function buildPersonalLessonInstruction(
  targetLanguage: string,
  nativeLanguage: string,
  level: FluenticCefrLevel,
  intent: LearningIntent
): string {
  const pedagogy = CEFR_PEDAGOGY[level];
  const pathway = LEARNING_INTENT_PATHWAYS[intent];
  return `You are Fluentic's adaptive language-learning architect. Design a structured, active-recall lesson for a ${level} learner of ${targetLanguage}. Explain in ${nativeLanguage}. Learner intent: ${intent}. Scenario domain: ${pathway.scenario}. Level focus: ${pedagogy.focus} Evidence target: ${pedagogy.requiredEvidence} Level exclusions: ${pedagogy.prohibitedContent} Learning sequence: ${pathway.sequence.join(" -> ")}. The lesson must contain retrieval before explanation, sentence construction from memory, corrective feedback, a changed-context transfer task, and scheduled spaced re-exposure to errors. Do not include XP, points, gems, badges, streaks, or superficial rewards. Keep target-language fields in authentic target orthography only; no Latin transliteration, phonetic guide, or English approximation in targetLanguageText fields. Return JSON only: {"title":"...","objective":"...","level":"${level}","intent":"${intent}","steps":[{"id":"step-1","type":"retrieve|construct|feedback|transfer|review","instruction":"...","targetLanguageText":"...","meaning":"...","expectedAnswer":"...","feedbackRule":"..."}],"retrievalPrompts":["..."],"errorRecycling":[{"concept":"...","trigger":"...","revisitAfterMinutes":10},{"concept":"...","trigger":"...","revisitAfterMinutes":1440},{"concept":"...","trigger":"...","revisitAfterMinutes":10080}],"masteryCriteria":["..."],"transferTask":"${pathway.transferTask}"}.`;
}
