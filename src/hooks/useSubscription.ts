/**
 * useSubscription Hook - Subscription state management
 *
 * Provides subscription state, premium access check, and subscription actions.
 * Manages payment flow and subscription updates.
 */

import { useState, useEffect, useCallback } from 'react';
import { createSubscriptionService } from '@/services/stripe/subscription.service';
import type { SubscriptionService, CheckoutSession, PaymentResult } from '@/services/stripe/subscription.service';
import { ServiceError } from '@/services/errors/service-error';
import type {
  Subscription,
  SubscriptionState,
  TierLimits,
} from '@/types/subscription.types';
import { getTierLimits } from '@/types/subscription.types';

export interface UseSubscriptionReturn {
  // State
  subscription: Subscription | null;
  isPremium: boolean;
  isLoading: boolean;
  error: ServiceError | null;
  limits: TierLimits;

  // Actions
  upgradeToPremium: (userId: string) => Promise<void>;
  cancelSubscription: (userId: string) => Promise<void>;
  reactivateSubscription: (userId: string) => Promise<void>;
  refreshSubscription: (userId: string) => Promise<void>;
  clearError: () => void;
}

// Initialize subscription service
const subscriptionService: SubscriptionService = createSubscriptionService();

/**
 * T106: useSubscription hook for subscription state management
 */
export const useSubscription = (userId?: string): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ServiceError | null>(null);

  // Derived state
  const isPremium =
    subscription?.tier === 'premium' &&
    (subscription?.status === 'active' || subscription?.status === 'trialing');

  const limits = getTierLimits(subscription?.tier || 'free');

  /**
   * Load subscription on mount or when userId changes
   */
  useEffect(() => {
    const loadSubscription = async () => {
      if (!userId) {
        setSubscription(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const sub = await subscriptionService.getSubscription(userId);
        setSubscription(sub);
      } catch (err) {
        // Silent failure for subscription fetch
        // User might be on free tier without subscription record
        console.error('Failed to load subscription:', err);
        setSubscription(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, [userId]);

  /**
   * Upgrade to premium subscription
   *
   * Flow:
   * 1. Initialize checkout session
   * 2. Present payment sheet
   * 3. If successful, refresh subscription status
   */
  const upgradeToPremium = useCallback(async (uid: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Initialize checkout session
      const checkout: CheckoutSession = await subscriptionService.initializePremiumCheckout(uid);

      // Step 2: Present payment sheet
      const result: PaymentResult = await subscriptionService.presentPaymentSheet(
        checkout.clientSecret
      );

      if (!result.success) {
        if (result.error) {
          throw new ServiceError(
            result.error.code,
            result.error.message,
            new Error(result.error.message)
          );
        } else {
          throw new ServiceError(
            'PAYMENT_FAILED',
            'فشلت عملية الدفع', // Payment failed
            new Error('Payment was not successful')
          );
        }
      }

      // Step 3: Refresh subscription status (polls for webhook update)
      const updatedSubscription = await subscriptionService.refreshSubscriptionStatus(uid);
      setSubscription(updatedSubscription);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'SUBSCRIPTION_UPGRADE_FAILED',
        'فشل الترقية إلى الاشتراك المميز', // Failed to upgrade to premium subscription
        'حدث خطأ أثناء معالجة الترقية' // An error occurred during upgrade processing
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancel subscription
   *
   * Cancels at period end (user retains access until billing period ends)
   */
  const cancelSubscription = useCallback(async (uid: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await subscriptionService.cancelSubscription(uid);

      // Refresh subscription to get updated status
      const updatedSubscription = await subscriptionService.getSubscription(uid);
      setSubscription(updatedSubscription);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'SUBSCRIPTION_CANCEL_FAILED',
        'فشل إلغاء الاشتراك', // Failed to cancel subscription
        'حدث خطأ أثناء إلغاء الاشتراك' // An error occurred while canceling subscription
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reactivate subscription
   *
   * Only works if subscription was canceled but period hasn't ended yet
   */
  const reactivateSubscription = useCallback(async (uid: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedSubscription = await subscriptionService.reactivateSubscription(uid);
      setSubscription(updatedSubscription);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'SUBSCRIPTION_REACTIVATE_FAILED',
        'فشلت إعادة تفعيل الاشتراك', // Failed to reactivate subscription
        'حدث خطأ أثناء إعادة تفعيل الاشتراك' // An error occurred while reactivating subscription
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Manually refresh subscription status
   */
  const refreshSubscription = useCallback(async (uid: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedSubscription = await subscriptionService.getSubscription(uid);
      setSubscription(updatedSubscription);
    } catch (err) {
      const serviceError = err instanceof ServiceError ? err : new ServiceError(
        'SUBSCRIPTION_REFRESH_FAILED',
        'فشل تحديث حالة الاشتراك', // Failed to refresh subscription status
        'حدث خطأ أثناء تحديث الاشتراك' // An error occurred while refreshing subscription
      );
      setError(serviceError);
      throw serviceError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    subscription,
    isPremium,
    isLoading,
    error,
    limits,

    // Actions
    upgradeToPremium,
    cancelSubscription,
    reactivateSubscription,
    refreshSubscription,
    clearError,
  };
};
