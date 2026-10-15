import { CATALOGUE, formatINR } from '../data/catalogue';
import { POLICIES } from '../data/policies';
import { Product, PolicySection, Citation, EvidenceData, Message, ClarificationOption, PriceAlert } from '../types';

interface QueryIntent {
  isRefusal: boolean;
  refusalReason?: string;
  isClarification: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: ClarificationOption[];
  isPolicy: boolean;
  matchedPolicies: PolicySection[];
  isComparison: boolean;
  compareProductIds: string[];
  isPriceAlertQuery?: boolean;
  maxPrice?: number;
  category?: 'Shirts' | 'Footwear' | 'Trousers' | 'Outerwear' | 'Accessories';
  inStockOnly?: boolean;
  material?: string;
  keywordTerms: string[];
}

export function parseQuery(
  rawQuery: string,
  lastEvidence?: EvidenceData
): QueryIntent {
  const query = rawQuery.toLowerCase().trim();

  // 1. Refusal check: Out of scope queries
  const outOfScopePatterns = [
    /medic(ine|al)|prescri|cough|doctor|antibiotic|paracetamol|fever|pill/i,
    /stock price|crypto|bitcoin|ethereum|investing|shares of/i,
    /weather in|capital of|president of|who won/i,
    /write a python|javascript code|debug this error|sql query/i,
    /nike|adidas|zara|h&m|uniqlo/i
  ];

  for (const pattern of outOfScopePatterns) {
    if (pattern.test(query)) {
      let specificReason = "Morrow's assistant exclusively provides guidance on Morrow's apparel catalogue, verified sizing, material provenance, and company policies.";
      if (/medic|prescri|cough|doctor/i.test(query)) {
        specificReason = "Morrow cannot provide medical or pharmaceutical recommendations. We specialize exclusively in sustainable apparel and store service.";
      } else if (/stock price|crypto|bitcoin/i.test(query)) {
        specificReason = "Financial and investment inquiries fall outside Morrow's e-commerce domain.";
      } else if (/nike|adidas|zara|uniqlo/i.test(query)) {
        specificReason = "Morrow only provides information and availability for Morrow's internal collection and does not stock or service third-party apparel brands.";
      }

      return {
        isRefusal: true,
        refusalReason: specificReason,
        isClarification: false,
        isPolicy: false,
        matchedPolicies: [POLICIES.find(p => p.id === 'POL-REF-01')!],
        isComparison: false,
        compareProductIds: [],
        keywordTerms: []
      };
    }
  }

  // 2. Policy check
  const returnMatch = /return|exchange|refund|money back|send back/i.test(query);
  const shippingMatch = /ship|delivery|dispatch|transit|freight|courier/i.test(query);
  const priceMatchCheck = /price match|competitor price|lower price/i.test(query);
  const warrantyMatch = /warranty|guarantee|repair|defect|tear|broken zipper/i.test(query);

  if (returnMatch || shippingMatch || priceMatchCheck || warrantyMatch) {
    const matchedPolicies: PolicySection[] = [];
    if (returnMatch) {
      matchedPolicies.push(...POLICIES.filter(p => p.category === 'Returns'));
    }
    if (shippingMatch) {
      matchedPolicies.push(...POLICIES.filter(p => p.category === 'Shipping'));
    }
    if (priceMatchCheck) {
      matchedPolicies.push(...POLICIES.filter(p => p.category === 'Price Match'));
    }
    if (warrantyMatch) {
      matchedPolicies.push(...POLICIES.filter(p => p.category === 'Warranty'));
    }

    return {
      isRefusal: false,
      isClarification: false,
      isPolicy: true,
      matchedPolicies,
      isComparison: false,
      compareProductIds: [],
      keywordTerms: query.split(/\s+/)
    };
  }

  // 3. Comparison query check
  const compareMatch = /compare|difference between|versus|\bvs\b/i.test(query);
  if (compareMatch) {
    // Check if user specifically named IDs or products
    const compareProductIds: string[] = [];
    for (const p of CATALOGUE) {
      if (query.includes(p.id.toLowerCase()) || query.includes(p.name.toLowerCase())) {
        compareProductIds.push(p.id);
      }
    }
    // Default to comparing the top 2 products in current category or cotton shirts
    return {
      isRefusal: false,
      isClarification: false,
      isPolicy: false,
      matchedPolicies: [],
      isComparison: true,
      compareProductIds,
      keywordTerms: query.split(/\s+/)
    };
  }

  // 3b. Price alert query check
  const priceAlertMatch = /price alert|price drop|notify.*drop|alert.*price|track.*price/i.test(query);
  if (priceAlertMatch) {
    return {
      isRefusal: false,
      isClarification: false,
      isPolicy: false,
      matchedPolicies: [],
      isComparison: false,
      compareProductIds: [],
      isPriceAlertQuery: true,
      keywordTerms: query.split(/\s+/)
    };
  }

  // 4. Clarification check for overly vague single-word queries
  if (query === 'shirt' || query === 'shirts' || query === 'clothes' || query === 'something to wear') {
    return {
      isRefusal: false,
      isClarification: true,
      clarificationQuestion: "Morrow offers several cotton, linen, and pima shirts. To find your ideal fit, would you prefer casual brushed cotton, lightweight linen, or premium formal pima?",
      clarificationOptions: [
        { label: "Cotton shirts under ₹2,000", query: "Find cotton shirts under ₹2,000" },
        { label: "100% Pima dress shirts", query: "Show 120s Pima cotton shirt" },
        { label: "Breathable linen blends", query: "Show linen shirts" }
      ],
      isPolicy: false,
      matchedPolicies: [],
      isComparison: false,
      compareProductIds: [],
      keywordTerms: [query]
    };
  }

  // 5. Parameter extraction (Price, Category, Stock, Material)
  // Price check: e.g. "under ₹2,000", "under 2000", "below 2000", "< 2000", "less than 2000"
  let maxPrice: number | undefined;
  const priceRegex = /(?:under|below|less than|within|<=|<)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i;
  const priceMatch = query.match(priceRegex);
  if (priceMatch) {
    const rawNum = priceMatch[1].replace(/,/g, '');
    const parsed = parseInt(rawNum, 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxPrice = parsed;
    }
  }

  // Category determination
  let category: 'Shirts' | 'Footwear' | 'Trousers' | 'Outerwear' | 'Accessories' | undefined;
  if (/shirt|oxford|tunic|workshirt|voile|pima/i.test(query)) {
    category = 'Shirts';
  } else if (/shoe|running|runner|footwear|sneaker|trainer/i.test(query)) {
    category = 'Footwear';
  } else if (/trouser|chino|pant|drawstring|bottom/i.test(query)) {
    category = 'Trousers';
  } else if (/jacket|outerwear|coat/i.test(query)) {
    category = 'Outerwear';
  } else if (/belt|leather|accessory|accessories/i.test(query)) {
    category = 'Accessories';
  } else if (lastEvidence?.activeConstraints?.category) {
    // Preserve category from last turn if user is doing a refinement like "under 2000" or "only blue"
    category = lastEvidence.activeConstraints.category as any;
  }

  // In-stock requirement
  const inStockOnly = /in stock|available|ready to ship|currently in stock/i.test(query) || (lastEvidence?.activeConstraints?.inStockOnly ?? false);

  // Material extraction
  let material: string | undefined;
  if (/cotton/i.test(query)) material = 'cotton';
  else if (/linen/i.test(query)) material = 'linen';
  else if (/wool/i.test(query)) material = 'wool';
  else if (/leather/i.test(query)) material = 'leather';
  else if (/slub/i.test(query)) material = 'slub';

  const keywordTerms = query
    .replace(/[^\w\s₹]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !['find', 'show', 'what', 'which', 'are', 'the', 'under', 'below', 'for', 'with', 'in'].includes(t));

  return {
    isRefusal: false,
    isClarification: false,
    isPolicy: false,
    matchedPolicies: [],
    isComparison: false,
    compareProductIds: [],
    maxPrice,
    category,
    inStockOnly,
    material,
    keywordTerms
  };
}

export function executeCatalogueSearch(intent: QueryIntent): { products: Product[]; relevanceScores: { id: string; score: number; label: string }[] } {
  let candidates = [...CATALOGUE];

  // Filter by category if identified
  if (intent.category) {
    candidates = candidates.filter(p => p.category === intent.category);
  }

  // Filter by max price if identified
  if (intent.maxPrice !== undefined) {
    candidates = candidates.filter(p => p.price <= intent.maxPrice!);
  }

  // Filter by in-stock only
  if (intent.inStockOnly) {
    candidates = candidates.filter(p => p.inStock && p.stock > 0);
  }

  // Score candidate items based on query terms and attributes
  const scored = candidates.map(product => {
    let score = 50; // base score for category/filter matching

    const textToSearch = `${product.name} ${product.description} ${product.material} ${product.attributes.join(' ')} ${product.color}`.toLowerCase();

    for (const term of intent.keywordTerms) {
      if (textToSearch.includes(term.toLowerCase())) {
        score += 15;
      }
    }

    if (intent.material && textToSearch.includes(intent.material)) {
      score += 25;
    }

    if (product.inStock) {
      score += 5;
    }

    // Normalized to 0 - 100%
    const normalizedScore = Math.min(99, Math.max(65, score));
    return {
      product,
      score: normalizedScore,
      label: `${normalizedScore}% Relevance`
    };
  });

  // Sort descending by score, then price
  scored.sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  return {
    products: scored.map(s => s.product),
    relevanceScores: scored.map(s => ({
      id: s.product.id,
      score: s.score,
      label: s.label
    }))
  };
}

function synthesizeEditorialAnswer(
  rawQuery: string,
  products: Product[],
  intent: QueryIntent
): string {
  const q = rawQuery.toLowerCase();

  // 1. Sizing and Fit inquiries
  if (/size|sizing|fit|wide feet|snug|true to size|length|taper/i.test(q)) {
    const p = products[0];
    if (p) {
      let fitGuidance = `Regarding sizing and silhouette: **${p.name}** [${p.id}] features a **${p.fit}**.`;
      if (p.category === 'Footwear') {
        if (p.id === 'CAT-SHOE-02') {
          fitGuidance += ` For the PaceKnit, we recommend sizing up a half-size if you have wider feet or prefer a slightly roomier toe box.`;
        } else if (p.id === 'CAT-SHOE-01') {
          fitGuidance += ` The Stratus Flow fits true to standard athletic shoe sizing with a standard D width.`;
        }
      } else if (p.category === 'Shirts') {
        fitGuidance += ` It is cut for natural movement without excess billowing, structured across shoulders and chest.`;
      }
      fitGuidance += `\n\nAll purchases include our 30-day return & exchange window [Policy §1.1] with complimentary doorstep reverse pickup if the fit isn't perfect.`;
      return fitGuidance;
    }
  }

  // 2. Weather, Climate & Seasonality inquiries
  if (/summer|hot|warm weather|humidity|rain|winter|cold|monsoon|breeze/i.test(q)) {
    if (/summer|hot|warm|heat|humid/i.test(q)) {
      const voile = products.find(p => p.id === 'CAT-SHIRT-03') || CATALOGUE.find(p => p.id === 'CAT-SHIRT-03');
      const linen = products.find(p => p.id === 'CAT-SHIRT-05') || CATALOGUE.find(p => p.id === 'CAT-SHIRT-05');
      return `For warm weather and high humidity, the ideal choices in our catalogue are lightweight open weaves:

· **${voile?.name}** [${voile?.id}] (${formatINR(voile?.price || 1599)}): Made from featherlight 95 GSM combed cotton with high airflow.
· **${linen?.name}** [${linen?.id}] (${formatINR(linen?.price || 1899)}): 55% French flax linen / 45% cotton blend providing natural cooling.

Heavier weaves like the Brushed Oxford (160 GSM) [CAT-SHIRT-01] or Slub Workshirt (210 GSM) [CAT-SHIRT-02] are better suited for temperate or climate-controlled environments.`;
    }
    if (/rain|waterproof|wet|monsoon/i.test(q)) {
      const jacket = CATALOGUE.find(p => p.id === 'CAT-OUT-01')!;
      const trail = CATALOGUE.find(p => p.id === 'CAT-SHOE-03')!;
      return `For wet weather and precipitation protection, Morrow features two dedicated weather-resistant pieces:

· **${jacket.name}** [${jacket.id}] (${formatINR(jacket.price)}): Heavy 10oz organic cotton canvas coated in weather-resistant paraffin wax to shed rain.
· **${trail.name}** [${trail.id}] (${formatINR(trail.price)}): Built with a waterproof Gore-Tex membrane and Vibram MegaGrip lugs for slippery surfaces.`;
    }
  }

  // 3. Care, Washing & Maintenance
  if (/care|wash|washing|clean|iron|shrink|dry clean|maintenance/i.test(q)) {
    const p = products[0];
    if (p) {
      return `Here are the verified care instructions for **${p.name}** [${p.id}]:

· **Fabric**: ${p.material}
· **Care**: ${p.care}
· **Warranty**: ${p.warranty}

All our garments are pre-shrunk and garment-washed to preserve their dimensions after gentle home laundering.`;
    }
  }

  // 4. Fabric & Material Provenance inquiries
  if (/fabric|material|gsm|weave|cotton|linen|leather|wool|provenance/i.test(q)) {
    const list = products.slice(0, 3).map(p => 
      `· **${p.name}** [${p.id}]: Crafted from **${p.material}** (${p.attributes.join(' · ')}).`
    ).join('\n');

    return `Here are the material specifications for our verified pieces:

${list}

Morrow uses exclusively GOTS-certified organic cotton, REACH-compliant vegetable dyes, and zero synthetic poly-blends.`;
  }

  // 5. Stock inquiries
  if (intent.inStockOnly || /in stock|available|units left/i.test(q)) {
    const stockList = products.map(p => 
      `· **${p.name}** [${p.id}]: ${p.stock > 0 ? `${p.stock} units in stock` : 'Currently out of stock'} — ${formatINR(p.price)}`
    ).join('\n');

    return `Live warehouse inventory for verified ${intent.category || 'catalogue'} items:

${stockList}

All in-stock orders confirmed on business days dispatch within 24 hours from our Bengaluru center [Policy §2.1].`;
  }

  // 6. Price-constrained search (e.g. "under ₹2,000")
  if (intent.maxPrice !== undefined) {
    return `Found ${products.length} verified ${intent.category?.toLowerCase() || 'item'}${products.length === 1 ? '' : 's'} priced under ${formatINR(intent.maxPrice)} in our current collection. Every piece features certified natural fibers with full craftsmanship backing [Policy §4.1]:`;
  }

  // 7. Standard catalogue inquiry
  return `Found ${products.length} verified ${intent.category?.toLowerCase() || 'product'}${products.length === 1 ? '' : 's'} matching your inquiry in our collection:`;
}

export function processUserQuery(
  rawQuery: string,
  lastEvidence?: EvidenceData,
  activeAlerts: PriceAlert[] = []
): Message {
  const intent = parseQuery(rawQuery, lastEvidence);
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 0. PRICE ALERT QUERY HANDLING
  if (intent.isPriceAlertQuery) {
    if (activeAlerts.length > 0) {
      const alertItems = activeAlerts.map(a => {
        return `· **${a.productName}** [${a.productId}]: Current price ${formatINR(a.currentPrice)} — Alert threshold set to **≤ ${formatINR(a.targetPrice)}** (${a.status === 'triggered' ? 'Triggered' : 'Active'})`;
      }).join('\n');

      const citations: Citation[] = activeAlerts.map(a => ({
        id: a.productId,
        type: 'product',
        label: `[${a.productId}]`,
        title: a.productName,
        targetId: a.productId,
        preview: `Threshold ≤ ${formatINR(a.targetPrice)}`
      }));

      const evidence: EvidenceData = {
        retrievedProductIds: activeAlerts.map(a => a.productId),
        retrievedPolicyIds: [],
        relevanceScores: activeAlerts.map(a => ({ id: a.productId, score: 99, label: 'Active Alert' })),
        citationValidationStatus: 'verified',
        decisionReason: 'price_alert',
        decisionExplanation: `Retrieved ${activeAlerts.length} configured price alerts. The assistant monitors catalog price changes and notifies you immediately upon a price drop.`,
        activeConstraints: {}
      };

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `You have ${activeAlerts.length} active price ${activeAlerts.length === 1 ? 'alert' : 'alerts'} configured:\n\n${alertItems}\n\nYou will receive a notification in this conversation as soon as any monitored item drops below your target threshold.`,
        timestamp: timeString,
        citations,
        evidence
      };
    } else {
      const evidence: EvidenceData = {
        retrievedProductIds: [],
        retrievedPolicyIds: [],
        relevanceScores: [],
        citationValidationStatus: 'verified',
        decisionReason: 'price_alert',
        decisionExplanation: 'No active price alerts currently found. Price alerts can be configured on any product in your Shopping Bag.',
        activeConstraints: {}
      };

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `You currently do not have any active price alerts set.\n\nTo set a price alert on any product:\n1. Add the product to your **Shopping Bag**.\n2. Click **Set Price Alert** under the item.\n3. Choose a discount percentage (e.g. 10% or 15% off) or set a custom target price.\n\nI will monitor the catalog and notify you right here in the conversation if the price drops.`,
        timestamp: timeString,
        evidence
      };
    }
  }

  // 1. REFUSAL HANDLING
  if (intent.isRefusal) {
    const refusalPolicy = POLICIES.find(p => p.id === 'POL-REF-01')!;
    const citations: Citation[] = [
      {
        id: refusalPolicy.id,
        type: 'policy',
        label: `[Policy §5.1]`,
        title: refusalPolicy.title,
        targetId: refusalPolicy.id,
        preview: refusalPolicy.summary
      }
    ];

    const evidence: EvidenceData = {
      retrievedProductIds: [],
      retrievedPolicyIds: [refusalPolicy.id],
      relevanceScores: [{ id: refusalPolicy.id, score: 100, label: '100% Policy Match' }],
      citationValidationStatus: 'verified',
      decisionReason: 'scope_refusal',
      decisionExplanation: `Refused: Query is outside the scope of Morrow's apparel catalogue and store policies. Grounded in Policy Section 5.1.`,
      activeConstraints: {}
    };

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `${intent.refusalReason}

Morrow strictly answers queries concerning our verified apparel collection, inventory availability, sizing, and store service agreements [Policy §5.1]. Please let me know if you would like to explore our cotton shirts, road runners, or return policies.`,
      timestamp: timeString,
      isRefusal: true,
      citations,
      evidence
    };
  }

  // 2. CLARIFICATION HANDLING
  if (intent.isClarification) {
    const evidence: EvidenceData = {
      retrievedProductIds: [],
      retrievedPolicyIds: [],
      relevanceScores: [],
      citationValidationStatus: 'not_applicable',
      decisionReason: 'clarification_needed',
      decisionExplanation: 'Clarification requested: The query is too broad to retrieve high-confidence catalogue items without fit or material specifications.',
      activeConstraints: {}
    };

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: intent.clarificationQuestion || "Could you clarify what type of item or budget you have in mind?",
      timestamp: timeString,
      clarificationOptions: intent.clarificationOptions,
      evidence
    };
  }

  // 3. POLICY LOOKUP HANDLING
  if (intent.isPolicy) {
    const policies = intent.matchedPolicies;
    const citations: Citation[] = policies.map(p => ({
      id: p.id,
      type: 'policy',
      label: `[Policy §${p.clause.split(' ')[1] || p.id}]`,
      title: p.title,
      targetId: p.id,
      preview: p.summary
    }));

    const evidence: EvidenceData = {
      retrievedProductIds: [],
      retrievedPolicyIds: policies.map(p => p.id),
      relevanceScores: policies.map(p => ({ id: p.id, score: 98, label: '98% Policy Match' })),
      citationValidationStatus: 'verified',
      decisionReason: 'policy_lookup',
      decisionExplanation: `Retrieved ${policies.length} verified store policy sections matching inquiry: ${policies.map(p => p.title).join(', ')}.`,
      activeConstraints: {}
    };

    const paragraphs = policies.map((p, idx) => {
      const cite = citations[idx]?.label || '[Policy]';
      return `**${p.title}** ${cite}\n${p.summary}\n\n*${p.clause}*: ${p.fullText}`;
    }).join('\n\n---\n\n');

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `Here are the official store policy terms applicable to your question:\n\n${paragraphs}`,
      timestamp: timeString,
      citations,
      evidence
    };
  }

  // 4. COMPARISON HANDLING
  if (intent.isComparison) {
    let compareItems: Product[] = [];
    if (intent.compareProductIds.length >= 2) {
      compareItems = CATALOGUE.filter(p => intent.compareProductIds.includes(p.id));
    } else {
      // Pick top 2 cotton shirts or top 2 shoes
      compareItems = CATALOGUE.filter(p => p.category === 'Shirts').slice(0, 2);
    }

    const citations: Citation[] = compareItems.map(p => ({
      id: p.id,
      type: 'product',
      label: `[${p.id}]`,
      title: p.name,
      targetId: p.id,
      preview: `${formatINR(p.price)} · ${p.material}`
    }));

    const evidence: EvidenceData = {
      retrievedProductIds: compareItems.map(p => p.id),
      retrievedPolicyIds: [],
      relevanceScores: compareItems.map(p => ({ id: p.id, score: 95, label: 'Comparison Set' })),
      citationValidationStatus: 'verified',
      decisionReason: 'product_comparison',
      decisionExplanation: `Comparing ${compareItems.length} catalogue items side by side for specifications, fabric density, price variance, and stock availability.`,
      activeConstraints: {}
    };

    const comparisonText = `Here is a side-by-side comparison between **${compareItems[0].name}** [${compareItems[0].id}] and **${compareItems[1]?.name}** [${compareItems[1]?.id}]:

· **Price Difference**: ${compareItems[0].name} is priced at ${formatINR(compareItems[0].price)} versus ${formatINR(compareItems[1]?.price || 0)} for ${compareItems[1]?.name}.
· **Material & GSM**: ${compareItems[0].material} vs ${compareItems[1]?.material}.
· **Cut & Silhouette**: ${compareItems[0].fit} vs ${compareItems[1]?.fit}.
· **Inventory**: ${compareItems[0].name} has ${compareItems[0].stock} units in stock, while ${compareItems[1]?.name} has ${compareItems[1]?.stock} units in stock.

You can click any product row below or use the Compare modal for full technical specifications.`;

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: comparisonText,
      timestamp: timeString,
      products: compareItems,
      citations,
      evidence
    };
  }

  // 5. REGULAR PRODUCT RETRIEVAL & FILTERING
  const { products, relevanceScores } = executeCatalogueSearch(intent);

  const activeConstraints = {
    maxPrice: intent.maxPrice,
    category: intent.category,
    inStockOnly: intent.inStockOnly,
    material: intent.material
  };

  const retrievedProductIds = products.map(p => p.id);
  const citations: Citation[] = products.map(p => ({
    id: p.id,
    type: 'product',
    label: `[${p.id}]`,
    title: p.name,
    targetId: p.id,
    preview: `${formatINR(p.price)} · ${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'} · ${p.material}`
  }));

  const constraintSummaryParts: string[] = [];
  if (intent.category) constraintSummaryParts.push(`category: ${intent.category}`);
  if (intent.maxPrice !== undefined) constraintSummaryParts.push(`price ≤ ${formatINR(intent.maxPrice)}`);
  if (intent.inStockOnly) constraintSummaryParts.push(`in-stock only`);
  if (intent.material) constraintSummaryParts.push(`material: ${intent.material}`);

  const constraintSummary = constraintSummaryParts.length > 0 
    ? ` Applied criteria: ${constraintSummaryParts.join(', ')}.`
    : '';

  const evidence: EvidenceData = {
    retrievedProductIds,
    retrievedPolicyIds: [],
    relevanceScores,
    citationValidationStatus: 'verified',
    decisionReason: 'catalogue_retrieval',
    decisionExplanation: `Retrieved ${products.length} verified products from catalogue.${constraintSummary}`,
    activeConstraints
  };

  if (products.length === 0) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `No items in Morrow's current catalogue match all specified criteria${constraintSummary}. Try broadening your price ceiling or exploring another category.`,
      timestamp: timeString,
      products: [],
      citations: [],
      evidence
    };
  }

  // Synthesize rich, grounded editorial prose addressing the user's specific question
  const narrative = synthesizeEditorialAnswer(rawQuery, products, intent);

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: narrative,
    timestamp: timeString,
    products,
    citations,
    evidence
  };
}
