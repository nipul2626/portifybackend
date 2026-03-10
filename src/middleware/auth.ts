import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

/**
 * Authentication Middleware
 * Verifies JWT token on protected routes
 * Attaches user info to request object
 */

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
            };
        }
    }
}

/**
 * Protect routes that require authentication
 * Usage: router.get('/protected', authenticate, handler)
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        // Get token from Authorization header
        // Format: "Bearer <token>"
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No access token provided',
            });
        }

        // Extract token (remove "Bearer " prefix)
        const token = authHeader.substring(7);

        // Verify token
        const decoded = verifyAccessToken(token);

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
        };

        // Continue to next middleware/handler
        next();
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: error.message || 'Invalid or expired token',
        });
    }
}

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't fail if missing
 * Usage: For routes that work both logged in and logged out
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
                userId: decoded.userId,
                email: decoded.email,
            };
        }

        next();
    } catch (error) {
        // Token invalid, but that's okay for optional auth
        next();
    }
}