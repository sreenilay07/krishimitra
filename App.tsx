
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language, Feature, ChatMessage } from './types';
import { UI_TEXT, FEATURES, SYSTEM_PROMPTS } from './constants';
import { getKrishimitraResponse, getLocationFromCoordinates, generateKrishimitraSpeech } from './services/geminiService';
import Header from './components/Header';
import MainDashboard from './components/MainDashboard';
import ChatInterface from './components/ChatInterface';
import LanguageSelection from './components/LanguageSelection';

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});

// PCM decoding helpers
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export default function App() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingWelcome, setIsSpeakingWelcome] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const texts = language ? UI_TEXT[language] : UI_TEXT[Language.EN];

  const handleLanguageSelect = async (lang: Language) => {
    setLanguage(lang);
    
    // Voice-First Welcome
    setIsSpeakingWelcome(true);
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        }
        
        const welcomeText = UI_TEXT[lang].welcome + ". " + UI_TEXT[lang].intentQuestion;
        const base64Audio = await generateKrishimitraSpeech(welcomeText, lang);
        
        if (base64Audio) {
            const audioBuffer = await decodeAudioData(
                decodeBase64(base64Audio),
                audioContextRef.current,
                24000,
                1
            );
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsSpeakingWelcome(false);
            source.start(0);
        } else {
            setIsSpeakingWelcome(false);
        }
    } catch (err) {
        console.error("Welcome speech failed", err);
        setIsSpeakingWelcome(false);
    }
  };

  const handleGoHome = () => {
    setActiveFeature(null);
  };

  const handleReset = () => {
    setLanguage(null);
    setActiveFeature(null);
    setMessages([]);
    setIsSpeakingWelcome(false);
  };

  useEffect(() => {
    if (!activeFeature || !language) {
      setMessages([]);
      return;
    }

    const featureRequiresLocation =
      activeFeature === Feature.CROP_RECOMMENDATION ||
      activeFeature === Feature.YIELD_PREDICTION ||
      activeFeature === Feature.CLIMATE_ADVISORY;
    
    const initialMessageId = `init-${Date.now()}`;

    const handleLocationSuccess = async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        try {
            const locationName = await getLocationFromCoordinates(latitude, longitude);
            let nextPrompt = '';
            
            if (activeFeature === Feature.CROP_RECOMMENDATION) {
                 switch (language) {
                    case Language.HI:
                        nextPrompt = `नमस्ते! मैंने पाया कि आप ${locationName} के पास हैं। प्रिसिजन फार्मिंग सलाह के लिए, कृपया मुझे अपनी मिट्टी का प्रकार बताएं।`;
                        break;
                    case Language.TE:
                        nextPrompt = `నమస్కారం! మీరు ${locationName} సమీపంలో ఉన్నారని నేను కనుగొన్నాను. వ్యవసాయ సలహా కోసం, దయచేసి మీ నేల రకం గురించి చెప్పండి.`;
                        break;
                    default:
                        nextPrompt = `Hello! I see you're near ${locationName}. For precision advice, please tell me your soil type.`;
                }
            } else if (activeFeature === Feature.CLIMATE_ADVISORY) {
                 switch (language) {
                    case Language.HI:
                        nextPrompt = `नमस्ते! मैं ${locationName} के लिए जोखिमों की जांच कर रहा हूँ। वर्तमान में स्थिति ठीक लग रही है। क्या आप अपनी फसल के बारे में कुछ पूछना चाहते हैं?`;
                        break;
                    case Language.TE:
                        nextPrompt = `నమస్కారం! నేను ${locationName} కోసం ప్రమాదాలను తనిఖీ చేస్తున్నాను. ప్రస్తుతం పరిస్థితి బాగానే ఉంది. మీరు మీ పంట గురించి ఏదైనా అడగాలనుకుంటున్నారా?`;
                        break;
                    default:
                        nextPrompt = `Hello! I am checking risks for ${locationName}. Conditions look stable. Anything specific about your crop?`;
                }
            } else { // Yield
                 switch (language) {
                    case Language.HI:
                        nextPrompt = `नमस्ते! ${locationName} में आपकी उपज का अनुमान लगाने के लिए, कृपया अपनी फसल और बुवाई का समय बताएं।`;
                        break;
                    case Language.TE:
                        nextPrompt = `నమస్కారం! ${locationName}లో మీ దిగుబడిని అంచనా వేయడానికి, దయచేసి మీ పంట మరియు విత్తిన సమయం గురించి చెప్పండి.`;
                        break;
                    default:
                        nextPrompt = `Hello! To predict yield in ${locationName}, please tell me your crop and planting date.`;
                }
            }
            
            setMessages(prev => prev.map(msg => 
                msg.id === initialMessageId ? { ...msg, text: nextPrompt } : msg
            ));

        } catch (error) {
            setMessages(prev => prev.map(msg => 
                msg.id === initialMessageId ? { ...msg, text: FEATURES[activeFeature].prompt[language] } : msg
            ));
        }
    };
    
    const handleLocationError = () => {
        setMessages(prev => prev.map(msg => 
            msg.id === initialMessageId ? { ...msg, text: FEATURES[activeFeature].prompt[language] } : msg
        ));
    };

    if (featureRequiresLocation) {
      setMessages([{ id: initialMessageId, role: 'model', text: texts.detectingLocation }]);
      navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);
    } else {
      setMessages([{ id: initialMessageId, role: 'model', text: FEATURES[activeFeature].prompt[language] }]);
    }
  }, [activeFeature, language]);

  const handleSendMessage = useCallback(async (text: string, imageFile?: File) => {
    if (!text && !imageFile) return;
    setIsLoading(true);

    let imageBase64: string | undefined;
    let userMessageText = text;

    if (imageFile) {
        try {
            imageBase64 = await toBase64(imageFile);
            if(!text) userMessageText = texts.uploadImage;
        } catch (error) {
            setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'model', text: "Error processing image." }]);
            setIsLoading(false);
            return;
        }
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userMessageText,
      image: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
        const fullConversation = [...messages, userMessage];
        const responseText = await getKrishimitraResponse({
            feature: activeFeature!,
            language: language!,
            systemInstruction: SYSTEM_PROMPTS[language!],
            conversation: fullConversation,
            image: imageBase64 ? { base64: imageBase64, mimeType: imageFile!.type } : undefined
        });

      setMessages(prev => [...prev, { id: `model-${Date.now()}`, role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'model', text: "Service error. Try again." }]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFeature, language, messages, texts.uploadImage]);

  return (
    <div className="bg-green-50/50 font-sans min-h-screen flex flex-col selection:bg-green-200">
      <Header
        language={language}
        onReset={handleReset}
        texts={texts}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-green-100 relative">
          
          {/* Audio Visualizer Overlay when speaking welcome */}
          {isSpeakingWelcome && (
            <div className="absolute inset-0 z-50 bg-green-900/10 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-500">
               <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center space-y-6 border border-green-100">
                  <div className="flex items-end gap-2 h-16">
                     <div className="w-2 bg-green-500 rounded-full animate-voice-bar-1"></div>
                     <div className="w-2 bg-green-600 rounded-full animate-voice-bar-2"></div>
                     <div className="w-2 bg-green-700 rounded-full animate-voice-bar-3"></div>
                     <div className="w-2 bg-green-600 rounded-full animate-voice-bar-2"></div>
                     <div className="w-2 bg-green-500 rounded-full animate-voice-bar-1"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-green-900 leading-tight">
                        {language === Language.TE ? 'కృషిమిత్ర మాట్లాడుతోంది...' : language === Language.HI ? 'कृषि मित्र बोल रहा है...' : 'Krishimitra is speaking...'}
                    </p>
                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest mt-2">Listening to your needs</p>
                  </div>
               </div>
            </div>
          )}

          {!language ? (
            <LanguageSelection onSelect={handleLanguageSelect} />
          ) : !activeFeature ? (
            <MainDashboard onSelectFeature={setActiveFeature} language={language} />
          ) : (
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              language={language}
              activeFeature={activeFeature}
              onGoHome={handleGoHome}
            />
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-[10px] font-bold text-green-800/40 uppercase tracking-[0.2em]">
        Krishimitra • Voice-First Precision Farming Assistant
      </footer>

      <style>{`
        @keyframes voice-bar {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
        .animate-voice-bar-1 { animation: voice-bar 0.6s infinite ease-in-out; }
        .animate-voice-bar-2 { animation: voice-bar 0.8s infinite ease-in-out; }
        .animate-voice-bar-3 { animation: voice-bar 0.5s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
