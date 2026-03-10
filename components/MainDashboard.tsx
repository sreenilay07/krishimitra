
import React from 'react';
import { Feature, Language } from '../types';
import { FEATURES, UI_TEXT } from '../constants';
import FeatureCard from './FeatureCard';

interface MainDashboardProps {
  onSelectFeature: (feature: Feature) => void;
  language: Language;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ onSelectFeature, language }) => {
  const texts = UI_TEXT[language];
  const featureKeys = Object.keys(FEATURES) as Feature[];

  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10 h-full overflow-y-auto bg-slate-50/20">
      <div className="text-center max-w-2xl mb-12 animate-in slide-in-from-bottom duration-700">
        <h2 className="text-4xl font-black text-green-900 mb-3">{texts.intentQuestion}</h2>
        <div className="w-24 h-1.5 bg-green-500 mx-auto rounded-full mb-4"></div>
        <p className="text-green-700 font-medium text-lg">Select a service to begin your precise agricultural journey.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {featureKeys.map((key) => (
          <FeatureCard
            key={key}
            feature={FEATURES[key]}
            onClick={() => onSelectFeature(key)}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};

export default MainDashboard;
