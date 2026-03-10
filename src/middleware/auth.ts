import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Extend Passport User type instead of redefining Request.user
 */
declare global {
    namespace Express {
        interface User {
            id: string;
            email: string;
        }
    }
}
/**
 * Authentication Middleware
 * Verifies JWT token on protected routes
 * Attaches user info to request object
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No access token provided',
            });
        }

        // Extract token
        const token = authHeader.substring(7);

        // Verify token
        const decoded = verifyAccessToken(token);

        // Attach user info
        req.user = {
            id: decoded.userId,
            email: decoded.email,
        };

        next();
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message || 'Invalid or expired token',
        });
    }
}

/**
 * Optional authentication
 */
export async function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyAccessToken(token);

            req.user = {
                id: decoded.userId,
                email: decoded.email,
            };
        }

        next();
    } catch {
        next();
    }
}