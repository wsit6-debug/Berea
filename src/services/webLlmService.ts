import { CreateMLCEngine, MLCEngine, InitProgressReport } from '@mlc-ai/web-llm';

export const BUILTIN_LOCAL_MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

let globalEngine: MLCEngine | null = null;
let isInitializing = false;

export function isWebGpuSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

export async function getOrInitLocalEngine(
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<MLCEngine> {
  if (globalEngine) {
    return globalEngine;
  }

  if (isInitializing) {
    throw new Error('Local model is loading. Please wait a moment.');
  }

  if (!isWebGpuSupported()) {
    throw new Error('WebGPU is not supported in this environment.');
  }

  isInitializing = true;

  try {
    const engine = await CreateMLCEngine(BUILTIN_LOCAL_MODEL, {
      initProgressCallback: (report: InitProgressReport) => {
        if (onProgress) {
          onProgress({
            text: report.text,
            progress: Math.round((report.progress || 0) * 100)
          });
        }
      }
    });

    globalEngine = engine;
    isInitializing = false;
    return engine;
  } catch (err) {
    isInitializing = false;
    throw err;
  }
}

/**
 * Deduplicates degenerate repetition loops from small model outputs
 */
export function deduplicateRepetitions(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  const seenParagraphs = new Map<string, number>();
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 25) {
      const count = seenParagraphs.get(trimmed) || 0;
      if (count >= 1) {
        // Stop on first degenerate repetition loop
        break;
      }
      seenParagraphs.set(trimmed, count + 1);
    }
    cleanedLines.push(line);
  }

  return cleanedLines.join('\n').trim();
}

export async function generateLocalAiResponse(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<string> {
  const engine = await getOrInitLocalEngine(onProgress);

  const reply = await engine.chat.completions.create({
    messages,
    temperature: 0.6,
    top_p: 0.9,
    frequency_penalty: 0.5,
    presence_penalty: 0.4,
    max_tokens: 1200
  });

  const rawContent = reply.choices[0]?.message?.content || '';
  return deduplicateRepetitions(rawContent);
}

export function isLocalEngineReady(): boolean {
  return !!globalEngine;
}
