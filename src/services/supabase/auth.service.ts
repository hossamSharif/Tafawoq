/**
 * AuthService - Authentication management using Supabase Auth
 *
 * Handles user registration, email verification with OTP, sign in/out,
 * and session management.
 */

import { supabase } from '@/config/supabase.config';
import { ServiceError, createAuthError, parseSupabaseError } from '@/services/errors/service-error';
import {
  AuthCredentials,
  RegistrationData,
  Session,
  User,
} from '@/types/user.types';
import { AuthChangeEvent, Session as SupabaseSession } from '@supabase/supabase-js';

export interface AuthService {
  signUp(data: RegistrationData): Promise<{ user: User | null; needsVerification: boolean }>;
  verifyEmail(email: string, otp: string): Promise<{ user: User; session: Session }>;
  signIn(credentials: AuthCredentials): Promise<{ user: User; session: Session }>;
  signOut(): Promise<void>;
  resendVerificationOTP(email: string): Promise<void>;
  getCurrentSession(): Promise<Session | null>;
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void;
}

/**
 * Implementation of AuthService using Supabase
 */
class SupabaseAuthService implements AuthService {
  /**
   * T065: Register new user with email and password
   *
   * Returns user and needsVerification flag indicating if OTP verification is required
   */
  async signUp(data: RegistrationData): Promise<{ user: User | null; needsVerification: boolean }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: undefined, // We use OTP verification, not email links
          data: {
            full_name: data.fullName,
            // Academic track and profile picture will be set during onboarding
          },
        },
      });

      if (error) {
        throw parseSupabaseError(error);
      }

      if (!authData.user) {
        throw createAuthError('AUTH_REGISTRATION_FAILED', 'فشل إنشاء الحساب');
      }

      // Map Supabase user to our User type
      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        emailConfirmed: authData.user.email_confirmed_at !== null,
        createdAt: authData.user.created_at,
      };

      return {
        user,
        needsVerification: !authData.user.email_confirmed_at,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createAuthError('AUTH_REGISTRATION_FAILED', 'حدث خطأ أثناء إنشاء الحساب');
    }
  }

  /**
   * T066: Verify email with OTP code sent to user's email
   */
  async verifyEmail(email: string, otp: string): Promise<{ user: User; session: Session }> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) {
        throw parseSupabaseError(error);
      }

      if (!data.user || !data.session) {
        throw createAuthError('AUTH_INVALID_OTP', 'رمز التحقق غير صحيح');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        emailConfirmed: true,
        createdAt: data.user.created_at,
      };

      const session: Session = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at!,
        user,
      };

      return { user, session };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createAuthError('AUTH_EMAIL_VERIFICATION_FAILED', 'فشل التحقق من البريد الإلكتروني');
    }
  }

  /**
   * T067: Sign in with email and password
   */
  async signIn(credentials: AuthCredentials): Promise<{ user: User; session: Session }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw parseSupabaseError(error);
      }

      if (!data.user || !data.session) {
        throw createAuthError('AUTH_INVALID_CREDENTIALS', 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        emailConfirmed: data.user.email_confirmed_at !== null,
        createdAt: data.user.created_at,
      };

      const session: Session = {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at!,
        user,
      };

      return { user, session };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createAuthError('AUTH_SIGN_IN_FAILED', 'فشل تسجيل الدخول');
    }
  }

  /**
   * T068: Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw parseSupabaseError(error);
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createAuthError('AUTH_SIGN_OUT_FAILED', 'فشل تسجيل الخروج');
    }
  }

  /**
   * T069: Resend verification OTP with rate limiting
   */
  async resendVerificationOTP(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        // Supabase enforces rate limiting on OTP resends (60 seconds between requests)
        throw parseSupabaseError(error);
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createAuthError('AUTH_OTP_RESEND_FAILED', 'فشل إعادة إرسال رمز التحقق');
    }
  }

  /**
   * T070: Get current session from storage
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw parseSupabaseError(error);
      }

      if (!data.session) {
        return null;
      }

      const user: User = {
        id: data.session.user.id,
        email: data.session.user.email!,
        emailConfirmed: data.session.user.email_confirmed_at !== null,
        createdAt: data.session.user.created_at,
      };

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at!,
        user,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      // Return null if session retrieval fails (user is not authenticated)
      return null;
    }
  }

  /**
   * T071: Subscribe to auth state changes
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, supabaseSession) => {
        let session: Session | null = null;

        if (supabaseSession) {
          const user: User = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email!,
            emailConfirmed: supabaseSession.user.email_confirmed_at !== null,
            createdAt: supabaseSession.user.created_at,
          };

          session = {
            accessToken: supabaseSession.access_token,
            refreshToken: supabaseSession.refresh_token,
            expiresAt: supabaseSession.expires_at!,
            user,
          };
        }

        callback(event, session);
      }
    );

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
}

/**
 * Export singleton instance
 */
export const authService = new SupabaseAuthService();
