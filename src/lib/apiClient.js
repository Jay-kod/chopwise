import { auth } from '../firebase';

/**
 * API error shape parsed from the server error envelope.
 * @typedef {{ code: string, message: string, details?: object }} ApiError
 */

/**
 * Call a JSON API endpoint, attaching the Firebase ID token.
 * Parses the error envelope from docs/API.md into a typed error.
 *
 * @param {string} url - The API path (e.g. '/api/recommend').
 * @param {object} [body] - JSON body for POST requests.
 * @returns {Promise<object>} Parsed JSON response.
 * @throws {{ code: string, message: string, details?: object }}
 */
export async function apiClient(url, body) {
  const user = auth.currentUser;
  if (!user) {
    throw { code: 'UNAUTHORIZED', message: 'You must be signed in.' };
  }

  const token = await user.getIdToken();

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

