import { Builder, Message } from "@chat/protocol";

let ws: WebSocket;
let predictId: string | null = null;

function send(msg: Message.FromClient) {
  ws.send(JSON.stringify(msg));
  console.log("Sent:", msg);
}

function sendName() {
  const form = document.getElementById("settings") as HTMLFormElement;
  const nameInput = form.elements.namedItem("name") as HTMLInputElement;
  const name = nameInput.value !== "" ? nameInput.value : "anonymous";
  send(Builder.base({ type: "setName", name }));
}

type Handler<T extends Message.ServerType> = (
  msg: Extract<Message.FromServer, { type: T }>,
) => void;

const handlers: { [K in Message.ServerType]: Handler<K> } = {
  protocolError(msg: Message.ProtocolError) {
    // shrug
  },

  ping(msg: Message.Ping) {
    const pong: Message.Pong = Builder.base({
      type: "pong",
      payload: {
        originalId: msg.id,
      },
    });
    send(pong);
  },

  pong(msg: Message.Pong) {
    // shrug
  },

  nameAccept(msg: Message.NameAccept) {
    // shrug
  },

  nameError(msg: Message.NameError) {
    // shrug
  },

  chat(msg: Message.Chat) {
    const chat = document.getElementById("chat");
    chat!.appendChild(document.createTextNode(`\n${msg.name}: ${msg.chat}`));
  },

  predict(msg: Message.Predict) {
    const predict = document.getElementById("predict");
    if (!predict) {
      return;
    }
    const tokenNode = document.createTextNode(msg.token);
    if (predictId === msg.after) {
      predict.appendChild(tokenNode);
    } else {
      predict.replaceChildren(tokenNode);
      predictId = msg.after;
    }
  },
};

function handle<T extends Message.ServerType>(
  ws: WebSocket,
  msg: Extract<Message.FromServer, { type: T }>,
): void {
  const handler: Handler<T> = handlers[msg.type];
  return handler(msg);
}

let pingInterval: ReturnType<typeof setInterval> | null = null;
const PING_INTERVAL_MS = 30_000;

function startPingLoop() {
  stopPingLoop();
  pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      send(Builder.base({ type: "ping" }));
    }
  }, PING_INTERVAL_MS);
}

function stopPingLoop() {
  if (pingInterval !== null) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
}

function connect() {
  const wsUrl = new URL(window.location.href);
  wsUrl.protocol = wsUrl.protocol.replace("http", "ws");
  wsUrl.pathname = wsUrl.pathname.replace(/\/[^\/]*$/, "/ws");
  console.log(wsUrl.toString());
  ws = new WebSocket(wsUrl.toString());

  ws.onopen = () => {
    console.log("Connected to server");
    updateConnectButton({ disabled: true, text: "Connected" });
    sendName();
    startPingLoop();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const message = Message.FromServer.parse(data);
      console.log("Received:", message);
      handle(ws, message);
    } catch (err) {
      console.error("Invalid message:", err);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    updateConnectButton({ disabled: false, text: "Reconnect" });
    stopPingLoop();
  };

  ws.onclose = () => {
    console.log("Disconnected from server");
    updateConnectButton({ disabled: false, text: "Reconnect" });
    stopPingLoop();
  };
}

function updateConnectButton(args : { disabled: boolean, text: string }) {
  const el = document.getElementById("connect")! as HTMLButtonElement;
  el.disabled = args.disabled;
  el.textContent = args.text;
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connect")!.addEventListener("click", connect);
  document.getElementById("settings")!.addEventListener("submit", (e) => {
    e.preventDefault();
    sendName();
  });
  const form = document.getElementById("setChat") as HTMLFormElement;
  const chatInput = form.elements.namedItem("chat") as HTMLInputElement;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(Builder.base({ type: "sendChat", chat: chatInput.value }));
    chatInput.value = "";
  });
});
