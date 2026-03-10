import { z } from 'zod';

/**
 * Signup validation schema
 * Validates user registration data
 */
export const signupSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name too long'),

    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase(),

    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Error will show on confirmPassword field
});

/**
 * Login validation schema
 * Validates user login data
 */
export const loginSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase(),

    password: z
        .string()
        .min(1, 'Password is required'),
});

/**
 * Email validation (for email verification, password reset, etc.)
 */
export const emailSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase(),
});