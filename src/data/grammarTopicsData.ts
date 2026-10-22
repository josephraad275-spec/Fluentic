export interface GrammarTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  ruleFormula: string;
  examples: Array<{
    sentence: string;
    translation: string;
    note?: string;
  }>;
  drill: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export const getGrammarTopicsForLanguage = (
  targetCode: string,
  targetName: string,
  isDutch: boolean
): GrammarTopic[] => {
  switch (targetCode) {
    case 'es':
      return [
        {
          id: 'ser-estar',
          title: isDutch ? 'Ser vs. Estar (Zijn)' : 'Ser vs. Estar',
          category: isDutch ? 'Werkwoorden' : 'Verbs',
          summary: isDutch
            ? 'In het Spaans zijn er twee werkwoorden voor "zijn": Ser (essentie, permanente eigenschappen, identiteit, herkomst, tijd) en Estar (toestand, stemming, locatie, tijdelijke situatie).'
            : 'Spanish uses two verbs for "to be": Ser (essential qualities, identity, origin, time) and Estar (states, moods, locations).',
          ruleFormula: isDutch 
            ? 'SER = DOCTOR (Description, Occupation, Characteristic, Time, Origin, Relation) • ESTAR = PLACE (Position, Location, Action, Condition, Emotion)'
            : 'SER = Characteristics & Origin • ESTAR = Location & Current State',
          examples: [
            {
              sentence: 'Yo soy de España y soy profesor.',
              translation: isDutch ? 'Ik kom uit Spanje en ik ben leraar (Ser: herkomst en beroep).' : 'I am from Spain and I am a teacher.',
              note: isDutch ? 'Beroep en herkomst gebruiken altijd "ser".' : 'Permanent identity uses ser.'
            },
            {
              sentence: 'El café está muy caliente hoy.',
              translation: isDutch ? 'De koffie is vandaag erg heet (Estar: huidige toestand).' : 'The coffee is very hot today.',
              note: isDutch ? 'Huidige tijdelijke staat van de drank.' : 'Temporary physical condition.'
            },
            {
              sentence: 'Madrid está en el centro de España.',
              translation: isDutch ? 'Madrid bevindt zich in het centrum van Spanje (Estar: locatie).' : 'Madrid is located in central Spain.',
              note: isDutch ? 'Geografische locatie is altijd "estar".' : 'Physical location always requires estar.'
            }
          ],
          drill: {
            question: isDutch 
              ? 'Kies de juiste vorm voor: "María ___ enferma hoy y no puede venir."' 
              : 'Choose the correct form: "María ___ enferma hoy y no puede venir."',
            options: ['es', 'está', 'ser', 'estando'],
            correctAnswer: 'está',
            explanation: isDutch
              ? '"Enferma" (ziek) is een tijdelijke gezondheidstoestand, dus we gebruiken "está" (vorm van estar).'
              : '"Enferma" (sick) denotes a temporary state of health, requiring "está" (from estar).'
          }
        },
        {
          id: 'por-para',
          title: isDutch ? 'Por vs. Para (Voor / Door)' : 'Por vs. Para',
          category: isDutch ? 'Voorzetsels' : 'Prepositions',
          summary: isDutch
            ? '"Por" wordt gebruikt voor reden/oorzaak, tijdsduur, ruilmiddel en manier. "Para" wordt gebruikt voor doel, bestemming, ontvanger en deadline.'
            : '"Por" expresses cause, motive, duration, and means. "Para" indicates purpose, recipient, and destination.',
          ruleFormula: isDutch 
            ? 'POR = Oorzaak / Reden / Tijdsduur • PARA = Doel / Bestemming / Ontvanger'
            : 'POR = Reason & Route • PARA = Goal & Recipient',
          examples: [
            {
              sentence: 'Este regalo es para ti.',
              translation: isDutch ? 'Dit cadeau is voor jou (Para: ontvanger).' : 'This gift is for you.',
            },
            {
              sentence: 'Gracias por tu ayuda.',
              translation: isDutch ? 'Bedankt voor je hulp (Por: reden / dank).' : 'Thanks for your help.',
            },
            {
              sentence: 'Estudio español para viajar por América Latina.',
              translation: isDutch ? 'Ik leer Spaans om te reizen (doel: para) door Latijns-Amerika (route: por).' : 'I study Spanish in order to travel across Latin America.',
            }
          ],
          drill: {
            question: isDutch
              ? 'Vul in: "Compré este libro ___ aprender vocabulario nuevo."'
              : 'Fill in: "Compré este libro ___ aprender vocabulario nuevo."',
            options: ['por', 'para', 'con', 'de'],
            correctAnswer: 'para',
            explanation: isDutch
              ? '"Para + infinitief" geeft het concrete doel aan ("om ... te leren").'
              : '"Para + infinitive" indicates the direct purpose ("in order to learn").'
          }
        },
        {
          id: 'preterito-imperfecto',
          title: isDutch ? 'Pretérito Indefinido vs. Imperfecto' : 'Preterite vs. Imperfect',
          category: isDutch ? 'Verleden Tijd' : 'Past Tense',
          summary: isDutch
            ? 'Het Pretérito Indefinido beschrijft afgesloten gebeurtenissen in het verleden (punten op de tijdlijn). Het Pretérito Imperfecto beschrijft achtergrond, gewoontes en beschrijvingen ("vroeger deed ik").'
            : 'Preterite marks completed historical events; Imperfect sets background scenes and habitual actions.',
          ruleFormula: isDutch 
            ? 'INDEFINIDO = Actie voltooid (ayer comí) • IMPERFECTO = Gewoonte of achtergrond (cuando era niño)'
            : 'Indefinido = Completed action • Imperfecto = Habitual or ongoing setting',
          examples: [
            {
              sentence: 'Ayer fui al mercado y compré fruta.',
              translation: isDutch ? 'Gisteren ging ik naar de markt en kocht fruit (Indefinido).' : 'Yesterday I went to the market and bought fruit.',
            },
            {
              sentence: 'Cuando vivía en Barcelona, caminaba por la playa cada mañana.',
              translation: isDutch ? 'Toen ik in Barcelona woonde, wandelde ik elke ochtend op het strand (Imperfecto: gewoonte).' : 'When I lived in Barcelona, I used to walk on the beach every morning.',
            }
          ],
          drill: {
            question: isDutch
              ? 'Kies de juiste vorm voor: "El año pasado ___ a Madrid por primera vez."'
              : 'Choose the correct form: "El año pasado ___ a Madrid por primera vez."',
            options: ['iba', 'fui', 'fueron', 'era'],
            correctAnswer: 'fui',
            explanation: isDutch
              ? '"El año pasado" en "por primera vez" duiden op een specifiek afgerond moment in het verleden, dus Pretérito Indefinido (fui).'
              : '"El año pasado" marks a completed action in past time, demanding Preterite "fui".'
          }
        }
      ];

    case 'fr':
      return [
        {
          id: 'passe-compose-imparfait',
          title: isDutch ? 'Passé Composé vs. Imparfait' : 'Passé Composé vs. Imparfait',
          category: isDutch ? 'Verleden Tijd' : 'Past Tense',
          summary: isDutch
            ? 'Het Passé Composé vertelt de afgeronde handelingen in het verleden. Het Imparfait schetst het decor, het weer, emoties of gewoontes ("er was eens", "elke zondag").'
            : 'Passé Composé conveys finished narrative actions; Imparfait depicts atmospheric background, recurring routines, and descriptions.',
          ruleFormula: isDutch 
            ? 'PASSÉ COMPOSÉ = avoir/être + voltooid deelwoord (j\'ai mangé) • IMPARFAIT = stam + -ais, -ais, -ait, -ions, -iez, -aient'
            : 'Passé Composé = Auxiliary + Participle • Imparfait = Habitual background',
          examples: [
            {
              sentence: 'Hier soir, j\'ai regardé un film magnifique.',
              translation: isDutch ? 'Gisteravond heb ik een prachtige film gekeken (Passé composé: afgerond).' : 'Last night, I watched a wonderful movie.',
            },
            {
              sentence: 'Quand j\'étais enfant, nous allions à la mer chaque été.',
              translation: isDutch ? 'Toen ik kind was, gingen we elke zomer naar zee (Imparfait: gewoonte).' : 'When I was a child, we used to go to the sea each summer.',
            }
          ],
          drill: {
            question: isDutch
              ? 'Kies de juiste vorm: "Soudain, le téléphone ___."'
              : 'Choose the correct form: "Soudain, le téléphone ___."',
            options: ['a sonné', 'sonnait', 'sonner', 'ayant sonné'],
            correctAnswer: 'a sonné',
            explanation: isDutch
              ? '"Soudain" (plotseling) markeert een plotselinge, eenmalige handeling die het achtergronddecor onderbreekt -> Passé Composé (a sonné).'
              : '"Soudain" (suddenly) signals an abrupt completed action, requiring Passé Composé.'
          }
        },
        {
          id: 'articles-partitifs',
          title: isDutch ? 'De Delende Lidwoorden (du, de la, des)' : 'Partitive Articles',
          category: isDutch ? 'Lidwoorden' : 'Articles',
          summary: isDutch
            ? 'In het Frans gebruik je "du", "de la", "de l\'" en "des" wanneer je een onbepaalde hoeveelheid aanduidt ("wat / een deel van").'
            : 'French partitive articles express unspecified quantities of uncountable or plural nouns.',
          ruleFormula: isDutch 
            ? 'Mannelijk: DU • Vrouwelijk: DE LA • Vóór klinker: DE L\' • Meervoud: DES • Na ontkenning: DE/D\''
            : 'Masc: DU • Fem: DE LA • Vowel: DE L\' • Plural: DES • Negative: DE',
          examples: [
            {
              sentence: 'Je voudrais du pain et de la confiture, s\'il vous plaît.',
              translation: isDutch ? 'Ik wil graag (wat) brood en (wat) jam, alstublieft.' : 'I would like some bread and some jam, please.',
            },
            {
              sentence: 'Je ne bois pas de café le soir.',
              translation: isDutch ? 'Ik drink \'s avonds geen koffie (na ontkenning verandert "du" in "de").' : 'I do not drink coffee in the evening.',
            }
          ],
          drill: {
            question: isDutch
              ? 'Vul aan: "Il boit ___ eau fraîche."'
              : 'Fill in: "Il boit ___ eau fraîche."',
            options: ['de l\'', 'du', 'de la', 'des'],
            correctAnswer: 'de l\'',
            explanation: isDutch
              ? '"Eau" begint met een klinker en is vrouwelijk, dus we gebruiken "de l\'".'
              : '"Eau" begins with a vowel, taking the elided form "de l\'".'
          }
        }
      ];

    case 'de':
      return [
        {
          id: 'die-vier-faelle',
          title: isDutch ? 'De 4 Duitse Naamvallen' : 'The 4 German Cases',
          category: isDutch ? 'Naamvallen' : 'Cases',
          summary: isDutch
            ? 'Het Duits gebruikt 4 naamvallen: Nominativ (onderwerp), Akkusativ (lijdend voorwerp / doellocatie), Dativ (meewerkend voorwerp / vaste locatie), Genitiv (bezit/afkomst).'
            : 'German inflects nouns and articles through 4 cases: Nominative, Accusative, Dative, and Genitive.',
          ruleFormula: isDutch 
            ? 'Mannelijk: der -> den (Akk) -> dem (Dat) -> des (Gen) • Vrouwelijk: die -> die -> der -> der • Onzijdig: das -> das -> dem -> des'
            : 'Masc: der/den/dem/des • Fem: die/die/der/der • Neut: das/das/dem/des',
          examples: [
            {
              sentence: 'Der Hund sieht den Mann.',
              translation: isDutch ? 'De hond (Nominativ) ziet de man (Akkusativ).' : 'The dog sees the man.',
            },
            {
              sentence: 'Ich gebe der Frau das Buch.',
              translation: isDutch ? 'Ik geef de vrouw (Dativ) het boek (Akkusativ).' : 'I give the book to the woman.',
            }
          ],
          drill: {
            question: isDutch
              ? 'Kies het juiste lidwoord: "Ich habe ___ neuen Wagen gekauft."'
              : 'Choose the correct article: "Ich habe ___ neuen Wagen gekauft."',
            options: ['einen', 'einem', 'einer', 'eines'],
            correctAnswer: 'einen',
            explanation: isDutch
              ? '"Wagen" is mannelijk (der Wagen) en fungeert hier als lijdend voorwerp (Akkusativ) -> "einen".'
              : '"Wagen" is masculine in the accusative direct object slot -> "einen".'
          }
        }
      ];

    case 'lt':
    default:
      return [
        {
          id: 'cases-overview',
          title: isDutch ? 'De 7 Litouwse Naamvallen (Linksniai)' : 'The 7 Lithuanian Cases',
          category: isDutch ? 'Zelfstandige Naamwoorden' : 'Nouns',
          summary: isDutch
            ? 'Het Litouws heeft 7 naamvallen. De uitgang van een woord verandert afhankelijk van de rol in de zin: Vardininkas (nominatief/onderwerp), Kilmininkas (genitief/bezit/ontkenning), Naudininkas (datief/meewerkend), Galininkas (accusatief/lijdend), Įnagininkas (instrumentalis/met wat), Vietininkas (locatief/waar), Šauksmininkas (vocatief/aanspreking).'
            : 'Lithuanian features 7 grammatical cases denoting sentence functions.',
          ruleFormula: isDutch 
            ? '1. Vardininkas (Wie/Wat) • 2. Kilmininkas (Van wie/Geen) • 3. Naudininkas (Aan wie) • 4. Galininkas (Wat doe je) • 5. Įnagininkas (Met wat) • 6. Vietininkas (Waar) • 7. Šauksmininkas (Aanspreken)'
            : 'Vardininkas, Kilmininkas, Naudininkas, Galininkas, Įnagininkas, Vietininkas, Šauksmininkas',
          examples: [
            {
              sentence: 'Kava yra karšta.',
              translation: isDutch ? 'De koffie is heet (Vardininkas - Onderwerp).' : 'The coffee is hot.',
              note: isDutch ? 'Onderwerp van de zin staat in de 1e naamval.' : 'Subject case.'
            },
            {
              sentence: 'Aš geriu kavą.',
              translation: isDutch ? 'Ik drink koffie (Galininkas - Lijdend voorwerp).' : 'I drink coffee.',
              note: isDutch ? 'De uitgang -a verandert in -ą bij het lijdend voorwerp.' : 'Accusative ending.'
            },
            {
              sentence: 'Aš neturiu kavos.',
              translation: isDutch ? 'Ik heb geen koffie (Kilmininkas - Genitief na ontkenning).' : 'I have no coffee.',
              note: isDutch ? 'Na een ontkenning (ne-) gebruik je in het Litouws ALTIJD de genitief (-os).' : 'Negative genitive rule.'
            }
          ],
          drill: {
            question: isDutch 
              ? 'Welke vorm is correct voor: "Aš noriu ___" (Ik wil water)? (vanduo = water)' 
              : 'Which form is correct: "Aš noriu ___"? (water)',
            options: ['vanduo', 'vandens', 'vandeniui', 'vandeniu'],
            correctAnswer: 'vandens',
            explanation: isDutch 
              ? 'Na "norėti" (willen) en bij ontelbare stoffen (partitief) gebruikt het Litouws de genitief: "vandens".' 
              : 'After norėti, Lithuanian governs the genitive case.'
          }
        },
        {
          id: 'verb-conjugations',
          title: isDutch ? 'De Drie Werkwoordsvervoegingen' : 'Verb Conjugations',
          category: isDutch ? 'Werkwoorden' : 'Verbs',
          summary: isDutch 
            ? 'Litouwse werkwoorden worden ingedeeld in 3 hoofdgroepen op basis van de 3e persoon tegenwoordige tijd: 1e groep (-a), 2e groep (-i) en 3e groep (-o).' 
            : 'Lithuanian verbs fall into 3 conjugations based on 3rd-person endings: -a, -i, and -o.',
          ruleFormula: isDutch 
            ? '1e groep: dirba (werken) • 2e groep: myli (houden van) • 3e groep: moko (leren)' 
            : 'Group 1 (-a) • Group 2 (-i) • Group 3 (-o)',
          examples: [
            {
              sentence: 'Aš dirbu, tu dirbi, jis dirba.',
              translation: isDutch ? 'Ik werk, jij werkt, hij werkt.' : 'I work, you work, he works.'
            },
            {
              sentence: 'Mes kalbame lietuviškai.',
              translation: isDutch ? 'Wij spreken Litouws.' : 'We speak Lithuanian.'
            }
          ],
          drill: {
            question: isDutch 
              ? 'Hoe zeg je "Jij leert" (mokytis / moko)?' 
              : 'How do you say "You learn"?',
            options: ['Tu mokai', 'Tu mokai', 'Tu mokaisi', 'Tu moki'],
            correctAnswer: 'Tu mokaisi',
            explanation: isDutch 
              ? '"Mokytis" is een wederkerend werkwoord (-si). Voor "tu" wordt dit "mokaisi".' 
              : 'Mokytis is reflexive, giving "tu mokaisi".'
          }
        }
      ];
  }
};
