export interface StudyGuide {
  id: string;
  passageRef: string;
  contextSnapshot: string;
  icebreakers: string[];
  deepPrompts: string[];
  application: string;
  createdAt: number;
  theologicalThemes?: string[];
  confessionCited?: string;
  originalLanguageNote?: string;
}

export type BereaAiTab = 'overview' | 'chat' | 'compare' | 'map' | 'studyGuide';
