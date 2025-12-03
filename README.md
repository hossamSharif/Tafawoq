# Tafawoq - Saudi Aptitude Exam Preparation Platform

A comprehensive React Native mobile application for Arabic-speaking students preparing for Saudi aptitude exams (القدرات).

## Features

- 🎓 AI-generated full integrated exams (40 questions)
- 📚 Customized practice sessions with category and difficulty selection
- 📊 Real-time performance analytics and personalized insights
- 💳 Subscription-based access control (Free & Premium tiers)
- 🌙 RTL support with Arabic typography
- 📱 Cross-platform (iOS & Android)

## Tech Stack

- **Framework**: React Native (Expo SDK 51+)
- **Language**: TypeScript (Strict Mode)
- **UI Library**: React Native Paper
- **Backend**: Supabase (PostgreSQL + pgvector + Edge Functions)
- **AI**: Google Gemini 1.5 Flash + Imagen 3
- **Payments**: Stripe
- **Navigation**: React Navigation

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/tafawoq.git
   cd tafawoq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase, Stripe, and Gemini API credentials
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on simulator/emulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

## Project Structure

```
src/
├── components/      # Reusable UI components
├── screens/         # Screen-level components
├── services/        # Business logic and external integrations
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── navigation/      # React Navigation configuration
├── contexts/        # React Context providers
├── config/          # App configuration
├── utils/           # Utility functions
└── assets/          # Static assets
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint

## Documentation

For detailed setup instructions and implementation details, see:
- [Quickstart Guide](specs/main/quickstart.md)
- [Technical Plan](specs/main/plan.md)
- [Data Model](specs/main/data-model.md)
- [API Contracts](specs/main/contracts/)

## License

Proprietary - All rights reserved
