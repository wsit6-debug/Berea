import { BUILTIN_LOCAL_MODEL } from './webLlmService';

export interface AiConfig {
  model: string;
  isEnabled: boolean;
}

export function getAiConfig(): AiConfig {
  return {
    model: BUILTIN_LOCAL_MODEL,
    isEnabled: true
  };
}
