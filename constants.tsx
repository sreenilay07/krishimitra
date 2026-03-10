
import React from 'react';
import { Language, Feature } from './types';
import { LeafIcon, BarChartIcon, TagIcon, BulbIcon, CheckBadgeIcon, CloudIcon } from './components/Icons';

export const UI_TEXT: Record<Language, any> = {
  [Language.EN]: {
    title: 'Krishimitra',
    welcome: 'Welcome to Krishimitra 🌱',
    chooseLanguage: 'Please choose your preferred language:',
    intentQuestion: 'What would you like help with today?',
    backToHome: 'Change Service',
    inputPlaceholder: 'Speak or type your query...',
    send: 'Send',
    uploadImage: 'Upload Image',
    speak: 'Speak',
    stop: 'Stop',
    listening: 'I am listening...',
    language: 'Language',
    detectingLocation: 'Detecting your farm location...',
    autoVoice: 'Auto Voice Reply',
  },
  [Language.HI]: {
    title: 'कृषि मित्र',
    welcome: 'कृषि मित्र में आपका स्वागत है 🌱',
    chooseLanguage: 'कृपया अपनी पसंदीदा भाषा चुनें:',
    intentQuestion: 'आज आप किस चीज़ में मदद चाहेंगे?',
    backToHome: 'सेवा बदलें',
    inputPlaceholder: 'बोलें या अपना प्रश्न लिखें...',
    send: 'भेजें',
    uploadImage: 'फोटो अपलोड करें',
    speak: 'बोलें',
    stop: 'रोकें',
    listening: 'मैं सुन रहा हूँ...',
    language: 'भाषा',
    detectingLocation: 'आपके खेत के स्थान का पता लगाया जा रहा है...',
    autoVoice: 'ऑటో వాయిస్ ఉత్తర్',
  },
  [Language.TE]: {
    title: 'కృషిమిత్ర',
    welcome: 'కృషిమిత్రకు స్వాగతం 🌱',
    chooseLanguage: 'దయచేసి మీకు ఇష్టమైన భాషను ఎంచుకోండి:',
    intentQuestion: 'ఈ రోజు మీకు ఎలాంటి సహాయం కావాలి?',
    backToHome: 'సేవను మార్చండి',
    inputPlaceholder: 'మాట్లాడండి లేదా ప్రశ్నను టైప్ చేయండి...',
    send: 'పంపండి',
    uploadImage: 'చిత్రాన్ని అప్‌లోడ్ చేయండి',
    speak: 'మాట్లాడండి',
    stop: 'ఆపు',
    listening: 'నేను వింటున్నాను...',
    language: 'భాష',
    detectingLocation: 'మీ పొలం స్థానాన్ని గుర్తిస్తున్నాము...',
    autoVoice: 'ఆటో వాయిస్ రిప్లై',
  },
};

export const FEATURES: Record<Feature, { title: Record<Language, string>; description: Record<Language, string>; icon: React.ReactNode, prompt: Record<Language, string> }> = {
  [Feature.CROP_DOCTOR]: {
    title: { [Language.EN]: 'Crop Doctor', [Language.HI]: 'फसल डॉक्टर', [Language.TE]: 'పంట వైద్యుడు' },
    description: { [Language.EN]: 'Pest & disease diagnosis.', [Language.HI]: 'कीट और रोग निदान।', [Language.TE]: 'తెగులు & వ్యాధి నిర్ధారణ.' },
    icon: <LeafIcon className="w-12 h-12 text-green-600" />,
    prompt: {
        [Language.EN]: 'Namaste! I am your Crop Doctor. Please upload a clear photo of the leaf or crop. I will help you identify the disease and suggest remedies.',
        [Language.HI]: 'नमस्ते! मैं आपका फसल डॉक्टर हूँ। कृपया पत्ते या फसल का एक स्पष्ट फोटो अपलोड करें। मैं बीमारी की पहचान करने और उपाय सुझाने में मदद करूँगा।',
        [Language.TE]: 'నమస్కారం! నేను మీ పంట వైద్యుడిని. దయచేసి ఆకు లేదా పంట యొక్క స్పష్టమైన ఫోటోను అప్‌లోడ్ చేయండి. వ్యాధిని గుర్తించడంలో మరియు నివారణలను సూచించడంలో నేను మీకు సహాయం చేస్తాను.',
    }
  },
  [Feature.YIELD_PREDICTION]: {
    title: { [Language.EN]: 'Yield & Profit', [Language.HI]: 'उपज और लाभ', [Language.TE]: 'దిగుబడి & లాభం' },
    description: { [Language.EN]: 'Estimate harvest volume.', [Language.HI]: 'उपज का अनुमान लगाएं।', [Language.TE]: 'దిగుబడిని అంచనా వేయండి.' },
    icon: <BarChartIcon className="w-12 h-12 text-blue-600" />,
    prompt: {
        [Language.EN]: 'To estimate your yield and profit, please tell me your crop variety and the current growth stage.',
        [Language.HI]: 'आपकी उपज और लाभ का अनुमान लगाने के लिए, कृपया मुझे अपनी फसल की किस्म और वर्तमान विकास चरण बताएं।',
        [Language.TE]: 'మీ దిగుబడి మరియు లాభాన్ని అంచనా వేయడానికి, దయచేసి మీ పంట రకం మరియు ప్రస్తుత పెరుగుదల దశను నాకు చెప్పండి.',
    }
  },
  [Feature.MARKET_PRICE]: {
    title: { [Language.EN]: 'Mandi Prices', [Language.HI]: 'मंडी भाव', [Language.TE]: 'మండి ధరలు' },
    description: { [Language.EN]: 'Latest selling trends.', [Language.HI]: 'नवीनतम बिक्री रुझान।', [Language.TE]: 'తాజా అమ్మకపు పోకడలు.' },
    icon: <TagIcon className="w-12 h-12 text-yellow-600" />,
    prompt: {
        [Language.EN]: 'Which crop\'s mandi price and trend would you like to check today?',
        [Language.HI]: 'आज आप किस फसल के मंडी भाव और रुझान की जांच करना चाहेंगे?',
        [Language.TE]: 'ఈ రోజు మీరు ఏ పంట మండి ధర మరియు ట్రెండ్‌ను తనిఖీ చేయాలనుకుంటున్నారు?',
    }
  },
  [Feature.CROP_RECOMMENDATION]: {
    title: { [Language.EN]: 'Precision Advice', [Language.HI]: 'सटीक सलाह', [Language.TE]: 'ఖచ్చితమైన సలహా' },
    description: { [Language.EN]: 'Best crops for your soil.', [Language.HI]: 'आपकी मिट्टी के लिए सर्वश्रेष्ठ फसलें।', [Language.TE]: 'మీ నేలకి ఉత్తమ పంటలు.' },
    icon: <BulbIcon className="w-12 h-12 text-purple-600" />,
    prompt: {
        [Language.EN]: 'I will recommend the best crop based on your location and soil. What is your soil type?',
        [Language.HI]: 'मैं आपके स्थान और मिट्टी के आधार पर सबसे अच्छी फसल की सिफारिश करूँगा। आपकी मिट्टी का प्रकार क्या है?',
        [Language.TE]: 'మీ ప్రదేశం మరియు నేల ఆధారంగా ఉత్తమమైన పంటను నేను సిఫార్సు చేస్తాను. మీ నేల రకం ఏమిటి?',
    }
  },
  [Feature.QUALITY_CHECKER]: {
    title: { [Language.EN]: 'Quality Check', [Language.HI]: 'गुणवत्ता जांच', [Language.TE]: 'నాణ్యత తనిఖీ' },
    description: { [Language.EN]: 'Grade your produce.', [Language.HI]: 'अपने उत्पाद को ग्रेड करें।', [Language.TE]: 'మీ ఉత్పత్తిని ग్రేడ్ చేయండి.' },
    icon: <CheckBadgeIcon className="w-12 h-12 text-teal-600" />,
    prompt: {
        [Language.EN]: 'Please describe your harvested crop or upload a photo to check its quality grade.',
        [Language.HI]: 'कृपया अपनी कटी हुई फसल का वर्णन करें या गुणवत्ता ग्रेड की जांच के लिए फोटो अपलोड करें।',
        [Language.TE]: 'మీ పండిన పంటను వివరించండి లేదా దాని నాణ్యత గ్రేడ్‌ను తనిఖీ చేయడానికి ఫోటోను అప్‌లోడ్ చేయండి.',
    }
  },
  [Feature.CLIMATE_ADVISORY]: {
    title: { [Language.EN]: 'Climate & Risk', [Language.HI]: 'जलवायु और जोखिम', [Language.TE]: 'వాతావరణం & ప్రమాదం' },
    description: { [Language.EN]: 'Weather & pest alerts.', [Language.HI]: 'मौसम और कीट अलर्ट।', [Language.TE]: 'వాతావరణ & తెగుళ్ల హెచ్చరికలు.' },
    icon: <CloudIcon className="w-12 h-12 text-orange-600" />,
    prompt: {
        [Language.EN]: 'I am monitoring weather risks for your area. Do you want advice for a specific crop?',
        [Language.HI]: 'मैं आपके क्षेत्र के लिए मौसम के जोखिमों की निगरानी कर रहा हूँ। क्या आप किसी विशिष्ट फसल के लिए सलाह चाहते हैं?',
        [Language.TE]: 'నేను మీ ప్రాంతంలో వాతావరణ ప్రమాదాలను గమనిస్తున్నాను. మీరు ఏదైనా నిర్దిష్ట పంట కోసం సలహా కోరుకుంటున్నారా?',
    }
  },
};

const COMMON_RULES = `
- Persona: You are "Krishimitra", a friendly Rythu Nestham (Farmer's Friend).
- **Phonetic STT Correction Layer**: 
  Farmers use speech-to-text which often makes mistakes. Intelligently correct misheard words based on agricultural context.
  Examples: 
  * "Vari" (Paddy) might be misheard as "Very".
  * "Mandi" (Market) might be misheard as "Monday".
  * "Panta" (Crop) might be misheard as "Punter" or "Punta".
  * "Eruvulu" (Fertilizer) might be misheard as "Arrows".
  Always assume the user is talking about crops, soil, pests, or mandi prices.
- Voice-First: Keep replies brief, energetic, and phonetic. Use Rythu Bhasha (Farmer's dialect).
- Simple Vocabulary: No jargon. Use local terms (e.g., "Pola-panulu" instead of "Agriculture").
- Format:
  1. Quick greeting.
  2. Bulleted advice.
  3. Action steps.
  4. Closing question for next steps.
`;

export const SYSTEM_PROMPTS: Record<Language, string> = {
  [Language.EN]: `You are "Krishimitra", an AI Precision Agriculture Assistant. ${COMMON_RULES} User Language: English (Indian Dialect).`,
  [Language.HI]: `आप "कृषि मित्र" हैं। ${COMMON_RULES} भाषा: हिंदी (सरल ग्रामीण)। एएसआर त्रुटियों को सुधारें।`,
  [Language.TE]: `మీరు "కృషిమిత్ర", ఒక AI ప్రిసిషన్ అగ్రికల్చర్ అసిస్టెంట్. ${COMMON_RULES} భాష: తెలుగు. రైతులతో మాట్లాడేటప్పుడు వాడుక భాషలో (Rythu Bhasha) సరళంగా సమాధానం ఇవ్వండి. వాయిస్ ట్రాన్స్క్రిప్షన్ లో తప్పులుంటే (ASR errors) వ్యవసాయ సందర్భాన్ని బట్టి అర్థం చేసుకుని సమాధానం ఇవ్వండి.`
};
