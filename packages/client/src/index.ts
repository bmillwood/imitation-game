import { Builder, Message } from "@chat/protocol";

let ws: WebSocket;

function connect() {
  const wsUrl = new URL(window.location.href);
  wsUrl.protocol = wsUrl.protocol.replace("http", "ws");
  wsUrl.pathname += "/ws";
  console.log(wsUrl.toString());
  ws = new WebSocket(wsUrl.toString());

  ws.onopen = () => {
    console.log("Connected to server");
    updateStatus("Connected");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const message = Message.FromServer.parse(data);
      console.log("Received:", message);

      const log = document.getElementById("log")!;
      log.textContent += `\n${message.type}: ${JSON.stringify(message, null, 2)}`;
    } catch (err) {
      console.error("Invalid message:", err);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    updateStatus("Error");
  };

  ws.onclose = () => {
    console.log("Disconnected from server");
    updateStatus("Disconnected");
  };
}

function send(msg: Message.FromClient) {
  ws.send(JSON.stringify(msg));
  console.log("Sent:", msg);
}

function updateStatus(status: string) {
  const statusEl = document.getElementById("status")!;
  statusEl.textContent = status;
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connect")!.addEventListener("click", connect);
  document
    .getElementById("ping")!
    .addEventListener("click", () => send(Builder.base({ type: "ping" })));
});
