import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Clean, lightweight typography renderer for theological markdown outputs
 * Renders headings, bold titles, bullet points, numbered lists, blockquotes, and scripture snippets
 */
export const MarkdownTheologyRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split lines while preserving markdown structure
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: React.ReactNode[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (currentList.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2 pl-4 space-y-1.5 list-decimal text-[#26221F]">
            {currentList}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2 pl-4 space-y-1.5 list-disc text-[#26221F]">
            {currentList}
          </ul>
        );
      }
      currentList = [];
    }
  };

  // Helper to parse bold, italic, and quotes in inline text
  const parseInlineFormatting = (text: string): React.ReactNode => {
    // Split by markdown bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-[#26221F]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={index} className="italic text-[#38332E]">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1 py-0.5 bg-white text-[#B4793D] rounded border border-[#EBE5DC] font-mono text-[10.5px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Empty line -> flush active list and add small spacing
    if (!trimmed) {
      flushList();
      return;
    }

    // Heading 3: ### Header
    if (trimmed.startsWith('### ')) {
      flushList();
      const title = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h3
          key={`h3-${lineIdx}`}
          className="font-heading font-bold text-[13px] text-[#26221F] mt-3 mb-1.5 pb-1 border-b border-[#EBE5DC] flex items-center gap-1.5"
        >
          <span className="w-1.5 h-3 bg-[#B4793D] rounded-full inline-block"></span>
          {parseInlineFormatting(title)}
        </h3>
      );
      return;
    }

    // Heading 2: ## Header
    if (trimmed.startsWith('## ')) {
      flushList();
      const title = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h2
          key={`h2-${lineIdx}`}
          className="font-heading font-bold text-sm text-[#26221F] mt-3.5 mb-1.5 pb-1 border-b border-[#EBE5DC]"
        >
          {parseInlineFormatting(title)}
        </h2>
      );
      return;
    }

    // Numbered list item: 1. Item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (!isNumberedList && currentList.length > 0) flushList();
      isNumberedList = true;
      const itemContent = numMatch[2];
      currentList.push(
        <li key={`li-num-${lineIdx}`} className="text-xs leading-relaxed text-[#38332E]">
          {parseInlineFormatting(itemContent)}
        </li>
      );
      return;
    }

    // Bullet list item: - Item or * Item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (isNumberedList && currentList.length > 0) flushList();
      isNumberedList = false;
      const itemContent = trimmed.replace(/^[-*]\s+/, '');
      currentList.push(
        <li key={`li-bullet-${lineIdx}`} className="text-xs leading-relaxed text-[#38332E]">
          {parseInlineFormatting(itemContent)}
        </li>
      );
      return;
    }

    // Blockquote: > Quote
    if (trimmed.startsWith('>')) {
      flushList();
      const quoteContent = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={`quote-${lineIdx}`}
          className="my-2 pl-3 py-1 border-l-2 border-[#B4793D] bg-white/70 rounded-r-lg italic text-xs text-[#57524E]"
        >
          {parseInlineFormatting(quoteContent)}
        </blockquote>
      );
      return;
    }

    // Regular paragraph line
    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} className="text-xs leading-relaxed text-[#38332E] my-1">
        {parseInlineFormatting(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className={`theology-markdown space-y-1 ${className}`}>{elements}</div>;
};
