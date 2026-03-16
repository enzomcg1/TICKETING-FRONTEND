function normalizeApiUrl(rawValue: string): string {
  const trimmed = rawValue.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function normalizeSocketUrl(rawValue: string): string {
  return rawValue.trim().replace(/\/+$/, '');
}

function normalizeBoolean(rawValue: string | undefined, defaultValue: boolean): boolean {
  if (rawValue === undefined) {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'on'].includes(rawValue.trim().toLowerCase());
}

function assertSecureUrl(url: string, varName: string): void {
  if (import.meta.env.PROD && url.startsWith('http://')) {
    throw new Error(`${varName} debe usar HTTPS en produccion`);
  }
}

const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api';

export const API_BASE_URL = normalizeApiUrl(rawApiBaseUrl);
assertSecureUrl(API_BASE_URL, 'VITE_API_BASE_URL');

const rawSocketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '') ||
  'http://localhost:3000';

export const SOCKET_URL = normalizeSocketUrl(rawSocketUrl);
assertSecureUrl(SOCKET_URL, 'VITE_SOCKET_URL');

export const SOCKET_ENABLED = normalizeBoolean(import.meta.env.VITE_ENABLE_SOCKET, false);
