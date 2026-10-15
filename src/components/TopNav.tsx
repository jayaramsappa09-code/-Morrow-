import React from 'react';
import { ShoppingBag, Layers, FileText, CheckCircle2 } from 'lucide-react';

interface TopNavProps {
  onOpenCatalogue: () => void;
  onOpenPolicies: () => void;
  onOpenBag: () => void;
  onToggleEvidence: () => void;
  isEvidenceOpen: boolean;
  cartCount: number;
  isOnline: boolean;
  selectedCompareCount: number;
  onOpenCompare: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenCatalogue,
  onOpenPolicies,
  onOpenBag,
  onToggleEvidence,
  isEvidenceOpen,
  cartCount,
  isOnline,
  selectedCompareCount,
  onOpenCompare
}) => {
  return (
    <header className="sticky top-0 z-30 h-14 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E8E6E1] transition-colors">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        
        {/* Zone 1: Wordmark & Runtime Status */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-baseline gap-2.5 text-decoration-none"
          >
            <span className="font-editorial text-2xl font-normal tracking-tight text-[#191919] group-hover:text-[#246B52] transition-colors">
              Morrow
            </span>
            <span className="hidden sm:inline-block text-[11px] tracking-wider uppercase text-[#77746F] font-medium">
              Store Studio
            </span>
          </a>

          {/* Genuine Runtime Status Indicator */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-[#E8E6E1] text-[11px] font-mono tracking-tight">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-[#246B52]' : 'bg-[#77746F]'
              }`}
              aria-hidden="true"
            />
            <span className="text-[#77746F] hidden md:inline">
              {isOnline ? 'CATALOGUE CONNECTED' : 'OFFLINE MODE'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-4 text-xs font-medium text-[#77746F]">
          <button
            onClick={onOpenCatalogue}
            className="px-2.5 py-1.5 rounded hover:text-[#191919] hover:bg-[#F5F4F0] transition-colors flex items-center gap-1.5"
            title="Browse all catalogue products"
          >
            <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Catalogue</span>
          </button>

          <button
            onClick={onOpenPolicies}
            className="px-2.5 py-1.5 rounded hover:text-[#191919] hover:bg-[#F5F4F0] transition-colors flex items-center gap-1.5"
            title="View store policies & guarantees"
          >
            <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Policies</span>
          </button>

          {selectedCompareCount >= 2 && (
            <button
              onClick={onOpenCompare}
              className="px-2.5 py-1.5 rounded text-[#246B52] bg-[#F0F6F3] border border-[#246B52]/20 hover:bg-[#246B52]/10 transition-colors flex items-center gap-1.5"
            >
              <span>Compare ({selectedCompareCount})</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Evidence Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Evidence Panel Toggle */}
          <button
            onClick={onToggleEvidence}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 border ${
              isEvidenceOpen
                ? 'bg-[#191919] text-[#FAF9F6] border-[#191919]'
                : 'bg-white text-[#191919] border-[#E8E6E1] hover:bg-[#F5F4F0]'
            }`}
            aria-pressed={isEvidenceOpen}
            title="Toggle ground truth evidence panel"
          >
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Evidence</span>
          </button>

          {/* Bag Drawer Trigger */}
          <button
            onClick={onOpenBag}
            className="relative p-2 text-[#191919] hover:bg-[#F5F4F0] rounded-md transition-colors border border-[#E8E6E1] bg-white"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-mono font-medium rounded-full bg-[#246B52] text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
