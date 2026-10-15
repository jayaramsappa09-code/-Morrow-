import React, { useState } from 'react';
import { Message, Product, Citation } from '../types';
import { ProductRow } from './ProductRow';
import { Copy, Check, RotateCcw, ShieldCheck, HelpCircle, Link2 } from 'lucide-react';

interface ConversationAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSelectQuery: (query: string) => void;
  onResetConversation: () => void;
  onSelectCitation: (targetId: string, type: 'product' | 'policy') => void;
  selectedCompareIds: string[];
  onToggleCompare: (id: string) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: string[];
  onCopyShareLink: () => void;
  isLinkCopied: boolean;
}

export const ConversationArea: React.FC<ConversationAreaProps> = ({
  messages,
  isLoading,
  onSelectQuery,
  onResetConversation,
  onSelectCitation,
  selectedCompareIds,
  onToggleCompare,
  onAddToCart,
  cartProductIds,
  onCopyShareLink,
  isLinkCopied
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 1800);
  };

  // Turn inline citation strings like [CAT-SHIRT-01] or [Policy §1.1] into interactive clickable spans
  const renderFormattedParagraph = (text: string, citations?: Citation[]) => {
    const citationRegex = /(\[(?:CAT-[A-Z0-9-]+|Policy\s*§[0-9.]+|POL-[A-Z0-9-]+)\])/g;
    const parts = text.split(citationRegex);

    return parts.map((part, index) => {
      if (citationRegex.test(part)) {
        const rawTag = part.replace(/[\[\]]/g, '');
        const matched = citations?.find(
          c => c.label === part || c.targetId === rawTag || part.includes(c.targetId)
        );

        const targetId = matched?.targetId || rawTag;
        const type = matched?.type || (rawTag.startsWith('CAT-') ? 'product' : 'policy');

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelectCitation(targetId, type)}
            className="inline-flex items-center font-mono text-[11px] px-1.5 py-0.2 mx-0.5 rounded bg-[#FAF9F6] text-[#246B52] border border-[#E8E6E1] hover:bg-[#246B52]/10 transition-colors align-baseline cursor-pointer"
            title={`Inspect evidence for ${part}`}
          >
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="max-w-[760px] mx-auto px-4 py-6 space-y-6 text-left">
      {/* Top action row: Transcript header, Copy Link button, and Start new consultation */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8E6E1] text-xs text-[#77746F]">
        <span className="font-mono uppercase tracking-wider text-[11px]">
          CONSULTATION TRANSCRIPT
        </span>
        
        <div className="flex items-center gap-2">
          {/* Copy Link button to capture session & product selections */}
          <button
            type="button"
            onClick={onCopyShareLink}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isLinkCopied
                ? 'bg-[#F0F6F3] text-[#246B52] border-[#246B52]/30'
                : 'bg-white text-[#191919] border-[#E8E6E1] hover:bg-[#F5F4F0]'
            }`}
            title="Copy link to save and share this consultation session"
          >
            {isLinkCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#246B52]" strokeWidth={2} />
                <span>Link copied</span>
              </>
            ) : (
              <>
                <Link2 className="w-3.5 h-3.5 text-[#77746F]" strokeWidth={1.5} />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* New consultation button */}
          <button
            type="button"
            onClick={onResetConversation}
            className="flex items-center gap-1.5 hover:text-[#191919] transition-colors py-1 px-2 rounded hover:bg-[#F5F4F0] cursor-pointer"
            title="Reset consultation and start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>New consultation</span>
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="space-y-6">
        {messages.map((message) => {
          const isUser = message.role === 'user';

          if (isUser) {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-lg p-3.5 bg-[#F5F4F0] border border-[#E8E6E1] text-[#191919]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#77746F] mb-1">
                    You · {message.timestamp}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-line font-normal">
                    {message.content}
                  </div>
                </div>
              </div>
            );
          }

          // Assistant message
          return (
            <div key={message.id} className="w-full">
              <div className="rounded-lg p-4 bg-white border border-[#E8E6E1] shadow-xs space-y-3">
                
                {/* Assistant Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#F5F4F0]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-[#246B52]">
                      Morrow Assistant
                    </span>
                    {message.isRefusal && (
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Scope Boundary
                      </span>
                    )}
                    {message.clarificationOptions && (
                      <span className="text-[10px] font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        Clarification
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#77746F]">
                    <span className="font-mono">{message.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(message.id, message.content)}
                      className="p-1 hover:text-[#191919] rounded transition-colors cursor-pointer"
                      title="Copy response text"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-[#246B52]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Narrative content with clickable inline citations */}
                <div className="text-sm text-[#191919] leading-relaxed space-y-2">
                  {message.content.split('\n\n').map((para, pIdx) => (
                    <p key={pIdx} className="leading-relaxed whitespace-pre-line">
                      {renderFormattedParagraph(para, message.citations)}
                    </p>
                  ))}
                </div>

                {/* Refusals: Neutral, helpful tone without aggressive red alerts */}
                {message.isRefusal && (
                  <div className="p-3 rounded-md bg-[#FAF9F6] border border-[#E8E6E1] text-xs text-[#77746F] flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#77746F] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-[#191919] block mb-0.5">Assistance Scope</span>
                      <span>
                        Morrow’s assistant is restricted to our internal apparel catalogue and official customer policies.
                      </span>
                    </div>
                  </div>
                )}

                {/* Clarification Questions: Clear & easily selectable */}
                {message.clarificationOptions && message.clarificationOptions.length > 0 && (
                  <div className="pt-2 border-t border-[#F5F4F0] space-y-2">
                    <div className="text-[11px] font-medium text-[#77746F] uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                      <span>Select an option:</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {message.clarificationOptions.map((opt) => (
                        <button
                          key={opt.query}
                          type="button"
                          onClick={() => onSelectQuery(opt.query)}
                          className="text-left text-xs font-medium px-3 py-2 rounded-md border border-[#E8E6E1] hover:border-[#246B52] hover:bg-[#F0F6F3] text-[#191919] transition-colors cursor-pointer"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unobtrusive Citations Summary Footer */}
                {message.citations && message.citations.length > 0 && (
                  <div className="pt-2 border-t border-[#F5F4F0] flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-[#77746F] uppercase">Evidence Citations:</span>
                    {message.citations.map((cite) => (
                      <button
                        key={cite.id}
                        type="button"
                        onClick={() => onSelectCitation(cite.targetId, cite.type)}
                        className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#FAF9F6] hover:bg-[#246B52]/10 hover:text-[#246B52] border border-[#E8E6E1] text-[#77746F] transition-colors cursor-pointer"
                        title={cite.preview}
                      >
                        {cite.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Product Results: Compact, consistent rows */}
                {message.products && message.products.length > 0 && (
                  <div className="pt-3 border-t border-[#F5F4F0] space-y-2">
                    <div className="text-xs font-medium text-[#77746F] uppercase tracking-wider flex items-center justify-between">
                      <span>Verified Catalogue Matches ({message.products.length})</span>
                      <span className="font-mono text-[11px] text-[#77746F] normal-case">
                        Check box to compare
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {message.products.map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          isSelectedForCompare={selectedCompareIds.includes(product.id)}
                          onToggleCompare={onToggleCompare}
                          onSelectCitation={onSelectCitation}
                          onAddToCart={onAddToCart}
                          isAddedToCart={cartProductIds.includes(product.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Stable loading state */}
        {isLoading && (
          <div className="w-full">
            <div className="rounded-lg p-3.5 bg-white border border-[#E8E6E1] shadow-xs flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#246B52] animate-pulse" />
              <span className="text-xs text-[#77746F] font-mono">
                Consulting catalogue records...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
