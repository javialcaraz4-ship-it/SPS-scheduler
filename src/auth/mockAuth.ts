/**
 * MOCK AUTHENTICATION — local demo use only.
 * Replace with Supabase Auth or another secure backend before production.
 * Never store real passwords in plaintext.
 */
import type { AuthUser } from '../types';

export const ADMIN_EMAILS = [
  'javi@stanfordparksports.com',
  'info@stanfordparksports.com',
];

const ADMIN_PASSWORD = 'password123';

type LoginResult =
  | { success: true; user: AuthUser }
  | { success: false; error: string };

export function loginAsAdmin(email: string, password: string): LoginResult {
  if (!ADMIN_EMAILS.includes(email.trim().toLowerCase())) {
    return { success: false, error: 'Invalid email or password.' };
  }
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid email or password.' };
  }
  return {
    success: true,
    user: {
      id: 'admin_1',
      name: 'Admin',
      role: 'admin',
      email: email.trim().toLowerCase(),
    },
  };
}
