process.env.NODE_ENV = 'production';
const { createFluenticServer } = await import('../dist-server/server.cjs');
const server = await createFluenticServer();
server.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
