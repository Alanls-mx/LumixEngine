const productionApiBaseUrl = 'https://s2api.lumixengine.com';
const localHostnames = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

function isLocalBrowser() {
  return typeof window !== 'undefined' && localHostnames.has(window.location.hostname);
}

export const apiBaseUrl = isLocalBrowser()
  ? ''
  : import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? productionApiBaseUrl : '');

export function resolveApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
