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

  const controller = new AbortController();
  const timeoutMs = 25000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
  } catch (err) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw {
        code: 'TIMEOUT',
        message: 'Request timed out after 25s. Please check server and network connectivity.',
        details: {},
      };
    }
    throw err;
  }
}
