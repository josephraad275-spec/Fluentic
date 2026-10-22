/**
 * Comprehensive Fluentic Localization Engine
 * When user's native language is Dutch (nl) and target language is Lithuanian (lt),
 * the entire app UI, prompts, instructions, explanations, and navigation MUST be in Dutch,
 * and all learning materials (words, sentences, pronunciations) MUST be in Lithuanian.
 */

export interface TranslationDictionary {
  // Brand & General
  appName: string;
  tagline: string;
  close: string;
  cancel: string;
  save: string;
  continue: string;
  back: string;
  confirm: string;
  loading: string;
  locked: string;
  unlocked: string;
  completed: string;
  correct: string;
  incorrect: string;
  check: string;
  next: string;
  finish: string;
  start: string;
  score: string;
  level: string;
  streak: string;
  gems: string;
  xp: string;
  retakeTest: string;
  levelLockedAlert: string;
  takePlacementTestToUnlock: string;

  // Navigation Tabs
  navHome: string;
  navPath: string;
  navSpeechLab: string;
  navDialogue: string;
  navGrammar: string;
  navSpeedTest: string;
  navTranslator: string;
  navVault: string;
  navDisciplines: string;
  navPro: string;
  navFocus?: string;
  navAITutor?: string;

  // Intent-Driven Learning ("The Why")
  whyPromptTitle?: string;
  whyPromptSubtitle?: string;
  intentBusiness?: string;
  intentTravel?: string;
  intentAcademic?: string;
  intentConversational?: string;
  intentCulture?: string;
  changeGoal?: string;
  tailoredFor?: string;

  // Focus Mode Alpha Soundwaves
  focusTitle?: string;
  focusSubtitle?: string;
  startSoundwave?: string;
  stopSoundwave?: string;
  soundwaveActive?: string;
  frequencyControl?: string;
  volumeControl?: string;
  focusPresets?: string;
  presetAlpha?: string;
  presetTheta?: string;
  presetGamma?: string;
  presetPinkNoise?: string;

  // Pricing & Pro
  proMonthlyTitle?: string;
  proMonthlyPrice?: string;
  proAnnualTitle?: string;
  proAnnualPrice?: string;
  mostPopularBadge?: string;
  billedAnnuallyNotice?: string;

  // Header
  selectLanguage: string;
  selectLevel: string;
  selectDialect: string;
  commandSpotlight: string;
  soundscape: string;
  profile: string;
  guestUser: string;
  proActive: string;
  upgradePro: string;

  // Home View
  welcomeBack: string;
  readyToLearn: string;
  startNextLesson: string;
  dailyGoal: string;
  dailyQuests: string;
  questPracticeMinutes: string;
  questPerfectPronunciation: string;
  questReviewCards: string;
  quickPractice: string;
  speakingDrill: string;
  flashcardVault: string;
  grammarGuide: string;
  speedChallenge: string;
  currentStreakDays: string;
  streakProtectedBadge: string;
  protectStreakWithFreeze: string;
  milestonesAchievements: string;
  claimed: string;
  claimReward: string;

  // Duolingo Path View
  unit1Title: string;
  unit1Desc: string;
  unit2Title: string;
  unit2Desc: string;
  unit3Title: string;
  unit3Desc: string;
  unit4Title: string;
  unit4Desc: string;
  unit5Title: string;
  unit5Desc: string;
  startLessonPrompt: string;
  completedBadge: string;
  lockedLessonNotice: string;
  crownLevel: string;

  // Speech Lab View
  speechLabTitle: string;
  speechLabSubtitle: string;
  scenarioCafe: string;
  scenarioCafeDesc: string;
  scenarioFriends: string;
  scenarioFriendsDesc: string;
  scenarioDirections: string;
  scenarioDirectionsDesc: string;
  scenarioDining: string;
  scenarioDiningDesc: string;
  scenarioMarket: string;
  scenarioMarketDesc: string;
  scenarioEmergency: string;
  scenarioEmergencyDesc: string;
  listenToNative: string;
  pressToSpeak: string;
  listening: string;
  pronunciationScore: string;
  excellentPronunciation: string;
  needsPractice: string;
  repeatPhrase: string;
  nextSentence: string;

  // FSRS Vault View
  vaultTitle: string;
  vaultSubtitle: string;
  clickToFlip: string;
  howWellDidYouKnow: string;
  ratingAgain: string;
  ratingHard: string;
  ratingGood: string;
  ratingEasy: string;
  totalCards: string;
  dueToday: string;
  retentionRate: string;

  // Grammar Module View
  grammarTitle: string;
  grammarSubtitle: string;
  ruleCasesTitle: string;
  ruleCasesDesc: string;
  ruleVerbsTitle: string;
  ruleVerbsDesc: string;
  rulePastTenseTitle: string;
  rulePastTenseDesc: string;
  ruleParticiplesTitle: string;
  ruleParticiplesDesc: string;
  ruleParticlesTitle: string;
  ruleParticlesDesc: string;
  exampleSentence: string;
  grammarFormula: string;
  checkYourUnderstanding: string;

  // Speed Test View
  speedTestTitle: string;
  speedTestSubtitle: string;
  untimedNotice: string;
  questionOf: string;
  completedDrillCongratulations: string;
  claimXpAndGems: string;

  // Placement Test & Level Lock
  placementTestTitle: string;
  placementTestSubtitle: string;
  variantLabel: string;
  selectVariant: string;
  questionLabel: string;
  skillEvaluated: string;
  cefrEvaluationNotice: string;
  levelMustBeEarned: string;
  takeTestNow: string;
  unlockedLevelResult: string;
}

export const DUTCH_TRANSLATIONS: TranslationDictionary = {
  // Brand & General
  appName: 'Fluentic',
  tagline: 'Vloeiend in elk woord',
  close: 'Sluiten',
  cancel: 'Annuleren',
  save: 'Opslaan',
  continue: 'Verder gaan',
  back: 'Terug',
  confirm: 'Bevestigen',
  loading: 'Laden...',
  locked: 'Vergrendeld',
  unlocked: 'Ontgrendeld',
  completed: 'Voltooid',
  correct: 'Uitstekend! Helemaal juist',
  incorrect: 'Niet helemaal juist. Probeer het opnieuw',
  check: 'Controleren',
  next: 'Volgende vraag',
  finish: 'Afronden',
  start: 'Starten',
  score: 'Score',
  level: 'Niveau',
  streak: 'Dagen Reeks',
  gems: 'Edelstenen',
  xp: 'Ervaringspunten',
  retakeTest: 'Niveautest Afleggen',
  levelLockedAlert: 'Niveau Vergrendeld! Je kunt niet van niveau wisselen zonder de Niveautest te doen.',
  takePlacementTestToUnlock: 'Doe de Niveautest (10 vragen) om door te stromen naar een hoger niveau.',

  // Navigation Tabs
  navHome: 'Home',
  navPath: 'Path',
  navSpeechLab: 'Speaking',
  navDialogue: 'AI Gesprekken',
  navGrammar: 'Grammatica',
  navSpeedTest: 'Snelheidstest',
  navTranslator: 'AI Vertaler',
  navVault: 'Woordkaarten',
  navDisciplines: 'Reeks & Doelen',
  navPro: 'Pro Studio',

  // Header
  selectLanguage: 'Kies Doeltaal',
  selectLevel: 'ERK-Niveau',
  selectDialect: 'Kies Dialect',
  commandSpotlight: 'Opdrachten (Cmd+K)',
  soundscape: 'Focus Geluid',
  profile: 'Mijn Profiel',
  guestUser: 'Gastgebruiker',
  proActive: 'Pro Actief',
  upgradePro: 'Word Pro',

  // Home View
  welcomeBack: 'Welkom terug',
  readyToLearn: 'Klaar om vandaag verder te leren?',
  startNextLesson: 'Volgende Les Starten',
  dailyGoal: 'Dagelijks Leerdoel',
  dailyQuests: 'Dagelijkse Missies',
  questPracticeMinutes: 'Oefen 15 minuten intensief',
  questPerfectPronunciation: 'Behaal een uitstekende uitspraakscore in het Spraaklab',
  questReviewCards: 'Herhaal 10 woordkaarten in de FSRS-kluis',
  quickPractice: 'Snelle Oefeningen',
  speakingDrill: 'Spraakoefening',
  flashcardVault: 'Geheugenkluis',
  grammarGuide: 'Grammaticagids',
  speedChallenge: 'Snelheidsuitdaging',
  currentStreakDays: 'Dagen Reeks',
  streakProtectedBadge: 'Reeks Beschermd',
  protectStreakWithFreeze: 'Bescherm je reeks met een schild (50 edelstenen)',
  milestonesAchievements: 'Mijlpalen & Prestaties',
  claimed: 'Geclaimd',
  claimReward: 'Beloning Claimen',

  // Duolingo Path View
  unit1Title: 'Eenheid 1: Alfabet, Fonetiek & Eerste Begroetingen',
  unit1Desc: 'Beheers de basisklanken, het alfabet en beleefde begroetingen.',
  unit2Title: 'Eenheid 2: Het Dagelijks Leven & Bestellen in het Café',
  unit2Desc: 'Leer eten, drinken en alledaagse zaken bestellen met de juiste uitspraak.',
  unit3Title: 'Eenheid 3: Overleven, Richtingen & de Stad Verkennen',
  unit3Desc: 'Vraag de weg, begrijp straatborden en navigeer zelfstandig.',
  unit4Title: 'Eenheid 4: Vrienden Maken & Familiegesprekken',
  unit4Desc: 'Vertel over je hobby’s, interesses en familiebanden.',
  unit5Title: 'Eenheid 5: Professionele Woordenschat & Diepgang',
  unit5Desc: 'Verfijn je woordenschat voor studie, werk en literaire nuance.',
  startLessonPrompt: 'Start Les',
  completedBadge: 'Les Voltooid',
  lockedLessonNotice: 'Voltooi de vorige lesbel om deze les vrij te spelen.',
  crownLevel: 'Kroon niveau',

  // Speech Lab View
  speechLabTitle: 'Interactief Spraaklab',
  speechLabSubtitle: 'Luister naar moedertaalsprekers en oefen je uitspraak met directe feedback.',
  scenarioCafe: 'In het Café & Koffie Bestellen',
  scenarioCafeDesc: 'Oefen het bestellen van koffie, gebak en het vragen om de rekening.',
  scenarioFriends: 'Nieuwe Mensen Ontmoeten',
  scenarioFriendsDesc: 'Stel jezelf beleefd voor en praat over je herkomst en bezigheden.',
  scenarioDirections: 'De Weg Vragen in de Stad',
  scenarioDirectionsDesc: 'Vraag waar het treinstation of het museum is en begrijp aanwijzingen.',
  scenarioDining: 'In het Restaurant',
  scenarioDiningDesc: 'Reserveer een tafel, vraag naar ingrediënten en geef complimenten.',
  scenarioMarket: 'Winkelen op de Markt',
  scenarioMarketDesc: 'Vraag naar prijzen, vers fruit en betaal contant of per pin.',
  scenarioEmergency: 'Noodsituatie & Hulp Vragen',
  scenarioEmergencyDesc: 'Leer levensbelangrijke zinnen voor noodgevallen, apotheek of arts.',
  listenToNative: 'Luister naar moedertaalspreker',
  pressToSpeak: 'Klik om in te spreken',
  listening: 'Luisteren naar je stem...',
  pronunciationScore: 'Uitspraakscore',
  excellentPronunciation: 'Uitstekende uitspraak! Heel natuurlijk!',
  needsPractice: 'Goed geprobeerd! Luister nogmaals en herhaal de zin.',
  repeatPhrase: 'Opnieuw Inspraken',
  nextSentence: 'Volgende Zin',

  // FSRS Vault View
  vaultTitle: 'Slimme Woordkaarten (FSRS)',
  vaultSubtitle: 'Gespreide herhaling afgestemd op jouw persoonlijke geheugencurve.',
  clickToFlip: 'Klik op de kaart om de vertaling en uitleg te bekijken',
  howWellDidYouKnow: 'Hoe goed kende je dit Litouwse woord?',
  ratingAgain: 'Opnieuw (Vergeten)',
  ratingHard: 'Moeilijk (Veel moeite)',
  ratingGood: 'Goed (Kende het)',
  ratingEasy: 'Makkelijk (Moeiteloos)',
  totalCards: 'Totaal Aantal Kaarten',
  dueToday: 'Vandaag te Herhalen',
  retentionRate: 'Geschatte Onthoudscore',

  // Grammar Module View
  grammarTitle: 'Litouwse Grammaticagids & Oefeningen',
  grammarSubtitle: 'Heldere uitleg van de 7 naamvallen, werkwoordsvormen en zinsbouw.',
  ruleCasesTitle: 'De 7 Litouwse Naamvallen (Linksmai)',
  ruleCasesDesc: 'Vardininkas (Onderwerp), Kilmininkas (Bezit/Ontkenning), Naudininkas (Meewerkend), Galininkas (Lijdend), Įnagininkas (Middel), Vietininkas (Plaats), Šauksmininkas (Aanspreekvorm).',
  ruleVerbsTitle: 'Werkwoordvervoeging (Tegenwoordige Tijd)',
  ruleVerbsDesc: 'De drie hoofdklassen (-a, -i, -o): aš dirbu, tu dirbi, jis dirba, mes dirbame, jūs dirbate, jie dirba.',
  rulePastTenseTitle: 'De Verleden Tijden (Būtasis kartinis & dažninis)',
  rulePastTenseDesc: 'Onderscheid tussen een eenmalige handeling (buvau) en een herhaalde gewoonte (būdavau).',
  ruleParticiplesTitle: 'De Rijke Deelwoorden van het Litouws',
  ruleParticiplesDesc: 'Veelvuldig gebruik van actieve en passieve deelwoorden, pusdalyvis en padalyvis.',
  ruleParticlesTitle: 'Klemtoon & Toonhoogte Accent',
  ruleParticlesDesc: 'Litouws kent dynamische en muzikale accenten die de betekenis van woorden kunnen veranderen.',
  exampleSentence: 'Voorbeeldzin met uitspraak',
  grammarFormula: 'Vaste Grammaticaformule',
  checkYourUnderstanding: 'Controleer je begrip',

  // Speed Test View
  speedTestTitle: 'Ongedateerde Snelheidstest & Woorddril',
  speedTestSubtitle: 'Oefen je woordenschat en grammatica op je eigen tempo zonder stressvolle tijdslimiet.',
  untimedNotice: 'Geen tikkende klok — neem alle rust om elk woord grondig te begrijpen.',
  questionOf: 'Vraag',
  completedDrillCongratulations: 'Gefeliciteerd! Je hebt alle vragen voltooid!',
  claimXpAndGems: 'Verzamel je Beloning (+60 XP, +25 Edelstenen)',

  // Placement Test & Level Lock
  placementTestTitle: 'Standaard Niveautest (10 Vragen)',
  placementTestSubtitle: 'Bepaal je exacte ERK-niveau (A1 t/m C2). Niveau wisselen kan alleen via deze test!',
  variantLabel: 'Test Variant',
  selectVariant: 'Kies Variant (A, B, C of D)',
  questionLabel: 'Vraag',
  skillEvaluated: 'Geteste Vaardigheid',
  cefrEvaluationNotice: 'Elke vraag toetst een specifieke trede op de Europese ERK-ladder (van A1 tot C2).',
  levelMustBeEarned: 'Niveaus kunnen niet willekeurig gekozen worden; je kwalificeert je via de niveautest.',
  takeTestNow: 'Doe Niveautest Nu',
  unlockedLevelResult: 'Gekwalificeerd Niveau',

  navFocus: 'Focus & Golven',
  navAITutor: 'AI Tutor',

  whyPromptTitle: 'Waarom leer je deze taal?',
  whyPromptSubtitle: 'Het AI-curriculum stemt de woordenschat en spreekmodules direct af op jouw persoonlijke leerdoel.',
  intentBusiness: 'Zakelijk & Professionele Onderhandelingen',
  intentTravel: 'Reizen & Culturele Navigatie',
  intentAcademic: 'Academisch Onderzoek & Formeel Debat',
  intentConversational: 'Spontane Conversatie & Sociale Vloeiendheid',
  intentCulture: 'Literatuur & Historisch Erfgoed',
  changeGoal: 'Wijzig Doel',
  tailoredFor: 'Afgestemd op:',

  focusTitle: 'Diepe Cognitieve Focus & 432Hz Alfagolven',
  focusSubtitle: 'Binaurale frequenties en alfagolven stimuleren synaptische retentie en taalopname.',
  startSoundwave: 'Start Focusgolven',
  stopSoundwave: 'Pauzeer Golven',
  soundwaveActive: 'Focusgolven Actief',
  frequencyControl: 'Frequentie (Hz)',
  volumeControl: 'Geluidsvolume',
  focusPresets: 'Focus Presets',
  presetAlpha: '432Hz Kalme Alfa (Actief Leren)',
  presetTheta: '528Hz Theta (Diepe Geheugenopslag)',
  presetGamma: '40Hz Gamma (Intense Focus)',
  presetPinkNoise: 'Zachte Roze Ruis (Cognitieve Isolatie)',

  proMonthlyTitle: 'Pro Maandelijks',
  proMonthlyPrice: '$4.99 / maand',
  proAnnualTitle: 'Pro Jaarlijks Meesterschap',
  proAnnualPrice: '$39.99 / jaar',
  mostPopularBadge: 'Meest Gekozen',
  billedAnnuallyNotice: 'Jaarlijks gefactureerd op $39.99 ($3.33/mnd equivalent)'
};

export const ENGLISH_FALLBACK_TRANSLATIONS: TranslationDictionary = {
  appName: 'Fluentic',
  tagline: 'Fluent in every word',
  close: 'Close',
  cancel: 'Cancel',
  save: 'Save',
  continue: 'Continue',
  back: 'Back',
  confirm: 'Confirm',
  loading: 'Loading...',
  locked: 'Locked',
  unlocked: 'Unlocked',
  completed: 'Completed',
  correct: 'Correct! Well done',
  incorrect: 'Not quite. Try again',
  check: 'Check',
  next: 'Next question',
  finish: 'Finish',
  start: 'Start',
  score: 'Score',
  level: 'Level',
  streak: 'Day Streak',
  gems: 'Gems',
  xp: 'Experience Points',
  retakeTest: 'Take Placement Test',
  levelLockedAlert: 'Level Locked! You cannot jump levels without taking the placement test.',
  takePlacementTestToUnlock: 'Take the 10-question placement test to qualify for higher levels.',

  navHome: 'Home',
  navPath: 'Path',
  navSpeechLab: 'Speaking',
  navDialogue: 'AI Dialogues',
  navGrammar: 'Grammar',
  navSpeedTest: 'Speed Test',
  navTranslator: 'AI Translator',
  navVault: 'Flashcards',
  navDisciplines: 'Streaks & Goals',
  navPro: 'Pro Studio',

  selectLanguage: 'Target Language',
  selectLevel: 'CEFR Level',
  selectDialect: 'Dialect',
  commandSpotlight: 'Command Spotlight (Cmd+K)',
  soundscape: 'Soundscape',
  profile: 'User Profile',
  guestUser: 'Guest Explorer',
  proActive: 'Pro Active',
  upgradePro: 'Go Pro',

  welcomeBack: 'Welcome back',
  readyToLearn: 'Ready to continue learning today?',
  startNextLesson: 'Start Next Lesson',
  dailyGoal: 'Daily Learning Goal',
  dailyQuests: 'Daily Quests',
  questPracticeMinutes: 'Practice for 15 dedicated minutes',
  questPerfectPronunciation: 'Achieve an excellent score in the Speech Lab',
  questReviewCards: 'Review 10 flashcards in the FSRS vault',
  quickPractice: 'Quick Review',
  speakingDrill: 'Speaking Drill',
  flashcardVault: 'Memory Vault',
  grammarGuide: 'Grammar Guide',
  speedChallenge: 'Speed Drill',
  currentStreakDays: 'Day Streak',
  streakProtectedBadge: 'Streak Protected',
  protectStreakWithFreeze: 'Protect your streak with a shield (50 gems)',
  milestonesAchievements: 'Milestones & Achievements',
  claimed: 'Claimed',
  claimReward: 'Claim Reward',

  unit1Title: 'Unit 1: Alphabet, Phonics & First Greetings',
  unit1Desc: 'Master the fundamental phonemes, alphabet, and courteous greetings.',
  unit2Title: 'Unit 2: Daily Life & Ordering at the Cafe',
  unit2Desc: 'Learn to order food, drinks, and everyday items with natural pronunciation.',
  unit3Title: 'Unit 3: Survival, Directions & City Navigation',
  unit3Desc: 'Ask for directions, read street signage, and navigate confidently.',
  unit4Title: 'Unit 4: Making Friends & Social Connections',
  unit4Desc: 'Speak comfortably about your hobbies, passions, and background.',
  unit5Title: 'Unit 5: Professional Nuance & Mastery',
  unit5Desc: 'Refine your vocabulary for workplace, academia, and literature.',
  startLessonPrompt: 'Start Lesson',
  completedBadge: 'Lesson Completed',
  lockedLessonNotice: 'Complete the previous lesson bubble to unlock this path.',
  crownLevel: 'Crown level',

  speechLabTitle: 'Interactive Speech Lab',
  speechLabSubtitle: 'Listen to native speakers and speak out loud with real-time feedback.',
  scenarioCafe: 'At the Cafe & Ordering Drinks',
  scenarioCafeDesc: 'Practice ordering coffee, pastries, and asking for the bill.',
  scenarioFriends: 'Meeting New Friends',
  scenarioFriendsDesc: 'Introduce yourself and share where you are from.',
  scenarioDirections: 'Asking for Directions in the City',
  scenarioDirectionsDesc: 'Find the train station, museum, or market with confidence.',
  scenarioDining: 'At the Restaurant',
  scenarioDiningDesc: 'Reserve a table, ask about ingredients, and compliment the chef.',
  scenarioMarket: 'Shopping at the Market',
  scenarioMarketDesc: 'Ask for prices, fresh fruits, and pay with ease.',
  scenarioEmergency: 'Emergency & Urgent Assistance',
  scenarioEmergencyDesc: 'Essential phrases for medical, pharmacy, or police assistance.',
  listenToNative: 'Listen to native speaker',
  pressToSpeak: 'Click to speak',
  listening: 'Listening to your voice...',
  pronunciationScore: 'Pronunciation Score',
  excellentPronunciation: 'Excellent pronunciation! Very natural!',
  needsPractice: 'Good attempt! Listen again and repeat the phrase.',
  repeatPhrase: 'Record Again',
  nextSentence: 'Next Phrase',

  vaultTitle: 'Smart Flashcard Vault (FSRS)',
  vaultSubtitle: 'Spaced repetition tailored to your cognitive retention curve.',
  clickToFlip: 'Click the card to reveal definition and examples',
  howWellDidYouKnow: 'How well did you recall this item?',
  ratingAgain: 'Again (Forgot)',
  ratingHard: 'Hard (Struggled)',
  ratingGood: 'Good (Recalled)',
  ratingEasy: 'Easy (Effortless)',
  totalCards: 'Total Cards',
  dueToday: 'Due Today',
  retentionRate: 'Estimated Retention',

  grammarTitle: 'Grammar Guide & Exercises',
  grammarSubtitle: 'Approachable breakdown of case morphology, conjugations, and syntax.',
  ruleCasesTitle: 'The 7 Cases of Lithuanian',
  ruleCasesDesc: 'Nominative, Genitive, Dative, Accusative, Instrumental, Locative, Vocative.',
  ruleVerbsTitle: 'Verb Conjugation (Present Tense)',
  ruleVerbsDesc: 'The three primary conjugation stems (-a, -i, -o).',
  rulePastTenseTitle: 'Past Simple vs Frequentative Past',
  rulePastTenseDesc: 'Single past actions versus repeated habitual past actions.',
  ruleParticiplesTitle: 'Rich Participial Forms',
  ruleParticiplesDesc: 'Extensive use of active and passive participles, pusdalyvis and padalyvis.',
  ruleParticlesTitle: 'Pitch Accents & Intonation',
  ruleParticlesDesc: 'Tonal and dynamic word stresses that distinguish meaning.',
  exampleSentence: 'Example sentence with audio',
  grammarFormula: 'Grammar Formula',
  checkYourUnderstanding: 'Check your understanding',

  speedTestTitle: 'Untimed Rapid Practice & Word Drill',
  speedTestSubtitle: 'Review vocabulary and grammar combos at your natural pace with no time stress.',
  untimedNotice: 'No countdown timer — take all the time you need to master each phrase.',
  questionOf: 'Question',
  completedDrillCongratulations: 'Congratulations! You completed all questions!',
  claimXpAndGems: 'Claim Reward (+60 XP, +25 Gems)',

  placementTestTitle: 'Standardized Placement Test (10 Questions)',
  placementTestSubtitle: 'Assess your exact CEFR level (A1 to C2). Changing levels is only possible through this test!',
  variantLabel: 'Test Variant',
  selectVariant: 'Choose Variant (A, B, C, or D)',
  questionLabel: 'Question',
  skillEvaluated: 'Skill Tested',
  cefrEvaluationNotice: 'Each question tests a specific rung of the CEFR ladder from A1 to C2.',
  levelMustBeEarned: 'Levels cannot be selected manually. You must earn your level through the Placement Test.',
  takeTestNow: 'Take Placement Test Now',
  unlockedLevelResult: 'Qualified Level',

  navFocus: 'Focus Waves',
  navAITutor: 'AI Tutor',

  whyPromptTitle: 'Why are you learning this language?',
  whyPromptSubtitle: 'The AI curriculum engine dynamically tailors modules, vocabulary, and syntax to your exact purpose.',
  intentBusiness: 'Business & Professional Negotiation',
  intentTravel: 'Travel & Cultural Navigation',
  intentAcademic: 'Academic Research & Formal Discourse',
  intentConversational: 'Conversational Fluency & Social',
  intentCulture: 'Literature & Cultural Heritage',
  changeGoal: 'Change Goal',
  tailoredFor: 'Tailored for:',

  focusTitle: 'Deep Cognitive Focus & 432Hz Alpha Waves',
  focusSubtitle: 'Binaural frequencies and soothing brainwaves engineered for deep linguistic retention.',
  startSoundwave: 'Start Focus Waves',
  stopSoundwave: 'Pause Waves',
  soundwaveActive: 'Soundwaves Active',
  frequencyControl: 'Frequency (Hz)',
  volumeControl: 'Master Volume',
  focusPresets: 'Focus Presets',
  presetAlpha: '432Hz Calm Alpha (Active Learning)',
  presetTheta: '528Hz Theta (Deep Memory Consolidation)',
  presetGamma: '40Hz Gamma (Intense Cognitive Synthesis)',
  presetPinkNoise: 'Gentle Pink Noise (Cognitive Isolation)',

  proMonthlyTitle: 'Pro Monthly',
  proMonthlyPrice: '$4.99 / month',
  proAnnualTitle: 'Pro Annual Mastery',
  proAnnualPrice: '$39.99 / year',
  mostPopularBadge: 'Most Popular',
  billedAnnuallyNotice: 'Billed annually at $39.99 ($3.33/mo equivalent)'
};

/**
 * Get active localized dictionary
 */

export const SPANISH_TRANSLATIONS: TranslationDictionary = {
  appName: "Fluentic",
  tagline: "Fluido en cada palabra",
  close: "Cerrar",
  cancel: "Cancelar",
  save: "Guardar",
  continue: "Continuar",
  back: "Atrás",
  confirm: "Confirmar",
  loading: "Cargando...",
  locked: "Bloqueado",
  unlocked: "Desbloqueado",
  completed: "Completado",
  correct: "¡Correcto!",
  incorrect: "Incorrecto",
  check: "Comprobar",
  next: "Siguiente",
  finish: "Finalizar",
  start: "Comenzar",
  score: "Puntuación",
  level: "Nivel",
  streak: "Racha",
  gems: "Gemas",
  xp: "XP",
  retakeTest: "Repetir prueba",
  levelLockedAlert: "Nivel bloqueado",
  takePlacementTestToUnlock: "Haz la prueba de nivel para desbloquear",

  navHome: "Inicio",
  navPath: "Plan de Estudio",
  navSpeechLab: "Laboratorio de Voz",
  navDialogue: "Diálogos IA",
  navGrammar: "Gramática",
  navSpeedTest: "Práctica Rápida",
  navTranslator: "Traductor IA",
  navVault: "Tarjetas FSRS",
  navDisciplines: "Disciplinas",
  navPro: "Pro Studio",

  selectLanguage: "Idioma de destino",
  selectLevel: "Nivel MCER",
  selectDialect: "Variante regional",
  commandSpotlight: "Buscar (Ctrl+K)",
  soundscape: "Ambiente sonoro",
  profile: "Perfil",
  guestUser: "Invitado",
  proActive: "Pro Activo",
  upgradePro: "Mejorar a Pro",

  welcomeBack: "¡Bienvenido de nuevo!",
  readyToLearn: "¿Listo para continuar tu aprendizaje?",
  startNextLesson: "Iniciar siguiente lección",
  dailyGoal: "Meta diaria",
  dailyQuests: "Misiones diarias",
  questPracticeMinutes: "15 min de práctica diaria",
  questPerfectPronunciation: "Pronunciación perfecta",
  questReviewCards: "Repasar 10 tarjetas de memoria",
  quickPractice: "Práctica rápida",
  speakingDrill: "Entrenamiento de voz",
  flashcardVault: "Repaso espaciado FSRS",
  grammarGuide: "Guía gramatical",
  speedChallenge: "Desafío de vocabulario",
  currentStreakDays: "días de racha activa",
  streakProtectedBadge: "Protegido con escudo",
  protectStreakWithFreeze: "Proteger racha (50 gemas)",
  milestonesAchievements: "Logros y metas",
  claimed: "Reclamado",
  claimReward: "Reclamar recompensa",

  unit1Title: "Unidad 1: Fundamentos y Mecánica del Alfabeto",
  unit1Desc: "Domina el alfabeto, la fonética nativa y las expresiones de supervivencia.",
  unit2Title: "Unidad 2: Vida Diaria y Rutinas",
  unit2Desc: "Conversaciones cotidianas, comida y direcciones.",
  unit3Title: "Unidad 3: Pasado y Narración",
  unit3Desc: "Relata vivencias y experiencias previas.",
  unit4Title: "Unidad 4: Trabajo y Debate Profesional",
  unit4Desc: "Propuestas de equipo y comunicación formal.",
  unit5Title: "Unidad 5: Matices y Prosa Literaria",
  unit5Desc: "Discurso académico, giros idiomáticos y registros avanzados.",
  startLessonPrompt: "Comenzar lección",
  completedBadge: "Completado",
  lockedLessonNotice: "Completa la lección anterior para desbloquear.",
  crownLevel: "Nivel Corona",

  speechLabTitle: "Laboratorio de Pronunciación Interactiva",
  speechLabSubtitle: "Escucha a nativos y practica en tiempo real.",
  scenarioCafe: "En la cafetería",
  scenarioCafeDesc: "Pide bebidas y solicita la cuenta.",
  scenarioFriends: "Conociendo amigos",
  scenarioFriendsDesc: "Preséntate y comparte tus aficiones.",
  scenarioDirections: "Direcciones en la ciudad",
  scenarioDirectionsDesc: "Pregunta por transportes y monumentos.",
  scenarioDining: "En el restaurante",
  scenarioDiningDesc: "Reserva una mesa y conversa con el personal.",
  scenarioMarket: "Mercado local",
  scenarioMarketDesc: "Pregunta precios y haz compras.",
  scenarioEmergency: "Ayuda urgente",
  scenarioEmergencyDesc: "Frases esenciales para farmacias o emergencias.",
  listenToNative: "Escuchar audio nativo",
  pressToSpeak: "Toca para hablar",
  listening: "Escuchando tu voz...",
  pronunciationScore: "Puntuación de pronunciación",
  excellentPronunciation: "¡Pronunciación excelente y natural!",
  needsPractice: "Buen intento. Escucha de nuevo y repite.",
  repeatPhrase: "Grabar de nuevo",
  nextSentence: "Siguiente frase",

  vaultTitle: "Baúl Inteligente de Tarjetas (FSRS)",
  vaultSubtitle: "Repetición espaciada ajustada a tu curva de memoria.",
  clickToFlip: "Toca la tarjeta para ver el reverso",
  howWellDidYouKnow: "¿Cómo recordaste este concepto?",
  ratingAgain: "Olvidé",
  ratingHard: "Difícil",
  ratingGood: "Bien",
  ratingEasy: "Fácil",
  totalCards: "Total tarjetas",
  dueToday: "Para hoy",
  retentionRate: "Retención estimada",

  grammarTitle: "Guía de Gramática y Morfología",
  grammarSubtitle: "Estructuras oracionales y reglas explicadas paso a paso.",
  ruleCasesTitle: "Casos gramaticales",
  ruleCasesDesc: "Comprende la función sintáctica en cada oración.",
  ruleVerbsTitle: "Conjugación verbal",
  ruleVerbsDesc: "Tiempos verbales y desinencias personales.",
  rulePastTenseTitle: "Tiempos del pasado",
  rulePastTenseDesc: "Distingue acciones puntuales de habituales.",
  ruleParticiplesTitle: "Participios y conectores",
  ruleParticiplesDesc: "Sintaxis avanzada y subordinación.",
  ruleParticlesTitle: "Entonación y ritmo",
  ruleParticlesDesc: "Acentos dinámicos y musicalidad de la lengua.",
  exampleSentence: "Frase de ejemplo con audio",
  grammarFormula: "Fórmula gramatical",
  checkYourUnderstanding: "Comprueba tu comprensión",

  speedTestTitle: "Práctica Rápida sin Presión de Tiempo",
  speedTestSubtitle: "Afianza patrones léxicos a tu propio ritmo.",
  untimedNotice: "Sin cuenta atrás: tómate el tiempo necesario.",
  questionOf: "Pregunta",
  completedDrillCongratulations: "¡Enhorabuena! Has completado todas las preguntas.",
  claimXpAndGems: "Reclamar (+60 XP, +25 Gemas)",

  placementTestTitle: "Prueba de Nivel Estandarizada MCER (10 Preguntas)",
  placementTestSubtitle: "Determina con exactitud tu nivel de A1 a C2.",
  variantLabel: "Variante",
  selectVariant: "Elegir variante (A, B, C o D)",
  questionLabel: "Pregunta",
  skillEvaluated: "Habilidad evaluada",
  cefrEvaluationNotice: "Cada pregunta evalúa un peldaño del marco europeo MCER.",
  levelMustBeEarned: "El nivel no se elige al azar; se acredita con la prueba.",
  takeTestNow: "Hacer prueba de nivel ahora",
  unlockedLevelResult: "Nivel obtenido"
};

export const FRENCH_TRANSLATIONS: TranslationDictionary = {
  appName: "Fluentic",
  tagline: "La fluidité dans chaque mot",
  close: "Fermer",
  cancel: "Annuler",
  save: "Enregistrer",
  continue: "Continuer",
  back: "Retour",
  confirm: "Confirmer",
  loading: "Chargement...",
  locked: "Verrouillé",
  unlocked: "Déverrouillé",
  completed: "Terminé",
  correct: "Correct !",
  incorrect: "Incorrect",
  check: "Vérifier",
  next: "Suivant",
  finish: "Terminer",
  start: "Commencer",
  score: "Score",
  level: "Niveau",
  streak: "Série",
  gems: "Gemmes",
  xp: "XP",
  retakeTest: "Repasser le test",
  levelLockedAlert: "Niveau verrouillé",
  takePlacementTestToUnlock: "Passez le test de niveau pour débloquer",

  navHome: "Accueil",
  navPath: "Parcours",
  navSpeechLab: "Labo Vocal",
  navDialogue: "Dialogues IA",
  navGrammar: "Grammaire",
  navSpeedTest: "Pratique Rapide",
  navTranslator: "Traducteur IA",
  navVault: "Cartes FSRS",
  navDisciplines: "Disciplines",
  navPro: "Pro Studio",

  selectLanguage: "Langue cible",
  selectLevel: "Niveau CECRL",
  selectDialect: "Variante dialectale",
  commandSpotlight: "Rechercher (Ctrl+K)",
  soundscape: "Ambiance sonore",
  profile: "Profil",
  guestUser: "Invité",
  proActive: "Pro Actif",
  upgradePro: "Passer à Pro",

  welcomeBack: "Bon retour parmi nous !",
  readyToLearn: "Prêt à poursuivre votre apprentissage ?",
  startNextLesson: "Lancer la leçon suivante",
  dailyGoal: "Objectif quotidien",
  dailyQuests: "Quêtes du jour",
  questPracticeMinutes: "15 min d’entraînement intensif",
  questPerfectPronunciation: "Prononciation impeccable",
  questReviewCards: "Réviser 10 cartes mémoire",
  quickPractice: "Pratique express",
  speakingDrill: "Entraînement oral",
  flashcardVault: "Cartes FSRS espacées",
  grammarGuide: "Guide grammatical",
  speedChallenge: "Défi lexical",
  currentStreakDays: "jours consécutifs de série",
  streakProtectedBadge: "Série protégée par bouclier",
  protectStreakWithFreeze: "Protéger la série (50 gemmes)",
  milestonesAchievements: "Succès et récompenses",
  claimed: "Réclamé",
  claimReward: "Réclamer la récompense",

  unit1Title: "Unité 1 : Fondations et Mécanique de l’Alphabet",
  unit1Desc: "Maîtrisez l’alphabet, la phonétique authentique et les bases de survie.",
  unit2Title: "Unité 2 : Vie Quotidienne et Repères",
  unit2Desc: "Commandez au restaurant et orientez-vous facilement.",
  unit3Title: "Unité 3 : Récits et Actions Passées",
  unit3Desc: "Racontez vos souvenirs et vos anecdotes avec précision.",
  unit4Title: "Unité 4 : Échanges Professionnels et Débat",
  unit4Desc: "Collaborez en équipe et formulez des propositions nuancées.",
  unit5Title: "Unité 5 : Nuances, Proverbes et Registre Soutenu",
  unit5Desc: "Débat universitaire, subjonctif et métaphores patrimoniales.",
  startLessonPrompt: "Démarrer la leçon",
  completedBadge: "Validé",
  lockedLessonNotice: "Complétez la leçon précédente pour progresser.",
  crownLevel: "Niveau Couronne",

  speechLabTitle: "Laboratoire Vocal Interactif",
  speechLabSubtitle: "Écoutez des locuteurs natifs et perfectionnez votre accent.",
  scenarioCafe: "Au café",
  scenarioCafeDesc: "Commandez des boissons et demandez l’addition.",
  scenarioFriends: "Rencontre amicale",
  scenarioFriendsDesc: "Présentez-vous et partagez vos origines.",
  scenarioDirections: "S’orienter en ville",
  scenarioDirectionsDesc: "Trouvez la gare et les monuments clés.",
  scenarioDining: "Au restaurant",
  scenarioDiningDesc: "Réservez une table et appréciez le repas.",
  scenarioMarket: "Au marché",
  scenarioMarketDesc: "Demandez les prix et faites vos emplettes.",
  scenarioEmergency: "Assistance d’urgence",
  scenarioEmergencyDesc: "Expressions vitales pour la pharmacie et les secours.",
  listenToNative: "Écouter la voix native",
  pressToSpeak: "Cliquez pour parler",
  listening: "Écoute de votre voix en cours...",
  pronunciationScore: "Score de précision",
  excellentPronunciation: "Excellente diction ! Très naturel.",
  needsPractice: "Bel effort ! Réécoutez et répétez la phrase.",
  repeatPhrase: "Réenregistrer",
  nextSentence: "Phrase suivante",

  vaultTitle: "Coffre de Mémorisation Espacée (FSRS)",
  vaultSubtitle: "Optimisé pour ancrer durablement le vocabulaire.",
  clickToFlip: "Cliquez sur la carte pour révéler la traduction",
  howWellDidYouKnow: "Quel était votre niveau de rappel ?",
  ratingAgain: "Oublié",
  ratingHard: "Difficile",
  ratingGood: "Bien",
  ratingEasy: "Facile",
  totalCards: "Total cartes",
  dueToday: "À revoir aujourd’hui",
  retentionRate: "Taux de rétention",

  grammarTitle: "Précis de Grammaire et Syntaxe",
  grammarSubtitle: "Explications méthodiques des règles et déclinaisons.",
  ruleCasesTitle: "Régimes et cas nominaux",
  ruleCasesDesc: "Identifiez le rôle syntaxique des mots dans la phrase.",
  ruleVerbsTitle: "Conjugaison et aspects",
  ruleVerbsDesc: "Temps verbaux et accords rigoureux.",
  rulePastTenseTitle: "Temps du passé",
  rulePastTenseDesc: "Distinguez l’aspect accompli des actions habituelles.",
  ruleParticiplesTitle: "Participes et connecteurs",
  ruleParticiplesDesc: "Subordination complexe et style fluide.",
  ruleParticlesTitle: "Accentuation tonale",
  ruleParticlesDesc: "Rythme naturel et intonation mélodique.",
  exampleSentence: "Exemple audio commenté",
  grammarFormula: "Règle clé",
  checkYourUnderstanding: "Vérifiez vos acquis",

  speedTestTitle: "Pratique Rapide sans Stress Temporel",
  speedTestSubtitle: "Révisez vos automatismes à votre rythme.",
  untimedNotice: "Aucun compte à rebours : progressez sereinement.",
  questionOf: "Question",
  completedDrillCongratulations: "Félicitations ! Vous avez complété toutes les questions.",
  claimXpAndGems: "Réclamer (+60 XP, +25 Gemmes)",

  placementTestTitle: "Test de Niveau Standardisé CECRL (10 Questions)",
  placementTestSubtitle: "Évaluez précisément votre niveau de A1 à C2.",
  variantLabel: "Variante",
  selectVariant: "Sélectionner la variante (A, B, C ou D)",
  questionLabel: "Question",
  skillEvaluated: "Compétence testée",
  cefrEvaluationNotice: "Chaque question évalue un échelon du cadre européen CECRL.",
  levelMustBeEarned: "Les niveaux s’obtiennent par le test pour garantir une vraie progression.",
  takeTestNow: "Passer le test de niveau maintenant",
  unlockedLevelResult: "Niveau certifié"
};

export const GERMAN_TRANSLATIONS: TranslationDictionary = {
  appName: "Fluentic",
  tagline: "Fließend in jedem Wort",
  close: "Schließen",
  cancel: "Abbrechen",
  save: "Speichern",
  continue: "Weiter",
  back: "Zurück",
  confirm: "Bestätigen",
  loading: "Laden...",
  locked: "Gesperrt",
  unlocked: "Freigeschaltet",
  completed: "Abgeschlossen",
  correct: "Richtig!",
  incorrect: "Falsch",
  check: "Überprüfen",
  next: "Weiter",
  finish: "Beenden",
  start: "Starten",
  score: "Punktzahl",
  level: "Stufe",
  streak: "Serie",
  gems: "Edelsteine",
  xp: "XP",
  retakeTest: "Test wiederholen",
  levelLockedAlert: "Stufe gesperrt",
  takePlacementTestToUnlock: "Einstufungstest ablegen zum Freischalten",

  navHome: "Start",
  navPath: "Lernpfad",
  navSpeechLab: "Sprachlabor",
  navDialogue: "KI-Dialoge",
  navGrammar: "Grammatik",
  navSpeedTest: "Schnellübung",
  navTranslator: "KI-Übersetzer",
  navVault: "FSRS-Karten",
  navDisciplines: "Disziplinen",
  navPro: "Pro Studio",

  selectLanguage: "Zielsprache",
  selectLevel: "GER-Niveau",
  selectDialect: "Dialekt",
  commandSpotlight: "Suche (Strg+K)",
  soundscape: "Klanglandschaft",
  profile: "Profil",
  guestUser: "Gast",
  proActive: "Pro Aktiv",
  upgradePro: "Auf Pro upgraden",

  welcomeBack: "Willkommen zurück!",
  readyToLearn: "Bereit für deine nächste Lerneinheit?",
  startNextLesson: "Nächste Lektion starten",
  dailyGoal: "Tagesziel",
  dailyQuests: "Tägliche Aufgaben",
  questPracticeMinutes: "15 Min. intensives Lernen",
  questPerfectPronunciation: "Perfekte Aussprache",
  questReviewCards: "10 Karteikarten wiederholen",
  quickPractice: "Schnellstart",
  speakingDrill: "Sprechtraining",
  flashcardVault: "FSRS-Wiederholung",
  grammarGuide: "Grammatikführer",
  speedChallenge: "Vokabel-Sprint",
  currentStreakDays: "Tage aktive Serie",
  streakProtectedBadge: "Serie durch Schild geschützt",
  protectStreakWithFreeze: "Serie schützen (50 Edelsteine)",
  milestonesAchievements: "Erfolge & Meilensteine",
  claimed: "Eingelöst",
  claimReward: "Belohnung einlösen",

  unit1Title: "Einheit 1: Alphabet & Phonetische Grundlagen",
  unit1Desc: "Meistere das Alphabet, Lautgesetze und alltägliche Überlebensphrasen.",
  unit2Title: "Einheit 2: Alltag & Orientierung",
  unit2Desc: "Bestelle im Café und frage nach dem Weg.",
  unit3Title: "Einheit 3: Vergangenheit & Erzählung",
  unit3Desc: "Erzähle von vergangenen Erlebnissen und Reisen.",
  unit4Title: "Einheit 4: Beruf & Fachdiskussion",
  unit4Desc: "Koordiniere Projekte und formuliere differenzierte Argumente.",
  unit5Title: "Einheit 5: Nuancen & Gehobener Stil",
  unit5Desc: "Akademischer Diskurs, Idiomatik und literarische Ausdruckskraft.",
  startLessonPrompt: "Lektion starten",
  completedBadge: "Abgeschlossen",
  lockedLessonNotice: "Schließe die vorherige Lektion ab.",
  crownLevel: "Kronen-Niveau",

  speechLabTitle: "Interaktives Sprachlabor",
  speechLabSubtitle: "Höre Muttersprachlern zu und trainiere deine Aussprache in Echtzeit.",
  scenarioCafe: "Im Café",
  scenarioCafeDesc: "Bestelle Getränke und bezahle die Rechnung.",
  scenarioFriends: "Freunde kennenlernen",
  scenarioFriendsDesc: "Stelle dich vor und erzähle von deiner Heimat.",
  scenarioDirections: "Nach dem Weg fragen",
  scenarioDirectionsDesc: "Finde Bahnhöfe und Sehenswürdigkeiten.",
  scenarioDining: "Im Restaurant",
  scenarioDiningDesc: "Reserviere einen Tisch und sprich mit dem Personal.",
  scenarioMarket: "Auf dem Markt",
  scenarioMarketDesc: "Erfrage Preise und kaufe frische Waren.",
  scenarioEmergency: "Notfallhilfe",
  scenarioEmergencyDesc: "Wichtige Sätze für Apotheke und Notsituationen.",
  listenToNative: "Muttersprachler anhören",
  pressToSpeak: "Klicken zum Sprechen",
  listening: "Stimme wird erfasst...",
  pronunciationScore: "Aussprache-Bewertung",
  excellentPronunciation: "Hervorragende Aussprache! Sehr authentisch.",
  needsPractice: "Guter Versuch! Noch einmal anhören und nachsprechen.",
  repeatPhrase: "Erneut aufnehmen",
  nextSentence: "Nächster Satz",

  vaultTitle: "FSRS-Karteikasten",
  vaultSubtitle: "Wissenschaftlich fundierte Langzeit-Wiederholung.",
  clickToFlip: "Karte antippen, um Übersetzung zu sehen",
  howWellDidYouKnow: "Wie gut konntest du dich erinnern?",
  ratingAgain: "Vergessen",
  ratingHard: "Schwer",
  ratingGood: "Gut",
  ratingEasy: "Einfach",
  totalCards: "Gesamtkarten",
  dueToday: "Heute fällig",
  retentionRate: "Behaltensrate",

  grammarTitle: "Grammatik- & Morphologie-Leitfaden",
  grammarSubtitle: "Kompakte Übersicht über Fälle, Konjugationen und Satzbau.",
  ruleCasesTitle: "Kasuslehre",
  ruleCasesDesc: "Verstehe Nominativ, Genitiv, Dativ und Akkusativ.",
  ruleVerbsTitle: "Verbkonjugation",
  ruleVerbsDesc: "Regelmäßige und unregelmäßige Formen.",
  rulePastTenseTitle: "Zeiten der Vergangenheit",
  rulePastTenseDesc: "Unterscheide Präteritum und Perfekt.",
  ruleParticiplesTitle: "Partizipien & Satzgefüge",
  ruleParticiplesDesc: "Satzverknüpfung und Nebensätze.",
  ruleParticlesTitle: "Betonung & Sprachmelodie",
  ruleParticlesDesc: "Natürlicher Redefluss und Akzentsetzung.",
  exampleSentence: "Beispielsatz mit Audio",
  grammarFormula: "Grammatikregel",
  checkYourUnderstanding: "Verständnis prüfen",

  speedTestTitle: "Schnellübung ohne Zeitdruck",
  speedTestSubtitle: "Wiederhole Vokabeln im eigenen Wohlfühltempo.",
  untimedNotice: "Kein Countdown: Nimm dir alle Zeit, die du brauchst.",
  questionOf: "Frage",
  completedDrillCongratulations: "Glückwunsch! Du hast alle Fragen beantwortet.",
  claimXpAndGems: "Belohnung einlösen (+60 XP, +25 Edelsteine)",

  placementTestTitle: "Standardisierter GER-Einstufungstest (10 Fragen)",
  placementTestSubtitle: "Bestimme präzise dein Niveau von A1 bis C2.",
  variantLabel: "Variante",
  selectVariant: "Variante wählen (A, B, C oder D)",
  questionLabel: "Frage",
  skillEvaluated: "Geprüfte Fähigkeit",
  cefrEvaluationNotice: "Jede Frage misst eine Stufe des Gemeinsamen Europäischen Referenzrahmens.",
  levelMustBeEarned: "Stufen werden durch den Test ermittelt, um echten Lernerfolg zu sichern.",
  takeTestNow: "Einstufungstest jetzt starten",
  unlockedLevelResult: "Erreichtes Niveau"
};

export const ITALIAN_TRANSLATIONS: TranslationDictionary = {
  appName: "Fluentic",
  tagline: "Piattaforma di Padronanza Linguistica Autentica",
  close: "Chiudi",
  cancel: "Annulla",
  save: "Salva",
  continue: "Continua",
  back: "Indietro",
  confirm: "Conferma",
  loading: "Caricamento in corso...",
  locked: "Bloccato",
  unlocked: "Sbloccato",
  completed: "Completato",
  correct: "Corretto!",
  incorrect: "Non corretto",
  check: "Verifica",
  next: "Avanti",
  finish: "Completa",
  start: "Inizia",
  score: "Punteggio",
  level: "Livello",
  streak: "Serie",
  gems: "Gemme",
  xp: "XP",
  retakeTest: "Ripeti il test di livello",
  levelLockedAlert: "Questo livello è attualmente bloccato.",
  takePlacementTestToUnlock: "Completa il test di livello QCER per sbloccare tutti i moduli corrispondenti.",

  navHome: "Home",
  navPath: "Percorso",
  navSpeechLab: "Laboratorio Parlato",
  navDialogue: "Teatro Dialoghi",
  navGrammar: "Guida Grammaticale",
  navSpeedTest: "Sfida Rapida",
  navTranslator: "Traduttore AI",
  navVault: "Cassaforte Memoria",
  navDisciplines: "Obiettivi & Serie",
  navPro: "Fluentic Pro",

  selectLanguage: "Seleziona Lingua",
  selectLevel: "Seleziona Livello QCER",
  selectDialect: "Dialetto",
  commandSpotlight: "Ricerca Rapida",
  soundscape: "Audio Concentrazione",
  profile: "Profilo",
  guestUser: "Ospite Poliglotta",
  proActive: "Abbonamento Pro Attivo",
  upgradePro: "Passa a Pro",

  welcomeBack: "Bentornato,",
  readyToLearn: "Pronto a continuare il tuo percorso di padronanza oggi?",
  startNextLesson: "Inizia la Prossima Lezione",
  dailyGoal: "Obiettivo Giornaliero",
  dailyQuests: "Missioni del Giorno",
  questPracticeMinutes: "Fai pratica per 15 minuti",
  questPerfectPronunciation: "Ottieni un punteggio eccellente di pronuncia",
  questReviewCards: "Ripassa le schede nella cassaforte",
  quickPractice: "Esercizio Rapido",
  speakingDrill: "Pratica Orale",
  flashcardVault: "Cassaforte Memoria FSRS",
  grammarGuide: "Guida alla Grammatica",
  speedChallenge: "Sfida di Velocità",
  currentStreakDays: "Serie Attuale di Giorni",
  streakProtectedBadge: "Serie Protetta",
  protectStreakWithFreeze: "Proteggi la tua serie",
  milestonesAchievements: "Traguardi Raggiunti",
  claimed: "Riscattato",
  claimReward: "Riscatta Ricompensa",

  unit1Title: "A1: Fondamenti & Frasi Essenziali",
  unit1Desc: "Meccanica della scrittura, saluti e prime espressioni quotidiane.",
  unit2Title: "A2: Orientamento & Vita Quotidiana",
  unit2Desc: "Muoverti in città, fare acquisti e semplici abitudini.",
  unit3Title: "B1: Viaggi, Opinioni & Narrazione",
  unit3Desc: "Conversazioni fluide, raccontare esperienze e condividere idee.",
  unit4Title: "B2: Dibattito Professionale & Media",
  unit4Desc: "Discorsi argomentativi, riunioni di lavoro e concetti complessi.",
  unit5Title: "C1/C2: Padronanza Idiomatica & Sfumature",
  unit5Desc: "Subtilità culturali, ironia, proverbi storici e registro accademico.",
  startLessonPrompt: "Tocca per iniziare questa sessione.",
  completedBadge: "Completato con successo",
  lockedLessonNotice: "Completa prima le lezioni precedenti.",
  crownLevel: "Livello Corona",

  speechLabTitle: "Laboratorio Vocale & Valutazione Pronuncia",
  speechLabSubtitle: "Ascolta i parlanti madrelingua e perfeziona la tua intonazione in tempo reale.",
  scenarioCafe: "Ordinare al Caffè",
  scenarioCafeDesc: "Ordina bevande e chiedi il conto con naturalezza.",
  scenarioFriends: "Incontrare Amici",
  scenarioFriendsDesc: "Presentati e fai conversazione informale.",
  scenarioDirections: "Chiedere Indicazioni",
  scenarioDirectionsDesc: "Orientati in stazione e nelle vie della città.",
  scenarioDining: "Cena al Ristorante",
  scenarioDiningDesc: "Chiedi consigli sul menu e prenota un tavolo.",
  scenarioMarket: "Mercato & Acquisti",
  scenarioMarketDesc: "Chiedi i prezzi e fai acquisti al mercato.",
  scenarioEmergency: "Situazioni di Urgenza",
  scenarioEmergencyDesc: "Frasi essenziali per chiedere aiuto immediato.",
  listenToNative: "Ascolta la pronuncia madrelingua",
  pressToSpeak: "Tocca il microfono e parla",
  listening: "In ascolto...",
  pronunciationScore: "Punteggio di Pronuncia",
  excellentPronunciation: "Pronuncia straordinaria! Intonazione impeccabile.",
  needsPractice: "Buon tentativo! Riprova prestando attenzione alle vocali aperte.",
  repeatPhrase: "Riascolta",
  nextSentence: "Prossima Frase",

  vaultTitle: "Cassaforte Mnemonica FSRS",
  vaultSubtitle: "Ripetizione spaziata intelligente per memorizzare vocaboli a lungo termine.",
  clickToFlip: "Tocca la scheda per svelare la risposta",
  howWellDidYouKnow: "Quanto ricordavi questa parola?",
  ratingAgain: "Da Rivedere",
  ratingHard: "Difficile",
  ratingGood: "Buono",
  ratingEasy: "Facile",
  totalCards: "Schede Totali",
  dueToday: "Da Ripassare Oggi",
  retentionRate: "Tasso di Ritenzione",

  grammarTitle: "Guida Grammaticale & Strutture Fondamentali",
  grammarSubtitle: "Regole morfologiche chiare, schemi sintattici ed esempi reali.",
  ruleCasesTitle: "Declinazioni & Casi",
  ruleCasesDesc: "Comprendere le funzioni delle desinenze nella frase.",
  ruleVerbsTitle: "Coniugazione dei Verbi",
  ruleVerbsDesc: "Tempi verbali, accordi e forme regolari e irregolari.",
  rulePastTenseTitle: "Tempi Passati",
  rulePastTenseDesc: "Esprimere azioni concluse e narrazioni.",
  ruleParticiplesTitle: "Participi & Forme Subordinate",
  ruleParticiplesDesc: "Costruire periodi complessi ed eleganti.",
  ruleParticlesTitle: "Particelle & Connettivi",
  ruleParticlesDesc: "Piccole parole che donano naturalezza al discorso.",
  exampleSentence: "Esempio nel contesto:",
  grammarFormula: "Regola Chiave:",
  checkYourUnderstanding: "Verifica Rapida",

  speedTestTitle: "Sfida di Velocità QCER",
  speedTestSubtitle: "Misura la tua prontezza di risposta in modo rilassato.",
  untimedNotice: "Rispondi con calma: l'accuratezza è la chiave.",
  questionOf: "Domanda",
  completedDrillCongratulations: "Congratulazioni! Hai completato la serie di domande.",
  claimXpAndGems: "Riscatta Ricompensa (+60 XP, +25 Gemme)",

  placementTestTitle: "Test di Livello QCER Standardizzato (10 Domande)",
  placementTestSubtitle: "Determina accuratamente il tuo livello linguistico da A1 a C2.",
  variantLabel: "Variante",
  selectVariant: "Seleziona Variante (A, B, C o D)",
  questionLabel: "Domanda",
  skillEvaluated: "Abilità Valutata",
  cefrEvaluationNotice: "Ogni domanda misura un livello del Quadro Comune Europeo di Riferimento.",
  levelMustBeEarned: "I livelli vengono sbloccati dimostrando competenza effettiva nel test.",
  takeTestNow: "Avvia il Test di Livello",
  unlockedLevelResult: "Livello Conseguito"
};

export const RUSSIAN_TRANSLATIONS: TranslationDictionary = {
  appName: "Fluentic",
  tagline: "Платформа истинного языкового мастерства",
  close: "Закрыть",
  cancel: "Отмена",
  save: "Сохранить",
  continue: "Продолжить",
  back: "Назад",
  confirm: "Подтвердить",
  loading: "Загрузка...",
  locked: "Заблокировано",
  unlocked: "Разблокировано",
  completed: "Завершено",
  correct: "Верно!",
  incorrect: "Неверно",
  check: "Проверить",
  next: "Далее",
  finish: "Завершить",
  start: "Начать",
  score: "Счёт",
  level: "Уровень",
  streak: "Серия",
  gems: "Кристаллы",
  xp: "XP",
  retakeTest: "Пройти тест заново",
  levelLockedAlert: "Этот уровень сейчас заблокирован.",
  takePlacementTestToUnlock: "Пройдите тест CEFR, чтобы открыть соответствующие учебные модули.",

  navHome: "Главная",
  navPath: "Обучение",
  navSpeechLab: "Речевая лаборатория",
  navDialogue: "Диалоги",
  navGrammar: "Грамматика",
  navSpeedTest: "Экспресс-тест",
  navTranslator: "AI Переводчик",
  navVault: "Хранилище слов",
  navDisciplines: "Серии и цели",
  navPro: "Fluentic Pro",

  selectLanguage: "Выбрать язык",
  selectLevel: "Выбрать уровень CEFR",
  selectDialect: "Диалект",
  commandSpotlight: "Быстрый поиск",
  soundscape: "Звуки концентрации",
  profile: "Профиль",
  guestUser: "Гость-полиглот",
  proActive: "Подписка Pro активна",
  upgradePro: "Перейти на Pro",

  welcomeBack: "С возвращением,",
  readyToLearn: "Готовы сделать новый шаг в изучении языка сегодня?",
  startNextLesson: "Начать следующий урок",
  dailyGoal: "Цель на день",
  dailyQuests: "Ежедневные задания",
  questPracticeMinutes: "Заниматься 15 минут",
  questPerfectPronunciation: "Получить высшую оценку за произношение",
  questReviewCards: "Повторить карточки в хранилище",
  quickPractice: "Быстрая практика",
  speakingDrill: "Разговорная тренировка",
  flashcardVault: "Хранилище карточек FSRS",
  grammarGuide: "Справочник грамматики",
  speedChallenge: "Скоростная тренировка",
  currentStreakDays: "Текущая серия дней",
  streakProtectedBadge: "Серия защищена",
  protectStreakWithFreeze: "Защитить серию заморозкой",
  milestonesAchievements: "Достижения",
  claimed: "Получено",
  claimReward: "Забрать награду",

  unit1Title: "A1: Основы и базовые фразы",
  unit1Desc: "Механика письма, звуки, приветствия и выживание.",
  unit2Title: "A2: Город, покупки и привычки",
  unit2Desc: "Ориентирование в городе, простые диалоги и покупки.",
  unit3Title: "B1: Путешествия, мнения и истории",
  unit3Desc: "Уверенная речь, обсуждение впечатлений и планов.",
  unit4Title: "B2: Дебаты, работа и медиа",
  unit4Desc: "Аргументация, деловые обсуждения и сложные темы.",
  unit5Title: "C1/C2: Идиоматика, нюансы и культура",
  unit5Desc: "Тонкий подтекст, ирония, пословицы и академический стиль.",
  startLessonPrompt: "Нажмите, чтобы начать урок.",
  completedBadge: "Пройдено успешно",
  lockedLessonNotice: "Сначала завершите предыдущие уроки.",
  crownLevel: "Уровень короны",

  speechLabTitle: "Речевая лаборатория произношения",
  speechLabSubtitle: "Слушайте носителей языка и оттачивайте правильную артикуляцию.",
  scenarioCafe: "В кофейне",
  scenarioCafeDesc: "Заказывайте напитки и просите счет.",
  scenarioFriends: "Знакомство с друзьями",
  scenarioFriendsDesc: "Представьтесь и начните непринужденный разговор.",
  scenarioDirections: "Как пройти?",
  scenarioDirectionsDesc: "Узнайте дорогу до вокзала и в центре города.",
  scenarioDining: "Ужин в ресторане",
  scenarioDiningDesc: "Бронирование столика и рекомендации блюд.",
  scenarioMarket: "На рынке",
  scenarioMarketDesc: "Уточняйте цены и выбирайте свежие продукты.",
  scenarioEmergency: "Срочная помощь",
  scenarioEmergencyDesc: "Ключевые фразы в экстренных ситуациях.",
  listenToNative: "Послушать носителя языка",
  pressToSpeak: "Нажмите микрофон и говорите",
  listening: "Слушаю вас...",
  pronunciationScore: "Оценка произношения",
  excellentPronunciation: "Превосходно! Звучание максимально близко к носителю.",
  needsPractice: "Хорошая попытка! Обратите внимание на ударения и гласные.",
  repeatPhrase: "Слушать снова",
  nextSentence: "Следующая фраза",

  vaultTitle: "Интервальное хранилище FSRS",
  vaultSubtitle: "Научно обоснованное повторение для прочного запоминания слов.",
  clickToFlip: "Нажмите на карточку, чтобы перевернуть",
  howWellDidYouKnow: "Насколько хорошо вы помнили это слово?",
  ratingAgain: "Повторить",
  ratingHard: "Трудно",
  ratingGood: "Хорошо",
  ratingEasy: "Легко",
  totalCards: "Всего карточек",
  dueToday: "К повторению сегодня",
  retentionRate: "Уровень запоминания",

  grammarTitle: "Грамматика и основы языка",
  grammarSubtitle: "Четкие правила, формулы построения фраз и живые примеры.",
  ruleCasesTitle: "Падежная система",
  ruleCasesDesc: "Роль окончаний и согласование слов в предложении.",
  ruleVerbsTitle: "Спряжение глаголов",
  ruleVerbsDesc: "Времена, лица и ключевые особенности глаголов.",
  rulePastTenseTitle: "Прошедшее время",
  rulePastTenseDesc: "Описание прошлых событий и завершенных действий.",
  ruleParticiplesTitle: "Причастия и деепричастия",
  ruleParticiplesDesc: "Построение связных и выразительных фраз.",
  ruleParticlesTitle: "Частицы и связки",
  ruleParticlesDesc: "Слова, придающие естественность живой речи.",
  exampleSentence: "Пример в контексте:",
  grammarFormula: "Формула правила:",
  checkYourUnderstanding: "Быстрая проверка",

  speedTestTitle: "Проверка понимания CEFR",
  speedTestSubtitle: "Оцените скорость и точность языковой реакции.",
  untimedNotice: "Не спешите: главное — правильное понимание структуры языка.",
  questionOf: "Вопрос",
  completedDrillCongratulations: "Отлично! Вы ответили на все вопросы теста.",
  claimXpAndGems: "Забрать награду (+60 XP, +25 кристаллов)",

  placementTestTitle: "Стандартизированный тест CEFR (10 вопросов)",
  placementTestSubtitle: "Точно определите свой уровень от A1 до C2.",
  variantLabel: "Вариант",
  selectVariant: "Выбрать вариант (A, B, C или D)",
  questionLabel: "Вопрос",
  skillEvaluated: "Проверяемый навык",
  cefrEvaluationNotice: "Каждый вопрос проверяет уровень общеевропейской шкалы CEFR.",
  levelMustBeEarned: "Уровни подтверждаются результатами тестирования.",
  takeTestNow: "Начать тест сейчас",
  unlockedLevelResult: "Ваш уровень"
};

export const ARABIC_TRANSLATIONS: TranslationDictionary = {
  appName: "Fluentic",
  tagline: "منصة إتقان اللغات الحقيقية",
  close: "إغلاق",
  cancel: "إلغاء",
  save: "حفظ",
  continue: "متابعة",
  back: "رجوع",
  confirm: "تأكيد",
  loading: "جارٍ التحميل...",
  locked: "مقفل",
  unlocked: "مفتوح",
  completed: "مكتمل",
  correct: "صحيح!",
  incorrect: "غير صحيح",
  check: "تحقق",
  next: "التالي",
  finish: "إنهاء",
  start: "بدء",
  score: "النتيجة",
  level: "المستوى",
  streak: "سلسلة الأيام",
  gems: "الجواهر",
  xp: "نقاط الخبرة",
  retakeTest: "إعادة اختبار تحديد المستوى",
  levelLockedAlert: "هذا المستوى مقفل حالياً.",
  takePlacementTestToUnlock: "أكمل اختبار CEFR لفتح جميع مسارات التعلم المناسبة لمستواك.",

  navHome: "الرئيسية",
  navPath: "مسار التعلم",
  navSpeechLab: "مختبر النطق",
  navDialogue: "مسرح الحوار",
  navGrammar: "قواعد اللغة",
  navSpeedTest: "اختبار سريع",
  navTranslator: "المترجم الذكي",
  navVault: "خزينة الكلمات",
  navDisciplines: "الأهداف والسلاسل",
  navPro: "Fluentic Pro",

  selectLanguage: "اختر اللغة",
  selectLevel: "اختر المستوى",
  selectDialect: "اللهجة",
  commandSpotlight: "البحث السريع",
  soundscape: "صوتيات التركيز",
  profile: "الملف الشخصي",
  guestUser: "ضيف متعلم",
  proActive: "اشتراك Pro مفعّل",
  upgradePro: "الترقية إلى Pro",

  welcomeBack: "مرحباً بعودتك،",
  readyToLearn: "هل أنت مستعد لمواصلة رحلة الإتقان اليوم؟",
  startNextLesson: "ابدأ الدرس التالي",
  dailyGoal: "الهدف اليومي",
  dailyQuests: "مهام اليوم",
  questPracticeMinutes: "تدرّب لمدة 15 دقيقة",
  questPerfectPronunciation: "احصل على درجة نطق ممتازة",
  questReviewCards: "راجع بطاقات الخزينة",
  quickPractice: "تمرين سريع",
  speakingDrill: "تدريب التحدث",
  flashcardVault: "خزينة البطاقات FSRS",
  grammarGuide: "دليل القواعد",
  speedChallenge: "تحدي السرعة",
  currentStreakDays: "سلسلة الأيام الحالية",
  streakProtectedBadge: "السلسلة محمية",
  protectStreakWithFreeze: "حماية السلسلة",
  milestonesAchievements: "الإنجازات",
  claimed: "تم الاستلام",
  claimReward: "استلام المكافأة",

  unit1Title: "A1: الأساسيات والعبارات اليومية",
  unit1Desc: "رسم الحروف، الأصوات، التحيات والتعبيرات الأساسية.",
  unit2Title: "A2: الحياة اليومية والتسوق",
  unit2Desc: "الاتجاهات في المدينة، المشتريات والمواقف المألوفة.",
  unit3Title: "B1: السفر والآراء والقصص",
  unit3Desc: "محادثات طلقة وسرد التجارب السابقة ومشاركة الأفكار.",
  unit4Title: "B2: الحوار المهني والنقاش",
  unit4Desc: "التعبير عن وجهات النظر والاجتماعات ومفاهيم العمل.",
  unit5Title: "C1/C2: البلاغة والفصاحة والأمثال",
  unit5Desc: "فهم المعاني الضمنية، الأمثال التراثية والأسلوب الأكاديمي.",
  startLessonPrompt: "انقر للبدء في هذا الدرس.",
  completedBadge: "اكتمل بنجاح",
  lockedLessonNotice: "يجب إكمال الدروس السابقة أولاً.",
  crownLevel: "مستوى التاج",

  speechLabTitle: "مختبر النطق والتحدث المباشر",
  speechLabSubtitle: "استمع إلى النطق الأصيل وتحدث بصوتك لقياس الدقة في الوقت الفعلي.",
  scenarioCafe: "في المقهى",
  scenarioCafeDesc: "طلب المشروبات وطلب الحساب بأدب.",
  scenarioFriends: "لقاء الأصدقاء",
  scenarioFriendsDesc: "التعارف والحديث الودي العفوي.",
  scenarioDirections: "السؤال عن الطريق",
  scenarioDirectionsDesc: "الوصول إلى المحطة والملاحة في المدينة.",
  scenarioDining: "تناول الطعام في مطعم",
  scenarioDiningDesc: "حجز الطاولة واختيار الأطباق المفضلة.",
  scenarioMarket: "في السوق",
  scenarioMarketDesc: "السؤال عن الأسعار والتسوق الممتع.",
  scenarioEmergency: "المواقف الطارئة",
  scenarioEmergencyDesc: "عبارات النجدة والمساعدة الضرورية.",
  listenToNative: "استمع للمتحدث الأصلي",
  pressToSpeak: "اضغط على الميكروفون وتحدث",
  listening: "جارٍ الاستماع...",
  pronunciationScore: "درجة النطق",
  excellentPronunciation: "نطق استثنائي! نبرة طبيعية ودقيقة.",
  needsPractice: "محاولة جيدة! استمع مجدداً وركّز على مخارج الحروف.",
  repeatPhrase: "إعادة الاستماع",
  nextSentence: "الجملة التالية",

  vaultTitle: "خزينة التكرار المتباعد FSRS",
  vaultSubtitle: "نظام علمي لتثبيت المفردات اللغوية في الذاكرة طويلة المدى.",
  clickToFlip: "انقر لقلب البطاقة ومعرفة المعنى",
  howWellDidYouKnow: "ما مدى تذكرك لهذه الكلمة؟",
  ratingAgain: "إعادة",
  ratingHard: "صعب",
  ratingGood: "جيد",
  ratingEasy: "سهل",
  totalCards: "إجمالي البطاقات",
  dueToday: "المستحق للمراجعة اليوم",
  retentionRate: "معدل الحفظ والاحتفاظ",

  grammarTitle: "دليل القواعد وبناء الجمل",
  grammarSubtitle: "شرح مبسط، قواعد واضحة وأمثلة واقعية مستخدمة يومياً.",
  ruleCasesTitle: "الإعراب والحالات الإعرابية",
  ruleCasesDesc: "وظائف الكلمات وحركاتها داخل التركيب اللغوي.",
  ruleVerbsTitle: "تصريف الأفعال",
  ruleVerbsDesc: "الأزمنة والضمائر وقواعد التصريف المنتظم وغير المنتظم.",
  rulePastTenseTitle: "الزمن الماضي",
  rulePastTenseDesc: "التعبير عن الأحداث المكتملة والرواية.",
  ruleParticiplesTitle: "أسماء الفاعل والمفعول",
  ruleParticiplesDesc: "صياغة جمل متقدمة وبليغة.",
  ruleParticlesTitle: "الأدوات وحروف المعاني",
  ruleParticlesDesc: "الأدوات التي تمنح الجملة سلاسة وفهماً دقيقاً.",
  exampleSentence: "مثال تطبيقي:",
  grammarFormula: "قاعدة التركيب:",
  checkYourUnderstanding: "اختبر فهمك",

  speedTestTitle: "اختبار الطلاقة اللغوية",
  speedTestSubtitle: "قياس الفهم السريع والاستجابة الطبيعية في هدوء.",
  untimedNotice: "أجب بارتياح: الدقة هي الأهم دائماً.",
  questionOf: "سؤال",
  completedDrillCongratulations: "أحسنت! أتممت جميع أسئلة الاختبار.",
  claimXpAndGems: "استلام المكافأة (+60 XP، +25 جوهرة)",

  placementTestTitle: "اختبار تحديد المستوى القياسي (10 أسئلة)",
  placementTestSubtitle: "تحديد دقيق لمستواك اللغوي من A1 إلى C2.",
  variantLabel: "النموذج",
  selectVariant: "اختر النموذج (A أو B أو C أو D)",
  questionLabel: "السؤال",
  skillEvaluated: "المهارة المستهدفة",
  cefrEvaluationNotice: "يقيس كل سؤال كفاءتك وفق الإطار الأوروبي المرجعي المشترك اللغات.",
  levelMustBeEarned: "يتم فتح المستويات بناءً على نتيجة الاختبار الفعلي لضمان التعلم الفعّال.",
  takeTestNow: "ابدأ اختبار تحديد المستوى الآن",
  unlockedLevelResult: "المستوى المكتسب",

  navFocus: "محطة التركيز",
  navAITutor: "المعلم الذكي",

  whyPromptTitle: "لماذا ترغب في تعلم هذه اللغة؟",
  whyPromptSubtitle: "يصمم الذكاء الاصطناعي مسار الدروس والمفردات بناءً على هدفك وطموحك الشخصي.",
  intentBusiness: "الأعمال والمفاوضات المهنية",
  intentTravel: "السفر والتنقل واستكشاف الثقافة",
  intentAcademic: "البحث الأكاديمي والخطاب العلمي",
  intentConversational: "الطلاقة الحوارية والتواصل الاجتماعي",
  intentCulture: "الأدب والتراث الثقافي الأصيل",
  changeGoal: "تغيير الهدف",
  tailoredFor: "مخصص لهدف:",

  focusTitle: "محطة التركيز الذهني وموجات ألفا 432Hz",
  focusSubtitle: "ترددات ثنائية وموجات دماغية تحفز الذاكرة الحيوية والاستيعاب اللغوي العميق.",
  startSoundwave: "تشغيل موجات التركيز",
  stopSoundwave: "إيقاف الموجات",
  soundwaveActive: "موجات التركيز نشطة الآن",
  frequencyControl: "التردد الصوتي (هرتز)",
  volumeControl: "مستوى الصوت",
  focusPresets: "أنماط التركيز المتاحة",
  presetAlpha: "432Hz موجات ألفا (الاستيعاب النشط)",
  presetTheta: "528Hz موجات ثيتا (ترسيخ الذاكرة)",
  presetGamma: "40Hz موجات غاما (التركيز الحاد)",
  presetPinkNoise: "الضوضاء الوردية (عزل التشتت الذهني)",

  proMonthlyTitle: "Pro شهري",
  proMonthlyPrice: "4.99$ / شهرياً",
  proAnnualTitle: "إتقان Pro السنوي",
  proAnnualPrice: "39.99$ / سنوياً",
  mostPopularBadge: "الأكثر اختياراً",
  billedAnnuallyNotice: "فاتورة سنوية بقيمة 39.99$ (ما يعادل 3.33$ شهرياً)"
};

export function getI18n(nativeCode: string = 'en'): TranslationDictionary {
  const code = (nativeCode || 'en').toLowerCase().trim().split(/[-_]/)[0];
  if (code === 'nl') {
    return DUTCH_TRANSLATIONS;
  }
  if (code === 'es') {
    return SPANISH_TRANSLATIONS;
  }
  if (code === 'fr') {
    return FRENCH_TRANSLATIONS;
  }
  if (code === 'de') {
    return GERMAN_TRANSLATIONS;
  }
  if (code === 'it') {
    return ITALIAN_TRANSLATIONS;
  }
  if (code === 'ru') {
    return RUSSIAN_TRANSLATIONS;
  }
  if (code === 'ar') {
    return ARABIC_TRANSLATIONS;
  }
  return ENGLISH_FALLBACK_TRANSLATIONS;
}
