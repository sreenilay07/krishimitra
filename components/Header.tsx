
import React from 'react';
import { Language } from '../types';
import { LogoIcon } from './Icons';

interface HeaderProps {
  language: Language | null;
  onReset: () => void;
  texts: any;
}

const Header: React.FC<HeaderProps> = ({ language, onReset, texts }) => {
  return (
    <header className="bg-gradient-to-r from-green-700 to-green-900 text-white shadow-xl p-4 flex justify-between items-center z-50">
      <button 
        onClick={onReset}
        className="flex items-center space-x-3 group hover:opacity-90 transition-opacity"
      >
        <div className="bg-white/10 p-2 rounded-xl border border-white/20 group-hover:rotate-12 transition-transform">
          <LogoIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">{texts.title}</h1>
      </button>
      
      {language && (
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] font-bold uppercase tracking-wider text-green-200">Session Mode</span>
             <span className="text-sm font-black text-white">{language === Language.EN ? 'English' : language === Language.HI ? 'हिंदी' : 'తెలుగు'}</span>
          </div>
          <button 
            onClick={onReset}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
          >
            Reset
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
