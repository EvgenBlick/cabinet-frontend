import { tokenStorage } from '@/utils/token';
import { useAuthStore } from '@/store/auth';

export function performDevDemoLogin(targetPath = '/') {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: '1',
      user_id: 1,
      exp: Math.floor(Date.now() / 1000) + 86400 * 365,
      iat: Math.floor(Date.now() / 1000),
    }),
  );
  const validJwt = `${header}.${payload}.signature`;

  const dummyUser = {
    id: 1,
    telegram_id: 6636301647,
    username: 'EvgenBlick',
    first_name: 'Евгений',
    role: 'admin',
    is_admin: true,
    has_subscription: true,
    subscription_days_left: 30,
    active_devices_count: 1,
    balance: 1500,
    balance_rubles: 1500,
    balance_kopeks: 150000,
    created_at: new Date().toISOString(),
  };

  localStorage.setItem('cabinet-dev-auth', 'true');
  sessionStorage.setItem('cabinet-dev-auth', 'true');
  localStorage.setItem('cabinet_ultima_mode', 'true');

  sessionStorage.setItem('access_token', validJwt);
  sessionStorage.setItem('refresh_token', validJwt);
  sessionStorage.setItem('user', JSON.stringify(dummyUser));

  localStorage.setItem('access_token', validJwt);
  localStorage.setItem('refresh_token', validJwt);
  localStorage.setItem('user', JSON.stringify(dummyUser));

  tokenStorage.setTokens(validJwt, validJwt);
  useAuthStore.getState().setTokens(validJwt, validJwt);
  useAuthStore.getState().setUser(dummyUser as any);
  useAuthStore.getState().setIsAdmin(true);

  window.location.href = targetPath;
}
