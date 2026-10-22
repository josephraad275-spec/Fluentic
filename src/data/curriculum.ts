import { LearningNode, CefrLevel } from '../types';

export const CEFR_TIER_DETAILS: Record<CefrLevel, {
  name: string;
  subhead: string;
  targetDurationMinutes: number;
  grammarUnlocked: boolean;
  color: string;
  description: string;
}> = {
  A1: {
    name: 'Level A1 • Absolute Beginner',
    subhead: 'Alphabet, Phonetics, Core Basic Vocabulary & Survival Words',
    targetDurationMinutes: 4,
    grammarUnlocked: false,
    color: 'emerald',
    description: 'Master foundational phonetics, letters, basic greetings, numbers, and crucial survival words.',
  },
  A2: {
    name: 'Level A2 • Elementary',
    subhead: 'Basic Daily Vocabulary, Present Tense & Simple Sentences',
    targetDurationMinutes: 5,
    grammarUnlocked: false,
    color: 'teal',
    description: 'Construct active daily sentences, order food, navigate transit, and describe routines.',
  },
  A3: {
    name: 'Level A3 • Upper Elementary',
    subhead: 'Past & Future Tenses, Conjunctions & Daily Contexts [Grammar Unlocked]',
    targetDurationMinutes: 6,
    grammarUnlocked: true,
    color: 'blue',
    description: 'Unlock the AI Grammar Module! Connect past and future ideas with compound conjunctions.',
  },
  B1: {
    name: 'Level B1 • Intermediate',
    subhead: 'Conversational Basics, Compound Structures & Modal Verbs',
    targetDurationMinutes: 8,
    grammarUnlocked: true,
    color: 'indigo',
    description: 'Express personal opinions, use modal verbs naturally, and conduct everyday conversations.',
  },
  B2: {
    name: 'Level B2 • Upper Intermediate',
    subhead: 'Nuanced Discussions, Idioms & Active Listening',
    targetDurationMinutes: 10,
    grammarUnlocked: true,
    color: 'purple',
    description: 'Engage in lively cultural debates, decode slang and colloquial idioms, and parse native podcasts.',
  },
  B3: {
    name: 'Level B3 • Advanced Intermediate',
    subhead: 'Professional Discourse, Conditionals & Fluid Transitions',
    targetDurationMinutes: 11,
    grammarUnlocked: true,
    color: 'violet',
    description: 'Express complex hypothetical situations, negotiate respectfully, and master professional discourse.',
  },
  C1: {
    name: 'Level C1 • Advanced',
    subhead: 'Academic & Professional Communication & Abstract Topics',
    targetDurationMinutes: 13,
    grammarUnlocked: true,
    color: 'amber',
    description: 'Analyze complex analytical texts, present persuasive arguments, and synthesize abstract ideas.',
  },
  C2: {
    name: 'Level C2 • High School Mastery',
    subhead: 'Stylistic Nuances, Advanced Rhetoric & Native-Speed Listening',
    targetDurationMinutes: 15,
    grammarUnlocked: true,
    color: 'orange',
    description: 'Grasp subtle humor, ironies, formal written registries, and ultra-fast native speech without pauses.',
  },
  C3: {
    name: 'Level C3 • Professional Native Mastery',
    subhead: 'Industry Jargon, Literary Mastery & Real-Time Translation',
    targetDurationMinutes: 16,
    grammarUnlocked: true,
    color: 'rose',
    description: 'True native fluency: legal, medical, tech terminology, archaic literature, and simultaneous interpretation.',
  },
};

export const SAMPLE_CURRICULUM_NODES: Record<CefrLevel, LearningNode[]> = {
  A1: [
    {
      id: 'a1-1',
      title: 'Phonetic Alphabet & Core Greetings',
      nativeTitle: 'Alfabeto y Primeros Saludos',
      category: 'Foundations',
      cefr: 'A1',
      description: 'Master authentic native greetings, respectful honorifics, and core open vowel phonetics.',
      xpReward: 50,
      gemReward: 10,
      targetDurationMinutes: 4,
      iconName: 'Sparkles',
      coordinates: { x: 140, y: 180 },
      exercises: [
        {
          id: 'ex-a1-1',
          type: 'multiple-choice',
          prompt: 'Select the most natural morning greeting for a colleague or friend:',
          targetPhrase: '¡Buenos días! ¿Cómo estás?',
          translation: 'Good morning! How are you?',
          phoneticIpa: '/ˈbwenos ˈdi.as ˈkomo esˈtas/',
          options: ['¡Buenos días! ¿Cómo estás?', '¡Hasta nunca!', 'No tengo tiempo', 'Adiós para siempre'],
          correctAnswer: '¡Buenos días! ¿Cómo estás?',
          culturalNote: 'In Spanish-speaking cultures, greeting with warmth and asking how someone is doing before asking a question is essential etiquette.',
          grammarTip: 'Notice the inverted exclamation mark (¡) used at the beginning of exclamations.'
        },
        {
          id: 'ex-a1-2',
          type: 'speech-pronounce',
          prompt: 'Speak aloud with clear intonation into the microphone:',
          targetPhrase: 'Mucho gusto en conocerte.',
          translation: 'Pleased to meet you.',
          phoneticIpa: '/ˈmutʃo ˈɣusto en konoˈseɾte/',
          correctAnswer: 'Mucho gusto en conocerte.',
          culturalNote: 'Used during introductions accompanied by a warm handshake or double cheek kiss depending on the region.'
        },
        {
          id: 'ex-a1-3',
          type: 'sentence-scramble',
          prompt: 'Arrange the tokens to build: "I am very well, thank you."',
          targetPhrase: 'Yo estoy muy bien, gracias.',
          translation: 'I am very well, thank you.',
          scrambledWords: ['bien,', 'Yo', 'gracias.', 'muy', 'estoy'],
          correctAnswer: ['Yo', 'estoy', 'muy', 'bien,', 'gracias.'],
          grammarTip: '"Estar" is used here because emotional and physical states are temporary.'
        }
      ]
    },
    {
      id: 'a1-2',
      title: 'Cafe & Survival Essentials',
      nativeTitle: 'En la Cafetería',
      category: 'Conversation',
      cefr: 'A1',
      description: 'Order espresso, artisan pastries, and ask for the bill with authentic courtesy.',
      xpReward: 60,
      gemReward: 12,
      targetDurationMinutes: 4,
      iconName: 'Coffee',
      coordinates: { x: 260, y: 250 },
      exercises: [
        {
          id: 'ex-a1-4',
          type: 'fill-blank',
          prompt: 'Complete the sentence with the polite ordering verb:',
          targetPhrase: 'Quisiera un café solo, por favor.',
          translation: 'I would like a single espresso, please.',
          options: ['Quisiera', 'Odio', 'Tira', 'Duerme'],
          correctAnswer: 'Quisiera',
          grammarTip: '"Quisiera" is the polite form of "querer", softer than "quiero".'
        },
        {
          id: 'ex-a1-5',
          type: 'speech-pronounce',
          prompt: 'Pronounce clearly: "The check, please."',
          targetPhrase: 'La cuenta, por favor.',
          translation: 'The bill / check, please.',
          phoneticIpa: '/la ˈkwenta poɾ faˈβoɾ/',
          correctAnswer: 'La cuenta, por favor.'
        }
      ]
    }
  ],

  A2: [
    {
      id: 'a2-1',
      title: 'Urban Wayfinding & Transit',
      nativeTitle: 'Rutas y Navegación',
      category: 'Conversation',
      cefr: 'A2',
      description: 'Navigate metro lines, bus transfers, and ask for directions with precision.',
      xpReward: 75,
      gemReward: 15,
      targetDurationMinutes: 5,
      iconName: 'Compass',
      coordinates: { x: 380, y: 160 },
      exercises: [
        {
          id: 'ex-a2-1',
          type: 'multiple-choice',
          prompt: 'How do you politely ask: "Could you tell me where the nearest station is?"',
          targetPhrase: '¿Me podría decir dónde está la estación más cercana?',
          translation: 'Could you tell me where the nearest station is?',
          options: [
            '¿Me podría decir dónde está la estación más cercana?',
            '¿Dónde está la comida?',
            'No quiero ir a la estación.',
            'La estación está cerrada para siempre.'
          ],
          correctAnswer: '¿Me podría decir dónde está la estación más cercana?'
        },
        {
          id: 'ex-a2-2',
          type: 'speech-pronounce',
          prompt: 'Speak with clear pronunciation: "Turn right at the corner."',
          targetPhrase: 'Gira a la derecha en la esquina.',
          translation: 'Turn to the right at the corner.',
          phoneticIpa: '/ˈxiɾa a la deˈɾetʃa en la esˈkina/',
          correctAnswer: 'Gira a la derecha en la esquina.'
        }
      ]
    }
  ],

  A3: [
    {
      id: 'a3-1',
      title: 'Past Chronologies & Storytelling',
      nativeTitle: 'Relatos y Tiempos Pasados',
      category: 'Grammar',
      cefr: 'A3',
      description: 'Master the contrast between completed past actions (Preterite) and past routines/background descriptions (Imperfect).',
      xpReward: 90,
      gemReward: 18,
      targetDurationMinutes: 6,
      iconName: 'BookOpen',
      coordinates: { x: 500, y: 220 },
      exercises: [
        {
          id: 'ex-a3-1',
          type: 'fill-blank',
          prompt: 'Select the correct preterite verb for a completed action yesterday:',
          targetPhrase: 'Ayer hablé con mi profesor sobre el examen.',
          translation: 'Yesterday I spoke with my professor about the exam.',
          options: ['hablé', 'hablaba', 'hablo', 'hablaré'],
          correctAnswer: 'hablé',
          grammarTip: 'Use Preterite for single completed actions with specific time markers like "ayer".'
        },
        {
          id: 'ex-a3-2',
          type: 'multiple-choice',
          prompt: 'Which conjunction means "furthermore / in addition"?',
          targetPhrase: 'Además, tenemos que preparar el informe.',
          translation: 'Furthermore, we have to prepare the report.',
          options: ['Además', 'Pero', 'Sin embargo', 'Nunca'],
          correctAnswer: 'Además'
        }
      ]
    }
  ],

  B1: [
    {
      id: 'b1-1',
      title: 'Expressing Conviction & Modal Verbs',
      nativeTitle: 'Opinión y Convicción',
      category: 'Conversation',
      cefr: 'B1',
      description: 'Defend your perspectives, recommend choices, and express polite obligations.',
      xpReward: 110,
      gemReward: 22,
      targetDurationMinutes: 8,
      iconName: 'MessageSquare',
      coordinates: { x: 620, y: 150 },
      exercises: [
        {
          id: 'ex-b1-1',
          type: 'multiple-choice',
          prompt: 'Select the phrase that best expresses personal standpoint:',
          targetPhrase: 'Desde mi punto de vista, esto es fundamental.',
          translation: 'From my point of view, this is fundamental.',
          options: [
            'Desde mi punto de vista, esto es fundamental.',
            'No me importa nada de esto.',
            'Cállate por favor.',
            'Es mentira absoluta.'
          ],
          correctAnswer: 'Desde mi punto de vista, esto es fundamental.'
        },
        {
          id: 'ex-b1-2',
          type: 'speech-pronounce',
          prompt: 'Speak with confidence: "I believe we should consider other alternatives."',
          targetPhrase: 'Creo que deberíamos considerar otras alternativas.',
          translation: 'I believe we should consider other alternatives.',
          phoneticIpa: '/ˈkɾeo ke deβeˈɾiamos konsideˈɾaɾ ˈotɾas alteɾnaˈtiβas/',
          correctAnswer: 'Creo que deberíamos considerar otras alternativas.'
        }
      ]
    }
  ],

  B2: [
    {
      id: 'b2-1',
      title: 'Rhetorical Connectors & Complex Syntax',
      nativeTitle: 'Dialéctica y Conectores Discursivos',
      category: 'Advanced Mastery',
      cefr: 'B2',
      description: 'Construct cohesive arguments using sophisticated discourse markers like "no obstante" and "por consiguiente".',
      xpReward: 130,
      gemReward: 26,
      targetDurationMinutes: 10,
      iconName: 'Scale',
      coordinates: { x: 740, y: 220 },
      exercises: [
        {
          id: 'ex-b2-1',
          type: 'fill-blank',
          prompt: 'Select the optimal rhetorical connector expressing contrast:',
          targetPhrase: 'El proyecto es innovador; no obstante, requiere mayor financiamiento.',
          translation: 'The project is innovative; nevertheless, it requires greater funding.',
          options: ['no obstante', 'porque', 'así que', 'entonces'],
          correctAnswer: 'no obstante',
          grammarTip: '"No obstante" elevates written and oral register above the standard "pero".'
        }
      ]
    }
  ],

  B3: [
    {
      id: 'b3-1',
      title: 'Professional Negotiations & Conditional Hypotheses',
      nativeTitle: 'Negociación y Tiempos Condicionales',
      category: 'Professional',
      cefr: 'B3',
      description: 'Navigate delicate contractual terms, conditional concessions, and nuanced professional etiquette.',
      xpReward: 150,
      gemReward: 30,
      targetDurationMinutes: 11,
      iconName: 'Briefcase',
      coordinates: { x: 860, y: 140 },
      exercises: [
        {
          id: 'ex-b3-1',
          type: 'multiple-choice',
          prompt: 'Which phrase introduces a hypothetical concession professionally?',
          targetPhrase: 'Siempre y cuando se respeten los plazos acordados, procederemos.',
          translation: 'As long as the agreed deadlines are respected, we will proceed.',
          options: [
            'Siempre y cuando se respeten los plazos acordados, procederemos.',
            'No queremos trabajar más.',
            'Pagaremos lo que queramos sin contrato.',
            'Ojalá no tengamos que reunirnos.'
          ],
          correctAnswer: 'Siempre y cuando se respeten los plazos acordados, procederemos.'
        }
      ]
    }
  ],

  C1: [
    {
      id: 'c1-1',
      title: 'Academic Abstract Synthesis & High Diplomacy',
      nativeTitle: 'Subjuntivo Avanzado y Diplomacia',
      category: 'Advanced Mastery',
      cefr: 'C1',
      description: 'Navigate subtle concessive clauses (por más que), hypothetical nuances, and executive diplomacy.',
      xpReward: 180,
      gemReward: 35,
      targetDurationMinutes: 13,
      iconName: 'Shield',
      coordinates: { x: 980, y: 210 },
      exercises: [
        {
          id: 'ex-c1-1',
          type: 'multiple-choice',
          prompt: 'Select the subjunctive form conveying subtle concession:',
          targetPhrase: 'Por mucho que insistas, no cambiaré de postura.',
          translation: 'No matter how much you insist, I will not change my stance.',
          options: [
            'Por mucho que insistas, no cambiaré de postura.',
            'Por mucho que insistes, no cambiaré de postura.',
            'Por mucho que insistías, no cambiaré de postura.',
            'Por mucho que insististe, no cambiaré de postura.'
          ],
          correctAnswer: 'Por mucho que insistas, no cambiaré de postura.'
        }
      ]
    }
  ],

  C2: [
    {
      id: 'c2-1',
      title: 'High-School & Literary Rhetorical Mastery',
      nativeTitle: 'Reticencia y Maestría Estilística',
      category: 'Advanced Mastery',
      cefr: 'C2',
      description: 'Master stylistic ironies, historical registers, high-speed listening comprehension, and formal writing styles.',
      xpReward: 220,
      gemReward: 40,
      targetDurationMinutes: 15,
      iconName: 'Award',
      coordinates: { x: 1090, y: 130 },
      exercises: [
        {
          id: 'ex-c2-1',
          type: 'speech-pronounce',
          prompt: 'Deliver this philosophical maxim with effortless cadence and natural prosody:',
          targetPhrase: 'Quien tiene un porqué para vivir puede soportar casi cualquier cómo.',
          translation: 'He who has a why to live can bear almost any how.',
          phoneticIpa: '/kjen ˈtjene wm poɾˈke ˈpaɾa βiˈβiɾ ˈpweðe sopoɾˈtaɾ ˈkasi kwalˈkjeɾ ˈkomo/',
          correctAnswer: 'Quien tiene un porqué para vivir puede soportar casi cualquier cómo.'
        }
      ]
    }
  ],

  C3: [
    {
      id: 'c3-1',
      title: 'Professional Native Jargon & Real-Time Interpretation',
      nativeTitle: 'Maestría Nativa Profesional y Dialectal',
      category: 'Advanced Mastery',
      cefr: 'C3',
      description: 'Master industry-specific jargon, literary arcana, regional dialect nuances, and real-time spontaneous translation.',
      xpReward: 300,
      gemReward: 50,
      targetDurationMinutes: 16,
      iconName: 'Globe',
      coordinates: { x: 1200, y: 200 },
      exercises: [
        {
          id: 'ex-c3-1',
          type: 'multiple-choice',
          prompt: 'Identify the exact juridical term for "non-binding preliminary agreement":',
          targetPhrase: 'El memorando de entendimiento carece de carácter vinculante.',
          translation: 'The memorandum of understanding lacks binding character.',
          options: [
            'El memorando de entendimiento carece de carácter vinculante.',
            'La carta no tiene nada de valor.',
            'Un papel firmado sin importancia alguna.',
            'La promesa de palabra entre amigos.'
          ],
          correctAnswer: 'El memorando de entendimiento carece de carácter vinculante.'
        }
      ]
    }
  ]
};
