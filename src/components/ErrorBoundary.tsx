import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { withTranslation, type WithTranslation } from 'react-i18next';
import { logError } from '@/services/logger';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component to catch React errors globally
 * Prevents entire app from crashing when a component throws an error
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, {
      component: 'ErrorBoundary',
      action: 'COMPONENT_DID_CATCH',
      metadata: { errorInfo },
    });
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {t('errors.somethingWentWrong', 'Something went wrong')}
              </h2>
              <p className="text-muted-foreground">
                {t(
                  'errors.unexpectedError',
                  "We're sorry, but something unexpected happened. Please try refreshing the page."
                )}
              </p>
            </div>

            {this.state.error && process.env.NODE_ENV === 'development' && (
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-left">
                <p className="text-xs font-mono text-destructive break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => globalThis.location.reload()}
                variant="pill"
                size="pill"
                className="w-full sm:w-auto"
              >
                {t('errors.refreshPage', 'Refresh Page')}
              </Button>
              <Button
                onClick={() => (globalThis.location.href = '/')}
                variant="pillOutline"
                size="pill"
                className="w-full sm:w-auto"
              >
                {t('common.goHome', 'Go Home')}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
