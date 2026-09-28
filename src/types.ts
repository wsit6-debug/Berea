export type StudyGuideAudience = 'small_group' | 'deep_exegesis' | 'youth_family';

export interface SupportingPassage {
  ref: string;
  text?: string;
  note?: string;
}

export interface StudyGuide {
  id: string;
  passageRef: string;
  startVerse?: number;
  endVerse?: number;
  audience?: StudyGuideAudience;
  contextSnapshot: string;
  icebreakers: string[];
  deepPrompts: string[];
  application: string;
  createdAt: number;
  confessionCited?: string;
  originalLanguageNote?: string;
  supportingPassages?: SupportingPassage[];
}

export type QuizStyle = 'multiple_choice' | 'true_false' | 'written' | 'mixed';

export interface WrittenGradingResult {
  score: number;
  grade: 'Excellent' | 'Good' | 'Needs Review';
  isCorrect: boolean;
  feedback: string;
  biblicalInsights?: string;
  modelAnswer?: string;
}

export type BereaAiTab = 'overview' | 'chat' | 'compare' | 'map' | 'studyGuide' | 'quiz' | 'characters' | 'typology';

export type NoteFontFamily = 'serif' | 'sans' | 'mono' | 'script';
export type NoteFontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

export interface NoteTab {
  id: string;
  title: string;
  content: string;
  book?: string; // e.g. "Genesis", "John" or undefined for general
  chapter?: number; // e.g. 1
  fontFamily?: NoteFontFamily;
  fontSize?: NoteFontSize;
  verseHighlights?: Record<number, 'yellow' | 'green' | 'red' | 'blue'>; // verseNumber -> color
  updatedAt: number;
  createdAt: number;
}

export interface NotepadState {
  tabs: NoteTab[];
  activeTabId: string;
  globalFontFamily: NoteFontFamily;
  globalFontSize: NoteFontSize;
}

export interface TypologyNode {
  era: 'Creation & Patriarchs' | 'Exodus & Kingdom' | 'Prophets' | 'Gospels' | 'Acts & Epistles' | 'Revelation';
  reference: string;
  event: string;
  significance: string;
}

export interface TypologyMotif {
  motif: string;
  nodes: TypologyNode[];
  summary: string;
}
