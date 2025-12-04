/**
 * Common Type Definitions
 *
 * Shared types used across multiple features
 */

/**
 * Exam/Practice Section Types
 */
export type Section = 'verbal' | 'quantitative' | 'mixed';

/**
 * Question Difficulty Levels
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Academic Track Selection
 */
export type AcademicTrack = 'scientific' | 'literary';

/**
 * Question Categories
 */
export type QuestionCategory =
  // Quantitative categories
  | 'basic_operations'
  | 'geometry'
  | 'roots_exponents'
  // Verbal categories
  | 'analogies'
  | 'sentence_completion'
  | 'contextual_error'
  | 'odd_word_out'
  | 'reading_comprehension';

/**
 * Category information with Arabic labels
 */
export interface CategoryInfo {
  id: QuestionCategory;
  label: string; // Arabic label
  section: 'verbal' | 'quantitative';
}

/**
 * All available categories with Arabic labels
 */
export const CATEGORIES: CategoryInfo[] = [
  // Quantitative
  { id: 'basic_operations', label: 'العمليات الأساسية', section: 'quantitative' },
  { id: 'geometry', label: 'الهندسة', section: 'quantitative' },
  { id: 'roots_exponents', label: 'الأسس والجذور', section: 'quantitative' },
  // Verbal
  { id: 'analogies', label: 'التناظر اللفظي', section: 'verbal' },
  { id: 'sentence_completion', label: 'إكمال الجمل', section: 'verbal' },
  { id: 'contextual_error', label: 'الخطأ السياقي', section: 'verbal' },
  { id: 'odd_word_out', label: 'المفردة الشاذة', section: 'verbal' },
  { id: 'reading_comprehension', label: 'استيعاب المقروء', section: 'verbal' },
];

/**
 * Get categories by section
 */
export const getCategoriesBySection = (section: Section): CategoryInfo[] => {
  if (section === 'mixed') {
    return CATEGORIES;
  }
  return CATEGORIES.filter((cat) => cat.section === section);
};

/**
 * Get Arabic label for category
 */
export const getCategoryLabel = (categoryId: QuestionCategory): string => {
  const category = CATEGORIES.find((cat) => cat.id === categoryId);
  return category?.label || categoryId;
};

/**
 * Timestamp type alias for consistency
 */
export type Timestamp = string; // ISO 8601 format

/**
 * UUID type alias for consistency
 */
export type UUID = string;

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

/**
 * API Error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Loading state type
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic state with loading
 */
export interface LoadingStateWrapper<T> {
  state: LoadingState;
  data?: T;
  error?: string;
}
