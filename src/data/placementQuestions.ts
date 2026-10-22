// ======================================================================
// FLUENTECH 10-QUESTION ACCELERATED ADAPTIVE PLACEMENT QUESTION BANK
// Q1-Q3: Very Easy (A1-A2 Foundations, basic greetings, survival words)
// Q4-Q6: Intermediate (A3-B2 Sentence structure, conjunctions, verb tenses)
// Q7-Q10: Very Hard (B3-C3 Idioms, complex syntax, conditionals, professional nuance)
// ======================================================================

import { CefrLevel } from '../types';

export interface PlacementQuestion {
  id: string;
  tier: 'Very Easy' | 'Intermediate' | 'Very Hard';
  targetCefr: CefrLevel;
  prompt: string;
  foreignPhrase?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  pronunciationTip?: string;
}

export const MULTILINGUAL_10_QUESTION_SETS: Record<string, PlacementQuestion[]> = {
  // Spanish (es)
  es: [
    // Q1 - Easy
    {
      id: 'es-1',
      tier: 'Very Easy',
      targetCefr: 'A1',
      prompt: 'Which word is the standard polite greeting for "Good morning"?',
      foreignPhrase: '¡Buenos días!',
      options: ['¡Buenos días!', '¡Buenas noches!', '¡Adiós!', '¡Por favor!'],
      correctIndex: 0,
      explanation: '"Buenos días" is the standard morning greeting.',
      pronunciationTip: 'BWEH-nos DEE-as',
    },
    // Q2 - Easy
    {
      id: 'es-2',
      tier: 'Very Easy',
      targetCefr: 'A1',
      prompt: 'Select the correct translation for "Thank you very much":',
      foreignPhrase: 'Muchas gracias',
      options: ['De nada', 'Muchas gracias', 'Hasta luego', 'Lo siento'],
      correctIndex: 1,
      explanation: '"Muchas gracias" expresses genuine gratitude.',
      pronunciationTip: 'MOO-chas GRAH-syas',
    },
    // Q3 - Easy
    {
      id: 'es-3',
      tier: 'Very Easy',
      targetCefr: 'A2',
      prompt: 'Complete the sentence: "Yo ___ en Madrid con mi familia."',
      foreignPhrase: 'Yo vivo en Madrid...',
      options: ['vivo', 'vive', 'viven', 'vivir'],
      correctIndex: 0,
      explanation: 'First person singular "yo" conjugates regular -ir verbs to "-o" (vivo).',
    },
    // Q4 - Intermediate
    {
      id: 'es-4',
      tier: 'Intermediate',
      targetCefr: 'A3',
      prompt: 'Choose the correct preterite form: "Ayer yo ___ una carta importante."',
      foreignPhrase: 'Ayer yo escribí...',
      options: ['escribo', 'escribí', 'escribía', 'escribiré'],
      correctIndex: 1,
      explanation: 'Completed past actions with "ayer" take the preterite tense (escribí).',
    },
    // Q5 - Intermediate
    {
      id: 'es-5',
      tier: 'Intermediate',
      targetCefr: 'B1',
      prompt: 'Which conjunction means "furthermore / in addition"?',
      foreignPhrase: 'Además de estudiar...',
      options: ['Sin embargo', 'Además', 'Pero', 'A pesar de'],
      correctIndex: 1,
      explanation: '"Además" introduces supplementary supporting arguments.',
    },
    // Q6 - Intermediate
    {
      id: 'es-6',
      tier: 'Intermediate',
      targetCefr: 'B2',
      prompt: 'Select the correct subjunctive: "Es necesario que tú ___ temprano mañana."',
      foreignPhrase: 'Es necesario que tú llegues...',
      options: ['llegas', 'llegues', 'llegaste', 'llegarás'],
      correctIndex: 1,
      explanation: 'Impersonal expressions of necessity trigger the present subjunctive.',
    },
    // Q7 - Hard
    {
      id: 'es-7',
      tier: 'Very Hard',
      targetCefr: 'B3',
      prompt: 'What does the colloquial idiom "Estar hasta las narices" mean?',
      foreignPhrase: 'Estoy hasta las narices de esperar.',
      options: ['To have a severe cold', 'To be fed up / completely exhausted of something', 'To be extremely excited', 'To be swimming in deep water'],
      correctIndex: 1,
      explanation: '"Estar hasta las narices" is a common Spanish idiom meaning to be fed up.',
    },
    // Q8 - Hard
    {
      id: 'es-8',
      tier: 'Very Hard',
      targetCefr: 'C1',
      prompt: 'Select the concessive clause: "___ insistas, no cambiaré de postura."',
      foreignPhrase: 'Por más que insistas...',
      options: ['Por más que', 'Porque', 'Puesto que', 'Ya que'],
      correctIndex: 0,
      explanation: '"Por más que" + subjunctive creates an elevated concessive structure.',
    },
    // Q9 - Hard
    {
      id: 'es-9',
      tier: 'Very Hard',
      targetCefr: 'C2',
      prompt: 'Which phrase denotes an irreproachable contractual clause?',
      foreignPhrase: 'La cláusula resulta jurídicamente inatacable.',
      options: [
        'La cláusula resulta jurídicamente inatacable.',
        'La cláusula es muy mala y fea.',
        'No queremos firmar nada.',
        'La cláusula no sirve para nada.'
      ],
      correctIndex: 0,
      explanation: 'Exhibits high formal juridical and academic register.',
    },
    // Q10 - Hard
    {
      id: 'es-10',
      tier: 'Very Hard',
      targetCefr: 'C3',
      prompt: 'Identify the exact term for "simultaneous contextual interpretation":',
      foreignPhrase: 'Interpretación simultánea con mediación intercultural',
      options: [
        'Interpretación simultánea con mediación intercultural',
        'Hablar rápido sin pensar',
        'Repetir palabras como loro',
        'Traducir con diccionario en la mano'
      ],
      correctIndex: 0,
      explanation: 'Professional native interpretation benchmark.',
    },
  ],

  // French (fr)
  fr: [
    {
      id: 'fr-1',
      tier: 'Very Easy',
      targetCefr: 'A1',
      prompt: 'Which phrase means "Nice to meet you" in French?',
      foreignPhrase: 'Enchanté',
      options: ['Enchanté', 'Au revoir', 'S\'il vous plaît', 'Merci'],
      correctIndex: 0,
      explanation: '"Enchanté(e)" expresses delight upon meeting someone.',
    },
    {
      id: 'fr-2',
      tier: 'Very Easy',
      targetCefr: 'A1',
      prompt: 'How do you say "Thank you very much"?',
      foreignPhrase: 'Merci beaucoup',
      options: ['De rien', 'Merci beaucoup', 'À bientôt', 'Pardon'],
      correctIndex: 1,
      explanation: '"Merci beaucoup" is universal courtesy.',
    },
    {
      id: 'fr-3',
      tier: 'Very Easy',
      targetCefr: 'A2',
      prompt: 'Choose the correct form: "Nous ___ à Paris depuis deux ans."',
      foreignPhrase: 'Nous habitons...',
      options: ['habite', 'habitons', 'habitez', 'habitent'],
      correctIndex: 1,
      explanation: 'Subject "nous" takes "-ons" ending.',
    },
    {
      id: 'fr-4',
      tier: 'Intermediate',
      targetCefr: 'A3',
      prompt: 'Select the correct Passé Composé: "Hier, elle ___ au cinéma."',
      foreignPhrase: 'Hier, elle est allée...',
      options: ['est allée', 'a allé', 'va aller', 'allait'],
      correctIndex: 0,
      explanation: '"Aller" requires the auxiliary verb "être" with feminine agreement (-ée).',
    },
    {
      id: 'fr-5',
      tier: 'Intermediate',
      targetCefr: 'B1',
      prompt: 'Which relative pronoun fits: "Le projet ___ je m\'occupe est capital"?',
      foreignPhrase: 'Le projet dont je m\'occupe...',
      options: ['qui', 'que', 'dont', 'où'],
      correctIndex: 2,
      explanation: 'Verbs governing "de" (s\'occuper de) require the relative pronoun "dont".',
    },
    {
      id: 'fr-6',
      tier: 'Intermediate',
      targetCefr: 'B2',
      prompt: 'Choose the subjunctive: "Il faut que nous ___ les consignes."',
      foreignPhrase: 'Il faut que nous suivions...',
      options: ['suivons', 'suivions', 'suivront', 'avons suivi'],
      correctIndex: 1,
      explanation: '"Il faut que" triggers the subjunctive mood.',
    },
    {
      id: 'fr-7',
      tier: 'Very Hard',
      targetCefr: 'B3',
      prompt: 'What does the French idiom "Poser un lapin" mean?',
      foreignPhrase: 'Il m\'a posé un lapin.',
      options: ['To give a pet gift', 'To stand someone up / fail to attend a date', 'To run very quickly', 'To cook dinner'],
      correctIndex: 1,
      explanation: '"Poser un lapin" figuratively means standing someone up.',
    },
    {
      id: 'fr-8',
      tier: 'Very Hard',
      targetCefr: 'C1',
      prompt: 'Select the elevated conditional connector: "___ que vous le souhaitiez..."',
      foreignPhrase: 'Pour autant que...',
      options: ['Pour autant que', 'Parce que', 'Car', 'Puisque'],
      correctIndex: 0,
      explanation: '"Pour autant que" introduces nuanced hypothetical concession.',
    },
    {
      id: 'fr-9',
      tier: 'Very Hard',
      targetCefr: 'C2',
      prompt: 'Which sentence demonstrates flawless literary past subjunctive?',
      foreignPhrase: 'Encore eût-il fallu que nous le sussions.',
      options: [
        'Encore eût-il fallu que nous le sussions.',
        'Il fallait savoir ça hier.',
        'On savait rien du tout.',
        'Si on avait su on venait.'
      ],
      correctIndex: 0,
      explanation: 'Pluperfect subjunctive in high classical French literature.',
    },
    {
      id: 'fr-10',
      tier: 'Very Hard',
      targetCefr: 'C3',
      prompt: 'Identify the exact diplomatic term for "irrevocable treaty ratification":',
      foreignPhrase: 'La ratification sans réserve du traité bilatéral',
      options: [
        'La ratification sans réserve du traité bilatéral',
        'La signature d\'un bout de papier',
        'Le petit mot amical des ambassadeurs',
        'L\'accord oral entre deux personnes'
      ],
      correctIndex: 0,
      explanation: 'High diplomatic and juridical mastery.',
    },
  ],
};

// Generic 10-question fallback for any world language
export function getGeneric10QuestionSet(langName: string): PlacementQuestion[] {
  return [
    {
      id: 'gen-1',
      tier: 'Very Easy',
      targetCefr: 'A1',
      prompt: `What is the most common survival greeting when meeting someone in ${langName}?`,
      options: ['The standard daytime greeting ("Hello")', 'A harsh departure command ("Leave")', 'A statement of confusion', 'A silent nod'],
      correctIndex: 0,
      explanation: 'Foundational greetings are the core of Level A1 communication.',
    },
    {
      id: 'gen-2',
      tier: 'Very Easy',
      targetCefr: 'A1',
      prompt: `How do you express gratitude politely in ${langName}?`,
      options: ['With the universal polite word for "Thank you"', 'By requesting more food', 'By remaining silent', 'By asking for directions'],
      correctIndex: 0,
      explanation: 'Polite gratitude opens conversation in every global culture.',
    },
    {
      id: 'gen-3',
      tier: 'Very Easy',
      targetCefr: 'A2',
      prompt: `When ordering in a cafe, what is the polite phrase in ${langName}?`,
      options: ['"I would like..., please"', '"Give me now"', '"I hate this cafe"', '"Go away"'],
      correctIndex: 0,
      explanation: 'Conditional or polite verbs soften ordering and routine exchanges.',
    },
    {
      id: 'gen-4',
      tier: 'Intermediate',
      targetCefr: 'A3',
      prompt: `How are completed past events distinguished in ${langName}?`,
      options: [
        'Through specific past tense verb markers and time adverbs (e.g. yesterday)',
        'By shouting loudly',
        'Past events use the future tense only',
        'There are no tenses in human speech'
      ],
      correctIndex: 0,
      explanation: 'Level A3 connects past narrations with temporal conjunctions.',
    },
    {
      id: 'gen-5',
      tier: 'Intermediate',
      targetCefr: 'B1',
      prompt: `Which structure is used in ${langName} to state your personal perspective?`,
      options: ['"From my perspective / I believe that..."', '"Everyone must obey me"', '"I have no thoughts"', '"Word salad"'],
      correctIndex: 0,
      explanation: 'Level B1 focuses on expressing opinions and modal nuances.',
    },
    {
      id: 'gen-6',
      tier: 'Intermediate',
      targetCefr: 'B2',
      prompt: `What is the role of discourse connectors like "Nevertheless / However" in ${langName}?`,
      options: [
        'To contrast ideas smoothly in academic and conversational discourse',
        'To end all conversations immediately',
        'To count numbers from one to ten',
        'To introduce simple grocery items'
      ],
      correctIndex: 0,
      explanation: 'Level B2 demands sophisticated rhetorical transitions.',
    },
    {
      id: 'gen-7',
      tier: 'Very Hard',
      targetCefr: 'B3',
      prompt: `How do native speakers in ${langName} express cultural idioms?`,
      options: [
        'Through figurative, non-literal phrases shared across community lore',
        'By translating English word-for-word literally',
        'By speaking only in numbers',
        'Idioms are never used by native speakers'
      ],
      correctIndex: 0,
      explanation: 'Level B3 bridges conversational agility and colloquial idiomatic fluency.',
    },
    {
      id: 'gen-8',
      tier: 'Very Hard',
      targetCefr: 'C1',
      prompt: `What characterizes advanced subjunctive or hypothetical clauses in ${langName}?`,
      options: [
        'They convey subtle concession, doubt, or delicate diplomatic conditionality',
        'They are basic nouns for fruit',
        'They only appear in math equations',
        'They cannot be spoken aloud'
      ],
      correctIndex: 0,
      explanation: 'Level C1 handles academic, technical, and political discussions.',
    },
    {
      id: 'gen-9',
      tier: 'Very Hard',
      targetCefr: 'C2',
      prompt: `What defines mastery of rhetoric and stylistic register in ${langName}?`,
      options: [
        'Effortless appreciation of subtle irony, archaic cadence, and native speed',
        'Knowing only five basic greetings',
        'Speaking with a robotic pause after each syllable',
        'Using translation software on every sentence'
      ],
      correctIndex: 0,
      explanation: 'Level C2 mastery commands full stylistic range and humor.',
    },
    {
      id: 'gen-10',
      tier: 'Very Hard',
      targetCefr: 'C3',
      prompt: `What does professional native interpretation require in ${langName}?`,
      options: [
        'Real-time semantic synthesis, regional dialect navigation, and specialized domain jargon',
        'Looking up basic words in an introductory phrasebook',
        'Speaking only in simple present tense',
        'Memorizing a single nursery rhyme'
      ],
      correctIndex: 0,
      explanation: 'Level C3 represents professional bilingual conference mastery.',
    },
  ];
}
