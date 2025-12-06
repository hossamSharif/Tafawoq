/**
 * Stripe Webhook Handler Edge Function
 *
 * Processes Stripe webhook events for subscription lifecycle management
 * per supabase-rpc.md contract.
 *
 * Handles:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_failed
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno';

// Environment variables
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables');
}

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Verify Stripe webhook signature
 */
function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event | null {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET!
    );
    return event;
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return null;
  }
}

/**
 * Handle customer.subscription.created event
 *
 * Updates user_subscriptions to premium tier
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  // Find user by Stripe customer ID
  const { data: existingSubscription, error: fetchError } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (fetchError) {
    console.error('Error fetching user subscription:', fetchError);
    throw new Error('User not found for customer ID: ' + customerId);
  }

  const userId = existingSubscription.user_id;

  // Update subscription to premium
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      tier: 'premium',
      status: subscription.status,
      trial_end_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (updateError) {
    console.error('Error updating subscription:', updateError);
    throw updateError;
  }

  // Ensure user_analytics row exists
  const { error: analyticsError } = await supabase
    .from('user_analytics')
    .upsert({
      user_id: userId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: true,
    });

  if (analyticsError) {
    console.error('Error creating user analytics:', analyticsError);
    // Non-critical error, don't throw
  }

  console.log(`✅ Subscription created for user ${userId}, tier: premium`);
}

/**
 * Handle customer.subscription.updated event
 *
 * Updates subscription status and cancellation data
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer.id;

  // Determine if subscription should be downgraded immediately
  const shouldDowngrade =
    subscription.status === 'canceled' && !subscription.cancel_at_period_end;

  const updateData: any = {
    status: subscription.status,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  // Downgrade to free tier if canceled immediately
  if (shouldDowngrade) {
    updateData.tier = 'free';
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  console.log(`✅ Subscription updated: ${subscription.id}, status: ${subscription.status}`);
}

/**
 * Handle customer.subscription.deleted event
 *
 * Downgrades user to free tier
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      tier: 'free',
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }

  console.log(`✅ Subscription deleted: ${subscription.id}, downgraded to free tier`);
}

/**
 * Handle invoice.payment_failed event
 *
 * Marks subscription as past_due
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id;

  if (!subscriptionId) {
    console.warn('No subscription ID in payment failed event');
    return;
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error marking subscription as past_due:', error);
    throw error;
  }

  console.log(`⚠️ Payment failed for subscription: ${subscriptionId}`);

  // TODO: Trigger notification to user about payment failure
  // This can be implemented in a future enhancement
}

/**
 * Main webhook handler
 */
serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Get request body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature);

    if (!event) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`📨 Received webhook event: ${event.type}`);

    // Handle different event types
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }
    } catch (processingError) {
      // Log processing error but still return 200 to acknowledge receipt
      console.error('❌ Error processing webhook event:', processingError);
      // Return 200 to prevent Stripe from retrying
      // Manual reconciliation will be needed via Supabase logs
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
