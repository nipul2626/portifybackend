import bcrypt from 'bcrypt';

// Number of salt rounds (10 is standard, secure and fast)
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 * This makes password unreadable in database
 * Even if database is leaked, passwords are safe
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain text password with hashed password
 * Used during login to verify password is correct
 * Returns true if passwords match, false otherwise
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}