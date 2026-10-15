import React, { useState } from 'react';
import { Product } from '../types';
import { CATALOGUE, formatINR } from '../data/catalogue';
import { X, Search, Filter, Plus, Check } from 'lucide-react';

interface CatalogueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  cartProductIds: string[];
  onSelectForConversation: (query: string) => void;
}

export const CatalogueDrawer: React.FC<CatalogueDrawerProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  cartProductIds,
  onSelectForConversation
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(6000);

  if (!isOpen) return null;

  const categories = ['All', 'Shirts', 'Footwear', 'Trousers', 'Outerwear', 'Accessories'];

  const filteredProducts = CATALOGUE.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrice = p.price <= maxPriceFilter;
    return matchCat && matchSearch && matchPrice;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white border-l border-[#E8E6E1] shadow-2xl flex flex-col h-full text-left">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E6E1] flex items-center justify-between shrink-0 bg-[#FAF9F6]">
          <div>
            <h2 className="font-editorial text-2xl text-[#191919]">Store Catalogue</h2>
            <p className="text-xs text-[#77746F] mt-0.5">
              Verified records with live stock and material specifications
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#77746F] hover:text-[#191919] hover:bg-[#E8E6E1] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-[#E8E6E1] space-y-3 bg-white shrink-0">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#77746F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by fabric, name, or product ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-[#E8E6E1] focus:outline-none focus:border-[#246B52] bg-[#FAF9F6]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#191919] text-white'
                    : 'bg-[#F5F4F0] text-[#77746F] hover:text-[#191919]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center justify-between text-xs text-[#77746F] pt-1">
            <span>Price ceiling: <strong className="font-mono text-[#191919]">{formatINR(maxPriceFilter)}</strong></span>
            <input
              type="range"
              min="1000"
              max="6000"
              step="200"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-36 accent-[#246B52]"
            />
          </div>
        </div>

        {/* Product Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#77746F]">
              No products found matching active filters.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const inCart = cartProductIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-lg border border-[#E8E6E1] bg-white hover:border-[#D1CFC9] transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#191919]">{p.name}</span>
                        <span className="font-mono text-[11px] text-[#77746F]">[{p.id}]</span>
                      </div>
                      <div className="text-xs text-[#77746F] mt-0.5">{p.material}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-semibold text-sm text-[#191919]">
                        {formatINR(p.price)}
                      </div>
                      <div className={`text-[11px] font-mono mt-0.5 ${p.inStock ? 'text-[#246B52]' : 'text-[#77746F]'}`}>
                        {p.inStock ? `${p.stock} in stock` : 'Out of stock'}
                      </div>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="text-[11px] text-[#77746F] flex items-center gap-1.5 flex-wrap">
                    {p.attributes.map((a, i) => (
                      <React.Fragment key={a}>
                        {i > 0 && <span className="text-[#D1CFC9]">·</span>}
                        <span>{a}</span>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-[#F5F4F0]">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectForConversation(`Tell me more about ${p.name} [${p.id}]`);
                      }}
                      className="text-xs text-[#246B52] hover:underline"
                    >
                      Ask assistant about this item →
                    </button>

                    <button
                      disabled={!p.inStock}
                      onClick={() => onAddToCart(p)}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                        !p.inStock
                          ? 'bg-[#F5F4F0] text-[#77746F] cursor-not-allowed'
                          : inCart
                          ? 'bg-[#246B52] text-white'
                          : 'bg-[#191919] text-white hover:bg-[#333]'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : !p.inStock ? (
                        <span>Out of Stock</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E6E1] bg-[#FAF9F6] text-xs text-[#77746F] flex items-center justify-between">
          <span>Showing {filteredProducts.length} of {CATALOGUE.length} items</span>
          <button onClick={onClose} className="font-medium text-[#191919] hover:underline">
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
