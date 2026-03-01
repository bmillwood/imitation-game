import { zodToJsonSchema } from "zod-to-json-schema";
import { Message } from "../src/index.js";
import { writeFileSync } from "fs";

const fromClient = zodToJsonSchema(Message.FromClient, "FromClient");
const fromServer = zodToJsonSchema(Message.FromServer, "FromServer");
writeFileSync("from-client.json", JSON.stringify(fromClient));
writeFileSync("from-server.json", JSON.stringify(fromServer));
console.log("Generated");
