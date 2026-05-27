import type { Plan } from '@/types';
import { FREE_LIMITS } from './constants';

export function isPremium(plan: Plan): boolean {
  return plan === 'premium';
}

export function canAddSubscription(plan: Plan, currentCount: number): boolean {
  if (isPremium(plan)) return true;
  return currentCount < FREE_LIMITS.maxSubscriptions;
}

/** Free só pode receber alerta 1 dia antes. Premium até 7 dias. */
export const MAX_NOTIFICATION_DAYS_FREE = 1;
export const MAX_NOTIFICATION_DAYS_PREMIUM = 7;

export function maxNotificationDaysFor(plan: Plan): number {
  return isPremium(plan)
    ? MAX_NOTIFICATION_DAYS_PREMIUM
    : MAX_NOTIFICATION_DAYS_FREE;
}

/** Valores sugeridos no select de "Avisar com antecedência de". */
export function notificationDayOptionsFor(plan: Plan): number[] {
  return isPremium(plan) ? [1, 3, 7] : [1];
}
