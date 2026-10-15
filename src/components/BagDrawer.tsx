import React from 'react';
import { CartItem } from '../types';
import { formatINR } from '../data/catalogue';
import { X, Trash2, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface BagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearBag: () => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearBag
}) => {
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [checkoutComplete, setCheckoutComplete] = React.useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const freeShippingThreshold = 1500; // As per Policy §2.1
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const shippingCost = items.length === 0 ? 0 : qualifiesForFreeShipping ? 0 : 99;
  const grandTotal = subtotal + shippingCost;

  const handleSimulatedCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      setTimeout(() => {
        onClearBag();
        setCheckoutComplete(false);
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-[#E8E6E1] shadow-2xl flex flex-col h-full text-left">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E8E6E1] flex items-center justify-between shrink-0 bg-[#FAF9F6]">
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-2xl text-[#191919]">Shopping Bag</h2>
            <span className="font-mono text-xs text-[#77746F]">
              ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#77746F] hover:text-[#191919] hover:bg-[#E8E6E1] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator (§2.1) */}
        <div className="p-3.5 bg-[#F0F6F3] border-b border-[#E8E6E1] text-xs">
          {qualifiesForFreeShipping ? (
            <div className="flex items-center gap-2 text-[#246B52] font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>You qualify for Complimentary Standard Delivery [Policy §2.1]</span>
            </div>
          ) : (
            <div className="text-[#191919]">
              Add <span className="font-mono font-semibold text-[#246B52]">{formatINR(freeShippingThreshold - subtotal)}</span> more for free delivery
            </div>
          )}
        </div>

        {/* Bag Items list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {checkoutComplete ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 bg-[#F0F6F3] text-[#246B52] rounded-full mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-2xl text-[#191919]">Order Confirmed</h3>
              <p className="text-xs text-[#77746F] max-w-xs mx-auto leading-relaxed">
                Dispatching from our Bengaluru warehouse within 24 hours under our 30-day return policy [Policy §1.1].
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm text-[#191919] font-medium">Your bag is empty.</p>
              <p className="text-xs text-[#77746F]">
                Ask the assistant or browse the catalogue to add items.
              </p>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-3 rounded-lg border border-[#E8E6E1] bg-white flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] text-[#77746F] block">
                    {product.id}
                  </span>
                  <div className="font-semibold text-xs text-[#191919] leading-snug">
                    {product.name}
                  </div>
                  <div className="text-[11px] text-[#77746F] mt-0.5">
                    {product.color} · {product.material}
                  </div>
                  <div className="font-mono font-medium text-xs text-[#191919] mt-1.5">
                    {formatINR(product.price)}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center border border-[#E8E6E1] rounded">
                    <button
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      className="px-2 py-0.5 text-xs text-[#77746F] hover:bg-[#F5F4F0]"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-mono">{quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      disabled={quantity >= product.stock}
                      className="px-2 py-0.5 text-xs text-[#77746F] hover:bg-[#F5F4F0] disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-[#77746F] hover:text-red-700 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && !checkoutComplete && (
          <div className="p-5 border-t border-[#E8E6E1] bg-[#FAF9F6] space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#77746F]">
                <span>Item Subtotal</span>
                <span className="font-mono tabular-nums text-[#191919]">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#77746F]">
                <span>Standard Delivery</span>
                <span className="font-mono tabular-nums text-[#191919]">
                  {shippingCost === 0 ? 'Complimentary' : formatINR(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-sm text-[#191919] pt-2 border-t border-[#E8E6E1]">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums text-base">{formatINR(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleSimulatedCheckout}
              disabled={isCheckingOut}
              className="w-full py-2.5 px-4 rounded-md bg-[#191919] text-[#FAF9F6] hover:bg-[#246B52] transition-colors text-xs font-medium flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order ({formatINR(grandTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
