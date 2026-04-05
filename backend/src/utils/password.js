import bcryptjs from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return bcryptjs.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  if (!hash) return false; // User has no password (e.g., Google-auth only)
  return bcryptjs.compare(password, hash);
}
