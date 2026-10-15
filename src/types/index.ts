export interface Product {
  id: string; // e.g., 'CAT-SHIRT-01'
  name: string;
  category: 'Shirts' | 'Footwear' | 'Trousers' | 'Outerwear' | 'Accessories';
  price: number; // in INR (₹)
  originalPrice?: number;
  stock: number;
  inStock: boolean;
  rating?: number;
  reviewsCount?: number;
  attributes: string[]; // e.g., ['100% Organic Cotton', 'Regular Fit', 'Machine Wash']
  material: string;
  fit: string;
  care: string;
  color: string;
  description: string;
  sku: string;
  warranty: string;
}

export interface PolicySection {
  id: string; // e.g., 'POL-RET-01'
  title: string;
  category: 'Returns' | 'Shipping' | 'Price Match' | 'Warranty' | 'Sustainability' | 'Refusal';
  clause: string;
  summary: string;
  fullText: string;
}

export interface Citation {
  id: string;
  type: 'product' | 'policy';
  label: string; // e.g. '[CAT-SHIRT-01]' or '[Policy §1.1]'
  title: string;
  targetId: string;
  preview: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export type DecisionReason = 
  | 'catalogue_retrieval'
  | 'policy_lookup'
  | 'product_comparison'
  | 'clarification_needed'
  | 'scope_refusal'
  | 'price_alert'
  | 'empty_query';

export interface ClarificationOption {
  label: string;
  query: string;
}

export interface PriceAlert {
  id: string;
  productId: string;
  productName: string;
  currentPrice: number;
  targetPrice: number;
  createdAt: string;
  status: 'active' | 'triggered';
  triggeredPrice?: number;
}

export interface EvidenceData {
  retrievedProductIds: string[];
  retrievedPolicyIds: string[];
  relevanceScores: { id: string; score: number; label: string }[];
  citationValidationStatus: 'verified' | 'unverified' | 'not_applicable';
  decisionReason: DecisionReason;
  decisionExplanation: string;
  activeConstraints: {
    maxPrice?: number;
    category?: string;
    inStockOnly?: boolean;
    material?: string;
  };
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  products?: Product[];
  citations?: Citation[];
  clarificationOptions?: ClarificationOption[];
  isRefusal?: boolean;
  isPriceAlertNotification?: boolean;
  alertDetails?: PriceAlert;
  evidence?: EvidenceData;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
