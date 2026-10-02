import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, BookOpen, 
  MapPin, Columns, Sparkles, Compass, Volume2, FileText, ChevronLeft, ChevronRight,
  Bookmark
} from 'lucide-react';
import { AppliedAiLogo } from './AppliedAiLogo';
import { Verse, TranslationId } from '../data/bibleData';
import { getVerseDisplayText } from './BibleReader';
import { fetchFullMultiTranslationChapter } from '../services/youversionService';

const GENESIS_1_VERSES: Verse[] = [
  { verseNumber: 1, text: { default: 'In the beginning, God created the heavens and the earth.' } },
  { verseNumber: 2, text: { default: 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.' } },
  { verseNumber: 3, text: { default: 'And God said, "Let there be light," and there was light.' } },
  { verseNumber: 4, text: { default: 'And God saw that the light was good. And God separated the light from the darkness.' } },
  { verseNumber: 5, text: { default: 'God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.' } },
  { verseNumber: 6, text: { default: 'And God said, "Let there be an expanse in the midst of the waters, and let it separate the waters from the waters."' } },
  { verseNumber: 7, text: { default: 'And God made the expanse and separated the waters that were under the expanse from the waters that were above the expanse. And it was so.' } },
  { verseNumber: 8, text: { default: 'And God called the expanse Heaven. And there was evening and there was morning, the second day.' } },
  { verseNumber: 9, text: { default: 'And God said, "Let the waters under the heavens be gathered together into one place, and let the dry land appear." And it was so.' } },
  { verseNumber: 10, text: { default: 'God called the dry land Earth, and the waters that were gathered together he called Seas. And God saw that it was good.' } },
  { verseNumber: 11, text: { default: 'And God said, "Let the earth sprout vegetation, plants yielding seed, and fruit trees bearing fruit in which is their seed, each according to its kind, on the earth." And it was so.' } },
  { verseNumber: 12, text: { default: 'The earth brought forth vegetation, plants yielding seed according to their own kinds, and trees bearing fruit in which is their seed, each according to its kind. And God saw that it was good.' } },
  { verseNumber: 13, text: { default: 'And there was evening and there was morning, the third day.' } },
  { verseNumber: 14, text: { default: 'And God said, "Let there be lights in the expanse of the heavens to separate the day from the night. And let them be for signs and for seasons, and for days and years,"' } },
  { verseNumber: 15, text: { default: '"and let them be lights in the expanse of the heavens to give light upon the earth." And it was so.' } }
];

const GENESIS_2_VERSES: Verse[] = [
  { verseNumber: 1, text: { default: 'Thus the heavens and the earth were finished, and all the host of them.' } },
  { verseNumber: 2, text: { default: 'And on the seventh day God finished his work that he had done, and he rested on the seventh day from all his work that he had done.' } },
  { verseNumber: 3, text: { default: 'So God blessed the seventh day and made it holy, because on it God rested from all his work that he had done in creation.' } },
  { verseNumber: 4, text: { default: 'These are the generations of the heavens and the earth when they were created, in the day that the LORD God made the earth and the heavens.' } },
  { verseNumber: 5, text: { default: 'When no bush of the field was yet in the land and no small plant of the field had yet sprung up—for the LORD God had not caused it to rain on the land, and there was no man to work the ground,' } },
  { verseNumber: 6, text: { default: 'and a mist was going up from the land and was watering the whole face of the ground—' } },
  { verseNumber: 7, text: { default: 'then the LORD God formed the man of dust from the ground and breathed into his nostrils the breath of life, and the man became a living creature.' } },
  { verseNumber: 8, text: { default: 'And the LORD God planted a garden in Eden, in the east, and there he put the man whom he had formed.' } },
  { verseNumber: 9, text: { default: 'And out of the ground the LORD God made to spring up every tree that is pleasant to the sight and good for food. The tree of life was in the midst of the garden, and the tree of the knowledge of good and evil.' } },
  { verseNumber: 10, text: { default: 'A river flowed out of Eden to water the garden, and there it divided and became four rivers.' } }
];

function getVerseText(v: Verse, translation: string): string {
  if (!v || !v.text) return '';
  return v.text[translation] || v.text['ESV'] || v.text['KJV'] || v.text['default'] || Object.values(v.text)[0] || '';
}

const BiblePageContent: React.FC<{
  bookName: string;
  chapterNum: number;
  verses: Verse[];
  translation: string;
  summary?: string;
  side: 'left' | 'right';
}> = ({ bookName, chapterNum, verses, translation, summary, side }) => {
  const displayVerses = verses.slice(0, 10);
  const chapterSummary = summary || (
    bookName.toLowerCase() === 'genesis' && chapterNum === 1
      ? 'The creation of the heavens and the earth, light, and living creatures.'
      : bookName.toLowerCase() === 'genesis' && chapterNum === 2
        ? 'God rests on the seventh day and plants the garden in Eden.'
        : `The inspired narrative of ${bookName} chapter ${chapterNum}.`
  );

  return (
    <div className={`berea-scripture-page ${side}`}>
      {/* Top Header Bar */}
      <div className="berea-page-header">
        <div className="flex items-center gap-1.5">
          <span className="font-heading font-semibold text-xs text-[var(--clean-text-primary,#26221F)] tracking-wide uppercase">
            {bookName}
          </span>
          <span className="text-[var(--clean-accent-border,#EBE5DC)] font-light">•</span>
          <span className="font-heading font-bold text-xs text-[var(--clean-accent-caramel,#B4793D)]">
            Ch. {chapterNum}
          </span>
        </div>
        <span className="font-heading text-[10px] font-semibold text-[var(--clean-accent-caramel,#B4793D)] bg-[var(--clean-highlight-cream,#FAF5ED)] border border-[var(--clean-accent-border,#EBE5DC)] px-2 py-0.5 rounded-full shadow-2xs">
          {translation}
        </span>
      </div>

      {/* Chapter Title & Summary matching Berea reader */}
      <div className="text-center mb-3 select-none">
        <h2 className="font-heading font-bold text-xl sm:text-2xl text-[var(--clean-text-primary,#26221F)] tracking-tight">
          {bookName} {chapterNum}
        </h2>
        {chapterSummary && (
          <p className="mt-1 text-xs text-[var(--clean-text-secondary,#78716C)] font-normal italic max-w-sm mx-auto leading-normal">
            {chapterSummary}
          </p>
        )}
      </div>

      {/* Flowing Narrative matching BibleReader paragraph mode */}
      <div className="berea-page-text-flow font-scripture text-[var(--clean-text-primary,#26221F)] text-justify leading-[1.8] text-[13.5px] sm:text-[14.5px] flex-1 min-h-0 overflow-hidden">
        <p className="space-y-2">
          {displayVerses.map((v) => (
            <span key={v.verseNumber} className="inline mr-1">
              <sup className="text-[10.5px] font-bold text-[var(--clean-accent-caramel,#B4793D)] select-none mr-1">
                {v.verseNumber}
              </sup>
              <span>{getVerseText(v, translation)} </span>
            </span>
          ))}
        </p>
      </div>

      {/* Page Footer */}
      <div className="berea-page-footer">
        <span className="font-heading text-[10px] text-[var(--clean-text-tertiary,#8C827A)] tracking-widest uppercase">
          Berea • Holy Scriptures
        </span>
      </div>
    </div>
  );
};

interface LoginScreenProps {
  onLogin: () => void;
  isClosingOnMount?: boolean;
  onClosingComplete?: () => void;
  bookName?: string;
  bookId?: string;
  chapterNumber?: number;
  verses?: Verse[];
  activeTranslation?: TranslationId;
  selectedVerse?: Verse | null;
  activeSidebar?: 'guide' | 'notepad' | 'compare' | null;
  userNotes?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin,
  isClosingOnMount = false,
  onClosingComplete,
  bookName,
  bookId,
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
  const [isClosing, setIsClosing] = useState(isClosingOnMount);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isClosingOnMount) {
      // Trigger closing swing immediately on next tick without any artificial delay
      const closeTimer = setTimeout(() => {
        setIsClosing(false);
      }, 20);

      // Finish cleanly when the 0.60s swing lands
      const finishTimer = setTimeout(() => {
        onClosingComplete?.();
        passwordInputRef.current?.focus();
      }, 620);

      return () => {
        clearTimeout(closeTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [isClosingOnMount, onClosingComplete]);

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

        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        // Brisk 800ms transition: faster book open with a momentary glimpse before app entrance
        setIsOpening(true);
        setTimeout(() => {
          onLogin();
        }, 800);
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

  // Adjacent chapter data (left page prior chapter when chapterNumber >= 2, or right page next chapter when chapterNumber === 1)
  const [adjacentChapterData, setAdjacentChapterData] = useState<{
    bookName: string;
    chapterNum: number;
    verses: Verse[];
  } | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function loadAdjacentChapter() {
      if (!bookId) return;

      // If chapterNumber >= 2, load (chapterNumber - 1) for the left-hand page
      if (displayChapterNum >= 2) {
        const leftNum = displayChapterNum - 1;
        if (leftNum === 1 && (bookId === 'GEN' || displayBookName.toLowerCase() === 'genesis')) {
          setAdjacentChapterData({
            bookName: displayBookName,
            chapterNum: 1,
            verses: GENESIS_1_VERSES
          });
          return;
        }
        try {
          const data = await fetchFullMultiTranslationChapter(bookId, leftNum, [displayTranslation]);
          if (!isCancelled && data?.verses?.length > 0) {
            setAdjacentChapterData({
              bookName: displayBookName,
              chapterNum: leftNum,
              verses: data.verses
            });
          }
        } catch (e) {
          console.warn('Failed to load prior chapter for login animation', e);
        }
      } else {
        // chapterNumber === 1: load chapter 2 for the right-hand page
        if (bookId === 'GEN' || displayBookName.toLowerCase() === 'genesis') {
          setAdjacentChapterData({
            bookName: displayBookName,
            chapterNum: 2,
            verses: GENESIS_2_VERSES
          });
          return;
        }
        try {
          const data = await fetchFullMultiTranslationChapter(bookId, 2, [displayTranslation]);
          if (!isCancelled && data?.verses?.length > 0) {
            setAdjacentChapterData({
              bookName: displayBookName,
              chapterNum: 2,
              verses: data.verses
            });
          }
        } catch (e) {
          console.warn('Failed to load next chapter for login animation', e);
        }
      }
    }

    loadAdjacentChapter();
    return () => { isCancelled = true; };
  }, [bookId, displayChapterNum, displayBookName, displayTranslation]);

  const leftPageInfo = useMemo(() => {
    if (displayChapterNum === 1) {
      return {
        bookName: displayBookName,
        chapterNum: 1,
        verses: (verses && verses.length > 0) ? verses : GENESIS_1_VERSES
      };
    }
    // displayChapterNum >= 2: left page displays prior chapter (chapterNum - 1)
    if (adjacentChapterData && adjacentChapterData.chapterNum === displayChapterNum - 1) {
      return adjacentChapterData;
    }
    if (displayChapterNum === 2) {
      return { bookName: displayBookName, chapterNum: 1, verses: GENESIS_1_VERSES };
    }
    return {
      bookName: displayBookName,
      chapterNum: displayChapterNum - 1,
      verses: (verses && verses.length > 0) ? verses : GENESIS_1_VERSES
    };
  }, [adjacentChapterData, displayChapterNum, displayBookName, verses]);

  const rightPageInfo = useMemo(() => {
    if (displayChapterNum === 1) {
      if (adjacentChapterData && adjacentChapterData.chapterNum === 2) {
        return adjacentChapterData;
      }
      return { bookName: displayBookName, chapterNum: 2, verses: GENESIS_2_VERSES };
    }
    // displayChapterNum >= 2: right page displays the active chapter where the user left off!
    return {
      bookName: displayBookName,
      chapterNum: displayChapterNum,
      verses: (verses && verses.length > 0) ? verses : GENESIS_2_VERSES
    };
  }, [adjacentChapterData, displayChapterNum, displayBookName, verses]);

  const isBookOpen = isOpening || isClosing;

  return (
    <div className={`berea-login-wrap ${isOpening ? 'is-unlocked' : ''}`}>
      <div className="berea-book-stage">
        <div className={`berea-book-scene ${isBookOpen ? 'is-opening' : ''}`}>

          {/* Table Surface Mat beneath the book */}
          <div className="berea-table-mat" />

          {/* Clean Flat 2D Book Shadow and Spine */}
          <div className="berea-closed-shadow" />
          
          <div className="berea-closed-spine">
            <div className="berea-spine-headcap" />
            <div className="berea-spine-rib" />
            <div className="berea-spine-rib" />
            <div className="berea-spine-rib" />
            <div className="berea-spine-title">✦ BEREA • HOLY SCRIPTURES ✦</div>
            <div className="berea-spine-rib" />
            <div className="berea-spine-rib" />
            <div className="berea-spine-rib" />
            <div className="berea-spine-tailcap" />
          </div>

          {/* Hinge Joint (French Groove) along the spine edge */}
          <div className="berea-spine-hinge-crease" />

          {/* Scarlet Silk Bookmark Ribbon hanging near bottom */}
          <div className="berea-closed-ribbon-tail" />

          {/* TWO-PAGE OPEN BIBLE SPREAD (Center spine & right page) */}
          <div className="berea-open-spread">
            <div className="berea-open-center-spine">
              <div className="berea-spine-ribbon-drop" />
            </div>

            <div className="berea-open-page-right">
              <BiblePageContent
                bookName={rightPageInfo.bookName}
                chapterNum={rightPageInfo.chapterNum}
                verses={rightPageInfo.verses}
                translation={displayTranslation}
                side="right"
              />
            </div>
          </div>

          {/* 3D FLAPPING BOOK ASSEMBLY (Cover only) */}
          <div className="berea-flap-assembly">

            {/* 3D FLIPPING FRONT COVER (Hinged on the left, rotates 180° outward like a book cover) */}
            <div className={`berea-flipping-cover ${isShaking ? 'animate-shake' : ''}`}>
            
            {/* FRONT FACE: Closed Leather Book Cover with Login Card */}
            <div className="cover-face-front">
              {/* Blind Debossed Leather Groove Frame */}
              <div className="berea-book-blind-groove" />

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
                      <h1 className="font-heading" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--clean-text-primary, #26221F)', margin: 0 }}>
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
                    <p style={{ fontSize: '0.8rem', color: 'var(--clean-text-secondary, #78716C)', margin: 0, lineHeight: 1.4 }}>
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
                          color: 'var(--clean-text-secondary, #78716C)', 
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
                          ref={passwordInputRef}
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
                          disabled={isOpening || isClosing}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="berea-login-eye-btn"
                          title={showPassword ? "Hide password" : "Show password"}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          disabled={isOpening || isClosing}
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
                      disabled={isSubmitting || isOpening || isClosing || Boolean(lockoutUntil && Date.now() < lockoutUntil)}
                      className="berea-login-btn"
                    >
                      <span>{isOpening ? 'Opening Book...' : isClosing ? 'Closing Book...' : 'Open Berea'}</span>
                      <ArrowRight style={{ width: '16px', height: '16px', color: 'currentColor' }} />
                    </button>
                  </form>

                  {/* Footer Security & Brand Badge */}
                  <div style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid #EBE5DC',
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
                      color: 'var(--clean-text-tertiary, #A8A29E)'
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

            {/* BACK FACE: Left scripture page in the open book spread (closes in unison with cover) */}
            <div className="cover-face-back">
              <BiblePageContent
                bookName={leftPageInfo.bookName}
                chapterNum={leftPageInfo.chapterNum}
                verses={leftPageInfo.verses}
                translation={displayTranslation}
                side="left"
              />
            </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
