import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SupportedLanguage, LanguageOption, SUPPORTED_LANGUAGES, TranslationSchema } from './types';
import { getTranslations } from './translations';
import { getLocalizedBookName, formatLocalizedReference } from './bookNames';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof TranslationSchema | string, fallback?: string, vars?: Record<string, string | number>) => string;
  getLocalizedBook: (bookId: string, defaultName?: string) => string;
  formatLocalizedRef: (ref: string) => string;
  languages: LanguageOption[];
  translations: TranslationSchema;
}

const STORAGE_KEY = 'berea_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      return saved as SupportedLanguage;
    }
  } catch {}
  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(detectInitialLanguage);

  const translations = useMemo(() => getTranslations(language), [language]);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
      window.dispatchEvent(new CustomEvent('berea_language_changed', { detail: newLang }));
    } catch (e) {
      console.error('Failed to persist language preference', e);
    }
  }, []);

  // Sync across windows or external storage triggers
  useEffect(() => {
    document.documentElement.lang = language;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        if (SUPPORTED_LANGUAGES.some(l => l.code === e.newValue)) {
          setLanguageState(e.newValue as SupportedLanguage);
        }
      }
    };

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLanguage>;
      if (customEvent.detail && SUPPORTED_LANGUAGES.some(l => l.code === customEvent.detail)) {
        setLanguageState(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('berea_language_changed', handleCustomChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('berea_language_changed', handleCustomChange);
    };
  }, [language]);

  const t = useCallback((
    key: keyof TranslationSchema | string,
    fallback?: string,
    vars?: Record<string, string | number>
  ): string => {
    const schema = translations as Record<string, any>;
    const defaultSchema = getTranslations('en') as Record<string, any>;
    let text = schema[key] || defaultSchema[key] || fallback || key;
    if (vars && typeof text === 'string') {
      for (const [varKey, val] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(val));
      }
    }
    return text;
  }, [translations]);

  const getLocalizedBook = useCallback((bookId: string, defaultName?: string): string => {
    return getLocalizedBookName(bookId, defaultName || bookId, language);
  }, [language]);

  const formatLocalizedRef = useCallback((ref: string): string => {
    return formatLocalizedReference(ref, language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    getLocalizedBook,
    formatLocalizedRef,
    languages: SUPPORTED_LANGUAGES,
    translations
  }), [language, setLanguage, t, getLocalizedBook, formatLocalizedRef, translations]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
