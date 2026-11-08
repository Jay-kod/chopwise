/**
 * Call a JSON API endpoint, attaching local JWT token if available.
 * Parses the error envelope into a typed error.
 *
 * @param {string} url - The API path (e.g. '/api/recommend').
 * @param {object} [body] - JSON body for POST requests.
 * @returns {Promise<object>} Parsed JSON response.
 * @throws {{ code: string, message: string, details?: object }}
 */
export async function apiClient(url, body) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('chopwise_token') : null;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
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
