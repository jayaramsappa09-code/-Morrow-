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
import { Message, Product, CartItem, EvidenceData } from './types';
import { CATALOGUE, findProductById } from './data/catalogue';
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
            const reply = processUserQuery(q, lastEv);
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

    // 2. Process query with catalogue retrieval engine
    setTimeout(() => {
      const assistantMessage = processUserQuery(queryText, currentEvidence);

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

      {/* Shopping Bag Drawer */}
      <BagDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearBag={handleClearBag}
      />
    </div>
  );
}
