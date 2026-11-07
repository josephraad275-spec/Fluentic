import type { RequestHandler } from 'express';

/** In-process abuse guard. Use a shared gateway limiter when running multiple replicas. */
export function createAILimiter(): RequestHandler {
  const clients = new Map<string, { count: number; resets: number; active: number }>();
  return (req, res, next) => {
    if (req.method !== 'POST' || !/^\/api\/(fluentic-ai|gemini|engine|translate)/.test(req.path)) return next();
    const now = Date.now();
    for (const [key, value] of clients) if (value.resets <= now && value.active === 0) clients.delete(key);
    const key = req.socket.remoteAddress || 'unknown';
    let client = clients.get(key);
    if (!client) { client = { count: 0, resets: now + 60000, active: 0 }; clients.set(key, client); }
    if (client.count >= 30 || client.active >= 6) {
      res.setHeader('Retry-After', Math.max(1, Math.ceil((client.resets - now) / 1000)));
      return res.status(429).json({ error: 'Too many AI requests. Please wait a moment and retry.', code: 'RATE_LIMITED' });
    }
    client.count++;
    client.active++;
    let released = false;
    const release = () => { if (!released) { released = true; client.active--; } };
    res.once('finish', release);
    res.once('close', release);
    next();
  };
}
