import { Protocol } from '@chat/protocol';

const WS_URL = 'ws://localhost:3000/ws';

let ws: WebSocket;

function connect() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('Connected to server');
    updateStatus('Connected');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const message = Protocol.FromServer.parse(data);
      console.log('Received:', message);

      const log = document.getElementById('log')!;
      log.textContent += `\n${message.type}: ${JSON.stringify(message, null, 2)}`;
    } catch (err) {
      console.error('Invalid message:', err);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    updateStatus('Error');
  };

  ws.onclose = () => {
    console.log('Disconnected from server');
    updateStatus('Disconnected');
  };
}

function sendPing() {
  const ping: Protocol.Ping = {
    type: 'ping',
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  ws.send(JSON.stringify(ping));
  console.log('Sent:', ping);
}

function updateStatus(status: string) {
  const statusEl = document.getElementById('status')!;
  statusEl.textContent = status;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connect')!.addEventListener('click', connect);
  document.getElementById('ping')!.addEventListener('click', sendPing);
});
