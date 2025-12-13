import { NextRequest, NextResponse } from "next/server";

// Standardized Error Response Shape
export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    errorCode?: string;
    details?: any;
}

// Base Error Class
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, errorCode: string) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Typed Errors
export class ValidationError extends AppError {
    constructor(message: string = "Invalid input data") {
        super(message, 400, "VALIDATION_ERROR");
    }
}

export class AuthError extends AppError {
    constructor(message: string = "Authentication required") {
        super(message, 401, "AUTH_ERROR");
    }
}

export class PermissionError extends AppError {
    constructor(message: string = "Permission denied") {
        super(message, 403, "PERMISSION_ERROR");
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, 404, "NOT_FOUND_ERROR");
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = "Too many requests") {
        super(message, 429, "RATE_LIMIT_ERROR");
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = "Internal server error") {
        super(message, 500, "INTERNAL_SERVER_ERROR");
    }
}
