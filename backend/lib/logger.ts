
// Structured logging utility with Sentry integration

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal'
}

export interface LogContext {
    userId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    [key: string]: any;
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
}

class Logger {
    private serviceName: string;
    private environment: string;

    constructor() {
        this.serviceName = 'autopostr-backend';
        this.environment = process.env.NODE_ENV || 'development';
    }

    private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: {
                ...context,
                service: this.serviceName,
                environment: this.environment
            }
        };

        if (error) {
            entry.error = {
                name: error.name,
                message: error.message,
                stack: error.stack
            };
        }

        return entry;
    }

    private output(entry: LogEntry) {
        const logString = JSON.stringify(entry);

        // Console output
        switch (entry.level) {
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                console.error(logString);
                break;
            case LogLevel.WARN:
                console.warn(logString);
                break;
            default:
                console.log(logString);
        }

        // In production, you'd also send to:
        // - Sentry for errors
        // - CloudWatch/DataDog for all logs
        // - Custom analytics service

        if (entry.level === LogLevel.ERROR || entry.level === LogLevel.FATAL) {
            this.sendToSentry(entry);
        }
    }

    private sendToSentry(entry: LogEntry) {
        // Placeholder for Sentry integration
        // In production:
        // import * as Sentry from '@sentry/node';
        // Sentry.captureException(new Error(entry.message), {
        //     level: entry.level,
        //     contexts: { custom: entry.context },
        //     extra: entry.error
        // });

        if (process.env.SENTRY_DSN) {
            console.log('[SENTRY] Would send error:', entry.message);
        }
    }

    debug(message: string, context?: LogContext) {
        this.output(this.formatLog(LogLevel.DEBUG, message, context));
    }

    info(message: string, context?: LogContext) {
        this.output(this.formatLog(LogLevel.INFO, message, context));
    }

    warn(message: string, context?: LogContext) {
        this.output(this.formatLog(LogLevel.WARN, message, context));
    }

    error(message: string, error?: Error, context?: LogContext) {
        this.output(this.formatLog(LogLevel.ERROR, message, context, error));
    }

    fatal(message: string, error?: Error, context?: LogContext) {
        this.output(this.formatLog(LogLevel.FATAL, message, context, error));
    }

    // HTTP request logging
    logRequest(method: string, endpoint: string, statusCode: number, duration: number, context?: LogContext) {
        this.info(`${method} ${endpoint} ${statusCode}`, {
            ...context,
            method,
            endpoint,
            statusCode,
            duration
        });
    }

    // Worker job logging
    logJob(jobName: string, status: 'started' | 'completed' | 'failed', context?: LogContext) {
        const level = status === 'failed' ? LogLevel.ERROR : LogLevel.INFO;
        this.output(this.formatLog(level, `Job ${jobName} ${status}`, {
            ...context,
            jobName,
            jobStatus: status
        }));
    }
}

export const logger = new Logger();
