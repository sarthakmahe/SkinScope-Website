import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { defaultLanguage, supportedLanguages, translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const savedLanguage = localStorage.getItem('lang');
    return supportedLanguages.includes(savedLanguage) ? savedLanguage : defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem('lang', language);
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
  }, [language]);

  const setLanguage = (nextLanguage) => {
    if (supportedLanguages.includes(nextLanguage)) {
      setLanguageState(nextLanguage);
    }
  };

  const value = useMemo(() => {
    const currentTranslations = translations[language] || translations[defaultLanguage];

    return {
      language,
      setLanguage,
      t: (key) => currentTranslations[key] || translations[defaultLanguage][key] || key
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
};
