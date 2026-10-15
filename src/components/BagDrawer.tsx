import React, { useState } from 'react';
import { CartItem, PriceAlert, Product } from '../types';
import { formatINR } from '../data/catalogue';
import { X, Trash2, ArrowRight, ShieldCheck, Check, Bell, BellRing, Sparkles } from 'lucide-react';

interface BagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearBag: () => void;
  priceAlerts: PriceAlert[];
  onSetPriceAlert: (product: Product, targetPrice: number) => void;
  onRemovePriceAlert: (productId: string) => void;
  onSimulatePriceDrop: (alert: PriceAlert) => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearBag,
  priceAlerts,
  onSetPriceAlert,
  onRemovePriceAlert,
  onSimulatePriceDrop
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [configuringAlertProductId, setConfiguringAlertProductId] = useState<string | null>(null);
  const [customTargetPrice, setCustomTargetPrice] = useState<string>('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const freeShippingThreshold = 1500;
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

  const handleOpenAlertConfig = (product: Product) => {
    setConfiguringAlertProductId(product.id);
    // Default to 10% below current price
    const defaultTarget = Math.round(product.price * 0.9);
    setCustomTargetPrice(String(defaultTarget));
  };

  const handleSaveAlert = (product: Product) => {
    const target = parseInt(customTargetPrice, 10);
    if (!isNaN(target) && target > 0 && target < product.price) {
      onSetPriceAlert(product, target);
      setConfiguringAlertProductId(null);
    }
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

        {/* Free Shipping Progress Indicator */}
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

        {/* Active Price Alerts Banner (if any set) */}
        {priceAlerts.length > 0 && (
          <div className="p-3 bg-[#FAF9F6] border-b border-[#E8E6E1] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#191919] flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-[#246B52]" />
                <span>Monitored Price Alerts ({priceAlerts.length})</span>
              </span>
              <button
                type="button"
                onClick={() => onSimulatePriceDrop(priceAlerts[0])}
                className="text-[11px] font-mono text-[#246B52] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-[#E8E6E1]"
                title="Simulate a price drop to see the assistant notify you in chat"
              >
                <Sparkles className="w-3 h-3" />
                <span>Test Price Drop</span>
              </button>
            </div>
            <p className="text-[11px] text-[#77746F]">
              The assistant monitors price changes and alerts you right in your conversation when an item drops.
            </p>
          </div>
        )}

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
            items.map(({ product, quantity }) => {
              const activeAlert = priceAlerts.find(a => a.productId === product.id);
              const isConfiguring = configuringAlertProductId === product.id;

              return (
                <div
                  key={product.id}
                  className="p-3.5 rounded-lg border border-[#E8E6E1] bg-white space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
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

                  {/* Price Alert Control Bar */}
                  <div className="pt-2 border-t border-[#F5F4F0] text-xs">
                    {isConfiguring ? (
                      /* Price Alert Configuration Form */
                      <div className="p-3 rounded-md bg-[#FAF9F6] border border-[#E8E6E1] space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-[#191919]">Set Price Alert Target</span>
                          <span className="font-mono text-[#77746F]">Current: {formatINR(product.price)}</span>
                        </div>

                        {/* Preset discount buttons */}
                        <div className="flex items-center gap-1.5 text-[11px]">
                          {[5, 10, 15, 20].map(pct => {
                            const target = Math.round(product.price * (1 - pct / 100));
                            return (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setCustomTargetPrice(String(target))}
                                className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
                                  customTargetPrice === String(target)
                                    ? 'bg-[#191919] text-white border-[#191919]'
                                    : 'bg-white text-[#191919] border-[#E8E6E1] hover:bg-[#F5F4F0]'
                                }`}
                              >
                                {pct}% off ({formatINR(target)})
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom price input */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#77746F]">Notify at ≤ ₹</span>
                          <input
                            type="number"
                            value={customTargetPrice}
                            onChange={(e) => setCustomTargetPrice(e.target.value)}
                            className="w-24 px-2 py-1 text-xs border border-[#E8E6E1] rounded bg-white font-mono focus:outline-none focus:border-[#246B52]"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setConfiguringAlertProductId(null)}
                            className="px-2.5 py-1 text-xs text-[#77746F] hover:text-[#191919]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAlert(product)}
                            className="px-3 py-1 text-xs font-medium bg-[#246B52] text-white rounded hover:bg-[#1E5843] transition-colors"
                          >
                            Set Alert
                          </button>
                        </div>
                      </div>
                    ) : activeAlert ? (
                      /* Active alert badge */
                      <div className="flex items-center justify-between text-[11px] bg-[#F0F6F3] text-[#246B52] px-2.5 py-1 rounded border border-[#246B52]/20">
                        <span className="flex items-center gap-1.5">
                          <BellRing className="w-3.5 h-3.5" />
                          <span>Alert active: Notify if ≤ <strong>{formatINR(activeAlert.targetPrice)}</strong></span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenAlertConfig(product)}
                            className="hover:underline font-medium text-[11px]"
                          >
                            Edit
                          </button>
                          <span className="text-[#246B52]/40">·</span>
                          <button
                            type="button"
                            onClick={() => onRemovePriceAlert(product.id)}
                            className="hover:underline text-[11px] text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Set Alert Button */
                      <button
                        type="button"
                        onClick={() => handleOpenAlertConfig(product)}
                        className="text-[11px] text-[#77746F] hover:text-[#246B52] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Set Price Alert for this item</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
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
