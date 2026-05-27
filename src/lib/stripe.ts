import Stripe from 'stripe';

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cached) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY não configurada');
    }
    cached = new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
  }
  return cached;
}

export const PREMIUM_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
