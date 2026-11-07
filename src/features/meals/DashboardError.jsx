import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ErrorState from '../../components/ErrorState';

/**
 * Handles error display states on Dashboard (NOT_CONFIGURED, RATE_LIMITED, or generic error).
 * Follows AGENTS.md and docs/UI_GUIDELINES.md.
 */
export default function DashboardError({ error, isAdmin, onRetry }) {
  if (!error) return null;

  if (error.code === 'NOT_CONFIGURED') {
    return (
      <Card className="p-6 text-center">
        <span className="text-3xl" aria-hidden="true">
          ⚙️
        </span>
        <h3 className="mt-2 text-base font-bold text-fg">
          Recommendation Service Not Configured
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted">
          The AI meal recommendation engine is currently being set up with its Google Gemini credentials.
        </p>
        {isAdmin && (
          <div className="mt-4">
            <Link to="/admin">
              <Button className="text-xs min-h-9">
                Open Admin Portal to add API key
              </Button>
            </Link>
          </div>
        )}
      </Card>
    );
  }

  if (error.code === 'RATE_LIMITED') {
    return (
      <div
        className="rounded-xl border border-warn-line bg-warn-bg p-6 text-center text-warn-fg"
        role="alert"
      >
        <span className="text-3xl" aria-hidden="true">
          ⏳
        </span>
        <h3 className="mt-2 text-base font-bold">Hourly Request Limit Reached</h3>
        <p className="mt-1 text-xs">
          {error.message ||
            'You have reached your hourly meal recommendation limit. Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <ErrorState
      message={error.message || 'Failed to load recommendations.'}
      onRetry={onRetry}
    />
  );
}

