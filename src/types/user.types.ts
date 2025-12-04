/**
 * User Type Definitions
 *
 * Types for authentication and user profiles
 */

import type { UUID, Timestamp, AcademicTrack } from './common.types';

/**
 * User (from Supabase Auth)
 */
export interface User {
  id: UUID;
  email: string;
  email_confirmed_at?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * User Profile (extended user information)
 */
export interface Profile {
  id: UUID;
  user_id: UUID;
  academic_track: AcademicTrack;
  profile_picture_url?: string;
  onboarding_completed: boolean;
  total_practice_hours: number;
  last_active_at: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * User Session (authentication session)
 */
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
  user: User;
}

/**
 * Authentication credentials
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData extends AuthCredentials {
  confirmPassword: string;
}

/**
 * Email verification data
 */
export interface EmailVerificationData {
  email: string;
  token: string; // OTP code
}

/**
 * Profile setup data (during onboarding)
 */
export interface ProfileSetupData {
  academic_track: AcademicTrack;
  profile_picture_uri?: string; // Local URI before upload
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  academic_track?: AcademicTrack;
  profile_picture_url?: string;
}

/**
 * Auth state for context
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Auth error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Auth error with Arabic message
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  arabicMessage: string;
}
