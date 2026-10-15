import React, { useState } from 'react';
import { POLICIES } from '../data/policies';
import { X, ShieldCheck, RefreshCw, Truck, Tag, Wrench, ShieldAlert } from 'lucide-react';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskPolicyInChat: (query: string) => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  isOpen,
  onClose,
  onAskPolicyInChat
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Returns', 'Shipping', 'Price Match', 'Warranty', 'Refusal'];

  const filtered = POLICIES.filter(p => activeCategory === 'All' || p.category === activeCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Returns': return <RefreshCw className="w-4 h-4 text-[#246B52]" />;
      case 'Shipping': return <Truck className="w-4 h-4 text-[#246B52]" />;
      case 'Price Match': return <Tag className="w-4 h-4 text-[#246B52]" />;
      case 'Warranty': return <Wrench className="w-4 h-4 text-[#246B52]" />;
      case 'Refusal': return <ShieldAlert className="w-4 h-4 text-amber-700" />;
      default: return <ShieldCheck className="w-4 h-4 text-[#246B52]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border border-[#E8E6E1] rounded-xl shadow-2xl flex flex-col max-h-[85vh] text-left">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E6E1] flex items-center justify-between shrink-0 bg-[#FAF9F6]">
          <div>
            <h2 className="font-editorial text-2xl text-[#191919]">Store Policies & Bylaws</h2>
            <p className="text-xs text-[#77746F] mt-0.5">
              Binding policies for return windows, complimentary shipping, and authenticity guarantees
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#77746F] hover:text-[#191919] hover:bg-[#E8E6E1] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-6 py-3 border-b border-[#E8E6E1] flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-[#191919] text-white'
                  : 'bg-[#F5F4F0] text-[#77746F] hover:text-[#191919]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filtered.map((policy) => (
            <div
              key={policy.id}
              className="p-4 rounded-lg border border-[#E8E6E1] bg-[#FAF9F6]/50 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(policy.category)}
                  <h3 className="text-sm font-semibold text-[#191919]">{policy.title}</h3>
                </div>
                <span className="font-mono text-xs text-[#77746F]">[{policy.id}]</span>
              </div>

              <div className="text-[11px] font-mono text-[#77746F]">
                {policy.clause}
              </div>

              <p className="text-xs text-[#191919] leading-relaxed">
                {policy.fullText}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-[#E8E6E1] text-xs">
                <span className="text-[#77746F] text-[11px]">{policy.summary}</span>
                <button
                  onClick={() => {
                    onClose();
                    onAskPolicyInChat(`Explain the details of ${policy.title} [${policy.id}]`);
                  }}
                  className="text-[#246B52] hover:underline font-medium text-xs whitespace-nowrap ml-4"
                >
                  Ask in chat →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8E6E1] bg-[#FAF9F6] text-xs text-[#77746F] flex justify-end">
          <button onClick={onClose} className="font-medium text-[#191919] hover:underline">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
