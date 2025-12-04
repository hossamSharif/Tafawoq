import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables validation
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file contains:\n' +
    '- EXPO_PUBLIC_SUPABASE_URL\n' +
    '- EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Supabase client singleton instance
 *
 * Features:
 * - AsyncStorage for session persistence
 * - Auto-refresh for expired tokens
 * - RLS policy enforcement
 *
 * Usage:
 * ```typescript
 * import { supabase } from '@/config/supabase.config';
 *
 * const { data, error } = await supabase
 *   .from('user_profiles')
 *   .select('*')
 *   .eq('user_id', userId);
 * ```
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed for mobile apps
  },
});

/**
 * Supabase Storage helper for file uploads
 *
 * Buckets:
 * - question-assets (public): AI-generated images for questions
 * - profile-pictures (private): User profile pictures
 */
export const storage = {
  /**
   * Upload file to Supabase Storage
   * @param bucket Bucket name ('question-assets' | 'profile-pictures')
   * @param path File path within bucket
   * @param file File blob or URI
   */
  uploadFile: async (bucket: string, path: string, file: Blob | string) => {
    return supabase.storage.from(bucket).upload(path, file);
  },

  /**
   * Get public URL for uploaded file
   * @param bucket Bucket name
   * @param path File path
   */
  getPublicUrl: (bucket: string, path: string): string => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete file from storage
   * @param bucket Bucket name
   * @param path File path
   */
  deleteFile: async (bucket: string, path: string) => {
    return supabase.storage.from(bucket).remove([path]);
  },
};

/**
 * Database type definitions will be generated via Supabase CLI:
 * npx supabase gen types typescript --project-id <project-ref> > src/types/database.types.ts
 *
 * Then import and use:
 * import type { Database } from '@/types/database.types';
 * export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {...});
 */
