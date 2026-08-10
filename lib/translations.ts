// MEDROUTE — English & Hindi Translations

export type Lang = 'en' | 'hi';

export const translations: Record<string, Record<Lang, string>> = {
  // Nav
  'nav.findCare': { en: 'Find Care', hi: 'देखभाल खोजें' },
  'nav.hospitals': { en: 'Hospitals', hi: 'अस्पताल' },
  'nav.transfers': { en: 'Transfers', hi: 'स्थानांतरण' },
  'nav.howItWorks': { en: 'How It Works', hi: 'यह कैसे काम करता है' },
  'nav.hospitalLogin': { en: 'Hospital Login', hi: 'अस्पताल लॉगिन' },
  'nav.networkLive': { en: 'NETWORK LIVE', hi: 'नेटवर्क लाइव' },

  // Hero
  'hero.headline1': { en: 'The right hospital.', hi: 'सही अस्पताल।' },
  'hero.headline2': { en: 'Right now.', hi: 'अभी।' },
  'hero.subheading': {
    en: "Tell us what is happening. MEDROUTE finds nearby hospitals with the right specialists, facilities and verified capacity.",
    hi: 'हमें बताएं क्या हो रहा है। MEDROUTE सही विशेषज्ञों, सुविधाओं और सत्यापित क्षमता के साथ पास के अस्पताल खोजता है।',
  },
  'hero.emergency': { en: '🚨 Emergency', hi: '🚨 आपातकाल' },
  'hero.findHospital': { en: '🏥 Find a Hospital', hi: '🏥 अस्पताल खोजें' },

  // Emergency card
  'emergency.card.headline': { en: 'Someone needs urgent medical attention?', hi: 'किसी को तत्काल चिकित्सा की आवश्यकता है?' },
  'emergency.card.desc': {
    en: "Tell us what is happening and we'll help find hospitals that can handle the emergency right now.",
    hi: 'हमें बताएं क्या हो रहा है और हम ऐसे अस्पताल खोजने में मदद करेंगे जो अभी आपातकाल संभाल सकते हैं।',
  },
  'emergency.card.cta': { en: '🔴 Find Emergency Care', hi: '🔴 आपातकालीन देखभाल खोजें' },
  'emergency.card.safety': {
    en: 'If someone is in immediate danger, contact your local emergency service immediately. MEDROUTE helps identify suitable hospital capacity and does not replace professional medical care.',
    hi: 'यदि कोई तत्काल खतरे में है, तो अपनी स्थानीय आपातकालीन सेवा से तुरंत संपर्क करें।',
  },

  // Network stats
  'network.title': { en: 'LIVE MEDROUTE NETWORK', hi: 'लाइव MEDROUTE नेटवर्क' },
  'network.hospitals': { en: 'Hospitals Connected', hi: 'अस्पताल जुड़े' },
  'network.beds': { en: 'Admission-Ready Beds', hi: 'प्रवेश-तैयार बेड' },
  'network.icu': { en: 'ICU Beds', hi: 'आईसीयू बेड' },
  'network.ventilators': { en: 'Ventilators', hi: 'वेंटिलेटर' },
  'network.operational': { en: 'Network operational', hi: 'नेटवर्क चालू है' },
  'network.lastSync': { en: 'Last synchronization', hi: 'अंतिम समन्वयन' },
  'network.secsAgo': { en: 'seconds ago', hi: 'सेकंड पहले' },

  // Emergency page
  'emergency.heading': { en: 'What is happening?', hi: 'क्या हो रहा है?' },
  'emergency.subheading': {
    en: 'Choose the option that best describes the emergency.',
    hi: 'वह विकल्प चुनें जो आपातकाल का सबसे अच्छा वर्णन करता है।',
  },
  'emergency.voicePrompt': { en: "Or describe what's happening", hi: 'या बताएं क्या हो रहा है' },
  'emergency.voicePlaceholder': {
    en: '"My father suddenly has chest pain..."',
    hi: '"मेरे पिता को अचानक सीने में दर्द है..."',
  },
  'emergency.safety': {
    en: 'In immediate danger? Call emergency services first.',
    hi: 'तत्काल खतरे में? पहले आपातकालीन सेवाएं कॉल करें।',
  },

  // Questions
  'questions.location': { en: 'Where is the patient?', hi: 'मरीज कहाँ है?' },
  'questions.useLocation': { en: '📍 Use My Current Location', hi: '📍 मेरी वर्तमान स्थिति उपयोग करें' },
  'questions.enterLocation': { en: 'Enter Location', hi: 'स्थान दर्ज करें' },
  'questions.findHospitals': { en: 'Find Suitable Hospitals', hi: 'उपयुक्त अस्पताल खोजें' },

  // Results
  'results.heading': { en: 'Hospitals that can help right now', hi: 'अस्पताल जो अभी मदद कर सकते हैं' },
  'results.subheading': {
    en: 'We found hospitals matching the required care.',
    hi: 'हमें आवश्यक देखभाल से मेल खाते अस्पताल मिले।',
  },
  'results.bestMatch': { en: 'BEST MATCH', hi: 'सर्वश्रेष्ठ मिलान' },
  'results.requestAdmission': { en: 'Request Admission', hi: 'प्रवेश का अनुरोध करें' },
  'results.getDirections': { en: 'Get Directions', hi: 'दिशा-निर्देश प्राप्त करें' },
  'results.viewDetails': { en: 'View Details', hi: 'विवरण देखें' },

  // Status labels
  'status.available': { en: 'AVAILABLE', hi: 'उपलब्ध' },
  'status.limited': { en: 'LIMITED', hi: 'सीमित' },
  'status.unavailable': { en: 'UNAVAILABLE', hi: 'अनुपलब्ध' },
  'status.reserved': { en: 'RESERVED', hi: 'आरक्षित' },
  'status.occupied': { en: 'OCCUPIED', hi: 'भरा हुआ' },
  'status.preparing': { en: 'PREPARING', hi: 'तैयारी' },
  'status.verified': { en: 'Capacity Verified', hi: 'क्षमता सत्यापित' },

  // Confirmation
  'confirm.title': { en: '✓ CARE CONFIRMED', hi: '✓ देखभाल की पुष्टि' },
  'confirm.reserved': { en: 'Reserved', hi: 'आरक्षित' },
  'confirm.eta': { en: 'ETA', hi: 'अनुमानित समय' },
  'confirm.notified': { en: 'Hospital notified', hi: 'अस्पताल को सूचित किया' },
  'confirm.expires': { en: 'Reservation expires', hi: 'आरक्षण समाप्त होता है' },

  // Accessibility
  'a11y.title': { en: 'Accessibility', hi: 'सुगम्यता' },
  'a11y.textSize': { en: 'Text Size', hi: 'पाठ का आकार' },
  'a11y.highContrast': { en: 'High Contrast', hi: 'उच्च कंट्रास्ट' },
  'a11y.reduceMotion': { en: 'Reduce Motion', hi: 'गति कम करें' },
  'a11y.language': { en: 'Language', hi: 'भाषा' },
  'a11y.voice': { en: 'Voice Assistance', hi: 'वाणी सहायता' },

  // Common
  'common.away': { en: 'away', hi: 'दूर' },
  'common.minutes': { en: 'min', hi: 'मिनट' },
  'common.beds': { en: 'beds', hi: 'बेड' },
  'common.icu': { en: 'ICU', hi: 'आईसीयू' },
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? translations[key]?.en ?? key;
}
