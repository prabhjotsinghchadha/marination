import { Env } from '@/libs/Env';

/**
 * Returns whether the email is listed in `ADMIN_EMAILS` (case-insensitive).
 * Used to grant or refresh the `admin` role on Clerk sync.
 */
export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  const raw = Env.ADMIN_EMAILS?.trim();
  if (!raw || !email) {
    return false;
  }
  const normalized = email.trim().toLowerCase();
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalized);
}
