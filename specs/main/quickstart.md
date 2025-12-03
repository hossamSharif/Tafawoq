# Quickstart Guide

**Feature**: Tafawoq - Saudi Aptitude Exam Preparation Platform
**Date**: 2025-12-03
**Target Audience**: Developers setting up the project for the first time

## Overview

This quickstart guide walks you through setting up the Tafawoq React Native mobile application from initial environment setup to running the app on a simulator/emulator with all external services configured.

**Estimated Setup Time**: 60-90 minutes

---

## Prerequisites

### Required Software

1. **Node.js 18+ and npm**
   ```bash
   node --version  # Should be >= 18.0.0
   npm --version
   ```

2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **iOS Development (macOS only)**
   - Xcode 14+ (from Mac App Store)
   - iOS Simulator (included with Xcode)
   - CocoaPods: `sudo gem install cocoapods`

4. **Android Development**
   - Android Studio
   - Android SDK Platform 33+
   - Android Emulator (configured via Android Studio AVD Manager)

5. **Git**
   ```bash
   git --version
   ```

### Required Accounts

1. **Supabase Account** (free tier sufficient for development)
   - Create account at https://supabase.com

2. **Stripe Account** (test mode)
   - Create account at https://stripe.com

3. **Google Cloud Account** (for Gemini AI)
   - Create account and enable Generative AI API at https://console.cloud.google.com

---

## Step 1: Clone Repository

```bash
git clone https://github.com/your-org/tafawoq.git
cd tafawoq
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies including:
- React Native (via Expo)
- React Native Paper
- Supabase client
- Stripe React Native
- Google Generative AI SDK
- Navigation libraries

---

## Step 3: Configure Supabase

### 3.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project details:
   - **Name**: tafawoq-dev
   - **Database Password**: (generate strong password and save it)
   - **Region**: Choose closest to your location
4. Wait 2-3 minutes for project initialization

### 3.2 Enable pgvector Extension

1. In Supabase dashboard, go to **Database** → **Extensions**
2. Search for "vector" and enable the extension

### 3.3 Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Create tables from specs/main/data-model.md:
   - Copy SQL schema from data-model.md
   - Execute in SQL Editor
   - Verify tables created under **Database** → **Tables**

### 3.4 Enable Row Level Security (RLS)

1. For each table, enable RLS via SQL Editor:
   ```sql
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
   -- Repeat for all tables
   ```

2. Add RLS policies from data-model.md

### 3.5 Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "New Bucket"
3. Name: `question-assets` (for generated images)
4. Set to **Public** bucket
5. Create another bucket: `profile-pictures` (Private)

### 3.6 Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., https://abcdefghijk.supabase.co)
   - **anon public** key
   - **service_role** key (keep secret, only for Edge Functions)

---

## Step 4: Configure Stripe

### 4.1 Get API Keys

1. Go to https://dashboard.stripe.com
2. Switch to **Test Mode** (toggle in sidebar)
3. Go to **Developers** → **API Keys**
4. Copy:
   - **Publishable key** (starts with pk_test_)
   - **Secret key** (starts with sk_test_) - keep secret

### 4.2 Create Product and Price

1. Go to **Products** → **Add Product**
2. Create "Tafawoq Premium Monthly" product
3. Set price: Choose appropriate SAR amount (e.g., 49.99 SAR/month)
4. Enable recurring billing
5. Copy **Price ID** (starts with price_)

### 4.3 Configure Webhook

1. Go to **Developers** → **Webhooks**
2. Click "Add Endpoint"
3. Endpoint URL: `https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/stripe-webhook-handler`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy **Webhook Signing Secret** (starts with whsec_)

---

## Step 5: Configure Gemini AI

### 5.1 Enable Generative AI API

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Go to **APIs & Services** → **Library**
4. Search for "Generative Language API" and enable it

### 5.2 Get API Key

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "API Key"
3. Copy the API key (starts with AIza...)
4. **Recommended**: Restrict the key to Generative Language API only

### 5.3 Set Quotas (Optional for Paid Tier)

1. Go to **IAM & Admin** → **Quotas**
2. Search for "Generative Language API"
3. Request quota increase if needed (default free tier sufficient for development)

---

## Step 6: Environment Configuration

### 6.1 Create Environment File

Create `.env` file in project root:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # For Edge Functions only

# Stripe Configuration (Test Mode)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...  # For Edge Functions only
STRIPE_WEBHOOK_SECRET=whsec_...  # For Edge Functions only
EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_...

# Gemini AI Configuration
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_TIMEOUT=30000
```

**Security Note**: `.env` is git-ignored by default. Never commit API keys to version control.

### 6.2 Validate Environment

Create a simple validation script `scripts/validate-env.js`:

```javascript
const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_GEMINI_API_KEY'
];

const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

Run validation:
```bash
node scripts/validate-env.js
```

---

## Step 7: Deploy Supabase Edge Functions

### 7.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 7.2 Link Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
# Enter database password when prompted
```

### 7.3 Deploy Edge Functions

```bash
# Deploy Stripe webhook handler
supabase functions deploy stripe-webhook-handler --no-verify-jwt

# Deploy exam question generator
supabase functions deploy generate-exam-questions

# Deploy practice question generator
supabase functions deploy generate-practice-questions
```

### 7.4 Set Edge Function Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set GEMINI_API_KEY=AIzaSy...
```

---

## Step 8: Run the Application

### 8.1 Start Expo Development Server

```bash
npx expo start
```

This opens Expo DevTools in your browser at http://localhost:19002

### 8.2 Run on iOS Simulator (macOS only)

1. Press `i` in the terminal (or click "Run on iOS simulator" in Expo DevTools)
2. Expo builds and launches app in iOS Simulator
3. Wait for initial bundle load (2-3 minutes first time)

### 8.3 Run on Android Emulator

1. Start Android emulator via Android Studio AVD Manager
2. Press `a` in the terminal (or click "Run on Android device/emulator")
3. Expo builds and launches app in emulator

### 8.4 Run on Physical Device (Optional)

1. Install "Expo Go" app from App Store / Google Play
2. Scan QR code from Expo DevTools
3. App loads on your device

---

## Step 9: Verify Setup

### 9.1 Test Authentication Flow

1. Launch app
2. Navigate to "Create Account" (إنشاء حساب)
3. Enter test email and password
4. Verify email OTP is sent (check Supabase Auth logs)
5. Complete email verification
6. Confirm navigation to profile setup

### 9.2 Test Subscription Flow (Test Mode)

1. In profile setup, select "Premium" tier
2. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
3. Confirm payment processes successfully
4. Verify subscription status updates in Supabase `user_subscriptions` table

### 9.3 Test Exam Generation

1. Navigate to "Full Exam" (امتحان متكامل)
2. Click "Start Exam" (بدء الاختبار)
3. Verify:
   - Loading indicator appears
   - Questions load within 15 seconds
   - Questions display in Arabic with RTL layout
   - Images load for geometry questions

### 9.4 Check Logs

**Supabase Logs**:
- Go to Supabase Dashboard → **Logs**
- Filter by Edge Functions to see generation requests

**Expo Logs**:
- Check terminal for React Native logs
- Use React Native Debugger for detailed inspection

---

## Step 10: Load Sample Data (Optional)

### 10.1 Seed Question Templates

Create seed script `scripts/seed-questions.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for seeding
);

async function seedQuestions() {
  const sampleQuestions = [
    {
      section: 'quantitative',
      category: 'geometry',
      difficulty: 'medium',
      question_text: 'ما هي مساحة المثلث القائم الذي طول ضلعيه القائمين 6 سم و 8 سم؟',
      has_image: true,
      image_prompt: 'Right triangle with sides 6cm and 8cm, labeled in Arabic',
      correct_answer: '24 سم²',
      options: ['24 سم²', '28 سم²', '32 سم²', '48 سم²'],
      explanation: 'مساحة المثلث = (½) × القاعدة × الارتفاع = (½) × 6 × 8 = 24 سم²'
    },
    // Add more sample questions...
  ];

  const { error } = await supabase
    .from('question_templates')
    .insert(sampleQuestions);

  if (error) {
    console.error('Seeding failed:', error);
  } else {
    console.log('✅ Seeded', sampleQuestions.length, 'questions');
  }
}

seedQuestions();
```

Run seed script:
```bash
npx ts-node scripts/seed-questions.ts
```

### 10.2 Generate Embeddings for Seeded Questions

Run embedding generation (via Edge Function or script) to populate `question_embeddings` table.

---

## Troubleshooting

### Issue: "Supabase connection failed"

**Solution**:
- Verify `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)
- Test connection: `curl https://YOUR_PROJECT.supabase.co/rest/v1/` (should return 200)

### Issue: "Stripe payment fails with authentication error"

**Solution**:
- Confirm using **test mode** keys (pk_test_, sk_test_)
- Verify webhook endpoint is accessible (test with ngrok if running locally)
- Check Stripe webhook secret matches `.env` configuration

### Issue: "Gemini API quota exceeded"

**Solution**:
- Free tier has 15 RPM limit; upgrade to paid tier for 1,000 RPM
- Implement request queuing (see gemini-ai.md contract)
- Reduce question count during testing (use 5-10 questions instead of 40)

### Issue: "RTL layout not rendering correctly"

**Solution**:
- Verify `I18nManager.forceRTL(true)` is called in App.tsx initialization
- Clear Expo cache: `npx expo start -c`
- Check React Native Paper theme has RTL enabled

### Issue: "Images not displaying in questions"

**Solution**:
- Verify Supabase Storage bucket `question-assets` is set to **Public**
- Check image URLs are signed correctly
- Test image URL directly in browser

---

## Next Steps

Once setup is complete and verified:

1. **Review Architecture**
   - Read `specs/main/data-model.md` for database schema
   - Read `specs/main/contracts/` for service interfaces

2. **Start Development**
   - Implement services in `src/services/`
   - Build UI components in `src/components/`
   - Create screens in `src/screens/`

3. **Write Tests**
   - Set up Jest for unit tests
   - Configure Detox for E2E tests
   - Refer to `specs/main/research.md` for testing strategy

4. **Deploy to Staging**
   - Configure EAS Build for production builds
   - Set up CI/CD pipeline
   - Deploy Supabase Edge Functions to production

---

## Useful Commands

```bash
# Start development server
npx expo start

# Clear cache and restart
npx expo start -c

# Run TypeScript type checking
npx tsc --noEmit

# Run linter
npx eslint src/

# Run tests
npm test

# Build iOS app (requires EAS account)
eas build --platform ios

# Build Android app
eas build --platform android

# Deploy Supabase Edge Function
supabase functions deploy <function-name>

# View Supabase logs
supabase functions logs <function-name>
```

---

## Resources

- **Expo Documentation**: https://docs.expo.dev
- **React Native Paper**: https://reactnativepaper.com
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Gemini API**: https://ai.google.dev/docs

---

**Setup Complete!** You're ready to start building Tafawoq. For implementation details, refer to the planning documents in `specs/main/`.
