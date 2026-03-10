import { Request, Response } from 'express';
import {
    registerUser,
    loginUser,
    verifyEmail,
    logoutUser,
    getUserById,
    refreshAccessToken,
} from '../services/auth.service';
import {
    signupSchema,
    loginSchema,
    emailSchema,
} from '../utils/validation';

/**
 * Auth Controllers
 * Handle HTTP requests and responses
 * Call service functions and return results
 */

/**
 * POST /auth/signup
 * Register a new user
 */
export async function signup(req: Request, res: Response) {
    try {
        // Validate request body
        const validatedData = signupSchema.parse(req.body);

        // Register user
        const user = await registerUser({
            name: validatedData.name,
            email: validatedData.email,
            password: validatedData.password,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            data: { user },
        });
    } catch (error: any) {
        // Validation error (from Zod)
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        // Business logic error (duplicate email, etc.)
        res.status(400).json({
            success: false,
            message: error.message || 'Registration failed',
        });
    }
}

/**
 * POST /auth/login
 * Login user with email and password
 */
export async function login(req: Request, res: Response) {
    try {
        // Validate request body
        const validatedData = loginSchema.parse(req.body);

        // Get user agent and IP for session tracking
        const userAgent = Array.isArray(req.headers['user-agent'])
            ? req.headers['user-agent'][0]
            : req.headers['user-agent'] || '';
        const ipAddress = req.ip || req.socket.remoteAddress || '';

        // Login user
        const result = await loginUser({
            email: validatedData.email,
            password: validatedData.password,
            userAgent,
            ipAddress,
        });

        // Set refresh token as httpOnly cookie (secure)
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true, // JavaScript can't access (prevents XSS)
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict', // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return access token and user info
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    } catch (error: any) {
        // Validation error
        if (error.name === 'ZodError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        // Login error
        res.status(401).json({
            success: false,
            message: error.message || 'Login failed',
        });
    }
}

/**
 * GET /auth/verify-email/:token
 * Verify user email
 */
export async function verifyEmailHandler(req: Request, res: Response) {
    try {
        const token = req.params.token?.toString();

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required',
            });
        }

        const result = await verifyEmail(token);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Email verification failed',
        });
    }
}

/**
 * POST /auth/logout
 * Logout user (clear session)
 */
export async function logout(req: Request, res: Response) {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'No active session found',
            });
        }

        // Delete session
        await logoutUser(refreshToken);

        // Clear cookie
        res.clearCookie('refreshToken');

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Logout failed',
        });
    }
}

/**
 * GET /auth/me
 * Get current user info
 * Requires authentication
 */
export async function getCurrentUser(req: Request, res: Response) {
    try {
        // User ID is attached by auth middleware
        const userId = (req as any).user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const user = await getUserById(userId);

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to get user info',
        });
    }
}

/**
 * POST /auth/refresh
 * Refresh access token
 */
export async function refresh(req: Request, res: Response) {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found',
            });
        }

        // Get new access token
        const result = await refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken,
            },
        });
    } catch (error: any) {
        // Clear invalid refresh token
        res.clearCookie('refreshToken');

        res.status(401).json({
            success: false,
            message: error.message || 'Token refresh failed',
        });
    }
}