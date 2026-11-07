import { createClient } from '@supabase/supabase-js';
import { AppError } from './http.js';

let supabaseAdminInstance = null;

/**
 * Returns the initialized Supabase client with admin/service-role privileges.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getSupabaseAdmin() {
  if (supabaseAdminInstance) {
    return supabaseAdminInstance;
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    const missing = [];
    if (!url) missing.push('SUPABASE_URL');
    if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    throw AppError.notConfigured(
      missing,
      'Supabase server environment is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  supabaseAdminInstance = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminInstance;
}

export function isSupabaseAdminConfigured() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && key);
}

