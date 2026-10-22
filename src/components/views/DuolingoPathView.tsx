import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  CheckCircle2,
  Lock, 
  Star, 
  Crown, 
  Flame,
  Briefcase,
  Plane,
  GraduationCap,
  MessageCircle,
  Landmark,
  Target,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { LearningNode, UserProfile, Language, CefrLevel } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';
import { getI18n } from '../../services/localization';
import { WORLD_LANGUAGES } from '../../data/languages';

interface DuolingoPathViewProps {
  user: UserProfile;
  activeLanguage: Language;
  onSelectNode: (node: LearningNode) => void;
  onClaimMilestone?: (gems: number) => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export interface PathUnit {
  id: string;
  unitNumber: number;
  title: string;
  subhead: string;
  themeColor: string;
  accentBg: string;
  minCefr: CefrLevel;
  nodes: LearningNode[];
  milestoneGems: number;
}

// Fisher-Yates Scrambler: Ensures correct answers are never statically stuck at index 0 or position A
export function shuffleOptions<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate rich, progressive step-by-step units with authentic native scripts for any language
export function getDuolingoUnits(
  language: Language, 
  nativeCode: string = 'en', 
  activeCefr: CefrLevel = 'A1',
  userIntent: 'business' | 'travel' | 'academic' | 'conversational' | 'culture' = 'conversational'
): PathUnit[] {
  const isDutch = nativeCode === 'nl';
  const isArabic = nativeCode === 'ar';
  const name = language.name;
  const greeting = language.sampleGreeting || 'Hello';
  const t = (ar: string, nl: string, en: string) => isArabic ? ar : isDutch ? nl : en;

  // Specific high-frequency native words and phrases per language
  const languageLexicon: Record<string, {
    alphabetTitle: string;
    vowelsNodeTitle: string;
    greetingsNodeTitle: string;
    cafeUnitTitle: string;
    coffeePhrase: string;
    waterPhrase: string;
    billPhrase: string;
    directionsUnitTitle: string;
    stationPhrase: string;
    rightPhrase: string;
    socialUnitTitle: string;
    friendPhrase: string;
    goodbyePhrase: string;
  }> = {
    ar: {
      alphabetTitle: 'الأبجدية العربية والأصوات',
      vowelsNodeTitle: 'الحركات والحروف (أ، ب، ت)',
      greetingsNodeTitle: 'التحيات والتعارف',
      cafeUnitTitle: 'في المقهى والمطعم',
      coffeePhrase: 'قهوة واحدة، من فضلك.',
      waterPhrase: 'ماء، من فضلك.',
      billPhrase: 'الحساب، لو سمحت.',
      directionsUnitTitle: 'الاتجاهات والتنقل',
      stationPhrase: 'أين محطة القطار؟',
      rightPhrase: 'إلى اليمين',
      socialUnitTitle: 'المحادثة والضيافة',
      friendPhrase: 'أهلًا وسهلًا بك!',
      goodbyePhrase: 'مع السلامة!'
    },
    ja: {
      alphabetTitle: 'ひらがな・カタカナと発音',
      vowelsNodeTitle: '母音と基本音 (あ・い・う・え・お)',
      greetingsNodeTitle: '基本の挨拶とマナー',
      cafeUnitTitle: '喫茶店と注文',
      coffeePhrase: 'コーヒーを一つ、お願いします。',
      waterPhrase: 'お水をください。',
      billPhrase: 'お会計をお願いします。',
      directionsUnitTitle: '道案内と駅',
      stationPhrase: '駅はどこですか？',
      rightPhrase: '右に曲がります',
      socialUnitTitle: '日常会話と友達',
      friendPhrase: 'お会いできて嬉しいです。',
      goodbyePhrase: 'さようなら、また会いましょう！'
    },
    zh: {
      alphabetTitle: '汉语拼音与声调',
      vowelsNodeTitle: '声母与韵母 (a, o, e)',
      greetingsNodeTitle: '基础问候与礼貌',
      cafeUnitTitle: '咖啡厅与点餐',
      coffeePhrase: '请给我一杯咖啡。',
      waterPhrase: '请给我一杯水。',
      billPhrase: '请结账，谢谢。',
      directionsUnitTitle: '问路与交通',
      stationPhrase: '请问火车站怎么走？',
      rightPhrase: '向右拐',
      socialUnitTitle: '社交日常对话',
      friendPhrase: '很高兴认识你！',
      goodbyePhrase: '再见，祝你顺心！'
    },
    ru: {
      alphabetTitle: 'Русский алфавит и фонетика',
      vowelsNodeTitle: 'Гласные и согласные звуки',
      greetingsNodeTitle: 'Приветствия и этикет',
      cafeUnitTitle: 'В уютном кафе',
      coffeePhrase: 'Один кофе, пожалуйста.',
      waterPhrase: 'Воду, пожалуйста.',
      billPhrase: 'Счёт, пожалуйста.',
      directionsUnitTitle: 'Ориентирование в городе',
      stationPhrase: 'Где находится вокзал?',
      rightPhrase: 'Направо',
      socialUnitTitle: 'Дружеское общение',
      friendPhrase: 'Очень приятно познакомиться!',
      goodbyePhrase: 'До свидания, всего хорошего!'
    },
    de: {
      alphabetTitle: 'Deutsches Alphabet & Aussprache',
      vowelsNodeTitle: 'Umlaute & Diphtonge (ä, ö, ü)',
      greetingsNodeTitle: 'Höfliche Begrüßungen',
      cafeUnitTitle: 'Im Café & Bäckerei',
      coffeePhrase: 'Einen Kaffee, bitte.',
      waterPhrase: 'Ein Mineralwasser, bitte.',
      billPhrase: 'Die Rechnung, bitte.',
      directionsUnitTitle: 'Wegbeschreibung in der Stadt',
      stationPhrase: 'Wo ist der Hauptbahnhof?',
      rightPhrase: 'Nach rechts',
      socialUnitTitle: 'Soziales & Bekanntschaften',
      friendPhrase: 'Freut mich sehr, Sie kennenzulernen!',
      goodbyePhrase: 'Auf Wiedersehen, bis bald!'
    },
    fr: {
      alphabetTitle: 'Alphabet Français & Phonétique',
      vowelsNodeTitle: 'Voyelles nasales et accents',
      greetingsNodeTitle: 'Salutations et politesse',
      cafeUnitTitle: 'Au Bistro & Café',
      coffeePhrase: 'Un café, s\'il vous plaît.',
      waterPhrase: 'De l\'eau, s\'il vous plaît.',
      billPhrase: 'L\'addition, s\'il vous plaît.',
      directionsUnitTitle: 'Orientation dans la Ville',
      stationPhrase: 'Où se trouve la gare ?',
      rightPhrase: 'À droite',
      socialUnitTitle: 'Vie Sociale & Rencontres',
      friendPhrase: 'Enchanté de faire votre connaissance !',
      goodbyePhrase: 'Au revoir et à bientôt !'
    },
    es: {
      alphabetTitle: 'Alfabeto Español y Fonética',
      vowelsNodeTitle: 'Vocales puras y sonidos (ñ, ll)',
      greetingsNodeTitle: 'Saludos y Cortesía',
      cafeUnitTitle: 'En la Cafetería y Tapas',
      coffeePhrase: 'Un café solo, por favor.',
      waterPhrase: 'Un vaso de agua, por favor.',
      billPhrase: 'La cuenta, por favor.',
      directionsUnitTitle: 'Direcciones en la Ciudad',
      stationPhrase: '¿Dónde está la estación?',
      rightPhrase: 'A la derecha',
      socialUnitTitle: 'Charla Social y Amigos',
      friendPhrase: '¡Mucho gusto en conocerte!',
      goodbyePhrase: '¡Hasta luego, que te vaya bien!'
    },
    it: {
      alphabetTitle: 'Alfabeto Italiano e Fonetica',
      vowelsNodeTitle: 'Vocali pure e suoni doppi',
      greetingsNodeTitle: 'Saluti e Convenevoli',
      cafeUnitTitle: 'Al Bar Italiano',
      coffeePhrase: 'Un espresso, per favore.',
      waterPhrase: 'Un bicchiere d\'acqua, per favore.',
      billPhrase: 'Il conto, per favore.',
      directionsUnitTitle: 'Orientamento in Città',
      stationPhrase: 'Dov\'è la stazione ferroviaria?',
      rightPhrase: 'A destra',
      socialUnitTitle: 'Amicizia e Vita Sociale',
      friendPhrase: 'Molto piacere di conoscerti!',
      goodbyePhrase: 'Arrivederci, a presto!'
    },
    lt: {
      alphabetTitle: 'Lietuvių abėcėlė ir balsiai',
      vowelsNodeTitle: 'Nosinių balsių tarimas (ą, ę, į, ų)',
      greetingsNodeTitle: 'Pasisveikinimai ir etiketas',
      cafeUnitTitle: 'Kavinėje ir restorane',
      coffeePhrase: 'Vieną kavą, prašau.',
      waterPhrase: 'Vandens, prašau.',
      billPhrase: 'Sąskaitą, prašau.',
      directionsUnitTitle: 'Miesto navigacija',
      stationPhrase: 'Kur yra geležinkelio stotis?',
      rightPhrase: 'Į dešinę',
      socialUnitTitle: 'Bendravimas ir draugystė',
      friendPhrase: 'Labai malonu susipažinti!',
      goodbyePhrase: 'Viso gero, iki pasimatymo!'
    },
    nl: {
      alphabetTitle: 'Nederlands Alfabet & Klanken',
      vowelsNodeTitle: 'Tweeklanken (ij, ui, eu, oe)',
      greetingsNodeTitle: 'Begroetingen & Kennismaking',
      cafeUnitTitle: 'In het Café & Terras',
      coffeePhrase: 'Een koffie, alstublieft.',
      waterPhrase: 'Een glas water, alstublieft.',
      billPhrase: 'Mag ik de rekening, alstublieft?',
      directionsUnitTitle: 'De Weg Vragen in de Stad',
      stationPhrase: 'Waar is het treinstation?',
      rightPhrase: 'Naar rechts',
      socialUnitTitle: 'Gezelligheid & Gesprek',
      friendPhrase: 'Leuk om je te ontmoeten!',
      goodbyePhrase: 'Tot ziens, fijne dag!'
    },
    pt: {
      alphabetTitle: 'Alfabeto Português & Sons',
      vowelsNodeTitle: 'Vogais nasais e acentuação (ã, õ, ç)',
      greetingsNodeTitle: 'Saudações e Cortesia',
      cafeUnitTitle: 'No Café e Pastelaria',
      coffeePhrase: 'Um café, por favor.',
      waterPhrase: 'Um copo de água, por favor.',
      billPhrase: 'A conta, por favor.',
      directionsUnitTitle: 'Direções na Cidade',
      stationPhrase: 'Onde fica a estação?',
      rightPhrase: 'À direita',
      socialUnitTitle: 'Conversação e Amigos',
      friendPhrase: 'Muito prazer em conhecê-lo!',
      goodbyePhrase: 'Até logo, um bom dia!'
    },
    ko: {
      alphabetTitle: '한글 자모음과 발음 체계',
      vowelsNodeTitle: '기본 모음과 자음',
      greetingsNodeTitle: '기본 인사와 예절',
      cafeUnitTitle: '카페에서 주문하기',
      coffeePhrase: '커피 한 잔 주세요.',
      waterPhrase: '물 좀 주세요.',
      billPhrase: '계산서 부탁드립니다.',
      directionsUnitTitle: '길 찾기와 교통',
      stationPhrase: '기차역이 어디에 있나요?',
      rightPhrase: '오른쪽으로 가세요',
      socialUnitTitle: '일상 대화와 친구 사귀기',
      friendPhrase: '만나서 정말 반갑습니다!',
      goodbyePhrase: '안녕히 가세요, 또 만나요!'
    },
    hi: {
      alphabetTitle: 'हिन्दी वर्णमाला और ध्वनियाँ',
      vowelsNodeTitle: 'स्वर और व्यंजन (अ, आ, इ, ई)',
      greetingsNodeTitle: 'सादर अभिवादन और शिष्टाचार',
      cafeUnitTitle: 'कैफ़े और खान-पान',
      coffeePhrase: 'कृपया एक कॉफ़ी दीजिए।',
      waterPhrase: 'कृपया पानी दीजिए।',
      billPhrase: 'कृपया बिल लाइए।',
      directionsUnitTitle: 'दिशाएँ और मार्ग',
      stationPhrase: 'रेलवे स्टेशन कहाँ है?',
      rightPhrase: 'दाहिनी ओर मुड़िए',
      socialUnitTitle: 'सामाजिक संवाद और मित्रता',
      friendPhrase: 'आपसे मिलकर बहुत प्रसन्नता हुई!',
      goodbyePhrase: 'अलविदा, फिर मिलेंगे!'
    },
    tr: {
      alphabetTitle: 'Türk Alfabesi ve Telaffuz',
      vowelsNodeTitle: 'Ünlüler ve Yumuşak G (ç, ğ, ı, ö, ş, ü)',
      greetingsNodeTitle: 'Temel Selamlaşma ve Nezaket',
      cafeUnitTitle: 'Kafede Sipariş',
      coffeePhrase: 'Bir kahve lütfen.',
      waterPhrase: 'Bir bardak su lütfen.',
      billPhrase: 'Hesap lütfen.',
      directionsUnitTitle: 'Şehirde Yön Tarifi',
      stationPhrase: 'Tren istasyonu nerede?',
      rightPhrase: 'Sağa dönün',
      socialUnitTitle: 'Günlük Sohbet ve Tanışma',
      friendPhrase: 'Tanıştığımıza çok memnun oldum!',
      goodbyePhrase: 'Hoşça kalın, görüşmek üzere!'
    },
    pl: {
      alphabetTitle: 'Polski Alfabet i Wymowa',
      vowelsNodeTitle: 'Samogłoski nosowe i dwuznaki (ą, ę, sz, cz)',
      greetingsNodeTitle: 'Powitania i Zwroty Grzecznościowe',
      cafeUnitTitle: 'W Kawiarni i Restauracji',
      coffeePhrase: 'Poproszę jedną kawę.',
      waterPhrase: 'Poproszę wodę.',
      billPhrase: 'Rachunek poproszę.',
      directionsUnitTitle: 'Wskazówki Dojazdu',
      stationPhrase: 'Gdzie jest dworzec kolejowy?',
      rightPhrase: 'W prawo',
      socialUnitTitle: 'Rozmowa i Nowi Znajomi',
      friendPhrase: 'Bardzo miło cię poznać!',
      goodbyePhrase: 'Do widzenia, miłego dnia!'
    }
  };

  const lex = languageLexicon[language.code] || {
    alphabetTitle: `${name} Script & Sounds`,
    vowelsNodeTitle: `Pure Vowels & Alphabet`,
    greetingsNodeTitle: `Essential Greetings`,
    cafeUnitTitle: `At the Cafe & Essentials`,
    coffeePhrase: `${greeting} - Coffee, please.`,
    waterPhrase: `Water, please.`,
    billPhrase: `The bill, please.`,
    directionsUnitTitle: `Transit & Navigation`,
    stationPhrase: `Where is the station?`,
    rightPhrase: `To the right`,
    socialUnitTitle: `Conversations & Phrases`,
    friendPhrase: `Pleased to meet you!`,
    goodbyePhrase: `Goodbye!`
  };

  // Apply Fisher-Yates Scrambler to all multiple-choice exercise option arrays
  // so correct answer indexes are programmatically scrambled and never stuck at position A or B
  const scrambleUnitOptions = (unitList: PathUnit[]): PathUnit[] => {
    return unitList.map((unit) => ({
      ...unit,
      nodes: unit.nodes.map((node) => ({
        ...node,
        exercises: node.exercises.map((ex) => {
          if (ex.type === 'multiple-choice' && ex.options && ex.options.length > 1) {
            return {
              ...ex,
              options: shuffleOptions(ex.options),
            };
          }
          return ex;
        }),
      })),
    }));
  };

  // ========================================================
  // STRICT CEFR LEVEL OVERRIDES (C2, C1, B2, B1, A2)
  // ========================================================

  // C2 Level Override: 100% advanced rhetoric, philosophy, literary prose, zero A1 content
  if (activeCefr === 'C2' || activeCefr === 'C3') {
    return scrambleUnitOptions([
      {
        id: 'unit-c2-1',
        unitNumber: 1,
        title: isArabic
          ? 'الوحدة 1 - C2: النثر الأدبي الرفيع، البلاغة الأكاديمية والخطاب الرسمي'
          : isDutch 
          ? 'Unit 1 - C2: Gevorderd Literair Proza, Academische Retoriek & Formeel Debat' 
          : 'Unit 1 - C2: Advanced Literary Prose, Academic Rhetoric & Formal Discourse',
        subhead: isArabic
          ? 'التركيب الجدلي، التحليل الهيرمينوطيقي للنصوص، وصيغ المناظرات الدبلوماسية الرسمية'
          : isDutch 
          ? 'Dialectische synthese, hermeneutische tekstanalyse en parlementaire debatformules' 
          : 'Dialectical synthesis, hermeneutic deconstruction, and parliamentary formal discourse',
        themeColor: 'from-amber-600 via-rose-700 to-indigo-900',
        accentBg: 'bg-amber-50 text-amber-950 border-amber-300',
        minCefr: 'C2',
        milestoneGems: 100,
        nodes: [
          {
            id: 'c2-academic-rhetoric',
            title: isArabic ? 'البلاغة الأكاديمية والتركيب الجدلي' : isDutch ? 'Academische Retoriek & Synthese' : 'Academic Rhetoric & Dialectical Synthesis',
            nativeTitle: isArabic ? 'التركيب الجدلي' : isDutch ? 'Dialectische Synthese' : 'Dialectical Synthesis',
            category: 'Advanced Mastery',
            cefr: 'C2',
            description: isArabic
              ? 'إتقان الصياغة الأكاديمية المتقدمة ودمج الحجج النظرية المتناقضة في خطاب فصيح.'
              : isDutch 
              ? 'Beheers academische synthese van antithetische premissen in formele betogen.' 
              : 'Synthesize antithetical theoretical arguments into cohesive formal academic rhetoric.',
            xpReward: 120,
            gemReward: 30,
            targetDurationMinutes: 7,
            iconName: 'Crown',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c2-rhetoric-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Welke formulering drukt een strenge dialectische synthese uit in formeel academisch discours?' 
                  : 'Which formulation articulates rigorous dialectical synthesis in formal academic debate?',
                targetPhrase: isDutch 
                  ? 'Het overstijgen van antithetische posities via epistemische integratie' 
                  : 'Synthesizing antithetical propositions through epistemic integration',
                translation: isDutch ? 'Dialectische synthese van tegenstellingen' : 'Overcoming thesis and antithesis via synthesis',
                options: [
                  isDutch ? 'Het overstijgen van antithetische posities via epistemische integratie' : 'Synthesizing antithetical propositions through epistemic integration',
                  isDutch ? 'Een eenvoudige opsomming van alledaagse observaties' : 'A basic chronological sequence of casual observations',
                  isDutch ? 'Oppervlakkige samenvatting zonder methodologische falsificatie' : 'Superficial textual recap lacking falsifiable criteria',
                  isDutch ? 'Het herhalen van gevestigde aannames zonder kritische distantie' : 'Uncritical reiteration of standard premises'
                ],
                correctAnswer: isDutch 
                  ? 'Het overstijgen van antithetische posities via epistemische integratie' 
                  : 'Synthesizing antithetical propositions through epistemic integration',
                culturalNote: isDutch ? 'Hoogste academische register voor proefschriften en beleidsstukken.' : 'Benchmark of doctoral-level academic discourse and policy formulation.',
                exampleSentence: 'La superación dialéctica de ambas premisas permite formular un nuevo paradigma epistémico.',
                exampleTranslation: 'The dialectical synthesis of both premises gives rise to a novel epistemic paradigm.'
              }
            ]
          },
          {
            id: 'c2-literary-prose',
            title: isDutch ? 'Literair Proza & Stijlfiguren' : 'Literary Prose & Stylistic Nuance',
            nativeTitle: isDutch ? 'Hermeneutisch Proza' : 'Hermeneutic Stylistics',
            category: 'Advanced Mastery',
            cefr: 'C2',
            description: isDutch 
              ? 'Ontleed complexe literaire allegorieën, impliciete betekenissen en stilistische inversies.' 
              : 'Interpret layered literary allegories, implicit subtext, and classical stylistic inversions.',
            xpReward: 125,
            gemReward: 32,
            targetDurationMinutes: 8,
            iconName: 'BookOpen',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c2-prose-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Hoe duidt men een diepe existentiële allegorie in klassiek literair proza?' 
                  : 'How is deep existential allegory deconstructed in high-register literary prose?',
                targetPhrase: isDutch 
                  ? 'De onderliggende metafoor weerspiegelt de vergankelijkheid van menselijke ambities' 
                  : 'The underlying metaphor mirrors the transient fragility of human ambition',
                translation: isDutch ? 'Literaire diepte-analyse' : 'Subtle literary thematic analysis',
                options: [
                  isDutch ? 'De onderliggende metafoor weerspiegelt de vergankelijkheid van menselijke ambities' : 'The underlying metaphor mirrors the transient fragility of human ambition',
                  isDutch ? 'De auteur beschrijft slechts het weerpatroon' : 'The author is merely describing meteorological conditions',
                  isDutch ? 'Een alledaagse reisbeschrijving zonder dubbele bodem' : 'A literal travel narrative devoid of allegorical resonance',
                  isDutch ? 'Een standaard grammaticaal voorschrift' : 'A standard instructional grammar convention'
                ],
                correctAnswer: isDutch 
                  ? 'De onderliggende metafoor weerspiegelt de vergankelijkheid van menselijke ambities' 
                  : 'The underlying metaphor mirrors the transient fragility of human ambition',
                exampleSentence: 'Bajo el manto otoñal palpitaba el eco mudo de una ambición ya extinguida.',
                exampleTranslation: 'Beneath the autumnal shroud pulsed the muted echo of an extinguished ambition.'
              }
            ]
          },
          {
            id: 'c2-formal-debate',
            title: isDutch ? 'Parlementair & Diplomatiek Debat' : 'Parliamentary & Diplomatic Registers',
            nativeTitle: isDutch ? 'Diplomatieke Concessie' : 'Diplomatic Concession',
            category: 'Advanced Mastery',
            cefr: 'C2',
            description: isDutch 
              ? 'Hanteer diplomatieke concessies, hoffelijke afwijzingen en soevereine verdragsregisters.' 
              : 'Deploy diplomatic concessions, polite deferrals, and formal treaty discourse with precision.',
            xpReward: 130,
            gemReward: 35,
            targetDurationMinutes: 8,
            iconName: 'Award',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c2-debate-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Welke clausule luidt een hoog-diplomatieke concessie in tijdens multilaterale beraadslagingen?' 
                  : 'Which clause initiates an elevated diplomatic concession during multilateral deliberations?',
                targetPhrase: isDutch 
                  ? 'Niettegenstaande de gegronde bedenkingen van de geachte delegatie' 
                  : 'Notwithstanding the justifiable reservations expressed by the honorable delegation',
                translation: isDutch ? 'Diplomatieke hoffelijkheidsconcessie' : 'High-register diplomatic concession formula',
                options: [
                  isDutch ? 'Niettegenstaande de gegronde bedenkingen van de geachte delegatie' : 'Notwithstanding the justifiable reservations expressed by the honorable delegation',
                  isDutch ? 'Ik ben het er eigenlijk helemaal niet mee eens' : 'I basically completely disagree with you',
                  isDutch ? 'Laten we er later nog eens over praten bij de lunch' : 'Let us perhaps mention this over lunch later',
                  isDutch ? 'Dat standpunt is categorisch onjuist' : 'That stance is simply incorrect and wrong'
                ],
                correctAnswer: isDutch 
                  ? 'Niettegenstaande de gegronde bedenkingen van de geachte delegatie' 
                  : 'Notwithstanding the justifiable reservations expressed by the honorable delegation',
                culturalNote: isDutch ? 'Cruciaal voor verdragonderhandelingen bij de Verenigde Naties en diplomatieke ambassades.' : 'Integral to high-level ambassadorial protocol and treaty negotiations.',
                exampleSentence: 'No obstante las fundadas reservas de la delegación, procedemos con espíritu de concordia.',
                exampleTranslation: 'Notwithstanding the delegation’s reservations, we proceed in a spirit of consensus.'
              }
            ]
          }
        ]
      },
      {
        id: 'unit-c2-2',
        unitNumber: 2,
        title: isDutch 
          ? 'Unit 2 - C2: Dialectische Filosofie & Epistemisch Redeneren' 
          : 'Unit 2 - C2: Dialectical Philosophy & Epistemic Reasoning',
        subhead: isDutch 
          ? 'Kritische deconstructie van filosofische premissen en epistemologische waarheidscriteria' 
          : 'Critical deconstruction of philosophical theses and epistemic truth criteria',
        themeColor: 'from-indigo-800 to-slate-900',
        accentBg: 'bg-indigo-50 text-indigo-950 border-indigo-200',
        minCefr: 'C2',
        milestoneGems: 120,
        nodes: [
          {
            id: 'c2-epistemic',
            title: isDutch ? 'Epistemische Falsificatie & Deductie' : 'Epistemic Falsification & Deduction',
            nativeTitle: isDutch ? 'Epistemologie' : 'Epistemic Rigor',
            category: 'Advanced Mastery',
            cefr: 'C2',
            description: isDutch 
              ? 'Examineer theoretische aannames aan de hand van deductieve bewijsvoering.' 
              : 'Examine theoretical assertions against rigorous deductive standards of proof.',
            xpReward: 135,
            gemReward: 35,
            targetDurationMinutes: 8,
            iconName: 'Sparkles',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c2-epist-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Wat betekent "epistemische falsificatie" in academische theorievorming?' 
                  : 'What signifies "epistemic falsification" within academic theory formation?',
                targetPhrase: isDutch 
                  ? 'Het systematisch weerleggen van hypothesen door tegenbewijs' 
                  : 'The systematic refutation of hypotheses through empirical counter-evidence',
                translation: isDutch ? 'Wetenschappelijke weerlegging' : 'Methodological refutation',
                options: [
                  isDutch ? 'Het systematisch weerleggen van hypothesen door tegenbewijs' : 'The systematic refutation of hypotheses through empirical counter-evidence',
                  isDutch ? 'Het klakkeloos aannemen van een stelling' : 'Accepting an unproven assumption as axiomatic truth',
                  isDutch ? 'Een taalkundige vertaling van documenten' : 'Translating documentary text without critique',
                  isDutch ? 'Een retorische truc zonder inhoudelijke relevantie' : 'A rhetorical flourish devoid of analytical substance'
                ],
                correctAnswer: isDutch 
                  ? 'Het systematisch weerleggen van hypothesen door tegenbewijs' 
                  : 'The systematic refutation of hypotheses through empirical counter-evidence'
              }
            ]
          }
        ]
      },
      {
        id: 'unit-c2-3',
        unitNumber: 3,
        title: isDutch 
          ? 'Unit 3 - C2: Hoge Diplomatieke Registers & Subtiele Ironie' 
          : 'Unit 3 - C2: High Diplomatic Register, Irony & Subtext',
        subhead: isDutch 
          ? 'Ambassadeursniveau diplomatiek discours, onderkoelde ironie en pragmatische subtekst' 
          : 'Ambassadorial diplomatic discourse, understated irony, and pragmatic subtext',
        themeColor: 'from-purple-800 to-indigo-950',
        accentBg: 'bg-purple-50 text-purple-950 border-purple-200',
        minCefr: 'C2',
        milestoneGems: 140,
        nodes: [
          {
            id: 'c2-subtext',
            title: isDutch ? 'Onderkoelde Ironie & Pragmatiek' : 'Understated Irony & Pragmatic Nuance',
            nativeTitle: isDutch ? 'Pragmatische Subtekst' : 'Pragmatic Subtext',
            category: 'Advanced Mastery',
            cefr: 'C2',
            description: isDutch 
              ? 'Herken en produceer diplomatieke ironie zonder de formele etiquette te doorbreken.' 
              : 'Recognize and employ understated irony without breaching formal diplomatic decorum.',
            xpReward: 140,
            gemReward: 40,
            targetDurationMinutes: 8,
            iconName: 'Crown',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c2-sub-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Wanneer een diplomaat stelt dat een voorstel "buitengewoon moedig" is, wat is de impliciete subtekst?' 
                  : 'When an envoy characterizes a proposed measure as "unusually courageous", what is the pragmatic subtext?',
                targetPhrase: isDutch 
                  ? 'Het voorstel houdt buitensporige en onaanvaardbare risico’s in' 
                  : 'The initiative carries unacceptably hazardous political liabilities',
                translation: isDutch ? 'Diplomatieke waarschuwing' : 'Diplomatic subtextual warning',
                options: [
                  isDutch ? 'Het voorstel houdt buitensporige en onaanvaardbare risico’s in' : 'The initiative carries unacceptably hazardous political liabilities',
                  isDutch ? 'De diplomaat bewondert de morele dapperheid oprecht' : 'The envoy is expressing genuine personal heroism admiration',
                  isDutch ? 'Het document moet ongewijzigd goedgekeurd worden' : 'The measure should be signed immediately without amendment',
                  isDutch ? 'Er is geen enkele twijfel over het succes' : 'There is zero reservation regarding guaranteed success'
                ],
                correctAnswer: isDutch 
                  ? 'Het voorstel houdt buitensporige en onaanvaardbare risico’s in' 
                  : 'The initiative carries unacceptably hazardous political liabilities'
              }
            ]
          }
        ]
      },
      {
        id: 'unit-c2-4',
        unitNumber: 4,
        title: isDutch 
          ? 'Unit 4 - C2: Klassiek Cultureel Erfgoed & Syntactische Inversie' 
          : 'Unit 4 - C2: Classical Heritage Idioms & Archaic Syntactic Inversion',
        subhead: isDutch 
          ? 'Volledige moedertaalbeheersing van klassiek idioom, archaïsche inversies en spreekwoorden' 
          : 'Complete native-level command of classical idioms, archaic inversions, and cultural heritage',
        themeColor: 'from-rose-900 to-amber-900',
        accentBg: 'bg-rose-50 text-rose-950 border-rose-200',
        minCefr: 'C2',
        milestoneGems: 150,
        nodes: [
          {
            id: 'c2-heritage-idioms',
            title: isDutch ? 'Klassieke Moedertaalspreekwoorden' : 'Classical Idioms & Heritage Proverbs',
            nativeTitle: isDutch ? 'Culturele Meesterschap' : 'Heritage Idiomatic Mastery',
            category: 'Advanced Mastery',
            cefr: 'C2',
            description: isDutch 
              ? 'Integreer klassieke spreekwoorden met moeiteloze moedertaalvloeiendheid.' 
              : 'Seamlessly interweave classical heritage idioms with native-level fluency.',
            xpReward: 150,
            gemReward: 45,
            targetDurationMinutes: 8,
            iconName: 'Award',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c2-herit-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Wat drukt het klassieke gezegde "de teerling is geworpen" uit in historische analyses?' 
                  : 'What does the classical idiom "alea iacta est" (the die is cast) signify in historical analysis?',
                targetPhrase: isDutch 
                  ? 'Een onherroepelijke beslissing waarvan de uitkomst definitief vaststaat' 
                  : 'An irrevocable commitment from which there is no turning back',
                translation: isDutch ? 'Onomkeerbare beslissing' : 'Irrevocable commitment',
                options: [
                  isDutch ? 'Een onherroepelijke beslissing waarvan de uitkomst definitief vaststaat' : 'An irrevocable commitment from which there is no turning back',
                  isDutch ? 'Een toevallige worp in een kansspel' : 'A frivolous roll of game dice in recreation',
                  isDutch ? 'Het uitstellen van een stemming' : 'Deferring a vote until subsequent sessions',
                  isDutch ? 'Een voorzichtige diplomatieke verkenning' : 'A cautious non-binding preliminary query'
                ],
                correctAnswer: isDutch 
                  ? 'Een onherroepelijke beslissing waarvan de uitkomst definitief vaststaat' 
                  : 'An irrevocable commitment from which there is no turning back'
              }
            ]
          }
        ]
      }
    ]);
  }

  // C1 Level Override: 100% complex syntax, debate registers, subjunctive, zero A1 content
  if (activeCefr === 'C1') {
    return scrambleUnitOptions([
      {
        id: 'unit-c1-1',
        unitNumber: 1,
        title: isArabic
          ? 'الوحدة 1 - C1: التراكيب المعقدة ومستويات المناظرة الرسمية'
          : isDutch 
          ? 'Unit 1 - C1: Complexe Syntaxis & Formele Debatregisters' 
          : 'Unit 1 - C1: Complex Syntax & Formal Debate Registers',
        subhead: isArabic
          ? 'الجمل المتداخلة المعقدة، الحجج المنطقية المهيكلة، والتماسك البلاغي المتقدم'
          : isDutch 
          ? 'Complexe zinsconstructies, formele betogen en genuanceerde argumentatieve structuren' 
          : 'Complex syntactic nesting, structured formal argumentation, and discursive cohesion',
        themeColor: 'from-indigo-600 via-blue-700 to-indigo-900',
        accentBg: 'bg-blue-50 text-blue-950 border-blue-200',
        minCefr: 'C1',
        milestoneGems: 80,
        nodes: [
          {
            id: 'c1-complex-syntax',
            title: isArabic ? 'التراكيب المتداخلة والتوازن النحوي' : isDutch ? 'Complexe Zinsconstructies & Onderschatting' : 'Complex Nested Clauses & Syntactic Balance',
            nativeTitle: isArabic ? 'البناء النحوي' : isDutch ? 'Syntactische Balans' : 'Syntactic Architecture',
            category: 'Advanced Mastery',
            cefr: 'C1',
            description: isArabic
              ? 'بناء جمل متعددة الطبقات مع توافق تام في الأزمنة والروابط المنطقية.'
              : isDutch 
              ? 'Bouw gelaagde bijzinnen met perfecte afstemming van tijden en modi.' 
              : 'Construct layered multi-clause periods with flawless sequence of tenses and modal agreement.',
            xpReward: 95,
            gemReward: 25,
            targetDurationMinutes: 6,
            iconName: 'Crown',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c1-syn-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Welke zinsstructuur demonstreert correcte C1-niveau onderschikking en modaliteit?' 
                  : 'Which sentence structure exemplifies correct C1-level hypothetical subordination and modal cohesion?',
                targetPhrase: isDutch 
                  ? 'Had de raad tijdig geanticipeerd, dan zou deze crisis afgewend zijn' 
                  : 'Had the council anticipated developments in a timely manner, this crisis would have been averted',
                translation: isDutch ? 'Hypothetische inversie in de verleden tijd' : 'Counterfactual inversion conditional',
                options: [
                  isDutch ? 'Had de raad tijdig geanticipeerd, dan zou deze crisis afgewend zijn' : 'Had the council anticipated developments in a timely manner, this crisis would have been averted',
                  isDutch ? 'Als de raad oplet dan gaat het goed' : 'If the council watches out then things go fine',
                  isDutch ? 'De raad wist het niet en daarom ging het fout' : 'The council did not know so it simply failed',
                  isDutch ? 'Misschien is er een vergadering morgen' : 'Maybe there will be a meeting tomorrow'
                ],
                correctAnswer: isDutch 
                  ? 'Had de raad tijdig geanticipeerd, dan zou deze crisis afgewend zijn' 
                  : 'Had the council anticipated developments in a timely manner, this crisis would have been averted',
                culturalNote: isDutch ? 'Klassieke formele inversie ter vervanging van alledaagse voorwaardelijke zinnen.' : 'High-register conditional inversion replacing colloquial if-clauses.',
                exampleSentence: 'De haber intervenido oportunamente las autoridades, se habría mitigado el impacto financiero.',
                exampleTranslation: 'Had the authorities intervened in a timely manner, the financial disruption would have been mitigated.'
              }
            ]
          },
          {
            id: 'c1-debate-registers',
            title: isDutch ? 'Formele Debatregisters & Retorische Vragen' : 'Formal Debate Registers & Rhetorical Strategies',
            nativeTitle: isDutch ? 'Formele Retoriek' : 'Formal Rhetoric',
            category: 'Advanced Mastery',
            cefr: 'C1',
            description: isDutch 
              ? 'Verdedig standpunten met formele argumentatiemarkers en retorische synthese.' 
              : 'Defend thesis statements using formal argumentation markers and rhetorical transitions.',
            xpReward: 100,
            gemReward: 26,
            targetDurationMinutes: 7,
            iconName: 'Award',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c1-deb-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Welke transitionele frase leidt een sterk tegenargument in zonder confrontatie?' 
                  : 'Which transitional phrase introduces a cogent counter-argument diplomatically?',
                targetPhrase: isDutch 
                  ? 'Desalniettemin dwingt het empirische bewijs ons tot een heroverweging' 
                  : 'Nonetheless, the empirical evidence impels us to reconsider our initial hypothesis',
                translation: isDutch ? 'Formele argumentatieve overgang' : 'Formal argumentative transition marker',
                options: [
                  isDutch ? 'Desalniettemin dwingt het empirische bewijs ons tot een heroverweging' : 'Nonetheless, the empirical evidence impels us to reconsider our initial hypothesis',
                  isDutch ? 'Maar dat is gewoon niet waar' : 'But that is just totally untrue',
                  isDutch ? 'Ik vind van niet' : 'I just don’t think so',
                  isDutch ? 'Laten we stoppen met praten' : 'Let us stop discussing this now'
                ],
                correctAnswer: isDutch 
                  ? 'Desalniettemin dwingt het empirische bewijs ons tot een heroverweging' 
                  : 'Nonetheless, the empirical evidence impels us to reconsider our initial hypothesis'
              }
            ]
          }
        ]
      },
      {
        id: 'unit-c1-2',
        unitNumber: 2,
        title: isDutch 
          ? 'Unit 2 - C1: Conjunctief, Irreële Condities & Nuance' 
          : 'Unit 2 - C1: Subjunctive Nuance, Counterfactuals & Rhetoric',
        subhead: isDutch 
          ? 'Subjuntief meesterschap, hypothetische voorwaarden en epistemische modaliteit' 
          : 'Subjunctive mastery, hypothetical past conditions, and modal nuances',
        themeColor: 'from-violet-700 to-purple-900',
        accentBg: 'bg-violet-50 text-violet-950 border-violet-200',
        minCefr: 'C1',
        milestoneGems: 90,
        nodes: [
          {
            id: 'c1-counterfactual',
            title: isDutch ? 'Irreële Condities & Hypothetisch Redeneren' : 'Counterfactual Logic & Hypothetical Conditionals',
            nativeTitle: isDutch ? 'Irreële Condities' : 'Counterfactuals',
            category: 'Advanced Mastery',
            cefr: 'C1',
            description: isDutch 
              ? 'Hanteer complexe irreële voorwaarden in het verleden en heden.' 
              : 'Master unreal past and present counterfactual structures effortlessly.',
            xpReward: 105,
            gemReward: 28,
            targetDurationMinutes: 7,
            iconName: 'Sparkles',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c1-cf-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Wat drukt de irreële conditie in het verleden uit?' 
                  : 'What does the past counterfactual conditional communicate in formal analysis?',
                targetPhrase: isDutch 
                  ? 'Een gebeurtenis die in het verleden had kunnen plaatsvinden maar niet gerealiseerd is' 
                  : 'An outcome that was possible in hindsight but was never actualized',
                translation: isDutch ? 'Irreëel verleden' : 'Unreal past condition',
                options: [
                  isDutch ? 'Een gebeurtenis die in het verleden had kunnen plaatsvinden maar niet gerealiseerd is' : 'An outcome that was possible in hindsight but was never actualized',
                  isDutch ? 'Een vaste routine die elke dag plaatsvindt' : 'A recurring daily routine in the present',
                  isDutch ? 'Een zekere toekomstige voorspelling' : 'A guaranteed certainty in future time',
                  isDutch ? 'Een bevel aan een ondergeschikte' : 'An imperative command issued to a subordinate'
                ],
                correctAnswer: isDutch 
                  ? 'Een gebeurtenis die in het verleden had kunnen plaatsvinden maar niet gerealiseerd is' 
                  : 'An outcome that was possible in hindsight but was never actualized'
              }
            ]
          }
        ]
      },
      {
        id: 'unit-c1-3',
        unitNumber: 3,
        title: isDutch 
          ? 'Unit 3 - C1: Professionele Registers & Idiomatische Vloeiendheid' 
          : 'Unit 3 - C1: Professional Colloquialisms & Idiomatic Fluency',
        subhead: isDutch 
          ? 'Vergaderingen op directieniveau, strategische onderhandeling en idioom' 
          : 'Executive board-level negotiation and high-register idiomatic expressions',
        themeColor: 'from-emerald-700 to-teal-900',
        accentBg: 'bg-emerald-50 text-emerald-950 border-emerald-200',
        minCefr: 'C1',
        milestoneGems: 95,
        nodes: [
          {
            id: 'c1-executive',
            title: isDutch ? 'Directieniveau & Strategische Onderhandeling' : 'Executive Strategy & Strategic Framing',
            nativeTitle: isDutch ? 'Strategisch Kader' : 'Executive Framing',
            category: 'Professional',
            cefr: 'C1',
            description: isDutch 
              ? 'Formuleer strategische prioriteiten met zakelijke en diplomatieke verfijning.' 
              : 'Articulate corporate strategies and fiduciary priorities with institutional polish.',
            xpReward: 110,
            gemReward: 30,
            targetDurationMinutes: 7,
            iconName: 'Crown',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c1-exec-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Welke uitdrukking geeft strategische prioritering aan in een directieoverleg?' 
                  : 'Which phrase denotes strategic prioritization in an executive boardroom briefing?',
                targetPhrase: isDutch 
                  ? 'Dit strategische initiatief geniet absolute voorrang boven operationele details' 
                  : 'This strategic initiative takes precedence over subordinate operational considerations',
                translation: isDutch ? 'Strategische prioriteitstelling' : 'Executive strategic precedence',
                options: [
                  isDutch ? 'Dit strategische initiatief geniet absolute voorrang boven operationele details' : 'This strategic initiative takes precedence over subordinate operational considerations',
                  isDutch ? 'We kijken er morgen wel even naar' : 'We will glance at it tomorrow whenever',
                  isDutch ? 'Iedereen mag doen wat hij wil' : 'Everyone can proceed as they wish',
                  isDutch ? 'Het maakt eigenlijk niet zoveel uit' : 'It does not really matter too much'
                ],
                correctAnswer: isDutch 
                  ? 'Dit strategische initiatief geniet absolute voorrang boven operationele details' 
                  : 'This strategic initiative takes precedence over subordinate operational considerations'
              }
            ]
          }
        ]
      },
      {
        id: 'unit-c1-4',
        unitNumber: 4,
        title: isDutch 
          ? 'Unit 4 - C1: Tekstkritiek & Pragmatische Cohesie' 
          : 'Unit 4 - C1: Literary Criticism & Pragmatic Cohesion',
        subhead: isDutch 
          ? 'Analyse van redactionele essays, retorische overgangen en discourse markers' 
          : 'Discourse markers, cohesive ties, and editorial critical analysis',
        themeColor: 'from-pink-700 to-rose-900',
        accentBg: 'bg-pink-50 text-pink-950 border-pink-200',
        minCefr: 'C1',
        milestoneGems: 100,
        nodes: [
          {
            id: 'c1-discourse-markers',
            title: isDutch ? 'Discourse Connectoren & Cohesie' : 'Discourse Connectors & Rhetorical Transitions',
            nativeTitle: isDutch ? 'Discourse Cohesie' : 'Discursive Cohesion',
            category: 'Advanced Mastery',
            cefr: 'C1',
            description: isDutch 
              ? 'Verbind alinea’s en thema’s met natuurlijke, hoogstaande tekstuele scharnierpunten.' 
              : 'Interlink paragraphs and thematic threads with natural textual hinge markers.',
            xpReward: 115,
            gemReward: 30,
            targetDurationMinutes: 7,
            iconName: 'BookOpen',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-c1-disc-1',
                type: 'multiple-choice',
                prompt: isDutch 
                  ? 'Welke transitionele discourse connector duidt op een logische causale gevolgtrekking?' 
                  : 'Which cohesive discourse connector signals an inevitable analytical deduction?',
                targetPhrase: isDutch 
                  ? 'Bijgevolg kan men niet anders dan concluderen dat' 
                  : 'Consequently, one is led inescapably to deduce that',
                translation: isDutch ? 'Logische gevolgtrekking' : 'Formal deduction connector',
                options: [
                  isDutch ? 'Bijgevolg kan men niet anders dan concluderen dat' : 'Consequently, one is led inescapably to deduce that',
                  isDutch ? 'En daarom zeg ik maar zo' : 'And that is why I say so',
                  isDutch ? 'Nou ja, wie weet' : 'Well, who really knows',
                  isDutch ? 'Punt uit' : 'End of story'
                ],
                correctAnswer: isDutch 
                  ? 'Bijgevolg kan men niet anders dan concluderen dat' 
                  : 'Consequently, one is led inescapably to deduce that'
              }
            ]
          }
        ]
      }
    ]);
  }

  // ========================================================
  // INTENT-CALIBRATED CURRICULUM GENERATOR
  // Dynamic vocabulary, grammar, and dialogue scenarios based on user objective
  // ========================================================

  // 1. BUSINESS & NEGOTIATION INTENT
  if (userIntent === 'business') {
    return scrambleUnitOptions([
      {
        id: 'unit-biz-1',
        unitNumber: 1,
        title: t('الوحدة 1 - الأعمال: التحيات المهنية والمخاطبة الرسمية', 'Unit 1 - Zakelijk: Professionele Begroeting & Formele Etiquette', 'Unit 1 - Business: Executive Greetings & Professional Etiquette'),
        subhead: t('المخاطبة الرسمية، ألقاب الشركات، وآداب التعارف في بيئات الأعمال', 'Formele aanspreekvormen, zakelijke functietitels en executive etiquette', 'Formal executive address, corporate titles, and boardroom introduction etiquette'),
        themeColor: 'from-blue-600 to-indigo-700',
        accentBg: 'bg-blue-50 text-blue-900 border-blue-200',
        minCefr: 'A1',
        milestoneGems: 30,
        nodes: [
          {
            id: 'biz-greetings',
            title: t('البروتوكول المهني والتحية الرسمية', 'Zakelijk Protocol & Introductie', 'Executive Protocol & Greetings'),
            nativeTitle: lex.greetingsNodeTitle,
            category: 'Foundations',
            cefr: 'A1',
            description: t('تعلم صياغة التحيات الرسمية المناسبة للمدراء والشركاء التجاريين.', 'Beheers formele begroetingen voor directieleden en zakelijke partners.', 'Master formal greeting registers for executives and business partners.'),
            xpReward: 40,
            gemReward: 10,
            targetDurationMinutes: 3,
            iconName: 'Briefcase',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-biz-1',
                type: 'multiple-choice',
                prompt: t('كيف ترحب بشريك تجاري رسمي في اجتماع مجلس الإدارة؟', 'Hoe begroet je een zakelijke relatie formeel bij een directieoverleg?', 'How do you greet a commercial executive at a formal board meeting?'),
                targetPhrase: greeting,
                translation: t('أهلاً وسهلاً بحضرتكم / تحية طيبة', 'Goedendag, van harte welkom.', 'A cordial welcome / Good day.'),
                options: [greeting, lex.goodbyePhrase, lex.waterPhrase, lex.rightPhrase],
                correctAnswer: greeting,
                culturalNote: t('في الاجتماعات الرسمية، يُفضل دائماً الحفاظ على نبرة احتراميّة هادئة.', 'In formele vergaderingen is respectvolle en beheerste intonatie essentieel.', 'In formal commercial meetings, an earnest and poised greeting sets the tone.'),
                exampleSentence: `— ${greeting}`,
                exampleTranslation: 'A cordial welcome, esteemed colleagues.'
              }
            ]
          },
          {
            id: 'biz-scheduling',
            title: t('جدولة الاجتماعات والمواعيد التجارية', 'Agenda & Vergaderafspraken', 'Scheduling Corporate Meetings'),
            nativeTitle: t('المواعيد وجداول الأعمال', 'Agendaplanning & Kalender', 'Meeting Agendas & Timeframes'),
            category: 'Conversation',
            cefr: 'A2',
            description: t('تحديد مواعيد المؤتمرات، إدارة الأجندة، وتأكيد الاجتماعات المهنية.', 'Vergaderingen inplannen, agenda\'s coördineren en afspraken bevestigen.', 'Set meeting agendas, schedule quarterly reviews, and confirm appointments.'),
            xpReward: 50,
            gemReward: 12,
            targetDurationMinutes: 4,
            iconName: 'Clock',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-biz-2',
                type: 'multiple-choice',
                prompt: t('كيف تقترح تحديد موعد للاجتماع لمناقشة بنود المشروع؟', 'Hoe stel je een geschikt overlegmoment voor in de zakelijke planning?', 'How do you coordinate a suitable project sync meeting?'),
                targetPhrase: lex.billPhrase,
                translation: t('تأكيد الجدول الزمني والمراجعة', 'Bevestiging van de planning en termijnen.', 'Confirming the schedule and milestone review.'),
                options: [lex.billPhrase, lex.coffeePhrase, lex.stationPhrase, greeting],
                correctAnswer: lex.billPhrase,
                exampleSentence: `— ${lex.billPhrase}`,
                exampleTranslation: 'We propose synchronizing the executive review timeline.'
              }
            ]
          }
        ]
      },
      {
        id: 'unit-biz-2',
        unitNumber: 2,
        title: t('الوحدة 2 - الأعمال: التفاوض التجاري وهياكل الأسعار والعقود', 'Unit 2 - Zakelijk: Commerciële Onderhandelingen & Contractvoorwaarden', 'Unit 2 - Business: Commercial Negotiations, Pricing & Contracts'),
        subhead: t('شروط التعاقد، التفاوض على الخصومات، والاتفاقيات الملزمة قانونياً', 'Contractuele condities, prijsonderhandelingen en bindende overeenkomsten', 'Contractual clauses, volume pricing negotiations, and binding agreements'),
        themeColor: 'from-indigo-600 to-slate-900',
        accentBg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        minCefr: 'B1',
        milestoneGems: 45,
        nodes: [
          {
            id: 'biz-negotiation',
            title: t('المفاوضات المالية وشروط الدفع', 'Prijsonderhandeling & Betalingscondities', 'Financial Terms & Negotiations'),
            nativeTitle: t('العقود والشروط المالية', 'Financiële Voorwaarden & Contracten', 'Contracts & Payment Schedules'),
            category: 'Professional',
            cefr: 'B1',
            description: t('إدارة المفاوضات التجارية ومناقشة التكاليف وهوامش الربح.', 'Onderhandelen over tarieven, marges en contractuele betalingstermijnen.', 'Negotiate commercial rates, margins, and contractual deliverables.'),
            xpReward: 65,
            gemReward: 16,
            targetDurationMinutes: 5,
            iconName: 'Layers',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-biz-3',
                type: 'multiple-choice',
                prompt: t('كيف تطلب مسودة الفاتورة النهائية أو مراجعة الحساب المالي؟', 'Hoe vraag je formeel om de factuur en specificatie van de kosten?', 'How do you formally request the fiscal invoice breakdown?'),
                targetPhrase: lex.billPhrase,
                translation: t('طلب الفاتورة وتفاصيل الحساب المالي', 'De gespecificeerde rekening / factuur, alstublieft.', 'The itemized statement and fiscal bill, please.'),
                options: [lex.billPhrase, lex.coffeePhrase, lex.rightPhrase, lex.goodbyePhrase],
                correctAnswer: lex.billPhrase,
                culturalNote: t('في المعاملات المؤسسية، يُستخدم طلب الفاتورة الواضح لضمان الشفافية الضريبية.', 'In het zakenleven waarborgt een formele factuurvraag fiscale transparantie.', 'Ensures transparent compliance and fiscal record-keeping.'),
                exampleSentence: `— ${lex.billPhrase}`,
                exampleTranslation: 'Please furnish the fiscal invoice and finalized settlement.'
              }
            ]
          }
        ]
      }
    ]);
  }

  // 2. TRAVEL & NAVIGATION INTENT
  if (userIntent === 'travel') {
    return scrambleUnitOptions([
      {
        id: 'unit-trv-1',
        unitNumber: 1,
        title: t('الوحدة 1 - السفر: الوصول للمطار والملاحة والمواصلات', 'Unit 1 - Reizen: Luchthaven, Douane & Stadsnavigatie', 'Unit 1 - Travel: Airport Transit, Customs & City Navigation'),
        subhead: t('إنهاء إجراءات المطار، الجوازات، التوجيهات ومحطات القطار والحافلات', 'Luchthavenfaciliteiten, paspoortcontrole, perrons en stadsvervoer', 'Airport check-in, customs control, train platforms, and city transit directions'),
        themeColor: 'from-emerald-600 to-teal-700',
        accentBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        minCefr: 'A1',
        milestoneGems: 30,
        nodes: [
          {
            id: 'trv-airport',
            title: t('الوصول والتوجيهات ومحطات السفر', 'Luchthaven & Vervoersknooppunten', 'Airport Arrival & Transit Hubs'),
            nativeTitle: lex.directionsUnitTitle,
            category: 'Foundations',
            cefr: 'A1',
            description: t('السؤال عن بوابات الصعود، محطات القطار، ومسارات المترو.', 'Vraag naar vertrekpoorten, treinstations en metroverbindingen.', 'Locate boarding gates, transit hubs, and connecting railway platforms.'),
            xpReward: 40,
            gemReward: 10,
            targetDurationMinutes: 3,
            iconName: 'Compass',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-trv-1',
                type: 'multiple-choice',
                prompt: t('كيف تسأل عن موقع محطة القطار المركزية في المدينة؟', 'Hoe vraag je naar het centraal station in de stad?', 'How do you ask for the location of the central train station?'),
                targetPhrase: lex.stationPhrase,
                translation: t('أين محطة القطار، من فضلك؟', 'Waar is het station, alstublieft?', 'Where is the train station, please?'),
                options: [lex.stationPhrase, lex.rightPhrase, lex.waterPhrase, lex.billPhrase],
                correctAnswer: lex.stationPhrase,
                culturalNote: t('ابدأ دائماً بعبارة اعتذار لطيفة (عفواً / من فضلك) قبل السؤال في الشارع.', 'Open altijd met een beleefde attentievraag voordat je de weg vraagt.', 'Always preface directions questions with polite consideration.'),
                exampleSentence: `— Disculpe, ¿${lex.stationPhrase}?`,
                exampleTranslation: 'Excuse me, where is the railway station located?'
              },
              {
                id: 'ex-trv-2',
                type: 'multiple-choice',
                prompt: t('ماذا تعني إشارة التوجيه هذه عند الدوار أو المفترق؟', 'Wat betekent deze richtingsaanwijzing bij een kruising?', 'What does this directional indication signify at an intersection?'),
                targetPhrase: lex.rightPhrase,
                translation: t('إلى اليمين / انعطف يميناً', 'Naar rechts / Rechtsaf', 'To the right / Turn right'),
                options: [lex.rightPhrase, lex.stationPhrase, lex.coffeePhrase, greeting],
                correctAnswer: lex.rightPhrase,
                exampleSentence: `— ${lex.rightPhrase}`,
                exampleTranslation: 'Take the next corridor to the right.'
              }
            ]
          },
          {
            id: 'trv-dining',
            title: t('المطاعم والأسواق المحلية والضيافة', 'Lokale Eethuizen & Markten', 'Local Dining & Street Markets'),
            nativeTitle: lex.cafeUnitTitle,
            category: 'Conversation',
            cefr: 'A2',
            description: t('طلب الأطباق الشهية، المشروبات، ومحاسبة المطاعم والأسواق.', 'Bestel gerechten, vraag om water en reken eenvoudig af.', 'Order authentic cuisine, bottled water, and finalize cafe checks.'),
            xpReward: 45,
            gemReward: 12,
            targetDurationMinutes: 4,
            iconName: 'Coffee',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-trv-3',
                type: 'multiple-choice',
                prompt: t('كيف تطلب ماء الشرب بشكل عاجل أثناء السفر؟', 'Hoe vraag je dringend om drinkwater onderweg?', 'How do you politely request drinking water while traveling?'),
                targetPhrase: lex.waterPhrase,
                translation: t('ماء، من فضلك.', 'Water, alstublieft.', 'Water, please.'),
                options: [lex.waterPhrase, lex.billPhrase, lex.stationPhrase, greeting],
                correctAnswer: lex.waterPhrase,
                exampleSentence: `— ${lex.waterPhrase}`,
                exampleTranslation: 'A bottle of fresh drinking water, please.'
              },
              {
                id: 'ex-trv-4',
                type: 'multiple-choice',
                prompt: t('كيف تطلب الحساب في المطعم بعد تناول الوجبة؟', 'Hoe vraag je de ober om de rekening na de maaltijd?', 'How do you ask the server for the dining bill?'),
                targetPhrase: lex.billPhrase,
                translation: t('الحساب، لو سمحت.', 'De rekening, alstublieft.', 'The bill, please.'),
                options: [lex.billPhrase, lex.coffeePhrase, lex.stationPhrase, lex.goodbyePhrase],
                correctAnswer: lex.billPhrase,
                exampleSentence: `— ${lex.billPhrase}`,
                exampleTranslation: 'The bill, please, we are ready to settle.'
              }
            ]
          }
        ]
      }
    ]);
  }

  // 3. ACADEMIC & RESEARCH INTENT
  if (userIntent === 'academic') {
    return scrambleUnitOptions([
      {
        id: 'unit-acad-1',
        unitNumber: 1,
        title: t('الوحدة 1 - الأكاديمي: الخطاب العلمي، صياغة الفرضيات والنقد المنهجي', 'Unit 1 - Academisch: Wetenschappelijk Betoog, Hypothesen & Methodologie', 'Unit 1 - Academic: Scientific Discourse, Hypotheses & Methodology'),
        subhead: t('المصطلحات المنهجية، توثيق المصادر، صياغة الفرضيات والمناقشات الجامعية', 'Methodologische terminologie, bronverwijzingen en academisch debat', 'Epistemic terminology, bibliographic citations, and thesis formulation'),
        themeColor: 'from-purple-600 to-indigo-800',
        accentBg: 'bg-purple-50 text-purple-900 border-purple-200',
        minCefr: 'B1',
        milestoneGems: 40,
        nodes: [
          {
            id: 'acad-methodology',
            title: t('المنهجية العلمية والتحليل التجريبي', 'Wetenschappelijke Methodologie', 'Research Methodology & Evidence'),
            nativeTitle: t('المصطلحات المنهجية', 'Methodologische Kaders', 'Methodological Frameworks'),
            category: 'Advanced Mastery',
            cefr: 'B1',
            description: t('صياغة فرضيات البحث، التوثيق الأكاديمي، ومراجعة الدراسات السابقة.', 'Formuleer onderzoekshypotheses en analyseer peer-reviewed literatuur.', 'Formulate rigorous testable hypotheses and evaluate literature reviews.'),
            xpReward: 60,
            gemReward: 15,
            targetDurationMinutes: 5,
            iconName: 'GraduationCap',
            coordinates: { x: 0, y: 0 },
            exercises: [
              {
                id: 'ex-acad-1',
                type: 'multiple-choice',
                prompt: t('أي عبارة تدل على الاستنتاج المنطقي المستند إلى بيانات موثوقة؟', 'Welke formulering introduceert een empirisch onderbouwde conclusie?', 'Which phrase introduces a rigorous evidence-based conclusion?'),
                targetPhrase: t('بناءً على المعطيات التجريبية، نستنتج أن', 'Op basis van de empirische data concluderen wij dat', 'Based upon the empirical data, we conclude that'),
                translation: t('استنتاج مدعوم بالأدلة العلمية', 'Onderbouwde wetenschappelijke conclusie', 'Rigorous empirically grounded deduction'),
                options: [
                  t('بناءً على المعطيات التجريبية، نستنتج أن', 'Op basis van de empirische data concluderen wij dat', 'Based upon the empirical data, we conclude that'),
                  t('هذا مجرد رأي شخصي دون تدقيق', 'Dit is louter een persoonlijke indruk zonder verificatie', 'This is merely casual speculation without validation'),
                  t('أعتقد أن النتيجة سحرية تماماً', 'Ik gok dat de uitkomst toevallig klopt', 'I suppose results are purely coincidental'),
                  lex.waterPhrase
                ],
                correctAnswer: t('بناءً على المعطيات التجريبية، نستنتج أن', 'Op basis van de empirische data concluderen wij dat', 'Based upon the empirical data, we conclude that'),
                culturalNote: t('في الندوات العلمية، تجنب الجزم المطلق دون إيراد حدود العينة المنهجية.', 'In academische kringen vereist men altijd nuancering en methodologische verantwoording.', 'Scholarly discourse demands epistemological nuance and verifiable methodology.'),
                exampleSentence: 'A partir de los datos empíricos, concluimos que la correlación es estadísticamente significativa.',
                exampleTranslation: 'From empirical data, we conclude that correlation remains statistically significant.'
              }
            ]
          }
        ]
      }
    ]);
  }

  // 4. EVERYDAY CONVERSATIONAL FLUENCY (DEFAULT)
  return scrambleUnitOptions([
    // MODULE 1: CEFR A1 — Survival Phrases, Greetings & Food
    {
      id: 'unit-a1',
      unitNumber: 1,
      title: t(`A1: عبارات التعارف والتحيات اليومية`, `A1: Overlevingsfrasen & Begroetingen`, `A1: Survival Phrases & Essentials`),
      subhead: t(`التحيات الأساسية، آداب الحديث، والطعام والشراب في ${name}`, `Essentiële begroetingen, beleefdheid, eten en drinken in het ${name}`, `Survival phrases, greetings, essential food, and emergency vocabulary in ${name}`),
      themeColor: 'from-emerald-500 to-teal-600',
      accentBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      minCefr: 'A1',
      milestoneGems: 25,
      nodes: [
        {
          id: 'a1-alphabet',
          title: t('ميكانيكا الحروف والأصوات', 'Schriftmechanica & Alfabet', 'Script Mechanics & Alphabet'),
          nativeTitle: lex.alphabetTitle,
          category: 'Foundations',
          cefr: 'A1',
          description: t(`إتقان أشكال الحروف الأصيلة والقواعد الصوتية في ${name}.`, `Leer de authentieke lettertekens, open klinkers en foneemregels van het ${name}.`, `Master authentic letterforms, open vowels, and phonetic rules in ${name}.`),
          xpReward: 30,
          gemReward: 8,
          targetDurationMinutes: 3,
          iconName: 'BookOpen',
          coordinates: { x: 0, y: 0 },
          exercises: [
            {
              id: 'ex-a1-alpha',
              type: 'multiple-choice',
              prompt: t(`ما الذي يمثل الأساس الصوتي والرسمي للغة ${name}؟`, `Wat vormt het fundament van het schrift en de klankregels van het ${name}?`, `What constitutes the foundational sound rules and script of ${name}?`),
              targetPhrase: lex.vowelsNodeTitle,
              translation: t('قواعد النطق، الصوائت ومخارج الحروف', 'Klankregels, klinkers en lettergrepen', 'Phonetic rules, vowels and script mechanics'),
              options: [
                lex.vowelsNodeTitle,
                t('الجدل الأكاديمي المجرد', 'Abstracte academische argumentatie', 'Abstract academic discourse'),
                t('التراكيب البلاغية المعقدة', 'Complexe syntactische inversie', 'Complex syntactic inversion'),
                t('أفعال الماضي الشرطية', 'Verleden tijd conjunctieven', 'Past tense conjunctives')
              ],
              correctAnswer: lex.vowelsNodeTitle,
              culturalNote: t('إتقان مخارج الأصوات الأصلية يمنع تكون أخطاء النطق الدائمة.', 'Het beheersen van de klankregels voorkomt vroege fossiliseringsfouten.', 'Mastering native script rules establishes perfect phonetic muscle memory.'),
              exampleSentence: `— ${lex.vowelsNodeTitle}`,
              exampleTranslation: 'Native phonetic and orthographic foundation.'
            }
          ]
        },
        {
          id: 'a1-greetings',
          title: t('التحيات وآداب اللياقة', 'Begroetingen & Beleefdheid', 'Greetings & Courtesy'),
          nativeTitle: lex.greetingsNodeTitle,
          category: 'Foundations',
          cefr: 'A1',
          description: t(`تعلم التحيات الدافئة وصيغ الوداع المهذبة في ${name}.`, `Leer warme begroetingen en afscheid nemen in het ${name}.`, `Master foundational greetings and polite expressions in ${name}.`),
          xpReward: 35,
          gemReward: 8,
          targetDurationMinutes: 3,
          iconName: 'Sparkles',
          coordinates: { x: 0, y: 0 },
          exercises: [
            {
              id: 'ex-a1-1',
              type: 'multiple-choice',
              prompt: t(`كيف تلقي التحية بلباقة على شخص ما بـ ${name}؟`, `Hoe begroet je iemand vriendelijk in het ${name}?`, `How do you greet someone in ${name}?`),
              targetPhrase: greeting,
              translation: t('مرحباً / يومك سعيد', 'Hallo / Goedendag', 'Hello / Good day'),
              options: [greeting, lex.goodbyePhrase, lex.billPhrase, lex.rightPhrase],
              correctAnswer: greeting,
              culturalNote: t('التحية المبتسمة تفتح أبواب التواصل الودود في كل الثقافات.', 'Standaard vriendelijke begroeting.', 'Universal friendly greeting for all occasions.'),
              exampleSentence: `— ${greeting}`,
              exampleTranslation: 'Hello! How are you doing today?'
            },
            {
              id: 'ex-a1-2',
              type: 'sentence-scramble',
              prompt: t('رتب كلمات عبارة الوداع الرسمية:', 'Bouw de beleefde afscheidsgroet:', 'Assemble the polite farewell:'),
              targetPhrase: lex.goodbyePhrase,
              translation: t('مع السلامة / إلى اللقاء', 'Tot ziens / Het ga je goed', 'Goodbye / See you again'),
              correctAnswer: lex.goodbyePhrase,
              scrambledWords: lex.goodbyePhrase.split(/\s+/).filter(Boolean),
              exampleSentence: `— ${lex.goodbyePhrase}`,
              exampleTranslation: 'Goodbye, have a wonderful day!'
            }
          ]
        },
        {
          id: 'a1-food',
          title: t('المقاهي، المشروبات والطلب', 'Eten, Drankjes & Bestellen', 'Food, Drinks & Ordering'),
          nativeTitle: lex.cafeUnitTitle,
          category: 'Conversation',
          cefr: 'A1',
          description: t('طلب المشروبات وسؤال النادل عن الحساب في المقاهي.', 'Bestel drankjes en vraag om de rekening in cafés.', 'Order food and beverages confidently in daily life.'),
          xpReward: 40,
          gemReward: 10,
          targetDurationMinutes: 4,
          iconName: 'Coffee',
          coordinates: { x: 0, y: 0 },
          exercises: [
            {
              id: 'ex-a1-3',
              type: 'multiple-choice',
              prompt: t(`كيف تطلب فنجان قهوة بـ ${name}؟`, `Hoe bestel je koffie in het ${name}?`, `How do you order coffee in ${name}?`),
              targetPhrase: lex.coffeePhrase,
              translation: t('قهوة واحدة، من فضلك.', 'Een koffie, alstublieft.', 'A coffee, please.'),
              options: [lex.coffeePhrase, lex.waterPhrase, lex.billPhrase, lex.stationPhrase],
              correctAnswer: lex.coffeePhrase,
              culturalNote: t('إضافة "من فضلك" دائماً تدل على الاحترام والذوق الرفيع.', 'Voeg altijd "alstublieft" toe voor beleefdheid.', 'Always append "please" for courteous dining etiquette.'),
              exampleSentence: `— ${lex.coffeePhrase}`,
              exampleTranslation: 'One fresh coffee, please.'
            },
            {
              id: 'ex-a1-4',
              type: 'listening-comprehension',
              prompt: t('استمع واختر ما يطلبه الزبون في المقهى:', 'Luister en kies wat de klant vraagt:', 'Listen and choose what is being requested:'),
              targetPhrase: lex.billPhrase,
              translation: t('الحساب، لو سمحت.', 'De rekening, alstublieft.', 'The bill, please.'),
              options: [lex.billPhrase, lex.waterPhrase, lex.coffeePhrase, greeting],
              correctAnswer: lex.billPhrase,
              exampleSentence: `— ${lex.billPhrase}`,
              exampleTranslation: 'The check, please, we are ready to pay.'
            }
          ]
        },
        {
          id: 'a1-emergency',
          title: t('المساعدة والحالات الطارئة', 'Hulp & Noodgevallen', 'Emergency & Survival Help'),
          nativeTitle: t('المساعدة والكلمات الضرورية', 'Hulp & Noodzakelijke Woorden', 'Emergency Assistance'),
          category: 'Foundations',
          cefr: 'A1',
          description: t('طلب المساعدة وفهم عبارات النجدة والماء.', 'Vraag om hulp en begrijp noodzakelijke overlevingszinnen.', 'Ask for assistance in urgent or emergency situations.'),
          xpReward: 45,
          gemReward: 12,
          targetDurationMinutes: 3,
          iconName: 'ShieldAlert',
          coordinates: { x: 0, y: 0 },
          exercises: [
            {
              id: 'ex-a1-5',
              type: 'multiple-choice',
              prompt: t('كيف تطلب ماء الشرب عند الشعور بالعطش؟', 'Hoe vraag je om water bij dorst?', 'How do you urgently ask for water?'),
              targetPhrase: lex.waterPhrase,
              translation: t('ماء، من فضلك.', 'Water, alstublieft.', 'Water, please.'),
              options: [lex.waterPhrase, lex.rightPhrase, lex.stationPhrase, greeting],
              correctAnswer: lex.waterPhrase,
              culturalNote: t('عبارة حيوية لا غنى عنها عند السفر والتنقل.', 'Cruciale overlevingsfrase.', 'Essential survival phrase when traveling.'),
              exampleSentence: `— ${lex.waterPhrase}`,
              exampleTranslation: 'Water, please, as soon as possible.'
            }
          ]
        }
      ]
    },

    // MODULE 2: CEFR A2 — Navigation, Shopping & Routines
    {
      id: 'unit-a2',
      unitNumber: 2,
      title: t(`A2: الملاحة والتسوق والروتين اليومي`, `A2: Navigatie, Winkelen & Gewoonten`, `A2: Everyday Navigation & Routines`),
      subhead: t(`التنقل في المدينة، التسوق، والتعامل مع المواعيد والمواقف اليومية`, `Wegwijs in de stad, winkelen, dagelijkse routines en tijden`, `Everyday navigation, shopping, routines, and simple temporal descriptions`),
      themeColor: 'from-blue-500 to-indigo-600',
      accentBg: 'bg-blue-50 text-blue-900 border-blue-200',
      minCefr: 'A2',
      milestoneGems: 30,
      nodes: [
        {
          id: 'a2-navigation',
          title: t('الاتجاهات والتنقل في المدينة', 'Wegwijzers & Vervoer', 'Wayfinding & City Transit'),
          nativeTitle: lex.directionsUnitTitle,
          category: 'Conversation',
          cefr: 'A2',
          description: t('السؤال عن محطة القطار وفهم إشارات الاتجاه.', 'Vraag naar het station en begrijp richtingsaanwijzingen.', 'Locate train stations and follow street directions.'),
          xpReward: 50,
          gemReward: 12,
          targetDurationMinutes: 4,
          iconName: 'Compass',
          coordinates: { x: 0, y: 0 },
          exercises: [
            {
              id: 'ex-a2-1',
              type: 'multiple-choice',
              prompt: t(`كيف تسأل عن محطة القطار بـ ${name}؟`, `Hoe vraag je naar het station in het ${name}?`, `How do you ask for the train station in ${name}?`),
              targetPhrase: lex.stationPhrase,
              translation: t('أين محطة القطار؟', 'Waar is het station?', 'Where is the station?'),
              options: [lex.stationPhrase, lex.rightPhrase, lex.waterPhrase, greeting],
              correctAnswer: lex.stationPhrase,
              culturalNote: t('افتح سؤالك بتحية لطيفة قبل الاستفسار.', 'Stel je vraag beleefd met een begroeting.', 'Best used by opening with a polite greeting.'),
              exampleSentence: `— Disculpe, ¿${lex.stationPhrase}?`,
              exampleTranslation: 'Excuse me, where is the main station?'
            },
            {
              id: 'ex-a2-2',
              type: 'multiple-choice',
              prompt: t(`ماذا يعني هذا التوجيه بـ ${name}؟`, `Wat betekent deze richting in het ${name}?`, `What does this navigation direction mean in ${name}?`),
              targetPhrase: lex.rightPhrase,
              translation: t('إلى اليمين', 'Naar rechts', 'To the right'),
              options: [lex.rightPhrase, lex.stationPhrase, lex.coffeePhrase, lex.goodbyePhrase],
              correctAnswer: lex.rightPhrase,
              culturalNote: t('إشارة أساسية للتوجيه في الشارع.', 'Basisrichting voor straatnavigatie.', 'Core directional cue for street navigation.'),
              exampleSentence: `— Siga recto y luego gire a la derecha.`,
              exampleTranslation: 'Continue straight and then turn to the right.'
            }
          ]
        },
        {
          id: 'a2-shopping',
          title: t('التسوق والأسعار والمتاجر', 'Winkelen & Prijzen', 'Shopping & Market Purchases'),
          nativeTitle: t('التسوق والتعاملات المالية', 'Winkelen & Transacties', 'Shopping & Everyday Transactions'),
          category: 'Conversation',
          cefr: 'A2',
          description: t('السؤال عن الأسعار وإنهاء الشراء في الأسواق المحلية.', 'Vraag naar prijzen en reken eenvoudig af in lokale winkels.', 'Ask for prices and conduct simple store purchases.'),
          xpReward: 55,
          gemReward: 14,
          targetDurationMinutes: 4,
          iconName: 'ShoppingBag',
          coordinates: { x: 0, y: 0 },
          exercises: [
            {
              id: 'ex-a2-3',
              type: 'multiple-choice',
              prompt: t('كيف تطلب الحساب عند إنهاء التسوق؟', 'Hoe vraag je de rekening of prijs?', 'How do you request the final checkout?'),
              targetPhrase: lex.billPhrase,
              translation: t('الحساب، لو سمحت.', 'De rekening, alstublieft.', 'The bill, please.'),
              options: [lex.billPhrase, lex.stationPhrase, lex.coffeePhrase, lex.goodbyePhrase],
              correctAnswer: lex.billPhrase,
              exampleSentence: `— ¿Cuánto cuesta esto? ${lex.billPhrase}`,
              exampleTranslation: 'How much is this? The bill, please.'
            }
          ]
        }
      ]
    },

    // MODULE 3: CEFR B1 — Travel, Opinions & Storytelling
    {
      id: 'unit-b1',
      unitNumber: 3,
      title: t(`B1: السفر، الآراء والتجارب الشخصية`, `B1: Reizen, Meningen & Ervaringen`, `B1: Travel, Opinions & Storytelling`),
      subhead: t(`إدارة مواقف السفر، مشاركة الآراء وسرد التجارب الماضية بطلاقة`, `Reissituaties beheren, meningen delen en eerdere ervaringen vertellen`, `Travel, expressing opinions, work routines, and personal storytelling`),
      themeColor: 'from-purple-500 to-violet-600',
      accentBg: 'bg-purple-50 text-purple-900 border-purple-200',
      minCefr: 'B1',
      milestoneGems: 40,
      nodes: [
        {
          id: 'b1-social',
          title: t('التعرف على أصدقاء جدد والحوار', 'Nieuwe Mensen & Vriendschap', 'Meeting Friends & Dialogue'),
          nativeTitle: lex.socialUnitTitle,
          category: 'Conversation',
          cefr: 'B1',
          description: t('إجراء محادثات عفوية ونسج علاقات صداقة دافئة.', 'Voer spontane gesprekken en maak warme connecties.', 'Engage in friendly social conversation and establish connections.'),
          xpReward: 60,
          gemReward: 15,
          targetDurationMinutes: 5,
          iconName: 'Users',
          coordinates: { x: 0, y: 0 },
          exercises: [
            {
              id: 'ex-b1-1',
              type: 'multiple-choice',
              prompt: t(`كيف ترحب بصديق جديد بحرارة بـ ${name}؟`, `Hoe begroet je een nieuwe vriend warm in het ${name}?`, `How do you warmly welcome a new friend in ${name}?`),
              targetPhrase: lex.friendPhrase,
              translation: t('سعدت جداً بلقائك!', 'Aangename kennismaking!', 'Pleased to meet you!'),
              options: [lex.friendPhrase, lex.billPhrase, lex.stationPhrase, lex.rightPhrase],
              correctAnswer: lex.friendPhrase,
              culturalNote: t('تعبير دافئ يكسر الحواجز بسرعة.', 'Warme sociale begroeting.', 'Creates an instant comfortable bond.'),
              exampleSentence: `— ¡Mucho gusto! ${lex.friendPhrase}`,
              exampleTranslation: 'A pleasure! Pleased to meet you!'
            }
          ]
        }
      ]
    }
  ]);
}

export const DuolingoPathView: React.FC<DuolingoPathViewProps> = ({
  user,
  activeLanguage,
  onSelectNode,
  onUpdateUser,
}) => {
  const nativeCode = user.nativeLanguageCode || 'en';
  const isArabic = nativeCode === 'ar';
  const isDutch = nativeCode === 'nl';
  const isRtl = isArabic;
  const activeLevel = user.activeCefr || 'A1';
  const i18n = getI18n(nativeCode);

  const [isChoosingIntent, setIsChoosingIntent] = useState<boolean>(!user.learningIntent);
  const activeIntent = user.learningIntent || 'conversational';

  const units = getDuolingoUnits(activeLanguage, nativeCode, activeLevel, activeIntent);
  const completedIds = new Set(user.completedNodeIds || []);

  let foundFirstActive = false;

  const HORIZONTAL_OFFSETS = [
    'translate-x-0',
    '-translate-x-10 sm:-translate-x-14',
    'translate-x-0',
    'translate-x-10 sm:translate-x-14',
  ];

  const INTENTS = [
    {
      id: 'business' as const,
      icon: Briefcase,
      title: isArabic ? 'الأعمال والمفاوضات المهنية' : isDutch ? 'Zakelijk & Onderhandelingen' : 'Business & Professional Negotiation',
      desc: isArabic ? 'المخاطبة الرسمية، العقود، الاجتماعات والتفاوض التجاري.' : isDutch ? 'Formele etiquette, contracten, zakelijke meetings en onderhandelingen.' : 'Executive address, contracts, meetings, and commercial negotiations.',
      badge: isArabic ? 'الشركات' : 'Corporate',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      id: 'travel' as const,
      icon: Plane,
      title: isArabic ? 'السفر والتنقل واستكشاف الثقافة' : isDutch ? 'Reizen & Stedelijke Navigatie' : 'Travel & Cultural Navigation',
      desc: isArabic ? 'المطارات، الفنادق، طلب الطعام، الملاحة والمواقف الطارئة.' : isDutch ? 'Luchthavens, hotelreserveringen, dineren en stadsnavigatie.' : 'Airports, hotels, dining, local markets, transit, and emergency care.',
      badge: isArabic ? 'سفر' : 'Explorer',
      color: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'academic' as const,
      icon: GraduationCap,
      title: isArabic ? 'البحث الأكاديمي والخطاب العلمي' : isDutch ? 'Academisch Onderzoek & Debat' : 'Academic Research & Formal Discourse',
      desc: isArabic ? 'المصطلحات المنهجية، صياغة الفرضيات، النقد العلمي ومناقشة الأطروحات.' : isDutch ? 'Wetenschappelijke terminologie, hypotheses en thesisverdediging.' : 'Scholarly terminology, hypothesis formulation, thesis critique, and debate.',
      badge: isArabic ? 'أكاديمي' : 'Scholarly',
      color: 'from-purple-600 to-indigo-800',
    },
    {
      id: 'conversational' as const,
      icon: MessageCircle,
      title: isArabic ? 'الطلاقة الحوارية والتواصل الاجتماعي' : isDutch ? 'Spontane Conversatie & Vloeiendheid' : 'Conversational Fluency & Social',
      desc: isArabic ? 'الحوار اليومي، الصداقات، الفكاهة، وسرد القصص والتجارب الحياتية.' : isDutch ? 'Dagelijkse gesprekken, vriendschap, humor en spontane spraak.' : 'Everyday banter, storytelling, humor, friendship, and casual recall.',
      badge: isArabic ? 'طلاقة' : 'Fluency',
      color: 'from-amber-600 to-orange-700',
    },
    {
      id: 'culture' as const,
      icon: Landmark,
      title: isArabic ? 'الأدب والتراث الثقافي الأصيل' : isDutch ? 'Literatuur & Historisch Erfgoed' : 'Literature & Cultural Heritage',
      desc: isArabic ? 'النصوص التراثية، الأمثال الكلاسيكية، والفلسفة العميقة.' : isDutch ? 'Klassieke teksten, spreekwoorden en historisch-culturele wortels.' : 'Classical texts, heritage proverbs, folklore, and philosophy.',
      badge: isArabic ? 'تراث' : 'Heritage',
      color: 'from-rose-600 to-pink-700',
    },
  ];

  const currentIntentObj = INTENTS.find((it) => it.id === activeIntent) || INTENTS[3];

  const handleSelectIntent = (intentId: 'business' | 'travel' | 'academic' | 'conversational' | 'culture') => {
    audioSynth.playSuccessChime();
    setIsChoosingIntent(false);
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        learningIntent: intentId,
      });
    }
  };

  return (
    <div
      id="fluentic-duolingo-path-view"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative w-full max-w-xl mx-auto px-4 pt-4 pb-32 flex flex-col items-center select-none"
    >
      {/* Top Header Card */}
      <div className="w-full text-center mb-6 space-y-2 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-sm">
          <span className="text-base leading-none">{activeLanguage.flag}</span>
          <span>{activeLanguage.name} • {i18n.navPath}</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-extrabold text-[10px]">
            {user.activeCefr || 'A1'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {activeLanguage.name} {isArabic ? 'مسار التعلم المنهجي المتدرج' : isDutch ? 'Stapsgewijs Leerpad' : 'Step-by-Step Curriculum'}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isArabic
            ? 'تعلّم الأصوات ومخارج الحروف أولاً، ثم تدرج نحو المحادثات الحقيقية والمفاهيم العميقة. أكمل كل درس لفتح التالي!'
            : isDutch
            ? 'Je begint met de fonetiek en het alfabet, en stroomt dan direct door naar café- en overlevingsessenties. Voltooi elk bolletje om het volgende te ontgrendelen!'
            : 'Start with Phonics and native script, then progress to Cafe Essentials. Complete each bubble to unlock the next!'}
        </p>
      </div>

      {/* ======================================================== */}
      {/* INTENT-DRIVEN PATH CURRICULUM SETUP (THE "WHY" SETUP)   */}
      {/* ======================================================== */}
      {isChoosingIntent ? (
        <div className="w-full p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0F2137] via-[#1B365D] to-[#0A1128] text-white border border-[#D4AF37]/50 shadow-2xl mb-8 space-y-4 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-black uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تحديد الهدف اللغوي الأساسي' : isDutch ? 'Persoonlijk Leerdoel' : 'Curriculum Intent Setup'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isArabic 
                ? 'لماذا ترغب في تعلم هذه اللغة؟' 
                : isDutch 
                ? 'Waarom leer je deze taal?' 
                : 'Why are you learning this language?'}
            </h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              {isArabic
                ? 'يُكيّف محرك الذكاء الاصطناعي المفردات والوحدات وسيناريوهات المحادثة مباشرة وفقاً لهدفك الشخصي لضمان أسرع مسار للإتقان.'
                : isDutch
                ? 'Het AI-curriculum stemt woordenschat, spreekmodules en context direct af op jouw doel voor maximaal leerrendement.'
                : 'The AI curriculum engine dynamically customizes vocabulary, syntax, and modules directly to your primary objective.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {INTENTS.map((intent) => {
              const Icon = intent.icon;
              const isSelected = activeIntent === intent.id;
              return (
                <button
                  key={intent.id}
                  type="button"
                  onClick={() => handleSelectIntent(intent.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-br from-white/20 to-white/10 border-[#D4AF37] ring-2 ring-[#D4AF37]/60 shadow-lg'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 text-slate-950 font-black">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-white">{intent.title}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10">
                      {intent.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    {intent.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {user.learningIntent && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsChoosingIntent(false)}
                className="text-xs font-bold text-slate-400 hover:text-white underline cursor-pointer"
              >
                {isArabic ? 'إغلاق وإبقاء الهدف الحالي' : isDutch ? 'Sluiten & Huidig Doel Behouden' : 'Keep Current Intent & Close'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Active Intent Quick Banner */
        <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border border-blue-200 text-xs font-bold text-blue-900 shadow-xs mb-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 truncate">
            <Target className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-slate-600">
              {isArabic ? 'المسار مخصص لهدف:' : isDutch ? 'Leerpad afgestemd op:' : 'Curriculum tailored for:'}
            </span>
            <span className="font-extrabold text-blue-950 truncate underline decoration-blue-400">
              {currentIntentObj.title}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              audioSynth.playGentleFeedback();
              setIsChoosingIntent(true);
            }}
            className="shrink-0 px-2.5 py-1 rounded-xl bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 font-extrabold text-[11px] transition-all cursor-pointer shadow-2xs"
          >
            {isArabic ? 'تغيير الهدف' : isDutch ? 'Wijzig Doel' : 'Change Goal'}
          </button>
        </div>
      )}

      {/* The Serpentine Units Container */}
      <div className="w-full space-y-12 relative">
        {units.map((unit) => {
          return (
            <div key={unit.id} className="relative w-full space-y-6">
              {/* Unit Section Header Banner */}
              <div
                className={`w-full rounded-2xl bg-gradient-to-r ${unit.themeColor} text-white p-4 sm:p-5 shadow-md flex items-center justify-between gap-4`}
              >
                <div className="space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-wider text-white/80 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    <span>{isArabic ? `الوحدة ${unit.unitNumber}` : isDutch ? `Eenheid ${unit.unitNumber}` : `Unit ${unit.unitNumber}`}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">{unit.title}</h3>
                  <p className="text-xs text-white/90 line-clamp-1">{unit.subhead}</p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold border border-white/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{unit.minCefr} {isArabic ? 'إتقان' : isDutch ? 'Competentie' : 'Mastery'}</span>
                </div>
              </div>

              {/* Path Bubbles Column */}
              <div className="flex flex-col items-center py-4 space-y-8 relative">
                {unit.nodes.map((node, nodeIdx) => {
                  const isCompleted = completedIds.has(node.id);
                  let isActive = false;
                  let isLocked = false;

                  if (isCompleted) {
                    // Already ticked!
                  } else if (!foundFirstActive) {
                    // This is the active node!
                    isActive = true;
                    foundFirstActive = true;
                  } else {
                    // Subsequent non-completed node is locked
                    isLocked = true;
                  }

                  const offsetClass = HORIZONTAL_OFFSETS[nodeIdx % HORIZONTAL_OFFSETS.length];

                  return (
                    <div
                      key={node.id}
                      className={`relative flex flex-col items-center transition-all duration-300 ${offsetClass}`}
                    >
                      {/* Floating START Pill above active node */}
                      {isActive && (
                        <div className="absolute -top-10 z-20 animate-bounce">
                          <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#1B365D] to-[#0F2137] text-[#D4AF37] border border-[#C5A059]/40 font-black text-[11px] tracking-wider uppercase shadow-lg flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                            <span>{isArabic ? 'ابدأ' : isDutch ? 'BEGIN' : 'START'}</span>
                          </div>
                          <div className="w-2.5 h-2.5 bg-[#0F2137] border-b border-r border-[#C5A059]/40 rotate-45 mx-auto -mt-1 shadow-xs" />
                        </div>
                      )}

                      {/* Tactile 3D Circular Bubble Button */}
                      <button
                        type="button"
                        id={`duolingo-bubble-${node.id}`}
                        disabled={isLocked}
                        onClick={() => {
                          if (isLocked) {
                            audioSynth.playGentleFeedback();
                            return;
                          }
                          audioSynth.playSuccessChime();
                          onSelectNode(node);
                        }}
                        className={`group relative w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-150 select-none cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 hover:bg-emerald-400 border-b-6 border-emerald-700 active:translate-y-1 active:border-b-2 text-white shadow-lg shadow-emerald-500/30'
                            : isActive
                            ? 'bg-blue-600 hover:bg-blue-500 border-b-6 border-blue-800 active:translate-y-1 active:border-b-2 text-white shadow-xl shadow-blue-600/40 ring-4 ring-blue-400/40 ring-offset-2'
                            : 'bg-slate-200 border-b-6 border-slate-300 text-slate-400 cursor-not-allowed'
                        }`}
                        title={node.title}
                      >
                        {isCompleted ? (
                          <Check className="w-8 h-8 stroke-[3]" />
                        ) : isLocked ? (
                          <Lock className="w-6 h-6 text-slate-400" />
                        ) : (
                          <Star className="w-7 h-7 fill-white text-white drop-shadow-sm" />
                        )}
                      </button>

                      {/* Bubble Label Card */}
                      <div className="mt-2 text-center max-w-[130px]">
                        <p className={`text-xs font-bold leading-tight truncate ${
                          isActive ? 'text-blue-900 font-black' : isCompleted ? 'text-emerald-900' : 'text-slate-400'
                        }`}>
                          {node.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {node.nativeTitle || node.category}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
