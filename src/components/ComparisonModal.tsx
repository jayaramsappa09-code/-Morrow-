import React from 'react';
import { Product } from '../types';
import { formatINR } from '../data/catalogue';
import { X, Check, Star, Plus } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onRemoveProduct: (id: string) => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: string[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onAddToCart,
  cartProductIds
}) => {
  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white border border-[#E8E6E1] rounded-xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E6E1] flex items-center justify-between shrink-0 bg-[#FAF9F6]">
          <div>
            <h2 className="font-editorial text-2xl text-[#191919]">
              Product Comparison
            </h2>
            <p className="text-xs text-[#77746F] mt-0.5">
              Side-by-side technical specifications and material provenance
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#77746F] hover:text-[#191919] hover:bg-[#E8E6E1] rounded-md transition-colors"
            aria-label="Close comparison view"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table Grid */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-6 divide-x divide-[#E8E6E1]">
            {products.map((product, idx) => {
              const inCart = cartProductIds.includes(product.id);

              return (
                <div key={product.id} className={idx > 0 ? 'pl-6 space-y-4' : 'space-y-4'}>
                  {/* Top: Remove button + Name + Price */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] text-[#77746F] block">
                        {product.id}
                      </span>
                      <h3 className="text-base font-semibold text-[#191919] leading-snug">
                        {product.name}
                      </h3>
                      <div className="text-base font-mono font-semibold text-[#191919] mt-1">
                        {formatINR(product.price)}
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="p-1 text-[#77746F] hover:text-[#191919] rounded hover:bg-[#F5F4F0] text-xs"
                      title="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Rating & Stock */}
                  <div className="p-2.5 rounded bg-[#FAF9F6] border border-[#E8E6E1] space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#77746F]">Stock Status</span>
                      <span className={`font-mono font-medium ${product.inStock ? 'text-[#246B52]' : 'text-[#77746F]'}`}>
                        {product.inStock ? `${product.stock} units available` : 'Out of stock'}
                      </span>
                    </div>
                    {product.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#77746F]">Customer Rating</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Star className="w-3 h-3 fill-[#191919]" />
                          <span>{product.rating} ({product.reviewsCount})</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Specifications list */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-medium text-[#77746F] uppercase tracking-wider text-[10px] block">
                        Material & GSM
                      </span>
                      <p className="text-[#191919] mt-0.5 leading-relaxed">
                        {product.material}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-[#77746F] uppercase tracking-wider text-[10px] block">
                        Silhouette & Fit
                      </span>
                      <p className="text-[#191919] mt-0.5 leading-relaxed">
                        {product.fit}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-[#77746F] uppercase tracking-wider text-[10px] block">
                        Color / Wash
                      </span>
                      <p className="text-[#191919] mt-0.5">
                        {product.color}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-[#77746F] uppercase tracking-wider text-[10px] block">
                        Care Instructions
                      </span>
                      <p className="text-[#191919] mt-0.5 leading-relaxed">
                        {product.care}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-[#77746F] uppercase tracking-wider text-[10px] block">
                        Warranty & Coverage
                      </span>
                      <p className="text-[#191919] mt-0.5 leading-relaxed">
                        {product.warranty}
                      </p>
                    </div>
                  </div>

                  {/* Add to Bag CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={!product.inStock}
                      className={`w-full py-2 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                        !product.inStock
                          ? 'bg-[#F5F4F0] text-[#77746F] cursor-not-allowed border border-[#E8E6E1]'
                          : inCart
                          ? 'bg-[#246B52] text-white'
                          : 'bg-[#191919] text-white hover:bg-[#333]'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Bag</span>
                        </>
                      ) : !product.inStock ? (
                        <span>Out of Stock</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Bag ({formatINR(product.price)})</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8E6E1] bg-[#FAF9F6] flex items-center justify-between text-xs text-[#77746F]">
          <span>Comparing {products.length} products</span>
          <button
            onClick={onClose}
            className="hover:text-[#191919] font-medium"
          >
            Close view
          </button>
        </div>

      </div>
    </div>
  );
};
