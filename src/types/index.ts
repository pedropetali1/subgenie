export type Cycle =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual';

export type Category =
  | 'streaming'
  | 'music'
  | 'gaming'
  | 'fitness'
  | 'cloud'
  | 'food'
  | 'news'
  | 'education'
  | 'productivity'
  | 'finance'
  | 'other';

export type Plan = 'free' | 'premium';
export type Locale = 'pt-BR' | 'en';
export type Theme = 'dark' | 'light' | 'system';
export type BillingSource = 'web' | 'apple' | 'google' | 'other';

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  notification_days_before: number;
  notification_email: boolean;
  notification_push: boolean;
  locale: Locale;
  theme: Theme;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  price: number;
  currency: string;
  cycle: Cycle;
  category: Category;
  start_date: string;
  next_billing_date: string;
  notes: string | null;
  is_active: boolean;
  logo_url: string | null;
  cancel_url: string | null;
  shared_count: number;
  billing_source: BillingSource;
  created_at: string;
  updated_at: string;
}

export interface NotificationLogEntry {
  id: string;
  user_id: string;
  subscription_id: string;
  type: 'email' | 'push';
  sent_at: string;
  billing_date: string;
}
