import React from 'react';
import { X, Sparkles, Compass } from 'lucide-react';
import { AnimatedPresence } from './AnimatedPresence';

import { BereaLogo } from './BereaLogo';
import { AppliedAiLogo } from './AppliedAiLogo';

interface PitchDeckAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchDeckAboutModal: React.FC<PitchDeckAboutModalProps> = ({ isOpen, onClose }) => {
    return (
    <AnimatedPresence isVisible={isOpen} duration={250}>
      {(isClosing) => (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-md ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          borderRadius: '24px',
          transform: 'translateZ(0)',
          borderColor: 'var(--clean-accent-border, #EBE5DC)',
          backgroundColor: 'var(--clean-surface, #FFFFFF)',
          color: 'var(--clean-text-primary, #26221F)'
        }}
        className={`border rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh] isolate ${isClosing ? 'animate-springScaleOut' : 'animate-springScaleIn'}`}
      >
        {/* Header */}
        <div 
          style={{
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
            borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
          }}
          className="p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0 rounded-t-3xl"
        >
          <div className="flex items-center gap-3">
            <BereaLogo size={40} textColor="var(--clean-text-primary, #26221F)" />
          </div>
          <button
            onClick={onClose}
            className="ios-icon-btn !w-7 !h-7 text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-text-primary,#26221F)]"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with smooth scrolling */}
        <div 
          style={{ 
            borderBottomLeftRadius: '24px', 
            borderBottomRightRadius: '24px',
            backgroundColor: 'var(--clean-surface, #FFFFFF)',
            color: 'var(--clean-text-primary, #26221F)'
          }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-5 sm:p-7 space-y-5 select-text rounded-b-3xl"
        >
          {/* Section 1: Biblical Vision & Scripture */}
          <div
            className="p-5 sm:p-6 rounded-2xl border space-y-2 shadow-xs"
            style={{
              backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
              borderColor: 'var(--clean-accent-border, #EBE5DC)',
              borderLeftWidth: '4px',
              borderLeftColor: 'var(--clean-accent-border-strong, #B4793D)'
            }}
          >
            <div className="flex items-center justify-between">
              <h4
                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                Biblical Vision & Inspiration
              </h4>
              <span
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shadow-2xs"
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  color: 'var(--clean-accent-dark, #8C5E2E)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
              >
                Acts 17:11
              </span>
            </div>
            <p 
              className="text-sm sm:text-base font-scripture leading-relaxed italic"
              style={{ color: 'var(--clean-text-primary, #38332E)' }}
            >
              “Now the Berean Jews were of more noble character than those in Thessalonica, for they received the message with great eagerness and examined the Scriptures every day to see if what Paul said was true.”
            </p>
            <div 
              className="text-xs font-medium pt-0.5"
              style={{ color: 'var(--clean-text-secondary, #78716C)' }}
            >
              — Acts 17:11 (Paul & Silas in Macedonia, c. AD 50)
            </div>
          </div>

          {/* Section 2: Historical Heritage */}
          <div
            className="p-5 sm:p-6 rounded-2xl border space-y-2.5 shadow-xs"
            style={{
              backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
              borderColor: 'var(--clean-accent-border, #EBE5DC)'
            }}
          >
            <h4
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
            >
              <Compass className="w-4 h-4" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
              The History of Berea
            </h4>
            <div 
              className="text-xs sm:text-[13px] leading-relaxed space-y-2.5"
              style={{ color: 'var(--clean-text-secondary, #57524E)' }}
            >
              <p>
                <strong style={{ color: 'var(--clean-text-primary, #26221F)' }} className="font-semibold">Ancient Berea (modern Veria)</strong> was a flourishing Macedonian Roman city nestled along the foothills of Mount Bermion. During Paul's second missionary journey (c. AD 49–51), after encountering violent riots in Thessalonica, Paul and Silas were sent away by night to Berea.
              </p>
              <p>
                Upon arriving, they entered the Berean synagogue. Unlike the Thessalonian opposition, Luke records that the Bereans possessed a <em>"more noble character"</em> (Greek: <strong>εὐγενέστεροι</strong>, <em>eugenesteroi</em>)—welcoming apostolic teaching with open-hearted eagerness while independently opening the Hebrew scrolls daily to verify the truth against Scripture.
              </p>
              <p>
                This app is named <strong style={{ color: 'var(--clean-text-primary, #26221F)' }} className="font-semibold">Berea</strong> in honor of that posture: combining intellectual curiosity, doctrinal rigor, and deep reverence for the Word of God.
              </p>
            </div>
          </div>

          {/* Section 3: George Fox University & Applied AI Institute */}
          <div
            className="p-5 sm:p-6 rounded-2xl border space-y-3.5 shadow-xs"
            style={{
              background: 'linear-gradient(to bottom right, var(--clean-highlight-cream, #FAF7F2), var(--clean-surface, #FFFFFF), var(--clean-highlight-cream, #FAF7F2))',
              borderColor: 'var(--clean-accent-border, #003057)'
            }}
          >
            <div
              className="flex items-center justify-between gap-3 pb-2 border-b"
              style={{ borderBottomColor: 'var(--clean-accent-border, rgba(0, 48, 87, 0.15))' }}
            >
              <div className="flex items-center gap-2">
                <AppliedAiLogo
                  variant="lockup-navy"
                  height={20}
                  alt="George Fox University - The Applied AI Institute"
                />
              </div>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white tracking-wider uppercase"
                style={{ backgroundColor: 'var(--clean-accent-dark, #003057)' }}
              >
                GFU Ethos
              </span>
            </div>

            <div>
              <h4
                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1"
                style={{ color: 'var(--clean-accent-dark, #003057)' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #D4AF37)' }} />
                The George Fox Promise: Be Known
              </h4>
              <p 
                className="text-xs sm:text-[13px] leading-relaxed"
                style={{ color: 'var(--clean-text-secondary, #2C3E50)' }}
              >
                The Bible is not just a textbook—it is about knowing God and being known by Him. George Fox’s promise to <strong style={{ color: 'var(--clean-accent-dark, #003057)' }}>Be Known</strong> means reading Scripture in three simple ways:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left">
              <div
                className="p-3.5 rounded-xl border shadow-xs space-y-1"
                style={{ 
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, rgba(0, 48, 87, 0.15))' 
                }}
              >
                <div
                  className="text-[10.5px] font-bold uppercase tracking-wide"
                  style={{ color: 'var(--clean-accent-dark, #003057)' }}
                >
                  Academically
                </div>
                <div 
                  className="text-[11.5px] leading-snug"
                  style={{ color: 'var(--clean-text-secondary, #4A5568)' }}
                >
                  Understand the Bible clearly: word meanings, real history, and key facts.
                </div>
              </div>

              <div
                className="p-3.5 rounded-xl border shadow-xs space-y-1"
                style={{ 
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, rgba(0, 48, 87, 0.15))' 
                }}
              >
                <div
                  className="text-[10.5px] font-bold uppercase tracking-wide"
                  style={{ color: 'var(--clean-accent-dark, #003057)' }}
                >
                  Personally
                </div>
                <div 
                  className="text-[11.5px] leading-snug"
                  style={{ color: 'var(--clean-text-secondary, #4A5568)' }}
                >
                  See how God knows you: your life story, your feelings, and your daily walk.
                </div>
              </div>

              <div
                className="p-3.5 rounded-xl border shadow-xs space-y-1"
                style={{ 
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, rgba(0, 48, 87, 0.15))' 
                }}
              >
                <div
                  className="text-[10.5px] font-bold uppercase tracking-wide"
                  style={{ color: 'var(--clean-accent-dark, #003057)' }}
                >
                  Spiritually
                </div>
                <div 
                  className="text-[11.5px] leading-snug"
                  style={{ color: 'var(--clean-text-secondary, #4A5568)' }}
                >
                  Draw close to God: listen quietly for His voice and speak with Him in prayer.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Licensing, Open Source & Scripture Attribution */}
          <div
            className="p-5 rounded-2xl border space-y-3 shadow-xs"
            style={{
              backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
              borderColor: 'var(--clean-accent-border, #EBE5DC)'
            }}
          >
            <div className="flex items-center justify-between">
              <h4
                className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: 'var(--clean-text-primary, #26221F)' }}
              >
                <Compass className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
                Licensing & Scripture Attribution
              </h4>
              <span
                className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-white"
                style={{
                  color: 'var(--clean-accent-dark, #8C5E2E)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
              >
                MIT Open Source
              </span>
            </div>

            <div className="text-xs space-y-2 leading-relaxed text-[var(--clean-text-secondary,#57524E)]">
              <p>
                <strong>Offline Scripture Engine:</strong> Berea's bundled offline Scripture translations are 100% compliant and restricted to verified <em>Public Domain</em> and <em>Creative Commons (CC0)</em> datasets—including the Berean Standard Bible (BSB), World English Bible (WEB), King James Version (KJV), Douay-Rheims (DRB), American Standard Version (ASV), Septuagint (LXX), Westminster Leningrad Codex (WLC), and Textus Receptus (TR).
              </p>
              <p>
                <strong>Proprietary Translations & Fair Use:</strong> Modern copyrighted versions (e.g. ESV, NIV, NASB, CSB) are queried dynamically on-demand at runtime for personal exegetical study and sermon preparation. Respective trademarks and copyrights remain the sole property of their publishers (Crossway, Biblica, Lockman Foundation, Holman Bible Publishers).
              </p>
              <p>
                <strong>Confessions & Commentaries:</strong> All historical confessions (Westminster, Augsburg, 39 Articles, Dort, Trent, 1689 London) and classical commentaries (Aquinas, Calvin, Henry, Chrysostom, Luther, Wesley) are historical public domain heritage.
              </p>
            </div>
          </div>

          {/* Open Source License & Compliance Notice */}
          <div className="pt-2 pb-1 border-t flex items-center justify-between text-[11px] text-[var(--clean-text-secondary,#78716C)] border-[var(--clean-accent-border,#EBE5DC)]">
            <span>Licensed under the open-source <strong className="font-semibold text-[var(--clean-text-primary,#26221F)]">MIT License</strong></span>
            <span>Berea v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
      )}
    </AnimatedPresence>
  );
};
