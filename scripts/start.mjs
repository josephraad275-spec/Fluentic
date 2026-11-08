// Always serve the production bundle, even when the host omits NODE_ENV.
process.env.NODE_ENV = 'production';
await import('../dist-server/server.cjs');
