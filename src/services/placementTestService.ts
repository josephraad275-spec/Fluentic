import { CefrLevel } from '../types';
import { AICurriculumEngine } from './aiCurriculumService';
import { WORLD_LANGUAGES } from '../data/languages';
import { getCuratedPlacementQuestions } from './curatedPlacementTests';

export interface PlacementQuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text?: string;
  text_native?: string;
  text_translation?: string;
}

export interface PlacementTestQuestion {
  id: number;
  level: string; // 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  target_skill: string;
  instruction?: string;
  prompt?: string;
  prompt_native?: string;
  prompt_translation?: string;
  options: PlacementQuestionOption[];
  correct_key: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  explanation_native?: string;
  explanation_translation?: string;
  audioText?: string;
}

export interface PlacementTestVariant {
  language: string;
  languageCode: string;
  variant: 'A' | 'B' | 'C' | 'D';
  questions: PlacementTestQuestion[];
}

export class PlacementAssessmentEngine {
  // Synchronous cache populated by dynamic engine
  private static synchronousTestCache = new Map<string, PlacementTestVariant>();

  /**
   * Get 10-question placement test for any target language and variant.
   * Delivers authentic, logically sound questions with zero overlapping text or spoiler translations.
   */
  public static getPlacementTest(
    targetLanguageCode: string,
    targetLanguageName: string,
    variant: 'A' | 'B' | 'C' | 'D' = 'A',
    nativeLanguageCode: string = 'en'
  ): PlacementTestVariant {
    const cacheKey = `${targetLanguageCode}_${nativeLanguageCode}_${variant}`;
    if (this.synchronousTestCache.has(cacheKey)) {
      return this.synchronousTestCache.get(cacheKey)!;
    }

    // Get curated, linguistically authentic 10-question test
    const curated = getCuratedPlacementQuestions(
      targetLanguageCode,
      targetLanguageName,
      nativeLanguageCode,
      variant
    );

    // Normalize questions to guarantee both new and legacy fields are present
    const normalizedQuestions: PlacementTestQuestion[] = curated.map((q) => {
      const prompt = q.prompt || q.prompt_native || targetLanguageName;
      const instruction = q.instruction || q.prompt_translation || `Vraag over ${targetLanguageName}`;
      const explanation = q.explanation || q.explanation_translation || '';

      return {
        ...q,
        prompt,
        instruction,
        prompt_native: prompt,
        prompt_translation: instruction,
        explanation,
        explanation_translation: explanation,
        options: q.options.map((opt) => ({
          key: opt.key,
          text: opt.text || opt.text_native || '',
          text_native: opt.text_native || opt.text || '',
          text_translation: opt.text_translation || opt.text || '',
        }))
      };
    });

    // Programmatically scramble multiple-choice answer positions (A, B, C, D) using a true randomization/shuffle
    // Guarantees correct answers are distributed across all positions and never default to A or B
    const scrambledQuestions = this.scrambleQuestionOptions(normalizedQuestions);

    const testVariant: PlacementTestVariant = {
      language: targetLanguageName,
      languageCode: targetLanguageCode,
      variant,
      questions: scrambledQuestions
    };

    this.synchronousTestCache.set(cacheKey, testVariant);
    return testVariant;
  }

  public static clearTestCache(): void {
    this.synchronousTestCache.clear();
  }

  /**
   * True Fisher-Yates randomization of multiple-choice positions with even distribution across A, B, C, D
   */
  public static scrambleQuestionOptions(questions: PlacementTestQuestion[]): PlacementTestQuestion[] {
    const keys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    
    // Balanced target positions across 10 questions ensuring non-skewed distribution across C, D, B, A
    const targetKeyDistribution: ('A' | 'B' | 'C' | 'D')[] = ['C', 'D', 'B', 'A', 'C', 'D', 'A', 'B', 'D', 'C'];
    
    // True shuffle of the distribution targets
    for (let i = targetKeyDistribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targetKeyDistribution[i], targetKeyDistribution[j]] = [targetKeyDistribution[j], targetKeyDistribution[i]];
    }

    return questions.map((q, qIndex) => {
      // Locate the authentic correct option
      const originalCorrect = q.options.find((opt) => opt.key === q.correct_key) || q.options[0];
      const distractors = q.options.filter((opt) => opt !== originalCorrect);

      // Shuffle distractors
      for (let i = distractors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
      }

      // Assign the target correct key from the balanced distribution
      const targetCorrectKey = targetKeyDistribution[qIndex % targetKeyDistribution.length];
      const targetCorrectIndex = keys.indexOf(targetCorrectKey);

      // Reassemble options with refreshed keys
      const shuffledOptions: PlacementQuestionOption[] = [];
      let distractorIdx = 0;

      for (let i = 0; i < 4; i++) {
        const key = keys[i];
        if (i === targetCorrectIndex) {
          shuffledOptions.push({
            ...originalCorrect,
            key,
          });
        } else {
          const dist = distractors[distractorIdx++] || originalCorrect;
          shuffledOptions.push({
            ...dist,
            key,
          });
        }
      }

      return {
        ...q,
        options: shuffledOptions,
        correct_key: targetCorrectKey,
      };
    });
  }

  private static buildUniversalQuestions(
    code: string,
    name: string,
    nativeCode: string
  ): PlacementTestQuestion[] {
    const isDutch = nativeCode === 'nl';
    const lang = WORLD_LANGUAGES.find((l) => l.code === code);
    const greeting = lang?.sampleGreeting || `Hello (${name})`;

    const levels = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'C3+'];
    const skills = isDutch ? [
      'Begroetingen & Basis',
      'Eten & Bestellen',
      'Vervoer & Reizen',
      'Persoonlijke Kennismaking',
      'Dienstregeling & Tijd',
      'Herkomst & Biografie',
      'Formele Transacties',
      'Ruimtelijke Routebeschrijving',
      'Waarde & Prijs',
      'Gevorderde Idiomatiek'
    ] : [
      'Greetings & Foundations',
      'Dining & Ordering',
      'Wayfinding & Travel',
      'Personal Introduction',
      'Timetables & Time',
      'Origins & Biography',
      'Formal Transactions',
      'Spatial Directions',
      'Valuation & Price',
      'Advanced Idiomatic Fluency'
    ];

    return levels.map((lvl, idx) => ({
      id: idx + 1,
      level: lvl,
      target_skill: skills[idx] || `Skill ${idx + 1}`,
      prompt_native: idx === 0 ? greeting : `${name} — Level ${lvl} expression`,
      prompt_translation: isDutch ? `Kies de juiste betekenis of vorm in het ${name}` : `Choose the correct meaning or form in ${name}`,
      options: [
        { key: 'A', text_native: idx === 0 ? greeting : `Option A (${name})`, text_translation: isDutch ? 'Correcte betekenis' : 'Correct meaning' },
        { key: 'B', text_native: `Option B (${name})`, text_translation: isDutch ? 'Alternatief B' : 'Alternative B' },
        { key: 'C', text_native: `Option C (${name})`, text_translation: isDutch ? 'Alternatief C' : 'Alternative C' },
        { key: 'D', text_native: `Option D (${name})`, text_translation: isDutch ? 'Alternatief D' : 'Alternative D' },
      ],
      correct_key: 'A',
      explanation_translation: isDutch ? 'Dit is de accurate constructie binnen het ERK-kader.' : 'This is the accurate construction within the CEFR framework.'
    }));
  }

  /**
   * Group questions by CEFR tier for dynamic adaptive routing
   */
  public static getAdaptivePlacementBank(
    targetLanguageCode: string,
    targetLanguageName: string,
    nativeLanguageCode: string = 'en',
    variant: 'A' | 'B' | 'C' | 'D' = 'A'
  ): Record<CefrLevel, PlacementTestQuestion[]> {
    const test = this.getPlacementTest(targetLanguageCode, targetLanguageName, variant, nativeLanguageCode);
    const bank: Record<CefrLevel, PlacementTestQuestion[]> = {
      A1: [],
      A2: [],
      A3: [],
      B1: [],
      B2: [],
      B3: [],
      C1: [],
      C2: [],
      C3: []
    };

    for (const q of test.questions) {
      const lvl = (q.level || 'A1').toUpperCase() as CefrLevel;
      if (bank[lvl]) {
        bank[lvl].push(q);
      } else {
        bank['A1'].push(q);
      }
    }

    return bank;
  }

  /**
   * Computes CEFR placement based on adaptive/standard performance
   * Produces an official diagnostic score: e.g. "Verified Level: B1 - Intermediate"
   * Without academic grammar jargon or meta-linguistic terminology.
   */
  public static calculateCefrPlacement(
    score: number,
    nativeCode: string = 'en',
    assessedTier?: CefrLevel
  ): {
    level: CefrLevel;
    score: number;
    officialScoreText: string;
    competencyLabel: string;
    unlockedLevels: CefrLevel[];
    diagnosis: string;
  } {
    let level: CefrLevel = 'A1';
    let unlockedLevels: CefrLevel[] = ['A1'];
    let diagnosis = '';
    let competencyLabel = '';
    let officialScoreText = '';
    const isDutch = nativeCode === 'nl';
    const isArabic = nativeCode === 'ar';

    // If an adaptive tier was directly evaluated
    if (assessedTier) {
      level = assessedTier;
    } else {
      if (score >= 10) level = 'C2';
      else if (score >= 8) level = 'C1';
      else if (score >= 6) level = 'B2';
      else if (score >= 4) level = 'B1';
      else if (score >= 2) level = 'A2';
      else level = 'A1';
    }

    switch (level) {
      case 'C2':
        unlockedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        competencyLabel = isArabic ? 'الإتقان التام والطلاقة الفطرية' : isDutch ? 'Volledige Beheersing (Mastery)' : 'Mastery & Native Nuance';
        officialScoreText = isArabic ? 'المستوى المعتمد: C2 - إتقان متقدم وبلاغة كاملة' : isDutch ? 'Geverifieerd Niveau: C2 - Vloeiende Beheersing' : 'Verified Level: C2 - Mastery';
        diagnosis = isArabic
          ? 'تستوعب بسلاسة البلاغة الأكاديمية العميقة، النثر الأدبي الرفيع، والنقاشات الفلسفية المعقدة دون أي تردد.'
          : isDutch
          ? 'Je begrijpt moeiteloos subtiele humor, culturele spreekwoorden, diepgaande gesprekken en complexe beeldspraak in elke alledaagse context.'
          : 'You effortlessly comprehend subtle humor, cultural proverbs, in-depth discussion, and practical idiomatic nuance in any everyday situation.';
        break;
      case 'C1':
        unlockedLevels = ['A1', 'A2', 'B1', 'B2', 'C1'];
        competencyLabel = isArabic ? 'مستوى متقدم مهني وأكاديمي' : isDutch ? 'Vergevorderd (Advanced)' : 'Advanced Professional';
        officialScoreText = isArabic ? 'المستوى المعتمد: C1 - متقدم احترافي' : isDutch ? 'Geverifieerd Niveau: C1 - Gevorderd' : 'Verified Level: C1 - Advanced';
        diagnosis = isArabic
          ? 'تتواصل بطلاقة ومرونة في السياقات المهنية والأكاديمية والاجتماعية المعقدة مع قدرة عالية على التعبير المجرد.'
          : isDutch
          ? 'Je communiceert spontaan en effectief over complexe werksituaties, sociale afspraken, gedetailleerde plannen en genuanceerde standpunten.'
          : 'You express ideas fluently and flexibly in social, academic, and workplace situations without awkward hesitation.';
        break;
      case 'B2':
        unlockedLevels = ['A1', 'A2', 'B1', 'B2'];
        competencyLabel = isArabic ? 'مستقل متقدم (فوق المتوسط)' : isDutch ? 'Zelfstandig Gevorderd (Upper Intermediate)' : 'Upper Intermediate';
        officialScoreText = isArabic ? 'المستوى المعتمد: B2 - مستقل متقدم' : isDutch ? 'Geverifieerd Niveau: B2 - Gevorderd Zelfstandig' : 'Verified Level: B2 - Upper Intermediate';
        diagnosis = isArabic
          ? 'تشارك بفاعلية في النقاشات الحيوية، وتعلل آراءك ووجهات نظرك بوضوح، وتتفاعل بارتياح مع المتحدثين الأصليين.'
          : isDutch
          ? 'Je kunt deelnemen aan levendige discussies, meningen beargumenteren, advies geven en vlot communiceren met moedertaalsprekers.'
          : 'You can actively participate in conversations, share opinions, explain viewpoints, and interact with native speakers with a high degree of spontaneity.';
        break;
      case 'B1':
        unlockedLevels = ['A1', 'A2', 'B1'];
        competencyLabel = isArabic ? 'مستقل متوسط' : isDutch ? 'Zelfstandig Drempel (Intermediate)' : 'Intermediate';
        officialScoreText = isArabic ? 'المستوى المعتمد: B1 - مستقل متوسط' : isDutch ? 'Geverifieerd Niveau: B1 - Zelfstandig' : 'Verified Level: B1 - Intermediate';
        diagnosis = isArabic
          ? 'تتعامل بنجاح مع معظم مواقف السفر، وتصف التجارب والأحداث والخطط بدقة، وتفهم النقاط الأساسية في الأحاديث اليومية.'
          : isDutch
          ? 'Je redt je uitstekend in reissituaties, vertelt over eerdere ervaringen en plannen, en begrijpt de hoofdlijnen van duidelijke dagelijkse gesprekken.'
          : 'You can handle most travel situations, describe experiences, events, dreams, and hopes, and follow the main points of everyday conversations.';
        break;
      case 'A2':
        unlockedLevels = ['A1', 'A2'];
        competencyLabel = isArabic ? 'مستخدم أساسي (فوق المبتدئ)' : isDutch ? 'Basisgebruiker (Elementary)' : 'Elementary';
        officialScoreText = isArabic ? 'المستوى المعتمد: A2 - أساسي' : isDutch ? 'Geverifieerd Niveau: A2 - Basisgebruiker' : 'Verified Level: A2 - Elementary';
        diagnosis = isArabic
          ? 'تفهم الجمل والتعابير المرتبطة بالاحتياجات اليومية مثل طلب الاتجاهات والتسوق والمطاعم والحديث عن الروتين اليومي.'
          : isDutch
          ? 'Je begrijpt zinnen over directe behoeften zoals de weg vragen, boodschappen doen, cafés bezoeken en eenvoudige dagelijkse gewoonten beschrijven.'
          : 'You can navigate essential everyday tasks, ask for directions, shop, order food, and converse about simple and routine matters.';
        break;
      case 'A1':
      default:
        unlockedLevels = ['A1'];
        competencyLabel = isArabic ? 'مبتدئ تأسيسي' : isDutch ? 'Beginner (Breakthrough)' : 'Beginner';
        officialScoreText = isArabic ? 'المستوى المعتمد: A1 - مبتدئ' : isDutch ? 'Geverifieerd Niveau: A1 - Beginner' : 'Verified Level: A1 - Beginner';
        diagnosis = isArabic
          ? 'ستبني أساسك اللغوي عبر العبارات الحيوية، التحيات، قواعد النطق الأصيلة، والكلمات اليومية الأكثر استخداماً.'
          : isDutch
          ? 'Je start bij de essentiële overlevingsfrasen, begroetingen, beleefde beleefdheidsvormen en de basisklanken van de taal.'
          : 'You will build your foundation with essential survival phrases, warm greetings, polite interactions, and core everyday sounds.';
        break;
    }

    return {
      level,
      score,
      officialScoreText,
      competencyLabel,
      unlockedLevels,
      diagnosis
    };
  }
}

