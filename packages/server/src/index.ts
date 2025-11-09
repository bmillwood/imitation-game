import { Builder, Message } from "@chat/protocol";
import { Server, ServerWebSocket } from "bun";

type WSData = { id: string; name: string | null };
type WS = ServerWebSocket<WSData>;

type User = { ws: WS };

const usersByName: Record<string, User> = {};

type Message = { name: string; chat: string };

const messages: Array<Message> = [];

const reply = (ws: WS, msg: Message.FromServer): void => {
  ws.send(JSON.stringify(msg));
};

type Handler<T extends Message.ClientType> = (
  ws: WS,
  msg: Extract<Message.FromClient, { type: T }>,
) => void;

const handlers: { [K in Message.ClientType]: Handler<K> } = {
  protocolError(ws: WS, msg: Message.ProtocolError) {
    // shrug
  },

  ping(ws: WS, msg: Message.Ping) {
    const pong: Message.Pong = Builder.base({
      type: "pong",
      payload: {
        originalId: msg.id,
      },
    });
    reply(ws, pong);
  },

  pong(ws: WS, msg: Message.Pong) {
    // shrug
  },

  setName(ws: WS, msg: Message.SetName) {
    const oldName = ws.data.name;
    const newName = msg.name;
    if (usersByName[newName]) {
      reply(
        ws,
        Builder.base({
          type: "nameError",
          name: newName,
          error: "Name already in use",
        }),
      );
      return;
    }
    ws.data.name = newName;
    if (oldName !== null) {
      usersByName[newName] = usersByName[oldName];
      delete usersByName[oldName];
      console.log(`${oldName} renamed to ${newName}`);
    } else {
      usersByName[newName] = { ws };
      console.log(`${newName} joined`);
    }
    reply(
      ws,
      Builder.base({
        type: "nameAccept",
        name: newName,
      }),
    );
  },

  sendChat(ws: WS, msg: Message.SendChat) {
    if (ws.data.name === null) {
      reply(
        ws,
        Builder.base({
          type: "protocolError",
          error: "Set your name before chatting",
        }),
      );
    } else {
      messages.push({ name: ws.data.name, chat: msg.chat });
      for (const other in usersByName) {
        reply(
          usersByName[other].ws,
          Builder.base({
            type: "chat",
            name: ws.data.name,
            chat: msg.chat,
          }),
        );
      }
    }
  },

  predict(ws: WS, msg: Message.Predict) {
    for (const other in usersByName) {
      reply(
        usersByName[other].ws,
        Builder.restamp(msg),
      );
    }
  }
};

function handle<T extends Message.ClientType>(
  ws: WS,
  msg: Extract<Message.FromClient, { type: T }>,
): void {
  const handler: Handler<T> = handlers[msg.type];
  return handler(ws, msg);
}

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
      try {
        const data = JSON.parse(message.toString());
        const parsed = Message.FromClient.parse(data);

        console.log("Received:", parsed);

        handle(ws, parsed);
      } catch (err) {
        console.error("Invalid message:", err);
        reply(
          ws,
          Builder.base({
            type: "protocolError",
            error: "Invalid message format",
          }),
        );
      }
    },

    close(ws: ServerWebSocket<WSData>) {
      if (ws.data.name !== null) {
        delete usersByName[ws.data.name];
      }
      console.log(`Client disconnected: ${ws.data.id}`);
    },
  },
});

console.log(`Server running on http://localhost:${server.port}`);
console.log(`WebSocket endpoint: ws://localhost:${server.port}/ws`);
