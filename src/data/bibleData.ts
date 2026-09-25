export interface Verse {
  verseNumber: number;
  text: Record<string, string>; // e.g. { KJV: "...", ESV: "...", NIV: "...", NLT: "...", NASB: "..." }
  isWordsOfJesus?: boolean;
  notes?: string;
  crossRefs?: string[];
  greekHebrew?: {
    word: string;
    transliteration: string;
    strongs: string;
    definition: string;
  }[];
}

export interface Chapter {
  chapterNumber: number;
  summary: string;
  verses: Verse[];
  locationKey?: string;
}

export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: 'OT' | 'NT';
  category: 'Law' | 'History' | 'Poetry' | 'Wisdom' | 'Major Prophets' | 'Minor Prophets' | 'Gospels' | 'Pauline Epistles' | 'General Epistles' | 'Prophecy';
  chaptersCount: number;
  author: string;
  dateWritten: string;
  theme: string;
  keyVerse: string;
  chapters?: Record<number, Chapter>;
}

import { DenominationalLens } from './theologyData';

export interface TranslationInfo {
  id: string;
  apiCode: string;
  name: string;
  year: string;
  philosophy: string;
  badge: string;
  approvedDenominations: DenominationalLens[];
  description: string;
  isCanonDeuterocanon?: boolean;
}

export const TRANSLATIONS: TranslationInfo[] = [
  // Roman Catholic Approved
  {
    id: 'NABRE',
    apiCode: 'NABRE',
    name: 'New American Bible (Revised Edition)',
    year: '2011',
    philosophy: 'Formal / Critical',
    badge: 'USCCB Official Liturgical',
    approvedDenominations: ['catholic'],
    description: 'The official liturgical and lectionary translation of the Catholic Church in the United States, containing the full Catholic canon with Deuterocanonical books.',
    isCanonDeuterocanon: true
  },
  {
    id: 'RSVCE',
    apiCode: 'RSV2CE',
    name: 'Revised Standard Version (Catholic Edition)',
    year: '1966',
    philosophy: 'Word-for-Word (Formal)',
    badge: 'Ignatius Bible / CCC Standard',
    approvedDenominations: ['catholic'],
    description: 'Highly acclaimed for theological precision, used in the English Catechism of the Catholic Church and the Ignatius Catholic Study Bible.',
    isCanonDeuterocanon: true
  },
  {
    id: 'NRSVCE',
    apiCode: 'NRSVCE',
    name: 'New Revised Standard Version (Catholic Edition)',
    year: '1993',
    philosophy: 'Formal Equivalence',
    badge: 'USCCB & CCCB Approved',
    approvedDenominations: ['catholic', 'anglican'],
    description: 'Authorized by the USCCB and Canadian Conference of Catholic Bishops for lectionary and academic study.',
    isCanonDeuterocanon: true
  },
  {
    id: 'DRB',
    apiCode: 'DRB',
    name: 'Douay-Rheims Bible (Challoner Revision)',
    year: '1899',
    philosophy: 'Traditional Latin Vulgate',
    badge: 'Traditional Catholic Heritage',
    approvedDenominations: ['catholic'],
    description: 'Historic English Catholic translation translated directly from the Latin Vulgate of St. Jerome, revered for traditional Catholic dogmatics.',
    isCanonDeuterocanon: true
  },
  {
    id: 'NJB',
    apiCode: 'NJB1985',
    name: 'New Jerusalem Bible',
    year: '1985',
    philosophy: 'Dynamic Equivalence',
    badge: 'Catholic Scholarly',
    approvedDenominations: ['catholic'],
    description: 'Widely used in Catholic liturgy and scholarship outside North America, praised for its literary beauty.',
    isCanonDeuterocanon: true
  },

  // Eastern Orthodox Approved
  {
    id: 'NKJV',
    apiCode: 'NKJV',
    name: 'New King James Version (OSB Base)',
    year: '1982',
    philosophy: 'Complete Formal Equivalence',
    badge: 'Orthodox Study Bible Base',
    approvedDenominations: ['orthodox', 'baptist_evangelical', 'lutheran'],
    description: 'Preserves the Byzantine / Textus Receptus tradition, serving as the New Testament foundation for the Orthodox Study Bible (OSB).'
  },
  {
    id: 'RSV',
    apiCode: 'RSV',
    name: 'Revised Standard Version (with Apocrypha)',
    year: '1952',
    philosophy: 'Word-for-Word (Formal)',
    badge: 'Ecumenical & Orthodox Standard',
    approvedDenominations: ['orthodox', 'anglican'],
    description: 'Widely endorsed across Eastern Orthodox jurisdictions and Western Christendom for scholarly fidelity.'
  },

  // Reformed & Presbyterian Approved
  {
    id: 'ESV',
    apiCode: 'ESV',
    name: 'English Standard Version',
    year: '2001',
    philosophy: 'Essentially Literal (Word-for-Word)',
    badge: 'Reformation Study Standard',
    approvedDenominations: ['reformed', 'lutheran', 'anglican', 'baptist_evangelical', 'wesleyan'],
    description: 'The standard translation for the Reformation Study Bible, PCA, OPC, and modern confessional Protestant theology.'
  },
  {
    id: 'GENEVA',
    apiCode: 'GNV',
    name: '1599 Geneva Bible (Puritan Edition)',
    year: '1599',
    philosophy: 'Historic Reformation Formal',
    badge: 'Puritan / Westminster Heritage',
    approvedDenominations: ['reformed', 'anglican'],
    description: 'The historic Bible of John Knox, Oliver Cromwell, the Westminster Divines, and the Mayflower Pilgrims.'
  },
  {
    id: 'NASB',
    apiCode: 'NASB',
    name: 'New American Standard Bible',
    year: '1995',
    philosophy: 'Strict Literal Equivalence',
    badge: 'Academic Gold Standard',
    approvedDenominations: ['reformed', 'baptist_evangelical', 'lutheran'],
    description: 'Renowned in theological seminaries as the most precise word-for-word modern English translation for detailed grammatical exegesis.'
  },
  {
    id: 'BSB',
    apiCode: 'BSB',
    name: 'Berean Standard Bible',
    year: '2020',
    philosophy: 'Optimal Literal & Readable',
    badge: 'Berea Namesake Edition',
    approvedDenominations: ['reformed', 'baptist_evangelical', 'lutheran', 'wesleyan', 'anglican'],
    description: 'Inspired by the Bereans of Acts 17:11, balancing strict fidelity to the Hebrew and Greek with transparent English clarity.'
  },
  {
    id: 'LSB',
    apiCode: 'LSB',
    name: 'Legacy Standard Bible',
    year: '2021',
    philosophy: 'Direct Literal Equivalence',
    badge: 'Confessional Literal',
    approvedDenominations: ['reformed', 'baptist_evangelical'],
    description: 'Update of the NASB 1995 preserving strict grammatical consistency and translating the divine name Yahweh in the OT.'
  },

  // Baptist & Evangelical Approved
  {
    id: 'CSB',
    apiCode: 'CSB17',
    name: 'Christian Standard Bible',
    year: '2017',
    philosophy: 'Optimal Equivalence',
    badge: 'Southern Baptist Standard',
    approvedDenominations: ['baptist_evangelical', 'reformed'],
    description: 'The official translation of Lifeway and the Southern Baptist Convention (SBC), optimized for preaching and church life.'
  },
  {
    id: 'NIV',
    apiCode: 'NIV2011',
    name: 'New International Version',
    year: '2011',
    philosophy: 'Balance / Dynamic',
    badge: 'Evangelical Classic',
    approvedDenominations: ['baptist_evangelical', 'wesleyan', 'anglican', 'lutheran', 'reformed'],
    description: 'The most widely read modern English Bible in the world, renowned for clarity and natural readability.'
  },
  {
    id: 'NLT',
    apiCode: 'NLT',
    name: 'New Living Translation',
    year: '2015',
    philosophy: 'Thought-for-Thought',
    badge: 'Contemporary Devotional',
    approvedDenominations: ['baptist_evangelical', 'wesleyan'],
    description: 'Dynamic equivalence translation focused on immediate communicative clarity for discipleship and personal devotions.'
  },

  // Anglican & Episcopalian Approved
  {
    id: 'KJV',
    apiCode: 'KJV',
    name: 'King James Version (Authorized 1611)',
    year: '1611',
    philosophy: 'Formal Equivalence',
    badge: 'Royal Authorized Standard',
    approvedDenominations: ['anglican', 'orthodox', 'reformed', 'lutheran', 'wesleyan', 'baptist_evangelical'],
    description: 'Commissioned by King James I for the Church of England, the historic cornerstone of English Protestantism and liturgy.'
  },
  {
    id: 'NRSV',
    apiCode: 'NRSVCE',
    name: 'New Revised Standard Version',
    year: '1989',
    philosophy: 'Formal Equivalence',
    badge: 'Anglican & Academic Standard',
    approvedDenominations: ['anglican', 'wesleyan'],
    description: 'The authorized standard for liturgical use in the Episcopal Church, Church of England, and academic biblical scholarship.'
  },

  // Wesleyan & Methodist Approved
  {
    id: 'CEB',
    apiCode: 'CEB',
    name: 'Common English Bible',
    year: '2011',
    philosophy: 'Dynamic Equivalence',
    badge: 'Methodist / Wesleyan Standard',
    approvedDenominations: ['wesleyan'],
    description: 'Sponsored by the United Methodist Publishing House and partners for smooth congregational reading and ecumenical clarity.'
  },

  // Study & Open Access
  {
    id: 'NET',
    apiCode: 'NET',
    name: 'New English Translation',
    year: '2007',
    philosophy: 'Transparent Scholarly Equivalence',
    badge: 'Scholarly Exegetical',
    approvedDenominations: ['reformed', 'baptist_evangelical', 'anglican'],
    description: 'Created by premier biblical language scholars with comprehensive translator notes on Hebrew and Greek syntax.'
  },
  {
    id: 'WEB',
    apiCode: 'WEB',
    name: 'World English Bible',
    year: '2000',
    philosophy: 'Modern Literal (Public Domain)',
    badge: 'Open Access Standard',
    approvedDenominations: ['baptist_evangelical', 'reformed', 'lutheran', 'wesleyan', 'anglican'],
    description: 'Modern literal update of the American Standard Version, freely available and open for universal study.'
  },
  {
    id: 'ASV',
    apiCode: 'ASV',
    name: 'American Standard Version',
    year: '1901',
    philosophy: 'Historic Literal',
    badge: 'Historical Benchmark',
    approvedDenominations: ['lutheran', 'reformed', 'baptist_evangelical'],
    description: 'The landmark 1901 American revision prized for strict word-for-word fidelity.'
  }
];

export type TranslationId = string;

export interface TranslationColorTheme {
  primary: string;    // vibrant accent hex
  bg: string;         // soft tinted background
  border: string;     // border color matching tone
  badgeBg: string;    // badge solid / deep background
  badgeText: string;  // badge text contrast
  text: string;       // deep readable header / label text
}

export const TRANSLATION_COLORS: Record<string, TranslationColorTheme> = {
  // Catholic Editions - Rich Purples, Crimson, Deep Golds & Violets
  NABRE: {
    primary: '#7C3AED', // Vibrant Violet
    bg: '#F5F3FF',
    border: '#DDD6FE',
    badgeBg: '#7C3AED',
    badgeText: '#FFFFFF',
    text: '#5B21B6'
  },
  RSVCE: {
    primary: '#9333EA', // Deep Purple
    bg: '#FAF5FF',
    border: '#E9D5FF',
    badgeBg: '#9333EA',
    badgeText: '#FFFFFF',
    text: '#6B21A8'
  },
  NRSVCE: {
    primary: '#C026D3', // Vibrant Fuchsia
    bg: '#FDF4FF',
    border: '#F5D0FE',
    badgeBg: '#C026D3',
    badgeText: '#FFFFFF',
    text: '#86198F'
  },
  DRB: {
    primary: '#BE123C', // Cardinal Rose / Crimson
    bg: '#FFF1F2',
    border: '#FECDD3',
    badgeBg: '#BE123C',
    badgeText: '#FFFFFF',
    text: '#881337'
  },
  NJB: {
    primary: '#D97706', // Imperial Amber
    bg: '#FFFBEB',
    border: '#FDE68A',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
    text: '#92400E'
  },

  // Orthodox Editions - Byzantine Imperial Gold & Cobalt
  NKJV: {
    primary: '#B45309', // Byzantine Gold / Bronze
    bg: '#FEF3C7',
    border: '#FCD34D',
    badgeBg: '#B45309',
    badgeText: '#FFFFFF',
    text: '#78350F'
  },
  RSV: {
    primary: '#2563EB', // Royal Blue
    bg: '#EFF6FF',
    border: '#BFDBFE',
    badgeBg: '#2563EB',
    badgeText: '#FFFFFF',
    text: '#1E40AF'
  },

  // Reformed & Puritan Standards - Teal, Emerald, Navy & Cyan
  ESV: {
    primary: '#0D9488', // Deep Teal
    bg: '#F0FDFA',
    border: '#99F6E4',
    badgeBg: '#0D9488',
    badgeText: '#FFFFFF',
    text: '#115E59'
  },
  GENEVA: {
    primary: '#854D0E', // Historic Sepia / Bronze
    bg: '#FEFCE8',
    border: '#FEF08A',
    badgeBg: '#854D0E',
    badgeText: '#FFFFFF',
    text: '#713F12'
  },
  NASB: {
    primary: '#0284C7', // Vivid Sky / Ocean Blue
    bg: '#F0F9FF',
    border: '#BAE6FD',
    badgeBg: '#0284C7',
    badgeText: '#FFFFFF',
    text: '#0369A1'
  },
  BSB: {
    primary: '#B4793D', // Berea Signature Warm Caramel
    bg: '#FAF5ED',
    border: '#E8D7C3',
    badgeBg: '#B4793D',
    badgeText: '#FFFFFF',
    text: '#78471F'
  },
  LSB: {
    primary: '#059669', // Emerald Green
    bg: '#ECFDF5',
    border: '#A7F3D0',
    badgeBg: '#059669',
    badgeText: '#FFFFFF',
    text: '#065F46'
  },

  // Baptist & Evangelical Standards - Coral, Red, Orange
  CSB: {
    primary: '#EA580C', // Vibrant Tangerine
    bg: '#FFF7ED',
    border: '#FED7AA',
    badgeBg: '#EA580C',
    badgeText: '#FFFFFF',
    text: '#9A3412'
  },
  NIV: {
    primary: '#16A34A', // Vibrant Kelly Green
    bg: '#F0FDF4',
    border: '#BBF7D0',
    badgeBg: '#16A34A',
    badgeText: '#FFFFFF',
    text: '#166534'
  },
  NLT: {
    primary: '#E11D48', // Electric Coral Pink
    bg: '#FFF1F2',
    border: '#FECDD3',
    badgeBg: '#E11D48',
    badgeText: '#FFFFFF',
    text: '#9F1239'
  },

  // Anglican & Historic Classics - Crimson Ruby & Indigo
  KJV: {
    primary: '#DC2626', // Majestic Scarlet Ruby
    bg: '#FEF2F2',
    border: '#FECACA',
    badgeBg: '#DC2626',
    badgeText: '#FFFFFF',
    text: '#991B1B'
  },
  NRSV: {
    primary: '#4F46E5', // Deep Indigo
    bg: '#EEF2FF',
    border: '#C7D2FE',
    badgeBg: '#4F46E5',
    badgeText: '#FFFFFF',
    text: '#3730A3'
  },

  // Methodists / Open Standards - Cyan, Lime, Electric Blue, Steel
  CEB: {
    primary: '#0891B2', // Vivid Cyan
    bg: '#ECFEFF',
    border: '#A5F3FC',
    badgeBg: '#0891B2',
    badgeText: '#FFFFFF',
    text: '#155E75'
  },
  NET: {
    primary: '#65A30D', // Olive Lime
    bg: '#F7FEE7',
    border: '#D9F99D',
    badgeBg: '#65A30D',
    badgeText: '#FFFFFF',
    text: '#3F6212'
  },
  WEB: {
    primary: '#06B6D4', // Pacific Turquoise
    bg: '#ECFEFF',
    border: '#CFFAFE',
    badgeBg: '#06B6D4',
    badgeText: '#FFFFFF',
    text: '#0E7490'
  },
  ASV: {
    primary: '#475569', // Historic Slate
    bg: '#F8FAFC',
    border: '#E2E8F0',
    badgeBg: '#475569',
    badgeText: '#FFFFFF',
    text: '#1E293B'
  }
};

export const DEFAULT_TRANSLATION_COLOR: TranslationColorTheme = {
  primary: '#B4793D',
  bg: '#FAF5ED',
  border: '#E8D7C3',
  badgeBg: '#B4793D',
  badgeText: '#FFFFFF',
  text: '#78471F'
};

export function getTranslationColor(id: string): TranslationColorTheme {
  return TRANSLATION_COLORS[id] || DEFAULT_TRANSLATION_COLOR;
}

export function getApprovedTranslationsForDenomination(lens: DenominationalLens): TranslationInfo[] {
  return TRANSLATIONS.filter(t => t.approvedDenominations.includes(lens));
}

export function getDefaultTranslationForDenomination(lens: DenominationalLens): TranslationId {
  switch (lens) {
    case 'catholic':
      return 'NABRE';
    case 'orthodox':
      return 'NKJV';
    case 'reformed':
      return 'ESV';
    case 'lutheran':
      return 'ESV';
    case 'wesleyan':
      return 'NRSV';
    case 'anglican':
      return 'KJV';
    case 'baptist_evangelical':
      return 'CSB';
    default:
      return 'ESV';
  }
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament (1–39)
  { id: 'genesis', name: 'Genesis', abbreviation: 'Gen', testament: 'OT', category: 'Law', chaptersCount: 50, author: 'Moses', dateWritten: 'c. 1440 BC', theme: 'Creation, Fall, and the Covenant Patriarchs', keyVerse: 'Genesis 12:2-3' },
  { id: 'exodus', name: 'Exodus', abbreviation: 'Exo', testament: 'OT', category: 'Law', chaptersCount: 40, author: 'Moses', dateWritten: 'c. 1440 BC', theme: 'Deliverance from Egypt and the Law at Sinai', keyVerse: 'Exodus 19:5-6' },
  { id: 'leviticus', name: 'Leviticus', abbreviation: 'Lev', testament: 'OT', category: 'Law', chaptersCount: 27, author: 'Moses', dateWritten: 'c. 1440 BC', theme: 'Holiness, Priesthood, and Atoning Sacrifices', keyVerse: 'Leviticus 19:2' },
  { id: 'numbers', name: 'Numbers', abbreviation: 'Num', testament: 'OT', category: 'Law', chaptersCount: 36, author: 'Moses', dateWritten: 'c. 1400 BC', theme: 'Wilderness Wanderings and Divine Faithfulness', keyVerse: 'Numbers 6:24-26' },
  { id: 'deuteronomy', name: 'Deuteronomy', abbreviation: 'Deu', testament: 'OT', category: 'Law', chaptersCount: 34, author: 'Moses', dateWritten: 'c. 1400 BC', theme: 'Renewal of the Covenant and the Shema', keyVerse: 'Deuteronomy 6:4-5' },
  
  { id: 'joshua', name: 'Joshua', abbreviation: 'Jos', testament: 'OT', category: 'History', chaptersCount: 24, author: 'Joshua', dateWritten: 'c. 1375 BC', theme: 'Conquest and Division of the Promised Land', keyVerse: 'Joshua 1:9' },
  { id: 'judges', name: 'Judges', abbreviation: 'Jdg', testament: 'OT', category: 'History', chaptersCount: 21, author: 'Samuel', dateWritten: 'c. 1050 BC', theme: 'Cycles of Rebellion, Oppression, and Deliverance', keyVerse: 'Judges 21:25' },
  { id: 'ruth', name: 'Ruth', abbreviation: 'Rut', testament: 'OT', category: 'History', chaptersCount: 4, author: 'Samuel', dateWritten: 'c. 1000 BC', theme: 'Kinsman Redeemer and Loyal Covenant Love (Hesed)', keyVerse: 'Ruth 1:16-17' },
  { id: '1samuel', name: '1 Samuel', abbreviation: '1Sa', testament: 'OT', category: 'History', chaptersCount: 31, author: 'Samuel / Nathan / Gad', dateWritten: 'c. 930 BC', theme: 'Transition from Theocracy to Monarchy; Saul and David', keyVerse: '1 Samuel 16:7' },
  { id: '2samuel', name: '2 Samuel', abbreviation: '2Sa', testament: 'OT', category: 'History', chaptersCount: 24, author: 'Nathan / Gad', dateWritten: 'c. 930 BC', theme: 'The Reign of King David and the Davidic Covenant', keyVerse: '2 Samuel 7:16' },
  { id: '1kings', name: '1 Kings', abbreviation: '1Ki', testament: 'OT', category: 'History', chaptersCount: 22, author: 'Jeremiah', dateWritten: 'c. 550 BC', theme: 'Solomon’s Temple, the Divided Kingdom, and Elijah', keyVerse: '1 Kings 8:23' },
  { id: '2kings', name: '2 Kings', abbreviation: '2Ki', testament: 'OT', category: 'History', chaptersCount: 25, author: 'Jeremiah', dateWritten: 'c. 550 BC', theme: 'Fall of Israel and Judah; Exile in Babylon', keyVerse: '2 Kings 17:13-14' },
  { id: '1chronicles', name: '1 Chronicles', abbreviation: '1Ch', testament: 'OT', category: 'History', chaptersCount: 29, author: 'Ezra', dateWritten: 'c. 450 BC', theme: 'Genealogies and David’s Preparations for the Temple', keyVerse: '1 Chronicles 29:11' },
  { id: '2chronicles', name: '2 Chronicles', abbreviation: '2Ch', testament: 'OT', category: 'History', chaptersCount: 36, author: 'Ezra', dateWritten: 'c. 450 BC', theme: 'Temple Worship, Reforms of the Kings of Judah', keyVerse: '2 Chronicles 7:14' },
  { id: 'ezra', name: 'Ezra', abbreviation: 'Ezr', testament: 'OT', category: 'History', chaptersCount: 10, author: 'Ezra', dateWritten: 'c. 440 BC', theme: 'Return from Exile and Rebuilding the Second Temple', keyVerse: 'Ezra 7:10' },
  { id: 'nehemiah', name: 'Nehemiah', abbreviation: 'Neh', testament: 'OT', category: 'History', chaptersCount: 13, author: 'Nehemiah', dateWritten: 'c. 430 BC', theme: 'Rebuilding the Walls of Jerusalem and Spiritual Renewal', keyVerse: 'Nehemiah 8:10' },
  { id: 'esther', name: 'Esther', abbreviation: 'Est', testament: 'OT', category: 'History', chaptersCount: 10, author: 'Mordecai', dateWritten: 'c. 460 BC', theme: 'God’s Providential Preservation of His People in Persia', keyVerse: 'Esther 4:14' },

  { id: 'job', name: 'Job', abbreviation: 'Job', testament: 'OT', category: 'Poetry', chaptersCount: 42, author: 'Unknown', dateWritten: 'c. 2000–1000 BC', theme: 'Sovereignty of God in the Face of Suffering', keyVerse: 'Job 19:25' },
  { id: 'psalms', name: 'Psalms', abbreviation: 'Psa', testament: 'OT', category: 'Poetry', chaptersCount: 150, author: 'David, Asaph, Sons of Korah, Moses', dateWritten: 'c. 1400–450 BC', theme: 'Praise, Lament, Trust, and Messianic Hope', keyVerse: 'Psalm 119:105' },
  { id: 'proverbs', name: 'Proverbs', abbreviation: 'Pro', testament: 'OT', category: 'Wisdom', chaptersCount: 31, author: 'Solomon, Agur, Lemuel', dateWritten: 'c. 950 BC', theme: 'Wisdom Grounded in the Fear of the Lord', keyVerse: 'Proverbs 3:5-6' },
  { id: 'ecclesiastes', name: 'Ecclesiastes', abbreviation: 'Ecc', testament: 'OT', category: 'Wisdom', chaptersCount: 12, author: 'Solomon (Qoheleth)', dateWritten: 'c. 935 BC', theme: 'Life "Under the Sun" and Finding True Meaning in God', keyVerse: 'Ecclesiastes 12:13' },
  { id: 'songofsolomon', name: 'Song of Solomon', abbreviation: 'Sng', testament: 'OT', category: 'Poetry', chaptersCount: 8, author: 'Solomon', dateWritten: 'c. 960 BC', theme: 'The Beauty of Covenantal Marital Love and Divine Affection', keyVerse: 'Song of Solomon 8:6-7' },

  { id: 'isaiah', name: 'Isaiah', abbreviation: 'Isa', testament: 'OT', category: 'Major Prophets', chaptersCount: 66, author: 'Isaiah', dateWritten: 'c. 700 BC', theme: 'The Holy One of Israel and the Suffering Servant Messiah', keyVerse: 'Isaiah 53:5-6' },
  { id: 'jeremiah', name: 'Jeremiah', abbreviation: 'Jer', testament: 'OT', category: 'Major Prophets', chaptersCount: 52, author: 'Jeremiah', dateWritten: 'c. 585 BC', theme: 'Judgment on Judah and the Promise of the New Covenant', keyVerse: 'Jeremiah 31:31-33' },
  { id: 'lamentations', name: 'Lamentations', abbreviation: 'Lam', testament: 'OT', category: 'Poetry', chaptersCount: 5, author: 'Jeremiah', dateWritten: 'c. 586 BC', theme: 'Grief Over the Fall of Jerusalem; Great is God’s Faithfulness', keyVerse: 'Lamentations 3:22-23' },
  { id: 'ezekiel', name: 'Ezekiel', abbreviation: 'Ezk', testament: 'OT', category: 'Major Prophets', chaptersCount: 48, author: 'Ezekiel', dateWritten: 'c. 570 BC', theme: 'The Glory of God, Valley of Dry Bones, and the New Temple', keyVerse: 'Ezekiel 36:26' },
  { id: 'daniel', name: 'Daniel', abbreviation: 'Dan', testament: 'OT', category: 'Major Prophets', chaptersCount: 12, author: 'Daniel', dateWritten: 'c. 530 BC', theme: 'God’s Rule Over World Empires and the Son of Man', keyVerse: 'Daniel 7:13-14' },

  { id: 'hosea', name: 'Hosea', abbreviation: 'Hos', testament: 'OT', category: 'Minor Prophets', chaptersCount: 14, author: 'Hosea', dateWritten: 'c. 715 BC', theme: 'Unfailing Love for an Unfaithful Bride', keyVerse: 'Hosea 6:6' },
  { id: 'joel', name: 'Joel', abbreviation: 'Jol', testament: 'OT', category: 'Minor Prophets', chaptersCount: 3, author: 'Joel', dateWritten: 'c. 835 BC', theme: 'The Day of the Lord and the Outpouring of the Spirit', keyVerse: 'Joel 2:28' },
  { id: 'amos', name: 'Amos', abbreviation: 'Amo', testament: 'OT', category: 'Minor Prophets', chaptersCount: 9, author: 'Amos', dateWritten: 'c. 760 BC', theme: 'Social Justice, Righteousness, and Divine Accountability', keyVerse: 'Amos 5:24' },
  { id: 'obadiah', name: 'Obadiah', abbreviation: 'Oba', testament: 'OT', category: 'Minor Prophets', chaptersCount: 1, author: 'Obadiah', dateWritten: 'c. 586 BC', theme: 'Judgment on Edom for Oppressing Israel', keyVerse: 'Obadiah 1:15' },
  { id: 'jonah', name: 'Jonah', abbreviation: 'Jon', testament: 'OT', category: 'Minor Prophets', chaptersCount: 4, author: 'Jonah', dateWritten: 'c. 760 BC', theme: 'God’s Boundless Mercy for the Nations', keyVerse: 'Jonah 4:2' },
  { id: 'micah', name: 'Micah', abbreviation: 'Mic', testament: 'OT', category: 'Minor Prophets', chaptersCount: 7, author: 'Micah', dateWritten: 'c. 700 BC', theme: 'Ruler Born in Bethlehem; Act Justly, Love Mercy', keyVerse: 'Micah 6:8' },
  { id: 'nahum', name: 'Nahum', abbreviation: 'Nam', testament: 'OT', category: 'Minor Prophets', chaptersCount: 3, author: 'Nahum', dateWritten: 'c. 650 BC', theme: 'Judgment and Destruction of Nineveh', keyVerse: 'Nahum 1:7' },
  { id: 'habakkuk', name: 'Habakkuk', abbreviation: 'Hab', testament: 'OT', category: 'Minor Prophets', chaptersCount: 3, author: 'Habakkuk', dateWritten: 'c. 605 BC', theme: 'Questioning God’s Ways: The Just Shall Live by Faith', keyVerse: 'Habakkuk 2:4' },
  { id: 'zephaniah', name: 'Zephaniah', abbreviation: 'Zep', testament: 'OT', category: 'Minor Prophets', chaptersCount: 3, author: 'Zephaniah', dateWritten: 'c. 625 BC', theme: 'The Great Day of the Lord and the Singing Savior', keyVerse: 'Zephaniah 3:17' },
  { id: 'haggai', name: 'Haggai', abbreviation: 'Hag', testament: 'OT', category: 'Minor Prophets', chaptersCount: 2, author: 'Haggai', dateWritten: 'c. 520 BC', theme: 'Rebuilding the House of the Lord', keyVerse: 'Haggai 1:8' },
  { id: 'zechariah', name: 'Zechariah', abbreviation: 'Zec', testament: 'OT', category: 'Minor Prophets', chaptersCount: 14, author: 'Zechariah', dateWritten: 'c. 520 BC', theme: 'Visions of the Messianic King and Future Glory', keyVerse: 'Zechariah 9:9' },
  { id: 'malachi', name: 'Malachi', abbreviation: 'Mal', testament: 'OT', category: 'Minor Prophets', chaptersCount: 4, author: 'Malachi', dateWritten: 'c. 430 BC', theme: 'Call to Faithfulness and the Coming Messenger of the Covenant', keyVerse: 'Malachi 4:2' },

  // Deuterocanonical / Apocrypha (Catholic & Orthodox Canon)
  { id: 'tobit', name: 'Tobit', abbreviation: 'Tob', testament: 'OT', category: 'History', chaptersCount: 14, author: 'Tobit / Tobias', dateWritten: 'c. 200 BC', theme: 'Faithfulness in Exile, Angelic Guidance, and Divine Healing', keyVerse: 'Tobit 12:15' },
  { id: 'judith', name: 'Judith', abbreviation: 'Jdt', testament: 'OT', category: 'History', chaptersCount: 16, author: 'Unknown', dateWritten: 'c. 150 BC', theme: 'Courageous Faith, Overcoming Oppression, and Victory by a Woman', keyVerse: 'Judith 13:18' },
  { id: 'wisdom', name: 'Wisdom of Solomon', abbreviation: 'Wis', testament: 'OT', category: 'Wisdom', chaptersCount: 19, author: 'Solomon (traditional) / Hellenistic Sage', dateWritten: 'c. 50 BC', theme: 'The Immortality of the Soul, Divine Wisdom, and the Righteous Sufferer', keyVerse: 'Wisdom 2:12-20' },
  { id: 'sirach', name: 'Sirach', abbreviation: 'Sir', testament: 'OT', category: 'Wisdom', chaptersCount: 51, author: 'Jesus ben Sira', dateWritten: 'c. 180 BC', theme: 'Living Wisdom Grounded in the Fear of the Lord and Sacred Tradition', keyVerse: 'Sirach 24:8-10' },
  { id: 'baruch', name: 'Baruch', abbreviation: 'Bar', testament: 'OT', category: 'Major Prophets', chaptersCount: 6, author: 'Baruch son of Neriah', dateWritten: 'c. 150 BC', theme: 'Repentance in Exile, Divine Wisdom on Earth, and Restoration of Jerusalem', keyVerse: 'Baruch 3:37' },
  { id: '1maccabees', name: '1 Maccabees', abbreviation: '1Ma', testament: 'OT', category: 'History', chaptersCount: 16, author: 'Jewish Historian', dateWritten: 'c. 100 BC', theme: 'Zeal for the Covenant, the Maccabean Revolt, and Temple Purification', keyVerse: '1 Maccabees 4:56-59' },
  { id: '2maccabees', name: '2 Maccabees', abbreviation: '2Ma', testament: 'OT', category: 'History', chaptersCount: 15, author: 'Jason of Cyrene / Epitomist', dateWritten: 'c. 120 BC', theme: 'The Seven Holy Martyrs, Bodily Resurrection, and Prayers for the Dead', keyVerse: '2 Maccabees 7:9' },

  // New Testament (40–66)
  { id: 'matthew', name: 'Matthew', abbreviation: 'Mat', testament: 'NT', category: 'Gospels', chaptersCount: 28, author: 'Matthew', dateWritten: 'c. AD 60–70', theme: 'Jesus as King and Fulfillment of Prophecy', keyVerse: 'Matthew 28:19-20' },
  { id: 'mark', name: 'Mark', abbreviation: 'Mrk', testament: 'NT', category: 'Gospels', chaptersCount: 16, author: 'John Mark', dateWritten: 'c. AD 55–65', theme: 'Jesus as the Suffering Servant who Gives His Life', keyVerse: 'Mark 10:45' },
  { id: 'luke', name: 'Luke', abbreviation: 'Luk', testament: 'NT', category: 'Gospels', chaptersCount: 24, author: 'Luke the Physician', dateWritten: 'c. AD 60–62', theme: 'The Son of Man Seeking and Saving the Lost', keyVerse: 'Luke 19:10' },
  { id: 'john', name: 'John', abbreviation: 'Jhn', testament: 'NT', category: 'Gospels', chaptersCount: 21, author: 'John the Apostle', dateWritten: 'c. AD 85–95', theme: 'Jesus as the Divine Son of God who brings Eternal Life', keyVerse: 'John 20:31' },
  { id: 'acts', name: 'Acts', abbreviation: 'Act', testament: 'NT', category: 'History', chaptersCount: 28, author: 'Luke', dateWritten: 'c. AD 62–64', theme: 'The Holy Spirit Empowering the Church (including Berea)', keyVerse: 'Acts 1:8' },

  { id: 'romans', name: 'Romans', abbreviation: 'Rom', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 16, author: 'Apostle Paul', dateWritten: 'c. AD 57', theme: 'The Righteousness of God Revealed through Faith in Christ', keyVerse: 'Romans 1:16-17' },
  { id: '1corinthians', name: '1 Corinthians', abbreviation: '1Co', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 16, author: 'Apostle Paul', dateWritten: 'c. AD 55', theme: 'Overcoming Divisions, Spiritual Gifts, and the Resurrection', keyVerse: '1 Corinthians 13:13' },
  { id: '2corinthians', name: '2 Corinthians', abbreviation: '2Co', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 13, author: 'Apostle Paul', dateWritten: 'c. AD 56', theme: 'Strength in Weakness and Ministry of Reconciliation', keyVerse: '2 Corinthians 12:9' },
  { id: 'galatians', name: 'Galatians', abbreviation: 'Gal', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 6, author: 'Apostle Paul', dateWritten: 'c. AD 49', theme: 'Freedom in Christ and Justification by Faith Alone', keyVerse: 'Galatians 5:1' },
  { id: 'ephesians', name: 'Ephesians', abbreviation: 'Eph', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 6, author: 'Apostle Paul', dateWritten: 'c. AD 60–62', theme: 'The Mystery of Christ and the Church Walking in Grace', keyVerse: 'Ephesians 2:8-9' },
  { id: 'philippians', name: 'Philippians', abbreviation: 'Php', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 4, author: 'Apostle Paul', dateWritten: 'c. AD 61', theme: 'Joy and Unity in Christ despite Circumstances', keyVerse: 'Philippians 4:4' },
  { id: 'colossians', name: 'Colossians', abbreviation: 'Col', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 4, author: 'Apostle Paul', dateWritten: 'c. AD 61', theme: 'The Absolute Supremacy and Preeminence of Christ', keyVerse: 'Colossians 1:18' },
  { id: '1thessalonians', name: '1 Thessalonians', abbreviation: '1Th', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 5, author: 'Apostle Paul', dateWritten: 'c. AD 51', theme: 'Encouragement, Holy Living, and the Second Coming', keyVerse: '1 Thessalonians 4:16-17' },
  { id: '2thessalonians', name: '2 Thessalonians', abbreviation: '2Th', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 3, author: 'Apostle Paul', dateWritten: 'c. AD 51', theme: 'Steadfastness in Persecution and the Day of the Lord', keyVerse: '2 Thessalonians 2:15' },
  { id: '1timothy', name: '1 Timothy', abbreviation: '1Ti', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 6, author: 'Apostle Paul', dateWritten: 'c. AD 64', theme: 'Sound Doctrine and Church Leadership', keyVerse: '1 Timothy 3:15' },
  { id: '2timothy', name: '2 Timothy', abbreviation: '2Ti', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 4, author: 'Apostle Paul', dateWritten: 'c. AD 66', theme: 'Faithfulness to the Word and Finishing the Race', keyVerse: '2 Timothy 3:16-17' },
  { id: 'titus', name: 'Titus', abbreviation: 'Tit', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 3, author: 'Apostle Paul', dateWritten: 'c. AD 64', theme: 'Good Works Rooted in Transforming Grace', keyVerse: 'Titus 2:11-12' },
  { id: 'philemon', name: 'Philemon', abbreviation: 'Phm', testament: 'NT', category: 'Pauline Epistles', chaptersCount: 1, author: 'Apostle Paul', dateWritten: 'c. AD 61', theme: 'Forgiveness and Brotherly Reconciliation in Christ', keyVerse: 'Philemon 1:16' },

  { id: 'hebrews', name: 'Hebrews', abbreviation: 'Heb', testament: 'NT', category: 'General Epistles', chaptersCount: 13, author: 'Unknown (Pauline associate)', dateWritten: 'c. AD 65–69', theme: 'Jesus as Better: Superior High Priest and New Covenant', keyVerse: 'Hebrews 12:1-2' },
  { id: 'james', name: 'James', abbreviation: 'Jas', testament: 'NT', category: 'General Epistles', chaptersCount: 5, author: 'James the Brother of Jesus', dateWritten: 'c. AD 45–48', theme: 'Living Faith Demonstrated through Works and Wisdom', keyVerse: 'James 2:26' },
  { id: '1peter', name: '1 Peter', abbreviation: '1Pe', testament: 'NT', category: 'General Epistles', chaptersCount: 5, author: 'Peter the Apostle', dateWritten: 'c. AD 64', theme: 'Living Hope and Holiness amidst Suffering', keyVerse: '1 Peter 1:3' },
  { id: '2peter', name: '2 Peter', abbreviation: '2Pe', testament: 'NT', category: 'General Epistles', chaptersCount: 3, author: 'Peter the Apostle', dateWritten: 'c. AD 66', theme: 'Growing in Grace and Guarding against False Teachers', keyVerse: '2 Peter 3:18' },
  { id: '1john', name: '1 John', abbreviation: '1Jn', testament: 'NT', category: 'General Epistles', chaptersCount: 5, author: 'John the Apostle', dateWritten: 'c. AD 90', theme: 'Fellowship with God: Walking in Light and Love', keyVerse: '1 John 5:13' },
  { id: '2john', name: '2 John', abbreviation: '2Jn', testament: 'NT', category: 'General Epistles', chaptersCount: 1, author: 'John the Apostle', dateWritten: 'c. AD 90', theme: 'Walking in Truth and Love', keyVerse: '2 John 1:6' },
  { id: '3john', name: '3 John', abbreviation: '3Jn', testament: 'NT', category: 'General Epistles', chaptersCount: 1, author: 'John the Apostle', dateWritten: 'c. AD 90', theme: 'Hospitality and Support for Fellow Workers for the Truth', keyVerse: '3 John 1:8' },
  { id: 'jude', name: 'Jude', abbreviation: 'Jud', testament: 'NT', category: 'General Epistles', chaptersCount: 1, author: 'Jude the Brother of James', dateWritten: 'c. AD 65', theme: 'Contending Earnestly for the Faith', keyVerse: 'Jude 1:24-25' },
  { id: 'revelation', name: 'Revelation', abbreviation: 'Rev', testament: 'NT', category: 'Prophecy', chaptersCount: 22, author: 'John the Apostle', dateWritten: 'c. AD 95', theme: 'The Final Triumph of the Lamb, Renewal of All Creation', keyVerse: 'Revelation 21:3-4' }
];

export function getBook(bookId: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.id.toLowerCase() === bookId.toLowerCase() || b.name.toLowerCase() === bookId.toLowerCase());
}

export function getChapter(bookId: string, chapterNum: number): Chapter {
  const book = getBook(bookId) || BIBLE_BOOKS[0];
  if (book && book.chapters && book.chapters[chapterNum]) {
    return book.chapters[chapterNum];
  }

  // Generate clean default chapter structure with 15 verses while live YouVersion API resolves
  const verseCount = 15;
  const mockVerses: Verse[] = [];
  for (let i = 1; i <= verseCount; i++) {
    mockVerses.push({
      verseNumber: i,
      text: {
        KJV: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        ESV: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        NIV: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        NLT: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        NASB: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`,
        CSB: `[${book.name} ${chapterNum}:${i}] Loading scripture from YouVersion API...`
      }
    });
  }

  return {
    chapterNumber: chapterNum,
    summary: `Reading the inspired text of ${book.name} ${chapterNum}.`,
    verses: mockVerses,
    locationKey: 'jerusalem'
  };
}
