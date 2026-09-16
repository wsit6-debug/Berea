import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const TARGET_MODEL = 'llama3.1';
const OLLAMA_TAGS_URL = 'http://127.0.0.1:11434/api/tags';

let ensurePromise = null;

function findOllamaBinary() {
  const isWin = process.platform === 'win32';
  const whichCmd = isWin ? 'where' : 'which';
  const whichResult = spawnSync(whichCmd, ['ollama']);
  if (whichResult.status === 0) {
    const binPath = whichResult.stdout.toString().split('\n')[0].trim();
    if (binPath && fs.existsSync(binPath)) {
      return binPath;
    }
  }

  const commonPaths = [
    path.join(os.homedir(), '.local', 'bin', isWin ? 'ollama.exe' : 'ollama'),
    '/opt/homebrew/bin/ollama',
    '/usr/local/bin/ollama',
    '/Applications/Ollama.app/Contents/Resources/ollama',
    path.join(os.homedir(), 'Applications', 'Ollama.app', 'Contents', 'Resources', 'ollama'),
    isWin && process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', 'Ollama', 'ollama.exe') : null
  ].filter(Boolean);

  for (const candidate of commonPaths) {
    if (fs.existsSync(candidate)) {
      const dir = path.dirname(candidate);
      if (!process.env.PATH?.split(path.delimiter).includes(dir)) {
        process.env.PATH = `${dir}${path.delimiter}${process.env.PATH || ''}`;
      }
      return candidate;
    }
  }

  return null;
}

async function installOllama() {
  console.log('📦 [Ollama] Ollama is not installed. Installing Ollama automatically...');

  if (process.platform === 'darwin') {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ollama-install-'));
    const zipPath = path.join(tempDir, 'Ollama-darwin.zip');

    try {
      console.log('⬇️ [Ollama] Downloading Ollama for macOS from ollama.com...');
      const dl = spawnSync('curl', ['--fail', '--show-error', '--location', '-o', zipPath, 'https://ollama.com/download/Ollama-darwin.zip'], {
        stdio: 'inherit'
      });
      if (dl.status !== 0) {
        throw new Error('Failed to download Ollama package.');
      }

      console.log('📦 [Ollama] Extracting Ollama...');
      const unzip = spawnSync('unzip', ['-q', zipPath, '-d', tempDir], {
        stdio: 'inherit'
      });
      if (unzip.status !== 0) {
        throw new Error('Failed to extract Ollama package.');
      }

      let appDir = '/Applications';
      try {
        fs.accessSync(appDir, fs.constants.W_OK);
      } catch {
        appDir = path.join(os.homedir(), 'Applications');
        if (!fs.existsSync(appDir)) {
          fs.mkdirSync(appDir, { recursive: true });
        }
      }

      const targetAppPath = path.join(appDir, 'Ollama.app');
      if (fs.existsSync(targetAppPath)) {
        fs.rmSync(targetAppPath, { recursive: true, force: true });
      }
      fs.renameSync(path.join(tempDir, 'Ollama.app'), targetAppPath);

      let binDir = '/usr/local/bin';
      try {
        fs.accessSync(binDir, fs.constants.W_OK);
      } catch {
        binDir = path.join(os.homedir(), '.local', 'bin');
        if (!fs.existsSync(binDir)) {
          fs.mkdirSync(binDir, { recursive: true });
        }
      }

      const binarySrc = path.join(targetAppPath, 'Contents', 'Resources', 'ollama');
      const binaryDest = path.join(binDir, 'ollama');
      try {
        if (fs.existsSync(binaryDest) || fs.lstatSync(binaryDest, { throwIfNoEntry: false })) {
          fs.unlinkSync(binaryDest);
        }
        fs.symlinkSync(binarySrc, binaryDest);
      } catch (linkErr) {
        console.warn('⚠️ [Ollama] Could not create symlink:', linkErr.message);
      }

      if (!process.env.PATH?.split(path.delimiter).includes(binDir)) {
        process.env.PATH = `${binDir}${path.delimiter}${process.env.PATH || ''}`;
      }
      const appBinDir = path.join(targetAppPath, 'Contents', 'Resources');
      if (!process.env.PATH?.split(path.delimiter).includes(appBinDir)) {
        process.env.PATH = `${appBinDir}${path.delimiter}${process.env.PATH || ''}`;
      }
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } else if (process.platform === 'linux') {
    console.log('⬇️ [Ollama] Installing Ollama via official installer script...');
    const res = spawnSync('sh', ['-c', 'curl -fsSL https://ollama.com/install.sh | sh'], {
      stdio: 'inherit'
    });
    if (res.status !== 0) {
      throw new Error('Failed to install Ollama via official script.');
    }
  } else if (process.platform === 'win32') {
    console.log('⬇️ [Ollama] Installing Ollama via winget...');
    const res = spawnSync('winget', ['install', 'Ollama.Ollama', '--accept-source-agreements', '--accept-package-agreements'], {
      stdio: 'inherit'
    });
    if (res.status !== 0) {
      throw new Error('Failed to install Ollama via winget.');
    }
  } else {
    throw new Error(`Unsupported OS platform: ${process.platform}`);
  }

  const binary = findOllamaBinary();
  if (!binary) {
    throw new Error('Ollama installation finished, but "ollama" binary could not be located.');
  }
  console.log(`✅ [Ollama] Successfully installed Ollama at ${binary}.`);
}

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
  if (ensurePromise) return ensurePromise;

  ensurePromise = (async () => {
    try {
      let binary = findOllamaBinary();
      if (!binary) {
        await installOllama();
        binary = findOllamaBinary();
      }

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
    } finally {
      ensurePromise = null;
    }
  })();

  return ensurePromise;
}

// Run directly if invoked as script
const isDirectRun = process.argv[1] && process.argv[1].endsWith('ensure-ollama.mjs');
if (isDirectRun) {
  await ensureOllamaReady();
}
