import { SupportedLanguage, TranslationSchema } from '../types';
import { en } from './en';

export const TRANSLATIONS_MAP: Record<SupportedLanguage, TranslationSchema> = {
  en: en,
  es: en,
  fr: en,
  de: en,
  pt: en,
  zh: en,
  ko: en,
  ja: en,
  it: en,
  ru: en,
  tl: en,
  la: en
};

export function getTranslations(lang: SupportedLanguage): TranslationSchema {
  return TRANSLATIONS_MAP[lang] || en;
}
