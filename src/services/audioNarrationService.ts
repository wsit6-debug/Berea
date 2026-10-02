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
 * Premium system voice ranking preferences across all supported languages
 */
const PRIORITY_VOICE_PATTERNS = [
  // English Studio & Neural
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
  { pattern: /google us english/i, quality: 'studio' as const, displayName: 'Google US English (Vibrant)', gender: 'female' },
  { pattern: /google uk english male/i, quality: 'studio' as const, displayName: 'Google UK English (Male)', gender: 'male' },
  { pattern: /google uk english female/i, quality: 'studio' as const, displayName: 'Google UK English (Female)', gender: 'female' },
  
  // Spanish (Español)
  { pattern: /\bm[óo]nica\b/i, quality: 'studio' as const, displayName: 'Mónica (Castilian Spanish Studio)', gender: 'female' },
  { pattern: /\bpaulina\b/i, quality: 'studio' as const, displayName: 'Paulina (Mexican Spanish Studio)', gender: 'female' },
  { pattern: /\bjorge\b/i, quality: 'studio' as const, displayName: 'Jorge (Spanish Dignified Narrator)', gender: 'male' },
  { pattern: /\bangelica\b/i, quality: 'enhanced' as const, displayName: 'Angélica (Mexican Studio)', gender: 'female' },
  { pattern: /google espa[ñn]ol/i, quality: 'studio' as const, displayName: 'Google Español', gender: 'female' },

  // French (Français)
  { pattern: /\bthomas\b/i, quality: 'studio' as const, displayName: 'Thomas (French Classical Narrator)', gender: 'male' },
  { pattern: /\bam[ée]lie\b/i, quality: 'studio' as const, displayName: 'Amélie (French Clear Studio)', gender: 'female' },
  { pattern: /\baur[ée]lie\b/i, quality: 'enhanced' as const, displayName: 'Aurélie (French Studio)', gender: 'female' },
  { pattern: /google fran[çc]ais/i, quality: 'studio' as const, displayName: 'Google Français', gender: 'female' },

  // German (Deutsch)
  { pattern: /\banna\b/i, quality: 'studio' as const, displayName: 'Anna (German Clear Narrator)', gender: 'female' },
  { pattern: /\bmarkus\b/i, quality: 'studio' as const, displayName: 'Markus (German Classical)', gender: 'male' },
  { pattern: /\bpetra\b/i, quality: 'enhanced' as const, displayName: 'Petra (German Studio)', gender: 'female' },
  { pattern: /google deutsch/i, quality: 'studio' as const, displayName: 'Google Deutsch', gender: 'female' },

  // Portuguese (Português)
  { pattern: /\bluciana\b/i, quality: 'studio' as const, displayName: 'Luciana (Brazilian Portuguese)', gender: 'female' },
  { pattern: /\bjoana\b/i, quality: 'studio' as const, displayName: 'Joana (European Portuguese)', gender: 'female' },
  { pattern: /google portugu[êe]s/i, quality: 'studio' as const, displayName: 'Google Português', gender: 'female' },

  // Italian (Italiano & Ecclesiastical Latin)
  { pattern: /\balice\b/i, quality: 'studio' as const, displayName: 'Alice (Italian Classical)', gender: 'female' },
  { pattern: /\bluca\b/i, quality: 'studio' as const, displayName: 'Luca (Italian Dignified)', gender: 'male' },
  { pattern: /\bfederica\b/i, quality: 'enhanced' as const, displayName: 'Federica (Italian Studio)', gender: 'female' },
  { pattern: /google italiano/i, quality: 'studio' as const, displayName: 'Google Italiano', gender: 'female' },

  // Russian (Русский)
  { pattern: /\bmilena\b/i, quality: 'studio' as const, displayName: 'Milena (Russian Studio)', gender: 'female' },
  { pattern: /\byuri\b/i, quality: 'studio' as const, displayName: 'Yuri (Russian Classical Narrator)', gender: 'male' },
  { pattern: /google русский/i, quality: 'studio' as const, displayName: 'Google Русский', gender: 'female' },

  // Chinese (中文)
  { pattern: /\btingting\b/i, quality: 'studio' as const, displayName: 'Ting-Ting (Mandarin Clear)', gender: 'female' },
  { pattern: /\bsinji\b/i, quality: 'studio' as const, displayName: 'Sin-Ji (Cantonese Natural)', gender: 'female' },
  { pattern: /google 普通话/i, quality: 'studio' as const, displayName: 'Google 普通话', gender: 'female' },

  // Japanese (日本語)
  { pattern: /\bkyoko\b/i, quality: 'studio' as const, displayName: 'Kyoko (Japanese Natural)', gender: 'female' },
  { pattern: /\botoya\b/i, quality: 'studio' as const, displayName: 'Otoya (Japanese Narrator)', gender: 'male' },
  { pattern: /google 日本語/i, quality: 'studio' as const, displayName: 'Google 日本語', gender: 'female' },

  // Korean (한국어)
  { pattern: /\byuna\b/i, quality: 'studio' as const, displayName: 'Yuna (Korean Natural)', gender: 'female' },
  { pattern: /google 한국어/i, quality: 'studio' as const, displayName: 'Google 한국어', gender: 'female' },

  // Ukrainian (Українська)
  { pattern: /\bpolina\b/i, quality: 'studio' as const, displayName: 'Polina (Ukrainian Studio)', gender: 'female' },
  { pattern: /google українська/i, quality: 'studio' as const, displayName: 'Google Українська', gender: 'female' },

  // Arabic (العربية)
  { pattern: /\bmaged\b/i, quality: 'studio' as const, displayName: 'Maged (Arabic Classical)', gender: 'male' },
  { pattern: /\btarik\b/i, quality: 'studio' as const, displayName: 'Tarik (Arabic Dignified)', gender: 'male' },
  { pattern: /\blaila\b/i, quality: 'studio' as const, displayName: 'Laila (Arabic Studio)', gender: 'female' },

  // General Neural / Siri markers
  { pattern: /\bsiri\b/i, quality: 'studio' as const, displayName: 'Apple Siri (Neural Studio Voice)', gender: 'female' }
];

export const DEFAULT_LOCALE_FOR_LANG: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
  it: 'it-IT',
  ru: 'ru-RU',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  tl: 'fil-PH',
  la: 'la',
  uk: 'uk-UA',
  ar: 'ar-SA',
  nl: 'nl-NL',
  cs: 'cs-CZ',
  pl: 'pl-PL',
  el: 'el-GR',
  he: 'he-IL',
  hi: 'hi-IN',
  sv: 'sv-SE',
  da: 'da-DK',
  fi: 'fi-FI',
  no: 'nb-NO'
};

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  tl: 'Tagalog',
  fil: 'Filipino',
  la: 'Latin',
  uk: 'Українська',
  ar: 'العربية',
  nl: 'Nederlands',
  cs: 'Čeština',
  pl: 'Polski',
  el: 'Ελληνικά',
  he: 'עברית',
  hi: 'हिन्दी',
  sv: 'Svenska',
  da: 'Dansk',
  fi: 'Suomi',
  no: 'Norsk'
};

export function getFlagForVoice(lang: string, name: string): string {
  const l = (lang || '').toLowerCase().replace('_', '-');
  const n = (name || '').toLowerCase();

  if (l.startsWith('en')) {
    if (l.includes('gb') || l.includes('uk') || n.includes('daniel') || n.includes('oliver') || n.includes('serena') || n.includes('george') || n.includes('arthur')) return '🇬🇧';
    if (l.includes('au') || n.includes('karen') || n.includes('lee') || n.includes('gordon')) return '🇦🇺';
    if (l.includes('ie') || n.includes('moira')) return '🇮🇪';
    if (l.includes('za') || n.includes('tessa')) return '🇿🇦';
    if (l.includes('ca')) return '🇨🇦';
    if (l.includes('in') || n.includes('rishi')) return '🇮🇳';
    if (n.includes('fiona') || n.includes('martha')) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
    return '🇺🇸';
  }
  if (l.startsWith('es')) {
    if (l.includes('mx')) return '🇲🇽';
    if (l.includes('us')) return '🇺🇸';
    if (l.includes('ar')) return '🇦🇷';
    if (l.includes('co')) return '🇨🇴';
    return '🇪🇸';
  }
  if (l.startsWith('fr')) {
    if (l.includes('ca')) return '🇨🇦';
    return '🇫🇷';
  }
  if (l.startsWith('de')) return '🇩🇪';
  if (l.startsWith('pt')) {
    if (l.includes('pt')) return '🇵🇹';
    return '🇧🇷';
  }
  if (l.startsWith('it')) return '🇮🇹';
  if (l.startsWith('ru')) return '🇷🇺';
  if (l.startsWith('zh') || l.startsWith('cmn') || l.startsWith('yue')) {
    if (l.includes('tw')) return '🇹🇼';
    if (l.includes('hk')) return '🇭🇰';
    return '🇨🇳';
  }
  if (l.startsWith('ja')) return '🇯🇵';
  if (l.startsWith('ko')) return '🇰🇷';
  if (l.startsWith('tl') || l.startsWith('fil')) return '🇵🇭';
  if (l.startsWith('la')) return '🇻🇦';
  if (l.startsWith('uk')) return '🇺🇦';
  if (l.startsWith('ar')) return '🇸🇦';
  if (l.startsWith('nl')) return '🇳🇱';
  if (l.startsWith('cs')) return '🇨🇿';
  if (l.startsWith('pl')) return '🇵🇱';
  if (l.startsWith('el')) return '🇬🇷';
  if (l.startsWith('he')) return '🇮🇱';
  if (l.startsWith('hi')) return '🇮🇳';
  if (l.startsWith('sv')) return '🇸🇪';
  if (l.startsWith('da')) return '🇩🇰';
  if (l.startsWith('fi')) return '🇫🇮';
  if (l.startsWith('no') || l.startsWith('nb') || l.startsWith('nn')) return '🇳🇴';
  return '🔊';
}

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
 * Returns available narration voices from Safari / macOS / Chrome, prioritized for the target language
 */
export function getAvailableVoices(targetLang: string = 'en'): VoiceOption[] {
  const options: VoiceOption[] = [];
  const primaryLang = (targetLang || 'en').toLowerCase().split(/[-_]/)[0];
  const langName = LANGUAGE_DISPLAY_NAMES[primaryLang] || primaryLang.toUpperCase();

  // 1. Auto Option (Default for the language)
  const autoLabel = primaryLang === 'en'
    ? '⚡ Auto (Dignified British / Clear US)'
    : `⚡ Auto (Native ${langName})`;

  options.push({
    id: '',
    name: 'auto',
    displayName: autoLabel,
    lang: DEFAULT_LOCALE_FOR_LANG[primaryLang] || targetLang || 'en-US',
    quality: 'studio'
  });

  const isVoiceInLang = (voice: SpeechSynthesisVoice, langCode: string) => {
    const vLang = (voice.lang || '').toLowerCase();
    if (langCode === 'la') return vLang.startsWith('la') || vLang.startsWith('it');
    if (langCode === 'tl' || langCode === 'fil') return vLang.startsWith('tl') || vLang.startsWith('fil');
    return vLang.startsWith(langCode);
  };

  const formatVoice = (voice: SpeechSynthesisVoice): VoiceOption => {
    const flag = getFlagForVoice(voice.lang, voice.name);
    const matchedPattern = PRIORITY_VOICE_PATTERNS.find(p => p.pattern.test(voice.name));
    const baseLabel = matchedPattern ? matchedPattern.displayName : voice.name;
    const isEnhanced = /enhanced|premium|studio|neural|natural|siri/i.test(voice.name);
    const label = isEnhanced && !baseLabel.includes('Enhanced') && !baseLabel.includes('Studio') && !baseLabel.includes('Neural')
      ? `${baseLabel} (Studio ✨)`
      : baseLabel;

    return {
      id: voice.voiceURI || voice.name,
      name: voice.name,
      displayName: `${flag} ${label} (${voice.lang || ''})`,
      lang: voice.lang,
      quality: matchedPattern ? matchedPattern.quality : (isEnhanced ? 'studio' : 'enhanced')
    };
  };

  // 2. Real installed system voices
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const rawVoices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    const cleanVoices = (rawVoices || []).filter(v => {
      const vName = v.name.toLowerCase();
      return !ROBOTIC_VOICE_BLACKLIST.some(b => vName.includes(b));
    });

    // Target language voices first
    const targetVoices = cleanVoices.filter(v => isVoiceInLang(v, primaryLang));
    // Other voices second
    const otherVoices = cleanVoices.filter(v => !isVoiceInLang(v, primaryLang));

    for (const voice of targetVoices) {
      options.push(formatVoice(voice));
    }

    // If primary language is not English, also include English and international voices below
    for (const voice of otherVoices) {
      options.push(formatVoice(voice));
    }
  }

  // 3. Fallback named presets if voices haven't populated yet
  if (options.length <= 1) {
    if (primaryLang === 'es') {
      options.push(
        { id: 'monica', name: 'Mónica', displayName: '🇪🇸 Mónica (Castilian Spanish Studio)', lang: 'es-ES', quality: 'studio' },
        { id: 'paulina', name: 'Paulina', displayName: '🇲🇽 Paulina (Mexican Spanish Studio)', lang: 'es-MX', quality: 'studio' },
        { id: 'jorge', name: 'Jorge', displayName: '🇪🇸 Jorge (Spanish Dignified)', lang: 'es-ES', quality: 'studio' }
      );
    } else if (primaryLang === 'fr') {
      options.push(
        { id: 'thomas', name: 'Thomas', displayName: '🇫🇷 Thomas (French Classical Narrator)', lang: 'fr-FR', quality: 'studio' },
        { id: 'amelie', name: 'Amélie', displayName: '🇫🇷 Amélie (French Clear Studio)', lang: 'fr-FR', quality: 'studio' }
      );
    } else if (primaryLang === 'de') {
      options.push(
        { id: 'anna', name: 'Anna', displayName: '🇩🇪 Anna (German Clear Narrator)', lang: 'de-DE', quality: 'studio' },
        { id: 'markus', name: 'Markus', displayName: '🇩🇪 Markus (German Classical)', lang: 'de-DE', quality: 'studio' }
      );
    } else if (primaryLang === 'pt') {
      options.push(
        { id: 'luciana', name: 'Luciana', displayName: '🇧🇷 Luciana (Brazilian Portuguese)', lang: 'pt-BR', quality: 'studio' },
        { id: 'joana', name: 'Joana', displayName: '🇵🇹 Joana (European Portuguese)', lang: 'pt-PT', quality: 'studio' }
      );
    } else if (primaryLang === 'it' || primaryLang === 'la') {
      options.push(
        { id: 'alice', name: 'Alice', displayName: '🇮🇹 Alice (Classical Narrator)', lang: 'it-IT', quality: 'studio' },
        { id: 'luca', name: 'Luca', displayName: '🇮🇹 Luca (Dignified Narrator)', lang: 'it-IT', quality: 'studio' }
      );
    } else if (primaryLang === 'ru') {
      options.push(
        { id: 'milena', name: 'Milena', displayName: '🇷🇺 Milena (Russian Studio)', lang: 'ru-RU', quality: 'studio' },
        { id: 'yuri', name: 'Yuri', displayName: '🇷🇺 Yuri (Russian Classical)', lang: 'ru-RU', quality: 'studio' }
      );
    } else if (primaryLang === 'zh') {
      options.push(
        { id: 'tingting', name: 'Ting-Ting', displayName: '🇨🇳 Ting-Ting (Mandarin Clear)', lang: 'zh-CN', quality: 'studio' },
        { id: 'sinji', name: 'Sin-Ji', displayName: '🇭🇰 Sin-Ji (Cantonese Natural)', lang: 'zh-HK', quality: 'studio' }
      );
    } else if (primaryLang === 'ja') {
      options.push(
        { id: 'kyoko', name: 'Kyoko', displayName: '🇯🇵 Kyoko (Japanese Natural)', lang: 'ja-JP', quality: 'studio' }
      );
    } else if (primaryLang === 'ko') {
      options.push(
        { id: 'yuna', name: 'Yuna', displayName: '🇰🇷 Yuna (Korean Natural)', lang: 'ko-KR', quality: 'studio' }
      );
    } else {
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
  }

  return options;
}

/**
 * Resolves the best SpeechSynthesisVoice instance for any voice selection and target language
 */
export function getBestVoiceForLanguage(
  targetLang: string = 'en',
  preferredVoiceId?: string
): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const rawVoices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!rawVoices || rawVoices.length === 0) return null;

  const primaryLang = (targetLang || 'en').toLowerCase().split(/[-_]/)[0];

  let targetId = preferredVoiceId;
  if (!targetId) {
    try {
      targetId = localStorage.getItem(`berea_preferred_voice_${primaryLang}`) ||
                 localStorage.getItem('berea_preferred_voice') || '';
    } catch {
      targetId = '';
    }
  }

  const isVoiceInLang = (voice: SpeechSynthesisVoice, langCode: string) => {
    const vLang = (voice.lang || '').toLowerCase();
    if (langCode === 'la') return vLang.startsWith('la') || vLang.startsWith('it');
    if (langCode === 'tl' || langCode === 'fil') return vLang.startsWith('tl') || vLang.startsWith('fil');
    return vLang.startsWith(langCode);
  };

  // 1. If preferred voice specified, check for exact match
  if (targetId) {
    const exactMatch = rawVoices.find(v => v.voiceURI === targetId || v.name.toLowerCase() === targetId.toLowerCase());
    if (exactMatch) {
      const matchInLang = isVoiceInLang(exactMatch, primaryLang);
      // If voice matches target language or if user explicitly chosen
      if (matchInLang || preferredVoiceId) {
        return exactMatch;
      }
    }

    // Smart keyword matching for this language
    const pLow = targetId.toLowerCase();
    const keywordMatch = rawVoices.find(v => {
      const vName = v.name.toLowerCase();
      return isVoiceInLang(v, primaryLang) &&
             !ROBOTIC_VOICE_BLACKLIST.some(b => vName.includes(b)) &&
             (vName.includes(pLow) || v.voiceURI.toLowerCase().includes(pLow));
    });
    if (keywordMatch) return keywordMatch;
  }

  // 2. Filter voices for target language
  const langVoices = rawVoices.filter(v => isVoiceInLang(v, primaryLang));
  const cleanLangVoices = langVoices.filter(v => !ROBOTIC_VOICE_BLACKLIST.some(b => v.name.toLowerCase().includes(b)));
  const candidates = cleanLangVoices.length > 0 ? cleanLangVoices : langVoices;

  if (candidates.length > 0) {
    // Check for high quality voices matching PRIORITY_VOICE_PATTERNS
    for (const { pattern } of PRIORITY_VOICE_PATTERNS) {
      const pMatch = candidates.find(v => pattern.test(v.name));
      if (pMatch) return pMatch;
    }

    // Check for Siri / Neural / Enhanced / Studio / Google
    const premiumMatch = candidates.find(v => {
      const n = v.name.toLowerCase();
      return n.includes('siri') || n.includes('neural') || n.includes('natural') ||
             n.includes('enhanced') || n.includes('premium') || n.includes('studio') ||
             n.includes('google');
    });
    if (premiumMatch) return premiumMatch;

    // Default voice in this language
    const defaultVoice = candidates.find(v => v.default);
    if (defaultVoice) return defaultVoice;

    return candidates[0];
  }

  // 3. Fallback: default browser voice or first clean English voice if target language has no voices
  const cleanEnglish = rawVoices.find(v => 
    v.lang.startsWith('en') && 
    !ROBOTIC_VOICE_BLACKLIST.some(b => v.name.toLowerCase().includes(b))
  );
  return cleanEnglish || rawVoices.find(v => v.default) || rawVoices[0] || null;
}

/**
 * Resolves the best SpeechSynthesisVoice instance for English (backward compatibility)
 */
export function getBestEnglishVoice(preferredVoiceId?: string): SpeechSynthesisVoice | null {
  return getBestVoiceForLanguage('en', preferredVoiceId);
}

/**
 * Normalizes raw scripture text into clean, flowing, natural prosody
 */
export function normalizeScriptureForSpeech(rawText: string, lang: string = 'en'): string {
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

  // English-specific theological word cadence
  if ((lang || 'en').toLowerCase().startsWith('en')) {
    text = text
      .replace(/\bLORD\b/g, 'Lord')
      .replace(/\bGOD\b/g, 'God')
      .replace(/\bYHWH\b/g, 'Yahweh')
      .replace(/\bADONAI\b/g, 'Adonai')
      .replace(/\bSelah\b/gi, '')
      .replace(/\bAmen\b/g, 'Amen');
  }

  // Universal prosodic pause cleanup
  text = text
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
    } else if (type === 'verse' || type === 'select') {
      osc.frequency.setValueAtTime(587.33, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch {
    // ignore
  }
}

/**
 * Universal Synchronous Speak Function (Rock-Solid across Safari macOS & iOS, Chrome, Edge, Firefox)
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
  onProgress?: (progress: { text: string; progress: number }) => void,
  targetLang: string = 'en'
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

  const effectiveLang = (targetLang || 'en').toLowerCase().split(/[-_]/)[0];
  const phraseToSpeak = normalizeScriptureForSpeech(verseText, effectiveLang);
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

    const bcp47Lang = DEFAULT_LOCALE_FOR_LANG[effectiveLang] || targetLang || 'en-US';
    const voice = getBestVoiceForLanguage(effectiveLang, preferredVoiceId);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || bcp47Lang;
    } else {
      utterance.lang = bcp47Lang;
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
