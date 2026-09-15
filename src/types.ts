export interface SupportingPassage {
  ref: string;
  text?: string;
  note?: string;
}

export interface StudyGuide {
  id: string;
  passageRef: string;
  contextSnapshot: string;
  icebreakers: string[];
  deepPrompts: string[];
  application: string;
  createdAt: number;
  confessionCited?: string;
  originalLanguageNote?: string;
  supportingPassages?: SupportingPassage[];
}

export type BereaAiTab = 'overview' | 'chat' | 'compare' | 'map' | 'studyGuide';

