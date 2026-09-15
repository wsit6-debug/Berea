import React from 'react';
import { X, Sparkles, Compass } from 'lucide-react';
import { BereaLogo } from './BereaLogo';
import { AppliedAiLogo } from './AppliedAiLogo';

interface PitchDeckAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchDeckAboutModal: React.FC<PitchDeckAboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/45 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: '24px', transform: 'translateZ(0)' }}
        className="bg-white border border-[#EBE5DC] rounded-3xl w-full max-w-2xl flex flex-col shadow-[0_25px_60px_rgba(180,140,100,0.25)] overflow-hidden max-h-[85vh] isolate"
      >
        {/* Header */}
        <div 
          style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
          className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#EBE5DC] flex items-center justify-between flex-shrink-0 rounded-t-3xl"
        >
          <div className="flex items-center gap-3">
            <BereaLogo size={40} />
          </div>
          <button
            onClick={onClose}
            className="ios-icon-btn !w-7 !h-7 text-[#78716C] hover:text-[#26221F]"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with smooth scrolling */}
        <div 
          style={{ borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-5 sm:p-7 space-y-5 bg-white select-text rounded-b-3xl"
        >
          {/* Section 1: Biblical Vision & Scripture */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF5ED] border border-[#EBE5DC] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-[#B4793D] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B4793D]" />
                Biblical Vision & Inspiration
              </h4>
              <span className="text-[10px] font-mono text-[#B4793D] font-semibold bg-white px-2 py-0.5 rounded-full border border-[#EBE5DC]">
                Acts 17:11
              </span>
            </div>
            <p className="text-sm sm:text-base font-scripture text-[#38332E] leading-relaxed italic">
              “Now the Berean Jews were of more noble character than those in Thessalonica, for they received the message with great eagerness and examined the Scriptures every day to see if what Paul said was true.”
            </p>
            <div className="text-xs font-medium text-[#78716C] pt-0.5">
              — Acts 17:11 (Paul & Silas in Macedonia, c. AD 50)
            </div>
          </div>

          {/* Section 2: Historical Heritage */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] border border-[#EBE5DC] space-y-2.5 shadow-xs">
            <h4 className="text-xs font-bold text-[#26221F] uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#B4793D]" />
              The History of Berea
            </h4>
            <div className="text-xs sm:text-[13px] text-[#57524E] leading-relaxed space-y-2.5">
              <p>
                <strong className="text-[#26221F] font-semibold">Ancient Berea (modern Veria)</strong> was a flourishing Macedonian Roman city nestled along the foothills of Mount Bermion. During Paul's second missionary journey (c. AD 49–51), after encountering violent riots in Thessalonica, Paul and Silas were sent away by night to Berea.
              </p>
              <p>
                Upon arriving, they entered the Berean synagogue. Unlike the Thessalonian opposition, Luke records that the Bereans possessed a <em>"more noble character"</em> (Greek: <strong>εὐγενέστεροι</strong>, <em>eugenesteroi</em>)—welcoming apostolic teaching with open-hearted eagerness while independently opening the Hebrew scrolls daily to verify the truth against Scripture.
              </p>
              <p>
                This app is named <strong className="text-[#26221F] font-semibold">Berea</strong> in honor of that posture: combining intellectual curiosity, doctrinal rigor, and deep reverence for the Word of God.
              </p>
            </div>
          </div>

          {/* Section 3: George Fox University & Applied AI Institute */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#003057]/5 via-[#FAF7F2] to-[#D4AF37]/10 border border-[#003057]/20 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#003057]/10">
              <div className="flex items-center gap-2">
                <AppliedAiLogo
                  variant="lockup-navy"
                  height={20}
                  alt="George Fox University - The Applied AI Institute"
                />
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#003057] text-[#FAF7F2] tracking-wider uppercase">
                GFU Ethos
              </span>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-[#003057] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                The George Fox Promise: Be Known
              </h4>
              <p className="text-xs sm:text-[13px] text-[#2C3E50] leading-relaxed">
                The Bible is not just a textbook—it is about knowing God and being known by Him. George Fox’s promise to <strong className="text-[#003057]">Be Known</strong> means reading Scripture in three simple ways:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left">
              <div className="p-3.5 rounded-xl bg-white/95 border border-[#003057]/15 shadow-xs space-y-1">
                <div className="text-[10.5px] font-bold text-[#003057] uppercase tracking-wide">
                  Academically
                </div>
                <div className="text-[11.5px] text-[#4A5568] leading-snug">
                  Understand the Bible clearly: word meanings, real history, and key facts.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/95 border border-[#003057]/15 shadow-xs space-y-1">
                <div className="text-[10.5px] font-bold text-[#003057] uppercase tracking-wide">
                  Personally
                </div>
                <div className="text-[11.5px] text-[#4A5568] leading-snug">
                  See how God knows you: your life story, your feelings, and your daily walk.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/95 border border-[#003057]/15 shadow-xs space-y-1">
                <div className="text-[10.5px] font-bold text-[#003057] uppercase tracking-wide">
                  Spiritually
                </div>
                <div className="text-[11.5px] text-[#4A5568] leading-snug">
                  Draw close to God: listen quietly for His voice and speak with Him in prayer.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
