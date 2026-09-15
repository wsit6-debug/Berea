import { spawn, spawnSync } from 'child_process';

const TARGET_MODEL = 'llama3.1';
const OLLAMA_TAGS_URL = 'http://127.0.0.1:11434/api/tags';

async function checkOllamaRunning() {
  try {
    const res = await fetch(OLLAMA_TAGS_URL);
    if (res.ok) {
      const data = await res.json();
      return { running: true, models: data.models || [] };
    }
  } catch (_e) {
    // not running
  }
  return { running: false, models: [] };
}

async function startOllamaServe() {
  console.log('⏳ [Ollama] Ollama server is not running. Starting "ollama serve"...');
  const child = spawn('ollama', ['serve'], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();

  // Poll until it responds
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    const status = await checkOllamaRunning();
    if (status.running) {
      console.log('✅ [Ollama] Ollama server is up and listening on 127.0.0.1:11434.');
      return status.models;
    }
  }
  throw new Error('Timed out waiting for "ollama serve" to start.');
}

async function ensureModel(models) {
  const hasModel = models.some(m => m.name && (m.name === TARGET_MODEL || m.name.startsWith(`${TARGET_MODEL}:`)));
  if (hasModel) {
    console.log(`✅ [Ollama] Model "${TARGET_MODEL}" is already installed and ready.`);
    return;
  }

  console.log(`⬇️ [Ollama] Model "${TARGET_MODEL}" not found. Downloading via "ollama pull ${TARGET_MODEL}"...`);
  const pullResult = spawnSync('ollama', ['pull', TARGET_MODEL], { stdio: 'inherit' });
  if (pullResult.status !== 0) {
    throw new Error(`Failed to pull ${TARGET_MODEL}`);
  }
  console.log(`✅ [Ollama] Successfully downloaded and prepared "${TARGET_MODEL}".`);
}

export async function ensureOllamaReady() {
  try {
    let status = await checkOllamaRunning();
    let models = status.models;
    if (!status.running) {
      models = await startOllamaServe();
    } else {
      console.log('✅ [Ollama] Ollama server is already running.');
    }
    await ensureModel(models);
  } catch (err) {
    console.error('⚠️ [Ollama] Error ensuring Ollama & model:', err.message);
  }
}

// Run directly if invoked as script
const isDirectRun = process.argv[1] && process.argv[1].endsWith('ensure-ollama.mjs');
if (isDirectRun) {
  await ensureOllamaReady();
}
