import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, CornerDownLeft } from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  isLoading,
  disabled = false
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to max 140px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;

    onSendMessage(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/95 to-transparent pt-4 pb-4 sm:pb-6 px-4">
      <div className="max-w-[760px] mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-white border border-[#E8E6E1] rounded-lg shadow-xs p-2 transition-all focus-within:border-[#246B52] focus-within:ring-1 focus-within:ring-[#246B52]/20"
        >
          {/* Multiline Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            placeholder="Ask about products, prices, or policies..."
            className="flex-1 max-h-[140px] resize-none border-0 bg-transparent py-1.5 px-2 text-sm text-[#191919] placeholder:text-[#77746F] focus:outline-none focus:ring-0 leading-relaxed font-sans"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            aria-label="Send message"
            className="p-2 rounded-md bg-[#191919] text-[#FAF9F6] hover:bg-[#246B52] disabled:opacity-30 disabled:hover:bg-[#191919] disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#246B52]/40"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
        </form>

        {/* Quiet footer hint */}
        <div className="mt-2 text-center text-[11px] text-[#77746F] hidden sm:block">
          <span className="font-mono">Enter</span> to send <span className="mx-1 text-[#D1CFC9]">·</span> <span className="font-mono">Shift + Enter</span> for new line
        </div>
      </div>
    </div>
  );
};
