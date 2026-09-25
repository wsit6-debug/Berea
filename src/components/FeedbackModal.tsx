import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  MessageSquareHeart,
  Settings2
} from 'lucide-react';
import { FEEDBACK_CONFIG } from '../data/feedbackConfig';
import { DenominationalLens, DENOMINATIONS } from '../data/theologyData';
import { TranslationId } from '../data/bibleData';
import confetti from 'canvas-confetti';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBookName: string;
  currentChapterNum: number;
  currentVerseNum?: number;
  activeLens: DenominationalLens;
  activeTranslation: TranslationId;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentBookName,
  currentChapterNum,
  currentVerseNum,
  activeLens,
  activeTranslation
}) => {
  const [copiedContext, setCopiedContext] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [submittedDirectly, setSubmittedDirectly] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Fallback in-app form state
  const [titleRole, setTitleRole] = useState('Pastor / Senior Pastor');
  const [name, setName] = useState('');
  const [church, setChurch] = useState('');
  const [tradition, setTradition] = useState<string>(activeLens);
  const [category, setCategory] = useState('Theological & Doctrinal Soundness');
  const [comments, setComments] = useState('');

  useEffect(() => {
    setTradition(activeLens);
  }, [activeLens]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDenomName = DENOMINATIONS.find(d => d.id === activeLens)?.name || activeLens;
  const passageString = `${currentBookName} ${currentChapterNum}${currentVerseNum ? `:${currentVerseNum}` : ''}`;
  const contextSummary = `Berea App Context: ${passageString} | Lens: ${currentDenomName} | Translation: ${activeTranslation}`;

  // If a form URL is configured
  let effectiveFormUrl = FEEDBACK_CONFIG.formUrl.trim();
  const hasConfiguredUrl = effectiveFormUrl.length > 0 && !effectiveFormUrl.includes('example.com');

  if (hasConfiguredUrl && effectiveFormUrl.includes('docs.google.com/forms') && !effectiveFormUrl.includes('embedded=true')) {
    effectiveFormUrl += (effectiveFormUrl.includes('?') ? '&' : '?') + 'embedded=true';
  }

  const handleCopyContext = async () => {
    try {
      await navigator.clipboard.writeText(contextSummary);
      setCopiedContext(true);
      setTimeout(() => setCopiedContext(false), 2000);
    } catch {
      // fallback if clipboard fails
    }
  };

  const handleCopyDirectForm = async () => {
    const fullText = [
      `--- Berea Clergy & Pastor Feedback ---`,
      `Title/Role: ${titleRole}`,
      `Name: ${name || 'Anonymous'}`,
      `Church/Parish: ${church || 'Not specified'}`,
      `Tradition: ${tradition}`,
      `Category: ${category}`,
      `Active Passage: ${passageString} (${activeTranslation})`,
      `Lens Selected: ${currentDenomName}`,
      ``,
      `Feedback & Review:`,
      comments
    ].join('\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Berea Clergy Feedback] ${category} - ${passageString}`);
    const body = encodeURIComponent(
      `Clergy Title / Role: ${titleRole}\n` +
      `Name: ${name || 'N/A'}\n` +
      `Church / Parish: ${church || 'N/A'}\n` +
      `Denomination / Lens: ${tradition}\n` +
      `Active Passage: ${passageString}\n` +
      `Translation: ${activeTranslation}\n` +
      `Category: ${category}\n\n` +
      `Feedback & Recommendations:\n` +
      `${comments}\n`
    );

    window.open(`mailto:${FEEDBACK_CONFIG.contactEmail}?subject=${subject}&body=${body}`, '_blank');
    setSubmittedDirectly(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-md animate-fadeIn select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#EBE5DC] rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_25px_60px_rgba(180,140,100,0.25)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#EBE5DC] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0E1] border border-[#D4A373]/40 flex items-center justify-center text-[#B4793D] shadow-xs">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#26221F] leading-tight">
                  Clergy & Theological Feedback
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF3E8] text-[#B4793D] border border-[#D4A373]/30 hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Pastors & Priests
                </span>
              </div>
              <p className="text-xs text-[#78716C] leading-snug">
                Help us review confessional accuracy, pastoral tools, and scriptural commentary.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hasConfiguredUrl && (
              <a
                href={FEEDBACK_CONFIG.shareUrl || effectiveFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ios-icon-btn !w-8 !h-8 text-[#78716C] hover:text-[#B4793D]"
                title="Open Google Form in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="ios-icon-btn !w-8 !h-8"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Scripture Context Banner */}
        <div className="bg-[#FAF5ED] px-4 py-2 border-b border-[#EBE5DC] flex items-center justify-between gap-2 flex-wrap text-xs text-[#57524E] flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#26221F] flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#B4793D]" /> Active Passage:
            </span>
            <span className="font-mono font-medium px-1.5 py-0.5 rounded bg-white border border-[#EBE5DC] text-[#26221F]">
              {passageString}
            </span>
            <span className="text-[#A8A29E]">·</span>
            <span>Tradition: <strong>{currentDenomName}</strong></span>
            <span className="text-[#A8A29E]">·</span>
            <span>Version: <strong>{activeTranslation}</strong></span>
          </div>

          <button
            onClick={handleCopyContext}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#B4793D] hover:text-[#8C5824] transition-colors"
            title="Copy current passage coordinates for the form"
          >
            {copiedContext ? (
              <>
                <Check className="w-3 h-3 text-green-600" />
                <span className="text-green-700">Copied context</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Passage Context</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-[#FCFBF9]">
          {hasConfiguredUrl ? (
            /* Google Form Container */
            <div className="space-y-3">
              {/* Notice & Direct Launch Bar */}
              <div className="p-3.5 rounded-2xl bg-[#FAF5ED] border border-[#EBE5DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="text-xs text-[#57524E] space-y-0.5">
                  <div className="font-semibold text-[#26221F] flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-[#B4793D]" />
                    Clergy & Pastor Survey
                  </div>
                  <p className="text-[11px] text-[#78716C]">
                    If Google shows "refused to connect" (due to Google login requirements), launch the form directly:
                  </p>
                </div>
                <a
                  href={FEEDBACK_CONFIG.shareUrl || effectiveFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#26221F] hover:bg-[#38332E] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
                >
                  <span>Open Form in Google</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4A373]" />
                </a>
              </div>

              <div className="relative w-full h-[620px] min-h-[480px] rounded-2xl overflow-hidden border border-[#EBE5DC] bg-white shadow-xs">
                {iframeLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF7F2] gap-3 text-center p-4">
                    <div className="w-8 h-8 border-3 border-[#D4A373] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-[#78716C]">Loading pastoral feedback form...</p>
                  </div>
                )}
                <iframe
                  src={effectiveFormUrl}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  title="Clergy Feedback Form"
                  onLoad={() => setIframeLoading(false)}
                >
                  Loading feedback form...
                </iframe>
              </div>
            </div>
          ) : (
            /* Built-in Pastoral Feedback Form with Option to Plug in Google Form */
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Setup Guidance Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 flex items-start gap-3">
                <Settings2 className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-amber-950">
                    Embed your own Google Form or Typeform anytime
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Simply add your form URL to <code className="bg-amber-100/90 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">VITE_FEEDBACK_FORM_URL</code> in <code className="bg-amber-100/90 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> or edit <code className="bg-amber-100/90 text-amber-900 px-1 py-0.5 rounded font-mono text-[11px]">src/data/feedbackConfig.ts</code>. Pastors can also submit feedback directly below!
                  </p>
                </div>
              </div>

              {submittedDirectly ? (
                <div className="p-6 rounded-2xl bg-white border border-[#EBE5DC] text-center space-y-3 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#26221F]">Thank you for your pastoral guidance!</h4>
                  <p className="text-xs text-[#78716C] max-w-md mx-auto">
                    Your email draft has been generated. We review all confessional corrections and suggestions to ensure Berea remains faithful and useful for your ministry.
                  </p>
                  <button
                    onClick={() => setSubmittedDirectly(false)}
                    className="ios-glass-btn !px-4 !py-1.5 text-xs text-[#B4793D] font-semibold mx-auto"
                  >
                    Submit Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="bg-white border border-[#EBE5DC] rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#26221F] mb-1">
                        Clergy Title / Role
                      </label>
                      <select
                        value={titleRole}
                        onChange={(e) => setTitleRole(e.target.value)}
                        className="w-full text-xs bg-[#FAF7F2] border border-[#EBE5DC] rounded-xl px-3 py-2 text-[#26221F] focus:outline-none focus:border-[#B4793D]"
                      >
                        <option>Pastor / Senior Pastor</option>
                        <option>Priest / Parish Vicar</option>
                        <option>Bishop / Overseer / Elder</option>
                        <option>Deacon / Associate Minister</option>
                        <option>Seminary Professor / Scholar</option>
                        <option>Lay Ministry Leader / Catechist</option>
                        <option>Other Ministry Leader</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26221F] mb-1">
                        Tradition / Confession
                      </label>
                      <select
                        value={tradition}
                        onChange={(e) => setTradition(e.target.value)}
                        className="w-full text-xs bg-[#FAF7F2] border border-[#EBE5DC] rounded-xl px-3 py-2 text-[#26221F] focus:outline-none focus:border-[#B4793D]"
                      >
                        {DENOMINATIONS.map(d => (
                          <option key={d.id} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                        <option value="Non-denominational / Evangelical">Non-denominational / Evangelical</option>
                        <option value="Anglican / Episcopalian">Anglican / Episcopalian</option>
                        <option value="Other Christian Tradition">Other Christian Tradition</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#26221F] mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Fr. Thomas / Pastor Michael"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs bg-[#FAF7F2] border rounded-xl px-3 py-2 text-[#26221F] placeholder:text-[#A8A29E] focus:outline-none"
                        style={{ border: '1px solid #EBE5DC', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26221F] mb-1">
                        Church, Parish, or Seminary
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. St. Peter's / Grace Community"
                        value={church}
                        onChange={(e) => setChurch(e.target.value)}
                        className="w-full text-xs bg-[#FAF7F2] border rounded-xl px-3 py-2 text-[#26221F] placeholder:text-[#A8A29E] focus:outline-none"
                        style={{ border: '1px solid #EBE5DC', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26221F] mb-1">
                      Feedback Focus Area
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs bg-[#FAF7F2] border rounded-xl px-3 py-2 text-[#26221F] focus:outline-none"
                      style={{ border: '1px solid #EBE5DC', outline: 'none' }}
                    >
                      <option>Theological & Doctrinal Soundness</option>
                      <option>Patristic / Church Father Commentary Accuracy</option>
                      <option>Translation / Scripture Text Nuance</option>
                      <option>Pastoral Care / Sermon Preparation Tooling</option>
                      <option>Denominational Lens Improvement</option>
                      <option>General Ministry Impression & Suggestions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#26221F] mb-1">
                      Your Theological Observations & Recommendations
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder={`Tell us what is working well, what theological nuances need adjustment, or what features would aid your pastoral study of ${passageString}...`}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full text-xs bg-[#FAF7F2] border rounded-xl p-3 text-[#26221F] placeholder:text-[#A8A29E] focus:outline-none resize-none leading-relaxed"
                      style={{ border: '1px solid #EBE5DC', outline: 'none' }}
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleCopyDirectForm}
                      disabled={!comments.trim()}
                      className="w-full sm:w-auto ios-glass-btn text-xs !px-3.5 !py-2 text-[#57524E] hover:text-[#26221F] disabled:opacity-50"
                      title="Copy formatted note to clipboard"
                    >
                      {copiedFeedback ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-green-700 font-semibold">Feedback Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text to Clipboard</span>
                        </>
                      )}
                    </button>

                    <button
                      type="submit"
                      disabled={!comments.trim()}
                      className="w-full sm:w-auto bg-[#26221F] hover:bg-[#38332E] text-white font-semibold text-xs px-5 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>Submit via Email</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
