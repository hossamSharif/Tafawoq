/**
 * Subscription Service
 *
 * Handles subscription management and Stripe payment integration
 * per client-services.md contract.
 */

import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { supabase } from '@/config/supabase.config';
import { stripeConfig } from '@/config/stripe.config';
import type {
  Subscription,
  SubscriptionTier,
  SubscriptionStatus,
} from '@/types/subscription.types';
import { ServiceError } from '../errors/service-error';

/**
 * Checkout session data returned from server
 */
export interface CheckoutSession {
  clientSecret: string;
  ephemeralKey: string;
  customerId: string;
}

/**
 * Payment result after presenting payment sheet
 */
export interface PaymentResult {
  success: boolean;
  error?: PaymentError;
}

/**
 * Payment error details
 */
export interface PaymentError {
  code: string;
  message: string;
  declineCode?: string;
}

/**
 * SubscriptionService Interface
 * Implements client-services.md contract for subscription management
 */
export interface SubscriptionService {
  /**
   * Get current user's subscription details
   */
  getSubscription(userId: string): Promise<Subscription | null>;

  /**
   * Check if user has premium access
   */
  hasPremiumAccess(userId: string): Promise<boolean>;

  /**
   * Initialize Stripe Payment Sheet for premium upgrade
   */
  initializePremiumCheckout(userId: string): Promise<CheckoutSession>;

  /**
   * Present Stripe Payment Sheet
   */
  presentPaymentSheet(clientSecret: string): Promise<PaymentResult>;

  /**
   * Cancel subscription (effective at period end)
   */
  cancelSubscription(userId: string): Promise<void>;

  /**
   * Reactivate canceled subscription
   */
  reactivateSubscription(userId: string): Promise<Subscription>;

  /**
   * Get subscription status (polls Supabase for webhook updates)
   */
  refreshSubscriptionStatus(userId: string): Promise<Subscription>;
}

/**
 * SupabaseSubscriptionService implementation
 *
 * Integrates with:
 * - Supabase database for subscription data
 * - Stripe Payment Sheet for checkout flow
 * - Stripe webhooks for subscription sync (via Edge Function)
 */
export class SupabaseSubscriptionService implements SubscriptionService {
  /**
   * Get current user's subscription details
   */
  async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // User may not have a subscription record yet (new user)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new ServiceError(
          'SUBSCRIPTION_FETCH_FAILED',
          'فشل في جلب بيانات الاشتراك', // Failed to fetch subscription data
          error
        );
      }

      if (!data) {
        return null;
      }

      // Transform database response to Subscription type
      return {
        id: data.id,
        user_id: data.user_id,
        stripe_customer_id: data.stripe_customer_id,
        stripe_subscription_id: data.stripe_subscription_id,
        tier: data.tier as SubscriptionTier,
        status: data.status as SubscriptionStatus,
        trial_end_at: data.trial_end_at,
        current_period_start: data.current_period_start,
        current_period_end: data.current_period_end,
        canceled_at: data.canceled_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(
        'SUBSCRIPTION_FETCH_ERROR',
        'حدث خطأ أثناء جلب بيانات الاشتراك', // An error occurred while fetching subscription data
        error
      );
    }
  }

  /**
   * Check if user has premium access
   *
   * Premium access is granted if:
   * - Tier is 'premium'
   * - Status is 'active' or 'trialing'
   */
  async hasPremiumAccess(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(userId);

      if (!subscription) {
        return false;
      }

      return (
        subscription.tier === 'premium' &&
        (subscription.status === 'active' || subscription.status === 'trialing')
      );
    } catch (error) {
      // Default to false if error
      console.error('Error checking premium access:', error);
      return false;
    }
  }

  /**
   * Initialize Stripe Payment Sheet for premium upgrade
   *
   * Flow:
   * 1. Call Supabase Edge Function to create Stripe checkout session
   * 2. Edge Function creates/retrieves Stripe Customer
   * 3. Edge Function creates ephemeral key and payment intent
   * 4. Return checkout session data to client
   */
  async initializePremiumCheckout(userId: string): Promise<CheckoutSession> {
    try {
      // Call Supabase Edge Function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          user_id: userId,
          price_id: stripeConfig.premiumPriceId,
        },
      });

      if (error) {
        throw new ServiceError(
          'CHECKOUT_INIT_FAILED',
          'فشل في إنشاء جلسة الدفع', // Failed to create payment session
          error
        );
      }

      if (!data || !data.clientSecret || !data.ephemeralKey || !data.customerId) {
        throw new ServiceError(
          'CHECKOUT_INVALID_RESPONSE',
          'استجابة خاطئة من خادم الدفع', // Invalid response from payment server
          new Error('Missing required checkout session fields')
        );
      }

      return {
        clientSecret: data.clientSecret,
        ephemeralKey: data.ephemeralKey,
        customerId: data.customerId,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(
        'CHECKOUT_ERROR',
        'حدث خطأ أثناء إعداد الدفع', // An error occurred during payment setup
        error
      );
    }
  }

  /**
   * Present Stripe Payment Sheet
   *
   * Steps:
   * 1. Initialize payment sheet with client secret
   * 2. Present payment sheet to user
   * 3. Return result (success/error)
   */
  async presentPaymentSheet(clientSecret: string): Promise<PaymentResult> {
    try {
      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Tafawoq',
        allowsDelayedPaymentMethods: false,
        returnURL: 'tafawoq://payment-complete',
      });

      if (initError) {
        return {
          success: false,
          error: {
            code: initError.code,
            message: this.getArabicPaymentError(initError.code),
          },
        };
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User canceled payment
        if (presentError.code === 'Canceled') {
          return {
            success: false,
            error: {
              code: 'PAYMENT_CANCELED',
              message: 'تم إلغاء عملية الدفع', // Payment was canceled
            },
          };
        }

        return {
          success: false,
          error: {
            code: presentError.code,
            message: this.getArabicPaymentError(presentError.code),
          },
        };
      }

      // Payment successful
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PAYMENT_ERROR',
          message: 'حدث خطأ أثناء معالجة الدفع', // An error occurred during payment processing
        },
      };
    }
  }

  /**
   * Cancel subscription (effective at period end)
   *
   * Stripe subscription will remain active until current period ends
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      const subscription = await this.getSubscription(userId);

      if (!subscription) {
        throw new ServiceError(
          'NO_SUBSCRIPTION',
          'لا يوجد اشتراك نشط', // No active subscription
          new Error('Subscription not found')
        );
      }

      if (!subscription.stripe_subscription_id) {
        throw new ServiceError(
          'INVALID_SUBSCRIPTION',
          'اشتراك غير صالح', // Invalid subscription
          new Error('Missing Stripe subscription ID')
        );
      }

      // Call Supabase Edge Function to cancel Stripe subscription
      const { error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          user_id: userId,
          subscription_id: subscription.stripe_subscription_id,
        },
      });

      if (error) {
        throw new ServiceError(
          'CANCEL_FAILED',
          'فشل في إلغاء الاشتراك', // Failed to cancel subscription
          error
        );
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(
        'CANCEL_ERROR',
        'حدث خطأ أثناء إلغاء الاشتراك', // An error occurred while canceling subscription
        error
      );
    }
  }

  /**
   * Reactivate canceled subscription
   *
   * Only works if subscription hasn't reached period end yet
   */
  async reactivateSubscription(userId: string): Promise<Subscription> {
    try {
      const subscription = await this.getSubscription(userId);

      if (!subscription) {
        throw new ServiceError(
          'NO_SUBSCRIPTION',
          'لا يوجد اشتراك', // No subscription
          new Error('Subscription not found')
        );
      }

      if (!subscription.stripe_subscription_id) {
        throw new ServiceError(
          'INVALID_SUBSCRIPTION',
          'اشتراك غير صالح', // Invalid subscription
          new Error('Missing Stripe subscription ID')
        );
      }

      // Call Supabase Edge Function to reactivate Stripe subscription
      const { data, error } = await supabase.functions.invoke('reactivate-subscription', {
        body: {
          user_id: userId,
          subscription_id: subscription.stripe_subscription_id,
        },
      });

      if (error) {
        throw new ServiceError(
          'REACTIVATE_FAILED',
          'فشل في إعادة تفعيل الاشتراك', // Failed to reactivate subscription
          error
        );
      }

      // Refresh subscription from database after reactivation
      const updatedSubscription = await this.getSubscription(userId);

      if (!updatedSubscription) {
        throw new ServiceError(
          'SUBSCRIPTION_NOT_FOUND',
          'لم يتم العثور على الاشتراك بعد إعادة التفعيل', // Subscription not found after reactivation
          new Error('Failed to fetch updated subscription')
        );
      }

      return updatedSubscription;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(
        'REACTIVATE_ERROR',
        'حدث خطأ أثناء إعادة تفعيل الاشتراك', // An error occurred while reactivating subscription
        error
      );
    }
  }

  /**
   * Refresh subscription status from database
   *
   * Polls Supabase to get latest subscription data after webhook processing
   * Used after payment completion to wait for webhook to update database
   */
  async refreshSubscriptionStatus(userId: string): Promise<Subscription> {
    try {
      // Poll with exponential backoff (max 3 attempts)
      const maxAttempts = 3;
      const delays = [1000, 2000, 3000]; // 1s, 2s, 3s

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Wait before polling (except first attempt)
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, delays[attempt - 1]));
        }

        const subscription = await this.getSubscription(userId);

        if (subscription && subscription.tier === 'premium') {
          return subscription;
        }
      }

      // If still not premium after polling, fetch final state
      const finalSubscription = await this.getSubscription(userId);

      if (!finalSubscription) {
        throw new ServiceError(
          'SUBSCRIPTION_NOT_FOUND',
          'لم يتم العثور على الاشتراك', // Subscription not found
          new Error('Subscription not found after refresh')
        );
      }

      return finalSubscription;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw new ServiceError(
        'REFRESH_ERROR',
        'حدث خطأ أثناء تحديث حالة الاشتراك', // An error occurred while refreshing subscription status
        error
      );
    }
  }

  /**
   * Get Arabic error message for Stripe payment error codes
   */
  private getArabicPaymentError(code: string): string {
    const errorMessages: Record<string, string> = {
      Canceled: 'تم إلغاء عملية الدفع',
      Failed: 'فشلت عملية الدفع',
      'card_declined': 'تم رفض البطاقة',
      'insufficient_funds': 'رصيد غير كافٍ',
      'expired_card': 'البطاقة منتهية الصلاحية',
      'incorrect_cvc': 'رمز الأمان غير صحيح',
      'processing_error': 'خطأ في معالجة الدفع',
      'invalid_expiry_year': 'سنة انتهاء الصلاحية غير صحيحة',
      'invalid_expiry_month': 'شهر انتهاء الصلاحية غير صحيح',
      'invalid_number': 'رقم البطاقة غير صحيح',
      'network_error': 'خطأ في الاتصال',
    };

    return errorMessages[code] || 'حدث خطأ أثناء معالجة الدفع';
  }
}

/**
 * Create subscription service instance
 */
export const createSubscriptionService = (): SubscriptionService => {
  return new SupabaseSubscriptionService();
};
