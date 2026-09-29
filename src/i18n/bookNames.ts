import { SupportedLanguage } from './types';

export const LOCALIZED_BOOK_NAMES: Record<string, Partial<Record<SupportedLanguage, string>>> = {};

export function getLocalizedBookName(bookId: string, defaultName: string, lang: SupportedLanguage): string {
  if (lang === 'en') return defaultName;
  let cleanId = (bookId || '').toLowerCase().replace(/[\s_-]/g, '');
  if (cleanId === 'psalm') cleanId = 'psalms';
  const entry = LOCALIZED_BOOK_NAMES[cleanId];
  if (entry && entry[lang]) {
    return entry[lang]!;
  }
  return defaultName;
}

/**
 * Localizes references like "Genesis 8:1" -> "Genèse 8:1" or "Psalm 119:105" -> "Psaumes 119:105"
 */
export function formatLocalizedReference(ref: string, lang: SupportedLanguage): string {
  if (!ref || lang === 'en') return ref;
  const match = ref.trim().match(/^([1-3]?\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s*(.*)$/);
  if (!match) return ref;
  const rawBook = match[1].trim();
  const rest = match[2];
  const localizedBook = getLocalizedBookName(rawBook, rawBook, lang);
  return rest ? `${localizedBook} ${rest}` : localizedBook;
}

export function getLocalizedCategory(category: string, lang: SupportedLanguage): string {
  if (lang !== 'zh') return category;
  const map: Record<string, string> = {
    'Law': '律法书',
    'History': '历史书',
    'Poetry': '诗歌・智慧',
    'Wisdom': '智慧书',
    'Major Prophets': '大先知书',
    'Minor Prophets': '小先知书',
    'Gospels': '福音书',
    'Pauline Epistles': '保罗书信',
    'General Epistles': '大公书信',
    'Prophecy': '启示预言',
    'Apocalyptic': '启示文学'
  };
  return map[category] || category;
}

export function getLocalizedTestament(testament: 'OT' | 'NT' | string, lang: SupportedLanguage): string {
  if (lang !== 'zh') return testament;
  if (testament === 'OT') return '旧约';
  if (testament === 'NT') return '新约';
  return testament;
}
