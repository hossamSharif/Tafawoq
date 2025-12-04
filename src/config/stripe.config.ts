import { initStripe, StripeProvider } from '@stripe/stripe-react-native';

// Environment variables validation
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Stripe environment variable. Please check your .env file contains:\n' +
    '- EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  );
}

/**
 * Initialize Stripe SDK
 *
 * This should be called once during app initialization (in App.tsx)
 * before any payment operations.
 *
 * Usage:
 * ```typescript
 * import { initializeStripe } from '@/config/stripe.config';
 *
 * // In App.tsx
 * useEffect(() => {
 *   initializeStripe();
 * }, []);
 * ```
 */
export const initializeStripe = async (): Promise<void> => {
  try {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.tafawoq', // iOS Apple Pay
      urlScheme: 'tafawoq', // For returning from payment flow
    });
    console.log('✅ Stripe SDK initialized');
  } catch (error) {
    console.error('❌ Stripe initialization failed:', error);
    throw error;
  }
};

/**
 * Stripe configuration constants
 */
export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,

  /**
   * Premium subscription price ID (from Stripe Dashboard)
   * Set via environment variable EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID
   */
  premiumPriceId: process.env.EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID || '',

  /**
   * Supported payment methods
   */
  paymentMethods: ['card'] as const,

  /**
   * Stripe test card numbers for development
   * @see https://stripe.com/docs/testing#cards
   */
  testCards: {
    success: '4242424242424242',
    declined: '4000000000000002',
    insufficientFunds: '4000000000009995',
    requiresAuthentication: '4000002500003155',
  },
};

/**
 * Export StripeProvider for wrapping the app
 *
 * Usage in App.tsx:
 * ```typescript
 * import { StripeProvider } from '@/config/stripe.config';
 *
 * export default function App() {
 *   return (
 *     <StripeProvider publishableKey={stripeConfig.publishableKey}>
 *       <YourAppComponents />
 *     </StripeProvider>
 *   );
 * }
 * ```
 */
export { StripeProvider };
