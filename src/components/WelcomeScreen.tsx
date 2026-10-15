import React from 'react';
import { Product } from '../types';
import { formatINR } from '../data/catalogue';
import { ArrowUpRight, Star, Plus, Check, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectQuery: (query: string) => void;
  recommendedProducts: Product[];
  recommendationTopic: string;
  onAddToCart: (product: Product) => void;
  cartProductIds: string[];
}

// Category Glyph for neutral thumbnail placeholders
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

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectQuery,
  recommendedProducts,
  recommendationTopic,
  onAddToCart,
  cartProductIds
}) => {
  const exampleQueries = [
    'Find cotton shirts under ₹2,000',
    'Compare these two products',
    'Which running shoes are in stock?',
    'What is the return policy?'
  ];

  return (
    <div className="max-w-[760px] mx-auto px-4 py-12 sm:py-16 text-left space-y-10">
      
      {/* Hero Welcome Header */}
      <div>
        <div className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#77746F] mb-3">
          YOUR SHOPPING ASSISTANT
        </div>

        <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-[#191919] tracking-tight leading-[1.12] mb-3">
          Find what fits.
        </h1>

        <p className="text-[#77746F] text-sm sm:text-base leading-relaxed max-w-[580px]">
          Recommendations are grounded in the available product catalogue.
        </p>
      </div>

      {/* Recommended for You Section (3 products aligned with previous search topics) */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#191919]">
                Recommended for you
              </h2>
              <p className="text-xs text-[#77746F] mt-0.5">
                {recommendationTopic}
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#77746F]">
              3 catalogue matches
            </span>
          </div>

          <div className="space-y-2">
            {recommendedProducts.map((product) => {
              const inCart = cartProductIds.includes(product.id);

              return (
                <div
                  key={product.id}
                  className="group border border-[#E8E6E1] rounded-lg bg-white p-3 hover:border-[#D1CFC9] transition-all text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-md bg-[#FAF9F6] border border-[#E8E6E1] flex items-center justify-center shrink-0">
                      <CategoryGlyph category={product.category} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onSelectQuery(`Tell me about ${product.name} [${product.id}]`)}
                          className="text-sm font-medium text-[#191919] hover:text-[#246B52] transition-colors text-left truncate cursor-pointer"
                        >
                          {product.name}
                        </button>
                        <span className="font-mono text-[11px] text-[#77746F]">
                          {product.id}
                        </span>
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

                  {/* Right: Price, Stock, Rating, and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5F4F0]">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-medium font-mono tabular-nums text-[#191919]">
                        {formatINR(product.price)}
                      </div>
                      <div className="flex items-center sm:justify-end gap-1.5 text-[11px] mt-0.5">
                        {product.rating && (
                          <span className="flex items-center gap-0.5 text-[#77746F] font-mono">
                            <Star className="w-2.5 h-2.5 fill-[#191919] text-[#191919]" />
                            <span>{product.rating}</span>
                          </span>
                        )}
                        <span
                          className={`font-medium ${
                            product.stock > 5 ? 'text-[#246B52]' : 'text-amber-700'
                          }`}
                        >
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectQuery(`Show details and sizing for ${product.name} [${product.id}]`)}
                        className="px-2.5 py-1 text-xs font-medium rounded-md text-[#191919] bg-[#FAF9F6] hover:bg-[#F0F6F3] hover:text-[#246B52] border border-[#E8E6E1] transition-colors cursor-pointer"
                        title="Ask the assistant about this product"
                      >
                        Ask
                      </button>

                      <button
                        type="button"
                        disabled={!product.inStock}
                        onClick={() => onAddToCart(product)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                          !product.inStock
                            ? 'bg-[#F5F4F0] text-[#77746F] cursor-not-allowed'
                            : inCart
                            ? 'bg-[#246B52] text-white'
                            : 'bg-[#191919] text-[#FAF9F6] hover:bg-[#246B52]'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Added</span>
                          </>
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
            })}
          </div>
        </div>
      )}

      {/* Example Suggested Queries */}
      <div className="space-y-3 pt-2">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[#77746F]">
          Suggested queries
        </div>

        <div className="border border-[#E8E6E1] rounded-lg bg-white divide-y divide-[#E8E6E1] overflow-hidden">
          {exampleQueries.map((query) => (
            <button
              key={query}
              type="button"
              onClick={() => onSelectQuery(query)}
              className="w-full text-left px-4 py-3.5 hover:bg-[#FAF9F6] transition-colors flex items-center justify-between gap-4 group cursor-pointer focus:outline-none focus:bg-[#FAF9F6]"
            >
              <span className="text-sm font-medium text-[#191919] group-hover:text-[#246B52] transition-colors">
                {query}
              </span>
              <ArrowUpRight
                className="w-4 h-4 text-[#77746F] group-hover:text-[#246B52] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
