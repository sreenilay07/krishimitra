
import React from 'react';
import { Language } from '../types';
import { LogoIcon } from './Icons';

interface LanguageSelectionProps {
  onSelect: (lang: Language) => void;
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in zoom-in duration-700 bg-gradient-to-b from-white to-green-50/30">
      <div className="mb-6 p-6 bg-green-100 rounded-[3rem] shadow-inner border border-green-200/50">
        <LogoIcon className="w-20 h-20 text-green-700 animate-pulse" />
      </div>
      <h1 className="text-4xl font-black text-green-900 mb-2 tracking-tight">Krishimitra 🌱</h1>
      <p className="text-lg text-green-800/70 mb-10 font-bold uppercase tracking-widest">Rythu Nestham Assistant</p>
      
      <div className="space-y-4 w-full max-w-sm">
        <button
          onClick={() => onSelect(Language.TE)}
          className="w-full group relative bg-white border-2 border-green-200 p-6 rounded-3xl hover:border-green-600 hover:bg-green-50 transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95 flex items-center justify-between"
        >
          <span className="text-2xl font-black text-gray-800">తెలుగు (Telugu)</span>
          <span className="text-2xl">🇮🇳</span>
          <div className="absolute inset-0 rounded-3xl bg-green-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
        </button>

        <button
          onClick={() => onSelect(Language.HI)}
          className="w-full group relative bg-white border-2 border-green-100 p-6 rounded-3xl hover:border-green-600 hover:bg-green-50 transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95 flex items-center justify-between"
        >
          <span className="text-2xl font-black text-gray-800">हिंदी (Hindi)</span>
          <span className="text-2xl">🇮🇳</span>
          <div className="absolute inset-0 rounded-3xl bg-green-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
        </button>

        <button
          onClick={() => onSelect(Language.EN)}
          className="w-full group relative bg-white border-2 border-green-100 p-6 rounded-3xl hover:border-green-600 hover:bg-green-50 transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95 flex items-center justify-between"
        >
          <span className="text-2xl font-black text-gray-800">English</span>
          <span className="text-2xl">🇬🇧</span>
          <div className="absolute inset-0 rounded-3xl bg-green-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
        </button>
      </div>
      
      <div className="mt-12 flex items-center gap-3 text-green-800/60 font-black text-xs uppercase tracking-widest bg-white/50 px-4 py-2 rounded-full border border-green-100">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
        Voice-First Experience Enabled
      </div>
    </div>
  );
};

export default LanguageSelection;
