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
  private isTest: boolean;
  private logs: LoggedError[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isTest = process.env.NODE_ENV === 'test';
  }

  /**
   * Log an error with context
   */
  error(error: Error | string, context?: ErrorContext): void {
    const logEntry = this.createLogEntry(error, 'error', context);
    this.logs.push(logEntry);
    this.trimLogs();

    // Console output
    if (this.isTest) {
      return;
    }

    if (this.isDevelopment) {
      console.error(`Error: ${logEntry.message}`, {
        context,
        stack: logEntry.stack,
      });
    } else {
      console.error(logEntry.message, context);
    }

    void logEntry;
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: ErrorContext): void {
    const logEntry = this.createLogEntry(message, 'warn', context);
    this.logs.push(logEntry);
    this.trimLogs();

    if (this.isTest) {
      return;
    }

    if (this.isDevelopment) {
      console.warn(`Warning: ${message}`, { context });
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

    if (this.isTest) {
      return;
    }

    if (this.isDevelopment) {
      console.warn(`Info: ${message}`, { context });
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
  private async sendToRemoteService(_logEntry: LoggedError): Promise<void> {
    // Optional: integrate with Sentry/Datadog/LogRocket later.
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
