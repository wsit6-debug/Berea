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

export type BereaAiTab = 'overview' | 'chat' | 'compare' | 'map' | 'studyGuide' | 'quiz' | 'typology';

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
