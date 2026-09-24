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

export interface GenerateLocalOptions {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
}

export async function generateLocalAiResponse(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  onProgress?: (progress: { text: string; progress: number }) => void,
  skipDeduplication: boolean = false,
  options?: GenerateLocalOptions
): Promise<string> {
  const temperature = options?.temperature ?? 0.6;
  const top_p = options?.top_p ?? 0.9;
  const max_tokens = options?.max_tokens ?? 1200;
  const frequency_penalty = options?.frequency_penalty ?? 0.5;
  const presence_penalty = options?.presence_penalty ?? 0.4;

  // 1. Try local Ollama server if available (e.g. http://localhost:11434)
  try {
    let ollamaRes: Response;
    try {
      ollamaRes = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          messages,
          stream: false,
          options: {
            temperature: Math.min(temperature, 0.2),
            top_p: Math.min(top_p, 0.2)
          }
        })
      });
    } catch (_directErr) {
      // In-browser fallback to Vite proxy in case of direct CORS or network error
      ollamaRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.1',
          messages,
          stream: false,
          options: {
            temperature: Math.min(temperature, 0.2),
            top_p: Math.min(top_p, 0.2)
          }
        })
      });
    }

    if (ollamaRes.ok) {
      const data = await ollamaRes.json();
      if (data.message?.content) {
        return skipDeduplication ? data.message.content : deduplicateRepetitions(data.message.content);
      }
    }
    throw new Error(`Ollama generation failed: ${ollamaRes.status} ${ollamaRes.statusText}`);
  } catch (ollamaErr) {
    // Fall back to in-browser WebLLM engine
    const engine = await getOrInitLocalEngine(onProgress);
    const reply = await engine.chat.completions.create({
      messages,
      temperature,
      top_p,
      frequency_penalty,
      presence_penalty,
      max_tokens
    });

    const rawContent = reply.choices[0]?.message?.content || '';
    return skipDeduplication ? rawContent : deduplicateRepetitions(rawContent);
  }
}

export function isLocalEngineReady(): boolean {
  return !!globalEngine;
}
