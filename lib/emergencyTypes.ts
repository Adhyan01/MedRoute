// MEDROUTE — Emergency Types & Care Requirements Engine

export type EmergencyTypeId =
  | 'chest-pain'
  | 'breathing'
  | 'accident'
  | 'stroke'
  | 'bleeding'
  | 'burn'
  | 'child'
  | 'other'
  | 'unsure';

export interface EmergencyType {
  id: EmergencyTypeId;
  icon: string;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  color: string;
  requiredCapabilities: string[];
  questions: Question[];
  searchLabel: string;
}

export interface Question {
  id: string;
  text: string;
  textHi: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  label: string;
  labelHi: string;
  value: string;
}

const YES_NO_UNSURE: QuestionOption[] = [
  { id: 'yes', label: 'Yes', labelHi: 'हाँ', value: 'yes' },
  { id: 'no', label: 'No', labelHi: 'नहीं', value: 'no' },
  { id: 'unsure', label: "I'm not sure", labelHi: 'मुझे पता नहीं', value: 'unsure' },
];

export const EMERGENCY_TYPES: EmergencyType[] = [
  {
    id: 'chest-pain',
    icon: '❤️',
    label: 'Chest Pain / Possible Heart Problem',
    labelHi: 'सीने में दर्द / संभावित हृदय समस्या',
    description: 'Sudden chest pain, pressure or discomfort.',
    descriptionHi: 'अचानक सीने में दर्द, दबाव या बेचैनी।',
    color: '#DC2626',
    requiredCapabilities: ['ICU', 'Cardiology', 'CT', 'EmergencyDept'],
    searchLabel: 'cardiac emergency capabilities',
    questions: [
      {
        id: 'conscious',
        text: 'Is the person conscious?',
        textHi: 'क्या व्यक्ति होश में है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'breathing',
        text: 'Are they breathing normally?',
        textHi: 'क्या वे सामान्य रूप से सांस ले रहे हैं?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'pain-duration',
        text: 'Has the chest pain lasted more than 15 minutes?',
        textHi: 'क्या सीने का दर्द 15 मिनट से अधिक समय से है?',
        options: YES_NO_UNSURE,
      },
    ],
  },
  {
    id: 'breathing',
    icon: '🫁',
    label: 'Severe Breathing Problem',
    labelHi: 'गंभीर सांस की समस्या',
    description: 'Serious difficulty breathing.',
    descriptionHi: 'सांस लेने में गंभीर कठिनाई।',
    color: '#2563EB',
    requiredCapabilities: ['ICU', 'Ventilator', 'EmergencyDept'],
    searchLabel: 'respiratory emergency and ventilation',
    questions: [
      {
        id: 'conscious',
        text: 'Is the person conscious?',
        textHi: 'क्या व्यक्ति होश में है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'lips-blue',
        text: 'Are their lips or fingertips turning blue?',
        textHi: 'क्या उनके होंठ या उंगलियों के सिरे नीले हो रहे हैं?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'child',
        text: 'Is this a child under 12 years old?',
        textHi: 'क्या यह 12 वर्ष से कम आयु का बच्चा है?',
        options: YES_NO_UNSURE,
      },
    ],
  },
  {
    id: 'accident',
    icon: '🚗',
    label: 'Accident / Major Injury',
    labelHi: 'दुर्घटना / गंभीर चोट',
    description: 'Serious injury after an accident.',
    descriptionHi: 'दुर्घटना के बाद गंभीर चोट।',
    color: '#D97706',
    requiredCapabilities: ['ICU', 'Trauma', 'CT', 'BloodBank', 'OR'],
    searchLabel: 'trauma emergency and surgical capabilities',
    questions: [
      {
        id: 'conscious',
        text: 'Is the person conscious?',
        textHi: 'क्या व्यक्ति होश में है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'breathing',
        text: 'Are they breathing normally?',
        textHi: 'क्या वे सामान्य रूप से सांस ले रहे हैं?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'bleeding',
        text: 'Is there severe bleeding?',
        textHi: 'क्या गंभीर रक्तस्राव हो रहा है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'trapped',
        text: 'Is the person trapped or severely injured?',
        textHi: 'क्या व्यक्ति फंसा हुआ है या गंभीर रूप से घायल है?',
        options: YES_NO_UNSURE,
      },
    ],
  },
  {
    id: 'stroke',
    icon: '🧠',
    label: 'Stroke / Sudden Weakness',
    labelHi: 'स्ट्रोक / अचानक कमजोरी',
    description: 'Sudden weakness, confusion or speech difficulty.',
    descriptionHi: 'अचानक कमजोरी, भ्रम या बोलने में कठिनाई।',
    color: '#7C3AED',
    requiredCapabilities: ['ICU', 'Neurology', 'CT', 'EmergencyDept'],
    searchLabel: 'stroke emergency and neurology',
    questions: [
      {
        id: 'conscious',
        text: 'Is the person conscious?',
        textHi: 'क्या व्यक्ति होश में है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'face-drooping',
        text: 'Is one side of their face drooping?',
        textHi: 'क्या उनके चेहरे का एक हिस्सा लटक रहा है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'speech',
        text: 'Are they having trouble speaking or understanding?',
        textHi: 'क्या उन्हें बोलने या समझने में परेशानी हो रही है?',
        options: YES_NO_UNSURE,
      },
    ],
  },
  {
    id: 'bleeding',
    icon: '🩸',
    label: 'Severe Bleeding',
    labelHi: 'गंभीर रक्तस्राव',
    description: 'Heavy or uncontrolled bleeding.',
    descriptionHi: 'भारी या बेकाबू रक्तस्राव।',
    color: '#DC2626',
    requiredCapabilities: ['BloodBank', 'ICU', 'OR', 'EmergencyDept'],
    searchLabel: 'blood bank and surgical emergency',
    questions: [
      {
        id: 'controlled',
        text: 'Can the bleeding be controlled with pressure?',
        textHi: 'क्या दबाव से रक्तस्राव को नियंत्रित किया जा सकता है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'conscious',
        text: 'Is the person conscious?',
        textHi: 'क्या व्यक्ति होश में है?',
        options: YES_NO_UNSURE,
      },
    ],
  },
  {
    id: 'burn',
    icon: '🔥',
    label: 'Serious Burn',
    labelHi: 'गंभीर जलन',
    description: 'Major or extensive burn injury.',
    descriptionHi: 'बड़ी या व्यापक जलन की चोट।',
    color: '#EA580C',
    requiredCapabilities: ['ICU', 'OR', 'EmergencyDept'],
    searchLabel: 'burn and critical care emergency',
    questions: [
      {
        id: 'area',
        text: 'Does the burn cover a large area of the body?',
        textHi: 'क्या जलन शरीर के बड़े हिस्से को ढकती है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'conscious',
        text: 'Is the person conscious?',
        textHi: 'क्या व्यक्ति होश में है?',
        options: YES_NO_UNSURE,
      },
    ],
  },
  {
    id: 'child',
    icon: '👶',
    label: 'Child Emergency',
    labelHi: 'बाल आपातकाल',
    description: 'A serious emergency involving a child.',
    descriptionHi: 'किसी बच्चे से संबंधित गंभीर आपातकाल।',
    color: '#059669',
    requiredCapabilities: ['Pediatrics', 'ICU', 'EmergencyDept'],
    searchLabel: 'paediatric emergency care',
    questions: [
      {
        id: 'age',
        text: 'How old is the child?',
        textHi: 'बच्चे की उम्र क्या है?',
        options: [
          { id: 'infant', label: 'Under 1 year', labelHi: '1 वर्ष से कम', value: 'infant' },
          { id: 'toddler', label: '1–5 years', labelHi: '1–5 वर्ष', value: 'toddler' },
          { id: 'child', label: '6–12 years', labelHi: '6–12 वर्ष', value: 'child' },
          { id: 'teen', label: '13–17 years', labelHi: '13–17 वर्ष', value: 'teen' },
        ],
      },
      {
        id: 'conscious',
        text: 'Is the child conscious?',
        textHi: 'क्या बच्चा होश में है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'breathing',
        text: 'Are they breathing normally?',
        textHi: 'क्या वे सामान्य रूप से सांस ले रहे हैं?',
        options: YES_NO_UNSURE,
      },
    ],
  },
  {
    id: 'other',
    icon: '⚠️',
    label: 'Other Emergency',
    labelHi: 'अन्य आपातकाल',
    description: 'Something else is happening.',
    descriptionHi: 'कुछ और हो रहा है।',
    color: '#6B7280',
    requiredCapabilities: ['EmergencyDept', 'ICU'],
    searchLabel: 'emergency department',
    questions: [
      {
        id: 'conscious',
        text: 'Is the person conscious?',
        textHi: 'क्या व्यक्ति होश में है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'breathing',
        text: 'Are they breathing normally?',
        textHi: 'क्या वे सामान्य रूप से सांस ले रहे हैं?',
        options: YES_NO_UNSURE,
      },
    ],
  },
  {
    id: 'unsure',
    icon: '🎙️',
    label: "I'm Not Sure",
    labelHi: 'मुझे पता नहीं',
    description: "Describe what is happening and we'll help identify the type of care needed.",
    descriptionHi: 'बताएं क्या हो रहा है और हम देखभाल के प्रकार की पहचान करने में मदद करेंगे।',
    color: '#087F8C',
    requiredCapabilities: ['EmergencyDept'],
    searchLabel: 'emergency department',
    questions: [
      {
        id: 'conscious',
        text: 'Is the person conscious?',
        textHi: 'क्या व्यक्ति होश में है?',
        options: YES_NO_UNSURE,
      },
      {
        id: 'breathing',
        text: 'Are they breathing normally?',
        textHi: 'क्या वे सामान्य रूप से सांस ले रहे हैं?',
        options: YES_NO_UNSURE,
      },
    ],
  },
];

export function getEmergencyType(id: EmergencyTypeId): EmergencyType | undefined {
  return EMERGENCY_TYPES.find((e) => e.id === id);
}

// Voice input keyword matching → emergency category
export function classifyVoiceInput(text: string): EmergencyType | null {
  const t = text.toLowerCase();
  if (t.includes('chest') || t.includes('heart') || t.includes('cardiac') || t.includes('pain')) {
    return EMERGENCY_TYPES[0];
  }
  if (t.includes('breath') || t.includes('breathing') || t.includes('choke') || t.includes('saans')) {
    return EMERGENCY_TYPES[1];
  }
  if (t.includes('accident') || t.includes('crash') || t.includes('injury') || t.includes('durghatna')) {
    return EMERGENCY_TYPES[2];
  }
  if (t.includes('stroke') || t.includes('weakness') || t.includes('face') || t.includes('speech')) {
    return EMERGENCY_TYPES[3];
  }
  if (t.includes('bleed') || t.includes('blood') || t.includes('cut')) {
    return EMERGENCY_TYPES[4];
  }
  if (t.includes('burn') || t.includes('fire')) {
    return EMERGENCY_TYPES[5];
  }
  if (t.includes('child') || t.includes('baby') || t.includes('kid') || t.includes('bachcha')) {
    return EMERGENCY_TYPES[6];
  }
  return null;
}
