import { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import prisma from '../config/database';

/**
 * OAuth Callback Handler
 * Called after successful OAuth authentication
 */
export async function oauthCallback(req: Request, res: Response) {
    try {
        const user = req.user as any;

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
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

        // Save refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await prisma.session.create({
            data: {
                userId: user.id,
                refreshToken,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.connection.remoteAddress,
                expiresAt,
            },
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Redirect to frontend with tokens
        res.redirect(
            `${process.env.FRONTEND_URL}/auth/callback?` +
            `accessToken=${accessToken}&` +
            `refreshToken=${refreshToken}`
        );
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
}