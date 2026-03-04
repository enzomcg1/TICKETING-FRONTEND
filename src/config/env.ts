// Configuracion de entorno para el frontend.
// En produccion, estos valores deben venir de variables de entorno.

function normalizeApiUrl(rawValue: string): string {
  const trimmed = rawValue.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function normalizeSocketUrl(rawValue: string): string {
  return rawValue.trim().replace(/\/+$/, '');
}

function assertSecureUrl(url: string, varName: string): void {
  if (import.meta.env.PROD && url.startsWith('http://')) {
    throw new Error(`${varName} debe usar HTTPS en produccion`);
  }
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL
  || import.meta.env.VITE_API_URL
  || 'http://localhost:3000/api';

export const API_BASE_URL = normalizeApiUrl(rawApiBaseUrl);
assertSecureUrl(API_BASE_URL, 'VITE_API_BASE_URL');

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '')
  || 'http://localhost:3000';

export const SOCKET_URL = normalizeSocketUrl(rawSocketUrl);
assertSecureUrl(SOCKET_URL, 'VITE_SOCKET_URL');
