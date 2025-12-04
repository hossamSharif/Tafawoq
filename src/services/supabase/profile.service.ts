/**
 * ProfileService - User profile management using Supabase
 *
 * Handles profile CRUD operations, academic track selection,
 * profile picture upload to Supabase Storage, and onboarding completion.
 */

import { supabase } from '@/config/supabase.config';
import { ServiceError, createValidationError, parseSupabaseError } from '@/services/errors/service-error';
import { Profile, ProfileSetupData, AcademicTrack } from '@/types/user.types';
import { decode } from 'base64-arraybuffer';

export interface ProfileService {
  upsertProfile(userId: string, data: Partial<Profile>): Promise<Profile>;
  getProfile(userId: string): Promise<Profile | null>;
  updateAcademicTrack(userId: string, track: AcademicTrack): Promise<Profile>;
  uploadProfilePicture(userId: string, imageUri: string): Promise<string>;
  completeOnboarding(userId: string, data: ProfileSetupData): Promise<Profile>;
}

/**
 * Implementation of ProfileService using Supabase
 */
class SupabaseProfileService implements ProfileService {
  /**
   * T073: Upsert user profile
   *
   * Creates or updates user profile in user_profiles table
   */
  async upsertProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    try {
      const profileData = {
        id: userId,
        full_name: data.fullName,
        academic_track: data.academicTrack,
        profile_picture_url: data.profilePictureUrl,
        onboarding_completed: data.onboardingCompleted,
        updated_at: new Date().toISOString(),
      };

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        throw parseSupabaseError(error);
      }

      if (!profile) {
        throw createValidationError('VALIDATION_INVALID_INPUT', 'فشل حفظ الملف الشخصي');
      }

      return this.mapDatabaseProfileToProfile(profile);
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createValidationError('VALIDATION_INVALID_INPUT', 'حدث خطأ أثناء حفظ الملف الشخصي');
    }
  }

  /**
   * T074: Get user profile by ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, return null (not an error)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw parseSupabaseError(error);
      }

      if (!profile) {
        return null;
      }

      return this.mapDatabaseProfileToProfile(profile);
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      return null;
    }
  }

  /**
   * T075: Update academic track
   */
  async updateAcademicTrack(userId: string, track: AcademicTrack): Promise<Profile> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          academic_track: track,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw parseSupabaseError(error);
      }

      if (!profile) {
        throw createValidationError('VALIDATION_INVALID_INPUT', 'فشل تحديث المسار الأكاديمي');
      }

      return this.mapDatabaseProfileToProfile(profile);
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createValidationError('VALIDATION_INVALID_INPUT', 'حدث خطأ أثناء تحديث المسار الأكاديمي');
    }
  }

  /**
   * T076: Upload profile picture to Supabase Storage
   *
   * Uploads image to profile-pictures bucket with user ID as folder name
   * Returns public URL of uploaded image
   */
  async uploadProfilePicture(userId: string, imageUri: string): Promise<string> {
    try {
      // Convert image URI to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();

      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64WithoutPrefix = base64.split(',')[1];
          resolve(base64WithoutPrefix);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Decode base64 to ArrayBuffer
      const arrayBuffer = decode(base64Data);

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExt = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `${userId}/${timestamp}.${fileExt}`;

      // Upload to Supabase Storage (profile-pictures bucket)
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true, // Replace if exists
        });

      if (error) {
        throw parseSupabaseError(error);
      }

      if (!data) {
        throw createValidationError('STORAGE_UPLOAD_FAILED', 'فشل رفع الصورة');
      }

      // Get public URL (profile-pictures is a private bucket, so we use signed URL)
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createValidationError('STORAGE_UPLOAD_FAILED', 'حدث خطأ أثناء رفع الصورة');
    }
  }

  /**
   * T077: Complete onboarding process
   *
   * Sets academic track, uploads profile picture (if provided),
   * and marks onboarding as complete
   */
  async completeOnboarding(userId: string, data: ProfileSetupData): Promise<Profile> {
    try {
      // Upload profile picture if provided
      let profilePictureUrl: string | undefined;
      if (data.profilePictureUri) {
        profilePictureUrl = await this.uploadProfilePicture(userId, data.profilePictureUri);
      }

      // Get user's full name from auth metadata or use default
      const { data: { user } } = await supabase.auth.getUser();
      const fullName = user?.user_metadata?.full_name || 'مستخدم';

      // Create/update profile with onboarding data
      const profile = await this.upsertProfile(userId, {
        fullName,
        academicTrack: data.academicTrack,
        profilePictureUrl,
        onboardingCompleted: true,
      });

      return profile;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createValidationError('VALIDATION_INVALID_INPUT', 'حدث خطأ أثناء إكمال إعداد الملف الشخصي');
    }
  }

  /**
   * Helper: Map database profile to Profile type
   */
  private mapDatabaseProfileToProfile(dbProfile: any): Profile {
    return {
      id: dbProfile.id,
      fullName: dbProfile.full_name,
      academicTrack: dbProfile.academic_track as AcademicTrack | undefined,
      profilePictureUrl: dbProfile.profile_picture_url,
      onboardingCompleted: dbProfile.onboarding_completed || false,
      createdAt: dbProfile.created_at,
      updatedAt: dbProfile.updated_at,
    };
  }
}

/**
 * Export singleton instance
 */
export const profileService = new SupabaseProfileService();
