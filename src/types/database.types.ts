export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      exam_results: {
        Row: {
          created_at: string | null
          exam_session_id: string
          id: string
          improvement_advice: string | null
          overall_average: number | null
          quantitative_score: number
          strengths: Json | null
          user_id: string
          verbal_score: number
          weaknesses: Json | null
        }
        Insert: {
          created_at?: string | null
          exam_session_id: string
          id?: string
          improvement_advice?: string | null
          overall_average?: number | null
          quantitative_score: number
          strengths?: Json | null
          user_id: string
          verbal_score: number
          weaknesses?: Json | null
        }
        Update: {
          created_at?: string | null
          exam_session_id?: string
          id?: string
          improvement_advice?: string | null
          overall_average?: number | null
          quantitative_score?: number
          strengths?: Json | null
          user_id?: string
          verbal_score?: number
          weaknesses?: Json | null
        }
      }
      exam_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          questions_answered: number | null
          started_at: string | null
          status: string
          time_spent_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          questions_answered?: number | null
          started_at?: string | null
          status?: string
          time_spent_seconds?: number | null
          total_questions?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          questions_answered?: number | null
          started_at?: string | null
          status?: string
          time_spent_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
      }
      // Additional table types omitted for brevity
    }
    Functions: {
      calculate_practice_hours: { Args: { p_user_id: string }; Returns: number }
      check_exam_eligibility: {
        Args: { p_user_id: string }
        Returns: {
          exams_taken_this_week: number
          is_eligible: boolean
          max_exams_per_week: number
          next_eligible_at: string
          reason: string
        }[]
      }
      get_category_performance: {
        Args: { p_user_id: string }
        Returns: {
          accuracy: number
          category: string
          correct_answers: number
          total_questions: number
        }[]
      }
      has_premium_access: { Args: { check_user_id: string }; Returns: boolean }
      search_similar_questions: {
        Args: {
          p_difficulty: string
          p_limit?: number
          p_query_embedding: string
          p_section: string
        }
        Returns: {
          category: string
          difficulty: string
          question_id: string
          question_text: string
          similarity: number
        }[]
      }
    }
  }
}
