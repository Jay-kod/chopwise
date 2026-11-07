import { supabase } from './supabase';

/**
 * Call a JSON API endpoint, attaching the Supabase JWT token.
 * Parses the error envelope into a typed error.
 *
 * @param {string} url - The API path (e.g. '/api/recommend').
 * @param {object} [body] - JSON body for POST requests.
 * @returns {Promise<object>} Parsed JSON response.
 * @throws {{ code: string, message: string, details?: object }}
 */
export async function apiClient(url, body) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw { code: 'UNAUTHORIZED', message: 'You must be signed in.' };
  }

  const token = session.access_token;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body ?? {}),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data?.error ?? {};
    throw {
      code: err.code || 'INTERNAL',
      message: err.message || `Request failed (${res.status})`,
      details: err.details || {},
    };
  }

  return data;
}
