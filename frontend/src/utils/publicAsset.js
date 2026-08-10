function withTrailingSlash(value) {
  if (!value) return '/';
  return value.endsWith('/') ? value : `${value}/`;
}

export function publicAsset(path) {
  const cleanPath = String(path || '').replace(/^\/+/, '');
  const base = withTrailingSlash(import.meta.env.BASE_URL || '/');
  return `${base}${cleanPath}`;
}
