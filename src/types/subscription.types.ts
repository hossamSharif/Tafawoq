/**
 * Subscription Type Definitions
 *
 * Types for subscription management and billing
 */

import type { UUID, Timestamp } from './common.types';

/**
 * Subscription tier levels
 */
export type SubscriptionTier = 'free' | 'premium';

/**
 * Subscription status states
 */
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete';

/**
 * User Subscription
 */
export interface Subscription {
  id: UUID;
  user_id: UUID;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trial_end_at?: Timestamp;
  current_period_start?: Timestamp;
  current_period_end?: Timestamp;
  canceled_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Subscription tier limits
 */
export interface TierLimits {
  tier: SubscriptionTier;
  examsPerWeek: number;
  practiceQuestionLimit: number;
  hasAdvancedAnalytics: boolean;
  hasSolutionExplanations: boolean;
  hasExportReports: boolean;
}

/**
 * Tier limits configuration
 */
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    tier: 'free',
    examsPerWeek: 1,
    practiceQuestionLimit: 5,
    hasAdvancedAnalytics: false,
    hasSolutionExplanations: false,
    hasExportReports: false,
  },
  premium: {
    tier: 'premium',
    examsPerWeek: Infinity, // Unlimited
    practiceQuestionLimit: 100,
    hasAdvancedAnalytics: true,
    hasSolutionExplanations: true,
    hasExportReports: true,
  },
};

/**
 * Get tier limits by subscription tier
 */
export const getTierLimits = (tier: SubscriptionTier): TierLimits => {
  return TIER_LIMITS[tier];
};

/**
 * Subscription upgrade data
 */
export interface SubscriptionUpgradeData {
  price_id: string; // Stripe Price ID
}

/**
 * Payment method information
 */
export interface PaymentMethod {
  id: string;
  brand: string; // 'visa', 'mastercard', etc.
  last4: string;
  exp_month: number;
  exp_year: number;
}

/**
 * Payment intent for checkout
 */
export interface PaymentIntent {
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

/**
 * Subscription eligibility check result
 */
export interface SubscriptionEligibility {
  canUpgrade: boolean;
  reason?: string; // Arabic message if cannot upgrade
}

/**
 * Subscription state for context
 */
export interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
  isPremium: boolean;
  limits: TierLimits;
}

/**
 * Billing information
 */
export interface BillingInfo {
  subscription: Subscription;
  next_billing_date?: Timestamp;
  amount: number;
  currency: string;
  payment_method?: PaymentMethod;
}
