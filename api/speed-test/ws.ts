import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

/**
 * Standalone Vercel Function - WebSocket endpoint for Pulse Speed Test latency.
 *
 * Deployed as a root-level API function (not a Next.js route handler) because
 * Next.js route handlers don't support WebSocket upgrade. Vercel deploys files
 * in the root `api/` directory as standalone serverless functions.
 *
 * Handles two message types:
 * - `ping`: Returns a `pong` with server timestamp (idle latency)
 * - `ping-loaded`: Same as ping but tagged for bufferbloat tracking during download
 *
 * Auto-closes after 30s to prevent leaked connections.
 * Runs on Vercel Fluid Compute - each WS connection is pinned to one instance.
 */
const server = http.createServer();
const wss = new WebSocketServer({ server });

const AUTO_CLOSE_MS = 30_000; // Safety timeout

wss.on('connection', (ws: WebSocket) => {
  const closeTimer = setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close(1000, 'Speed test session timeout');
    }
  }, AUTO_CLOSE_MS);

  ws.on('message', (raw: Buffer | string) => {
    try {
      const msg = JSON.parse(typeof raw === 'string' ? raw : raw.toString('utf-8'));

      if (msg.type === 'ping' || msg.type === 'ping-loaded') {
        ws.send(
          JSON.stringify({
            type: 'pong',
            clientTs: msg.ts,
            serverTs: Date.now(),
            loaded: msg.type === 'ping-loaded',
          }),
        );
      }
    } catch {
      // Ignore malformed messages
    }
  });

  ws.on('close', () => {
    clearTimeout(closeTimer);
  });

  ws.on('error', () => {
    clearTimeout(closeTimer);
  });
});

export default server;
