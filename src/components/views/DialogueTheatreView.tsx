import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  RotateCcw, 
  User, 
  Bot, 
  Utensils, 
  Handshake, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  Check,
  Mic,
  MicOff
} from 'lucide-react';
import { Language, UserProfile } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';
import { speechDetector } from '../../services/speechDetectionService';
import { isRtlLanguage, stripTransliteration } from '../../services/languageTypography';
import { getI18n } from '../../services/localization';
import { WORLD_LANGUAGES } from '../../data/languages';

interface DialogueTheatreViewProps {
  activeLanguage: Language;
  user: UserProfile;
}

export interface WritingFeedback {
  isAccurate: boolean;
  suggestion: string;
  improvedUserPhrase?: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  nativeTranslation: string;
  timestamp: string;
  writingFeedback?: WritingFeedback;
}

interface ChatScenario {
  id: string;
  title: string;
  icon: React.ElementType;
  persona: string;
  setting: string;
  initialMessage: string;
  initialTranslation: string;
  suggestedReplies: Array<{ text: string; translation: string }>;
}

export const DialogueTheatreView: React.FC<DialogueTheatreViewProps> = ({
  activeLanguage,
  user,
}) => {
  const nativeCode = user.nativeLanguageCode || 'en';
  const isDutch = nativeCode === 'nl';
  const i18n = getI18n(nativeCode);

  const nativeLangObj = WORLD_LANGUAGES.find((l) => l.code === nativeCode);
  const nativeLangName = nativeLangObj ? nativeLangObj.name : (isDutch ? 'Dutch' : 'English');

  // Dynamic scenarios adapted to ANY target language and user's native language
  const getScenariosForLanguage = (targetCode: string, targetName: string): ChatScenario[] => {
    switch (targetCode) {
      case 'ar':
        return [
          {
            id: 'cafe',
            title: isDutch ? 'In het Arabische Café' : 'At the Arab Cafe',
            icon: Utensils,
            persona: 'النادل كريم (Waiter Karim)',
            setting: 'مقهى تقليدي جميل في وسط المدينة (Traditional cafe in town)',
            initialMessage: 'أهلاً وسهلاً بك! ماذا تحب أن تشرب اليوم؟',
            initialTranslation: isDutch ? 'Welkom! Wat wil je vandaag drinken?' : 'Welcome! What would you like to drink today?',
            suggestedReplies: [
              { text: 'قهوة عربية مع الهيل، من فضلك.', translation: isDutch ? 'Arabische koffie met kardemom, alstublieft.' : 'Arabic coffee with cardamom, please.' },
              { text: 'شاي بالنعناع، لو سمحت.', translation: isDutch ? 'Muntthee, alstublieft.' : 'Mint tea, please.' },
              { text: 'كم ثمن فنجان القهوة؟', translation: isDutch ? 'Hoeveel kost een kop koffie?' : 'How much is the coffee?' }
            ]
          },
          {
            id: 'introductions',
            title: isDutch ? 'Kennismaken' : 'Meeting a Local Friend',
            icon: Handshake,
            persona: 'فاطمة (Fatima)',
            setting: 'في حديقة المدينة الهادئة (In the city park)',
            initialMessage: 'مرحباً! تشرفت بمعرفتك. من أين أنت؟',
            initialTranslation: isDutch ? 'Hallo! Aangenaam kennis te maken. Waar kom je vandaan?' : 'Hello! Nice to meet you. Where are you from?',
            suggestedReplies: [
              { text: 'أهلاً فاطمة! أنا سعيد بوجودي هنا.', translation: isDutch ? 'Hallo Fatima! Ik ben blij hier te zijn.' : 'Hello Fatima! Happy to be here.' },
              { text: 'أنا أتعلم اللغة العربية بشغف.', translation: isDutch ? 'Ik leer met passie Arabisch.' : 'I am passionately learning Arabic.' },
              { text: 'فرصة سعيدة جداً!', translation: isDutch ? 'Heel prettig kennis te maken!' : 'Very pleased to meet you!' }
            ]
          },
          {
            id: 'directions',
            title: isDutch ? 'De Weg Vragen' : 'Asking Directions',
            icon: Compass,
            persona: 'عمر (Passerby Omar)',
            setting: 'بالقرب من محطة المترو المركزية (Near central station)',
            initialMessage: 'عفواً، هل تبحث عن مكان معين؟',
            initialTranslation: isDutch ? 'Pardon, zoekt u een bepaalde plek?' : 'Excuse me, are you looking for a place?',
            suggestedReplies: [
              { text: 'نعم، أين تقع محطة القطار؟', translation: isDutch ? 'Ja, waar is het treinstation?' : 'Yes, where is the train station?' },
              { text: 'كيف أصل إلى السوق القديم؟', translation: isDutch ? 'Hoe kom ik bij de oude soek?' : 'How do I reach the old souq?' },
              { text: 'شكراً جزيلاً على مساعدتك!', translation: isDutch ? 'Hartelijk dank voor uw hulp!' : 'Thank you very much for your help!' }
            ]
          }
        ];

      case 'ja':
        return [
          {
            id: 'cafe',
            title: isDutch ? 'In de Koffiebar in Tokio' : 'At the Tokyo Cafe',
            icon: Utensils,
            persona: '店員ケン (Barista Ken)',
            setting: '渋谷の静かなカフェ (Quiet cafe in Shibuya)',
            initialMessage: 'いらっしゃいませ！ご注文はお決まりですか？',
            initialTranslation: isDutch ? 'Welkom! Heeft u al gekozen?' : 'Welcome! Have you decided on your order?',
            suggestedReplies: [
              { text: 'ホットコーヒーを一つお願いします。', translation: isDutch ? 'Een warme koffie, alstublieft.' : 'A hot coffee, please.' },
              { text: '抹茶ラテはありますか？', translation: isDutch ? 'Hebben jullie een matcha latte?' : 'Do you have matcha latte?' },
              { text: 'お会計をお願いします。', translation: isDutch ? 'De rekening, alstublieft.' : 'The bill, please.' }
            ]
          },
          {
            id: 'introductions',
            title: isDutch ? 'Kennismaken' : 'Meeting in Japan',
            icon: Handshake,
            persona: 'ユキ (Yuki)',
            setting: '公園のベンチ (Park in Tokyo)',
            initialMessage: 'こんにちは！はじめまして。お名前は何ですか？',
            initialTranslation: isDutch ? 'Hallo! Aangenaam. Wat is je naam?' : 'Hello! Nice to meet you. What is your name?',
            suggestedReplies: [
              { text: 'はじめまして、日本語を勉強しています。', translation: isDutch ? 'Aangenaam, ik leer Japans.' : 'Nice to meet you, I am learning Japanese.' },
              { text: '日本に来られてとても嬉しいです。', translation: isDutch ? 'Ik ben erg blij in Japan te zijn.' : 'I am very glad to be in Japan.' },
              { text: 'よろしくお願いします！', translation: isDutch ? 'Prettige kennismaking!' : 'Pleased to make your acquaintance!' }
            ]
          },
          {
            id: 'directions',
            title: isDutch ? 'De Weg Vragen' : 'Asking Directions',
            icon: Compass,
            persona: '駅員 (Station Attendant)',
            setting: '新宿駅前 (Outside Shinjuku Station)',
            initialMessage: 'すみません、どちらへ行かれますか？',
            initialTranslation: isDutch ? 'Pardon, waar wilt u naartoe?' : 'Excuse me, where are you headed?',
            suggestedReplies: [
              { text: 'JR線の乗り場はどこですか？', translation: isDutch ? 'Waar is het JR-perron?' : 'Where is the JR train entrance?' },
              { text: '切符売り場はどちらですか？', translation: isDutch ? 'Waar zijn de kaartautomaten?' : 'Where is the ticket machine?' },
              { text: 'どうもありがとうございます！', translation: isDutch ? 'Hartelijk dank!' : 'Thank you very much!' }
            ]
          }
        ];

      case 'zh':
        return [
          {
            id: 'cafe',
            title: isDutch ? 'In het Theehuis' : 'At the Teahouse',
            icon: Utensils,
            persona: '服务员李明 (Waiter Li Ming)',
            setting: '闹市区的传统茶馆 (Traditional teahouse downtown)',
            initialMessage: '您好！欢迎光临。请问想喝点什么茶？',
            initialTranslation: isDutch ? 'Hallo! Welkom. Welke thee wilt u drinken?' : 'Hello! Welcome. What tea would you like?',
            suggestedReplies: [
              { text: '请给我一杯龙井茶，谢谢。', translation: isDutch ? 'Een kop Longjing thee, dank u.' : 'A cup of Longjing tea, please.' },
              { text: '请问有特色小吃吗？', translation: isDutch ? 'Zijn er speciale hapjes?' : 'Are there specialty snacks?' },
              { text: '请问多少钱？', translation: isDutch ? 'Hoeveel kost dat?' : 'How much is it?' }
            ]
          },
          {
            id: 'introductions',
            title: isDutch ? 'Kennismaken' : 'Meeting Someone',
            icon: Handshake,
            persona: '张伟 (Zhang Wei)',
            setting: '大学校园 (University campus)',
            initialMessage: '你好！很高兴认识你。你是哪国人？',
            initialTranslation: isDutch ? 'Hallo! Aangenaam. Uit welk land kom je?' : 'Hello! Nice to meet you. Which country are you from?',
            suggestedReplies: [
              { text: '你好！我正在学习中文。', translation: isDutch ? 'Hallo! Ik ben Chinees aan het leren.' : 'Hello! I am learning Chinese.' },
              { text: '这里的风景真漂亮！', translation: isDutch ? 'Het uitzicht hier is prachtig!' : 'The scenery here is truly beautiful!' },
              { text: '认识你很高兴！', translation: isDutch ? 'Fijn om kennis te maken!' : 'Nice to meet you!' }
            ]
          },
          {
            id: 'directions',
            title: isDutch ? 'De Weg Vragen' : 'Asking Directions',
            icon: Compass,
            persona: '路人王阿姨 (Passerby Aunt Wang)',
            setting: '市中心步行街 (Pedestrian street downtown)',
            initialMessage: '你好，需要帮忙找路吗？',
            initialTranslation: isDutch ? 'Hallo, heeft u hulp nodig bij het vinden van de weg?' : 'Hello, do you need help finding your way?',
            suggestedReplies: [
              { text: '请问地铁站在哪里？', translation: isDutch ? 'Waar is het metrostation?' : 'Where is the subway station?' },
              { text: '到博物馆怎么走？', translation: isDutch ? 'Hoe kom ik bij het museum?' : 'How do I get to the museum?' },
              { text: '太感谢您了！', translation: isDutch ? 'Ontzettend bedankt!' : 'Thank you so much!' }
            ]
          }
        ];

      case 'ru':
        return [
          {
            id: 'cafe',
            title: isDutch ? 'In het Café' : 'At the Cafe',
            icon: Utensils,
            persona: 'Официант Дмитрий (Waiter Dmitry)',
            setting: 'Уютное кафе на Невском проспекте (Cozy cafe)',
            initialMessage: 'Добрый день! Добро пожаловать. Что вам принести?',
            initialTranslation: isDutch ? 'Goedendag! Welkom. Wat mag ik u brengen?' : 'Good day! Welcome. What may I bring you?',
            suggestedReplies: [
              { text: 'Один капучино и пирожное, пожалуйста.', translation: isDutch ? 'Een cappuccino en een gebakje, alstublieft.' : 'A cappuccino and pastry, please.' },
              { text: 'Можно стакан воды, пожалуйста?', translation: isDutch ? 'Mag ik een glas water, alstublieft?' : 'May I have a glass of water, please?' },
              { text: 'Счёт, пожалуйста.', translation: isDutch ? 'De rekening, alstublieft.' : 'The bill, please.' }
            ]
          },
          {
            id: 'introductions',
            title: isDutch ? 'Kennismaken' : 'Introductions',
            icon: Handshake,
            persona: 'Анна (Anna)',
            setting: 'В городском парке (City park)',
            initialMessage: 'Здравствуйте! Очень приятно познакомиться. Вы откуда?',
            initialTranslation: isDutch ? 'Hallo! Aangenaam kennis te maken. Waar komt u vandaan?' : 'Hello! Very nice to meet you. Where are you from?',
            suggestedReplies: [
              { text: 'Здравствуйте! Я изучаю русский язык.', translation: isDutch ? 'Hallo! Ik leer de Russische taal.' : 'Hello! I am learning Russian.' },
              { text: 'Мне очень нравится этот город.', translation: isDutch ? 'Ik vind deze stad erg mooi.' : 'I like this city very much.' },
              { text: 'Рад нашему знакомству!', translation: isDutch ? 'Blij met onze kennismaking!' : 'Glad to meet you!' }
            ]
          },
          {
            id: 'directions',
            title: isDutch ? 'De Weg Vragen' : 'Navigation',
            icon: Compass,
            persona: 'Прохожий (Passerby)',
            setting: 'Около станции метро (Near metro)',
            initialMessage: 'Извините, вы ищете дорогу?',
            initialTranslation: isDutch ? 'Pardon, zoekt u de weg?' : 'Excuse me, looking for directions?',
            suggestedReplies: [
              { text: 'Да, подскажите, где здесь метро?', translation: isDutch ? 'Ja, kunt u zeggen waar de metro is?' : 'Yes, where is the metro here?' },
              { text: 'Как пройти к площади?', translation: isDutch ? 'Hoe loop ik naar het plein?' : 'How do I walk to the square?' },
              { text: 'Большое спасибо за помощь!', translation: isDutch ? 'Hartelijk dank voor de hulp!' : 'Thank you very much for the help!' }
            ]
          }
        ];

      case 'es':
        return [
          {
            id: 'cafe',
            title: isDutch ? 'In het Café & Restaurant' : 'At the Cafe & Restaurant',
            icon: Utensils,
            persona: 'Camarero Mateo (Waiter Mateo)',
            setting: 'Un café animado en Madrid (Lively cafe in Madrid)',
            initialMessage: '¡Hola! Bienvenidos. ¿Qué les gustaría tomar hoy?',
            initialTranslation: isDutch ? 'Hallo! Welkom. Wat willen jullie vandaag drinken?' : 'Hello! Welcome. What would you like to drink today?',
            suggestedReplies: [
              { text: 'Un café con leche, por favor.', translation: isDutch ? 'Een koffie met melk, alstublieft.' : 'A coffee with milk, please.' },
              { text: '¿Tienen zumo de naranja natural?', translation: isDutch ? 'Hebben jullie verse jus d\'orange?' : 'Do you have fresh orange juice?' },
              { text: 'La cuenta, por favor.', translation: isDutch ? 'De rekening, alstublieft.' : 'The check, please.' }
            ]
          },
          {
            id: 'introductions',
            title: isDutch ? 'Kennismaken in het Park' : 'Meeting a Local Friend',
            icon: Handshake,
            persona: 'Elena (Amiga local)',
            setting: 'Parque del Retiro en Madrid (Retiro Park in Madrid)',
            initialMessage: '¡Hola! Mucho gusto, me llamo Elena. ¿De dónde vienes?',
            initialTranslation: isDutch ? 'Hallo! Aangenaam, ik heet Elena. Waar kom je vandaan?' : 'Hi! Nice to meet you, I am Elena. Where are you from?',
            suggestedReplies: [
              { text: '¡Mucho gusto! Estoy aprendiendo español.', translation: isDutch ? 'Aangenaam! Ik leer Spaans.' : 'Nice to meet you! I am learning Spanish.' },
              { text: 'Madrid es una ciudad maravillosa.', translation: isDutch ? 'Madrid is een prachtige stad.' : 'Madrid is a wonderful city.' },
              { text: '¡Encantado de conocerte!', translation: isDutch ? 'Verheugd kennis te maken!' : 'Delighted to meet you!' }
            ]
          },
          {
            id: 'directions',
            title: isDutch ? 'De Weg Vragen' : 'Asking Directions',
            icon: Compass,
            persona: 'Carlos (Transeúnte)',
            setting: 'Plaza del Sol en Madrid (Sol square)',
            initialMessage: '¡Hola! Disculpe, ¿necesita ayuda para encontrar algún sitio?',
            initialTranslation: isDutch ? 'Hallo! Pardon, heeft u hulp nodig om de weg te vinden?' : 'Hello! Excuse me, do you need directions?',
            suggestedReplies: [
              { text: 'Sí, por favor. ¿Dónde está la estación de metro?', translation: isDutch ? 'Ja, alstublieft. Waar is het metrostation?' : 'Yes, where is the metro station?' },
              { text: '¿Por dónde se va al museo?', translation: isDutch ? 'Hoe ga ik naar het museum?' : 'How do I get to the museum?' },
              { text: '¡Muchas gracias por su ayuda!', translation: isDutch ? 'Hartelijk dank voor uw hulp!' : 'Thank you very much for your help!' }
            ]
          }
        ];

      default: {
        const greeting = activeLanguage.sampleGreeting || 'Hello';
        return [
          {
            id: 'cafe',
            title: isDutch ? `In het Café (${targetName})` : `At the Cafe (${targetName})`,
            icon: Utensils,
            persona: `Barista (${targetName})`,
            setting: `A popular local cafe in ${targetName}.`,
            initialMessage: `${greeting}! Welcome. What can I get for you today?`,
            initialTranslation: isDutch ? `${greeting}! Welkom. Wat mag ik voor u klaarmaken vandaag?` : `${greeting}! Welcome. What can I get for you today?`,
            suggestedReplies: [
              { text: `${greeting}! Coffee, please.`, translation: isDutch ? `${greeting}! Koffie, alstublieft.` : 'Coffee, please.' },
              { text: `A glass of water, please.`, translation: isDutch ? 'Een glas water, alstublieft.' : 'A glass of water, please.' },
              { text: `The check, please.`, translation: isDutch ? 'De rekening, alstublieft.' : 'The check, please.' }
            ]
          },
          {
            id: 'introductions',
            title: isDutch ? `Kennismaken (${targetName})` : `Meeting a Friend (${targetName})`,
            icon: Handshake,
            persona: `Local Friend (${targetName})`,
            setting: `In the central park in ${targetName}.`,
            initialMessage: `${greeting}! Nice to meet you. Where are you from?`,
            initialTranslation: isDutch ? `${greeting}! Aangenaam kennis te maken. Waar kom je vandaan?` : 'Nice to meet you. Where are you from?',
            suggestedReplies: [
              { text: `${greeting}! I am practicing ${targetName}.`, translation: isDutch ? `${greeting}! Ik oefen ${targetName}.` : `I am practicing ${targetName}.` },
              { text: `Pleased to meet you!`, translation: isDutch ? 'Aangenaam kennis te maken!' : 'Pleased to meet you!' },
              { text: `This is a wonderful place.`, translation: isDutch ? 'Dit is een prachtige plek.' : 'This is a wonderful place.' }
            ]
          },
          {
            id: 'directions',
            title: isDutch ? `De Weg Vragen (${targetName})` : `Navigation (${targetName})`,
            icon: Compass,
            persona: `Helpful Local (${targetName})`,
            setting: `On the central street.`,
            initialMessage: `Excuse me, may I help you find your way?`,
            initialTranslation: isDutch ? `Pardon, mag ik u helpen uw bestemming te vinden?` : 'Excuse me, may I help you find your way?',
            suggestedReplies: [
              { text: `Where is the train station?`, translation: isDutch ? 'Waar is het station?' : 'Where is the train station?' },
              { text: `Which way to the city center?`, translation: isDutch ? 'Welke kant op naar het centrum?' : 'Which way to downtown?' },
              { text: `Thank you very much for your help!`, translation: isDutch ? 'Hartelijk dank voor de hulp!' : 'Thank you very much for your help!' }
            ]
          }
        ];
      }
    }
  };

  const scenarios = getScenariosForLanguage(activeLanguage.code, activeLanguage.name);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSuggestions, setCurrentSuggestions] = useState<Array<{ text: string; translation: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const toggleSpeechRecognition = async () => {
    if (isListening) {
      speechDetector.stopListening();
      setIsListening(false);
      return;
    }

    audioSynth.playGentleFeedback();
    setIsListening(true);
    const started = await speechDetector.startListening({
      langCode: activeLanguage.code,
      onTranscript: (finalTranscript) => {
        setInputText((prev) => (prev ? prev + ' ' : '') + finalTranscript);
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });
    if (!started) setIsListening(false);
  };

  // Initialize or reset messages when scenario or language changes
  useEffect(() => {
    const initial: ChatMessage = {
      id: '1',
      sender: 'ai',
      text: activeScenario.initialMessage,
      nativeTranslation: activeScenario.initialTranslation,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initial]);
    setCurrentSuggestions(activeScenario.suggestedReplies);
  }, [selectedScenarioId, activeLanguage.code]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Smart local fallback writing analysis when offline
   */
  const evaluateWritingLocally = (
    text: string
  ): WritingFeedback => {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/);
    const wordCount = words.length;

    let suggestion = '';
    let isAccurate = true;
    let improvedUserPhrase: string | undefined = undefined;

    if (wordCount >= 3) {
      suggestion = isDutch
        ? 'Goede zinsbouw en woordkeuze! Jouw reactie sluit goed aan op de conversatie.'
        : 'Good sentence construction! Your response aligns naturally with the conversation.';
    } else {
      suggestion = isDutch
        ? 'Duidelijke reactie! Probeer gerust een volledige zin met beleefdheidsvorm te formuleren.'
        : 'Clear response! Feel free to practice expanding into full polite sentences.';
    }

    return {
      isAccurate,
      suggestion,
      improvedUserPhrase
    };
  };

  /**
   * Handle sending a message with writing evaluation from Gemini
   */
  const handleSendMessage = async (textToSend?: string, translationToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    audioSynth.playGentleFeedback();

    const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = Date.now().toString();
    const initialUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: text,
      nativeTranslation: translationToSend || (isDutch ? 'Jouw ingevoerde reactie' : 'Your submitted response'),
      timestamp: currentTimestamp
    };

    setMessages((prev) => [...prev, initialUserMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Call backend Gemini interactive chat with writing diagnostic
      const res = await fetch('/api/gemini/dialogue-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: activeLanguage.name,
          targetLanguageCode: activeLanguage.code,
          nativeLanguage: nativeLangName,
          scenarioTitle: activeScenario.title,
          persona: activeScenario.persona,
          setting: activeScenario.setting,
          userMessage: text,
          cefrLevel: user.activeCefr || 'B1',
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'ai' ? 'assistant' : 'user',
            content: m.text
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();

        // Update user message with precise AI writing evaluation
        if (data.writingFeedback) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === userMsgId
                ? {
                    ...msg,
                    writingFeedback: {
                      isAccurate: data.writingFeedback.isAccurate ?? true,
                      suggestion: data.writingFeedback.suggestion || '',
                      improvedUserPhrase: data.writingFeedback.improvedUserPhrase
                    }
                  }
                : msg
            )
          );
        }

        // Add AI response
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.replyText || activeScenario.suggestedReplies[0]?.text || activeLanguage.sampleGreeting || 'Hello',
          nativeTranslation: data.replyTranslation || (isDutch ? 'Begrepen, uitstekend.' : 'Understood, very well.'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, aiMsg]);
        audioSynth.playSuccessChime();

        if (data.suggestedReplies && Array.isArray(data.suggestedReplies) && data.suggestedReplies.length > 0) {
          setCurrentSuggestions(data.suggestedReplies);
        }
      } else {
        throw new Error('API request returned non-200');
      }
    } catch {
      // Fallback
      const localFeedback = evaluateWritingLocally(text);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMsgId
            ? { ...msg, writingFeedback: localFeedback }
            : msg
        )
      );

      const nextIndex = Math.floor(Math.random() * activeScenario.suggestedReplies.length);
      const fallbackSuggestion = activeScenario.suggestedReplies[nextIndex];

      const fallbackAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackSuggestion ? fallbackSuggestion.text : `${activeLanguage.sampleGreeting || 'Hello'}!`,
        nativeTranslation: fallbackSuggestion ? fallbackSuggestion.translation : (isDutch ? 'Alles is genoteerd.' : 'Everything is noted.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, fallbackAiMsg]);
      audioSynth.playSuccessChime();
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-5 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeLanguage.flag}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeLanguage.name} {isDutch ? 'Dialoogtheater' : 'Dialogue Theatre'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isDutch 
              ? `Oefen interactieve gesprekken met realtime AI-correctie en zinsverbetering` 
              : `Roleplay real-world conversations with instant AI feedback and sentence enhancement`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              audioSynth.playGentleFeedback();
              setMessages([
                {
                  id: '1',
                  sender: 'ai',
                  text: activeScenario.initialMessage,
                  nativeTranslation: activeScenario.initialTranslation,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
              setCurrentSuggestions(activeScenario.suggestedReplies);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isDutch ? 'Herstart Gesprek' : 'Reset Chat'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = sc.id === selectedScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => {
                audioSynth.playGentleFeedback();
                setSelectedScenarioId(sc.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sc.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Chat Stage */}
      <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Scenario Setting Card */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{activeScenario.persona}</span>
            <span>•</span>
            <span className="italic">{activeScenario.setting}</span>
          </div>
          <span className="font-mono text-[11px] bg-blue-100/70 text-blue-900 px-2 py-0.5 rounded-md font-bold">
            {activeLanguage.code.toUpperCase()}
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div className="flex items-end gap-2 max-w-[85%]">
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mb-1 font-black text-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-3xl p-4 sm:p-5 shadow-2xs space-y-1.5 ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold tracking-tight font-sans">
                        {msg.text}
                      </p>
                      <button
                        type="button"
                        onClick={() => audioSynth.speakText(msg.text, activeLanguage.code)}
                        className={`p-1.5 rounded-lg shrink-0 cursor-pointer ${
                          isUser
                            ? 'text-blue-200 hover:text-white hover:bg-blue-700'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                        }`}
                        title={isDutch ? 'Beluister uitspraak' : 'Listen'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className={`text-xs italic ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
                      {msg.nativeTranslation}
                    </p>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mb-1 font-black text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* AI Writing Feedback for user messages */}
                {isUser && msg.writingFeedback && (
                  <div className="mr-10 max-w-[80%] p-3 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-900 space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isDutch ? 'AI Schrijffeedback' : 'AI Writing Evaluation'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {msg.writingFeedback.suggestion}
                    </p>
                    {msg.writingFeedback.improvedUserPhrase && (
                      <div className="pt-1 text-[11px] font-bold text-amber-950">
                        {isDutch ? 'Natuurlijkere formulering:' : 'More natural phrasing:'}{' '}
                        <span className="font-mono bg-white/70 px-1.5 py-0.5 rounded border border-amber-200">
                          {msg.writingFeedback.improvedUserPhrase}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <Bot className="w-4 h-4 animate-pulse text-blue-500" />
              <span>{activeScenario.persona} {isDutch ? 'typt een reactie...' : 'is typing...'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Response Chips */}
        {currentSuggestions.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
              {isDutch ? 'Snelle antwoorden:' : 'Suggestions:'}
            </span>
            {currentSuggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sug.text, sug.translation)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-bold text-slate-700 hover:text-blue-700 whitespace-nowrap transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <span>{sug.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            type="button"
            id="dialogue-mic-btn"
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-2xl transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-400/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title={isListening ? 'Stop listening' : 'Speak your answer (Speech Recognition)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            dir={isRtlLanguage(activeLanguage.code) ? 'rtl' : 'ltr'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isListening
                ? (isDutch ? 'Luisteren... spreek nu...' : 'Listening... speak now...')
                : isDutch
                ? `Schrijf of spreek in het ${activeLanguage.name}...`
                : `Type or speak reply in ${activeLanguage.name}...`
            }
            className={`flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 border border-transparent focus:border-[#C5A059] focus:bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all ${
              isRtlLanguage(activeLanguage.code) ? 'text-right' : 'text-left'
            }`}
          />

          <button
            type="button"
            disabled={!inputText.trim() || isTyping}
            onClick={() => handleSendMessage()}
            className="p-3 rounded-2xl bg-[#1B365D] hover:bg-[#0F2137] disabled:opacity-40 text-[#D4AF37] shadow-md shadow-blue-900/15 transition-all cursor-pointer border border-[#C5A059]/40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
