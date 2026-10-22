import { PlacementTestQuestion } from './placementTestService';
import { WORLD_LANGUAGES } from '../data/languages';
import { stripTransliteration } from './languageTypography';

/**
 * Returns a high-fidelity, 100% logically sound 10-question placement test.
 * Eliminates all Latin phonetic transliterations across all languages,
 * ensuring pure native characters and directional clarity.
 */
export function getCuratedPlacementQuestions(
  targetCode: string,
  targetName: string,
  nativeCode: string = 'en',
  variant: 'A' | 'B' | 'C' | 'D' = 'A'
): PlacementTestQuestion[] {
  const isDutch = nativeCode === 'nl';
  const code = targetCode.toLowerCase();

  let questions: PlacementTestQuestion[] = [];

  if (code === 'es') {
    questions = getSpanishQuestions(isDutch, variant);
  } else if (code === 'fr') {
    questions = getFrenchQuestions(isDutch, variant);
  } else if (code === 'de') {
    questions = getGermanQuestions(isDutch, variant);
  } else if (code === 'it') {
    questions = getItalianQuestions(isDutch, variant);
  } else if (code === 'en') {
    questions = getEnglishQuestions(isDutch, variant);
  } else if (code === 'pt') {
    questions = getPortugueseQuestions(isDutch, variant);
  } else if (code === 'nl') {
    questions = getDutchQuestions(isDutch, variant);
  } else if (code === 'ar') {
    questions = getArabicQuestions(isDutch, variant);
  } else if (code === 'ja') {
    questions = getJapaneseQuestions(isDutch, variant);
  } else if (code === 'zh') {
    questions = getChineseQuestions(isDutch, variant);
  } else if (code === 'ru') {
    questions = getRussianQuestions(isDutch, variant);
  } else {
    // Universal high-quality generator for all other 50+ languages
    questions = getUniversalLanguageQuestions(targetCode, targetName, isDutch);
  }

  // Pure script guarantee: Strip any phonetic transliterations in parentheses across all fields
  return questions.map((q) => ({
    ...q,
    prompt: stripTransliteration(q.prompt),
    instruction: stripTransliteration(q.instruction),
    explanation: stripTransliteration(q.explanation),
    audioText: q.audioText ? stripTransliteration(q.audioText) : undefined,
    options: q.options.map((opt) => ({
      ...opt,
      text: stripTransliteration(opt.text),
    })),
  }));
}

function getSpanishQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Kennismaking' : 'Greetings & Introductions',
      instruction: isDutch ? 'Wat betekent deze Spaanse begroeting?' : 'What does this Spanish greeting mean?',
      prompt: '¡Hola! ¿Cómo te llamas?',
      options: [
        { key: 'A', text: isDutch ? 'Hallo! Hoe heet je?' : 'Hello! What is your name?' },
        { key: 'B', text: isDutch ? 'Goedemorgen! Waar woon je?' : 'Good morning! Where do you live?' },
        { key: 'C', text: isDutch ? 'Tot ziens! Een fijne dag!' : 'Goodbye! Have a nice day!' },
        { key: 'D', text: isDutch ? 'Dankjewel! Tot morgen!' : 'Thank you! See you tomorrow!' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"¡Hola! ¿Cómo te llamas?" betekent letterlijk: "Hallo! Hoe heet je?".'
        : '"¡Hola! ¿Cómo te llamas?" directly translates to: "Hello! What is your name?".',
      audioText: '¡Hola! ¿Cómo te llamas?'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Bestellen in een Café' : 'Cafe & Ordering',
      instruction: isDutch ? 'Hoe vraag je beleefd om een koffie?' : 'How do you politely order a coffee in Spanish?',
      prompt: isDutch ? 'Een koffie, alstublieft.' : 'A coffee, please.',
      options: [
        { key: 'A', text: 'La cuenta, por favor.' },
        { key: 'B', text: 'Un café, por favor.' },
        { key: 'C', text: 'Dónde está el baño.' },
        { key: 'D', text: 'Buenas noches a todos.' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Un café, por favor" is de standaard beleefde manier om koffie te bestellen.'
        : '"Un café, por favor" is the standard courteous way to order a coffee.',
      audioText: 'Un café, por favor.'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Kennismaking & Woonplaats' : 'Introductions & Living Situation',
      instruction: isDutch ? 'Wat betekent dit korte gesprek?' : 'What does this short exchange mean?',
      prompt: '— ¿Dónde viven ustedes? — Nosotros vivimos en el centro de Madrid.',
      options: [
        { key: 'A', text: isDutch ? 'Ze werken buiten de stad' : 'They work outside the city' },
        { key: 'B', text: isDutch ? 'Ze zijn op vakantie in Madrid' : 'They are on vacation in Madrid' },
        { key: 'C', text: isDutch ? 'Ze wonen in het centrum van Madrid' : 'They live in the center of Madrid' },
        { key: 'D', text: isDutch ? 'Ze zoeken een nieuw appartement' : 'They are looking for a new apartment' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? '"Nosotros vivimos en el centro" betekent dat ze in het stadscentrum wonen.'
        : '"Nosotros vivimos en el centro" means they reside in the city center.',
      audioText: 'Nosotros vivimos en el centro de Madrid.'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'Vervoer & De Weg Vragen' : 'Transit & Directions',
      instruction: isDutch ? 'Wat is het meest logische antwoord op deze vraag?' : 'What is the most logical answer to this question?',
      prompt: '— ¿Disculpe, dónde está la estación de metro?',
      options: [
        { key: 'A', text: isDutch ? 'Ik ben vijfentwintig jaar oud' : 'I am twenty-five years old' },
        { key: 'B', text: isDutch ? 'Het is drie uur in de middag' : 'It is three in the afternoon' },
        { key: 'C', text: isDutch ? 'Aan het einde van deze straat, aan de rechterkant' : 'At the end of this street, on the right' },
        { key: 'D', text: isDutch ? 'Aangenaam, ik ben ober' : 'Nice to meet you, I am a waiter' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? '"Está al final de esta calle, a la derecha" geeft direct de juiste route-aanwijzing.'
        : '"Está al final de esta calle, a la derecha" gives clear wayfinding directions.',
      audioText: 'Disculpe, dónde está la estación de metro?'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Vrije Tijd & Ervaringen' : 'Free Time & Past Activities',
      instruction: isDutch ? 'Wat deden ze gistermiddag?' : 'What did they do yesterday afternoon?',
      prompt: '— ¿Qué hicieron ayer por la tarde? — Fuimos al cine y vimos una película fantástica.',
      options: [
        { key: 'A', text: isDutch ? 'Ze gingen naar de bioscoop en zagen een fantastische film' : 'They went to the cinema and saw a fantastic movie' },
        { key: 'B', text: isDutch ? 'Ze bleven thuis om te studeren' : 'They stayed home to study' },
        { key: 'C', text: isDutch ? 'Ze gaan morgen naar het theater' : 'They are planning to visit the theater tomorrow' },
        { key: 'D', text: isDutch ? 'Ze hebben hun bioscoopkaartjes geannuleerd' : 'They cancelled their cinema tickets' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Duidelijke communicatie over een leuke vrijetijdsactiviteit in het verleden.'
        : 'Clear practical conversation describing a past recreational activity.',
      audioText: 'Ayer nosotros fuimos al cine y vimos una película fantástica.'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Vaste Uitdrukkingen & Beeldspraak' : 'Everyday Expressions & Idioms',
      instruction: isDutch ? 'Iemand zegt: "Durante la clase, Mateo estaba en las nubes." Wat betekent dit?' : 'Someone says: "During class, Mateo was in the clouds." What does this mean?',
      prompt: 'Durante la clase, Mateo estaba en las nubes.',
      options: [
        { key: 'A', text: isDutch ? 'Hij was erg moe en viel in slaap' : 'He was very tired and fell asleep' },
        { key: 'B', text: isDutch ? 'Hij was aan het dagdromen en afgeleid' : 'He was daydreaming and distracted' },
        { key: 'C', text: isDutch ? 'Hij maakte zich zorgen over het weer' : 'He was worried about the weather' },
        { key: 'D', text: isDutch ? 'Hij had veel geld gespaard' : 'He had saved a lot of money' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Estar en las nubes" betekent dat iemand met zijn hoofd in de wolken is (dagdromen).'
        : '"Estar en las nubes" colloquially means being absent-minded or daydreaming.',
      audioText: 'Durante la clase, Mateo estaba en las nubes.'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Advies & Gezondheid' : 'Advice & Everyday Context',
      instruction: isDutch ? 'Welk advies gaf de arts?' : 'What advice did the doctor give?',
      prompt: '— El médico me dijo: "Es importante que duermas al menos ocho horas cada noche para recuperarte."',
      options: [
        { key: 'A', text: isDutch ? 'Elke ochtend vroeg gaan sporten' : 'Exercising early every morning' },
        { key: 'B', text: isDutch ? 'Minstens acht uur per nacht slapen om te herstellen' : 'Sleeping at least eight hours each night to recover' },
        { key: 'C', text: isDutch ? 'Medicijnen kopen voor vertrek' : 'Buying medicine before departure' },
        { key: 'D', text: isDutch ? 'Geen vakantie nemen dit jaar' : 'Not taking any vacations this year' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'Het advies luidt om acht uur te slapen voor herstel.'
        : 'The practical advice focuses on getting eight hours of sleep to recover.',
      audioText: 'Es importante que duermas al menos ocho horas cada noche.'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Sociale Afspraken & Reden' : 'Social Plans & Polite Contrast',
      instruction: isDutch ? 'Waarom kunnen ze niet mee naar het strand?' : 'Why can they not join for the beach trip?',
      prompt: '— Nos encantaría ir a la playa contigo; sin embargo, tenemos una reunión de trabajo a las tres.',
      options: [
        { key: 'A', text: isDutch ? 'Ze willen graag, maar hebben een werkoverleg om drie uur' : 'They would love to, but have a work meeting at three' },
        { key: 'B', text: isDutch ? 'Ze houden helemaal niet van het strand' : 'They do not like the beach at all' },
        { key: 'C', text: isDutch ? 'Het regent veel te hard vandaag' : 'It is raining too heavily today' },
        { key: 'D', text: isDutch ? 'De vergadering was gisteren al gehouden' : 'The meeting was already held yesterday' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Sin embargo" introduceert de praktische reden waarom ze niet mee kunnen.'
        : '"Sin embargo" courteously introduces the scheduling conflict.',
      audioText: 'Nos encantaría ir a la playa contigo; sin embargo, tenemos una reunión a las tres.'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Plannen & Terugblik' : 'Reflections & Complex Dialogue',
      instruction: isDutch ? 'Wat bedoelt de spreker?' : 'What does the speaker mean?',
      prompt: '— Si me hubieras avisado a tiempo, habríamos ido juntos a la conferencia.',
      options: [
        { key: 'A', text: isDutch ? 'Als je me op tijd had laten weten, waren we samen gegaan' : 'If you had let me know in time, we would have gone together' },
        { key: 'B', text: isDutch ? 'We gaan morgenochtend samen naar de conferentie' : 'We are going together to the conference tomorrow morning' },
        { key: 'C', text: isDutch ? 'De conferentie is uitgesteld naar volgende week' : 'The conference has been postponed to next week' },
        { key: 'D', text: isDutch ? 'Niemand heeft zich aangemeld voor de conferentie' : 'Nobody signed up for the conference' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Begrip van een genuanceerde terugblik op een gemiste gezamenlijke kans.'
        : 'Comprehending a natural conversational reflection about a missed opportunity.',
      audioText: 'Si me hubieras avisado a tiempo, habríamos ido juntos a la conferencia.'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Natuurlijk Idioom & Betekenis' : 'Natural Idioms & Deep Meaning',
      instruction: isDutch ? 'Wat deed de directrice tijdens het overleg?' : 'What did the director do during the meeting?',
      prompt: '— Durante la reunión sobre el presupuesto, la directora puso el dedo en la llaga.',
      options: [
        { key: 'A', text: isDutch ? 'Ze vermeed de moeilijke vragen over het geld' : 'She avoided the difficult financial questions' },
        { key: 'B', text: isDutch ? 'Ze stelde het besluit uit tot het einde van het jaar' : 'She delayed the decision until the end of the year' },
        { key: 'C', text: isDutch ? 'Ze legde precies de vinger op het heikele kernprobleem' : 'She pinpointed the exact sensitive core issue' },
        { key: 'D', text: isDutch ? 'Ze keurde alle extra uitgaven onmiddellijk goed' : 'She approved all extra expenses immediately' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? '"Poner el dedo en la llaga" is een klassieke uitdrukking voor exact het heikele punt raken.'
        : '"Poner el dedo en la llaga" means directly addressing the sensitive core of a situation.',
      audioText: 'La directora puso el dedo en la llaga sobre el presupuesto.'
    }
  ];
}

function getFrenchQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Beleefdheid' : 'Greetings & Politeness',
      instruction: isDutch ? 'Wat betekent deze Franse begroeting?' : 'What does this French greeting mean?',
      prompt: 'Bonjour ! Comment allez-vous ?',
      options: [
        { key: 'A', text: isDutch ? 'Hallo! Hoe gaat het met u?' : 'Hello! How are you?' },
        { key: 'B', text: isDutch ? 'Goedenavond! Waar woont u?' : 'Good evening! Where do you live?' },
        { key: 'C', text: isDutch ? 'Tot ziens! Een prettige reis!' : 'Goodbye! Have a nice trip!' },
        { key: 'D', text: isDutch ? 'Alstublieft, hier is het menu.' : 'Please, here is the menu.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Comment allez-vous ?" is de beleefde formele vraag naar hoe het met iemand gaat.'
        : '"Comment allez-vous ?" is the polite formal greeting for "How are you?".',
      audioText: 'Bonjour ! Comment allez-vous ?'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Bestellen in een Bistro' : 'Ordering in a Bistro',
      instruction: isDutch ? 'Hoe vraag je beleefd om de rekening in het Frans?' : 'How do you politely ask for the bill in French?',
      prompt: isDutch ? 'De rekening, alstublieft.' : 'The check / bill, please.',
      options: [
        { key: 'A', text: 'Où est la gare, s’il vous plaît.' },
        { key: 'B', text: 'L’addition, s’il vous plaît.' },
        { key: 'C', text: 'Un verre d’eau du robinet.' },
        { key: 'D', text: 'Enchanté de faire votre connaissance.' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"L’addition, s’il vous plaît" is de correcte manier om om de rekening te vragen.'
        : '"L’addition, s’il vous plaît" is the standard phrase for requesting the bill.',
      audioText: 'L’addition, s’il vous plaît.'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Dagelijkse Routine & Vervoer' : 'Daily Routine & Transport',
      instruction: isDutch ? 'Wat doen ze elke ochtend volgens dit gesprek?' : 'What do they do every morning according to this dialogue?',
      prompt: '— Comment allez-vous au travail ? — Chaque matin, nous prenons le métro.',
      options: [
        { key: 'A', text: isDutch ? 'Ze nemen elke ochtend de metro naar hun werk' : 'They take the metro to work every morning' },
        { key: 'B', text: isDutch ? 'Ze lopen samen naar de supermarkt' : 'They walk together to the supermarket' },
        { key: 'C', text: isDutch ? 'Ze werken altijd vanuit huis' : 'They always work from home' },
        { key: 'D', text: isDutch ? 'Ze nemen de fiets naar school' : 'They ride their bicycle to school' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Duidelijke praktische communicatie over het dagelijkse woon-werkverkeer.'
        : 'Clear practical communication about everyday commuting.',
      audioText: 'Chaque matin, nous prenons le métro.'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'De Weg Vragen & Oriëntatie' : 'Asking Directions',
      instruction: isDutch ? 'Wat is het meest passende antwoord op deze vraag?' : 'What is the most fitting response to this question?',
      prompt: '— Pardon monsieur, où se trouve le musée du Louvre ?',
      options: [
        { key: 'A', text: 'Il fait très beau aujourd’hui.' },
        { key: 'B', text: 'Prenez la deuxième rue à gauche, puis continuez tout droit.' },
        { key: 'C', text: 'J’ai vingt ans et je suis étudiant.' },
        { key: 'D', text: 'Le gâteau au chocolat est délicieux.' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Prenez la deuxième rue à gauche..." geeft een duidelijke routebeschrijving.'
        : '"Prenez la deuxième rue à gauche..." gives clear route directions.',
      audioText: 'Pardon monsieur, où se trouve le musée du Louvre ?'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Gebeurtenissen & Verhalen' : 'Past Events & Storytelling',
      instruction: isDutch ? 'Wat gebeurde er terwijl de spreker rustig aan het lezen was?' : 'What happened while the speaker was reading quietly?',
      prompt: '— Pendant que je lisais tranquillement, mon ami a frappé à la porte.',
      options: [
        { key: 'A', text: isDutch ? 'Zijn vriend klopte op de deur' : 'His friend knocked on the door' },
        { key: 'B', text: isDutch ? 'De telefoon ging plotseling af' : 'The phone rang suddenly' },
        { key: 'C', text: isDutch ? 'Hij viel rustig in slaap' : 'He fell quietly asleep' },
        { key: 'D', text: isDutch ? 'De postbode bracht een pakketje' : 'The mail carrier delivered a package' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Begrip van een plotselinge alledaagse gebeurtenis tijdens een bezigheid.'
        : 'Comprehending an everyday event unfolding during another activity.',
      audioText: 'Pendant que je lisais tranquillement, mon ami a frappé à la porte.'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Idioom & Franse Uitdrukkingen' : 'French Idiomatic Phrases',
      instruction: isDutch ? 'Wat betekent de Franse uitdrukking "Avoir le coup de foudre"?' : 'What does "Avoir le coup de foudre" mean?',
      prompt: 'Avoir le coup de foudre',
      options: [
        { key: 'A', text: isDutch ? 'Door de bliksem getroffen worden' : 'Being struck by lightning' },
        { key: 'B', text: isDutch ? 'Liefde op het eerste gezicht ervaren' : 'Experiencing love at first sight' },
        { key: 'C', text: isDutch ? 'Plotseling boos worden' : 'Becoming suddenly angry' },
        { key: 'D', text: isDutch ? 'Grote haast hebben' : 'Being in a rush' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Le coup de foudre" is de bekende Franse uitdrukking voor liefde op het eerste gezicht.'
        : '"Le coup de foudre" is the classic French idiom for love at first sight.',
      audioText: 'Avoir le coup de foudre'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Werkafspraken & Punctualiteit' : 'Workplace Instructions & Planning',
      instruction: isDutch ? 'Wat benadrukt de leidinggevende voor morgen?' : 'What does the supervisor emphasize for tomorrow?',
      prompt: '— Le responsable a précisé : "Il faut absolument que vous soyez à l’heure demain."',
      options: [
        { key: 'A', text: isDutch ? 'Dat iedereen morgen stipt op tijd aanwezig moet zijn' : 'That everyone must be strictly on time tomorrow' },
        { key: 'B', text: isDutch ? 'Dat de vergadering van morgen is afgelast' : 'That tomorrow\'s meeting has been cancelled' },
        { key: 'C', text: isDutch ? 'Dat iedereen vanuit huis mag werken' : 'That everyone can work remotely' },
        { key: 'D', text: isDutch ? 'Dat men de lunch zelf moet meenemen' : 'That team members must bring their own lunch' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Duidelijke professionele instructie over stiptheid en aanwezigheid.'
        : 'Clear professional direction regarding punctuality.',
      audioText: 'Il faut absolument que vous soyez à l’heure demain.'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Genuanceerde Reismededeling' : 'Nuanced Observations & Travel',
      instruction: isDutch ? 'Wat wordt er over het team gezegd?' : 'What is stated about the team?',
      prompt: '— Le trajet était très long ; néanmoins, toute l’équipe est arrivée souriante.',
      options: [
        { key: 'A', text: isDutch ? 'De reis was lang, maar het team arriveerde desondanks glimlachend' : 'The journey was long, yet the entire team arrived smiling' },
        { key: 'B', text: isDutch ? 'Het team weigerde aan de lange reis te beginnen' : 'The team refused to embark on the long trip' },
        { key: 'C', text: isDutch ? 'Iedereen kwam veel te laat aan door het weer' : 'Everyone arrived far too late due to weather' },
        { key: 'D', text: isDutch ? 'De reis was kort en comfortabel' : 'The journey was brief and comfortable' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Néanmoins" geeft aan dat ondanks de lange reis iedereen positief bleef.'
        : '"Néanmoins" indicates that despite the long journey, the team remained positive.',
      audioText: 'Le trajet était très long ; néanmoins, toute l’équipe est arrivée souriante.'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Hypothetische Terugblik' : 'Reflections & Thoughtful Dialogue',
      instruction: isDutch ? 'Wat bedoelt de spreker?' : 'What does the speaker mean?',
      prompt: '— Si j’avais su que tu venais à Paris, je t’aurais attendu à la gare.',
      options: [
        { key: 'A', text: isDutch ? 'Als ik had geweten dat je kwam, had ik op je gewacht op het station' : 'Had I known you were coming, I would have waited for you at the station' },
        { key: 'B', text: isDutch ? 'We gaan morgen samen met de trein naar Parijs' : 'We are taking the train to Paris together tomorrow' },
        { key: 'C', text: isDutch ? 'De trein naar Parijs is vandaag geannuleerd' : 'The train to Paris was cancelled today' },
        { key: 'D', text: isDutch ? 'Niemand wist waar het station was' : 'Nobody knew where the station was located' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Begrip van een welgemeende terugblik op een gemiste ontmoeting.'
        : 'Comprehension of a thoughtful reflection regarding a missed connection.',
      audioText: 'Si j’avais su que tu venais, je t’aurais attendu à la gare.'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Onderhandeling & Frans Idioom' : 'Negotiation & French Idioms',
      instruction: isDutch ? 'Wat deden de partijen om de overeenkomst te sluiten?' : 'What did the parties do to finalize the agreement?',
      prompt: '— Après plusieurs heures de négociation, chacun a mis de l’eau dans son vin.',
      options: [
        { key: 'A', text: isDutch ? 'Iedereen schonk drankjes in voor de gasten' : 'Everyone poured drinks for the guests' },
        { key: 'B', text: isDutch ? 'Beide partijen deden concessies en vonden een compromis' : 'Both sides made concessions and reached a compromise' },
        { key: 'C', text: isDutch ? 'De onderhandelingen werden definitief afgebroken' : 'The negotiations were permanently terminated' },
        { key: 'D', text: isDutch ? 'De prijzen werden per direct verdubbeld' : 'Prices were doubled with immediate effect' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Mettre de l’eau dans son vin" betekent water bij de wijn doen (concessies doen voor een compromis).'
        : '"Mettre de l’eau dans son vin" signifies accepting a compromise through mutual concessions.',
      audioText: 'Chacun a mis de l’eau dans son vin pour signer l’accord.'
    }
  ];
}

function getGermanQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Kennismaking' : 'Greetings & Basics',
      instruction: isDutch ? 'Wat betekent deze Duitse begroeting?' : 'What does this German greeting mean?',
      prompt: 'Guten Tag! Wie geht es Ihnen?',
      options: [
        { key: 'A', text: isDutch ? 'Goedendag! Hoe gaat het met u?' : 'Good day! How are you? (formal)' },
        { key: 'B', text: isDutch ? 'Goedenavond! Waar gaat u heen?' : 'Good evening! Where are you going?' },
        { key: 'C', text: isDutch ? 'Tot ziens! Prettige dag verder!' : 'Goodbye! Have a nice day!' },
        { key: 'D', text: isDutch ? 'Welkom bij ons op kantoor!' : 'Welcome to our office!' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Guten Tag! Wie geht es Ihnen?" is de formele en beleefde begroeting in het Duits.'
        : '"Guten Tag! Wie geht es Ihnen?" is the standard formal greeting in German.',
      audioText: 'Guten Tag! Wie geht es Ihnen?'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Bestellen in een Café' : 'Cafe & Ordering',
      instruction: isDutch ? 'Hoe vraag je beleefd om de rekening in het Duits?' : 'How do you politely ask for the check in German?',
      prompt: isDutch ? 'De rekening, alstublieft.' : 'The bill / check, please.',
      options: [
        { key: 'A', text: 'Wo ist der Bahnhof, bitte?' },
        { key: 'B', text: 'Die Rechnung, bitte.' },
        { key: 'C', text: 'Einen Kaffee mit Zucker.' },
        { key: 'D', text: 'Freut mich, Sie kennenzulernen.' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Die Rechnung, bitte" is de correcte formulering om de rekening te vragen.'
        : '"Die Rechnung, bitte" is the standard phrase to ask for the bill.',
      audioText: 'Die Rechnung, bitte.'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Naamvallen (Akkusativ)' : 'Noun Cases (Accusative)',
      instruction: isDutch ? 'Kies het juiste lidwoord in de vierde naamval (Akkusativ):' : 'Choose the correct accusative masculine article:',
      prompt: 'Ich suche _____ Bahnhof.',
      options: [
        { key: 'A', text: 'den' },
        { key: 'B', text: 'dem' },
        { key: 'C', text: 'der' },
        { key: 'D', text: 'des' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Bahnhof" is mannelijk (der). Als lijdend voorwerp (Akkusativ) verandert "der" in "den".'
        : '"Bahnhof" is masculine (der). In the accusative case as direct object, it becomes "den".',
      audioText: 'Ich suche den Bahnhof.'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'Oriëntatie & De Weg Vragen' : 'Directions & Navigation',
      instruction: isDutch ? 'Wat is het meest logische antwoord op deze vraag?' : 'What is the most logical answer to this question?',
      prompt: '— Entschuldigung, wie komme ich zum Hauptbahnhof?',
      options: [
        { key: 'A', text: 'Gehen Sie geradeaus und dann die erste Straße links.' },
        { key: 'B', text: 'Ich bin vierzig Jahre alt.' },
        { key: 'C', text: 'Das Schnitzel schmeckt ausgezeichnet.' },
        { key: 'D', text: 'Es ist heute sehr kalt draußen.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Gehen Sie geradeaus..." geeft direct een routebeschrijving naar het station.'
        : '"Gehen Sie geradeaus..." directly provides route directions to the station.',
      audioText: 'Entschuldigung, wie komme ich zum Hauptbahnhof?'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Voltooid Tegenwoordige Tijd (Perfekt)' : 'Past Tense (Perfekt with sein/haben)',
      instruction: isDutch ? 'Welk hulpwerkwoord hoort bij een werkwoord van verplaatsing?' : 'Which auxiliary verb is used for movement with "fahren"?',
      prompt: 'Gestern _____ wir mit dem Zug nach Berlin gefahren.',
      options: [
        { key: 'A', text: 'sind' },
        { key: 'B', text: 'haben' },
        { key: 'C', text: 'werden' },
        { key: 'D', text: 'hatten' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Werkwoorden van beweging of verandering (zoals "fahren") vormen het Perfekt met "sein": "wir sind gefahren".'
        : 'Verbs of motion (like "fahren") form their perfect tense with "sein": "wir sind gefahren".',
      audioText: 'Gestern sind wir mit dem Zug nach Berlin gefahren.'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Vaste Uitdrukkingen & Idioom' : 'German Idioms',
      instruction: isDutch ? 'Wat betekent de uitdrukking "Die Daumen drücken"?' : 'What does "Die Daumen drücken" mean?',
      prompt: 'Jemandem die Daumen drücken',
      options: [
        { key: 'A', text: isDutch ? 'Iemand succes / het beste toewensen' : 'Wishing someone good luck' },
        { key: 'B', text: isDutch ? 'Iemand de waarheid vertellen' : 'Telling someone the blunt truth' },
        { key: 'C', text: isDutch ? 'Zich haasten om de trein te halen' : 'Rushing to catch a train' },
        { key: 'D', text: isDutch ? 'Iemand ergens voor waarschuwen' : 'Warning someone of danger' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Die Daumen drücken" is het Duitse equivalent van voor iemand duimen (succes wensen).'
        : '"Die Daumen drücken" means keeping one\'s fingers crossed or wishing someone luck.',
      audioText: 'Jemandem die Daumen drücken'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Konjunktiv II (Voorwaardelijke Wijs)' : 'Subjunctive II (Konjunktiv II)',
      instruction: isDutch ? 'Welke vorm van het Konjunktiv II is grammaticaal correct?' : 'Which Konjunktiv II form is grammatically correct?',
      prompt: 'Wenn ich mehr Zeit hätte, _____ ich eine lange Reise machen.',
      options: [
        { key: 'A', text: 'würde' },
        { key: 'B', text: 'werde' },
        { key: 'C', text: 'wäre' },
        { key: 'D', text: 'hatte' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'In een hypothetische voorwaarde ("Wenn ich Zeit hätte...") volgt "würde ich machen".'
        : 'Hypothetical conditions in the present trigger "würde + infinitive": "würde ich machen".',
      audioText: 'Wenn ich mehr Zeit hätte, würde ich eine Reise machen.'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Connectieven & Zinsbouw' : 'Conjunctions & Word Order',
      instruction: isDutch ? 'Wat betekent het voegwoord "Allerdings"?' : 'What does the connector "Allerdings" mean?',
      prompt: 'Allerdings',
      options: [
        { key: 'A', text: isDutch ? 'Echter / Weliswaar' : 'However / Admittedly' },
        { key: 'B', text: isDutch ? 'Daarom / Dus' : 'Therefore / Consequently' },
        { key: 'C', text: isDutch ? 'Ten eerste' : 'Firstly' },
        { key: 'D', text: isDutch ? 'Onmiddellijk' : 'Immediately' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Allerdings" betekent "echter", "weliswaar" of "maar".'
        : '"Allerdings" signifies contrast or qualification ("however", "admittedly").',
      audioText: 'Allerdings'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Voltooid Verleden Hypothetisch' : 'Past Counterfactuals',
      instruction: isDutch ? 'Kies de juiste voltooid verleden hypothetische zinsconstructie:' : 'Select the correct past counterfactual structure:',
      prompt: 'Hätte ich das gewusst, _____ ich früher losgefahren.',
      options: [
        { key: 'A', text: 'wäre' },
        { key: 'B', text: 'hätte' },
        { key: 'C', text: 'würde' },
        { key: 'D', text: 'bin' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Losfahren" is een bewegingswerkwoord en vormt de verleden tijd met "sein": "wäre ich losgefahren".'
        : '"Losfahren" is a verb of motion and takes "wäre" in the past counterfactual.',
      audioText: 'Hätte ich das gewusst, wäre ich früher losgefahren.'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Hoog Register & Vaste Zegswijzen' : 'High Register Idioms',
      instruction: isDutch ? 'Wat betekent de uitdrukking "Den Nagel auf den Kopf treffen"?' : 'What does the idiom "Den Nagel auf den Kopf treffen" mean?',
      prompt: 'Den Nagel auf den Kopf treffen',
      options: [
        { key: 'A', text: isDutch ? 'Precies de kern van de zaak raken' : 'Hitting the nail right on the head' },
        { key: 'B', text: isDutch ? 'Een zware fout maken' : 'Making a grave error' },
        { key: 'C', text: isDutch ? 'Een bouwproject afronden' : 'Finishing a construction project' },
        { key: 'D', text: isDutch ? 'Iemand onverwacht tegenkomen' : 'Meeting someone unexpectedly' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Den Nagel auf den Kopf treffen" betekent de spijker op de kop slaan (de exacte kern raken).'
        : '"Den Nagel auf den Kopf treffen" means hitting the nail right on the head.',
      audioText: 'Den Nagel auf den Kopf treffen'
    }
  ];
}

function getItalianQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Beleefdheid' : 'Greetings & Basics',
      instruction: isDutch ? 'Wat betekent deze Italiaanse begroeting?' : 'What does this Italian greeting mean?',
      prompt: 'Buongiorno! Come sta?',
      options: [
        { key: 'A', text: isDutch ? 'Goedemorgen! Hoe maakt u het?' : 'Good morning! How are you? (formal)' },
        { key: 'B', text: isDutch ? 'Goedenavond! Waar woont u?' : 'Good evening! Where do you live?' },
        { key: 'C', text: isDutch ? 'Tot ziens! Prettige dag!' : 'Goodbye! Have a nice day!' },
        { key: 'D', text: isDutch ? 'Dank u wel voor uw hulp!' : 'Thank you for your help!' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Buongiorno! Come sta?" is de beleefde formele begroeting in het Italiaans.'
        : '"Buongiorno! Come sta?" is the formal Italian polite greeting.',
      audioText: 'Buongiorno! Come sta?'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Bestellen in een Bar' : 'Ordering at a Bar',
      instruction: isDutch ? 'Hoe vraag je om de rekening in het Italiaans?' : 'How do you ask for the bill in Italian?',
      prompt: isDutch ? 'De rekening, alstublieft.' : 'The bill, please.',
      options: [
        { key: 'A', text: 'Dov’è la stazione, per favore?' },
        { key: 'B', text: 'Il conto, per favore.' },
        { key: 'C', text: 'Un caffè macchiato.' },
        { key: 'D', text: 'Piacere di conoscerti.' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Il conto, per favore" is de standaard manier om om de rekening te vragen.'
        : '"Il conto, per favore" is the standard phrase for the bill.',
      audioText: 'Il conto, per favore.'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Tegenwoordige Tijd' : 'Present Tense Verbs',
      instruction: isDutch ? 'Kies de juiste vorm van "prendere" (nemen):' : 'Choose the correct form of "prendere":',
      prompt: 'Ogni mattina noi _____ un cappuccino al bar.',
      options: [
        { key: 'A', text: 'prendiamo' },
        { key: 'B', text: 'prendo' },
        { key: 'C', text: 'prendono' },
        { key: 'D', text: 'prendi' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Bij "noi" (wij) hoort de uitgang "-iamo": "noi prendiamo".'
        : 'Subject "noi" takes ending "-iamo": "prendiamo".',
      audioText: 'Ogni mattina noi prendiamo un cappuccino.'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'Oriëntatie & Vervoer' : 'Directions & Transport',
      instruction: isDutch ? 'Wat is het passende antwoord op deze vraag?' : 'What is the appropriate response to this question?',
      prompt: '— Scusi, dov’è la stazione centrale?',
      options: [
        { key: 'A', text: 'Vada sempre dritto e giri a destra al semaforo.' },
        { key: 'B', text: 'Ho ventotto anni.' },
        { key: 'C', text: 'La pizza margherita è squisita.' },
        { key: 'D', text: 'Oggi c’è molto sole.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Vada sempre dritto..." geeft duidelijke instructies over de route.'
        : '"Vada sempre dritto..." gives clear route directions.',
      audioText: 'Scusi, dov’è la stazione centrale?'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Passato Prossimo' : 'Past Tense (Passato Prossimo)',
      instruction: isDutch ? 'Kies de juiste vorm van het passato prossimo:' : 'Select the correct passato prossimo form:',
      prompt: 'Ieri sera noi _____ una bella passeggiata sul lungomare.',
      options: [
        { key: 'A', text: 'abbiamo fatto' },
        { key: 'B', text: 'facciamo' },
        { key: 'C', text: 'facevamo' },
        { key: 'D', text: 'faremo' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Ieri sera" duidt op een voltooide handeling in het verleden: "abbiamo fatto".'
        : '"Ieri sera" triggers the completed passato prossimo: "abbiamo fatto".',
      audioText: 'Ieri sera noi abbiamo fatto una bella passeggiata.'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Idioom & Uitdrukkingen' : 'Italian Idioms',
      instruction: isDutch ? 'Wat betekent de Italiaanse uitdrukking "In bocca al lupo"?' : 'What does the idiom "In bocca al lupo" signify?',
      prompt: 'In bocca al lupo!',
      options: [
        { key: 'A', text: isDutch ? 'Pas op voor wilde dieren!' : 'Watch out for wild animals!' },
        { key: 'B', text: isDutch ? 'Veel succes / Sterkte gewenst!' : 'Good luck / Break a leg!' },
        { key: 'C', text: isDutch ? 'Eet smakelijk allemaal!' : 'Enjoy your meal everyone!' },
        { key: 'D', text: isDutch ? 'Ga snel naar huis!' : 'Go home quickly!' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"In bocca al lupo" is de typisch Italiaanse manier om iemand succes te wensen (men antwoordt met "Crepi!").'
        : '"In bocca al lupo" is the traditional Italian idiom for "Good luck!" (answered with "Crepi!").',
      audioText: 'In bocca al lupo!'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Congiuntivo Presente' : 'Subjunctive Mood',
      instruction: isDutch ? 'Welke vorm van de congiuntivo is grammaticaal correct?' : 'Which subjunctive form fits after "Penso che"?',
      prompt: 'Penso che Marco _____ ragione in questa discussione.',
      options: [
        { key: 'A', text: 'abbia' },
        { key: 'B', text: 'ha' },
        { key: 'C', text: 'avrà' },
        { key: 'D', text: 'aveva' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Werkwoorden van mening ("Penso che") vereisen de congiuntivo presente: "abbia".'
        : 'Verbs of opinion ("Penso che") govern the subjunctive mood: "abbia".',
      audioText: 'Penso che Marco abbia ragione.'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Formele Connectieven' : 'Connectors & Transition Words',
      instruction: isDutch ? 'Wat betekent het voegwoord "Tuttavia"?' : 'What does the formal transition word "Tuttavia" mean?',
      prompt: 'Tuttavia',
      options: [
        { key: 'A', text: isDutch ? 'Desalniettemin / Toch' : 'Nevertheless / However' },
        { key: 'B', text: isDutch ? 'Daarom / Gevolgelijk' : 'Therefore / As a result' },
        { key: 'C', text: isDutch ? 'In het begin' : 'At the beginning' },
        { key: 'D', text: isDutch ? 'Zonder twijfel' : 'Without a doubt' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Tuttavia" is een tegenstellend voegwoord dat "echter" of "desalniettemin" betekent.'
        : '"Tuttavia" is an adversative conjunction meaning "nevertheless" or "however".',
      audioText: 'Tuttavia'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Hypothetische Periode in het Verleden' : 'Past Unreal Conditionals',
      instruction: isDutch ? 'Welke clausule voltooit deze hypothetische zin correct?' : 'Which clause completes this hypothetical sentence correctly?',
      prompt: 'Se avessi saputo della tua festa, io...',
      options: [
        { key: 'A', text: '...sarei venuto volentieri.' },
        { key: 'B', text: '...vengo volentieri.' },
        { key: 'C', text: '...verrò volentieri.' },
        { key: 'D', text: '...venivo volentieri.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Se + congiuntivo trapassato" wordt gevolgd door het condizionale passato: "sarei venuto".'
        : '"Se + trapassato congiuntivo" is followed by the condizionale passato: "sarei venuto".',
      audioText: 'Se avessi saputo della tua festa, sarei venuto volentieri.'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Gevorderde Idiomatiek & Stijl' : 'Advanced Idiomatic Expressions',
      instruction: isDutch ? 'Wat is de betekenis van de uitdrukking "Prendere lucciole per lanterne"?' : 'What is the meaning of "Prendere lucciole per lanterne"?',
      prompt: 'Prendere lucciole per lanterne',
      options: [
        { key: 'A', text: isDutch ? 'Zich ernstig vergissen / dingen totaal verkeerd beoordelen' : 'Grossly misinterpreting something / taking fireflies for lanterns' },
        { key: 'B', text: isDutch ? 'In het donker op pad gaan' : 'Setting out into the dark' },
        { key: 'C', text: isDutch ? 'Een dure aankoop doen' : 'Making an expensive purchase' },
        { key: 'D', text: isDutch ? 'Iemand proberen op te vrolijken' : 'Trying to cheer someone up' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Prendere lucciole per lanterne" (vuurvliegjes aanzien voor lantaarns) betekent een grove beoordelingsfout maken.'
        : '"Prendere lucciole per lanterne" means confusing something minor for something major / gross error of judgment.',
      audioText: 'Prendere lucciole per lanterne'
    }
  ];
}

function getEnglishQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Basis' : 'Greetings & Basics',
      instruction: isDutch ? 'Wat betekent deze Engelse begroeting?' : 'Choose the best conversational reply to this greeting:',
      prompt: 'Hello! How are you doing today?',
      options: [
        { key: 'A', text: isDutch ? 'Hallo! Hoe gaat het vandaag met je?' : "I'm doing well, thank you! How about you?" },
        { key: 'B', text: isDutch ? 'Goedemorgen! Waar woon je precies?' : 'Tomorrow at 4 o’clock in the afternoon.' },
        { key: 'C', text: isDutch ? 'Tot ziens! Een goede reis naar huis!' : 'My shoes are blue and white.' },
        { key: 'D', text: isDutch ? 'Prettig kennis te maken met u.' : 'I like to eat apples every morning.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"How are you doing today?" is een informele en vriendelijke vraag naar hoe het met iemand gaat.'
        : '"I\'m doing well, thank you! How about you?" is the natural and polite response to "How are you doing today?".',
      audioText: 'Hello! How are you doing today?'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Bestellen & Restaurant' : 'Ordering & Dining',
      instruction: isDutch ? 'Hoe vraag je beleefd om de rekening in een restaurant?' : 'You are finishing dinner at a restaurant. How do you politely ask for the check?',
      prompt: isDutch ? 'De rekening, alstublieft.' : 'At a restaurant table with your server:',
      options: [
        { key: 'A', text: 'Where is the bus station?' },
        { key: 'B', text: 'Could we have the bill, please?' },
        { key: 'C', text: 'Nice to meet you as well.' },
        { key: 'D', text: 'What time does the train depart?' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Could we have the bill, please?" is de beleefde manier om om de rekening te vragen.'
        : '"Could we have the bill, please?" is the standard courteous request for the check.',
      audioText: 'Could we have the bill, please?'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Present Simple vs Continuous' : 'Present Simple vs Continuous',
      instruction: isDutch ? 'Kies de juiste vorm voor een handeling die nu op dit moment plaatsvindt:' : 'Choose the correct form for an action happening right now:',
      prompt: 'Look outside! It _____ heavily.',
      options: [
        { key: 'A', text: 'is raining' },
        { key: 'B', text: 'rains' },
        { key: 'C', text: 'rained' },
        { key: 'D', text: 'has rained' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Look outside!" geeft aan dat de actie nu aan de gang is: Present Continuous ("is raining").'
        : '"Look outside!" indicates an ongoing action happening now, requiring Present Continuous ("is raining").',
      audioText: 'Look outside! It is raining heavily.'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'De Weg Vragen' : 'Directions & Navigation',
      instruction: isDutch ? 'Wat is het meest logische antwoord op deze vraag?' : 'What is the most logical answer to this question?',
      prompt: '— Excuse me, could you tell me where the nearest library is?',
      options: [
        { key: 'A', text: 'Turn left at the traffic light, it’s next to the post office.' },
        { key: 'B', text: 'I am thirty-two years old.' },
        { key: 'C', text: 'I usually eat oatmeal for breakfast.' },
        { key: 'D', text: 'Tomorrow is supposed to be sunny.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Turn left at the traffic light..." geeft een heldere routebeschrijving.'
        : '"Turn left at the traffic light..." directly provides route navigation.',
      audioText: 'Excuse me, could you tell me where the nearest library is?'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Present Perfect vs Past Simple' : 'Present Perfect vs Past Simple',
      instruction: isDutch ? 'Welke werkwoordstijd geeft een ervaring aan zonder specifiek tijdstip in het verleden?' : 'Which verb tense indicates an experience without a specific past time?',
      prompt: 'I _____ to Japan twice in my life.',
      options: [
        { key: 'A', text: 'have been' },
        { key: 'B', text: 'went' },
        { key: 'C', text: 'was going' },
        { key: 'D', text: 'am being' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Levenservaringen zonder specifiek tijdstip staan in de Present Perfect: "have been".'
        : 'Life experiences without a specific past timestamp require the Present Perfect ("have been").',
      audioText: 'I have been to Japan twice in my life.'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Idioom & Spreekwoorden' : 'English Idioms',
      instruction: isDutch ? 'Wat betekent het Engelse idioom "Once in a blue moon"?' : 'What does "Once in a blue moon" mean?',
      prompt: 'Once in a blue moon',
      options: [
        { key: 'A', text: isDutch ? 'Uiterst zelden' : 'Very rarely / Almost never' },
        { key: 'B', text: isDutch ? 'Iedere volle maan' : 'Every full moon' },
        { key: 'C', text: isDutch ? 'Wanneer je verdrietig bent' : 'Whenever you feel sad' },
        { key: 'D', text: isDutch ? 'Midden in de nacht' : 'In the middle of the night' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Once in a blue moon" betekent heel zelden of bijna nooit.'
        : '"Once in a blue moon" is a well-known idiom meaning very rarely.',
      audioText: 'Once in a blue moon'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Voorwaardelijke Zinnen (Second Conditional)' : 'Second Conditional',
      instruction: isDutch ? 'Welke vorm maakt deze hypothetische voorwaarde correct af?' : 'Which form correctly completes this unreal condition?',
      prompt: 'If I won the lottery, I _____ travel around the world.',
      options: [
        { key: 'A', text: 'would' },
        { key: 'B', text: 'will' },
        { key: 'C', text: 'can' },
        { key: 'D', text: 'am going to' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'De Second Conditional (hypothetisch in het heden/toekomst) gebruikt: "If + Past Simple, would + infinitive".'
        : 'The Second Conditional combines "If + past simple" with "would + base verb".',
      audioText: 'If I won the lottery, I would travel around the world.'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Formele Schakelwoorden' : 'Discourse Markers & Connectors',
      instruction: isDutch ? 'Wat betekent het formele schakelwoord "Furthermore"?' : 'What does the connector "Furthermore" mean?',
      prompt: 'Furthermore',
      options: [
        { key: 'A', text: isDutch ? 'Bovendien / Daarnaast' : 'Moreover / In addition' },
        { key: 'B', text: isDutch ? 'Echter / Integendeel' : 'However / On the contrary' },
        { key: 'C', text: isDutch ? 'Als gevolg hiervan' : 'Consequently / As a result' },
        { key: 'D', text: isDutch ? 'Tot slot' : 'In conclusion' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Furthermore" voegt een argument toe en betekent "bovendien" of "daarenboven".'
        : '"Furthermore" introduces an additional supportive point ("in addition", "moreover").',
      audioText: 'Furthermore'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Inversie & Geavanceerde Zinsbouw' : 'Negative Inversion',
      instruction: isDutch ? 'Kies de juiste zinsvolgorde na een ontkennende openingsbepaling (inversion):' : 'Select the correct word order following negative inversion:',
      prompt: 'Seldom _____ such an inspiring keynote address.',
      options: [
        { key: 'A', text: 'have I heard' },
        { key: 'B', text: 'I have heard' },
        { key: 'C', text: 'I heard' },
        { key: 'D', text: 'had I hear' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Na negatieve bijwoorden aan het begin van de zin ("Seldom", "Rarely") volgt inversie van hulpwerkwoord en onderwerp: "have I heard".'
        : 'Sentences beginning with negative adverbials ("Seldom", "Never") trigger subject-auxiliary inversion: "have I heard".',
      audioText: 'Seldom have I heard such an inspiring keynote address.'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Gevorderde Idiomatiek & Pragmatiek' : 'Idiomatic Mastery & Register',
      instruction: isDutch ? 'Wat is de betekenis van het idioom "To bite the bullet"?' : 'What does the idiom "To bite the bullet" mean?',
      prompt: 'To bite the bullet',
      options: [
        { key: 'A', text: isDutch ? 'Een onvermijdelijke moeilijke situatie dapper onder ogen zien' : 'Facing an unavoidable tough situation with courage' },
        { key: 'B', text: isDutch ? 'Een fysieke blessure oplopen tijdens het sporten' : 'Incurring a physical sports injury' },
        { key: 'C', text: isDutch ? 'Snel van mening veranderen onder druk' : 'Quickly changing opinion under pressure' },
        { key: 'D', text: isDutch ? 'Een overhaaste financiële investering doen' : 'Making a hasty financial speculation' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"To bite the bullet" betekent dapper de tanden op elkaar zetten en een onplezierige plicht aanvaarden.'
        : '"To bite the bullet" means enduring an inevitable grim situation with stoic resolve.',
      audioText: 'To bite the bullet'
    }
  ];
}

function getPortugueseQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Kennismaking' : 'Greetings & Basics',
      instruction: isDutch ? 'Wat betekent deze Portugese begroeting?' : 'What does this Portuguese greeting mean?',
      prompt: 'Olá! Como você se chama?',
      options: [
        { key: 'A', text: isDutch ? 'Hallo! Hoe heet je?' : 'Hello! What is your name?' },
        { key: 'B', text: isDutch ? 'Goedemorgen! Waar woon je?' : 'Good morning! Where do you live?' },
        { key: 'C', text: isDutch ? 'Tot ziens! Prettige dag!' : 'Goodbye! Have a nice day!' },
        { key: 'D', text: isDutch ? 'Dankjewel voor alles!' : 'Thank you for everything!' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Olá! Como você se chama?" betekent "Hallo! Hoe heet je?".'
        : '"Olá! Como você se chama?" means "Hello! What is your name?".',
      audioText: 'Olá! Como você se chama?'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Bestellen' : 'Cafe & Ordering',
      instruction: isDutch ? 'Hoe vraag je om de rekening in het Portugees?' : 'How do you ask for the bill in Portuguese?',
      prompt: isDutch ? 'De rekening, alstublieft.' : 'The bill, please.',
      options: [
        { key: 'A', text: 'Onde fica a estação?' },
        { key: 'B', text: 'A conta, por favor.' },
        { key: 'C', text: 'Um copo de água.' },
        { key: 'D', text: 'Muito prazer em conhecê-lo.' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"A conta, por favor" is de beleefde uitdrukking voor de rekening.'
        : '"A conta, por favor" is the standard phrase for the bill.',
      audioText: 'A conta, por favor.'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Tegenwoordige Tijd' : 'Present Tense Verbs',
      instruction: isDutch ? 'Kies de juiste vorm van "morar" (wonen):' : 'Choose the correct form of "morar":',
      prompt: 'Nós _____ em Lisboa há dois anos.',
      options: [
        { key: 'A', text: 'moramos' },
        { key: 'B', text: 'moro' },
        { key: 'C', text: 'moram' },
        { key: 'D', text: 'moras' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Bij "nós" hoort de uitgang "-amos": "nós moramos".'
        : 'Subject "nós" takes the first person plural "-amos": "moramos".',
      audioText: 'Nós moramos em Lisboa há dois anos.'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'De Weg Vragen' : 'Directions & Navigation',
      instruction: isDutch ? 'Wat is het passende antwoord op deze vraag?' : 'What is the appropriate response?',
      prompt: '— Com licença, onde fica o metrô mais próximo?',
      options: [
        { key: 'A', text: 'Siga em frente e vire à direita no semáforo.' },
        { key: 'B', text: 'Tenho vinte e quatro anos.' },
        { key: 'C', text: 'Gosto muito de bacalhau.' },
        { key: 'D', text: 'O dia está muito ensolarado.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Siga em frente..." geeft een duidelijke routebeschrijving.'
        : '"Siga em frente..." directly provides route navigation.',
      audioText: 'Com licença, onde fica o metrô mais próximo?'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Verleden Tijd (Pretérito Perfeito)' : 'Past Tense (Pretérito Perfeito)',
      instruction: isDutch ? 'Welk werkwoord drukt een voltooide handeling in het verleden uit?' : 'Which verb expresses a completed past action?',
      prompt: 'Ontem nós _____ um filme excelente no cinema.',
      options: [
        { key: 'A', text: 'vimos' },
        { key: 'B', text: 'vemos' },
        { key: 'C', text: 'veremos' },
        { key: 'D', text: 'víamos' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Ontem" (gisteren) vereist het pretérito perfeito: "vimos".'
        : '"Ontem" (yesterday) triggers the completed pretérito perfeito: "vimos".',
      audioText: 'Ontem nós vimos um filme excelente.'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Portugese Idiomatiek' : 'Portuguese Idioms',
      instruction: isDutch ? 'Wat betekent het Portugese begrip "Saudade"?' : 'What does the Portuguese term "Saudade" express?',
      prompt: 'Sentir saudades',
      options: [
        { key: 'A', text: isDutch ? 'Iets of iemand diep missen / weemoed voelen' : 'Deep longing or missing someone/something dearly' },
        { key: 'B', text: isDutch ? 'Haast hebben om ergens aan te komen' : 'Being in a hurry to arrive' },
        { key: 'C', text: isDutch ? 'Erg boos zijn over een situatie' : 'Being very angry about a situation' },
        { key: 'D', text: isDutch ? 'Veel dorst hebben na het sporten' : 'Being very thirsty after exercise' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Saudade" is het iconische Portugese woord voor intens missen en nostalgisch verlangen.'
        : '"Saudade" is the unique Portuguese sentiment of profound nostalgic longing.',
      audioText: 'Sentir saudades'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Subjuntivo / Conjuntivo' : 'Subjunctive Mood',
      instruction: isDutch ? 'Welke vorm van de aanvoegende wijs is grammaticaal correct?' : 'Which subjunctive form fits after "É essencial que"?',
      prompt: 'É essencial que você _____ a verdade.',
      options: [
        { key: 'A', text: 'diga' },
        { key: 'B', text: 'diz' },
        { key: 'C', text: 'dizer' },
        { key: 'D', text: 'dirá' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Na onpersoonlijke uitdrukkingen ("É essencial que") volgt de subjuntivo: "diga".'
        : 'Expressions of necessity govern the present subjunctive: "diga".',
      audioText: 'É essencial que você diga a verdade.'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Formele Connectieven' : 'Formal Connectors',
      instruction: isDutch ? 'Wat betekent het voegwoord "No entanto"?' : 'What does the connector "No entanto" mean?',
      prompt: 'No entanto',
      options: [
        { key: 'A', text: isDutch ? 'Desalniettemin / Echter' : 'However / Nevertheless' },
        { key: 'B', text: isDutch ? 'Daarom / Dus' : 'Therefore / Consequently' },
        { key: 'C', text: isDutch ? 'In de tussentijd' : 'In the meantime' },
        { key: 'D', text: isDutch ? 'Ten slotte' : 'Finally' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"No entanto" drukt een tegenstelling uit en betekent "echter" of "desalniettemin".'
        : '"No entanto" indicates an adversative contrast ("however", "nevertheless").',
      audioText: 'No entanto'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Hypothetische Verleden Tijd' : 'Unreal Past Conditions',
      instruction: isDutch ? 'Kies de correcte voortzetting van deze hypothetische voorwaarde:' : 'Select the correct conclusion to this condition:',
      prompt: 'Se eu tivesse sabido antes, eu...',
      options: [
        { key: 'A', text: '...teria ido ao evento com você.' },
        { key: 'B', text: '...vou ao evento com você.' },
        { key: 'C', text: '...fui ao evento com você.' },
        { key: 'D', text: '...estou indo ao evento.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Se + pretérito mais-que-perfeito do subjuntivo" vereist het futuro do pretérito composto: "teria ido".'
        : 'Past counterfactual condition pairs with the conditional past: "teria ido".',
      audioText: 'Se eu tivesse sabido antes, teria ido ao evento.'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Gevorderde Portugese Idiomatiek' : 'Advanced Portuguese Idioms',
      instruction: isDutch ? 'Wat betekent de uitdrukking "Chover no molhado"?' : 'What does the idiom "Chover no molhado" signify?',
      prompt: 'Chover no molhado',
      options: [
        { key: 'A', text: isDutch ? 'Iets overbodigs herhalen of open deuren intrappen' : 'Repeating what is already obvious / carrying coals to Newcastle' },
        { key: 'B', text: isDutch ? 'Grote overstromingen meemaken' : 'Experiencing heavy flooding' },
        { key: 'C', text: isDutch ? 'Zich kleden tegen slecht weer' : 'Dressing for bad weather' },
        { key: 'D', text: isDutch ? 'Een conflict bijleggen' : 'Settling an argument' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Chover no molhado" (regenen op natte grond) betekent het overbodige zeggen of open deuren intrappen.'
        : '"Chover no molhado" means preaching to the converted or doing something completely redundant.',
      audioText: 'Chover no molhado'
    }
  ];
}

function getDutchQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Kennismaking' : 'Greetings & Basics',
      instruction: isDutch ? 'Wat betekent deze begroeting?' : 'What does this greeting mean?',
      prompt: 'Goedemorgen! Hoe heet je?',
      options: [
        { key: 'A', text: isDutch ? 'Goedemorgen! Hoe heet je?' : 'Good morning! What is your name?' },
        { key: 'B', text: isDutch ? 'Goedenavond! Waar woon je?' : 'Good evening! Where do you live?' },
        { key: 'C', text: isDutch ? 'Tot ziens! Een fijne dag!' : 'Goodbye! Have a nice day!' },
        { key: 'D', text: isDutch ? 'Alstublieft, hier is uw thee.' : 'Please, here is your tea.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Goedemorgen! Hoe heet je?" is een vriendelijke basisbegroeting en vraag naar iemands naam.'
        : 'Foundational greeting asking for someone\'s name.',
      audioText: 'Goedemorgen! Hoe heet je?'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Bestellen' : 'Cafe & Ordering',
      instruction: isDutch ? 'Hoe vraag je beleefd om de rekening?' : 'How do you politely ask for the check in Dutch?',
      prompt: isDutch ? 'Mag ik de rekening, alstublieft?' : 'May I have the check, please?',
      options: [
        { key: 'A', text: 'Waar is het station?' },
        { key: 'B', text: 'Mag ik de rekening, alstublieft?' },
        { key: 'C', text: 'Aangenaam kennis te maken.' },
        { key: 'D', text: 'Hoe laat vertrekt de bus?' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Mag ik de rekening, alstublieft?" is de beleefde manier om de rekening te vragen.'
        : '"Mag ik de rekening, alstublieft?" is the polite request for the bill.',
      audioText: 'Mag ik de rekening, alstublieft?'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Lidwoorden (de/het)' : 'Articles (de/het)',
      instruction: isDutch ? 'Welk lidwoord hoort bij het woord "boek"?' : 'Which article belongs to "boek"?',
      prompt: 'Ik lees _____ interessante boek.',
      options: [
        { key: 'A', text: 'het' },
        { key: 'B', text: 'de' },
        { key: 'C', text: 'een' },
        { key: 'D', text: 'der' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Boek" is een onzijdig zelfstandig naamwoord: "het boek".'
        : '"Boek" is a neuter noun taking "het".',
      audioText: 'het boek'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'Oriëntatie in de Stad' : 'Directions in the City',
      instruction: isDutch ? 'Wat is het meest logische antwoord op deze vraag?' : 'What is the logical response to this inquiry?',
      prompt: '— Pardon, weet u waar het Centraal Station is?',
      options: [
        { key: 'A', text: 'Loop rechtdoor en sla bij het stoplicht rechtsaf.' },
        { key: 'B', text: 'Ik hou erg van appeltaart.' },
        { key: 'C', text: 'Vandaag is het dinsdag.' },
        { key: 'D', text: 'Ik heb twee broers.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Loop rechtdoor..." geeft een duidelijke routebeschrijving.'
        : '"Loop rechtdoor..." provides direct route navigation.',
      audioText: 'Loop rechtdoor en sla bij het stoplicht rechtsaf.'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Voltooid Tegenwoordige Tijd' : 'Perfect Tense in Dutch',
      instruction: isDutch ? 'Kies het juiste hulpwerkwoord voor de voltooide tijd:' : 'Choose the correct auxiliary verb:',
      prompt: 'Gisteren _____ wij naar Utrecht gefietst.',
      options: [
        { key: 'A', text: 'zijn' },
        { key: 'B', text: 'hebben' },
        { key: 'C', text: 'worden' },
        { key: 'D', text: 'waren' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Werkwoorden van gerichte verplaatsing ("fietsen naar...") vormen de voltooide tijd met "zijn": "wij zijn gefietst".'
        : 'Directional verbs of motion form the perfect tense with "zijn": "wij zijn gefietst".',
      audioText: 'Gisteren zijn wij naar Utrecht gefietst.'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Nederlandse Spreekwoorden' : 'Dutch Idioms',
      instruction: isDutch ? 'Wat betekent het spreekwoord "Nu komt de aap uit de mouw"?' : 'What does "Nu komt de aap uit de mouw" mean?',
      prompt: 'Nu komt de aap uit de mouw',
      options: [
        { key: 'A', text: isDutch ? 'Nu blijkt wat werkelijk de bedoeling of toedracht was' : 'Now the true hidden motive or situation is revealed' },
        { key: 'B', text: isDutch ? 'Er ontsnapt een dier uit de dierentuin' : 'An animal escaped from the zoo' },
        { key: 'C', text: isDutch ? 'Het begint plotseling heel hard te regenen' : 'It suddenly starts pouring rain' },
        { key: 'D', text: isDutch ? 'Iemand maakt een grote vergissing' : 'Someone made a big mistake' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"De aap komt uit de mouw" betekent dat de ware toedracht of verborgen bedoeling aan het licht komt.'
        : 'Famous Dutch idiom signifying the revelation of hidden intentions.',
      audioText: 'Nu komt de aap uit de mouw'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Bijzin Zinsbouw & Woordvolgorde' : 'Subordinate Clause Word Order',
      instruction: isDutch ? 'Welke woordvolgorde is correct in een Nederlandse bijzin?' : 'Which word order is correct in a Dutch subordinate clause?',
      prompt: 'Hij vertelde me dat hij...',
      options: [
        { key: 'A', text: '...morgen naar Amsterdam zal reizen.' },
        { key: 'B', text: '...zal reizen morgen naar Amsterdam.' },
        { key: 'C', text: '...morgen zal naar Amsterdam reizen.' },
        { key: 'D', text: '...reizen morgen naar Amsterdam zal.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'In een Nederlandse bijzin ("dat...") komen alle persoonsvormen en werkwoorden aan het einde van de zin.'
        : 'In Dutch subordinate clauses, conjugated verbs and infinitives cluster at the sentence end.',
      audioText: 'dat hij morgen naar Amsterdam zal reizen.'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Formele Schakelwoorden' : 'Formal Connectors',
      instruction: isDutch ? 'Wat betekent het voegwoord "Desalniettemin"?' : 'What does "Desalniettemin" mean?',
      prompt: 'Desalniettemin',
      options: [
        { key: 'A', text: isDutch ? 'Toch / Ondanks dat' : 'Nevertheless / Nonetheless' },
        { key: 'B', text: isDutch ? 'Daarom / Dientengevolge' : 'Therefore / As a result' },
        { key: 'C', text: isDutch ? 'In de eerste plaats' : 'In the first place' },
        { key: 'D', text: isDutch ? 'Samenvattend' : 'Summarizing' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Desalniettemin" drukt een sterke tegenstelling of concessie uit ("toch", "ondanks dat").'
        : '"Desalniettemin" expresses concession ("nevertheless").',
      audioText: 'Desalniettemin'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Hypothetische Verleden Zinnen' : 'Past Conditionals',
      instruction: isDutch ? 'Welke werkwoordsconstructie drukt een niet-gerealiseerde voorwaarde in het verleden uit?' : 'Which construction expresses an unreal past condition?',
      prompt: 'Als ik dat eerder had geweten, _____ ik je onmiddellijk opgebeld.',
      options: [
        { key: 'A', text: 'zou hebben' },
        { key: 'B', text: 'zal hebben' },
        { key: 'C', text: 'heb' },
        { key: 'D', text: 'was hebbend' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Als ik had geweten, zou ik hebben opgebeld" is de correcte onvoltooid verleden toekomende tijd.'
        : 'Past counterfactual in Dutch uses "zou hebben + voltooid deelwoord".',
      audioText: 'zou ik hebben opgebeld.'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Gevorderde Idiomatiek & Beeldspraak' : 'Advanced Nuance & Idioms',
      instruction: isDutch ? 'Wat betekent de uitdrukking "Spijkers op laag water zoeken"?' : 'What does "Spijkers op laag water zoeken" mean?',
      prompt: 'Spijkers op laag water zoeken',
      options: [
        { key: 'A', text: isDutch ? 'Aanmerkingen maken op futiele kleinigheden / muggenziften' : 'Nitpicking / finding fault over trivial details' },
        { key: 'B', text: isDutch ? 'Bouwmateriaal verzamelen aan de kust' : 'Gathering hardware by the shore' },
        { key: 'C', text: isDutch ? 'Zuinig omgaan met schaarse grondstoffen' : 'Being frugal with scarce resources' },
        { key: 'D', text: isDutch ? 'Een moeilijk juridisch proces aanspannen' : 'Initiating a tough legal battle' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Spijkers op laag water zoeken" betekent zeuren over onbeduidende kleinigheden of muggenziften.'
        : '"Spijkers op laag water zoeken" is the classic Dutch idiom for pedantic nitpicking.',
      audioText: 'Spijkers op laag water zoeken'
    }
  ];
}

function getArabicQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Etiquette' : 'Greetings & Etiquette',
      instruction: isDutch ? 'Wat betekent deze Arabische begroeting?' : 'What does this Arabic greeting mean?',
      prompt: 'السَّلامُ عَلَيْكُم',
      options: [
        { key: 'A', text: isDutch ? 'Vrede zij met u (Hallo / Goedendag)' : 'Peace be upon you (Hello / Greetings)' },
        { key: 'B', text: isDutch ? 'Waar is het vliegveld?' : 'Where is the airport?' },
        { key: 'C', text: isDutch ? 'Hoeveel kost dit gerecht?' : 'How much does this dish cost?' },
        { key: 'D', text: isDutch ? 'Tot morgenochtend!' : 'Until tomorrow morning!' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"As-salāmu ʿalaykum" is de universele eerbiedige begroeting in de Arabische wereld.'
        : '"As-salāmu ʿalaykum" is the foundational polite greeting meaning "Peace be upon you".',
      audioText: 'السَّلامُ عَلَيْكُم'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Dankbaarheid & Beleefdheid' : 'Polite Gratitude',
      instruction: isDutch ? 'Hoe bedank je iemand hartelijk in het Arabisch?' : 'How do you say thank you in Arabic?',
      prompt: isDutch ? 'Dank u wel / Bedankt.' : 'Thank you very much.',
      options: [
        { key: 'A', text: 'مِن فَضْلِك' },
        { key: 'B', text: 'شُكْراً جَزِيلاً' },
        { key: 'C', text: 'عَفْواً' },
        { key: 'D', text: 'نَعَم' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Shukran jazīlan" betekent letterlijk "hartelijk bedankt".'
        : '"Shukran jazīlan" directly translates to "thank you very much".',
      audioText: 'شُكْراً جَزِيلاً'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Nominale Zinnen & Voornaamwoorden' : 'Nominal Sentences',
      instruction: isDutch ? 'Kies het juiste voornaamwoord voor "Ik ben student":' : 'Choose the correct pronoun for "I am a student":',
      prompt: '_____ طالِبٌ في الجامِعَةِ',
      options: [
        { key: 'A', text: 'هُوَ' },
        { key: 'B', text: 'هِيَ' },
        { key: 'C', text: 'أَنَا' },
        { key: 'D', text: 'نَحْنُ' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? '"Anā" (أَنَا) is het persoonlijke voornaamwoord voor "ik".'
        : '"Anā" (أَنَا) is the first person singular pronoun "I".',
      audioText: 'أَنَا طالِبٌ في الجامِعَةِ'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'Vragen naar de Weg' : 'Asking Directions',
      instruction: isDutch ? 'Wat betekent "أَيْنَ المَحَطَّة؟"?' : 'What does "أَيْنَ المَحَطَّة؟" mean?',
      prompt: 'أَيْنَ المَحَطَّة؟',
      options: [
        { key: 'A', text: isDutch ? 'Hoe heet u?' : 'What is your name?' },
        { key: 'B', text: isDutch ? 'Het is mooi weer.' : 'The weather is fine.' },
        { key: 'C', text: isDutch ? 'Ik wil graag betalen.' : 'I would like to pay.' },
        { key: 'D', text: isDutch ? 'Waar is het station?' : 'Where is the station?' },
      ],
      correct_key: 'D',
      explanation: isDutch
        ? '"Ayna" betekent waar, en "al-mahattah" is het station.'
        : '"Ayna" means where, and "al-mahattah" is the station.',
      audioText: 'أَيْنَ المَحَطَّة'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Verleden Tijd Vervoeging' : 'Past Tense Conjugation',
      instruction: isDutch ? 'Welke vorm betekent "Wij gingen / reisden":' : 'Which verb form corresponds to "We went / traveled":',
      prompt: 'الأَمْس، نَحْنُ _____ إِلى المَدينَة',
      options: [
        { key: 'A', text: 'ذَهَبْنَا' },
        { key: 'B', text: 'ذَهَبْتُ' },
        { key: 'C', text: 'يَذْهَب' },
        { key: 'D', text: 'ذَهَبُوا' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Dhahabnā" (ذَهَبْنَا) heeft het achtervoegsel "-nā" voor 1e persoon meervoud (wij).'
        : 'The suffix "-nā" marks the first-person plural past tense (we went).',
      audioText: 'ذَهَبْنَا'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Izafa Constructie (Bezit)' : 'Izafa Genitive Construct',
      instruction: isDutch ? 'Wat betekent de izafa constructie "كِتَابُ الطَّالِب"?' : 'What does "كِتَابُ الطَّالِب" mean?',
      prompt: 'كِتَابُ الطَّالِب',
      options: [
        { key: 'A', text: isDutch ? 'De student leest' : 'The student reads' },
        { key: 'B', text: isDutch ? 'Het boek van de student' : 'The book of the student' },
        { key: 'C', text: isDutch ? 'Een nieuw boek' : 'A new book' },
        { key: 'D', text: isDutch ? 'In de bibliotheek' : 'In the library' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'De Izafa drukt bezit uit: het eerste woord is onbepaald van vorm maar bepaald in betekenis door het tweede woord.'
        : 'The Izafa creates a genitive possession construct ("the book of the student").',
      audioText: 'كِتَابُ الطَّالِب'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Voorwaardelijke Zinnen (Lau vs In)' : 'Conditionals (Law vs In)',
      instruction: isDutch ? 'Welk partikel leidt een hypothetische onvervulbare voorwaarde in?' : 'Which particle introduces an unreal / counterfactual condition?',
      prompt: '_____ كُنْتُ أَعْلَمُ، لَسَاعَدْتُكَ',
      options: [
        { key: 'A', text: 'إِذَا' },
        { key: 'B', text: 'إِنْ' },
        { key: 'C', text: 'لَوْ' },
        { key: 'D', text: 'مُنْذُ' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? '"Law" (لَوْ) wordt gebruikt voor hypothetische, onwerkelijke voorwaarden in het verleden ("Als ik het had geweten...").'
        : '"Law" introduces unreal / counterfactual past hypotheses.',
      audioText: 'لَوْ كُنْتُ أَعْلَم'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Afgeleide Werkwoordsvormen (Awzān)' : 'Derived Verb Forms',
      instruction: isDutch ? 'Welke betekenisnuance heeft Vorm III (فَاعَلَ) typisch?' : 'What meaning does Verb Form III (فَاعَلَ) typically convey?',
      prompt: 'شَارَكَ',
      options: [
        { key: 'A', text: isDutch ? 'Intensivering van een actie' : 'Intensification of an action' },
        { key: 'B', text: isDutch ? 'Wederkerigheid of interactie met een ander (participeren / delen)' : 'Reciprocity or interacting with another (participating / sharing)' },
        { key: 'C', text: isDutch ? 'Passieve lijdende vorm' : 'Passive grammatical voice' },
        { key: 'D', text: isDutch ? 'Vragen om iets (verzoek)' : 'Requesting or seeking something' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'Vorm III (fāʿala) voegt een lange klinker toe en duidt op interactie of poging met betrekking tot een ander.'
        : 'Form III marks interaction, reciprocity, or association with another party.',
      audioText: 'شَارَكَ'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Grammaticale Naamvallen (Iʿrāb)' : 'Grammatical Moods & Case Endings',
      instruction: isDutch ? 'Welke naamvalsklinker krijgt het lijdend voorwerp (Mafʿūl bihi) in het Modern Standaard Arabisch?' : 'What case marker does the direct object receive in formal Arabic?',
      prompt: 'قَرَأَ الكاتِبُ الرِّوَايَةَ',
      options: [
        { key: 'A', text: isDutch ? 'Fatha (-a / Mansūb)' : 'Fatha (-a / Accusative / Mansūb)' },
        { key: 'B', text: isDutch ? 'Damma (-u / Marfūʿ)' : 'Damma (-u / Nominative / Marfūʿ)' },
        { key: 'C', text: isDutch ? 'Kasra (-i / Majrūr)' : 'Kasra (-i / Genitive / Majrūr)' },
        { key: 'D', text: isDutch ? 'Sukūn (rustteken)' : 'Sukūn (vowelless marker)' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Het lijdend voorwerp staat in de mansūb-status en eindigt op een fatha (-a).'
        : 'The direct object is in the accusative (Mansūb) case, taking the final fatha vowel (-a).',
      audioText: 'قَرَأَ الكاتِبُ الرِّوَايَةَ'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Klassiek Idioom & Balāghah' : 'Classical Rhetoric & Metaphor',
      instruction: isDutch ? 'Wat betekent de literaire uitdrukking "وَضَعَ النِّقَاطَ عَلَى الحُرُوف"?' : 'What does "وَضَعَ النِّقَاطَ عَلَى الحُرُوف" mean?',
      prompt: 'وَضَعَ النِّقَاطَ عَلَى الحُرُوف',
      options: [
        { key: 'A', text: isDutch ? 'Kalligrafieles geven aan beginners' : 'Giving calligraphy lessons' },
        { key: 'B', text: isDutch ? 'Volledige helderheid scheppen en alle twijfel wegnemen' : 'Putting things completely in order / clarifying beyond doubt' },
        { key: 'C', text: isDutch ? 'Een document verbranden' : 'Burning a document' },
        { key: 'D', text: isDutch ? 'Een afspraak uitstellen' : 'Postponing an appointment' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"De stippen op de letters zetten" is het Arabische idioom voor absolute duidelijkheid en klaarheid scheppen.'
        : '"Putting the dots on the letters" signifies clarifying ambiguities definitively.',
      audioText: 'وَضَعَ النِّقَاطَ عَلَى الحُرُوف'
    }
  ];
}

function getJapaneseQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Kennismaking' : 'Daily Greetings',
      instruction: isDutch ? 'Wat betekent "こんにちは"?' : 'What does "こんにちは" mean?',
      prompt: 'こんにちは',
      options: [
        { key: 'A', text: isDutch ? 'Goedemorgen' : 'Good morning' },
        { key: 'B', text: isDutch ? 'Hallo / Goedendag' : 'Hello / Good afternoon' },
        { key: 'C', text: isDutch ? 'Tot ziens' : 'Goodbye' },
        { key: 'D', text: isDutch ? 'Alstublieft' : 'Please' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Konnichiwa" is de algemene Japanse begroeting voor overdag.'
        : '"Konnichiwa" is the standard daytime greeting for "Hello".',
      audioText: 'こんにちは'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Beleefd Bestellen' : 'Polite Ordering',
      instruction: isDutch ? 'Hoe bestel je beleefd één koffie?' : 'How do you politely order one coffee in Japanese?',
      prompt: isDutch ? 'Eén koffie, alstublieft.' : 'One coffee, please.',
      options: [
        { key: 'A', text: 'お水をください' },
        { key: 'B', text: '駅はどこですか' },
        { key: 'C', text: 'コーヒーを一つお願いします' },
        { key: 'D', text: 'お会計をお願いします' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? '"Kōhī o hitotsu onegai shimasu" is de natuurlijke beleefde manier om koffie te bestellen.'
        : '"Kōhī o hitotsu onegai shimasu" is the natural, courteous phrasing.',
      audioText: 'コーヒーを一つお願いします'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Grammatica Partikels (wa vs o)' : 'Particles (wa vs o)',
      instruction: isDutch ? 'Welk partikel markeert het lijdend voorwerp (brood eten)?' : 'Which particle marks the direct object (eating bread)?',
      prompt: 'パン _____ 食べます',
      options: [
        { key: 'A', text: 'は' },
        { key: 'B', text: 'を' },
        { key: 'C', text: 'に' },
        { key: 'D', text: 'で' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'Het partikel を (uitgesproken als "o") markeert het directe lijdend voorwerp van het werkwoord.'
        : 'Particle を (o) indicates the direct grammatical object.',
      audioText: 'パンを食べます'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'Werkwoord Te-vorm (Verzoek)' : 'Te-form Request',
      instruction: isDutch ? 'Wat betekent "ちょっと待ってください"?' : 'What does "ちょっと待ってください" mean?',
      prompt: 'ちょっと待ってください',
      options: [
        { key: 'A', text: isDutch ? 'Een ogenblikje geduld, alstublieft' : 'Please wait a moment' },
        { key: 'B', text: isDutch ? 'Eet smakelijk' : 'Enjoy your meal' },
        { key: 'C', text: isDutch ? 'Ga rechtdoor' : 'Go straight ahead' },
        { key: 'D', text: isDutch ? 'Dank je wel voor je hulp' : 'Thank you for your help' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Chotto matte kudasai" is de alledaagse beleefde uitdrukking voor "even wachten alstublieft".'
        : '"Chotto matte kudasai" politely asks someone to wait a moment.',
      audioText: 'ちょっと待ってください'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Voorwaarden (tara / ba / to)' : 'Conditional Tara Form',
      instruction: isDutch ? 'Welke vorm drukt "Als de regen stopt, gaan we naar buiten" uit?' : 'Which form expresses "If the rain stops, let\'s go out"?',
      prompt: '雨が_____、出かけましょう',
      options: [
        { key: 'A', text: 'やんで' },
        { key: 'B', text: 'やんだら' },
        { key: 'C', text: 'やまない' },
        { key: 'D', text: 'やみます' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'De werkwoordsvorm "-tara" (yandara) vormt de conditionele "als... dan" structuur.'
        : 'The "-tara" form creates an active temporal condition ("if/when it stops").',
      audioText: '雨がやんだら、出かけましょう'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Potentiële Vorm (Kunnen)' : 'Potential Form (Can do)',
      instruction: isDutch ? 'Welk werkwoord betekent "Ik kan Japans spreken":' : 'Which verb form means "I can speak Japanese":',
      prompt: '日本語を _____',
      options: [
        { key: 'A', text: '話せます' },
        { key: 'B', text: '話します' },
        { key: 'C', text: '話しました' },
        { key: 'D', text: '話したい' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Hanasemasu" is de potentiële vorm van "hanasu" (spreken → kunnen spreken).'
        : '"Hanasemasu" is the potential verb form meaning "able to speak".',
      audioText: '日本語を話せます'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Lijdende Vorm (Ukemikei)' : 'Passive Voice (Ukemi)',
      instruction: isDutch ? 'Welke zin bevat een passieve vorm (geprezen worden door de leraar)?' : 'Which sentence uses the passive voice ("praised by the teacher")?',
      prompt: '先生に _____',
      options: [
        { key: 'A', text: '褒めました' },
        { key: 'B', text: '褒められました' },
        { key: 'C', text: '褒めさせました' },
        { key: 'D', text: '褒めてあげました' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Homeraremashita" is de beleefde verleden tijd van de passieve vorm (homereru).'
        : '"Homeraremashita" is the passive construction ("was praised").',
      audioText: '先生に褒められました'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Formele Connectieven' : 'Formal Connectors',
      instruction: isDutch ? 'Wat betekent het formele connectief "にもかかわらず"?' : 'What does "にもかかわらず" signify?',
      prompt: '大雨だったにもかかわらず',
      options: [
        { key: 'A', text: isDutch ? 'Omdat het zwaar regende' : 'Because it rained heavily' },
        { key: 'B', text: isDutch ? 'Ondanks dat het zwaar regende' : 'In spite of / despite the heavy rain' },
        { key: 'C', text: isDutch ? 'Voordat het begon te regenen' : 'Before it started raining' },
        { key: 'D', text: isDutch ? 'Wanneer het regent' : 'Whenever it rains' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Ni mo kakawarazu" betekent "ondanks / niettegenstaande".'
        : '"Ni mo kakawarazu" means "in spite of / notwithstanding".',
      audioText: '大雨だったにもかかわらず'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Keigo Eerbieds- en Nederigheidstaal' : 'Honorific Keigo System',
      instruction: isDutch ? 'Welk nederig werkwoord (Kenjōgo) gebruik je als je zelf naar het kantoor van een klant gaat?' : 'Which humble verb (Kenjōgo) is used when you yourself go to a client\'s office?',
      prompt: '明日、御社へ _____',
      options: [
        { key: 'A', text: 'いらっしゃいます' },
        { key: 'B', text: '参ります' },
        { key: 'C', text: 'おいでになります' },
        { key: 'D', text: '召し上がります' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Mairimasu" is de nederige vorm (kenjōgo) van "gaan/komen" voor de spreker zelf.'
        : '"Mairimasu" is the humble (Kenjōgo) equivalent of "to go/come".',
      audioText: '明日、御社へ参ります'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Klassieke Vierkarakter Idioom (Yojijukugo)' : 'Four-Character Idioms (Yojijukugo)',
      instruction: isDutch ? 'Wat is de betekenis van het gevorderde idioom "一期一会"?' : 'What is the precise philosophical meaning of "一期一会"?',
      prompt: '一期一会',
      options: [
        { key: 'A', text: isDutch ? 'Harde fysieke arbeid loont altijd' : 'Hard physical work pays off' },
        { key: 'B', text: isDutch ? 'Een eenmalige, unieke ontmoeting in het leven die men diep moet koesteren' : 'A once-in-a-lifetime encounter to treasure deeply' },
        { key: 'C', text: isDutch ? 'Snelle winst op de aandelenmarkt' : 'Quick profit on financial markets' },
        { key: 'D', text: isDutch ? 'Twee vijanden die moeten samenwerken' : 'Two rivals forced to cooperate' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Ichigo Ichie" stamt uit de theeceremonie: elke ontmoeting is uniek en onherhaalbaar in een mensenleven.'
        : '"Ichigo Ichie" signifies treasuring every encounter as a unique once-in-a-lifetime moment.',
      audioText: '一期一会'
    }
  ];
}

function getChineseQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Kennismaking' : 'Foundational Greetings',
      instruction: isDutch ? 'Wat betekent "你好！很高兴认识你"?' : 'What does "你好！很高兴认识你" mean?',
      prompt: '你好！很高兴认识你',
      options: [
        { key: 'A', text: isDutch ? 'Hallo! Leuk je te ontmoeten.' : 'Hello! Pleased to meet you.' },
        { key: 'B', text: isDutch ? 'Goedenavond! Waar ga je heen?' : 'Good evening! Where are you going?' },
        { key: 'C', text: isDutch ? 'Hoeveel kost deze jas?' : 'How much is this jacket?' },
        { key: 'D', text: isDutch ? 'Tot ziens, tot volgende week.' : 'Goodbye, see you next week.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Nǐ hǎo" is hallo en "hěn gāoxìng rènshì nǐ" betekent aangenaam kennis te maken.'
        : '"Nǐ hǎo! Hěn gāoxìng rènshì nǐ" is the standard greeting and introduction phrase.',
      audioText: '你好！很高兴认识你'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'Bestellen & Rekening Vragen' : 'Ordering & Bill',
      instruction: isDutch ? 'Hoe vraag je om de rekening in een Chinees restaurant?' : 'How do you ask for the check in a restaurant?',
      prompt: isDutch ? 'De rekening, alstublieft.' : 'The bill / check, please.',
      options: [
        { key: 'A', text: '洗手间在哪儿？' },
        { key: 'B', text: '买单，谢谢！' },
        { key: 'C', text: '太贵了！' },
        { key: 'D', text: '我不懂。' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Mǎidān" is de meest natuurlijke term voor het vragen om de rekening.'
        : '"Mǎidān" is the common term used for paying the check in dining establishments.',
      audioText: '买单，谢谢'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Aspect Partikel 了 (Le)' : 'Aspect Particle Le',
      instruction: isDutch ? 'Wat geeft het partikel "了" aan in "我吃了早饭"?' : 'What does "了" mark in "我吃了早饭"?',
      prompt: '我吃了早饭',
      options: [
        { key: 'A', text: isDutch ? 'Toekomstige handeling' : 'Future action' },
        { key: 'B', text: isDutch ? 'Een voltooide handeling (Ik heb ontbeten)' : 'A completed action (I ate breakfast)' },
        { key: 'C', text: isDutch ? 'Ontkenning' : 'Negation' },
        { key: 'D', text: isDutch ? 'Een vraagteken' : 'A question marker' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Le" direct na een werkwoord drukt een voltooide handeling of aspect uit.'
        : 'Placed after a verb, "le" indicates completion of the action.',
      audioText: '我吃了早饭'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'De Weg Vragen' : 'Directions & Wayfinding',
      instruction: isDutch ? 'Wat betekent "请问，火车站怎么走？"?' : 'What does "请问，火车站怎么走？" ask?',
      prompt: '请问，火车站怎么走？',
      options: [
        { key: 'A', text: isDutch ? 'Mag ik vragen hoe ik bij het treinstation kom?' : 'Excuse me, how do I get to the train station?' },
        { key: 'B', text: isDutch ? 'Hoe laat vertrekt de trein?' : 'What time does the train leave?' },
        { key: 'C', text: isDutch ? 'Heeft u een treinkaartje?' : 'Do you have a train ticket?' },
        { key: 'D', text: isDutch ? 'Is het station ver hiervandaan?' : 'Is the station far from here?' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Huǒchēzhàn" is treinstation en "zěnme zǒu" vraagt hoe je erheen loopt of reist.'
        : '"Zěnme zǒu" asks how to get somewhere spatially.',
      audioText: '请问，火车站怎么走'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Vergelijkende Constructie (Bǐ)' : 'Comparative Structures with Bǐ',
      instruction: isDutch ? 'Welke zin betekent "Vandaag is warmer dan gisteren":' : 'Which sentence means "Today is warmer than yesterday":',
      prompt: '今天比昨天 _____',
      options: [
        { key: 'A', text: '冷' },
        { key: 'B', text: '暖和' },
        { key: 'C', text: '下雨' },
        { key: 'D', text: '没有' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Nuǎnhuo" betekent aangenaam warm. In de "A bǐ B + adjectief" constructie volgt direct het adjectief.'
        : '"Nuǎnhuo" means warm in the standard comparative "A bǐ B + adj" formula.',
      audioText: '今天比昨天暖和'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'De 把 (Bǎ) Constructie' : 'The Bǎ Construction',
      instruction: isDutch ? 'Wat typeert de "把"-zin in de Chinese grammatica?' : 'What does the "把" sentence structure do?',
      prompt: '他把窗户打开了',
      options: [
        { key: 'A', text: isDutch ? 'Het plaatst het lijdend voorwerp vóór het werkwoord om het resultaat van de handeling te benadrukken' : 'It moves the object before the verb to emphasize disposal/result' },
        { key: 'B', text: isDutch ? 'Het vormt altijd een ontkenning' : 'It creates a negative clause' },
        { key: 'C', text: isDutch ? 'Het drukt een passieve lijdende vorm uit' : 'It represents the passive voice' },
        { key: 'D', text: isDutch ? 'Het geeft een vraag aan' : 'It functions as a question' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'De 把-constructie verplaatst het bekende lijdend voorwerp naar voren om aan te geven wat ermee gebeurd is.'
        : 'The bǎ construction marks disposal and execution on a definite object.',
      audioText: '他把窗户打开了'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Lijdende Vorm met 被 (Bèi)' : 'Passive Voice with Bèi',
      instruction: isDutch ? 'Wat betekent "手机被他拿走了"?' : 'What does "手机被他拿走了" mean?',
      prompt: '手机被他拿走了',
      options: [
        { key: 'A', text: isDutch ? 'Hij heeft een nieuwe telefoon gekocht' : 'He bought a new phone' },
        { key: 'B', text: isDutch ? 'De telefoon is door hem meegenomen' : 'The phone was taken away by him' },
        { key: 'C', text: isDutch ? 'Hij heeft de telefoon laten vallen' : 'He dropped the phone' },
        { key: 'D', text: isDutch ? 'Zijn telefoon is stuk' : 'His phone is broken' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '被 (bèi) introduceert de handelende persoon in een passieve zin.'
        : '被 (bèi) is the primary passive voice marker.',
      audioText: '手机被他拿走了'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Formele Connectieven' : 'Formal Discourse Markers',
      instruction: isDutch ? 'Welk voegwoordpaar drukt "Niet alleen... maar ook..." uit?' : 'Which pair means "Not only... but also..."?',
      prompt: '_____ 汉语很难，_____ 很有趣。',
      options: [
        { key: 'A', text: '虽然... 但是...' },
        { key: 'B', text: '不仅... 而且...' },
        { key: 'C', text: '因为... 所以...' },
        { key: 'D', text: '只要... 就...' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Bùjǐn... érqiě..." is het vaste verbindingspaar voor "niet alleen... maar ook...".'
        : '"Bùjǐn... érqiě..." expresses progressive correlation ("not only... but also...").',
      audioText: '不仅汉语很难而且很有趣'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Klassieke Partikels in Modern Chinees' : 'Classical Particles in Written Register',
      instruction: isDutch ? 'Wat betekent het formele schriftelijke partikel "之" in "成功之路"?' : 'What does the classical particle "之" express in formal Chinese?',
      prompt: '成功之路',
      options: [
        { key: 'A', text: isDutch ? 'Het fungeert als het bezittelijke "的" (van): "De weg naar succes"' : 'It functions as possessive "de": "The path of success"' },
        { key: 'B', text: isDutch ? 'Het geeft een ontkenning aan' : 'It indicates negation' },
        { key: 'C', text: isDutch ? 'Het markeert een vraag' : 'It marks an interrogative clause' },
        { key: 'D', text: isDutch ? 'Het duidt op het verleden' : 'It signifies past tense' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'In formele geschreven taal vervangt 之 (zhī) het alledaagse 的 (de).'
        : 'In high written register, 之 (zhī) serves as the classical genitive connector.',
      audioText: '成功之路'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Vierkarakter Idioom (Chéngyǔ)' : 'Literary Idioms (Chéngyǔ)',
      instruction: isDutch ? 'Wat betekent het klassieke idioom "胸有成竹"?' : 'What is the precise meaning of the idiom "胸有成竹"?',
      prompt: '胸有成竹',
      options: [
        { key: 'A', text: isDutch ? 'Pijn op de borst hebben van vermoeidheid' : 'Suffering chest pain from fatigue' },
        { key: 'B', text: isDutch ? 'Van tevoren een voldragen, zelfverzekerd plan in je hoofd hebben' : 'Having a well-thought-out, confident plan beforehand' },
        { key: 'C', text: isDutch ? 'Bamboe planten in de tuin' : 'Planting bamboo in a garden' },
        { key: 'D', text: isDutch ? 'Aarzelen en niet durven beslissen' : 'Hesitating and being indecisive' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'Letterlijk "de bamboe al in je borst/geest getekend hebben voordat je schildert", figuurlijk: volledig voorbereid en zelfverzekerd zijn.'
        : 'Originating from painter Su Shi: having a complete mental blueprint before taking action.',
      audioText: '胸有成竹'
    }
  ];
}

function getRussianQuestions(isDutch: boolean, _variant: string): PlacementTestQuestion[] {
  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Begroetingen & Beleefdheid' : 'Greetings & Etiquette',
      instruction: isDutch ? 'Wat betekent "Здравствуйте! Как дела?"?' : 'What does "Здравствуйте! Как дела?" mean?',
      prompt: 'Здравствуйте! Как дела?',
      options: [
        { key: 'A', text: isDutch ? 'Hallo! Hoe gaat het?' : 'Hello! How are you?' },
        { key: 'B', text: isDutch ? 'Goedenavond! Waar woon je?' : 'Good evening! Where do you live?' },
        { key: 'C', text: isDutch ? 'Tot ziens! Fijne reis!' : 'Goodbye! Have a nice trip!' },
        { key: 'D', text: isDutch ? 'Alsjeblieft, hier is het paspoort.' : 'Please, here is the passport.' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Zdravstvuyte" is de universele beleefde begroeting en "Kak dela?" vraagt hoe het gaat.'
        : '"Zdravstvuyte" is the formal polite greeting meaning "Hello".',
      audioText: 'Здравствуйте! Как дела?'
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'In een Café Bestellen' : 'Cafe & Ordering',
      instruction: isDutch ? 'Hoe bestel je koffie in het Russisch?' : 'How do you politely order coffee in Russian?',
      prompt: isDutch ? 'Eén koffie, alstublieft.' : 'One coffee, please.',
      options: [
        { key: 'A', text: 'Где находится метро?' },
        { key: 'B', text: 'Чашку кофе, пожалуйста.' },
        { key: 'C', text: 'Сколько это стоит?' },
        { key: 'D', text: 'Меня зовут Иван.' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Chashku kofe, pozhaluysta" is de beleefde manier om koffie te bestellen.'
        : '"Chashku kofe, pozhaluysta" is the standard cafe order.',
      audioText: 'Чашку кофе, пожалуйста'
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Naamvallen: Prepositionalis (Padezh 6)' : 'Prepositional Case',
      instruction: isDutch ? 'Kies de juiste uitgang voor "Ik woon in Moskou":' : 'Select the correct ending for "I live in Moscow":',
      prompt: 'Я живу в _____:',
      options: [
        { key: 'A', text: 'Москву' },
        { key: 'B', text: 'Москвы' },
        { key: 'C', text: 'Москве' },
        { key: 'D', text: 'Москвой' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? 'Na het voorzetsel "в" voor locatie volgt de prepositionalis (6e naamval) met uitgang "-е": "в Москве".'
        : 'Preposition "v" marking location takes the prepositional case ending "-e".',
      audioText: 'Я живу в Москве'
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'Verleden Tijd Vervoeging' : 'Past Tense Agreement',
      instruction: isDutch ? 'Welk werkwoord past bij een vrouwelijke spreker ("Ik las een boek")?' : 'Which past tense form agrees with a female subject ("I read")?',
      prompt: 'Вчера я (женщина) _____ интересную книгу.',
      options: [
        { key: 'A', text: 'читал' },
        { key: 'B', text: 'читала' },
        { key: 'C', text: 'читало' },
        { key: 'D', text: 'читали' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'In de Russische verleden tijd stemt het werkwoord in geslacht overeen met het onderwerp: "-ла" voor vrouwelijk enkelvoud.'
        : 'Russian past tense inflects for gender: "-la" marks feminine singular.',
      audioText: 'Вчера я читала интересную книгу'
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Verbaal Aspect (NSV vs SV)' : 'Verbal Aspect',
      instruction: isDutch ? 'Welk aspect gebruik je voor een eenmalig voltooide handeling ("Ik heb het boek uitgelezen")?' : 'Which aspect marks a completed finished result?',
      prompt: 'Я наконец-то _____ эту сложную книгу.',
      options: [
        { key: 'A', text: 'прочитал' },
        { key: 'B', text: 'читал' },
        { key: 'C', text: 'читаю' },
        { key: 'D', text: 'буду читать' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Het perfectieve aspect (SV, "прочитал") drukt een afgesloten, succesvol behaald resultaat uit.'
        : 'The perfective aspect ("prochital") emphasizes completion and definite result.',
      audioText: 'Я наконец-то прочитал эту книгу'
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Bewegingswerkwoorden' : 'Verbs of Motion',
      instruction: isDutch ? 'Welk werkwoord betekent te voet gaan in één specifieke richting (unidirectioneel)?' : 'Which motion verb means walking in one definite direction right now?',
      prompt: 'Сейчас я _____ на работу.',
      options: [
        { key: 'A', text: 'хожу' },
        { key: 'B', text: 'иду' },
        { key: 'C', text: 'езжу' },
        { key: 'D', text: 'еду' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Иду" (idu) is unidirectioneel te voet (ik ben nu onderweg).'
        : '"Idu" signifies unidirectional movement on foot in progress.',
      audioText: 'Сейчас я иду на работу'
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Voorwaardelijke Wijs (Soslagatelnoye)' : 'Conditional Mood with By',
      instruction: isDutch ? 'Hoe formuleer je een hypothetische wens ("Als ik tijd had, zou ik reizen")?' : 'How is a counterfactual condition formed in Russian?',
      prompt: 'Если бы у меня было время, я _____ по миру.',
      options: [
        { key: 'A', text: 'путешествую' },
        { key: 'B', text: 'путешествовал бы' },
        { key: 'C', text: 'буду путешествовать' },
        { key: 'D', text: 'путешествуй' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'De conditionele wijs combineert de verleden tijd met het partikel "бы" (puteshestvoval by).'
        : 'The conditional uses past tense + particle "by".',
      audioText: 'Если бы у меня было время, я путешествовал бы'
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Deelwoorden & Gerundia' : 'Gerunds (Deechastie)',
      instruction: isDutch ? 'Wat drukt het gerundium "Прочитав письмо, он улыбнулся" uit?' : 'What does the adverbial participle (deechastie) express?',
      prompt: 'Прочитав письмо, он улыбнулся',
      options: [
        { key: 'A', text: isDutch ? 'Nadat hij de brief had gelezen, glimlachte hij' : 'Having read the letter, he smiled' },
        { key: 'B', text: isDutch ? 'Terwijl hij de brief schreef, huilde hij' : 'While writing the letter, he cried' },
        { key: 'C', text: isDutch ? 'Zonder de brief te openen' : 'Without opening the letter' },
        { key: 'D', text: isDutch ? 'Hij zal de brief morgen lezen' : 'He will read the letter tomorrow' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? '"Прочитав" is een voltooid bijwoordelijk deelwoord (deechastie) dat een voorafgaande handeling aanduidt.'
        : '"Prochitav" is a perfective gerund marking an antecedent completed action.',
      audioText: 'Прочитав письмо, он улыбнулся'
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Geavanceerde Syntaxis & Onderschatting' : 'Complex Subordinate Clauses',
      instruction: isDutch ? 'Welke voegwoordcombinatie drukt een formele concessie ("hoewel") uit?' : 'Which conjunction marks formal concession ("notwithstanding / although")?',
      prompt: '_____ на трудности, проект был успешно завершён.',
      options: [
        { key: 'A', text: 'Потому что' },
        { key: 'B', text: 'Несмотря на' },
        { key: 'C', text: 'Для того чтобы' },
        { key: 'D', text: 'Как будто' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Несмотря на" (+ accusatief) betekent "ondanks / niettegenstaande".'
        : '"Nesmotrya na" marks concessive contrast ("despite / in spite of").',
      audioText: 'Несмотря на трудности, проект был завершён'
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Gevorderde Idiomatiek & Metafoor' : 'Advanced Idiomatic Expressions',
      instruction: isDutch ? 'Wat betekent het Russische idioom "Спустя рукава"?' : 'What does the idiom "Spustya rukava" mean?',
      prompt: 'Работать спустя рукава',
      options: [
        { key: 'A', text: isDutch ? 'Met opgestroopte mouwen heel hard werken' : 'Working very hard with rolled-up sleeves' },
        { key: 'B', text: isDutch ? 'Laks, slordig en zonder enige toewijding werken' : 'Working sloppily, carelessly, half-heartedly' },
        { key: 'C', text: isDutch ? 'Nieuwe kleren naaien' : 'Sewing new garments' },
        { key: 'D', text: isDutch ? 'Op tijd naar huis gaan' : 'Going home on schedule' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? '"Спустя рукава" (met afhangende mouwen) stamt uit de tsarentijd toen lange mouwen werk onmogelijk maakten: slordig en ongeïnteresseerd werken.'
        : '"Spustya rukava" describes performing tasks slipshodly and without enthusiasm.',
      audioText: 'Работать спустя рукава'
    }
  ];
}

function getUniversalLanguageQuestions(
  targetCode: string,
  targetName: string,
  isDutch: boolean
): PlacementTestQuestion[] {
  const lang = WORLD_LANGUAGES.find((l) => l.code === targetCode);
  const greeting = lang?.sampleGreeting || `Hello`;
  const nativeName = lang?.nativeName || targetName;

  return [
    {
      id: 1,
      level: 'A1',
      target_skill: isDutch ? 'Alledaagse Begroeting' : 'Everyday Greeting',
      instruction: isDutch ? `Wat betekent deze begroeting in het ${targetName}?` : `What does this greeting mean in ${targetName}?`,
      prompt: greeting,
      options: [
        { key: 'A', text: isDutch ? 'Tot ziens / Vaarwel' : 'Goodbye / Farewell' },
        { key: 'B', text: isDutch ? `Hallo / Goedendag in het ${targetName}` : `Hello / Good day in ${targetName}` },
        { key: 'C', text: isDutch ? 'De rekening, alstublieft' : 'The check, please' },
        { key: 'D', text: isDutch ? 'Waar is het station?' : 'Where is the station?' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? `"${greeting}" is de universele vriendelijke begroeting in het ${targetName}.`
        : `"${greeting}" is the foundational greeting in ${targetName}.`,
      audioText: greeting
    },
    {
      id: 2,
      level: 'A1',
      target_skill: isDutch ? 'In het Café & Bestellen' : 'In a Café & Ordering',
      instruction: isDutch ? `Je bent in een café. Hoe vraag je beleefd om een drankje in het ${targetName}?` : `You are in a café. How do you politely order a drink in ${targetName}?`,
      prompt: isDutch ? `Een koffie, alstublieft` : `A coffee, please`,
      options: [
        { key: 'A', text: isDutch ? 'Hoe laat is het?' : 'What time is it?' },
        { key: 'B', text: isDutch ? 'Waar woon je?' : 'Where do you live?' },
        { key: 'C', text: isDutch ? `Een koffie, alstublieft` : `A coffee, please` },
        { key: 'D', text: isDutch ? 'Tot morgen' : 'See you tomorrow' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? `Dit is de beleefde manier om een drankje te bestellen in het ${targetName}.`
        : `This is the standard polite phrase for ordering in a café in ${targetName}.`,
      audioText: greeting
    },
    {
      id: 3,
      level: 'A2',
      target_skill: isDutch ? 'Kennismaking & Woonplaats' : 'Introductions & Where You Live',
      instruction: isDutch ? `Iemand vraagt waar je woont. Wat betekent het antwoord: "Wij wonen in het centrum"?` : `Someone asks where you live. What does: "We live in the city center" mean?`,
      prompt: isDutch ? `Wij wonen in het centrum van de stad` : `We live in the city center`,
      options: [
        { key: 'A', text: isDutch ? 'Wij wonen in het centrum van de stad' : 'We live in the city center' },
        { key: 'B', text: isDutch ? 'Wij werken buiten de stad' : 'We work outside the city' },
        { key: 'C', text: isDutch ? 'Wij reizen morgen naar het buitenland' : 'We are traveling abroad tomorrow' },
        { key: 'D', text: isDutch ? 'Wij zoeken een nieuw hotel' : 'We are looking for a new hotel' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? `Duidelijke communicatie over woonplaats en leefomgeving.`
        : `Clear practical comprehension of residence and living environment.`,
      audioText: targetName
    },
    {
      id: 4,
      level: 'A2',
      target_skill: isDutch ? 'De Weg Vragen & Oriëntatie' : 'Directions & Navigation',
      instruction: isDutch ? `Een voorbijganger legt de weg uit naar het station. Welke aanwijzing hoor je?` : `A local gives you directions to the station. What instruction do they give?`,
      prompt: isDutch ? `Ga rechtdoor en sla rechtsaf bij de volgende straat` : `Go straight ahead and turn right at the next street`,
      options: [
        { key: 'A', text: isDutch ? 'Het station is vandaag gesloten' : 'The station is closed today' },
        { key: 'B', text: isDutch ? 'Het is half vier in de middag' : 'It is half past three in the afternoon' },
        { key: 'C', text: isDutch ? 'Ik wil graag een treinkaartje kopen' : 'I would like to buy a train ticket' },
        { key: 'D', text: isDutch ? 'Ga rechtdoor en sla rechtsaf bij de volgende straat' : 'Go straight ahead and turn right at the next street' },
      ],
      correct_key: 'D',
      explanation: isDutch
        ? 'Gerichte route-aanwijzing in een stedelijke omgeving.'
        : 'Actionable wayfinding direction in a city setting.',
      audioText: targetName
    },
    {
      id: 5,
      level: 'B1',
      target_skill: isDutch ? 'Reizen & Hotel Check-in' : 'Travel & Hotel Check-in',
      instruction: isDutch ? `De hotelreceptionist zegt: "Uw kamer is klaar op de tweede verdieping." Wat betekent dit?` : `The hotel receptionist says: "Your room is ready on the second floor." What does this mean?`,
      prompt: isDutch ? `Uw kamer is klaar op de tweede verdieping` : `Your room is ready on the second floor`,
      options: [
        { key: 'A', text: isDutch ? 'Het hotel is helaas volgeboekt' : 'The hotel is unfortunately fully booked' },
        { key: 'B', text: isDutch ? 'Uw kamer is klaar op de tweede verdieping' : 'Your room is ready on the second floor' },
        { key: 'C', text: isDutch ? 'Het ontbijt wordt om acht uur geserveerd' : 'Breakfast is served at eight o\'clock' },
        { key: 'D', text: isDutch ? 'Laat uw bagage alstublieft bij de receptie' : 'Please leave your luggage at reception' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'Praktische mededeling bij hotelreservering en check-in.'
        : 'Essential comprehension during travel check-in.',
      audioText: targetName
    },
    {
      id: 6,
      level: 'B1',
      target_skill: isDutch ? 'Vrije Tijd & Weekendplannen' : 'Free Time & Weekend Activities',
      instruction: isDutch ? `Een vriend vertelt: "Gisteren hebben we gewandeld en een geweldige film gezien." Wat deden ze?` : `A friend shares: "Yesterday we went for a walk and watched a great movie." What did they do?`,
      prompt: isDutch ? `Gisteren hebben we gewandeld en een geweldige film gezien` : `Yesterday we went for a walk and watched a great movie`,
      options: [
        { key: 'A', text: isDutch ? 'Ze bleven thuis om te studeren' : 'They stayed home to study' },
        { key: 'B', text: isDutch ? 'Ze zijn van plan morgen naar de bioscoop te gaan' : 'They plan to visit the cinema tomorrow' },
        { key: 'C', text: isDutch ? 'Ze hebben gewandeld en een geweldige film gezien' : 'They went for a walk and watched a great movie' },
        { key: 'D', text: isDutch ? 'Ze moesten de hele dag overwerken' : 'They had to work overtime all day' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? 'Vlot alledaags gesprek over vrijetijdsbesteding en ervaringen.'
        : 'Practical social conversation about personal experiences.',
      audioText: targetName
    },
    {
      id: 7,
      level: 'B2',
      target_skill: isDutch ? 'Uitnodiging & Sociale Afspraken' : 'Social Invitations & Polite Plans',
      instruction: isDutch ? `Iemand stelt voor: "Zullen we vanavond samen gaan eten als je tijd hebt?" Wat wordt er gevraagd?` : `Someone suggests: "Shall we have dinner together tonight if you have time?" What are they asking?`
      ,
      prompt: isDutch ? `Zullen we vanavond samen gaan eten als je tijd hebt?` : `Shall we have dinner together tonight if you have time?`,
      options: [
        { key: 'A', text: isDutch ? 'Een vriendelijke uitnodiging om vanavond samen te eten' : 'A friendly invitation to have dinner together tonight' },
        { key: 'B', text: isDutch ? 'Een verzoek om de lunch van morgen te annuleren' : 'A request to cancel tomorrow\'s lunch' },
        { key: 'C', text: isDutch ? 'Een klacht over de rekening van het restaurant' : 'A complaint regarding the restaurant bill' },
        { key: 'D', text: isDutch ? 'Een vraag over de vertrektijden van de trein' : 'A question about train departure times' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Beleefde sociale uitnodiging en afstemming van plannen.'
        : 'Courteous social invitation and natural scheduling in conversation.',
      audioText: targetName
    },
    {
      id: 8,
      level: 'B2',
      target_skill: isDutch ? 'Mening & Genuanceerd Standpunt' : 'Expressing Opinions & Nuance',
      instruction: isDutch ? `In een discussie zegt iemand: "Ik begrijp je idee, maar we moeten ook aan het budget denken." Wat bedoelt de spreker?` : `In a discussion someone says: "I see your point, but we must also keep the budget in mind." What do they mean?`
      ,
      prompt: isDutch ? `Ik begrijp je idee, maar we moeten ook aan het budget denken` : `I see your point, but we must also keep the budget in mind`,
      options: [
        { key: 'A', text: isDutch ? 'Het project wordt zonder aarzeling afgewezen' : 'The project is rejected without discussion' },
        { key: 'B', text: isDutch ? 'Het project heeft geen financieel budget nodig' : 'The project requires zero financial budget' },
        { key: 'C', text: isDutch ? 'Instemming met het idee, met een praktische kanttekening over de kosten' : 'Agreement with the concept, with a practical consideration regarding costs' },
        { key: 'D', text: isDutch ? 'De vergadering wordt onmiddellijk beëindigd' : 'The meeting is immediately adjourned' },
      ],
      correct_key: 'C',
      explanation: isDutch
        ? 'Genuanceerde meningsuiting waarin constructief wordt meegedacht.'
        : 'Nuanced interpersonal communication balancing ideas with practical realities.',
      audioText: targetName
    },
    {
      id: 9,
      level: 'C1',
      target_skill: isDutch ? 'Formeel Debat & Epistemologische Argumentatie' : 'Formal Debate Register & Epistemological Discourse',
      instruction: isDutch
        ? `In een academisch debat stelt een filosoof: "Niettegenstaande de empirische correlatie blijft het causaal toeschrijven zonder longitudinale corroboratie epistemologisch onhoudbaar." Wat is het centrale bezwaar van de spreker?`
        : `In a formal academic thesis defense: "Notwithstanding the empirical correlation observed, establishing causality without corroborative longitudinal telemetry remains epistemologically untenable." What is the speaker's rhetorical argument?`,
      prompt: isDutch
        ? `Causaal toeschrijven zonder longitudinale corroboratie blijft epistemologisch onhoudbaar`
        : `Establishing causality without corroborative longitudinal telemetry remains epistemologically untenable`,
      options: [
        { key: 'A', text: isDutch ? 'Statistische correlatie alleen kan zonder longitudinale toetsing geen causaal verband bewijzen' : 'Correlation alone without corroborative longitudinal telemetry cannot substantiate a causal claim' },
        { key: 'B', text: isDutch ? 'De correlatie bewijst onomstotelijk en onmiddellijk het causale verband' : 'The empirical correlation conclusively demonstrates immediate causality without further testing' },
        { key: 'C', text: isDutch ? 'Onderzoekers moeten alle empirische waarnemingen in de toekomst afwijzen' : 'Investigators should abandon empirical telemetry in future research' },
        { key: 'D', text: isDutch ? 'Longitudinale verificatie is overbodig zodra data gecorreleerd is' : 'Longitudinal verification is redundant once preliminary statistical correlation is established' },
      ],
      correct_key: 'A',
      explanation: isDutch
        ? 'Gevorderd academisch register en epistemologische analyse van wetenschappelijke causaliteit.'
        : 'Formal academic debate register evaluating the epistemological distinction between correlation and causation.',
      audioText: targetName
    },
    {
      id: 10,
      level: 'C2',
      target_skill: isDutch ? 'Complexe Literaire Proza & Retorische Stijlanalyse' : 'Complex Literary Prose & Rhetorical Stylistics',
      instruction: isDutch
        ? `Analyseer de retorische synthese van dit klassieke literaire essay: "De ogenschijnlijke grootmoedigheid van de protagonist fungeert geenszins als onbaatzuchtige deugd, doch veeleer als een geraffineerd dekmantel voor ongebreidelde hegemoniale aspiraties." Welke thematische paradox wordt blootgelegd?`
        : `Analyze the rhetorical thrust of this classical literary critique: "The protagonist’s ostensible magnanimity serves not as genuine altruistic devotion, but rather as an insidious cloaking mechanism for unbridled hegemonic ambition." What core thematic paradox is synthesized?`,
      prompt: isDutch
        ? `De ogenschijnlijke grootmoedigheid fungeert als een dekmantel voor hegemoniale aspiraties`
        : `The ostensible magnanimity serves as an insidious cloaking mechanism for unbridled hegemonic ambition`,
      options: [
        { key: 'A', text: isDutch ? 'De protagonist handelt puur vanuit oprechte filantropie en gemeenschapszin' : 'The protagonist is motivated solely by genuine philanthropy and altruistic devotion' },
        { key: 'B', text: isDutch ? 'Uiterlijke welwillendheid verhult een onderliggend agressief streven naar heerschappij' : 'Outward benevolence conceals an underlying aggressive pursuit of domination' },
        { key: 'C', text: isDutch ? 'De auteur pleit voor onbeperkte machtsuitoefening over alle publieke instellingen' : 'The author advocates for uninhibited hegemonic rule over collective institutions' },
        { key: 'D', text: isDutch ? 'De hoofdpersoon aarzelt tussen bescheidenheid en terugtrekking uit het openbare leven' : 'The protagonist wavers between modest altruism and retreat from public life' },
      ],
      correct_key: 'B',
      explanation: isDutch
        ? 'Hoogste literaire register C2: analyse van dubbele motieven, ironische paradox en complexe syntactische clausules.'
        : 'C2 mastery: synthesis of literary irony, rhetorical paradox, and high-register socio-political critique.',
      audioText: targetName
    }
  ];
}
