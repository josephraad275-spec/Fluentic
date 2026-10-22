import React from 'react';
import { Coffee, Users, Compass, ShoppingBag, LifeBuoy } from 'lucide-react';

export interface ScenarioPhrase {
  targetText: string;
  nativeTranslation: string;
  ipa?: string;
  contextTip?: string;
}

export interface SpeechScenario {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  phrases: ScenarioPhrase[];
}

export const getSpeechScenariosForLanguage = (
  targetCode: string,
  targetName: string,
  isDutch: boolean
): SpeechScenario[] => {
  switch (targetCode) {
    case 'es':
      return [
        {
          id: 'cafe',
          title: isDutch ? 'In het Café' : 'At the Cafe',
          category: isDutch ? 'Dagelijks Leven' : 'Daily Life',
          icon: Coffee,
          description: isDutch ? 'Koffie bestellen, rekening vragen en beleefdheden uitwisselen.' : 'Order coffee and ask for the bill.',
          phrases: [
            {
              targetText: 'Un café con leche, por favor.',
              nativeTranslation: isDutch ? 'Een koffie met melk, alstublieft.' : 'A coffee with milk, please.',
              ipa: '/un kaˈfe kon ˈletʃe poɾ faˈβoɾ/',
              contextTip: isDutch ? '"Por favor" staat standaard achteraan de bestelling.' : 'Use por favor when ordering.'
            },
            {
              targetText: '¿Cuánto cuesta este cruasán?',
              nativeTranslation: isDutch ? 'Hoeveel kost deze croissant?' : 'How much does this croissant cost?',
              ipa: '/ˈkwanto ˈkwesta ˈeste kɾwaˈsan/'
            },
            {
              targetText: 'La cuenta, por favor.',
              nativeTranslation: isDutch ? 'De rekening, alstublieft.' : 'The check, please.',
              ipa: '/la ˈkwenta poɾ faˈβoɾ/'
            },
            {
              targetText: '¡Muchas gracias, estaba delicioso!',
              nativeTranslation: isDutch ? 'Hartelijk dank, het was heerlijk!' : 'Thank you, it was delicious!',
              ipa: '/ˈmutʃas ˈɡɾasjas esˈtaβa deliˈsjoso/'
            }
          ]
        },
        {
          id: 'introductions',
          title: isDutch ? 'Kennismaken' : 'Introductions',
          category: isDutch ? 'Sociaal' : 'Social',
          icon: Users,
          description: isDutch ? 'Stel jezelf voor en zeg waar je vandaan komt.' : 'Introduce yourself.',
          phrases: [
            {
              targetText: '¡Buenos días! Mucho gusto en conocerte.',
              nativeTranslation: isDutch ? 'Goedemorgen! Aangenaam kennis te maken.' : 'Good morning! Nice to meet you.',
              ipa: '/ˈbwenos ˈdi.as ˈmutʃo ˈɡusto en konoˈseɾte/'
            },
            {
              targetText: 'Me llamo Alex y vengo de los Países Bajos.',
              nativeTranslation: isDutch ? 'Ik heet Alex en ik kom uit Nederland.' : 'My name is Alex and I come from the Netherlands.',
              ipa: '/me ˈʝamo ˈaleks i ˈbeŋɡo de los paˈises ˈbaxos/'
            },
            {
              targetText: 'Estoy aprendiendo español con mucho entusiasmo.',
              nativeTranslation: isDutch ? 'Ik leer met veel enthousiasme Spaans.' : 'I am learning Spanish enthusiastically.',
              ipa: '/esˈtoj apɾenˈdjendo espaˈɲol kon ˈmutʃo entuˈsjasmo/'
            }
          ]
        },
        {
          id: 'directions',
          title: isDutch ? 'De Weg Vragen' : 'Navigation',
          category: isDutch ? 'Reizen' : 'Travel',
          icon: Compass,
          description: isDutch ? 'Vraag naar het station, het museum of het centrum.' : 'Ask for directions.',
          phrases: [
            {
              targetText: 'Disculpe, ¿dónde está la estación de tren?',
              nativeTranslation: isDutch ? 'Pardon, waar is het treinstation?' : 'Excuse me, where is the train station?',
              ipa: '/disˈkulpe ˈdonde esˈta la estaˈsjon de tɾen/'
            },
            {
              targetText: '¿Cómo puedo llegar al centro histórico?',
              nativeTranslation: isDutch ? 'Hoe kom ik bij het historische centrum?' : 'How can I get to the historic center?',
              ipa: '/ˈkomo ˈpweðo ʝeˈɣaɾ al ˈsentɾo isˈtoɾiko/'
            },
            {
              targetText: 'Gire a la derecha en la próxima esquina.',
              nativeTranslation: isDutch ? 'Sla rechtsaf op de volgende hoek.' : 'Turn right at the next corner.',
              ipa: '/ˈxiɾe a la ðeˈɾetʃa en la ˈpɾoksima esˈkina/'
            }
          ]
        }
      ];

    case 'fr':
      return [
        {
          id: 'cafe',
          title: isDutch ? 'In het Café' : 'At the Cafe',
          category: isDutch ? 'Dagelijks Leven' : 'Daily Life',
          icon: Coffee,
          description: isDutch ? 'Bestel een drankje en vraag om de rekening in het Frans.' : 'Order drinks and food.',
          phrases: [
            {
              targetText: 'Un café crème, s\'il vous plaît.',
              nativeTranslation: isDutch ? 'Een koffie verkeerd, alstublieft.' : 'A coffee with cream, please.',
              ipa: '/œ̃ kafe kʁɛm sil vu plɛ/'
            },
            {
              targetText: 'L\'addition, s\'il vous plaît.',
              nativeTranslation: isDutch ? 'De rekening, alstublieft.' : 'The bill, please.',
              ipa: '/ladisjɔ̃ sil vu plɛ/'
            },
            {
              targetText: 'C\'était vraiment délicieux, merci !',
              nativeTranslation: isDutch ? 'Het was echt heerlijk, dank u!' : 'It was truly delicious, thank you!',
              ipa: '/setɛ vʁɛmɑ̃ delisjø mɛʁsi/'
            }
          ]
        },
        {
          id: 'introductions',
          title: isDutch ? 'Kennismaken' : 'Introductions',
          category: isDutch ? 'Sociaal' : 'Social',
          icon: Users,
          description: isDutch ? 'Stel jezelf voor en voer een begroeting.' : 'Introduce yourself.',
          phrases: [
            {
              targetText: 'Bonjour, enchanté de faire votre connaissance.',
              nativeTranslation: isDutch ? 'Goedendag, aangenaam om kennis te maken.' : 'Hello, pleased to meet you.',
              ipa: '/bɔ̃ʒuʁ ɑ̃ʃɑ̃te də fɛʁ vɔtʁ kɔnɛsɑ̃s/'
            },
            {
              targetText: 'Je m\'appelle Alex et je viens des Pays-Bas.',
              nativeTranslation: isDutch ? 'Ik heet Alex en ik kom uit Nederland.' : 'My name is Alex and I come from the Netherlands.',
              ipa: '/ʒə mapɛl alɛks e ʒə vjɛ̃ de pɛjiba/'
            }
          ]
        }
      ];

    case 'de':
      return [
        {
          id: 'cafe',
          title: isDutch ? 'In het Café' : 'At the Cafe',
          category: isDutch ? 'Dagelijks Leven' : 'Daily Life',
          icon: Coffee,
          description: isDutch ? 'Bestel drankjes en reken af in het Duits.' : 'Order drinks and pay.',
          phrases: [
            {
              targetText: 'Einen Kaffee mit Milch, bitte.',
              nativeTranslation: isDutch ? 'Een koffie met melk, alstublieft.' : 'A coffee with milk, please.',
              ipa: '/ˈaɪ̯nən ˈkafe mɪt mɪlç ˈbɪtə/'
            },
            {
              targetText: 'Die Rechnung, bitte.',
              nativeTranslation: isDutch ? 'De rekening, alstublieft.' : 'The bill, please.',
              ipa: '/diː ˈʁɛçnʊŋ ˈbɪtə/'
            },
            {
              targetText: 'Vielen Dank, es war sehr lecker!',
              nativeTranslation: isDutch ? 'Hartelijk dank, het was erg lekker!' : 'Thank you very much, it was very tasty!',
              ipa: '/ˈfiːlən daŋk ɛs vaːɐ̯ zeːɐ̯ ˈlɛkɐ/'
            }
          ]
        },
        {
          id: 'introductions',
          title: isDutch ? 'Kennismaken' : 'Introductions',
          category: isDutch ? 'Sociaal' : 'Social',
          icon: Users,
          description: isDutch ? 'Stel jezelf voor en voer een begroetingsgesprek.' : 'Introduce yourself.',
          phrases: [
            {
              targetText: 'Guten Tag, freut mich Sie kennenzulernen.',
              nativeTranslation: isDutch ? 'Goedendag, aangenaam om u te leren kennen.' : 'Good day, nice to meet you.',
              ipa: '/ˈɡuːtn̩ taːk fʁɔɪ̯t mɪç ziː ˈkɛnəntsuˌlɛʁnən/'
            },
            {
              targetText: 'Ich komme aus den Niederlanden und lerne Deutsch.',
              nativeTranslation: isDutch ? 'Ik kom uit Nederland en leer Duits.' : 'I come from the Netherlands and learn German.',
              ipa: '/ɪç ˈkɔmə aʊ̯s deːn ˈniːdɐˌlandn̩ ʊnt ˈlɛʁnə dɔɪ̯tʃ/'
            }
          ]
        }
      ];

    case 'lt':
    default:
      return [
        {
          id: 'cafe',
          title: isDutch ? 'In het Café' : 'At the Cafe',
          category: isDutch ? 'Dagelijks Leven' : 'Daily Life',
          icon: Coffee,
          description: isDutch 
            ? 'Bestel koffie en gebak, vraag de rekening en bedank de bediening.' 
            : 'Order coffee, pastries, and request the check politely.',
          phrases: [
            { 
              targetText: 'Vieną kavą su pienu, prašau.', 
              nativeTranslation: isDutch ? 'Eén koffie met melk, alstublieft.' : 'A coffee with milk, please.',
              ipa: '/vʲiɛˈnaː kɐˈvaː sʊ pʲiɛˈnʊ pɾɐˈʃɐʊ/',
              contextTip: isDutch ? '"Kavą" is de 4e naamval (galininkas).' : 'Accusative case for direct object.'
            },
            { 
              targetText: 'Kiek kainuoja šis pyragaitis?', 
              nativeTranslation: isDutch ? 'Hoeveel kost dit gebakje?' : 'How much is this pastry?',
              ipa: '/kʲiɛk kɐɪˈnuə̯jɐ ʃʲɪs pʲiːɾɐˈɡɐɪ̯tʲɪs/'
            },
            { 
              targetText: 'Sąskaitą, prašau.', 
              nativeTranslation: isDutch ? 'De rekening, alstublieft.' : 'The bill, please.',
              ipa: '/ˈsaːskɐɪ̯taː pɾɐˈʃɐʊ/'
            },
            { 
              targetText: 'Ačiū, buvo labai skanu!', 
              nativeTranslation: isDutch ? 'Dank u wel, het was erg lekker!' : 'Thank you, it was delicious!',
              ipa: '/ˈɐːtʃʲuː ˈbʊvɔ lɐˈbɐɪ skɐˈnʊ/'
            }
          ]
        },
        {
          id: 'introductions',
          title: isDutch ? 'Kennismaken & Begroeten' : 'Introductions',
          category: isDutch ? 'Sociaal' : 'Social',
          icon: Users,
          description: isDutch 
            ? 'Stel jezelf voor, vertel dat je uit Nederland komt en maak een praatje.' 
            : 'Introduce yourself and share where you come from.',
          phrases: [
            { 
              targetText: 'Labas rytas, malonu susipažinti.', 
              nativeTranslation: isDutch ? 'Goedemorgen, aangename kennismaking.' : 'Good morning, nice to meet you.',
              ipa: '/ˈlɐbɐs ˈɾʲiːtɐs mɐˈlɔnʊ sʊsʲɪpɐˈʑʲɪntʲɪ/'
            },
            { 
              targetText: 'Mano vardas yra Jonas.', 
              nativeTranslation: isDutch ? 'Mijn naam is Jonas.' : 'My name is Jonas.',
              ipa: '/ˈmɐnɔ ˈvɐɾdɐs ˈiːɾɐ ˈjɔnɐs/'
            },
            { 
              targetText: 'Aš esu iš Nyderlandų.', 
              nativeTranslation: isDutch ? 'Ik kom uit Nederland.' : 'I am from the Netherlands.',
              ipa: '/ɐʃ ˈɛsʊ ɪʃ nʲiːdɛɾˈlɐnduː/'
            },
            { 
              targetText: 'Aš mokausi kalbėti lietuviškai.', 
              nativeTranslation: isDutch ? 'Ik leer Litouws spreken.' : 'I am learning to speak Lithuanian.',
              ipa: '/ɐʃ mɔˈkɐʊsʲɪ kɐlˈbʲeːtʲɪ lʲiɛtʊˈvʲɪʃkɐɪ/'
            }
          ]
        },
        {
          id: 'directions',
          title: isDutch ? 'De Weg Vragen' : 'Navigation',
          category: isDutch ? 'Reizen & Stad' : 'Travel & City',
          icon: Compass,
          description: isDutch 
            ? 'Vind het treinstation, de halte of het centrum van de stad.' 
            : 'Navigate the city and ask for directions.',
          phrases: [
            { 
              targetText: 'Atsiprašau, kur yra stotis?', 
              nativeTranslation: isDutch ? 'Pardon, waar is het station?' : 'Excuse me, where is the station?',
              ipa: '/ɐtsʲɪpɾɐˈʃɐʊ kʊɾ ˈiːɾɐ stɔˈtʲɪs/'
            },
            { 
              targetText: 'Kaip nueiti iki centro?', 
              nativeTranslation: isDutch ? 'Hoe loop ik naar het centrum?' : 'How do I walk to the center?',
              ipa: '/kɐɪp nʊˈɛɪtʲɪ ˈɪkʲɪ ˈtsɛntɾɔ/'
            },
            { 
              targetText: 'Pasukite į dešinę ties šviesoforu.', 
              nativeTranslation: isDutch ? 'Sla rechtsaf bij het stoplicht.' : 'Turn right at the traffic lights.',
              ipa: '/pɐˈsʊkʲɪtʲɛ iː ˈdʲeːʃʲɪnʲeː tʲiɛs ʃvʲiɛsɔˈfɔɾʊ/'
            }
          ]
        },
        {
          id: 'shopping',
          title: isDutch ? 'Winkelen & Betalen' : 'Shopping',
          category: isDutch ? 'Winkels' : 'Commerce',
          icon: ShoppingBag,
          description: isDutch 
            ? 'Vraag naar prijzen, pasmaten en betaal met pin of contant.' 
            : 'Handle everyday shopping and payments.',
          phrases: [
            { 
              targetText: 'Ar galiu sumokėti banko kortele?', 
              nativeTranslation: isDutch ? 'Kan ik met pinpas / bankkaart betalen?' : 'Can I pay by card?',
              ipa: '/ɐɾ ɡɐˈlʲʊ sʊmɔˈkʲeːtʲɪ ˈbɐŋkɔ kɔɾˈtɛlʲɛ/'
            },
            { 
              targetText: 'Ar turite mažesnį dydį?', 
              nativeTranslation: isDutch ? 'Heeft u een kleinere maat?' : 'Do you have a smaller size?',
              ipa: '/ɐɾ tʊˈɾʲɪtʲɛ mɐˈʑeːsnʲiː ˈdiːdʲiː/'
            },
            { 
              targetText: 'Aš norėčiau tai nusipirkti.', 
              nativeTranslation: isDutch ? 'Ik zou dit graag willen kopen.' : 'I would like to purchase this.',
              ipa: '/ɐʃ nɔˈɾʲeːtʃʲɐʊ tɐɪ nʊsʲɪˈpʲɪɾktʲɪ/'
            }
          ]
        },
        {
          id: 'help',
          title: isDutch ? 'Hulp & Gezondheid' : 'Help & Health',
          category: isDutch ? 'Overleving' : 'Survival',
          icon: LifeBuoy,
          description: isDutch 
            ? 'Vraag hulp in noodgevallen of zoek de dichtstbijzijnde apotheek.' 
            : 'Ask for assistance or find a pharmacy.',
          phrases: [
            { 
              targetText: 'Padėkite man, prašau!', 
              nativeTranslation: isDutch ? 'Help mij, alstublieft!' : 'Please help me!',
              ipa: '/pɐˈdʲeːkʲɪtʲɛ mɐn pɾɐˈʃɐʊ/'
            },
            { 
              targetText: 'Kur yra artimiausia vaistinė?', 
              nativeTranslation: isDutch ? 'Waar is de dichtstbijzijnde apotheek?' : 'Where is the nearest pharmacy?',
              ipa: '/kʊɾ ˈiːɾɐ ɐɾtʲɪˈmʲiɛʊsʲɪɐ vɐɪ̯sˈtʲɪnʲeː/'
            },
            { 
              targetText: 'Aš blogai jaučiuosi.', 
              nativeTranslation: isDutch ? 'Ik voel me niet goed / ziek.' : 'I feel unwell.',
              ipa: '/ɐʃ blɔˈɡɐɪ̯ jɐʊˈtʃʲuə̯sʲɪ/'
            }
          ]
        }
      ];
  }
};
