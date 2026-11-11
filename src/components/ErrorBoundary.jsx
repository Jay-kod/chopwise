import React from 'react';
import Card from './Card';
import Button from './Button';

/**
 * Global React Error Boundary.
 * Catches unhandled runtime render errors in child components and displays a friendly recovery UI.
 * Follows AGENTS.md and docs/UI_GUIDELINES.md (semantic tokens only).
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log unexpected runtime crashes for debugging in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4 py-8 text-fg">
          <Card className="w-full max-w-md p-6 text-center shadow-lg">
            <span className="text-4xl" aria-hidden="true">
              ⚠️
            </span>
            <h1 className="mt-3 text-lg font-bold text-fg">Something went wrong</h1>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              An unexpected application error occurred. We have contained the problem to protect your session.
            </p>

            {this.state.error?.message && (
              <div className="mt-4 rounded-xl border border-danger-line bg-surface-muted p-3 text-left">
                <span className="text-[11px] font-semibold text-danger-fg block mb-1">Error Diagnostic:</span>
                <p className="text-xs text-muted font-mono break-words leading-relaxed">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={this.handleReload} className="text-xs min-h-10 px-4">
                Reload Application
              </Button>
              <Button variant="secondary" onClick={this.handleGoHome} className="text-xs min-h-10 px-4">
                Return to Home
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

