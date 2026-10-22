import { LearningNode, Exercise, CefrLevel, Language } from '../types';
import { PlacementTestQuestion } from './placementTestService';
import { GrammarTopic } from '../data/grammarTopicsData';
import { SpeechScenario } from '../data/speechScenariosData';
import { WORLD_LANGUAGES } from '../data/languages';
import { Coffee, Compass, Users, Sparkles } from 'lucide-react';

// Dictionary of authentic native script linguistic profiles for major world writing systems
interface LanguageScriptProfile {
  greetings: { native: string; translationEn: string; ipa: string }[];
  cafePhrases: { native: string; translationEn: string; ipa: string }[];
  transitPhrases: { native: string; translationEn: string; ipa: string }[];
  socialPhrases: { native: string; translationEn: string; ipa: string }[];
  advancedPhrases: { native: string; translationEn: string; ipa: string }[];
  grammarTopics: { titleEn: string; nativeTitle: string; ruleEn: string; example: string }[];
}

const GLOBAL_SCRIPT_DATABASE: Record<string, LanguageScriptProfile> = {
  ar: {
    greetings: [
      { native: 'مَرْحَبًا! كَيْفَ حَالُكَ؟', translationEn: 'Hello! How are you?', ipa: '/marħaban kajfa ħaːluk/' },
      { native: 'صَبَاحُ الخَيْرِ', translationEn: 'Good morning', ipa: '/sˤabaːħu l-xajr/' },
      { native: 'أَهْلًا وَسَهْلًا بِكَ', translationEn: 'Welcome / Pleased to meet you', ipa: '/ʔahlan wa sahlan bika/' },
      { native: 'مَعَ السَّلَامَةِ', translationEn: 'Goodbye', ipa: '/maʕa s-salaːmah/' },
    ],
    cafePhrases: [
      { native: 'مِنْ فَضْلِكَ، أُرِيدُ فِنْجَانَ قَهْوَةٍ', translationEn: 'A cup of coffee, please', ipa: '/min fadˤlik ʔuriːdu find͡ʒaːna qahwah/' },
      { native: 'كَمْ ثَمَنُ هٰذَا؟', translationEn: 'How much is this?', ipa: '/kam θamanu haːðaː/' },
      { native: 'الحِسَابَ مِنْ فَضْلِكَ', translationEn: 'The check / bill, please', ipa: '/al-ħisaːba min fadˤlik/' },
    ],
    transitPhrases: [
      { native: 'أَيْنَ مَحَطَّةُ القِطَارِ؟', translationEn: 'Where is the train station?', ipa: '/ʔajna maħatˤtˤatu l-qitˤaːr/' },
      { native: 'هَلْ هٰذَا البَاصُ يَتَّجِهُ إِلَى المَرْكَزِ؟', translationEn: 'Does this bus go to the city center?', ipa: '/hal haːðaː l-baːsˤ jattad͡ʒihu ʔilaː l-markaz/' },
      { native: 'انْعَطِفْ إِلَى اليَمِينِ', translationEn: 'Turn right', ipa: '/inʕatifˤ ʔilaː l-jamiːn/' },
    ],
    socialPhrases: [
      { native: 'أَنَا أَتَعَلَّمُ اللُّغَةَ العَرَبِيَّةَ', translationEn: 'I am learning the Arabic language', ipa: '/ʔanaː ʔataʕallamu l-luɣata l-ʕarabijjah/' },
      { native: 'تَشَرَّفْتُ بِمَعْرِفَتِكَ جِدًّا', translationEn: 'Delighted to make your acquaintance', ipa: '/taʃarraftu bimaʕrifatika d͡ʒiddan/' },
    ],
    advancedPhrases: [
      { native: 'لَوْ كُنْتُ أَعْلَمُ، لَشَارَكْتُ فِي المُؤْتَمَرِ', translationEn: 'Had I known, I would have participated in the conference', ipa: '/law kuntu ʔaʕlam laʃaːraktu fiː l-muʔtamar/' },
      { native: 'يَجِبُ عَلَيْنَا أَنْ نُعِيدَ النَّظَرَ فِي الِاسْتِرَاتِيجِيَّةِ', translationEn: 'We must re-evaluate the strategic framework', ipa: '/jad͡ʒibu ʕalajnaː ʔan nuʕiːda n-nad͡zˤar/' },
    ],
    grammarTopics: [
      { titleEn: 'Definite Article & Sun/Moon Letters', nativeTitle: 'حروف الشمس والقمر', ruleEn: 'The definite article (الـ) assimilates before sun letters like ش, ت, د.', example: 'الشمس (ash-shams) vs القمر (al-qamar)' },
      { titleEn: 'Root System & Verb Measures', nativeTitle: 'الأوزان والتصريف', ruleEn: 'Most Arabic words stem from a 3-consonant triconsonantal root modified by vowel melodies.', example: 'ك-ت-ب: كَتَبَ (wrote), كِتَاب (book), مَكْتَبَة (library)' }
    ]
  },
  ja: {
    greetings: [
      { native: 'こんにちは！お元気ですか？', translationEn: 'Hello! How are you?', ipa: '/koɲɲitɕiwa oɡẽŋki desɯ ka/' },
      { native: 'おはようございます', translationEn: 'Good morning (polite)', ipa: '/ohajoː ɡozaimasɯ/' },
      { native: 'はじめまして、よろしくお願いします', translationEn: 'Pleased to meet you, looking forward to working with you', ipa: '/had͡ʑimemaɕite joroɕikɯ oneɡai ɕimasɯ/' },
      { native: 'さようなら、また会いましょう', translationEn: 'Goodbye, see you again', ipa: '/sajoːnaɾa mata aimasaː/' },
    ],
    cafePhrases: [
      { native: 'コーヒーを一つお願いします', translationEn: 'One coffee, please', ipa: '/koːçiː o çitotsɯ oneɡai ɕimasɯ/' },
      { native: 'お会計をお願いします', translationEn: 'The check / bill, please', ipa: '/okaːkeː o oneɡai ɕimasɯ/' },
      { native: 'これはいくらですか？', translationEn: 'How much is this?', ipa: '/koɾe wa ikɯɾa desɯ ka/' },
    ],
    transitPhrases: [
      { native: 'すみません、駅はどこですか？', translationEn: 'Excuse me, where is the station?', ipa: '/sɯmimasẽŋ eki wa doko desɯ ka/' },
      { native: '次の電車は何時に出発しますか？', translationEn: 'What time does the next train depart?', ipa: '/tsɯɡi no dẽŋɕa wa nand͡ʑi ni ɕɯppatsɯ ɕimasɯ ka/' },
      { native: '右に曲がってください', translationEn: 'Please turn right', ipa: '/miɡi ni maɡatte kɯdasai/' },
    ],
    socialPhrases: [
      { native: '日本語を勉強しています', translationEn: 'I am studying Japanese', ipa: '/nihoŋɡo o bẽŋkʲoː ɕite imasɯ/' },
      { native: '趣味は旅行と読書です', translationEn: 'My hobbies are traveling and reading', ipa: '/ɕɯmi wa ɾʲokoː to dokɯɕo desɯ/' },
    ],
    advancedPhrases: [
      { native: 'ご都合がよろしければ、ぜひご参加ください', translationEn: 'If your schedule permits, please honor us with your attendance', ipa: '/ɡotsɯɡoː ɡa joɾoɕikeɾeba zeçi ɡosaŋka kɯdasai/' },
      { native: '持続可能な社会の実現に向けて取り組んでいます', translationEn: 'We are working towards the realization of a sustainable society', ipa: '/d͡ʑizokɯ kanoːna ɕakai no d͡ʑitsɯɡẽŋ ni mɯkete toɾikɯnde imasɯ/' },
    ],
    grammarTopics: [
      { titleEn: 'Topic Marker は (wa) vs Subject Marker が (ga)', nativeTitle: '助詞「は」と「が」の使い分け', ruleEn: '「は」 introduces the known topic or establishes contrast; 「が」 marks new factual subjects or emphasis.', example: '私は学生です (Topic) vs 猫がいます (New subject)' },
      { titleEn: 'Keigo (Honorific & Humble Registers)', nativeTitle: '敬語体系（尊敬語・謙譲語・丁寧語）', ruleEn: 'Respectful language changes verbs depending on social distance and hierarchy.', example: '食べる → 召し上がる (Honorific) / いただく (Humble)' }
    ]
  },
  ru: {
    greetings: [
      { native: 'Здравствуйте! Как ваши дела?', translationEn: 'Hello! How are you? (polite)', ipa: '/ˈzdravstvʊjtʲe kak ˈvaʂɨ dʲɪˈla/' },
      { native: 'Доброе утро!', translationEn: 'Good morning!', ipa: '/ˈdobrəjə ˈutrə/' },
      { native: 'Очень приятно познакомиться', translationEn: 'Very pleased to meet you', ipa: '/ˈotɕɪnʲ prʲɪˈjatnə pəznɐˈkomʲɪt͡sə/' },
      { native: 'До свидания!', translationEn: 'Goodbye!', ipa: '/də svʲɪˈdanʲɪjə/' },
    ],
    cafePhrases: [
      { native: 'Чашку кофе с молоком, пожалуйста', translationEn: 'A cup of coffee with milk, please', ipa: '/ˈt͡ɕaʂkʊ ˈkofʲe s məlɐˈkom pɐˈʐalʊjstə/' },
      { native: 'Принесите счёт, пожалуйста', translationEn: 'Please bring the bill', ipa: '/prʲɪnʲɪˈsʲitʲe ɕːɵt pɐˈʐalʊjstə/' },
      { native: 'Сколько это стоит?', translationEn: 'How much does this cost?', ipa: '/ˈskolʲkə ˈɛtə ˈstoɪt/' },
    ],
    transitPhrases: [
      { native: 'Подскажите, где находится станция метро?', translationEn: 'Could you tell me where the metro station is?', ipa: '/pətskɐˈʐɨtʲe ɡdʲe nəxəˈdʲit͡sə ˈstantsɨjə mʲɪˈtro/' },
      { native: 'Поверните направо на следующем перекрёстке', translationEn: 'Turn right at the next intersection', ipa: '/pəvʲɪrˈnʲitʲe nɐˈpravo nɐ ˈslʲedʊjʊɕːɪm pʲɪrʲɪˈkrʲostkʲe/' },
    ],
    socialPhrases: [
      { native: 'Я с большим интересом изучаю русский язык', translationEn: 'I am learning the Russian language with great interest', ipa: '/ja s bɐlʲˈʂɨm ɪntʲɪˈrʲesəm ɪzʊˈt͡ɕajʊ ˈruskʲɪj jɪˈzɨk/' },
      { native: 'Расскажите о вашем городе', translationEn: 'Tell me about your city', ipa: '/rəskɐˈʐɨtʲe o ˈvaʂɨm ˈgorədʲe/' },
    ],
    advancedPhrases: [
      { native: 'Если бы я располагал временем, я непременно посетил бы Эрмитаж', translationEn: 'Had I the time at my disposal, I would certainly have visited the Hermitage', ipa: '/ˈjeslʲɪ bɨ ja rəspəlɐˈɡal ˈvrʲemʲɪnʲɪm/' },
    ],
    grammarTopics: [
      { titleEn: 'The 6 Grammatical Cases', nativeTitle: 'Система падежей', ruleEn: 'Russian nouns inflect across Nominative, Genitive, Dative, Accusative, Instrumental, and Prepositional cases.', example: 'книга (Nom) → книги (Gen) → книге (Dat/Prep) → книгу (Acc) → книгой (Inst)' },
      { titleEn: 'Verbal Aspects (Imperfective vs Perfective)', nativeTitle: 'Виды глагола (НСВ и СВ)', ruleEn: 'Imperfective focuses on ongoing processes; perfective highlights completed singular outcomes.', example: 'читать (to read continuously) vs прочитать (to finish reading)' }
    ]
  },
  zh: {
    greetings: [
      { native: '你好！今天过得怎么样？', translationEn: 'Hello! How is your day going?', ipa: '/ni˧˩˧ xaʊ̯˧˩˧ tɕin˥ tʰjɛn˥ kwɔ˥˩ tə˧ tsəm˧˩˧ mɤ˥ jɑŋ˥˩/' },
      { native: '早上好！很高兴认识你', translationEn: 'Good morning! Pleased to meet you', ipa: '/tsɑʊ̯˧˩˧ ʂɑŋ˥˩ xɑʊ̯˧˩˧ xən˧˩˧ ɡɑʊ̯˥ ɕiŋ˥˩ ʐən˥˩ ʂʐ̩˥˩ ni˧˩˧/' },
      { native: '再见，明天见！', translationEn: 'Goodbye, see you tomorrow!', ipa: '/tsaɪ̯˥˩ tɕjɛn˥˩ miŋ˧˥ tʰjɛn˥ tɕjɛn˥˩/' },
    ],
    cafePhrases: [
      { native: '请给我一杯热咖啡', translationEn: 'Please give me a cup of hot coffee', ipa: '/tɕʰiŋ˧˩˧ ɡeɪ̯˧˩˧ wɔ˧˩˧ i˥ peɪ̯˥ ʐɤ˥˩ kʰa˥ feɪ̯˥/' },
      { native: '买单，请问可以刷卡吗？', translationEn: 'The bill please, may I pay by card?', ipa: '/maɪ̯˧˩˧ tan˥ tɕʰiŋ˧˩˧ wən˥˩ kʰɤ˧˩˧ ji˧˩˧ ʂwa˥ kʰa˧˩˧ ma/' },
      { native: '这个多少钱？', translationEn: 'How much is this?', ipa: '/t͡ʂɤ˥˩ kɤ twɔ˥ ʂaʊ̯˧˩˧ tɕʰjɛn˧˥/' },
    ],
    transitPhrases: [
      { native: '请问最近的地铁站在哪里？', translationEn: 'Excuse me, where is the nearest metro station?', ipa: '/tɕʰiŋ˧˩˧ wən˥˩ tswɛɪ̯˥˩ tɕin˥˩ ti˥˩ tʰjɛ˧˩˧ t͡ʂan˥˩ tsaɪ̯˥˩ na˧˩˧ li/' },
      { native: '一直往前走，然后右转', translationEn: 'Go straight ahead, then turn right', ipa: '/i˥ t͡ʂʐ̩˧˥ wɑŋ˧˩˧ tɕʰjɛn˧˥ t͡soʊ̯˧˩˧ ʐan˧˥ xoʊ̯˥˩ joʊ̯˥˩ t͡swan˧˩˧/' },
    ],
    socialPhrases: [
      { native: '我正在努力学习中文', translationEn: 'I am diligently studying Chinese', ipa: '/wɔ˧˩˧ t͡ʂɤŋ˥˩ tsaɪ̯˥˩ nu˧˩˧ li˥˩ ɕɥɛ˧˥ ɕi˧˥ t͡ʂʊŋ˥ wən˧˥/' },
      { native: '你对中国文化感兴趣吗？', translationEn: 'Are you interested in Chinese culture?', ipa: '/ni˧˩˧ tweɪ̯˥˩ t͡ʂʊŋ˥ kwɔ˧˥ wən˧˥ xwa˥˩ ɡan˧˩˧ ɕiŋ˥˩ tɕʰɥ˥˩ ma/' },
    ],
    advancedPhrases: [
      { native: '只有通过不断的实践，才能真正掌握一门外语', translationEn: 'Only through persistent practice can one truly master a foreign tongue', ipa: '/t͡ʂʐ̩˧˩˧ joʊ̯˧˩˧ tʰʊŋ˥ kwɔ˥˩/' },
    ],
    grammarTopics: [
      { titleEn: 'Measure Words (Classifiers)', nativeTitle: '量词搭配', ruleEn: 'In Chinese, numbers and demonstratives require specific classifiers before nouns.', example: '一个人 (one person), 一本书 (one book), 一只猫 (one cat)' },
      { titleEn: 'Aspect Particles 了, 着, 过', nativeTitle: '动态助词（了、着、过）', ruleEn: 'Chinese verbs do not conjugate for tense; aspect particles indicate completed actions (了), ongoing states (着), or past life experiences (过).', example: '我看过这本书 (I have experienced reading this book)' }
    ]
  },
  ko: {
    greetings: [
      { native: '안녕하세요! 반갑습니다', translationEn: 'Hello! Nice to meet you (polite)', ipa: '/annjʌŋhasejo panɡapsɯmnida/' },
      { native: '좋은 아침입니다!', translationEn: 'Good morning!', ipa: '/t͡ɕoɯn at͡ɕʰimimnida/' },
      { native: '안녕히 계세요', translationEn: 'Goodbye (to someone staying)', ipa: '/annjʌŋçi kjesejo/' },
    ],
    cafePhrases: [
      { native: '따뜻한 아메리카노 한 잔 주세요', translationEn: 'One hot Americano, please', ipa: '/ttatɯtʰan ameɾikʰano han d͡ʑan d͡ʑusejo/' },
      { native: '계산해 주세요', translationEn: 'Please calculate the bill', ipa: '/kjesanɦɛ d͡ʑusejo/' },
      { native: '이거 얼마예요?', translationEn: 'How much is this?', ipa: '/iɡʌ ʌlmajejo/' },
    ],
    transitPhrases: [
      { native: '실례합니다, 지하철역이 어디에 있나요?', translationEn: 'Excuse me, where is the subway station?', ipa: '/ɕilljɛɦamnida t͡ɕiɦat͡ɕʰʌljʌɡi ʌdie innajo/' },
      { native: '다음 사거리에서 오른쪽으로 가세요', translationEn: 'Turn right at the next intersection', ipa: '/taɯm saɡʌɾiɛsʌ oɾɯnt͡ɕkɯɾo kasejo/' },
    ],
    socialPhrases: [
      { native: '한국어를 열심히 공부하고 있어요', translationEn: 'I am studying Korean diligently', ipa: '/hanɡuɡʌɾɯl jʌlɕimçi koŋbuɦaɡo issʌjo/' },
      { native: '한국 음식과 문화를 아주 좋아해요', translationEn: 'I really love Korean food and culture', ipa: '/hanɡuk ɯmɕikkwa munɦwaɾɯl ad͡ʑu t͡ɕoːaɦɛjo/' },
    ],
    advancedPhrases: [
      { native: '비록 어려움이 있더라도 최선을 다해야 합니다', translationEn: 'Even if there are hardships, one must do their utmost', ipa: '/piɾok ʌɾjʌumi ittʌɾado t͡ɕʰweɾsʌnɯl taɦɛja ɦamnida/' },
    ],
    grammarTopics: [
      { titleEn: 'Subject Marker (이/가) vs Topic Marker (은/는)', nativeTitle: '주격 조사와 보조사', ruleEn: '은/는 marks known topic or contrast; 이/가 marks grammatical subject or newly introduced focus.', example: '저는 학생입니다 (Topic) vs 비가 옵니다 (It is raining - new observation)' },
      { titleEn: 'Honorific Speech Levels (존댓말 & 반말)', nativeTitle: '높임법 체계', ruleEn: 'Verbs conjugate into formal high (하십시오체), polite casual (해요체), and informal plain (해체).', example: '가다 → 가십니다 / 가요 / 가' }
    ]
  },
  hi: {
    greetings: [
      { native: 'नमस्ते! आप कैसे हैं?', translationEn: 'Hello! How are you? (respectful)', ipa: '/nəməsteː aːp kɛːseː hɛ̃ː/' },
      { native: 'सुप्रभात! आपसे मिलकर बहुत खुशी हुई', translationEn: 'Good morning! Very glad to meet you', ipa: '/sʊprəbʱaːt aːpseː mɪləkər bəhʊt kʰʊʃiː hʊiː/' },
      { native: 'फिर मिलेंगे, अलविदा!', translationEn: 'See you again, farewell!', ipa: '/pʰɪr mɪleːŋgeː əlvɪdaː/' },
    ],
    cafePhrases: [
      { native: 'कृपया एक कप गर्म चाय दीजिए', translationEn: 'Please give me one cup of hot tea', ipa: '/krɪpəjaː eːk kəp gərm t͡ʃaːj diːd͡ʒɪjeː/' },
      { native: 'बिल ले आइए, कृपया', translationEn: 'Please bring the bill', ipa: '/bɪl leː aːɪjeː krɪpəjaː/' },
      { native: 'इसकी कीमत क्या है?', translationEn: 'What is the price of this?', ipa: '/ɪskiː qiːmət kjaː hɛː/' },
    ],
    transitPhrases: [
      { native: 'माफ़ कीजिए, निकटतम रेलवे स्टेशन कहाँ है?', translationEn: 'Excuse me, where is the nearest railway station?', ipa: '/maːf kiːd͡ʒɪjeː nɪkəʈtəm reːlveː sʈeːʃən kəhaː̃ hɛː/' },
      { native: 'सीधे आगे बढ़िए और दाहिने मुड़िए', translationEn: 'Go straight ahead and turn right', ipa: '/siːdʱeː aːgeː bəɽʱɪjeː ɔːr daːhɪneː mʊɽɪjeː/' },
    ],
    socialPhrases: [
      { native: 'मैं हिंदी भाषा सीख रहा हूँ', translationEn: 'I am learning the Hindi language', ipa: '/mɛ̃ː hɪndiː bʱaːʂaː siːkʰ rəhaː hũː/' },
    ],
    advancedPhrases: [
      { native: 'यदि हमने निरंतर प्रयास किया, तो सफलता निश्चित है', translationEn: 'If we put in continuous effort, success is certain', ipa: '/jədɪ həmneː nɪrəntər prəjaːs kɪjaː/' },
    ],
    grammarTopics: [
      { titleEn: 'Postpositions and Oblique Case', nativeTitle: 'कारक और परसर्ग', ruleEn: 'Hindi uses postpositions (में, पर, से, को) that convert preceding nouns into their oblique case forms.', example: 'कमरा (room) → कमरे में (in the room)' },
      { titleEn: 'Ergative Past Construction with ने (ne)', nativeTitle: 'सकर्मक भूतकाल और ने का प्रयोग', ruleEn: 'In transitive past tense, the subject takes ने and the verb agrees with the direct object in gender and number.', example: 'राम ने किताब पढ़ी (Ram read the book - verb feminine to agree with किताब)' }
    ]
  },
  de: {
    greetings: [
      { native: 'Guten Tag! Wie geht es Ihnen?', translationEn: 'Good day! How are you? (formal)', ipa: '/ˈɡuːtn̩ taːk viː ɡeːt ɛs ˈiːnən/' },
      { native: 'Guten Morgen! Schön, Sie kennenzulernen', translationEn: 'Good morning! Pleased to meet you', ipa: '/ˈɡuːtn̩ ˈmɔʁɡn̩ ʃøːn ziː ˈkɛnəntsuˌlɛʁnən/' },
      { native: 'Auf Wiedersehen, bis bald!', translationEn: 'Goodbye, see you soon!', ipa: '/aʊ̯f ˈviːdɐˌzeːən bɪs balt/' },
    ],
    cafePhrases: [
      { native: 'Einen Kaffee mit Hafermilch, bitte', translationEn: 'A coffee with oat milk, please', ipa: '/ˈaɪ̯nən ˈkafe mɪt ˈhaːfɐˌmɪlç ˈbɪtə/' },
      { native: 'Die Rechnung, bitte', translationEn: 'The check / bill, please', ipa: '/diː ˈʁɛçnʊŋ ˈbɪtə/' },
      { native: 'Wie viel kostet das?', translationEn: 'How much does that cost?', ipa: '/viː fiːl ˈkɔstət das/' },
    ],
    transitPhrases: [
      { native: 'Entschuldigung, wo ist der Hauptbahnhof?', translationEn: 'Excuse me, where is the main central train station?', ipa: '/ɛntˈʃʊldɪɡʊŋ voː ɪst deːɐ̯ ˈhaʊ̯ptbaːnˌhoːf/' },
      { native: 'Biegen Sie an der nächsten Kreuzung rechts ab', translationEn: 'Turn right at the next intersection', ipa: '/ˈbiːɡn̩ ziː an deːɐ̯ ˈnɛːçstn̩ ˈkʁɔɪ̯tsʊŋ ʁɛçts ap/' },
    ],
    socialPhrases: [
      { native: 'Ich lerne Deutsch mit großer Begeisterung', translationEn: 'I am learning German with great enthusiasm', ipa: '/ɪç ˈlɛʁnə dɔɪ̯tʃ mɪt ˈɡʁoːsɐ bəˈɡaɪ̯stəʁʊŋ/' },
    ],
    advancedPhrases: [
      { native: 'Hätte ich das gewusst, wäre ich früher abgereist', translationEn: 'Had I known that, I would have departed earlier', ipa: '/ˈhɛtə ɪç das ɡəˈvʊst vɛːʁə ɪç ˈfʁyːɐ ˈapɡəˌʁaɪ̯st/' },
    ],
    grammarTopics: [
      { titleEn: 'Verb-Second Word Order (V2)', nativeTitle: 'Hauptsatz-Wortstellung', ruleEn: 'In main clauses, the conjugated verb must always occupy the second syntactic position.', example: 'Gestern bin ich nach Berlin gefahren (Time element is #1, verb "bin" is #2)' },
      { titleEn: 'Four Noun Cases (Nominative, Accusative, Dative, Genitive)', nativeTitle: 'Die vier Fälle', ruleEn: 'Articles and adjectives inflect according to grammatical role in the sentence.', example: 'Der Mann (Nom) sieht den Hund (Acc) mit dem Kind (Dat)' }
    ]
  },
  fr: {
    greetings: [
      { native: 'Bonjour ! Comment allez-vous ?', translationEn: 'Hello! How are you? (polite)', ipa: '/bɔ̃ʒuʁ kɔmɑ̃ tale vu/' },
      { native: 'Enchanté de faire votre connaissance', translationEn: 'Enchanted to make your acquaintance', ipa: '/ɑ̃ʃɑ̃te də fɛʁ vɔtʁ kɔnɛsɑ̃s/' },
      { native: 'Au revoir et à très bientôt !', translationEn: 'Goodbye and see you very soon!', ipa: '/o ʁəvwaʁ e a tʁɛ bjɛ̃to/' },
    ],
    cafePhrases: [
      { native: 'Un café crème et un croissant, s’il vous plaît', translationEn: 'A coffee with cream and a croissant, please', ipa: '/œ̃ kafe kʁɛm e œ̃ kʁwasɑ̃ sil vu plɛ/' },
      { native: 'L’addition, s’il vous plaît', translationEn: 'The check / bill, please', ipa: '/ladisjɔ̃ sil vu plɛ/' },
      { native: 'Combien cela coûte-t-il ?', translationEn: 'How much does this cost?', ipa: '/kɔ̃bjɛ̃ səla kut til/' },
    ],
    transitPhrases: [
      { native: 'Pardon, où se trouve la station de métro la plus proche ?', translationEn: 'Pardon, where is the nearest metro station?', ipa: '/paʁdɔ̃ u sə tʁuv la stasjɔ̃ də metʁo/' },
      { native: 'Tournez à droite au prochain carrefour', translationEn: 'Turn right at the next intersection', ipa: '/tuʁne a dʁwat o pʁɔʃɛ̃ kaʁfuʁ/' },
    ],
    socialPhrases: [
      { native: 'J’apprends le français avec beaucoup de plaisir', translationEn: 'I am learning French with great pleasure', ipa: '/ʒapʁɑ̃ lə fʁɑ̃sɛ avɛk boku də pleziʁ/' },
    ],
    advancedPhrases: [
      { native: 'Bien qu’il fasse froid, nous continuons notre promenade', translationEn: 'Although it is cold, we continue our walk', ipa: '/bjɛ̃ kil fas fʁwa nu kɔ̃tinɥɔ̃ nɔtʁ pʁɔmənad/' },
    ],
    grammarTopics: [
      { titleEn: 'Subjunctive Mood Triggering', nativeTitle: 'Le Subjonctif Présent', ruleEn: 'Used after expressions of necessity, emotion, doubt, or subjective judgment with "que".', example: 'Il faut que vous veniez (It is necessary that you come)' },
      { titleEn: 'Passé Composé vs Imparfait', nativeTitle: 'Passé Composé et Imparfait', ruleEn: 'Passé composé marks specific completed actions; imparfait describes habitual background states.', example: 'Il pleuvait (Imparfait) quand je suis sorti (Passé Composé)' }
    ]
  },
  es: {
    greetings: [
      { native: '¡Hola! ¿Cómo estás hoy?', translationEn: 'Hello! How are you today?', ipa: '/ˈola ˈkomo esˈtas oj/' },
      { native: '¡Buenos días! Mucho gusto en conocerte', translationEn: 'Good morning! Pleased to meet you', ipa: '/ˈbwenos ˈdi.as ˈmutʃo ˈɣusto/' },
      { native: '¡Hasta luego, que tengas un gran día!', translationEn: 'See you later, have a wonderful day!', ipa: '/ˈasta ˈlweɣo ke ˈteŋɡas un ɡɾan ˈdi.a/' },
    ],
    cafePhrases: [
      { native: 'Un café con leche y una tostada, por favor', translationEn: 'A coffee with milk and toast, please', ipa: '/un kaˈfe kon ˈletʃe i ˈuna tosˈtaða poɾ faˈβoɾ/' },
      { native: 'La cuenta, por favor', translationEn: 'The check / bill, please', ipa: '/la ˈkwenta poɾ faˈβoɾ/' },
      { native: '¿Cuánto cuesta esto?', translationEn: 'How much does this cost?', ipa: '/ˈkwanto ˈkwesta ˈesto/' },
    ],
    transitPhrases: [
      { native: 'Disculpe, ¿dónde está la estación de tren?', translationEn: 'Excuse me, where is the train station?', ipa: '/disˈkulpe ˈdonde esˈta la estaˈsjon/' },
      { native: 'Gire a la derecha en la siguiente esquina', translationEn: 'Turn right at the next corner', ipa: '/ˈxiɾe a la deˈɾetʃa en la siˈɣjente esˈkina/' },
    ],
    socialPhrases: [
      { native: 'Estoy aprendiendo español con mucho entusiasmo', translationEn: 'I am learning Spanish with great enthusiasm', ipa: '/esˈtoj apɾenˈdjendo espaˈɲol/' },
    ],
    advancedPhrases: [
      { native: 'Si hubiera tenido más tiempo, te habría acompañado', translationEn: 'Had I had more time, I would have accompanied you', ipa: '/si uˈβjeɾa teˈniðo mas ˈtjempo/' },
    ],
    grammarTopics: [
      { titleEn: 'Ser vs Estar Distinction', nativeTitle: 'Diferencia entre Ser y Estar', ruleEn: 'Ser defines permanent essence, origin, and identity; Estar marks states, locations, and conditions.', example: 'Soy profesor (Identity) vs Estoy cansado (Current temporary condition)' },
      { titleEn: 'The Present Subjunctive', nativeTitle: 'El Presente de Subjuntivo', ruleEn: 'Expresses desires, doubts, possibilities, and emotional reactions.', example: 'Espero que tengas un buen viaje (I hope you have a safe trip)' }
    ]
  },
  nl: {
    greetings: [
      { native: 'Goedendag! Hoe gaat het met u?', translationEn: 'Good day! How are you doing? (polite)', ipa: '/ˌɣudə(n)ˈdɑx hu ɣaːt ət mɛt y/' },
      { native: 'Goedemorgen! Aangenaam kennis te maken', translationEn: 'Good morning! Pleased to make your acquaintance', ipa: '/ˌɣudəˈmɔrɣə(n) ˈaːŋɣəˌnaːm/' },
      { native: 'Tot ziens en een fijne dag verder!', translationEn: 'Goodbye and have a nice rest of the day!', ipa: '/tɔt zins ɛn ən ˈfɛinə dɑx/' },
    ],
    cafePhrases: [
      { native: 'Een koffie verkeerd en een appeltaart, alstublieft', translationEn: 'A coffee with warm milk and apple pie, please', ipa: '/ən ˈkɔfi vərˈkeːrt ɛn ən ˈɑpəlˌtaːrt/' },
      { native: 'Mag ik de rekening, alstublieft?', translationEn: 'May I have the bill, please?', ipa: '/mɑx ɪk də ˈreːkənɪŋ ɑlstyˈblift/' },
      { native: 'Hoeveel kost dit samen?', translationEn: 'How much does this cost together?', ipa: '/ˈhuveːl kɔst dɪt ˈsaːmə(n)/' },
    ],
    transitPhrases: [
      { native: 'Pardon, waar is het centrale treinstation?', translationEn: 'Pardon, where is the central train station?', ipa: '/pɑrˈdɔn ʋaːr ɪs ət sɛnˈtraːlə ˈtrɛinˌstaːʃɔn/' },
      { native: 'Sla rechtsaf bij het volgende stoplicht', translationEn: 'Turn right at the next traffic light', ipa: '/slaː ˈrɛxtsˌɑf bɛi ət ˈvɔlɣəndə ˈstɔpˌlɪxt/' },
    ],
    socialPhrases: [
      { native: 'Ik leer Nederlands om hier vloeiend te communiceren', translationEn: 'I am learning Dutch to communicate fluently here', ipa: '/ɪk leːr ˈneːdərˌlɑnts/' },
    ],
    advancedPhrases: [
      { native: 'Mocht u nog vragen hebben, aarzel dan niet om contact op te nemen', translationEn: 'Should you have any further questions, do not hesitate to reach out', ipa: '/mɔxt y nɔx ˈvraːɣə(n) ˈhɛbə(n)/' },
    ],
    grammarTopics: [
      { titleEn: 'De vs Het Articles', nativeTitle: 'De en Het Woorden', ruleEn: 'Common gender nouns take "de" (approx 75%); neuter nouns take "het" (all diminutives take "het").', example: 'De man, de tafel, het huis, het meisje' },
      { titleEn: 'Inversion and Subordinate Clause Word Order (SOV)', nativeTitle: 'Bijzin Woordvolgorde', ruleEn: 'In subordinate clauses, all verbs move to the very end of the sentence.', example: '...omdat ik gisteren naar school ben gefietst' }
    ]
  },
  it: {
    greetings: [
      { native: 'Ciao! Come stai oggi?', translationEn: 'Hello! How are you today?', ipa: '/ˈtʃa.o ˈko.me ˈstai ˈod.dʒi/' },
      { native: 'Buongiorno! Molto piacere', translationEn: 'Good morning! Pleased to meet you', ipa: '/ˌbwɔnˈdʒor.no ˈmol.to pjaˈtʃe.re/' },
      { native: 'Arrivederci e a presto!', translationEn: 'Goodbye and see you soon!', ipa: '/ar.ri.veˈder.tʃi e a ˈprɛs.to/' },
    ],
    cafePhrases: [
      { native: 'Un espresso e un cornetto, per favore', translationEn: 'An espresso and a croissant, please', ipa: '/un eˈsprɛs.so e un korˈnet.to per faˈvo.re/' },
      { native: 'Il conto, per favore', translationEn: 'The bill / check, please', ipa: '/il ˈkon.to per faˈvo.re/' },
      { native: 'Quanto costa questo?', translationEn: 'How much does this cost?', ipa: '/ˈkwan.to ˈkɔs.ta ˈkwe.sto/' },
    ],
    transitPhrases: [
      { native: 'Scusi, dov’è la stazione ferroviaria?', translationEn: 'Excuse me, where is the train station?', ipa: '/ˈsku.zi doˈvɛ lla statˈtsjo.ne/' },
      { native: 'Giri a destra al prossimo incrocio', translationEn: 'Turn right at the next intersection', ipa: '/ˈdʒi.ri a ˈdɛ.stra al ˈprɔs.si.mo inˈkro.tʃo/' },
    ],
    socialPhrases: [
      { native: 'Studio l’italiano con grande passione', translationEn: 'I study Italian with great passion', ipa: '/ˈstu.djo li.taˈlja.no kon ˈɡran.de pasˈsjo.ne/' },
    ],
    advancedPhrases: [
      { native: 'Se l’avessi saputo prima, sarei venuto volentieri', translationEn: 'Had I known earlier, I would have gladly come', ipa: '/se laˈves.si saˈpu.to ˈpri.ma/' },
    ],
    grammarTopics: [
      { titleEn: 'The Congiuntivo (Subjunctive Mood)', nativeTitle: 'Il Congiuntivo', ruleEn: 'Expresses subjectivity, doubt, emotions, and hypothetical wishes.', example: 'Penso che tu abbia ragione (I think you are right)' },
      { titleEn: 'Direct and Indirect Pronoun Combination', nativeTitle: 'Pronomi Combinati', ruleEn: 'Indirect pronouns (mi, ti, gli) change to (me, te, glie-) when preceding direct pronouns (lo, la, li, le).', example: 'Me lo dici? (Will you tell me that?)' }
    ]
  },
  pt: {
    greetings: [
      { native: 'Olá! Tudo bem com você?', translationEn: 'Hello! Is everything well with you?', ipa: '/oˈla ˈtu.du bɐ̃j kõ voˈse/' },
      { native: 'Bom dia! Muito prazer em conhecê-lo', translationEn: 'Good morning! Pleased to meet you', ipa: '/bõ ˈdi.ɐ ˈmũj.tu pɾɐˈzeɾ/' },
      { native: 'Até logo, tenha um bom dia!', translationEn: 'See you later, have a good day!', ipa: '/aˈtɛ ˈlɔ.ɡu ˈtɐ̃.ɲɐ ũ bõ ˈdi.ɐ/' },
    ],
    cafePhrases: [
      { native: 'Um café e um pastel de nata, por favor', translationEn: 'A coffee and a custard tart, please', ipa: '/ũ kɐˈfɛ i ũ pɐʃˈtɛl də ˈna.tɐ/' },
      { native: 'A conta, por favor', translationEn: 'The check / bill, please', ipa: '/ɐ ˈkõ.tɐ puɾ fɐˈvoɾ/' },
      { native: 'Quanto custa isto?', translationEn: 'How much does this cost?', ipa: '/ˈkwɐ̃.tu ˈkuʃ.tɐ ˈiʃ.tu/' },
    ],
    transitPhrases: [
      { native: 'Com licença, onde fica a estação central?', translationEn: 'Excuse me, where is the central station?', ipa: '/kõ liˈsẽ.sɐ ˈõ.dɨ ˈfi.kɐ ɐ ɨʃ.tɐˈsɐ̃w̃/' },
      { native: 'Vire à direita na próxima esquina', translationEn: 'Turn right at the next corner', ipa: '/ˈvi.ɾi a diˈɾej.tɐ/' },
    ],
    socialPhrases: [
      { native: 'Estou aprendendo português com muita alegria', translationEn: 'I am learning Portuguese with great joy', ipa: '/iʃˈtow ɐ.pɾẽˈdẽ.du puɾ.tuˈɡeʃ/' },
    ],
    advancedPhrases: [
      { native: 'Se eu tivesse sabido antes, teria participado', translationEn: 'Had I known before, I would have participated', ipa: '/se ew tʃiˈvɛ.si sɐˈbi.du ˈɐ̃.tʃis/' },
    ],
    grammarTopics: [
      { titleEn: 'Personal Infinitive (Infinitivo Pessoal)', nativeTitle: 'Infinitivo Pessoal', ruleEn: 'Unique to Portuguese: the infinitive conjugates to indicate its grammatical subject.', example: 'Para nós falarmos fluentemente (For us to speak fluently)' },
      { titleEn: 'Future Subjunctive (Futuro do Subjuntivo)', nativeTitle: 'Futuro do Subjuntivo', ruleEn: 'Used in temporal and conditional clauses projecting into future reality.', example: 'Quando você chegar, começamos (When you arrive, we will start)' }
    ]
  }
};

// Generic fallback script constructor for any other language in WORLD_LANGUAGES
function getScriptProfile(langCode: string, langName: string): LanguageScriptProfile {
  if (GLOBAL_SCRIPT_DATABASE[langCode]) {
    return GLOBAL_SCRIPT_DATABASE[langCode];
  }

  const lang = WORLD_LANGUAGES.find((l) => l.code === langCode);
  const sample = lang?.sampleGreeting || `Hello (${langName})`;
  const nativeName = lang?.nativeName || langName;

  return {
    greetings: [
      { native: sample, translationEn: `Hello / Greetings in ${langName}`, ipa: `/${langCode}-greeting/` },
      { native: `${sample} • ${nativeName}`, translationEn: `Pleased to meet you in ${langName}`, ipa: `/${langCode}-meet/` },
      { native: `${sample}`, translationEn: `Goodbye in ${langName}`, ipa: `/${langCode}-farewell/` },
    ],
    cafePhrases: [
      { native: `${sample}`, translationEn: `A coffee, please in ${langName}`, ipa: `/${langCode}-order/` },
      { native: `${sample}`, translationEn: `The check, please in ${langName}`, ipa: `/${langCode}-bill/` },
      { native: `${sample}`, translationEn: `How much is this? in ${langName}`, ipa: `/${langCode}-price/` },
    ],
    transitPhrases: [
      { native: `${sample}`, translationEn: `Where is the station? in ${langName}`, ipa: `/${langCode}-transit/` },
      { native: `${sample}`, translationEn: `Turn right in ${langName}`, ipa: `/${langCode}-directions/` },
    ],
    socialPhrases: [
      { native: `${sample}`, translationEn: `I am learning ${langName}`, ipa: `/${langCode}-learning/` },
    ],
    advancedPhrases: [
      { native: `${sample}`, translationEn: `Advanced idiom in ${langName}`, ipa: `/${langCode}-advanced/` },
    ],
    grammarTopics: [
      { titleEn: `Core Morphology of ${langName}`, nativeTitle: `${nativeName} Grammar`, ruleEn: `Essential word structure and sentence building rules in ${langName}.`, example: `${sample}` },
      { titleEn: `Verbal Tenses & Agreement`, nativeTitle: `${nativeName} Verbs`, ruleEn: `Subject-verb agreement and tense markers in ${langName}.`, example: `${sample}` },
    ]
  };
}

// Translations of UI prompt templates into native languages
const NATIVE_PROMPT_TRANSLATIONS: Record<string, {
  chooseGreeting: string;
  orderCoffee: string;
  askDirections: string;
  introduceSelf: string;
  completeSentence: string;
  correctExplanation: string;
  grammarTip: string;
  culturalNote: string;
  speakClearPrompt: string;
}> = {
  nl: {
    chooseGreeting: 'Kies de meest natuurlijke begroeting:',
    orderCoffee: 'Hoe bestel je beleefd een drankje?',
    askDirections: 'Hoe vraag je beleefd de weg naar het station?',
    introduceSelf: 'Stel jezelf voor in de doeltaal:',
    completeSentence: 'Vul het ontbrekende woord in:',
    correctExplanation: 'Correcte grammatica en natuurlijke idioom.',
    grammarTip: 'Let op de woordvolgorde en beleefdheidsvormen in deze taal.',
    culturalNote: 'Begroetingen met warmte en respect zijn essentieel in deze cultuur.',
    speakClearPrompt: 'Spreek deze zin duidelijk uit in de microfoon:',
  },
  en: {
    chooseGreeting: 'Select the most natural greeting:',
    orderCoffee: 'How do you politely order a drink?',
    askDirections: 'How do you politely ask for directions to the station?',
    introduceSelf: 'Introduce yourself in the target language:',
    completeSentence: 'Fill in the missing word:',
    correctExplanation: 'Correct grammar and natural authentic idiom.',
    grammarTip: 'Pay close attention to word order and formal courtesy registers.',
    culturalNote: 'Warm greetings and respectful tone are essential in this culture.',
    speakClearPrompt: 'Pronounce this phrase clearly into the microphone:',
  },
  de: {
    chooseGreeting: 'Wähle die natürlichste Begrüßung aus:',
    orderCoffee: 'Wie bestellst du höflich ein Getränk?',
    askDirections: 'Wie fragst du höflich nach dem Weg zum Bahnhof?',
    introduceSelf: 'Stelle dich in der Zielsprache vor:',
    completeSentence: 'Ergänze das fehlende Wort:',
    correctExplanation: 'Richtige Grammatik und authentische Redewendung.',
    grammarTip: 'Achte auf die Satzstellung und Höflichkeitsformen.',
    culturalNote: 'Höfliche Begrüßung ist in dieser Kultur sehr wichtig.',
    speakClearPrompt: 'Sprich diesen Satz deutlich ins Mikrofon:',
  },
  fr: {
    chooseGreeting: 'Sélectionnez la salutation la plus naturelle :',
    orderCoffee: 'Comment commander poliment une boisson ?',
    askDirections: 'Comment demander poliment le chemin de la gare ?',
    introduceSelf: 'Présentez-vous dans la langue cible :',
    completeSentence: 'Complétez le mot manquant :',
    correctExplanation: 'Grammaire correcte et expression idiomatique naturelle.',
    grammarTip: 'Faites attention à l’ordre des mots et aux formes de politesse.',
    culturalNote: 'Une salutation chaleureuse est essentielle dans cette culture.',
    speakClearPrompt: 'Prononcez cette phrase clairement au micro :',
  },
  es: {
    chooseGreeting: 'Selecciona el saludo más natural:',
    orderCoffee: '¿Cómo pides educadamente una bebida?',
    askDirections: '¿Cómo preguntas educadamente por la estación?',
    introduceSelf: 'Preséntate en el idioma de destino:',
    completeSentence: 'Completa la palabra que falta:',
    correctExplanation: 'Gramática correcta y modismo natural y auténtico.',
    grammarTip: 'Presta atención al orden de las palabras y al registro de cortesía.',
    culturalNote: 'Saludar con calidez es fundamental en esta cultura.',
    speakClearPrompt: 'Pronuncia esta frase con claridad en el micrófono:',
  },
  it: {
    chooseGreeting: 'Seleziona il saluto più naturale:',
    orderCoffee: 'Come ordini educatamente una bevanda?',
    askDirections: 'Come chiedi indicazioni per la stazione?',
    introduceSelf: 'Presentati nella lingua di destinazione:',
    completeSentence: 'Inserisci la parola mancante:',
    correctExplanation: 'Grammatica corretta ed espressione naturale.',
    grammarTip: 'Fai attenzione all’accordo e ai registri di cortesia.',
    culturalNote: 'Il saluto caloroso è fondamentale in questa cultura.',
    speakClearPrompt: 'Pronuncia chiaramente questa frase nel microfono:',
  },
  ar: {
    chooseGreeting: 'اختر التحية الأكثر طبيعية:',
    orderCoffee: 'كيف تطلب مشروبًا بأدب؟',
    askDirections: 'كيف تسأل بأدب عن محطة القطار؟',
    introduceSelf: 'قدم نفسك باللغة الهدف:',
    completeSentence: 'املأ الكلمة الناقصة:',
    correctExplanation: 'قواعد نحوية دقيقة وتعبير أصيل.',
    grammarTip: 'انتبه لتناسق الكلمات وصيغ الاحترام.',
    culturalNote: 'إلقاء التحية باحترام ركن أساسي في هذه الثقافة.',
    speakClearPrompt: 'انطق هذه العبارة بوضوح في الميكروفون:',
  },
  ja: {
    chooseGreeting: '最も自然な挨拶を選択してください：',
    orderCoffee: '丁寧に飲み物を注文するには？',
    askDirections: '駅への道を尋ねる丁寧な表現は？',
    introduceSelf: '自己紹介をしましょう：',
    completeSentence: '適切な単語を埋めてください：',
    correctExplanation: '文法的に正しく自然な表現です。',
    grammarTip: '語順と丁寧語の使い分けに注意しましょう。',
    culturalNote: '挨拶と敬意の表現はこの文化において非常に重要です。',
    speakClearPrompt: 'マイクに向かってハッキリと発音してください：',
  }
};

function getNativePrompts(nativeLangCode: string) {
  return NATIVE_PROMPT_TRANSLATIONS[nativeLangCode] || NATIVE_PROMPT_TRANSLATIONS['en'];
}

export class AICurriculumEngine {
  // In-memory cache for dynamic curriculum nodes
  private static curriculumCache = new Map<string, LearningNode[]>();
  private static placementTestCache = new Map<string, PlacementTestQuestion[]>();
  private static grammarCache = new Map<string, GrammarTopic[]>();
  private static speechScenarioCache = new Map<string, SpeechScenario[]>();

  /**
   * Fetch or dynamically generate curriculum nodes for any language pair & CEFR level
   */
  public static async getCurriculum(
    targetLang: Language,
    nativeLangCode: string,
    cefr: CefrLevel
  ): Promise<LearningNode[]> {
    const cacheKey = `${targetLang.code}_${nativeLangCode}_${cefr}`;
    if (this.curriculumCache.has(cacheKey)) {
      return this.curriculumCache.get(cacheKey)!;
    }

    // Try calling Gemini API backend
    try {
      const nativeLangObj = WORLD_LANGUAGES.find((l) => l.code === nativeLangCode);
      const res = await fetch('/api/gemini/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: targetLang.name,
          targetLanguageCode: targetLang.code,
          nativeLanguage: nativeLangObj?.name || 'English',
          nativeLanguageCode: nativeLangCode,
          cefrLevel: cefr,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0) {
          const mappedNodes: LearningNode[] = data.nodes.map((n: any, idx: number) => ({
            id: n.id || `${targetLang.code}-${cefr.toLowerCase()}-${idx + 1}`,
            title: n.title || `Unit ${idx + 1}`,
            nativeTitle: n.nativeTitle || targetLang.name,
            category: n.category || 'Conversation',
            cefr: cefr,
            description: n.description || `Master essential ${targetLang.name} at level ${cefr}.`,
            xpReward: n.xpReward || 60,
            gemReward: n.gemReward || 12,
            targetDurationMinutes: 5,
            iconName: n.iconName || (idx === 0 ? 'Sparkles' : 'Compass'),
            coordinates: { x: 140 + idx * 120, y: 180 + (idx % 2 === 0 ? 0 : 50) },
            exercises: (n.exercises || []).map((ex: any, eIdx: number) => ({
              id: ex.id || `ex-${cefr.toLowerCase()}-${idx}-${eIdx}`,
              type: ex.type || 'multiple-choice',
              prompt: ex.prompt,
              targetPhrase: ex.targetPhrase,
              translation: ex.translation,
              phoneticIpa: ex.phoneticIpa,
              options: ex.options || [ex.targetPhrase],
              correctAnswer: ex.correctAnswer || ex.targetPhrase,
              culturalNote: ex.culturalNote,
              grammarTip: ex.grammarTip,
            }))
          }));

          this.curriculumCache.set(cacheKey, mappedNodes);
          return mappedNodes;
        }
      }
    } catch {
      // Graceful fallback to procedural generator below
    }

    // Procedural generation fallback using authentic native scripts
    const fallbackNodes = this.generateProceduralNodes(targetLang, nativeLangCode, cefr);
    this.curriculumCache.set(cacheKey, fallbackNodes);
    return fallbackNodes;
  }

  /**
   * Generates procedural learning nodes with authentic native scripts and localized prompts
   */
  public static generateProceduralNodes(
    targetLang: Language,
    nativeLangCode: string,
    cefr: CefrLevel
  ): LearningNode[] {
    const profile = getScriptProfile(targetLang.code, targetLang.name);
    const prompts = getNativePrompts(nativeLangCode);

    const greeting1 = profile.greetings[0];
    const greeting2 = profile.greetings[1] || profile.greetings[0];
    const cafe1 = profile.cafePhrases[0];
    const transit1 = profile.transitPhrases[0];
    const advanced1 = profile.advancedPhrases[0] || profile.socialPhrases[0];

    const phraseForLevel = 
      cefr === 'A1' ? greeting1 :
      cefr === 'A2' ? cafe1 :
      cefr === 'A3' ? transit1 :
      advanced1;

    const alt1 = profile.greetings[2]?.native || profile.cafePhrases[1]?.native || '---';
    const alt2 = profile.transitPhrases[1]?.native || profile.cafePhrases[2]?.native || '---';
    const alt3 = profile.socialPhrases[0]?.native || '---';

    return [
      {
        id: `${targetLang.code}-${cefr.toLowerCase()}-1`,
        title: `${targetLang.name} • ${cefr} Core Mastery`,
        nativeTitle: phraseForLevel.native,
        category: cefr === 'A1' ? 'Foundations' : cefr === 'A2' || cefr === 'A3' ? 'Conversation' : 'Advanced Mastery',
        cefr: cefr,
        description: `${prompts.chooseGreeting} Master authentic phrasing and native script articulation.`,
        xpReward: 60,
        gemReward: 12,
        targetDurationMinutes: 5,
        iconName: 'Sparkles',
        coordinates: { x: 140, y: 180 },
        exercises: [
          {
            id: `ex-${targetLang.code}-${cefr}-1`,
            type: 'multiple-choice',
            prompt: prompts.chooseGreeting,
            targetPhrase: phraseForLevel.native,
            translation: phraseForLevel.translationEn,
            phoneticIpa: phraseForLevel.ipa,
            options: [phraseForLevel.native, alt1, alt2, alt3].sort(() => 0.5 - Math.random()),
            correctAnswer: phraseForLevel.native,
            culturalNote: prompts.culturalNote,
            grammarTip: prompts.grammarTip,
          },
          {
            id: `ex-${targetLang.code}-${cefr}-2`,
            type: 'speech-pronounce',
            prompt: prompts.speakClearPrompt,
            targetPhrase: phraseForLevel.native,
            translation: phraseForLevel.translationEn,
            phoneticIpa: phraseForLevel.ipa,
            correctAnswer: phraseForLevel.native,
            culturalNote: prompts.culturalNote,
          },
        ]
      },
      {
        id: `${targetLang.code}-${cefr.toLowerCase()}-2`,
        title: `${targetLang.name} • Real-World Context`,
        nativeTitle: (cefr === 'A1' ? greeting2 : cafe1).native,
        category: 'Conversation',
        cefr: cefr,
        description: prompts.orderCoffee,
        xpReward: 70,
        gemReward: 15,
        targetDurationMinutes: 5,
        iconName: 'Coffee',
        coordinates: { x: 280, y: 240 },
        exercises: [
          {
            id: `ex-${targetLang.code}-${cefr}-3`,
            type: 'multiple-choice',
            prompt: cefr === 'A1' ? prompts.introduceSelf : prompts.orderCoffee,
            targetPhrase: (cefr === 'A1' ? greeting2 : cafe1).native,
            translation: (cefr === 'A1' ? greeting2 : cafe1).translationEn,
            phoneticIpa: (cefr === 'A1' ? greeting2 : cafe1).ipa,
            options: [(cefr === 'A1' ? greeting2 : cafe1).native, alt1, alt2, alt3].sort(() => 0.5 - Math.random()),
            correctAnswer: (cefr === 'A1' ? greeting2 : cafe1).native,
            grammarTip: prompts.grammarTip,
          },
          {
            id: `ex-${targetLang.code}-${cefr}-4`,
            type: 'speech-pronounce',
            prompt: prompts.speakClearPrompt,
            targetPhrase: (cefr === 'A1' ? greeting2 : cafe1).native,
            translation: (cefr === 'A1' ? greeting2 : cafe1).translationEn,
            phoneticIpa: (cefr === 'A1' ? greeting2 : cafe1).ipa,
            correctAnswer: (cefr === 'A1' ? greeting2 : cafe1).native,
          }
        ]
      }
    ];
  }

  /**
   * Fetch dynamic placement test for any language pair across the full CEFR spectrum
   */
  public static async getPlacementQuestions(
    targetLang: Language,
    nativeLangCode: string
  ): Promise<PlacementTestQuestion[]> {
    const cacheKey = `placement_${targetLang.code}_${nativeLangCode}`;
    if (this.placementTestCache.has(cacheKey)) {
      return this.placementTestCache.get(cacheKey)!;
    }

    try {
      const nativeLangObj = WORLD_LANGUAGES.find((l) => l.code === nativeLangCode);
      const res = await fetch('/api/gemini/placement-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: targetLang.name,
          targetLanguageCode: targetLang.code,
          nativeLanguage: nativeLangObj?.name || 'English',
          nativeLanguageCode: nativeLangCode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions) && data.questions.length >= 5) {
          const questions: PlacementTestQuestion[] = data.questions.map((q: any, idx: number) => ({
            id: idx + 1,
            level: q.level || (idx < 3 ? 'A1' : idx < 6 ? 'B1' : 'C1'),
            target_skill: q.target_skill || `Diagnostic Assessment Q${idx + 1}`,
            prompt_native: q.prompt_native || targetLang.name,
            prompt_translation: q.prompt_translation || `Question ${idx + 1}`,
            options: (q.options || []).map((opt: any, oIdx: number) => ({
              key: (['A', 'B', 'C', 'D'][oIdx] || 'A') as 'A' | 'B' | 'C' | 'D',
              text_native: opt.text_native || opt,
              text_translation: opt.text_translation || '',
            })),
            correct_key: (q.correct_key || 'A') as 'A' | 'B' | 'C' | 'D',
            explanation_translation: q.explanation_translation || 'Evaluates grammatical precision and vocabulary depth.'
          }));

          this.placementTestCache.set(cacheKey, questions);
          return questions;
        }
      }
    } catch {
      // Fallback
    }

    const fallbackQuestions = this.generateProceduralPlacementQuestions(targetLang, nativeLangCode);
    this.placementTestCache.set(cacheKey, fallbackQuestions);
    return fallbackQuestions;
  }

  /**
   * Procedurally generate 10 placement questions covering A1 to C2 with native scripts
   */
  public static generateProceduralPlacementQuestions(
    targetLang: Language,
    nativeLangCode: string
  ): PlacementTestQuestion[] {
    const profile = getScriptProfile(targetLang.code, targetLang.name);
    const prompts = getNativePrompts(nativeLangCode);

    const questions: PlacementTestQuestion[] = [
      // Q1: A1 Greetings
      {
        id: 1,
        level: 'A1',
        target_skill: 'Greetings & Survival Phrases',
        prompt_native: profile.greetings[0]?.native || targetLang.name,
        prompt_translation: `${prompts.chooseGreeting} "${profile.greetings[0]?.translationEn || 'Hello'}"`,
        options: [
          { key: 'A', text_native: profile.greetings[0]?.native || 'Option A', text_translation: profile.greetings[0]?.translationEn || '' },
          { key: 'B', text_native: profile.cafePhrases[1]?.native || 'Option B', text_translation: profile.cafePhrases[1]?.translationEn || '' },
          { key: 'C', text_native: profile.transitPhrases[1]?.native || 'Option C', text_translation: profile.transitPhrases[1]?.translationEn || '' },
          { key: 'D', text_native: profile.socialPhrases[0]?.native || 'Option D', text_translation: profile.socialPhrases[0]?.translationEn || '' },
        ],
        correct_key: 'A',
        explanation_translation: prompts.correctExplanation,
      },
      // Q2: A2 Routine Ordering
      {
        id: 2,
        level: 'A2',
        target_skill: 'Cafe & Commercial Ordering',
        prompt_native: profile.cafePhrases[0]?.native || targetLang.name,
        prompt_translation: `${prompts.orderCoffee} "${profile.cafePhrases[0]?.translationEn || 'Coffee please'}"`,
        options: [
          { key: 'A', text_native: profile.greetings[1]?.native || 'Option A', text_translation: profile.greetings[1]?.translationEn || '' },
          { key: 'B', text_native: profile.cafePhrases[0]?.native || 'Option B', text_translation: profile.cafePhrases[0]?.translationEn || '' },
          { key: 'C', text_native: profile.transitPhrases[0]?.native || 'Option C', text_translation: profile.transitPhrases[0]?.translationEn || '' },
          { key: 'D', text_native: profile.greetings[2]?.native || 'Option D', text_translation: profile.greetings[2]?.translationEn || '' },
        ],
        correct_key: 'B',
        explanation_translation: prompts.correctExplanation,
      },
      // Q3: A3 Navigation
      {
        id: 3,
        level: 'A3',
        target_skill: 'Wayfinding & Urban Transit',
        prompt_native: profile.transitPhrases[0]?.native || targetLang.name,
        prompt_translation: `${prompts.askDirections} "${profile.transitPhrases[0]?.translationEn || 'Where is the station?'}"`,
        options: [
          { key: 'A', text_native: profile.greetings[0]?.native || 'Option A', text_translation: profile.greetings[0]?.translationEn || '' },
          { key: 'B', text_native: profile.cafePhrases[0]?.native || 'Option B', text_translation: profile.cafePhrases[0]?.translationEn || '' },
          { key: 'C', text_native: profile.transitPhrases[0]?.native || 'Option C', text_translation: profile.transitPhrases[0]?.translationEn || '' },
          { key: 'D', text_native: profile.socialPhrases[0]?.native || 'Option D', text_translation: profile.socialPhrases[0]?.translationEn || '' },
        ],
        correct_key: 'C',
        explanation_translation: prompts.correctExplanation,
      },
      // Q4: B1 Social Introductions
      {
        id: 4,
        level: 'B1',
        target_skill: 'Personal Background & Learning',
        prompt_native: profile.socialPhrases[0]?.native || targetLang.name,
        prompt_translation: `${prompts.introduceSelf} "${profile.socialPhrases[0]?.translationEn || 'I am learning'}"`,
        options: [
          { key: 'A', text_native: profile.socialPhrases[0]?.native || 'Option A', text_translation: profile.socialPhrases[0]?.translationEn || '' },
          { key: 'B', text_native: profile.cafePhrases[1]?.native || 'Option B', text_translation: profile.cafePhrases[1]?.translationEn || '' },
          { key: 'C', text_native: profile.transitPhrases[1]?.native || 'Option C', text_translation: profile.transitPhrases[1]?.translationEn || '' },
          { key: 'D', text_native: profile.greetings[1]?.native || 'Option D', text_translation: profile.greetings[1]?.translationEn || '' },
        ],
        correct_key: 'A',
        explanation_translation: prompts.correctExplanation,
      },
      // Q5: B2 In-depth Conversation
      {
        id: 5,
        level: 'B2',
        target_skill: 'Polite Conversational Formulas',
        prompt_native: profile.greetings[1]?.native || targetLang.name,
        prompt_translation: `${prompts.chooseGreeting} "${profile.greetings[1]?.translationEn || 'Good morning'}"`,
        options: [
          { key: 'A', text_native: profile.cafePhrases[2]?.native || 'Option A', text_translation: profile.cafePhrases[2]?.translationEn || '' },
          { key: 'B', text_native: profile.transitPhrases[0]?.native || 'Option B', text_translation: profile.transitPhrases[0]?.translationEn || '' },
          { key: 'C', text_native: profile.greetings[1]?.native || 'Option C', text_translation: profile.greetings[1]?.translationEn || '' },
          { key: 'D', text_native: profile.greetings[0]?.native || 'Option D', text_translation: profile.greetings[0]?.translationEn || '' },
        ],
        correct_key: 'C',
        explanation_translation: prompts.correctExplanation,
      },
      // Q6: B3 Commercial Inquiries
      {
        id: 6,
        level: 'B3',
        target_skill: 'Transactions & Account Balancing',
        prompt_native: profile.cafePhrases[1]?.native || targetLang.name,
        prompt_translation: `${prompts.completeSentence} "${profile.cafePhrases[1]?.translationEn || 'The bill please'}"`,
        options: [
          { key: 'A', text_native: profile.greetings[2]?.native || 'Option A', text_translation: profile.greetings[2]?.translationEn || '' },
          { key: 'B', text_native: profile.cafePhrases[1]?.native || 'Option B', text_translation: profile.cafePhrases[1]?.translationEn || '' },
          { key: 'C', text_native: profile.transitPhrases[0]?.native || 'Option C', text_translation: profile.transitPhrases[0]?.translationEn || '' },
          { key: 'D', text_native: profile.socialPhrases[0]?.native || 'Option D', text_translation: profile.socialPhrases[0]?.translationEn || '' },
        ],
        correct_key: 'B',
        explanation_translation: prompts.correctExplanation,
      },
      // Q7: C1 Advanced Syntax
      {
        id: 7,
        level: 'C1',
        target_skill: 'Complex Subordinate Expressions',
        prompt_native: profile.advancedPhrases[0]?.native || targetLang.name,
        prompt_translation: `Hypothetical or complex structure: "${profile.advancedPhrases[0]?.translationEn || 'Advanced phrasing'}"`,
        options: [
          { key: 'A', text_native: profile.greetings[0]?.native || 'Option A', text_translation: profile.greetings[0]?.translationEn || '' },
          { key: 'B', text_native: profile.cafePhrases[0]?.native || 'Option B', text_translation: profile.cafePhrases[0]?.translationEn || '' },
          { key: 'C', text_native: profile.advancedPhrases[0]?.native || 'Option C', text_translation: profile.advancedPhrases[0]?.translationEn || '' },
          { key: 'D', text_native: profile.transitPhrases[1]?.native || 'Option D', text_translation: profile.transitPhrases[1]?.translationEn || '' },
        ],
        correct_key: 'C',
        explanation_translation: prompts.correctExplanation,
      },
      // Q8: C2 High-Register Expressions
      {
        id: 8,
        level: 'C2',
        target_skill: 'Diplomatic & Professional Registry',
        prompt_native: (profile.advancedPhrases[1] || profile.advancedPhrases[0]).native,
        prompt_translation: `Professional nuance: "${(profile.advancedPhrases[1] || profile.advancedPhrases[0]).translationEn}"`,
        options: [
          { key: 'A', text_native: (profile.advancedPhrases[1] || profile.advancedPhrases[0]).native, text_translation: (profile.advancedPhrases[1] || profile.advancedPhrases[0]).translationEn },
          { key: 'B', text_native: profile.greetings[1]?.native || 'Option B', text_translation: profile.greetings[1]?.translationEn || '' },
          { key: 'C', text_native: profile.cafePhrases[1]?.native || 'Option C', text_translation: profile.cafePhrases[1]?.translationEn || '' },
          { key: 'D', text_native: profile.transitPhrases[0]?.native || 'Option D', text_translation: profile.transitPhrases[0]?.translationEn || '' },
        ],
        correct_key: 'A',
        explanation_translation: prompts.correctExplanation,
      },
      // Q9: C3 Literary Inversions
      {
        id: 9,
        level: 'C3',
        target_skill: 'Stylistic Mastery & Morphology',
        prompt_native: profile.grammarTopics[0]?.example || profile.greetings[0]?.native,
        prompt_translation: `Syntactic agreement rule: "${profile.grammarTopics[0]?.titleEn || 'Grammar'}"`,
        options: [
          { key: 'A', text_native: profile.cafePhrases[0]?.native || 'Option A', text_translation: profile.cafePhrases[0]?.translationEn || '' },
          { key: 'B', text_native: profile.grammarTopics[0]?.example || 'Option B', text_translation: profile.grammarTopics[0]?.titleEn || '' },
          { key: 'C', text_native: profile.greetings[2]?.native || 'Option C', text_translation: profile.greetings[2]?.translationEn || '' },
          { key: 'D', text_native: profile.transitPhrases[0]?.native || 'Option D', text_translation: profile.transitPhrases[0]?.translationEn || '' },
        ],
        correct_key: 'B',
        explanation_translation: prompts.correctExplanation,
      },
      // Q10: C3+ Native Pragmatic Nuance
      {
        id: 10,
        level: 'C3+',
        target_skill: 'Native Pragmatic Nuances & Etymology',
        prompt_native: profile.grammarTopics[1]?.example || profile.advancedPhrases[0]?.native,
        prompt_translation: `Native nuance and subtle register shift: "${profile.grammarTopics[1]?.titleEn || 'Advanced Mastery'}"`,
        options: [
          { key: 'A', text_native: profile.greetings[0]?.native || 'Option A', text_translation: profile.greetings[0]?.translationEn || '' },
          { key: 'B', text_native: profile.transitPhrases[1]?.native || 'Option B', text_translation: profile.transitPhrases[1]?.translationEn || '' },
          { key: 'C', text_native: profile.cafePhrases[2]?.native || 'Option C', text_translation: profile.cafePhrases[2]?.translationEn || '' },
          { key: 'D', text_native: profile.grammarTopics[1]?.example || 'Option D', text_translation: profile.grammarTopics[1]?.titleEn || '' },
        ],
        correct_key: 'D',
        explanation_translation: prompts.correctExplanation,
      },
    ];

    return questions;
  }

  /**
   * Fetch dynamic grammar topics for any language pair
   */
  public static async getGrammarTopics(
    targetLang: Language,
    nativeLangCode: string
  ): Promise<GrammarTopic[]> {
    const cacheKey = `grammar_${targetLang.code}_${nativeLangCode}`;
    if (this.grammarCache.has(cacheKey)) {
      return this.grammarCache.get(cacheKey)!;
    }

    try {
      const nativeLangObj = WORLD_LANGUAGES.find((l) => l.code === nativeLangCode);
      const res = await fetch('/api/gemini/grammar-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: targetLang.name,
          targetLanguageCode: targetLang.code,
          nativeLanguage: nativeLangObj?.name || 'English',
          nativeLanguageCode: nativeLangCode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
          const topics: GrammarTopic[] = data.topics.map((t: any, idx: number) => {
            const firstRule = t.rules?.[0];
            const firstPractice = t.practice?.[0];
            return {
              id: t.id || `topic-${idx + 1}`,
              title: t.title || `Grammar Topic ${idx + 1}`,
              category: t.category || (idx === 0 ? 'Foundations & Word Order' : 'Verbs & Structural Patterns'),
              summary: t.summary || `Grammar principles for ${targetLang.name}`,
              ruleFormula: t.ruleFormula || (firstRule ? `${firstRule.ruleTitle}: ${firstRule.explanation}` : `${t.nativeTitle || targetLang.name} Structure`),
              examples: (firstRule?.examples || t.examples || []).map((ex: any) => ({
                sentence: ex.targetText || ex.sentence || '',
                translation: ex.nativeTranslation || ex.translation || '',
                note: ex.note || ex.phoneticIpa || ''
              })),
              drill: {
                question: firstPractice?.prompt || firstPractice?.sentence || t.drill?.question || `Choose the correct form for: "${t.title || targetLang.name}"`,
                options: firstPractice?.options || t.drill?.options || ['Option A', 'Option B', 'Option C'],
                correctAnswer: firstPractice?.correctAnswer || t.drill?.correctAnswer || 'Option A',
                explanation: firstPractice?.explanation || t.drill?.explanation || 'Follows the grammatical rule.'
              }
            };
          });

          this.grammarCache.set(cacheKey, topics);
          return topics;
        }
      }
    } catch {
      // Fallback
    }

    const fallbackTopics = this.generateProceduralGrammar(targetLang, nativeLangCode);
    this.grammarCache.set(cacheKey, fallbackTopics);
    return fallbackTopics;
  }

  private static generateProceduralGrammar(targetLang: Language, nativeLangCode: string): GrammarTopic[] {
    const profile = getScriptProfile(targetLang.code, targetLang.name);
    const prompts = getNativePrompts(nativeLangCode);

    return profile.grammarTopics.map((g, idx) => ({
      id: `topic-${targetLang.code}-${idx + 1}`,
      title: g.titleEn,
      category: idx === 0 ? 'Core Syntax' : 'Verbs & Morphology',
      summary: g.ruleEn,
      ruleFormula: `${g.nativeTitle}: ${g.ruleEn}`,
      examples: [
        {
          sentence: g.example,
          translation: `${targetLang.name} example`,
          note: prompts.culturalNote,
        }
      ],
      drill: {
        question: `${prompts.completeSentence}: "${g.example}"`,
        options: [
          g.example,
          profile.greetings[0]?.native || 'Choice 2',
          profile.cafePhrases[0]?.native || 'Choice 3'
        ].filter(Boolean),
        correctAnswer: g.example,
        explanation: prompts.correctExplanation,
      }
    }));
  }

  /**
   * Fetch dynamic speech scenarios for any language pair
   */
  public static async getSpeechScenarios(
    targetLang: Language,
    nativeLangCode: string
  ): Promise<SpeechScenario[]> {
    const cacheKey = `speech_${targetLang.code}_${nativeLangCode}`;
    if (this.speechScenarioCache.has(cacheKey)) {
      return this.speechScenarioCache.get(cacheKey)!;
    }

    const getScenarioIcon = (id: string) => {
      const lower = (id || '').toLowerCase();
      if (lower.includes('cafe') || lower.includes('food') || lower.includes('coffee')) return Coffee;
      if (lower.includes('transit') || lower.includes('direct') || lower.includes('travel') || lower.includes('city')) return Compass;
      if (lower.includes('social') || lower.includes('friend') || lower.includes('meet') || lower.includes('intro')) return Users;
      return Sparkles;
    };

    try {
      const nativeLangObj = WORLD_LANGUAGES.find((l) => l.code === nativeLangCode);
      const res = await fetch('/api/gemini/speech-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: targetLang.name,
          targetLanguageCode: targetLang.code,
          nativeLanguage: nativeLangObj?.name || 'English',
          nativeLanguageCode: nativeLangCode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.scenarios && Array.isArray(data.scenarios) && data.scenarios.length > 0) {
          const scenarios: SpeechScenario[] = data.scenarios.map((s: any, idx: number) => ({
            id: s.id || `scenario-${idx + 1}`,
            title: s.title || `Scenario ${idx + 1}`,
            category: s.category || 'Daily Life',
            icon: getScenarioIcon(s.id),
            description: s.description || '',
            phrases: (s.phrases || []).map((p: any, pIdx: number) => ({
              id: `${s.id || idx}-p-${pIdx}`,
              targetText: p.targetText || '',
              nativeTranslation: p.nativeTranslation || '',
              ipa: p.ipa || '',
              contextTip: p.contextTip || ''
            }))
          }));

          this.speechScenarioCache.set(cacheKey, scenarios);
          return scenarios;
        }
      }
    } catch {
      // Fallback
    }

    const fallbackScenarios = this.generateProceduralSpeechScenarios(targetLang, nativeLangCode);
    this.speechScenarioCache.set(cacheKey, fallbackScenarios);
    return fallbackScenarios;
  }

  private static generateProceduralSpeechScenarios(targetLang: Language, nativeLangCode: string): SpeechScenario[] {
    const profile = getScriptProfile(targetLang.code, targetLang.name);
    const prompts = getNativePrompts(nativeLangCode);

    return [
      {
        id: 'cafe',
        title: `${prompts.orderCoffee.replace(/[?:]/g, '')}`,
        category: 'Food & Dining',
        icon: Coffee,
        description: `Order drinks, ask for prices, and settle the check in authentic ${targetLang.name}.`,
        phrases: profile.cafePhrases.map((p, idx) => ({
          id: `cafe-p-${idx}`,
          targetText: p.native,
          nativeTranslation: p.translationEn,
          ipa: p.ipa,
          contextTip: prompts.grammarTip,
        }))
      },
      {
        id: 'transit',
        title: `${prompts.askDirections.replace(/[?:]/g, '')}`,
        category: 'Travel & Urban Transit',
        icon: Compass,
        description: `Navigate streets, find railway stations, and request directions in ${targetLang.name}.`,
        phrases: profile.transitPhrases.map((p, idx) => ({
          id: `transit-p-${idx}`,
          targetText: p.native,
          nativeTranslation: p.translationEn,
          ipa: p.ipa,
          contextTip: prompts.culturalNote,
        }))
      },
      {
        id: 'social',
        title: `${prompts.introduceSelf.replace(/[?:]/g, '')}`,
        category: 'Social & Connections',
        icon: Users,
        description: `Introduce yourself, share hobbies, and make authentic connections.`,
        phrases: profile.socialPhrases.concat(profile.greetings.slice(0, 2)).map((p, idx) => ({
          id: `social-p-${idx}`,
          targetText: p.native,
          nativeTranslation: p.translationEn,
          ipa: p.ipa,
          contextTip: prompts.culturalNote,
        }))
      }
    ];
  }
}
