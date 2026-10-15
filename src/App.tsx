import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TopNav } from './components/TopNav';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ConversationArea } from './components/ConversationArea';
import { MessageComposer } from './components/MessageComposer';
import { EvidencePanel } from './components/EvidencePanel';
import { ComparisonModal } from './components/ComparisonModal';
import { CatalogueDrawer } from './components/CatalogueDrawer';
import { PoliciesModal } from './components/PoliciesModal';
import { BagDrawer } from './components/BagDrawer';
import { Message, Product, CartItem, EvidenceData, PriceAlert } from './types';
import { CATALOGUE, findProductById, formatINR } from './data/catalogue';
import { processUserQuery } from './lib/retrievalEngine';
import { getRecommendedProducts } from './lib/recommendations';
import { Check } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [currentEvidence, setCurrentEvidence] = useState<EvidenceData | undefined>(undefined);
  const [selectedCitationTarget, setSelectedCitationTarget] = useState<{ id: string; type: 'product' | 'policy' } | null>(null);

  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent search history across sessions
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('mrw_query_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persistent price alerts across sessions
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const stored = localStorage.getItem('mrw_price_alerts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Calculate recommended products dynamically based on search history
  const recommendations = useMemo(() => {
    return getRecommendedProducts(searchHistory);
  }, [searchHistory]);

  // Restore conversation session and product selections from URL search parameters on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sessionParam = params.get('session');
      if (sessionParam) {
        const decoded = JSON.parse(decodeURIComponent(atob(sessionParam)));
        if (decoded && Array.isArray(decoded.queries) && decoded.queries.length > 0) {
          let lastEv: EvidenceData | undefined = undefined;
          const restoredMessages: Message[] = [];
          
          for (let i = 0; i < decoded.queries.length; i++) {
            const q = decoded.queries[i];
            restoredMessages.push({
              id: `usr-init-${i}-${Date.now()}`,
              role: 'user',
              content: q,
              timestamp: 'Saved'
            });
            const reply = processUserQuery(q, lastEv, priceAlerts);
            lastEv = reply.evidence;
            restoredMessages.push(reply);
          }

          setMessages(restoredMessages);
          if (lastEv) setCurrentEvidence(lastEv);

          // Update search history with restored queries
          setSearchHistory(prev => {
            const merged = Array.from(new Set([...decoded.queries, ...prev])).slice(0, 20);
            try {
              localStorage.setItem('mrw_query_history', JSON.stringify(merged));
            } catch {}
            return merged;
          });

          if (Array.isArray(decoded.compare)) {
            setSelectedCompareIds(decoded.compare);
          }

          if (Array.isArray(decoded.cart)) {
            const restoredCart: CartItem[] = [];
            for (const pid of decoded.cart) {
              const p = findProductById(pid);
              if (p) restoredCart.push({ product: p, quantity: 1 });
            }
            if (restoredCart.length > 0) setCart(restoredCart);
          }

          setToastMessage('Shopping consultation restored from shared link');
          setTimeout(() => setToastMessage(null), 3000);
        }
      }
    } catch (err) {
      console.warn('Unable to deserialize session link:', err);
    }
  }, []);

  // Track online/offline runtime status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Generate shareable link capturing the session & selections
  const handleCopyShareLink = useCallback(() => {
    const userQueries = messages.filter(m => m.role === 'user').map(m => m.content);
    const sessionData = {
      queries: userQueries,
      compare: selectedCompareIds,
      cart: cart.map(i => i.product.id)
    };

    const encoded = btoa(encodeURIComponent(JSON.stringify(sessionData)));
    const url = `${window.location.origin}${window.location.pathname}?session=${encoded}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setIsLinkCopied(true);
    setToastMessage('Link copied: Shopping consultation & selections saved');
    setTimeout(() => {
      setIsLinkCopied(false);
      setToastMessage(null);
    }, 2400);
  }, [messages, selectedCompareIds, cart]);

  // Submit query handler
  const handleSendMessage = (queryText: string) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add user message
    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: timeString
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Save to search history for personalized recommendations
    setSearchHistory(prev => {
      const updated = [queryText, ...prev.filter(q => q.toLowerCase() !== queryText.toLowerCase())].slice(0, 20);
      try {
        localStorage.setItem('mrw_query_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Process query with catalogue retrieval engine (with access to priceAlerts)
    setTimeout(() => {
      const assistantMessage = processUserQuery(queryText, currentEvidence, priceAlerts);

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      if (assistantMessage.evidence) {
        setCurrentEvidence(assistantMessage.evidence);
      }

      // If it's a comparison query, auto-populate compare IDs
      if (assistantMessage.evidence?.decisionReason === 'product_comparison' && assistantMessage.products) {
        setSelectedCompareIds(assistantMessage.products.map(p => p.id));
      }

      // Scroll to bottom
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 350);
  };

  const handleResetConversation = () => {
    setMessages([]);
    setCurrentEvidence(undefined);
    setSelectedCitationTarget(null);
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleSelectCitation = (targetId: string, type: 'product' | 'policy') => {
    setSelectedCitationTarget({ id: targetId, type });
    setIsEvidenceOpen(true);
  };

  const handleToggleCompare = (productId: string) => {
    setSelectedCompareIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: Math.min(newQty, item.product.stock) } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearBag = () => {
    setCart([]);
  };

  // Price Alert Handlers
  const handleSetPriceAlert = (product: Product, targetPrice: number) => {
    setPriceAlerts((prev) => {
      const filtered = prev.filter((a) => a.productId !== product.id);
      const newAlert: PriceAlert = {
        id: `alt-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        currentPrice: product.price,
        targetPrice,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      const updated = [...filtered, newAlert];
      try {
        localStorage.setItem('mrw_price_alerts', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setToastMessage(`Price alert set for ${product.name} at ≤ ${formatINR(targetPrice)}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemovePriceAlert = (productId: string) => {
    setPriceAlerts((prev) => {
      const updated = prev.filter((a) => a.productId !== productId);
      try {
        localStorage.setItem('mrw_price_alerts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setToastMessage('Price alert removed');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSimulatePriceDrop = (alert: PriceAlert) => {
    const newPrice = alert.targetPrice;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update product price in cart
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === alert.productId
          ? { ...item, product: { ...item.product, price: newPrice, originalPrice: alert.currentPrice } }
          : item
      )
    );

    // Mark alert as triggered
    setPriceAlerts((prev) => {
      const updated = prev.map((a) =>
        a.productId === alert.productId
          ? { ...a, status: 'triggered' as const, triggeredPrice: newPrice }
          : a
      );
      try {
        localStorage.setItem('mrw_price_alerts', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Notify user via assistant message in conversation
    const dropPercent = Math.round(((alert.currentPrice - newPrice) / alert.currentPrice) * 100);
    const notificationMessage: Message = {
      id: `alert-msg-${Date.now()}`,
      role: 'assistant',
      content: `Price Drop Notification: **${alert.productName}** [${alert.productId}] in your Shopping Bag has dropped from ${formatINR(alert.currentPrice)} to **${formatINR(newPrice)}** (${dropPercent}% off), reaching your configured threshold!

The discounted price has been updated in your Shopping Bag.`,
      timestamp: timeString,
      isPriceAlertNotification: true,
      alertDetails: {
        ...alert,
        status: 'triggered',
        triggeredPrice: newPrice
      },
      citations: [
        {
          id: alert.productId,
          type: 'product',
          label: `[${alert.productId}]`,
          title: alert.productName,
          targetId: alert.productId,
          preview: `Discounted to ${formatINR(newPrice)}`
        }
      ]
    };

    setMessages((prev) => [...prev, notificationMessage]);
    setIsBagOpen(false); // Return smoothly to conversation to view alert notification
    setToastMessage(`Price drop notification posted in conversation for ${alert.productName}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const compareProducts = selectedCompareIds
    .map((id) => findProductById(id))
    .filter((p): p is Product => p !== undefined);

  const cartTotalQuantity = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartProductIds = cart.map((i) => i.product.id);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#191919] flex flex-col font-sans selection:bg-[#246B52]/15 selection:text-[#191919] relative">
      {/* Slim, elegant top navigation bar */}
      <TopNav
        onOpenCatalogue={() => setIsCatalogueOpen(true)}
        onOpenPolicies={() => setIsPoliciesOpen(true)}
        onOpenBag={() => setIsBagOpen(true)}
        onToggleEvidence={() => setIsEvidenceOpen((prev) => !prev)}
        isEvidenceOpen={isEvidenceOpen}
        cartCount={cartTotalQuantity}
        isOnline={isOnline}
        selectedCompareCount={selectedCompareIds.length}
        onOpenCompare={() => setIsCompareModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-between">
        <main className="flex-1 pb-12">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSelectQuery={handleSendMessage}
              recommendedProducts={recommendations.products}
              recommendationTopic={recommendations.topicLabel}
              onAddToCart={handleAddToCart}
              cartProductIds={cartProductIds}
            />
          ) : (
            <ConversationArea
              messages={messages}
              isLoading={isLoading}
              onSelectQuery={handleSendMessage}
              onResetConversation={handleResetConversation}
              onSelectCitation={handleSelectCitation}
              selectedCompareIds={selectedCompareIds}
              onToggleCompare={handleToggleCompare}
              onAddToCart={handleAddToCart}
              cartProductIds={cartProductIds}
              onCopyShareLink={handleCopyShareLink}
              isLinkCopied={isLinkCopied}
              onOpenBag={() => setIsBagOpen(true)}
            />
          )}
        </main>

        {/* Message Composer anchored at bottom */}
        <MessageComposer
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Subtle feedback toast notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#191919] text-[#FAF9F6] px-4 py-2 rounded-md shadow-lg text-xs flex items-center gap-2 border border-[#333] transition-all">
          <Check className="w-3.5 h-3.5 text-[#246B52]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ground Truth Evidence Panel (Collapsible) */}
      <EvidencePanel
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        evidence={currentEvidence}
        selectedCitationTarget={selectedCitationTarget}
        onSelectCitationTarget={setSelectedCitationTarget}
        onAddToCart={handleAddToCart}
      />

      {/* Side-by-Side Comparison Modal */}
      <ComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        products={compareProducts}
        onRemoveProduct={(id) => setSelectedCompareIds((prev) => prev.filter((pId) => pId !== id))}
        onAddToCart={handleAddToCart}
        cartProductIds={cartProductIds}
      />

      {/* Full Store Catalogue Drawer */}
      <CatalogueDrawer
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        onAddToCart={handleAddToCart}
        cartProductIds={cartProductIds}
        onSelectForConversation={(q) => handleSendMessage(q)}
      />

      {/* Store Policies & Bylaws Modal */}
      <PoliciesModal
        isOpen={isPoliciesOpen}
        onClose={() => setIsPoliciesOpen(false)}
        onAskPolicyInChat={(q) => handleSendMessage(q)}
      />

      {/* Shopping Bag Drawer with Price Alert feature */}
      <BagDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearBag={handleClearBag}
        priceAlerts={priceAlerts}
        onSetPriceAlert={handleSetPriceAlert}
        onRemovePriceAlert={handleRemovePriceAlert}
        onSimulatePriceDrop={handleSimulatePriceDrop}
      />
    </div>
  );
}
