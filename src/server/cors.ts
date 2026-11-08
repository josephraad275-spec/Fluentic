import type { RequestHandler } from 'express';

/** Explicit native origins only. This is browser CORS, not authentication. */
export function nativeCors(origins: string[]): RequestHandler {
  const allowed = new Set(origins.map(value=>value.trim()).filter(Boolean));
  return (req,res,next) => {
    const origin=req.get('origin');
    if (!origin || !allowed.has(origin)) return next();
    res.vary('Origin');
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    if(req.method==='OPTIONS') { res.sendStatus(204); return; }
    next();
  };
}
