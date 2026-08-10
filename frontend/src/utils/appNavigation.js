const PUBLIC_APP_URL = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL?.trim();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

function normalizePath(path) {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

function getConfiguredOrigin(scope) {
  const configured = scope === 'admin' ? ADMIN_APP_URL : PUBLIC_APP_URL;
  return configured || '';
}

export function getAppUrl(path = '/', scope = 'public') {
  const targetPath = normalizePath(path);
  const configuredOrigin = getConfiguredOrigin(scope);

  if (!configuredOrigin) {
    return targetPath;
  }

  try {
    const url = new URL(targetPath, configuredOrigin);

    if (typeof window !== 'undefined' && url.origin === window.location.origin) {
      return `${url.pathname}${url.search}${url.hash}` || '/';
    }

    return url.toString();
  } catch {
    return targetPath;
  }
}

export function openAppUrl(path = '/', scope = 'public') {
  const url = getAppUrl(path, scope);

  if (typeof window !== 'undefined') {
    window.location.assign(url);
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL || '/api';
}
