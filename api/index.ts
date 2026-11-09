import { createFluenticServer } from '../server.ts';

// Export the HTTP server without binding a port. Vercel owns the listener.
// This preserves the existing HTTP and WebSocket routes on the same server.
export default await createFluenticServer();
