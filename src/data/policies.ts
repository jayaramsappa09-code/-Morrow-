import { PolicySection } from '../types';

export const POLICIES: PolicySection[] = [
  {
    id: 'POL-RET-01',
    category: 'Returns',
    title: '30-Day Return & Exchange Window',
    clause: 'Section 1.1 — Return Eligibility and Timeframes',
    summary: 'Orders are eligible for return or exchange within 30 calendar days of delivery in original, unworn condition with tags attached.',
    fullText: 'All unworn, unwashed garments and footwear with original tags and packaging intact may be returned or exchanged within 30 calendar days of confirmed delivery. Footwear must be tested indoors on clean surfaces and returned inside the protective dust bag and original box.'
  },
  {
    id: 'POL-RET-02',
    category: 'Returns',
    title: 'Free Reverse Pickup & Refund Processing',
    clause: 'Section 1.2 — Logistics & Reimbursement',
    summary: 'Complimentary doorstep reverse pickup across all serviceable pincodes in India. Refunds are processed within 5–7 business days to the original payment method.',
    fullText: 'Morrow provides free doorstep reverse pickups via insured courier partners. Once our fulfillment center inspects the returned items (typically within 48 hours of receipt), refunds are issued immediately to your original payment method or instant store credit upon request. Bank processing takes 5–7 business days.'
  },
  {
    id: 'POL-SHP-01',
    category: 'Shipping',
    title: 'Free Delivery Threshold & Standard Transit',
    clause: 'Section 2.1 — Shipping Rates and Delivery Timelines',
    summary: 'Free standard shipping on all orders over ₹1,500. Standard delivery takes 3–5 business days with 24-hour dispatch.',
    fullText: 'Standard domestic shipping is complimentary on all orders totaling ₹1,500 or more. For orders below ₹1,500, a flat shipping fee of ₹99 applies. Orders are dispatched from our Bengaluru fulfillment center within 24 hours of placement on business days, delivering across metro zones in 3–5 business days.'
  },
  {
    id: 'POL-SHP-02',
    category: 'Shipping',
    title: 'Express Delivery Option',
    clause: 'Section 2.2 — Priority Air Dispatch',
    summary: 'Priority express air delivery is available for ₹199, arriving within 1–2 business days in major metropolitan areas.',
    fullText: 'Expedited air courier dispatch is available at checkout for ₹199. Orders confirmed before 1:00 PM IST dispatch the same afternoon, arriving within 1–2 business days across Delhi NCR, Mumbai, Bengaluru, Chennai, and Hyderabad.'
  },
  {
    id: 'POL-PRC-01',
    category: 'Price Match',
    title: '14-Day Authorized Price Match Guarantee',
    clause: 'Section 3.1 — Competitive Price Assurance',
    summary: 'We match authorized retail prices for identical in-stock products within 14 days of purchase.',
    fullText: 'If you locate an identical, authentic product (same color, SKU, and size) offered at a lower price by an authorized Indian retailer, Morrow will gladly match the price or refund the difference within 14 calendar days of your purchase date upon verification.'
  },
  {
    id: 'POL-WAR-01',
    category: 'Warranty',
    title: '1-Year Craftsmanship Guarantee',
    clause: 'Section 4.1 — Manufacturing Defect Coverage',
    summary: 'Every Morrow garment and accessory includes a 1-year warranty against seam separation, hardware failure, and fabric defects.',
    fullText: 'Morrow stands behind the construction of our garments. We provide complimentary professional repair or replacement for any manufacturing defect, broken zipper, torn seam, or hardware failure occurring within 365 days of purchase under normal usage.'
  },
  {
    id: 'POL-REF-01',
    category: 'Refusal',
    title: 'Scope of Assistance Policy',
    clause: 'Section 5.1 — Boundary of Assistant Knowledge',
    summary: 'Morrow assistant exclusively supports Morrow catalog items, sizing, materials, inventory, and company policies.',
    fullText: 'The Morrow assistant is strictly grounded in our internal product catalog, sizing specifications, material provenance, live inventory, and documented store policies. Queries pertaining to non-Morrow merchandise, medical/pharmacological advice, financial investments, or unrelated topics are refused with a respectful explanation.'
  }
];

export function findPolicyById(id: string): PolicySection | undefined {
  const norm = id.trim().toUpperCase();
  return POLICIES.find(p => p.id === norm);
}
