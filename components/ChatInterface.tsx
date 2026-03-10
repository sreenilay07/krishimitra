
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, Feature } from '../types';
import { UI_TEXT, FEATURES } from '../constants';
import { generateKrishimitraSpeech } from '../services/geminiService';
import { ArrowLeftIcon, CameraIcon, MicrophoneIcon, SendIcon, SpeakerIcon, StopCircleIcon, LogoIcon, VolumeUpIcon, VolumeOffIcon } from './Icons';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, image?: File) => void;
  isLoading: boolean;
  language: Language;
  activeFeature: Feature;
  onGoHome: () => void;
}

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

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, language, activeFeature, onGoHome }) => {
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [autoVoice, setAutoVoice] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  
  const texts = UI_TEXT[language];
  const featureDetails = FEATURES[activeFeature];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'model' && autoVoice && !isLoading) {
        handleTextToSpeech(lastMsg.text);
    }
  }, [messages, isLoading]);

  // High-Quality Mic Capture Visualizer
  const startVisualizer = async () => {
    try {
      if (!micStreamRef.current) {
        // Strategy: Use noise suppression and echo cancellation for better signal
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true, 
            autoGainControl: true 
          } 
        });
      }
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (!analyserRef.current) {
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        const source = audioContextRef.current.createMediaStreamSource(micStreamRef.current);
        source.connect(analyserRef.current);
      }
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setMicVolume(average / 128);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      
      updateVolume();
    } catch (err) {
      console.error("Mic setup failed", err);
    }
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setMicVolume(0);
  };

  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.abort();
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const newRecognition = new SpeechRecognition();
      
      // Strategy: Fine-tune for Indian dialects and agricultural use cases
      newRecognition.continuous = false;
      newRecognition.interimResults = true; 
      newRecognition.maxAlternatives = 1; // Rely on Gemini context correction rather than browser alternatives
      
      // Use Regional Indian Language Codes
      newRecognition.lang = language === 'HI' ? 'hi-IN' : language === 'TE' ? 'te-IN' : 'en-IN';
      
      newRecognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
        startVisualizer();
      };
      
      newRecognition.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setInputText(prev => prev + ' ' + final);
          setInterimText('');
        } else {
          setInterimText(interim);
        }
      };
      
      newRecognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        stopVisualizer();
      };
      
      newRecognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        stopVisualizer();
      };

      recognitionRef.current = newRecognition;
    }
    return () => { 
        if (recognitionRef.current) recognitionRef.current.abort(); 
        stopVisualizer();
    };
  }, [language]);
  
  const handleSend = () => {
    const finalMsg = (inputText + ' ' + interimText).trim();
    if (isLoading || (!finalMsg && !imageFile)) return;
    onSendMessage(finalMsg, imageFile ?? undefined);
    setInputText('');
    setInterimText('');
    setImageFile(null);
    setImagePreview(null);
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return alert("Browser not supported");
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Clear before starting new session
      setInputText('');
      recognitionRef.current.start();
    }
  };

  const handleTextToSpeech = async (text: string) => {
    if (isSpeaking) {
        if (activeSourceRef.current) {
            activeSourceRef.current.stop();
            activeSourceRef.current = null;
        }
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

    setIsSpeaking(true);
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        }
        const base64Audio = await generateKrishimitraSpeech(text, language);
        if (base64Audio) {
            const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            
            source.onended = () => {
                setIsSpeaking(false);
                activeSourceRef.current = null;
                // Hands-Free Strategy: Auto-listen after AI speaks to minimize friction
                setTimeout(() => {
                    if (recognitionRef.current && !isLoading && !isListening) {
                        recognitionRef.current.start();
                    }
                }, 400); // 400ms delay avoids self-feedback loop
            };
            activeSourceRef.current = source;
            source.start(0);
            return;
        }
    } catch (err) {
        console.warn("TTS fallback", err);
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'HI' ? 'hi-IN' : language === 'TE' ? 'te-IN' : 'en-IN';
      utterance.onend = () => {
          setIsSpeaking(false);
          setTimeout(() => {
              if (recognitionRef.current && !isLoading && !isListening) {
                  recognitionRef.current.start();
              }
          }, 400);
      };
      window.speechSynthesis.speak(utterance);
    } else {
        setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex items-center p-4 border-b border-green-100 bg-white">
        <button onClick={onGoHome} className="p-2 rounded-2xl hover:bg-green-50 transition-colors mr-3 text-green-700">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 p-2 bg-green-50 rounded-xl flex items-center justify-center mr-3">
          {React.cloneElement(featureDetails.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
        </div>
        <div className="flex-grow">
          <h2 className="text-lg font-black text-green-900 leading-tight">{featureDetails.title[language]}</h2>
          <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Voice-First Mode</p>
        </div>
        <button 
          onClick={() => setAutoVoice(!autoVoice)}
          className={`p-2.5 rounded-2xl transition-all ${autoVoice ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
          title={texts.autoVoice}
        >
          {autoVoice ? <VolumeUpIcon className="w-5 h-5" /> : <VolumeOffIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50/20">
        <div className="space-y-6 max-w-2xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-green-100 text-green-700 font-bold text-[10px]' : 'bg-green-600 text-white'}`}>
                {msg.role === 'user' ? 'Me' : <LogoIcon className="w-4 h-4" />}
              </div>
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-3xl shadow-sm ${msg.role === 'user' ? 'bg-green-700 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-green-100 rounded-tl-none'}`}>
                  {msg.image && (
                    <div className="mb-3 overflow-hidden rounded-2xl border border-green-500/10">
                      <img src={msg.image} alt="Upload" className="max-h-48 w-auto object-contain" />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px] font-medium">{msg.text}</p>
                  {msg.role === 'model' && (
                    <button 
                      onClick={() => handleTextToSpeech(msg.text)} 
                      className={`mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all ${isSpeaking ? 'bg-orange-500 text-white shadow-lg' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                      {isSpeaking ? <StopCircleIcon className="w-4 h-4" /> : <SpeakerIcon className="w-4 h-4" />}
                      <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <div className="w-8 h-8 rounded-full bg-green-600 shadow-md flex items-center justify-center animate-pulse">
                 <LogoIcon className="w-4 h-4 text-white" />
               </div>
               <div className="p-5 rounded-3xl bg-white border border-green-100 rounded-tl-none shadow-sm flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
               </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {(isSpeaking || isListening) && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-sm px-4">
            <div className="flex items-end justify-center gap-1.5 h-16 bg-white/95 backdrop-blur-xl px-10 rounded-full shadow-2xl border border-green-100 transition-all">
                <div className="w-1.5 bg-green-400 rounded-full transition-all duration-75" style={{ height: `${20 + (micVolume * 80)}%` }}></div>
                <div className="w-1.5 bg-green-500 rounded-full transition-all duration-75" style={{ height: `${40 + (micVolume * 60)}%` }}></div>
                <div className="w-1.5 bg-green-700 rounded-full transition-all duration-75" style={{ height: `${30 + (micVolume * 70)}%` }}></div>
                <div className="w-1.5 bg-green-600 rounded-full transition-all duration-75" style={{ height: `${50 + (micVolume * 50)}%` }}></div>
                <div className="w-1.5 bg-green-400 rounded-full transition-all duration-75" style={{ height: `${20 + (micVolume * 80)}%` }}></div>
            </div>
            {interimText && (
                <div className="mt-4 text-center animate-in fade-in slide-in-from-top-2">
                    <span className="bg-black/80 text-white text-sm font-bold px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl inline-block">
                        {interimText}
                    </span>
                </div>
            )}
        </div>
      )}

      <div className="p-4 md:p-6 bg-white border-t border-green-50">
        <div className="max-w-3xl mx-auto">
          {imagePreview && (
            <div className="relative w-20 h-20 mb-4 group">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-md border-2 border-green-500" />
              <button onClick={() => {setImageFile(null); setImagePreview(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                <StopCircleIcon className="w-4 h-4"/>
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            {(activeFeature === Feature.CROP_DOCTOR || activeFeature === Feature.QUALITY_CHECKER) && (
              <div className="flex-shrink-0">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-green-50 text-green-700 rounded-2xl hover:bg-green-100 transition-all shadow-sm">
                      <CameraIcon className="w-6 h-6" />
                  </button>
              </div>
            )}
            <div className="flex-grow relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? texts.listening : texts.inputPlaceholder}
                className="w-full p-4 pr-14 bg-gray-50 border border-green-100 rounded-[1.5rem] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all text-gray-800 font-medium placeholder-green-700/30"
                disabled={isLoading}
              />
              <button onClick={handleMicClick} className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl hover:bg-green-100 transition-colors">
                <MicrophoneIcon className={`w-6 h-6 ${isListening ? 'text-red-500 scale-125 transition-transform' : 'text-green-600'}`} />
              </button>
            </div>
            <button 
              onClick={handleSend} 
              disabled={isLoading || (!inputText.trim() && !interimText.trim() && !imageFile)} 
              className="p-4 bg-green-700 text-white rounded-[1.5rem] hover:bg-green-800 disabled:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-green-100"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
