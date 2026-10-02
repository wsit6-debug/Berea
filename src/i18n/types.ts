export type SupportedLanguage = 
  | 'en' 
  | 'es' 
  | 'fr' 
  | 'de' 
  | 'pt' 
  | 'zh' 
  | 'ko' 
  | 'ja' 
  | 'it' 
  | 'ru' 
  | 'tl' 
  | 'la';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
  { code: 'la', name: 'Latin', nativeName: 'Latin', flag: '🇻🇦' }
];

export interface TranslationSchema {
  appTitle: string;
  appSubtitle: string;
  close: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  search: string;
  loading: string;
  copied: string;
  copy: string;
  all: string;
  reset: string;
  done: string;
  confessionalTraditions: string;
  distinctLenses: string;
  selectConfessionalTradition: string;
  approved: string;
  allTranslations: string;
  approvedOnly: string;
  approvedFor: string;
  searchPlaceholder: string;
  searchTitle: string;
  bookmarks: string;
  bookmarksTooltip: string;
  notepad: string;
  notepadTooltip: string;
  guide: string;
  guideTooltip: string;
  settings: string;
  settingsTooltip: string;
  lockAndLogout: string;
  settingsTitle: string;
  settingsSubtitle: string;
  tabLanguage: string;
  tabColorScheme: string;
  tabFeedback: string;
  languageSelectTitle: string;
  languageSelectDesc: string;
  activeLanguageBadge: string;
  bgAtmosphere: string;
  bgWarmLinen: string;
  bgCrispWhite: string;
  bgSepiaPaper: string;
  bgObsidianDark: string;
  themeStudioTitle: string;
  customizePalette: string;
  resetThemeDefault: string;
  pastoralFeedbackTitle: string;
  welcomeToBerea: string;
  justNow: string;
  bereaAiGuide: string;
  suggestedPromptsFor: string;
  synthesizingExegesis: string;
  georgeFoxUniversity: string;
  beKnown: string;
  beKnownSub: string;
  beKnownPromptText: string;
  beKnownPromptQuery: string;
  explore: string;
  listenNarration: string;
  playingNarration: string;
  pauseNarration: string;
  resumeNarration: string;
  stopNarration: string;
  copyVerse: string;
  bookmarkVerse: string;
  bookmarked: string;
  highlight: string;
  highlighter: string;
  fontSize: string;
  wordsOfJesus: string;
  studyGuide: string;
  takeQuiz: string;
  chapterQuiz: string;
  bookQuiz: string;
  loadingScripture: string;
  selectVerseToBegin: string;
  parallelComparison: string;
  characters: string;
  testamentOT: string;
  testamentNT: string;
  allBooks: string;
  overview: string;
  askAi: string;
  compare: string;
  atlas: string;
  quiz: string;
  typology: string;
  askAssistantPlaceholder: string;
  welcomeAssistantText: string;
  theologicalContext: string;
  confessionalLens: string;
  historicalContext: string;
  generateStudyGuide: string;
  quizTitle: string;
  score: string;
  submitAnswer: string;
  nextQuestion: string;
  congratulations: string;
  personalJournal: string;
  newNoteTab: string;
  generalJournal: string;
  notepadPlaceholder: string;
  clearNote: string;
  exportNotes: string;
  noteSaved: string;
  searchScriptureAndNotes: string;
  searchTypeToFilter: string;
  noResultsFound: string;
  recentSearches: string;
  bookmarkedVersesTitle: string;
  noBookmarksYet: string;
  clearAllBookmarks: string;
  selectPassage: string;
  searchBooksPlaceholder: string;
  chaptersCount: string;
  authPasswordLabel: string;
  authPasswordPlaceholder: string;
  authUnlockButton: string;
  authIncorrectPassword: string;
  authLockedOut: string;
  [key: string]: any;
}
