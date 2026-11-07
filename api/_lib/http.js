import { ZodError } from 'zod';

export class AppError extends Error {
  /**
   * @param {string} code - Standard error code from docs/API.md
   * @param {string} message - User-friendly error message
   * @param {number} [status=500] - HTTP status code
   * @param {object} [details={}] - Optional error details
   */
  constructor(code, message, status = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  static unauthorized(msg = 'Missing or invalid authentication token.') {
    return new AppError('UNAUTHORIZED', msg, 401);
  }

  static forbidden(msg = 'Admin access required.') {
    return new AppError('FORBIDDEN', msg, 403);
  }

  static validation(details, msg = 'Validation failed.') {
    return new AppError('VALIDATION_ERROR', msg, 400, details);
  }

  static notFound(msg = 'Requested resource was not found.') {
    return new AppError('NOT_FOUND', msg, 404);
  }

  static methodNotAllowed(msg = 'Method not allowed. Only POST is accepted.') {
    return new AppError('METHOD_NOT_ALLOWED', msg, 405);
  }

  static profileIncomplete(msg = 'Please complete your dietary profile first.') {
    return new AppError('PROFILE_INCOMPLETE', msg, 409);
  }

  static rateLimited(retryAfterSeconds = 3600, msg = 'Hourly recommendation limit reached. Please try again later.') {
    return new AppError('RATE_LIMITED', msg, 429, { retryAfterSeconds });
  }

  static aiFailed(msg = 'Failed to generate recommendations. Please try again.') {
    return new AppError('AI_FAILED', msg, 502);
  }

  static notConfigured(missing = [], msg = 'The requested service is not configured.') {
    return new AppError('NOT_CONFIGURED', msg, 503, { missing });
  }

  static internal(msg = 'An unexpected internal error occurred.') {
    return new AppError('INTERNAL', msg, 500);
  }
}

/**
 * Wraps a Vercel serverless function handler with error envelope handling and security headers.
 * @param {(req: import('http').IncomingMessage, res: import('http').ServerResponse) => Promise<any>} handler
 */
export function withHandler(handler) {
  return async (req, res) => {
    // Standard response helpers in case running outside full Vercel environment
    if (!res.status) {
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
    }
    if (!res.json) {
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };
    }

    // Enforce POST method for all API handlers
    if (req.method !== 'POST') {
      const err = AppError.methodNotAllowed();
      return res.status(err.status).json({
        error: { code: err.code, message: err.message, details: err.details },
      });
    }

    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.status).json({
          error: {
            code: err.code,
            message: err.message,
            details: err.details,
          },
        });
      }

      if (err instanceof ZodError) {
        const fields = {};
        for (const issue of err.issues) {
          const path = issue.path.join('.') || 'body';
          fields[path] = issue.message;
        }
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: { fields },
          },
        });
      }

      // Handle Firebase Auth errors that slip through
      if (err?.code?.startsWith('auth/')) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired authentication session.',
            details: {},
          },
        });
      }

      // Safe fallback - never leak stack traces or internal details
      const isDev = process.env.NODE_ENV === 'development';
      return res.status(500).json({
        error: {
          code: 'INTERNAL',
          message: 'An unexpected internal error occurred.',
          details: isDev ? { hint: err.message } : {},
        },
      });
    }
  };
}

