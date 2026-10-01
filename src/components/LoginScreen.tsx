import React, { useState } from 'react';
import { 
  Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, BookOpen, 
  MapPin, Columns, Sparkles, Compass, Volume2, FileText, ChevronLeft, ChevronRight,
  Bookmark
} from 'lucide-react';
import { AppliedAiLogo } from './AppliedAiLogo';
import { Verse, TranslationId } from '../data/bibleData';
import { getVerseDisplayText } from './BibleReader';

interface LoginScreenProps {
  onLogin: () => void;
  bookName?: string;
  chapterNumber?: number;
  verses?: Verse[];
  activeTranslation?: TranslationId;
  selectedVerse?: Verse;
  activeSidebar?: 'guide' | 'notepad' | null;
  userNotes?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin,
  bookName,
  chapterNumber,
  verses,
  activeTranslation,
  selectedVerse,
  activeSidebar,
  userNotes,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  // Persist lockout across page refreshes via sessionStorage
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem('berea_auth_failures');
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    try {
      const stored = sessionStorage.getItem('berea_auth_lockout');
      const ts = stored ? parseInt(stored, 10) : null;
      if (ts && ts > Date.now()) return ts;
      return null;
    } catch {
      return null;
    }
  });

  // Countdown timer for lockout
  React.useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      if (Date.now() >= lockoutUntil) {
        setLockoutUntil(null);
        try {
          sessionStorage.removeItem('berea_auth_lockout');
        } catch {}
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const computeHash = async (str: string, salt: string = ''): Promise<string> => {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Crypto API unavailable. You must use localhost or HTTPS.");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const timingSafeEqual = (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOpening) return;

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSecs = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Too many failed attempts. Please wait ${remainingSecs}s.`);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    // Strictly reject any attempt to submit raw encrypted ciphertext strings
    if (password.trim().toLowerCase().startsWith('encrypted:')) {
      setError('Invalid password format.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const salt = import.meta.env.VITE_APP_PASSWORD_SALT || '';
      const inputHash = await computeHash(password, salt);
      const expectedHash = import.meta.env.VITE_APP_PASSWORD_HASH;

      const isValid = expectedHash ? timingSafeEqual(inputHash, expectedHash) : false;

      if (isValid) {
        setFailedAttempts(0);
        setLockoutUntil(null);
        try {
          sessionStorage.removeItem('berea_auth_failures');
          sessionStorage.removeItem('berea_auth_lockout');
        } catch {}

        // Smooth 540ms handoff directly into the active website as pages unfold
        setIsOpening(true);
        setTimeout(() => {
          onLogin();
        }, 540);
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        try {
          sessionStorage.setItem('berea_auth_failures', String(nextAttempts));
        } catch {}

        if (nextAttempts >= 5) {
          const lockoutTime = Date.now() + 30000;
          setLockoutUntil(lockoutTime);
          try {
            sessionStorage.setItem('berea_auth_lockout', String(lockoutTime));
          } catch {}
          setError('Too many failed attempts. Locked for 30 seconds.');
        } else {
          setError(`Incorrect password. Please try again (${5 - nextAttempts} attempts remaining).`);
        }

        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "Crypto API unavailable. You must use localhost or HTTPS.") {
        setError("Security Error: Please access the app via http://localhost:5173 instead of the network IP.");
      } else {
        setError('An error occurred while verifying the password.');
      }
      setIsSubmitting(false);
    }
  };

  const displayBookName = bookName || 'Genesis';
  const displayChapterNum = chapterNumber || 1;
  const displayTranslation = activeTranslation || 'ESV';

  // Extract preview verses from the active chapter inside the app
  const displayVerses: Verse[] = (verses && verses.length > 0)
    ? verses.slice(0, 6)
    : [
        { verseNumber: 1, text: { [displayTranslation]: 'In the beginning God created the heavens and the earth.' } },
        { verseNumber: 2, text: { [displayTranslation]: 'The earth was without form and void, and darkness was over the face of the deep.' } },
        { verseNumber: 3, text: { [displayTranslation]: 'And God said, "Let there be light," and there was light.' } },
        { verseNumber: 4, text: { [displayTranslation]: 'And God saw that the light was good. And God separated the light from the darkness.' } },
        { verseNumber: 5, text: { [displayTranslation]: 'God called the light Day, and the darkness he called Night.' } },
      ];

  const previewVerse = selectedVerse || displayVerses[0];
  const previewVerseText = getVerseDisplayText(previewVerse, displayTranslation);

  // Clean Empty Archival Vellum Pages for smooth book opening
  const renderBlankLeftPage = () => (
    <div className="berea-blank-page-inner left" />
  );

  const renderBlankRightPage = () => (
    <div className="berea-blank-page-inner right" />
  );

  return (
    <div className={`berea-login-wrap ${isOpening ? 'is-unlocked' : ''}`}>
      <div className="berea-book-stage">
        <div className={`berea-book-scene ${isOpening ? 'is-opening' : ''}`}>

          {/* REALISTIC 3D CLOSED BIBLE EXTERIOR (Contact shadow, back cover, left spine, gilded edges) */}
          <div className="berea-closed-shadow" />
          <div className="berea-closed-back-cover" />
          
          <div className="berea-closed-spine">
            <div className="berea-spine-headband-top" />
            <div className="berea-spine-ribs-group">
              <div className="berea-spine-rib" />
              <div className="berea-spine-rib" />
              <div className="berea-spine-rib" />
              <div className="berea-spine-rib" />
            </div>
            <div className="berea-spine-title">✦ BEREA • HOLY SCRIPTURES ✦</div>
            <div className="berea-spine-ribs-group">
              <div className="berea-spine-rib" />
              <div className="berea-spine-rib" />
            </div>
            <div className="berea-spine-headband-bottom" />
          </div>

          {/* Hinge Joint (French Groove) along the spine edge */}
          <div className="berea-spine-hinge-crease" />

          {/* Realistic Sculpted Bible Pages Block (Top, Fore-edge Right, Bottom) */}
          <div className="berea-gilded-block-right" />
          <div className="berea-gilded-block-top" />
          <div className="berea-gilded-block-bottom" />

          {/* TWO-PAGE OPEN BIBLE SPREAD (Clean Empty Archival Pages) */}
          <div className="berea-open-spread">
            <div className="berea-open-page-left">
              {renderBlankLeftPage()}
            </div>

            <div className="berea-open-center-spine">
              <div className="berea-spine-ribbon-drop" />
            </div>

            <div className="berea-open-page-right">
              {renderBlankRightPage()}
            </div>
          </div>

          {/* 3D FLAPPING BOOK ASSEMBLY (Clean Empty Turning Page) */}
          <div className="berea-flap-assembly">

            {/* CLEAN EMPTY ARCHIVAL TURNING LEAF */}
            <div className="berea-turning-leaf">
              <div className="berea-leaf-face" />
              <div className="berea-leaf-face-back" />
            </div>

            {/* 3D FLIPPING FRONT COVER (Hinged on the left, rotates 180° outward like a book cover) */}
            <div className={`berea-flipping-cover ${isShaking ? 'animate-shake' : ''}`}>
            
            {/* FRONT FACE: Closed Leather Book Cover with Login Card */}
            <div className="cover-face-front">
              {/* Antique Brass Filigree Corner Brackets */}
              <div className="berea-corner-filigree top-left" />
              <div className="berea-corner-filigree top-right" />
              <div className="berea-corner-filigree bottom-left" />
              <div className="berea-corner-filigree bottom-right" />

              <div className="berea-book-gold-frame">
                
                {/* Bookplate Inset / Login Card */}
                <div className="berea-login-card">
                  {/* Brand Monogram */}
                  <div className="berea-login-logo">
                    <img
                      src="/berea-logo.jpg"
                      alt="Berea Emblem"
                    />
                  </div>

                  {/* Title & Tagline */}
                  <div style={{ marginTop: '0.85rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h1 className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#26221F', margin: 0 }}>
                        Berea
                      </h1>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 600, 
                        color: '#B4793D', 
                        backgroundColor: '#FAF5ED', 
                        border: '1px solid #EBE5DC', 
                        padding: '2px 6px', 
                        borderRadius: '9999px' 
                      }}>
                        Acts 17:11
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#78716C', margin: 0, lineHeight: 1.4 }}>
                      Examining the Scriptures Daily
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label 
                        htmlFor="berea-password" 
                        style={{ 
                          display: 'block', 
                          textAlign: 'center',
                          fontSize: '0.6875rem', 
                          fontWeight: 600, 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.06em', 
                          color: '#78716C', 
                          marginBottom: '0.5rem' 
                        }}
                      >
                        Access Password
                      </label>

                      <div className="berea-login-input-wrap">
                        <span className="berea-login-input-icon">
                          <Lock style={{ width: '16px', height: '16px' }} />
                        </span>

                        <input
                          id="berea-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError(null);
                          }}
                          autoFocus
                          autoComplete="current-password"
                          placeholder="Enter password"
                          className="berea-login-input"
                          disabled={isOpening}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="berea-login-eye-btn"
                          title={showPassword ? "Hide password" : "Show password"}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          disabled={isOpening}
                        >
                          {showPassword ? (
                            <EyeOff style={{ width: '16px', height: '16px' }} />
                          ) : (
                            <Eye style={{ width: '16px', height: '16px' }} />
                          )}
                        </button>
                      </div>

                      {error && (
                        <div className="berea-login-error">
                          <AlertCircle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                          <span>{error}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isOpening || Boolean(lockoutUntil && Date.now() < lockoutUntil)}
                      className="berea-login-btn"
                    >
                      <span>{isOpening ? 'Opening Book...' : 'Open Berea'}</span>
                      <ArrowRight style={{ width: '16px', height: '16px', color: '#D4A373' }} />
                    </button>
                  </form>

                  {/* Footer Security & Brand Badge */}
                  <div style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #F0EAE1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.6875rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      color: '#A8A29E'
                    }}>
                      <ShieldCheck style={{ width: '14px', height: '14px', color: '#B4793D' }} />
                      <span>Private Theological Study Access</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '0.2rem',
                      opacity: 0.88
                    }}>
                      <AppliedAiLogo variant="lockup-navy" height={19} alt="George Fox University Applied AI Institute" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* BACK FACE: Left Page of the Book (Empty archival vellum) */}
            <div className="cover-face-back">
              {renderBlankLeftPage()}
            </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
