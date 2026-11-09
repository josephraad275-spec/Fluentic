/** Same-origin on the web; explicitly configured HTTPS backend in native builds. */
export function resolveApiUrl(path: string, base = ''): string {
  if (!path.startsWith('/api/')) throw new Error('Only Fluentic API paths are supported.');
  if (!base) return path;
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('API base must be an HTTPS origin without credentials, path, query or fragment.');
  }
  return new URL(path, url.origin).href;
}

function configuredBase(): string {
  return (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '';
}

export function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(resolveApiUrl(path, configuredBase()), options);
}

export function voiceSocketUrl(): string {
  const url = new URL(resolveApiUrl('/api/ws/voice-stream', configuredBase()), window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.href;
}
