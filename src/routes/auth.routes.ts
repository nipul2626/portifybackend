import { Router } from 'express';
import passport from '../config/passport';
import {
    signup,
    login,
    logout,
    getCurrentUser,
    refresh,
    verifyEmailHandler,
} from '../controllers/auth.controller';
import { oauthCallback } from '../controllers/oauth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Email/Password Auth
router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmailHandler);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

// Google OAuth
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    oauthCallback
);

// GitHub OAuth
router.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email'] })
);
router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    oauthCallback
);

// LinkedIn OAuth
router.get(
    '/linkedin',
    passport.authenticate('linkedin')
);
router.get(
    '/linkedin/callback',
    passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }),
    oauthCallback
);

export default router;