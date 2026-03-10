import { Request, Response, NextFunction } from 'express';

/**
 * Global Error Handler
 * Catches all errors and sends consistent error responses
 * Must be the LAST middleware in app.ts
 */

export function errorHandler(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    // Log error for debugging
    console.error('❌ Error:', error);

    // Default error
    let status = 500;
    let message = 'Internal server error';

    // Prisma errors (database errors)
    if (error.code === 'P2002') {
        // Unique constraint violation
        status = 400;
        message = 'A record with this value already exists';
    } else if (error.code === 'P2025') {
        // Record not found
        status = 404;
        message = 'Record not found';
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        status = 401;
        message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
        status = 401;
        message = 'Token expired';
    }

    // Validation errors (Zod)
    if (error.name === 'ZodError') {
        status = 400;
        message = 'Validation error';
    }

    // Send error response
    res.status(status).json({
        success: false,
        message: error.message || message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack, // Only show stack trace in development
        }),
    });
}

/**
 * 404 Not Found Handler
 * Catches all requests to non-existent routes
 */
export function notFoundHandler(
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
    });
}