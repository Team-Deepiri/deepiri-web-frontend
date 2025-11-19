type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  context: Record<string, any>;
}

class Logger {
  private service: string;
  private logLevel: LogLevel;
  private levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };

  constructor(service: string = 'frontend') {
    this.service = service;
    this.logLevel = import.meta.env.PROD ? 'warn' : 'debug';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, context: Record<string, any> = {}): LogEntry {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      service: this.service,
      message,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      }
    };

    const user = this.getUserContext();
    if (user) {
      logEntry.context.user = user;
    }

    return logEntry;
  }

  private getUserContext(): { userId: string; email: string } | null {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          userId: payload.userId,
          email: payload.email
        };
      }
    } catch (error) {
      // Ignore token parsing errors
    }
    return null;
  }

  private log(level: LogLevel, message: string, context: Record<string, any> = {}): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, context);

    if (!import.meta.env.PROD) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'info' ? 'info' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, logEntry);
    }

    if (import.meta.env.PROD) {
      this.sendToLoggingService(logEntry);
    }

    if (level === 'error' && import.meta.env.DEV) {
      this.storeErrorLog(logEntry);
    }
  }

  private async sendToLoggingService(logEntry: LogEntry): Promise<void> {
    try {
      const raw = localStorage.getItem('token');
      const token = raw && raw !== 'null' && raw !== 'undefined' ? raw : null;
      if (!token) {
        return;
      }
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }

  private storeErrorLog(logEntry: LogEntry): void {
    try {
      const errorLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      errorLogs.push(logEntry);
      
      if (errorLogs.length > 10) {
        errorLogs.splice(0, errorLogs.length - 10);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(errorLogs));
    } catch (error) {
      console.error('Failed to store error log:', error);
    }
  }

  error(message: string, context: Record<string, any> = {}): void {
    this.log('error', message, context);
  }

  warn(message: string, context: Record<string, any> = {}): void {
    this.log('warn', message, context);
  }

  info(message: string, context: Record<string, any> = {}): void {
    this.log('info', message, context);
  }

  debug(message: string, context: Record<string, any> = {}): void {
    this.log('debug', message, context);
  }
}

export class AuthLogger extends Logger {
  constructor() {
    super('auth');
  }

  logLoginAttempt(email: string, success: boolean = false, error: Error | null = null): void {
    this.info('Login attempt', {
      email,
      success,
      error: error?.message,
      timestamp: new Date().toISOString()
    });
  }

  logLogout(userId: string): void {
    this.info('User logout', { userId });
  }

  logTokenExpiry(userId: string): void {
    this.warn('Token expired', { userId });
  }

  logAuthError(error: Error, context: Record<string, any> = {}): void {
    this.error('Authentication error', {
      error: error.message,
      stack: error.stack,
      ...context
    });
  }
}

export class AdventureLogger extends Logger {
  constructor() {
    super('adventure');
  }

  logAdventureGeneration(userId: string, preferences: any, success: boolean = false, error: Error | null = null): void {
    this.info('Adventure generation', {
      userId,
      preferences,
      success,
      error: error?.message,
      duration: preferences?.duration,
      interests: preferences?.interests
    });
  }

  logAdventureStart(adventureId: string, userId: string): void {
    this.info('Adventure started', { adventureId, userId });
  }

  logAdventureComplete(adventureId: string, userId: string, feedback: any = null): void {
    this.info('Adventure completed', {
      adventureId,
      userId,
      rating: feedback?.rating,
      completedSteps: feedback?.completedSteps?.length
    });
  }

  logStepUpdate(adventureId: string, stepIndex: number, action: string, userId: string): void {
    this.debug('Adventure step updated', {
      adventureId,
      stepIndex,
      action,
      userId
    });
  }
}

export class EventLogger extends Logger {
  constructor() {
    super('events');
  }

  logEventView(eventId: string, userId: string): void {
    this.debug('Event viewed', { eventId, userId });
  }

  logEventJoin(eventId: string, userId: string): void {
    this.info('Event joined', { eventId, userId });
  }

  logEventLeave(eventId: string, userId: string): void {
    this.info('Event left', { eventId, userId });
  }

  logEventCreate(eventData: any, userId: string, success: boolean = false, error: Error | null = null): void {
    this.info('Event created', {
      eventId: eventData.id,
      userId,
      success,
      error: error?.message,
      eventType: eventData.type,
      capacity: eventData.capacity
    });
  }
}

export class APILogger extends Logger {
  constructor() {
    super('api');
  }

  logAPIRequest(method: string, url: string, requestId: string, userId: string | null = null): void {
    this.debug('API request', {
      method,
      url,
      requestId,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  logAPIResponse(method: string, url: string, status: number, duration: number, requestId: string, userId: string | null = null): void {
    const level: LogLevel = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this.log(level, 'API response', {
      method,
      url,
      status,
      duration,
      requestId,
      userId
    });
  }

  logAPIError(error: Error, method: string, url: string, requestId: string, userId: string | null = null): void {
    this.error('API error', {
      method,
      url,
      requestId,
      userId,
      error: error.message,
      stack: error.stack
    });
  }
}

export class PerformanceLogger extends Logger {
  constructor() {
    super('performance');
  }

  logPageLoad(page: string, loadTime: number): void {
    this.info('Page load', {
      page,
      loadTime,
      timestamp: new Date().toISOString()
    });
  }

  logComponentRender(component: string, renderTime: number): void {
    this.debug('Component render', {
      component,
      renderTime
    });
  }

  logAPIResponseTime(endpoint: string, responseTime: number): void {
    this.debug('API response time', {
      endpoint,
      responseTime
    });
  }

  logMemoryUsage(): void {
    if ((performance as any).memory) {
      this.debug('Memory usage', {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      });
    }
  }
}

export class ErrorLogger extends Logger {
  constructor() {
    super('errors');
  }

  logUnhandledError(error: Error, errorInfo: any = null): void {
    this.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  logPromiseRejection(reason: any, promise: Promise<any>): void {
    this.error('Unhandled promise rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      timestamp: new Date().toISOString()
    });
  }

  logNetworkError(error: Error, url: string, method: string): void {
    this.error('Network error', {
      error: error.message,
      url,
      method,
      timestamp: new Date().toISOString()
    });
  }
}

export const authLogger = new AuthLogger();
export const adventureLogger = new AdventureLogger();
export const eventLogger = new EventLogger();
export const apiLogger = new APILogger();
export const performanceLogger = new PerformanceLogger();
export const errorLogger = new ErrorLogger();

export const setupGlobalErrorHandling = (): void => {
  window.addEventListener('error', (event) => {
    errorLogger.logUnhandledError(event.error, {
      componentStack: event.error?.componentStack
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logPromiseRejection(event.reason, event.promise);
  });

  window.addEventListener('error', (event) => {
    if (event.target !== window && (event.target as HTMLElement).tagName === 'IMG') {
      errorLogger.logNetworkError(
        new Error(`Failed to load image: ${(event.target as HTMLImageElement).src}`),
        (event.target as HTMLImageElement).src,
        'GET'
      );
    }
  });
};

export const setupPerformanceMonitoring = (): void => {
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    performanceLogger.logPageLoad(window.location.pathname, loadTime);
  });

  setInterval(() => {
    performanceLogger.logMemoryUsage();
  }, 60000);
};

export const logErrorBoundary = (error: Error, errorInfo: any): void => {
  errorLogger.logUnhandledError(error, errorInfo);
};

export default new Logger();

