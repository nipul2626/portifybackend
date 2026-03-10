import jwt from 'jsonwebtoken';

// Get secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-this';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// What data we store in the token
interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Generate Access Token
 * Used for authenticating API requests
 * Short-lived (15 minutes) for security
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate Refresh Token
 * Used to get new access tokens without re-login
 * Long-lived (7 days)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verify Access Token
 * Throws error if token is invalid or expired
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify Refresh Token
 * Throws error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}