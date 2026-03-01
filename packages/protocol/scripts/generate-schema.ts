import { zodToJsonSchema } from "zod-to-json-schema";
import { Message } from "../src/index.js";
import { writeFileSync } from "fs";
import { z } from "zod";

const schema = zodToJsonSchema(
  z.object({
    fromClient: Message.FromClient,
    fromServer: Message.FromServer,
  }),
  { definitions: Message },
);
writeFileSync("schema.json", JSON.stringify(schema, null, 2));
console.log("Generated schema.json");
