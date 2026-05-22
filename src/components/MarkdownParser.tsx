import React from 'react';

interface MarkdownParserProps {
  markdown: string;
}

/**
 * A robust, high-performance custom Markdown parser that handles headers (###),
 * numbered lists (1. or ١.), bold text (**), and text blocks.
 * Designed code-architecturally to avoid external markdown rendering package bugs,
 * and seamlessly supports right-to-left (RTL) punctuation and index alignment.
 */
export default function MarkdownParser({ markdown }: MarkdownParserProps) {
  if (!markdown) return null;

  // Split markdown text into individual lines
  const lines = markdown.split('\n');

  // Helper function to replace **bold text** with bold HTML/JSX span elements
  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a bold section
        return (
          <strong key={index} className="font-extrabold text-amber-300 drop-shadow-sm px-0.5 font-sans">
            {part}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4 text-sm font-medium text-slate-300 leading-relaxed font-sans select-none my-2">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-2" />;

        // 1. Check for Headings: "### HeadingText"
        if (trimmed.startsWith('###')) {
          const headingText = trimmed.replace(/^###\s*/, '');
          return (
            <h3
              key={lineIdx}
              className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-305 to-white mt-6 mb-3 pb-1 border-b border-white/5 tracking-wide flex items-center gap-2"
            >
              <span className="text-amber-500">❖</span>
              <span>{renderBoldText(headingText)}</span>
            </h3>
          );
        }

        // 2. Check for Numbered Lists: "1. text" or "١. text" or "10." etc.
        const numListRegex = /^([0-9]+\.|\D+\.)\s*(.*)$/;
        const isNumbered = numListRegex.test(trimmed);

        if (isNumbered) {
          const match = trimmed.match(numListRegex);
          if (match) {
            const indexMarker = match[1];
            const content = match[2];
            return (
              <div
                key={lineIdx}
                className="flex items-start gap-3 border border-white/5 bg-white/5 hover:bg-white/10 p-3 sm:p-4 rounded-xl transition-all duration-305 shadow-inner"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-505/20 border border-cyan-400/30 text-[11px] font-black text-cyan-300 shrink-0 select-none">
                  {indexMarker.replace('.', '')}
                </span>
                <p className="flex-1 text-slate-200 text-xs sm:text-sm font-semibold leading-relaxed">
                  {renderBoldText(content)}
                </p>
              </div>
            );
          }
        }

        // 3. Check for Bullet Points/Markdown Lists: "- text" or "* text"
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 select-none" />
              <p className="flex-1 text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                {renderBoldText(content)}
              </p>
            </div>
          );
        }

        // 4. Default Paragraph Text
        return (
          <p key={lineIdx} className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
            {renderBoldText(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
