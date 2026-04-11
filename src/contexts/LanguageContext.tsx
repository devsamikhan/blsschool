import React, { useState, useEffect, useCallback } from 'react';
import { Language, translations, Translations } from '../lib/translations';
import { Cookies } from '../lib/CookieManager';
import { LanguageContext } from './LanguageContext/LanguageContext';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = (localStorage.getItem('bls_lang') || Cookies.get('bls_lang')) as Language;
    return saved || 'en';
  });

  const dir = language === 'ur' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('bls_lang', language);
    Cookies.set('bls_lang', language, 365); // Save for a year
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const t = useCallback((key: keyof Translations['en']): string => {
    const keys = language === 'ur' ? translations.ur : translations.en;
    return keys[key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}


export { LanguageContext } from './LanguageContext/LanguageContext';
