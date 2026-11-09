import { createFluenticServer } from '../server.ts';
const server = await createFluenticServer({ development: true });
server.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
