import React from 'react';
import { Product } from '../types';
import { formatINR } from '../data/catalogue';
import { Star, Check, Plus } from 'lucide-react';

interface ProductRowProps {
  product: Product;
  isSelectedForCompare: boolean;
  onToggleCompare: (id: string) => void;
  onSelectCitation: (targetId: string, type: 'product' | 'policy') => void;
  onAddToCart: (product: Product) => void;
  isAddedToCart?: boolean;
}

// Minimalist category iconography for neutral placeholders
const CategoryGlyph: React.FC<{ category: Product['category'] }> = ({ category }) => {
  switch (category) {
    case 'Shirts':
      return (
        <svg className="w-4 h-4 text-[#77746F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
        </svg>
      );
    case 'Footwear':
      return (
        <svg className="w-4 h-4 text-[#77746F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3.5 15.5C5 15.5 7.5 14 10 13c3-1.2 5.5-1 7.5.5 1.5 1.1 3 2 4.5 2H22v2.5a1.5 1.5 0 0 1-1.5 1.5H3.5a1.5 1.5 0 0 1-1.5-1.5V17a1.5 1.5 0 0 1 1.5-1.5z" />
          <path d="M14 8.5C12 9 10 11 8.5 13" />
          <path d="M16 6.5C14.5 7 13 8.5 12 10.5" />
        </svg>
      );
    case 'Trousers':
      return (
        <svg className="w-4 h-4 text-[#77746F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16v3l-2 13h-4l-2-8-2 8H6L4 7V4z" />
        </svg>
      );
    case 'Outerwear':
      return (
        <svg className="w-4 h-4 text-[#77746F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" />
          <path d="M12 3v18" />
          <path d="m8 3 4 5 4-5" />
        </svg>
      );
    case 'Accessories':
    default:
      return (
        <svg className="w-4 h-4 text-[#77746F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="7" />
          <path d="M12 9v3l2 2" />
          <path d="M12 2v3M12 19v3" />
        </svg>
      );
  }
};

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  isSelectedForCompare,
  onToggleCompare,
  onSelectCitation,
  onAddToCart,
  isAddedToCart = false
}) => {
  return (
    <div className="group border border-[#E8E6E1] rounded-lg bg-white p-3 hover:border-[#D1CFC9] transition-all text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Comparison Checkbox + Category Glyph Placeholder + Details */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Comparison / Selection Control */}
          <label className="flex items-center cursor-pointer shrink-0" title="Select to compare">
            <input
              type="checkbox"
              checked={isSelectedForCompare}
              onChange={() => onToggleCompare(product.id)}
              className="w-4 h-4 rounded border-[#D1CFC9] text-[#246B52] focus:ring-[#246B52] focus:ring-offset-0 cursor-pointer accent-[#246B52]"
            />
          </label>

          {/* Neutral Placeholder with Minimalist Category Glyph */}
          <div className="w-9 h-9 rounded-md bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-center shrink-0">
            <CategoryGlyph category={product.category} />
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-medium text-[#191919] hover:text-[#246B52] transition-colors">
                {product.name}
              </span>

              {/* Product ID in subtle secondary font */}
              <span className="font-mono text-[11px] text-[#77746F]">
                {product.id}
              </span>

              {/* Compact Evidence Citation */}
              <button
                type="button"
                onClick={() => onSelectCitation(product.id, 'product')}
                className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#FAF9F6] text-[#77746F] hover:bg-[#246B52]/10 hover:text-[#246B52] transition-colors border border-[#E8E6E1] cursor-pointer"
                title="Inspect catalogue citation & evidence"
              >
                [{product.id}]
              </button>
            </div>

            {/* 2-3 Verified Attributes */}
            <div className="text-xs text-[#77746F] mt-0.5 flex items-center gap-1.5 flex-wrap">
              {product.attributes.slice(0, 3).map((attr, idx) => (
                <React.Fragment key={attr}>
                  {idx > 0 && <span className="text-[#D1CFC9]" aria-hidden="true">·</span>}
                  <span>{attr}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Price, Stock Status, Rating, and Quick Action */}
        <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5F4F0]">
          
          {/* Price, Stock, Rating column */}
          <div className="text-left sm:text-right">
            <div className="text-sm font-medium font-mono tabular-nums text-[#191919]">
              {formatINR(product.price)}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-1.5 text-xs text-[#77746F] line-through font-normal">
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center sm:justify-end gap-2 text-[11px] mt-0.5">
              {/* Rating only when available */}
              {product.rating && (
                <span className="flex items-center gap-0.5 text-[#77746F] font-mono">
                  <Star className="w-2.5 h-2.5 text-[#191919] fill-[#191919]" />
                  <span>{product.rating}</span>
                  {product.reviewsCount && (
                    <span className="text-[#77746F]">({product.reviewsCount})</span>
                  )}
                </span>
              )}

              {/* Stock Status */}
              <span
                className={`font-medium ${
                  product.stock > 5
                    ? 'text-[#246B52]'
                    : product.stock > 0
                    ? 'text-amber-700'
                    : 'text-[#77746F]'
                }`}
              >
                {product.stock > 5
                  ? `In Stock (${product.stock})`
                  : product.stock > 0
                  ? `Low Stock (${product.stock})`
                  : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Quick Add Action */}
          <button
            type="button"
            disabled={!product.inStock}
            onClick={() => onAddToCart(product)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 shrink-0 ${
              !product.inStock
                ? 'bg-[#F5F4F0] text-[#77746F] cursor-not-allowed border border-[#E8E6E1]'
                : isAddedToCart
                ? 'bg-[#246B52] text-white'
                : 'bg-[#191919] text-[#FAF9F6] hover:bg-[#246B52]'
            }`}
          >
            {isAddedToCart ? (
              <>
                <Check className="w-3 h-3" />
                <span>Added</span>
              </>
            ) : !product.inStock ? (
              <span>Unavailable</span>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};
