
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TRANSLATIONS, CATEGORY_TRANSLATIONS } from '../lib/translations';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS['fr']) => string;
  getCategoryTranslation: (categoryId: string) => typeof CATEGORY_TRANSLATIONS['alcoholConsumption']['fr'];
  getFormattedCountryName: (abbreviation: string | undefined, fallback: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('geochaos_lang');
    if (saved === 'fr' || saved === 'en') return saved;
    // Default to French
    return navigator.language.startsWith('en') ? 'en' : 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('geochaos_lang', lang);
  };

  const t = (key: keyof typeof TRANSLATIONS['fr']): string => {
    return TRANSLATIONS[language][key] || key;
  };

  const getCategoryTranslation = (categoryId: string) => {
    const catId = categoryId as keyof typeof CATEGORY_TRANSLATIONS;
    if (CATEGORY_TRANSLATIONS[catId]) {
      return CATEGORY_TRANSLATIONS[catId][language];
    }
    // Fallback info if not found (should not happen)
    return { label: categoryId, labelHigher: categoryId, labelLower: categoryId, unit: '', description: '' };
  };

  const getFormattedCountryName = (abbreviation: string | undefined, fallback: string) => {
    try {
      const code = abbreviation?.trim().toUpperCase();
      if (!code || !/^([A-Z]{2}|[0-9]{3})$/.test(code)) return fallback;
      return new Intl.DisplayNames([language], { type: 'region' }).of(code) || fallback;
    } catch (e) {
      return fallback;
    }
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, getCategoryTranslation, getFormattedCountryName }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
