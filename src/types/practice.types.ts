/**
 * Practice Type Definitions
 *
 * Types for customized practice sessions
 */

import type {
  UUID,
  Timestamp,
  Section,
  Difficulty,
  QuestionCategory,
} from './common.types';
import type { Question, QuestionAnswer, CategoryPerformance } from './exam.types';

/**
 * Practice session status
 */
export type PracticeSessionStatus = 'in_progress' | 'completed' | 'abandoned';

/**
 * Practice configuration (user selections)
 */
export interface PracticeConfig {
  section: Section;
  categories: QuestionCategory[];
  difficulty: Difficulty;
  question_count: number;
}

/**
 * Practice Session
 */
export interface PracticeSession {
  id: UUID;
  user_id: UUID;
  section: Section;
  categories: QuestionCategory[];
  difficulty: Difficulty;
  question_count: number;
  status: PracticeSessionStatus;
  started_at: Timestamp;
  completed_at?: Timestamp;
  time_spent_seconds: number;
  questions?: Question[]; // Populated when session is loaded
  created_at: Timestamp;
}

/**
 * Practice Result (scoring and analysis)
 */
export interface PracticeResult {
  id: UUID;
  practice_session_id: UUID;
  user_id: UUID;
  overall_score: number; // 0-100
  category_breakdown: Record<QuestionCategory, number>; // Category -> score
  strengths: CategoryPerformance[]; // Top performing categories
  weaknesses: CategoryPerformance[]; // Low performing categories
  improvement_advice: string; // AI-generated recommendations
  created_at: Timestamp;
}

/**
 * Practice generation request
 */
export interface PracticeGenerationRequest {
  section: Section;
  categories: QuestionCategory[];
  difficulty: Difficulty;
  question_count: number;
  subscription_tier: 'free' | 'premium';
}

/**
 * Practice generation response
 */
export interface PracticeGenerationResponse {
  session_id: UUID;
  questions: Question[];
  generation_time_ms: number;
}

/**
 * Practice submission data
 */
export interface PracticeSubmission {
  session_id: UUID;
  answers: QuestionAnswer[];
  time_spent_seconds: number;
}

/**
 * Practice history item
 */
export interface PracticeHistoryItem {
  session: PracticeSession;
  result?: PracticeResult;
}

/**
 * Available categories for selection
 */
export interface AvailableCategory {
  id: QuestionCategory;
  label: string; // Arabic label
  section: Section;
  question_count: number; // Available questions in this category
}

/**
 * Practice state for context
 */
export interface PracticeState {
  currentSession?: PracticeSession;
  isLoading: boolean;
  isGenerating: boolean;
  error?: string;
}

/**
 * Practice session summary for analytics
 */
export interface PracticeSummary {
  total_sessions: number;
  total_questions: number;
  average_score: number;
  total_time_hours: number;
  category_performance: CategoryPerformance[];
}
