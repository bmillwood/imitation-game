import { Message, PongMessage } from '@chat/protocol';
import { ServerWebSocket } from 'bun';

const PORT = 3000;

type WSData = { id: string };

const server = Bun.serve<WSData>({
  port: PORT,
  
  fetch(req, server) {
    const url = new URL(req.url);
    
    // Upgrade WebSocket connections
    if (url.pathname === '/ws') {
      const upgraded = server.upgrade(req, {
        data: { id: crypto.randomUUID() },
      });
      if (upgraded) return;
      return new Response('WebSocket upgrade failed', { status: 500 });
    }
    
    return new Response('Chat server running');
  },
  
  websocket: {
    open(ws: ServerWebSocket<WSData>) {
      console.log(`Client connected: ${ws.data.id}`);
    },
    
    message(ws: ServerWebSocket<WSData>, message) {
      try {
        const data = JSON.parse(message as string);
        const parsed = Message.parse(data);
        
        console.log('Received:', parsed);
        
        // Handle different message types
        if (parsed.type === 'ping') {
          const pong: PongMessage = {
            type: 'pong',
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            payload: {
              originalId: parsed.id,
            },
          };
          ws.send(JSON.stringify(pong));
        }
      } catch (err) {
        console.error('Invalid message:', err);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    },
    
    close(ws: ServerWebSocket<WSData>) {
      console.log(`Client disconnected: ${ws.data.id}`);
    },
  },
});

console.log(`Server running on http://localhost:${PORT}`);
console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
