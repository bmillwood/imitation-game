import { z } from "zod";

// Base message envelope
export const Base = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const ProtocolError = Base.extend({
  type: z.literal("protocolError"),
  error: z.string(),
});

// Specific message types
export const Ping = Base.extend({
  type: z.literal("ping"),
});

export const Pong = Base.extend({
  type: z.literal("pong"),
  payload: z.object({
    originalId: z.string().uuid(),
  }),
});

export const SetName = Base.extend({
  type: z.literal("setName"),
  name: z.string(),
});

export const NameAccept = Base.extend({
  type: z.literal("nameAccept"),
  name: z.string(),
});

export const NameError = Base.extend({
  type: z.literal("nameError"),
  name: z.string(),
  error: z.string(),
});

export const FromClient = z.discriminatedUnion("type", [
  ProtocolError,
  Ping,
  Pong,
  SetName,
]);

export const FromServer = z.discriminatedUnion("type", [
  ProtocolError,
  Ping,
  Pong,
  NameAccept,
  NameError,
]);

// Export TypeScript types
export type Base = z.infer<typeof Base>;
export type Ping = z.infer<typeof Ping>;
export type Pong = z.infer<typeof Pong>;
export type FromClient = z.infer<typeof FromClient>;
export type FromServer = z.infer<typeof FromServer>;
