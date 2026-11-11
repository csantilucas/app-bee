import { AuthService } from '@/lib/auth/auth-service';

export async function getCurrentUser() {
  const sessionData = await AuthService.getSession();
  return sessionData?.user || null;
}
