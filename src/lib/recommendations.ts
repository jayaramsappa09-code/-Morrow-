import { CATALOGUE } from '../data/catalogue';
import { Product } from '../types';

export interface RecommendationResult {
  products: Product[];
  topicLabel: string;
}

export function getRecommendedProducts(historyQueries: string[]): RecommendationResult {
  // If no history, return 3 flagship products from primary categories
  if (!historyQueries || historyQueries.length === 0) {
    const defaultIds = ['CAT-SHIRT-01', 'CAT-SHOE-01', 'CAT-TRSR-01'];
    const defaults = defaultIds
      .map(id => CATALOGUE.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);

    return {
      products: defaults,
      topicLabel: 'Curated catalogue essentials'
    };
  }

  const combinedText = historyQueries.join(' ').toLowerCase();

  // Detect dominant topic
  let dominantTopic = 'apparel & footwear';
  if (/shirt|oxford|slub|voile|pima|cotton/i.test(combinedText)) {
    dominantTopic = 'cotton shirts & breathable weaves';
  } else if (/shoe|running|runner|trainer|pace|footwear/i.test(combinedText)) {
    dominantTopic = 'road running & athletic footwear';
  } else if (/trouser|chino|pant|wool|pleated/i.test(combinedText)) {
    dominantTopic = 'tailored trousers & chinos';
  } else if (/jacket|outerwear|coat|canvas/i.test(combinedText)) {
    dominantTopic = 'weather-resistant outerwear';
  } else if (/belt|leather|accessory/i.test(combinedText)) {
    dominantTopic = 'vegetable-tanned leather essentials';
  }

  // Tokenize keywords
  const tokens = combinedText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['find', 'what', 'which', 'show', 'under', 'with', 'these', 'two', 'are', 'the', 'for'].includes(t));

  // Score all products
  const scored = CATALOGUE.map(product => {
    let score = 0;
    const prodText = `${product.name} ${product.description} ${product.category} ${product.material} ${product.attributes.join(' ')}`.toLowerCase();

    for (const token of tokens) {
      if (prodText.includes(token)) {
        score += 15;
      }
    }

    // Boost in-stock products
    if (product.inStock) {
      score += 10;
    }

    // Boost high rated items
    if (product.rating && product.rating >= 4.7) {
      score += 5;
    }

    return { product, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score || b.product.price - a.product.price);

  // Take top 3 unique products
  const topProducts = scored.slice(0, 3).map(s => s.product);

  return {
    products: topProducts,
    topicLabel: `Based on your recent interest in ${dominantTopic}`
  };
}
