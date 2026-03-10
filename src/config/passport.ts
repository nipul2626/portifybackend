import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import prisma from './database';

// Serialize user (store user ID in session)
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user (retrieve user from database using ID)
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists
                    let user = await prisma.user.findUnique({
                        where: {
                            oauthProvider_oauthId: {
                                oauthProvider: 'google',
                                oauthId: profile.id,
                            },
                        },
                    });

                    if (!user) {
                        // Check if email already exists (user might have signed up with email)
                        const existingUser = await prisma.user.findUnique({
                            where: { email: profile.emails?.[0]?.value },
                        });

                        if (existingUser) {
                            // Link OAuth to existing account
                            user = await prisma.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    oauthProvider: 'google',
                                    oauthId: profile.id,
                                    emailVerified: true, // Google accounts are pre-verified
                                },
                            });
                        } else {
                            // Create new user
                            user = await prisma.user.create({
                                data: {
                                    email: profile.emails?.[0]?.value || '',
                                    name: profile.displayName || '',
                                    profilePictureUrl: profile.photos?.[0]?.value,
                                    oauthProvider: 'google',
                                    oauthId: profile.id,
                                    emailVerified: true,
                                },
                            });
                        }
                    }

                    done(null, user);
                } catch (error) {
                    done(error as Error, undefined);
                }
            }
        )
    );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID!,
                clientSecret: process.env.GITHUB_CLIENT_SECRET!,
                callbackURL: process.env.GITHUB_CALLBACK_URL!,
                scope: ['user:email'],
            },
            async (
                accessToken: string,
                refreshToken: string,
                profile: any,
                done: (error: any, user?: any) => void
            ) => {
                try {
                    let user = await prisma.user.findUnique({
                        where: {
                            oauthProvider_oauthId: {
                                oauthProvider: 'github',
                                oauthId: profile.id,
                            },
                        },
                    });

                    if (!user) {
                        const email =
                            profile.emails?.[0]?.value ||
                            `${profile.username}@github.com`;

                        const existingUser = await prisma.user.findUnique({
                            where: { email },
                        });

                        if (existingUser) {
                            user = await prisma.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    oauthProvider: 'github',
                                    oauthId: profile.id,
                                    emailVerified: true,
                                },
                            });
                        } else {
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    name: profile.displayName || profile.username || '',
                                    profilePictureUrl: profile.photos?.[0]?.value,
                                    oauthProvider: 'github',
                                    oauthId: profile.id,
                                    emailVerified: true,
                                },
                            });
                        }
                    }

                    done(null, user);
                } catch (error) {
                    done(error, undefined);
                }
            }
        )
    );
}

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use(
        new LinkedInStrategy(
            {
                clientID: process.env.LINKEDIN_CLIENT_ID!,
                clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
                callbackURL: process.env.LINKEDIN_CALLBACK_URL!,
                scope: ['r_emailaddress', 'r_liteprofile'],
            },
            async (
                accessToken: string,
                refreshToken: string,
                profile: any,
                done: (error: any, user?: any) => void
            )  => {
                try {
                    let user = await prisma.user.findUnique({
                        where: {
                            oauthProvider_oauthId: {
                                oauthProvider: 'linkedin',
                                oauthId: profile.id,
                            },
                        },
                    });

                    if (!user) {
                        const email = profile.emails?.[0]?.value || '';

                        const existingUser = await prisma.user.findUnique({
                            where: { email },
                        });

                        if (existingUser) {
                            user = await prisma.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    oauthProvider: 'linkedin',
                                    oauthId: profile.id,
                                    emailVerified: true,
                                },
                            });
                        } else {
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    name: profile.displayName || '',
                                    profilePictureUrl: profile.photos?.[0]?.value,
                                    oauthProvider: 'linkedin',
                                    oauthId: profile.id,
                                    emailVerified: true,
                                },
                            });
                        }
                    }

                    done(null, user);
                } catch (error) {
                    done(error as Error, undefined);
                }
            }
        )
    );
}

export default passport;