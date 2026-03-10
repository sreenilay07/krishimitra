
import React from 'react';
import { Language } from '../types';

interface FeatureCardProps {
  feature: {
    title: Record<Language, string>;
    description: Record<Language, string>;
    icon: React.ReactNode;
  };
  onClick: () => void;
  language: Language;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick, language }) => {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-3xl border-2 border-green-50 p-6 text-center shadow-sm hover:shadow-2xl hover:border-green-300 hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col items-center space-y-4 focus:outline-none focus:ring-4 focus:ring-green-500/20 active:scale-95"
    >
      <div className="p-4 bg-green-50 rounded-2xl group-hover:scale-110 group-hover:bg-green-100 transition-all duration-500">
        {feature.icon}
      </div>
      <div>
        <h3 className="text-xl font-black text-green-900 mb-1">{feature.title[language]}</h3>
        <p className="text-green-700/70 text-sm font-medium leading-snug">{feature.description[language]}</p>
      </div>
      <div className="pt-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">Start</span>
      </div>
    </button>
  );
};

export default FeatureCard;
