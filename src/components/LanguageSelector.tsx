
import React from 'react';
import { useTranslation } from './TranslationProvider';
import { motion } from 'motion/react';

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLanguage('fr')}
        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all shadow-md active:scale-95 ${
          language === 'fr'
            ? 'bg-accent-cyan border-white text-max-bg font-black'
            : 'bg-max-muted border-white/20 text-white/40 hover:border-white/40'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all shadow-md active:scale-95 ${
          language === 'en'
            ? 'bg-accent-cyan border-white text-max-bg font-black'
            : 'bg-max-muted border-white/20 text-white/40 hover:border-white/40'
        }`}
      >
        EN
      </button>
    </div>
  );
}
