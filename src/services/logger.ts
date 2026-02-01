/**
 * Error Logging Service
 * Centralized error logging with console output and optional remote service integration
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface LoggedError {
  message: string;
  stack?: string;
  context?: ErrorContext;
  timestamp: string;
  level: 'error' | 'warn' | 'info';
}

class ErrorLogger {
  private isDevelopment: boolean;
  private logs: LoggedError[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Log an error with context
   */
  error(error: Error | string, context?: ErrorContext): void {
    const logEntry = this.createLogEntry(error, 'error', context);
    this.logs.push(logEntry);
    this.trimLogs();

    // Console output
    if (this.isDevelopment) {
      console.group(`🔴 Error: ${logEntry.message}`);
      if (context) console.log('Context:', context);
      if (logEntry.stack) console.log('Stack:', logEntry.stack);
      console.groupEnd();
    } else {
      console.error(logEntry.message, context);
    }

    // Future: Send to remote service (Sentry, LogRocket, etc.)
    // this.sendToRemoteService(logEntry);
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: ErrorContext): void {
    const logEntry = this.createLogEntry(message, 'warn', context);
    this.logs.push(logEntry);
    this.trimLogs();

    if (this.isDevelopment) {
      console.group(`⚠️ Warning: ${message}`);
      if (context) console.log('Context:', context);
      console.groupEnd();
    } else {
      console.warn(message, context);
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: ErrorContext): void {
    const logEntry = this.createLogEntry(message, 'info', context);
    this.logs.push(logEntry);
    this.trimLogs();

    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, context);
    }
  }

  /**
   * Log API errors
   */
  apiError(error: unknown, endpoint: string, context?: ErrorContext): void {
    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null;

    const response = isRecord(error) ? error.response : undefined;
    const responseData = isRecord(response) ? response.data : undefined;

    const responseDataMessage = isRecord(responseData) ? responseData.message : undefined;
    const message =
      typeof responseDataMessage === 'string'
        ? responseDataMessage
        : isRecord(error) && typeof error.message === 'string'
          ? error.message
          : 'API request failed';

    const statusCode =
      isRecord(response) && typeof response.status === 'number' ? response.status : undefined;

    const errorForLog: Error | string =
      error instanceof Error || typeof error === 'string' ? error : message;

    this.error(errorForLog, {
      ...context,
      action: 'API_REQUEST',
      metadata: {
        endpoint,
        statusCode,
        responseData,
      },
    });
  }

  /**
   * Log authentication errors
   */
  authError(error: Error | string, action: string): void {
    this.error(error, {
      component: 'Auth',
      action,
    });
  }

  /**
   * Get recent logs (for debugging or error reporting UI)
   */
  getRecentLogs(count = 10): LoggedError[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Create a log entry
   */
  private createLogEntry(
    error: Error | string,
    level: 'error' | 'warn' | 'info',
    context?: ErrorContext
  ): LoggedError {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;

    return {
      message,
      stack,
      context,
      timestamp: new Date().toISOString(),
      level,
    };
  }

  /**
   * Trim logs to max size
   */
  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Send error to remote logging service
   * Example integration points: Sentry, LogRocket, DataDog, etc.
   */
  private sendToRemoteService(): void {
    // Example Sentry integration:
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(logEntry.message), {
    //     contexts: {
    //       custom: logEntry.context,
    //     },
    //     level: logEntry.level,
    //   });
    // }
    // Example custom API integration:
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry),
    // }).catch(() => {
    //   // Silently fail - don't create infinite loop
    // });
  }
}

// Export singleton instance
export const logger = new ErrorLogger();

// Convenience methods
export const logError = (error: Error | string, context?: ErrorContext) =>
  logger.error(error, context);

export const logWarn = (message: string, context?: ErrorContext) => logger.warn(message, context);

export const logInfo = (message: string, context?: ErrorContext) => logger.info(message, context);

export const logApiError = (error: unknown, endpoint: string, context?: ErrorContext) =>
  logger.apiError(error, endpoint, context);

export const logAuthError = (error: Error | string, action: string) =>
  logger.authError(error, action);
