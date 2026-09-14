/**
 * Universal Studio Audio Narration Engine for Berea
 * 100% Native compatibility with Safari (macOS & iOS), Chrome, Firefox, Edge.
 * Zero network dependencies, zero 403 errors, zero WebAssembly crashes.
 */

let activeUtterance: SpeechSynthesisUtterance | null = null;
let isAudioActive = false;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesListeners: Array<() => void> = [];
let sharedAudioCtx: AudioContext | null = null;

// Initialize system voices as soon as speech synthesis is ready
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        cachedVoices = v;
        voicesListeners.forEach(fn => fn());
      }
    } catch {
      // ignore
    }
  };

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export interface VoiceOption {
  id: string;
  name: string;
  displayName: string;
  lang: string;
  quality: 'studio' | 'premium' | 'enhanced';
}

/**
 * List of robotic/sluggish legacy voices to strictly avoid
 */
const ROBOTIC_VOICE_BLACKLIST = [
  'junior', 'albert', 'bad news', 'bahh', 'bells', 'boing', 
  'bubbles', 'cellos', 'deranged', 'good news', 'hysterical', 'pipe organ', 
  'trinoids', 'whisper', 'zarvox', 'wobble', 'ralph', 'kathy', 'vicki', 'organ',
  'grandma', 'grandpa', 'jester', 'superstar',
  'microsoft david desktop', 'microsoft zira desktop', 'microsoft hazel desktop'
];

/**
 * Premium system voice ranking preferences
 */
const PRIORITY_VOICE_PATTERNS = [
  { pattern: /\bdaniel\b/i, quality: 'studio' as const, displayName: 'Daniel (Dignified British Narrator)', gender: 'male' },
  { pattern: /\bsamantha\b/i, quality: 'studio' as const, displayName: 'Samantha (Clear & Lively US Studio)', gender: 'female' },
  { pattern: /\bava\b/i, quality: 'studio' as const, displayName: 'Ava (Natural Siri US)', gender: 'female' },
  { pattern: /\bzoe\b/i, quality: 'studio' as const, displayName: 'Zoe (Natural Siri US)', gender: 'female' },
  { pattern: /\bserena\b/i, quality: 'studio' as const, displayName: 'Serena (British Clear Studio)', gender: 'female' },
  { pattern: /\boliver\b/i, quality: 'studio' as const, displayName: 'Oliver (British Natural)', gender: 'male' },
  { pattern: /\bkaren\b/i, quality: 'enhanced' as const, displayName: 'Karen (Warm Australian Narrator)', gender: 'female' },
  { pattern: /\blee\b/i, quality: 'enhanced' as const, displayName: 'Lee (Australian Narrator)', gender: 'male' },
  { pattern: /\bmoira\b/i, quality: 'enhanced' as const, displayName: 'Moira (Gentle Irish Narrator)', gender: 'female' },
  { pattern: /\btessa\b/i, quality: 'enhanced' as const, displayName: 'Tessa (South African Studio)', gender: 'female' },
  { pattern: /\bvictoria\b/i, quality: 'enhanced' as const, displayName: 'Victoria (Classical Formal US)', gender: 'female' },
  { pattern: /\bfiona\b/i, quality: 'enhanced' as const, displayName: 'Fiona (Classical Scottish)', gender: 'female' },
  { pattern: /\bmartha\b/i, quality: 'studio' as const, displayName: 'Martha (Scottish Traditional)', gender: 'female' },
  { pattern: /\barthur\b/i, quality: 'studio' as const, displayName: 'Arthur (British Traditional)', gender: 'male' },
  { pattern: /\bgordon\b/i, quality: 'enhanced' as const, displayName: 'Gordon (Australian Traditional)', gender: 'male' },
  { pattern: /\brishi\b/i, quality: 'enhanced' as const, displayName: 'Rishi (Indian English Studio)', gender: 'male' },
  { pattern: /\bsiri\b/i, quality: 'studio' as const, displayName: 'Apple Siri (Neural Studio Voice)', gender: 'female' },
  { pattern: /google us english/i, quality: 'studio' as const, displayName: 'Google US English (Vibrant)', gender: 'female' },
  { pattern: /google uk english male/i, quality: 'studio' as const, displayName: 'Google UK English (Male)', gender: 'male' },
  { pattern: /google uk english female/i, quality: 'studio' as const, displayName: 'Google UK English (Female)', gender: 'female' }
];

export function subscribeVoicesLoaded(callback: () => void): () => void {
  voicesListeners.push(callback);
  if (cachedVoices.length > 0) {
    callback();
  }
  return () => {
    voicesListeners = voicesListeners.filter(fn => fn !== callback);
  };
}

/**
 * Returns available narration voices from Safari / macOS / Chrome
 */
export function getAvailableVoices(): VoiceOption[] {
  const options: VoiceOption[] = [];

  // 1. Auto Option (Default)
  options.push({
    id: '',
    name: 'auto',
    displayName: '⚡ Auto (Dignified British / Clear US)',
    lang: 'en-US',
    quality: 'studio'
  });

  // 2. Real installed system voices
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const rawVoices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    const englishVoices = (rawVoices || []).filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));

    for (const voice of englishVoices) {
      const vName = voice.name.toLowerCase();
      if (ROBOTIC_VOICE_BLACKLIST.some(b => vName.includes(b))) continue;

      let flag = '🔊';
      if (voice.lang.includes('GB') || voice.lang.includes('UK') || vName.includes('daniel') || vName.includes('oliver') || vName.includes('serena') || vName.includes('george') || vName.includes('arthur')) flag = '🇬🇧';
      else if (voice.lang.includes('US') || vName.includes('samantha') || vName.includes('ava') || vName.includes('zoe') || vName.includes('david')) flag = '🇺🇸';
      else if (voice.lang.includes('AU') || vName.includes('karen') || vName.includes('lee') || vName.includes('gordon')) flag = '🇦🇺';
      else if (voice.lang.includes('IE') || vName.includes('moira')) flag = '🇮🇪';
      else if (voice.lang.includes('ZA') || vName.includes('tessa')) flag = '🇿🇦';
      else if (voice.lang.includes('CA')) flag = '🇨🇦';
      else if (voice.lang.includes('IN') || vName.includes('rishi')) flag = '🇮🇳';
      else if (vName.includes('fiona') || vName.includes('martha')) flag = '🏴󠁧󠁢󠁳󠁣󠁴󠁿';

      const matchedPattern = PRIORITY_VOICE_PATTERNS.find(p => p.pattern.test(voice.name));
      const baseLabel = matchedPattern ? matchedPattern.displayName : voice.name;
      const isEnhanced = voice.name.toLowerCase().includes('enhanced') || voice.name.toLowerCase().includes('premium');
      const label = isEnhanced && !baseLabel.includes('Enhanced') ? `${baseLabel} (Enhanced ✨)` : baseLabel;

      options.push({
        id: voice.voiceURI || voice.name,
        name: voice.name,
        displayName: `${flag} ${label}`,
        lang: voice.lang,
        quality: matchedPattern ? matchedPattern.quality : (isEnhanced ? 'studio' : 'enhanced')
      });
    }
  }

  // 3. Fallback named presets if voices haven't populated yet
  if (options.length <= 1) {
    options.push(
      { id: 'daniel', name: 'Daniel', displayName: '🇬🇧 Daniel (Dignified British Narrator)', lang: 'en-GB', quality: 'studio' },
      { id: 'samantha', name: 'Samantha', displayName: '🇺🇸 Samantha (Clear & Lively US Studio)', lang: 'en-US', quality: 'studio' },
      { id: 'oliver', name: 'Oliver', displayName: '🇬🇧 Oliver (British Natural)', lang: 'en-GB', quality: 'studio' },
      { id: 'serena', name: 'Serena', displayName: '🇬🇧 Serena (British Clear Studio)', lang: 'en-GB', quality: 'studio' },
      { id: 'karen', name: 'Karen', displayName: '🇦🇺 Karen (Warm Australian Narrator)', lang: 'en-AU', quality: 'enhanced' },
      { id: 'moira', name: 'Moira', displayName: '🇮🇪 Moira (Gentle Irish Narrator)', lang: 'en-IE', quality: 'enhanced' },
      { id: 'tessa', name: 'Tessa', displayName: '🇿🇦 Tessa (South African Studio)', lang: 'en-ZA', quality: 'enhanced' },
      { id: 'victoria', name: 'Victoria', displayName: '🇺🇸 Victoria (Classical Formal US)', lang: 'en-US', quality: 'enhanced' },
      { id: 'fiona', name: 'Fiona', displayName: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Fiona (Classical Scottish)', lang: 'en-GB', quality: 'enhanced' }
    );
  }

  return options;
}

/**
 * Resolves the best SpeechSynthesisVoice instance for any voice selection
 */
export function getBestEnglishVoice(preferredVoiceId?: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const rawVoices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!rawVoices || rawVoices.length === 0) return null;

  let targetId = preferredVoiceId;
  if (!targetId) {
    try {
      targetId = localStorage.getItem('berea_preferred_voice') || '';
    } catch {
      targetId = '';
    }
  }

  if (targetId) {
    // 1. Exact match by voiceURI or name
    const exactMatch = rawVoices.find(v => v.voiceURI === targetId || v.name.toLowerCase() === targetId.toLowerCase());
    if (exactMatch) return exactMatch;

    // 2. Smart keyword matching
    const pLow = targetId.toLowerCase();
    
    if (pLow.includes('daniel') || pLow.includes('george') || pLow.includes('british') || pLow.includes('_gb')) {
      const gb = rawVoices.find(v => (v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('oliver') || v.name.toLowerCase().includes('serena') || v.lang === 'en-GB' || v.lang.startsWith('en_GB')) && !ROBOTIC_VOICE_BLACKLIST.some(b => v.name.toLowerCase().includes(b)));
      if (gb) return gb;
    }
    
    if (pLow.includes('samantha') || pLow.includes('david') || pLow.includes('american') || pLow.includes('_us')) {
      const us = rawVoices.find(v => (v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('ava') || v.name.toLowerCase().includes('zoe') || v.lang === 'en-US' || v.lang.startsWith('en_US')) && !ROBOTIC_VOICE_BLACKLIST.some(b => v.name.toLowerCase().includes(b)));
      if (us) return us;
    }
    
    if (pLow.includes('karen') || pLow.includes('australian') || pLow.includes('_au')) {
      const au = rawVoices.find(v => v.name.toLowerCase().includes('karen') || v.lang === 'en-AU');
      if (au) return au;
    }
    
    if (pLow.includes('moira') || pLow.includes('irish') || pLow.includes('_ie')) {
      const ie = rawVoices.find(v => v.name.toLowerCase().includes('moira') || v.lang === 'en-IE');
      if (ie) return ie;
    }
    
    if (pLow.includes('tessa') || pLow.includes('south african') || pLow.includes('_za')) {
      const za = rawVoices.find(v => v.name.toLowerCase().includes('tessa') || v.lang === 'en-ZA');
      if (za) return za;
    }
    
    if (pLow.includes('fiona') || pLow.includes('scottish')) {
      const sc = rawVoices.find(v => v.name.toLowerCase().includes('fiona') || v.name.toLowerCase().includes('martha'));
      if (sc) return sc;
    }
    
    if (pLow.includes('victoria')) {
      const vic = rawVoices.find(v => v.name.toLowerCase().includes('victoria'));
      if (vic) return vic;
    }
    
    if (pLow.includes('oliver')) {
      const oli = rawVoices.find(v => v.name.toLowerCase().includes('oliver'));
      if (oli) return oli;
    }

    if (pLow.includes('serena')) {
      const ser = rawVoices.find(v => v.name.toLowerCase().includes('serena'));
      if (ser) return ser;
    }
  }

  // 3. Priority pattern matching for auto default
  for (const { pattern } of PRIORITY_VOICE_PATTERNS) {
    const match = rawVoices.find(v => v.lang.startsWith('en') && pattern.test(v.name));
    if (match) return match;
  }

  // 4. Clean English voice fallback
  const cleanEnglish = rawVoices.find(v => 
    v.lang.startsWith('en') && 
    !ROBOTIC_VOICE_BLACKLIST.some(b => v.name.toLowerCase().includes(b))
  );
  if (cleanEnglish) return cleanEnglish;

  return rawVoices.find(v => v.lang.startsWith('en')) || rawVoices[0] || null;
}

/**
 * Normalizes raw scripture text into clean, flowing, natural prosody
 */
export function normalizeScriptureForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText
    .replace(/\[\d+\]/g, '')
    .replace(/\[[a-zA-Z]\]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\{.*?\}/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/<.*?>/g, '')
    .replace(/¶/g, '')
    .replace(/§/g, '')
    .replace(/†/g, '')
    .replace(/[*#]/g, '')
    .trim();

  text = text
    .replace(/\bLORD\b/g, 'Lord')
    .replace(/\bGOD\b/g, 'God')
    .replace(/\bYHWH\b/g, 'Yahweh')
    .replace(/\bADONAI\b/g, 'Adonai')
    .replace(/\bSelah\b/gi, '')
    .replace(/\bAmen\b/g, 'Amen')
    .replace(/--/g, ', ')
    .replace(/—/g, ', ')
    .replace(/\s*;\s*/g, ', ')
    .replace(/\s*:\s*/g, ', ')
    .replace(/\s+/g, ' ');

  return text;
}

/**
 * Play a pleasant auditory feedback cue
 */
export function playAuditoryCue(type: 'start' | 'verse' | 'pause' | 'select') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    const ctx = sharedAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    if (type === 'start') {
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.21);
    } else if (type === 'pause') {
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    }
  } catch {
    // ignore
  }
}

/**
 * Universal Synchronous Speak Function (Rock-Solid across Safari macOS & iOS)
 */
export function speakScripturePassage(
  bookName: string,
  chapterNum: number,
  verseNum: number,
  verseText: string,
  rate: number = 1.0,
  preferredVoiceId?: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: any) => void,
  onProgress?: (progress: { text: string; progress: number }) => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.('Speech synthesis not supported in this browser');
    return;
  }

  // 1. Immediately cancel any active speech
  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch {}

  isAudioActive = true;

  const phraseToSpeak = normalizeScriptureForSpeech(verseText);
  if (!phraseToSpeak) {
    onEnd?.();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(phraseToSpeak);
    activeUtterance = utterance;
    // Critical: Keep reference on window to prevent Safari GC mid-utterance
    (window as any).__bereaUtterance = utterance;

    // Natural scripture pacing (0.92 default multiplier for dignified reverent cadence)
    const basePacing = 0.92;
    utterance.rate = Math.max(0.70, Math.min(1.30, (rate || 1.0) * basePacing));
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getBestEnglishVoice(preferredVoiceId);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'en-US';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => {
      if (!isAudioActive) {
        try { window.speechSynthesis.cancel(); } catch {}
        return;
      }
      onStart?.();
    };

    utterance.onend = () => {
      activeUtterance = null;
      (window as any).__bereaUtterance = null;
      if (isAudioActive) {
        onEnd?.();
      }
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      activeUtterance = null;
      (window as any).__bereaUtterance = null;
      onError?.(e);
    };

    // 2. Speak directly within user gesture
    window.speechSynthesis.speak(utterance);

    // Safari unpause safeguard
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (err) {
    console.warn('[Berea Audio] Speech error:', err);
    onError?.(err);
  }
}

/**
 * Stop scripture playback immediately
 */
export function stopScripturePlayback() {
  isAudioActive = false;
  activeUtterance = null;
  (window as any).__bereaUtterance = null;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Pause scripture playback
 */
export function pauseScripturePlayback() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.pause();
    } catch {
      // ignore
    }
  }
}

/**
 * Resume scripture playback
 */
export function resumeScripturePlayback() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
    } catch {
      // ignore
    }
  }
}
