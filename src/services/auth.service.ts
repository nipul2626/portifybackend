import prisma from '../config/database';
import { hashPassword, comparePasswords } from '../utils/hash';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import crypto from 'crypto';
import { sendVerificationEmail } from './email.service';
/**
 * Auth Service
 * Contains all authentication business logic
 * Controllers call these functions
 */

/**
 * Register a new user
 * Creates user account with hashed password
 */
export async function registerUser(data: {
    name: string;
    email: string;
    password: string;
}) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash the password (never store plain text!)
    const hashedPassword = await hashPassword(data.password);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user in database
    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash: hashedPassword,
            emailVerificationToken: verificationToken,
            emailVerified: false, // Will verify after clicking email link
        },
    });

    // TODO: Send verification email (we'll implement this later)
    await sendVerificationEmail(user.email, user.name, verificationToken);

    // Return user without password
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
    };
}

/**
 * Login user with email and password
 * Returns access token and refresh token
 */
export async function loginUser(data: {
    email: string;
    password: string;
    userAgent?: string;
    ipAddress?: string;
}) {
    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    // User not found
    if (!user) {
        throw new Error('Invalid email or password');
    }

    // User used OAuth (Google, GitHub, etc.) - no password set
    if (!user.passwordHash) {
        throw new Error('Please login with OAuth (Google, GitHub, or LinkedIn)');
    }

    // Verify password
    const isPasswordValid = await comparePasswords(
        data.password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!user.emailVerified) {
        throw new Error('Please verify your email before logging in');
    }

    // Generate tokens
    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
    });

    // Save refresh token in database (for session management)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            userAgent: data.userAgent,
            ipAddress: data.ipAddress,
            expiresAt,
        },
    });

    // Update last login time
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

    // Return tokens and user info
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            profilePictureUrl: user.profilePictureUrl,
            emailVerified: user.emailVerified,
        },
        accessToken,
        refreshToken,
    };
}

/**
 * Verify email with token
 * Marks user email as verified
 */
export async function verifyEmail(token: string) {
    // Find user with this verification token
    const user = await prisma.user.findUnique({
        where: { emailVerificationToken: token },
    });

    if (!user) {
        throw new Error('Invalid or expired verification token');
    }

    // Mark email as verified
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailVerificationToken: null, // Clear token after use
        },
    });

    return {
        message: 'Email verified successfully',
        email: user.email,
    };
}

/**
 * Logout user
 * Deletes refresh token from database
 */
export async function logoutUser(refreshToken: string) {
    // Delete the session
    await prisma.session.delete({
        where: { refreshToken },
    });

    return { message: 'Logged out successfully' };
}

/**
 * Get user by ID
 * Used to fetch current user info
 */
export async function getUserById(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            profilePictureUrl: true,
            emailVerified: true,
            oauthProvider: true,
            createdAt: true,
            lastLoginAt: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

/**
 * Refresh access token
 * Gets new access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
    // Find session with this refresh token
    const session = await prisma.session.findUnique({
        where: { refreshToken },
        // include: {
        //     // Note: Uncomment this once you add the User relation in Session model
        //     // user: true
        // },
    });

    if (!session) {
        throw new Error('Invalid refresh token');
    }

    // Check if token expired
    if (new Date() > session.expiresAt) {
        // Delete expired session
        await prisma.session.delete({
            where: { id: session.id },
        });
        throw new Error('Refresh token expired. Please login again.');
    }

    // Get user
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
    });

    return {
        accessToken: newAccessToken,
    };
}