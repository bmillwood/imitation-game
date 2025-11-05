import type { Base } from "./messages.js";

export function base<T extends object>(fields: T): T & Base {
  return {
    ...fields,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}
