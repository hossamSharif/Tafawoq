/**
 * Analytics Type Definitions
 *
 * Types for performance tracking and analytics dashboard
 */

import type { UUID, Timestamp, QuestionCategory } from './common.types';
import type { CategoryPerformance } from './exam.types';

/**
 * User Analytics (aggregated metrics)
 */
export interface UserAnalytics {
  id: UUID;
  user_id: UUID;
  last_exam_verbal_score?: number;
  last_exam_quantitative_score?: number;
  last_exam_overall_average?: number;
  total_exams_completed: number;
  total_practices_completed: number;
  total_practice_hours: number;
  strongest_category?: QuestionCategory;
  weakest_category?: QuestionCategory;
  last_activity_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Exam trend data point
 */
export interface ExamTrendPoint {
  date: Timestamp;
  verbal_score: number;
  quantitative_score: number;
  overall_average: number;
}

/**
 * Practice trend data point
 */
export interface PracticeTrendPoint {
  date: Timestamp;
  score: number;
  questions_count: number;
  time_spent_minutes: number;
}

/**
 * Performance overview for dashboard
 */
export interface PerformanceOverview {
  analytics: UserAnalytics;
  exam_trend: ExamTrendPoint[]; // Last 10 exams
  practice_trend: PracticeTrendPoint[]; // Last 30 days
  category_performance: CategoryPerformance[]; // All categories
}

/**
 * Category statistics
 */
export interface CategoryStats {
  category: QuestionCategory;
  category_label: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number; // 0-100
  average_time_seconds: number;
}

/**
 * Study time breakdown
 */
export interface StudyTimeBreakdown {
  total_hours: number;
  exam_hours: number;
  practice_hours: number;
  by_category: Record<QuestionCategory, number>; // Category -> hours
}

/**
 * Performance report (exportable for premium users)
 */
export interface PerformanceReport {
  user_id: UUID;
  generated_at: Timestamp;
  period_start: Timestamp;
  period_end: Timestamp;
  summary: {
    total_exams: number;
    total_practices: number;
    total_hours: number;
    average_exam_score: number;
    average_practice_score: number;
  };
  exam_scores: ExamTrendPoint[];
  practice_scores: PracticeTrendPoint[];
  category_breakdown: CategoryStats[];
  strengths: CategoryPerformance[];
  weaknesses: CategoryPerformance[];
  improvement_recommendations: string[]; // AI-generated advice
}

/**
 * Analytics filter options
 */
export interface AnalyticsFilter {
  period: 'week' | 'month' | 'quarter' | 'year' | 'all';
  section?: 'verbal' | 'quantitative';
  categories?: QuestionCategory[];
}

/**
 * Milestone achievement
 */
export interface Milestone {
  id: string;
  type: 'exam_count' | 'practice_count' | 'score' | 'streak' | 'category_mastery';
  title: string; // Arabic title
  description: string; // Arabic description
  icon: string;
  achieved: boolean;
  achieved_at?: Timestamp;
  progress?: number; // 0-100 for in-progress milestones
}

/**
 * Study streak data
 */
export interface StudyStreak {
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: Timestamp;
}

/**
 * Analytics state for context
 */
export interface AnalyticsState {
  analytics?: UserAnalytics;
  performance?: PerformanceOverview;
  isLoading: boolean;
  error?: string;
}
