import { Builder, Message } from "@chat/protocol";
import { Server, ServerWebSocket } from "bun";

type WSData = { id: string; name: string | null };

type User = {};

const usersByName: Record<string, User> = {};

const server = Bun.serve<WSData>({
  fetch(req: Request, server: Server<WSData>): Response | undefined {
    const url = new URL(req.url);

    // Upgrade WebSocket connections
    if (url.pathname === "/ws") {
      const upgraded = server.upgrade(req, {
        data: { id: crypto.randomUUID(), name: null },
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

        switch (parsed.type) {
          case "ping":
            const pong: Message.Pong = Builder.base({
              type: "pong",
              payload: {
                originalId: parsed.id,
              },
            });
            reply(pong);
            break;
          case "setName":
            const oldName = ws.data.name;
            const newName = parsed.name;
            if (usersByName[newName]) {
              reply(
                Builder.base({
                  type: "nameError",
                  error: "Name already in use",
                }),
              );
              break;
            }
            ws.data.name = newName;
            if (oldName !== null) {
              usersByName[newName] = usersByName[oldName];
              delete usersByName[oldName];
              console.log(`${oldName} renamed to ${newName}`);
            } else {
              usersByName[newName] = {};
              console.log(`${newName} joined`);
            }
            reply(
              Builder.base({
                type: "nameAccept",
              }),
            );
            break;
          default:
            console.log("Unhandled");
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

console.log(`Server running on http://localhost:${server.port}`);
console.log(`WebSocket endpoint: ws://localhost:${server.port}/ws`);
