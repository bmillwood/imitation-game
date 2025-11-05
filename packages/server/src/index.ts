import { Builder, Message } from "@chat/protocol";
import { Server, ServerWebSocket } from "bun";

const PORT = Number(process.env.PORT) || 3000;

type WSData = { id: string };

const server = Bun.serve<WSData>({
  port: PORT,

  fetch(req: Request, server: Server<WSData>): Response | undefined {
    const url = new URL(req.url);

    // Upgrade WebSocket connections
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req, {
        data: { id: crypto.randomUUID() },
      });
      if (upgraded) return;
      return new Response("WebSocket upgrade failed", { status: 500 });
    }

    return new Response("Chat server running");
  },

  websocket: {
    open(ws: ServerWebSocket<WSData>) {
      console.log(`Client connected: ${ws.data.id}`);
    },

    message(ws: ServerWebSocket<WSData>, message: string | Buffer) {
      const reply = (msg: Message.FromServer): void => {
        ws.send(JSON.stringify(msg));
      };
      try {
        const data = JSON.parse(message.toString());
        const parsed = Message.FromClient.parse(data);

        console.log("Received:", parsed);

        // Handle different message types
        if (parsed.type === "ping") {
          const pong: Message.Pong = Builder.base({
            type: "pong",
            payload: {
              originalId: parsed.id,
            },
          });
          reply(pong);
        }
      } catch (err) {
        console.error("Invalid message:", err);
        reply(
          Builder.base({
            type: "protocolError",
            error: "Invalid message format",
          }),
        );
      }
    },

    close(ws: ServerWebSocket<WSData>) {
      console.log(`Client disconnected: ${ws.data.id}`);
    },
  },
});

console.log(`Server running on http://localhost:${PORT}`);
console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
