/**
 * Exam Type Definitions
 *
 * Types for full integrated exam sessions and results
 */

import type { UUID, Timestamp, Section, Difficulty, QuestionCategory } from './common.types';

/**
 * Exam session status
 */
export type ExamSessionStatus = 'in_progress' | 'completed' | 'abandoned';

/**
 * Question option
 */
export interface QuestionOption {
  id: string;
  text: string;
}

/**
 * Question (AI-generated or from template)
 */
export interface Question {
  id: UUID;
  section: Section;
  category: QuestionCategory;
  difficulty: Difficulty;
  question_text: string;
  options: QuestionOption[];
  has_image: boolean;
  image_url?: string;
  correct_answer: string;
  explanation?: string; // Only for premium users
  user_answer?: string; // User's selected answer
}

/**
 * Question answer submission
 */
export interface QuestionAnswer {
  question_id: UUID;
  answer: string;
  time_spent_seconds: number;
}

/**
 * Exam Session
 */
export interface ExamSession {
  id: UUID;
  user_id: UUID;
  status: ExamSessionStatus;
  started_at: Timestamp;
  completed_at?: Timestamp;
  total_questions: number;
  questions_answered: number;
  time_spent_seconds: number;
  questions?: Question[]; // Populated when session is loaded
  created_at: Timestamp;
}

/**
 * Category performance within exam
 */
export interface CategoryPerformance {
  category: QuestionCategory;
  category_label: string; // Arabic label
  score: number; // 0-100
  questions_count: number;
  correct_count: number;
}

/**
 * Exam Result (scoring and analysis)
 */
export interface ExamResult {
  id: UUID;
  exam_session_id: UUID;
  user_id: UUID;
  verbal_score: number; // 0-100
  quantitative_score: number; // 0-100
  overall_average: number; // (verbal + quantitative) / 2
  strengths: CategoryPerformance[]; // Top 3 categories
  weaknesses: CategoryPerformance[]; // Bottom 3 categories
  improvement_advice: string; // AI-generated recommendations
  created_at: Timestamp;
}

/**
 * Exam eligibility check
 */
export interface ExamEligibility {
  is_eligible: boolean;
  reason?: string; // Arabic message if not eligible
  exams_taken_this_week?: number;
  max_exams_per_week?: number;
  next_eligible_at?: Timestamp;
}

/**
 * Exam generation request
 */
export interface ExamGenerationRequest {
  academic_track: 'scientific' | 'literary';
  subscription_tier: 'free' | 'premium';
}

/**
 * Exam generation response
 */
export interface ExamGenerationResponse {
  session_id: UUID;
  questions: Question[];
  generation_time_ms: number;
}

/**
 * Exam submission data
 */
export interface ExamSubmission {
  session_id: UUID;
  answers: QuestionAnswer[];
  time_spent_seconds: number;
}

/**
 * Exam history item
 */
export interface ExamHistoryItem {
  session: ExamSession;
  result?: ExamResult;
}

/**
 * Exam state for context
 */
export interface ExamState {
  currentSession?: ExamSession;
  isLoading: boolean;
  isGenerating: boolean;
  error?: string;
}
