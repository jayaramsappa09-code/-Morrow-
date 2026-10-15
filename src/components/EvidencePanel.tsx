import React from 'react';
import { EvidenceData, Product, PolicySection } from '../types';
import { CATALOGUE, findProductById, formatINR } from '../data/catalogue';
import { POLICIES, findPolicyById } from '../data/policies';
import { X, CheckCircle, ShieldAlert, HelpCircle, Layers, FileText, ExternalLink } from 'lucide-react';

interface EvidencePanelProps {
  isOpen: boolean;
  onClose: () => void;
  evidence?: EvidenceData;
  selectedCitationTarget?: { id: string; type: 'product' | 'policy' } | null;
  onSelectCitationTarget: (target: { id: string; type: 'product' | 'policy' } | null) => void;
  onAddToCart: (product: Product) => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  isOpen,
  onClose,
  evidence,
  selectedCitationTarget,
  onSelectCitationTarget,
  onAddToCart
}) => {
  if (!isOpen) return null;

  // Selected product or policy if user clicked a citation
  const activeInspectedProduct = selectedCitationTarget?.type === 'product'
    ? findProductById(selectedCitationTarget.id)
    : undefined;

  const activeInspectedPolicy = selectedCitationTarget?.type === 'policy'
    ? findPolicyById(selectedCitationTarget.id)
    : undefined;

  const retrievedProducts = (evidence?.retrievedProductIds || [])
    .map(id => findProductById(id))
    .filter((p): p is Product => p !== undefined);

  const retrievedPolicies = (evidence?.retrievedPolicyIds || [])
    .map(id => findPolicyById(id))
    .filter((p): p is PolicySection => p !== undefined);

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white border-l border-[#E8E6E1] shadow-xl sm:shadow-lg flex flex-col transition-transform text-left"
      aria-label="Ground truth evidence panel"
    >
      {/* Header */}
      <div className="h-14 px-5 border-b border-[#E8E6E1] flex items-center justify-between shrink-0 bg-[#FAF9F6]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#191919]">
            Evidence & Verification
          </span>
          {evidence?.citationValidationStatus === 'verified' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#246B52]">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-[#77746F] hover:text-[#191919] hover:bg-[#E8E6E1]/50 rounded-md transition-colors"
          aria-label="Close evidence panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Selected Citation Spotlight (if user clicked an inline citation) */}
        {(activeInspectedProduct || activeInspectedPolicy) && (
          <div className="p-4 rounded-lg bg-[#F5F4F0] border border-[#E8E6E1] relative">
            <button
              onClick={() => onSelectCitationTarget(null)}
              className="absolute top-2 right-2 text-xs text-[#77746F] hover:text-[#191919]"
              title="Dismiss spotlight"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="text-[10px] font-mono uppercase tracking-wider text-[#246B52] mb-1 font-semibold">
              Inspecting Citation
            </div>

            {activeInspectedProduct && (
              <div>
                <div className="text-sm font-semibold text-[#191919]">{activeInspectedProduct.name}</div>
                <div className="text-xs font-mono text-[#77746F] mt-0.5">{activeInspectedProduct.id} · SKU: {activeInspectedProduct.sku}</div>
                <div className="text-xs text-[#191919] mt-2 font-medium">Price: {formatINR(activeInspectedProduct.price)}</div>
                <div className="text-xs text-[#77746F] mt-1">Material: {activeInspectedProduct.material}</div>
                <div className="text-xs text-[#77746F] mt-0.5">Inventory: {activeInspectedProduct.stock} units available</div>
                <div className="text-xs text-[#77746F] mt-0.5">Care: {activeInspectedProduct.care}</div>
                <div className="text-xs text-[#77746F] mt-0.5">Warranty: {activeInspectedProduct.warranty}</div>
                <div className="mt-3">
                  <button
                    onClick={() => onAddToCart(activeInspectedProduct)}
                    disabled={!activeInspectedProduct.inStock}
                    className="w-full py-1.5 px-3 text-xs font-medium bg-[#191919] text-white rounded hover:bg-[#333] transition-colors disabled:opacity-50"
                  >
                    Add {activeInspectedProduct.name} to Bag
                  </button>
                </div>
              </div>
            )}

            {activeInspectedPolicy && (
              <div>
                <div className="text-sm font-semibold text-[#191919]">{activeInspectedPolicy.title}</div>
                <div className="text-xs font-mono text-[#77746F] mt-0.5">{activeInspectedPolicy.clause}</div>
                <div className="text-xs text-[#191919] mt-2 leading-relaxed">{activeInspectedPolicy.fullText}</div>
              </div>
            )}
          </div>
        )}

        {/* 1. Verifiable Decision Reason */}
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[#77746F] mb-2">
            Decision Reason
          </div>
          <div className="p-3 rounded-lg border border-[#E8E6E1] bg-[#FAF9F6]">
            <div className="flex items-center gap-2 mb-1.5">
              {evidence?.decisionReason === 'scope_refusal' ? (
                <ShieldAlert className="w-4 h-4 text-amber-700" />
              ) : evidence?.decisionReason === 'clarification_needed' ? (
                <HelpCircle className="w-4 h-4 text-blue-700" />
              ) : (
                <CheckCircle className="w-4 h-4 text-[#246B52]" />
              )}
              <span className="text-xs font-mono font-medium text-[#191919] uppercase">
                {evidence?.decisionReason || 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-[#77746F] leading-relaxed">
              {evidence?.decisionExplanation || 'Awaiting query execution. Select a suggestion or ask about products, pricing, and policies.'}
            </p>
          </div>
        </div>

        {/* 2. Active Query Constraints */}
        {evidence?.activeConstraints && Object.keys(evidence.activeConstraints).length > 0 && (
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#77746F] mb-2">
              Active Constraints
            </div>
            <div className="flex flex-wrap gap-1.5">
              {evidence.activeConstraints.category && (
                <span className="text-xs font-mono px-2 py-1 rounded bg-[#F5F4F0] border border-[#E8E6E1] text-[#191919]">
                  category: {evidence.activeConstraints.category}
                </span>
              )}
              {evidence.activeConstraints.maxPrice !== undefined && (
                <span className="text-xs font-mono px-2 py-1 rounded bg-[#F5F4F0] border border-[#E8E6E1] text-[#191919]">
                  maxPrice ≤ {formatINR(evidence.activeConstraints.maxPrice)}
                </span>
              )}
              {evidence.activeConstraints.inStockOnly && (
                <span className="text-xs font-mono px-2 py-1 rounded bg-[#F5F4F0] border border-[#E8E6E1] text-[#191919]">
                  inStockOnly: true
                </span>
              )}
              {evidence.activeConstraints.material && (
                <span className="text-xs font-mono px-2 py-1 rounded bg-[#F5F4F0] border border-[#E8E6E1] text-[#191919]">
                  material: {evidence.activeConstraints.material}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 3. Retrieved Catalogue Records & Calculated Scores */}
        {retrievedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#77746F]">
                Retrieved Catalogue Records ({retrievedProducts.length})
              </span>
              <Layers className="w-3.5 h-3.5 text-[#77746F]" />
            </div>

            <div className="space-y-2">
              {retrievedProducts.map(product => {
                const scoreItem = evidence?.relevanceScores?.find(s => s.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectCitationTarget({ id: product.id, type: 'product' })}
                    className="p-3 rounded-lg border border-[#E8E6E1] hover:border-[#246B52]/40 hover:bg-[#F0F6F3]/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-[#191919] truncate">
                        {product.name}
                      </span>
                      {scoreItem && (
                        <span className="text-[10px] font-mono text-[#246B52] bg-[#F0F6F3] px-1.5 py-0.5 rounded shrink-0">
                          {scoreItem.label}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#77746F] mt-1 flex items-center justify-between">
                      <span className="font-mono">{product.id}</span>
                      <span className="font-mono text-[#191919] font-medium">{formatINR(product.price)}</span>
                    </div>
                    <div className="text-[11px] text-[#77746F] mt-1 line-clamp-1">
                      {product.material}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Retrieved Policy Sections */}
        {retrievedPolicies.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#77746F]">
                Supporting Policy Sections ({retrievedPolicies.length})
              </span>
              <FileText className="w-3.5 h-3.5 text-[#77746F]" />
            </div>

            <div className="space-y-2">
              {retrievedPolicies.map(policy => (
                <div
                  key={policy.id}
                  onClick={() => onSelectCitationTarget({ id: policy.id, type: 'policy' })}
                  className="p-3 rounded-lg border border-[#E8E6E1] hover:border-[#246B52]/40 hover:bg-[#F0F6F3]/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-[#191919]">
                      {policy.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#77746F]">
                      {policy.id}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#77746F] mt-0.5">
                    {policy.clause}
                  </div>
                  <p className="text-xs text-[#77746F] mt-1.5 line-clamp-2">
                    {policy.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#E8E6E1] bg-[#FAF9F6] text-center text-[11px] text-[#77746F]">
        Grounded in Morrow Catalogue & Store Bylaws
      </div>
    </aside>
  );
};
