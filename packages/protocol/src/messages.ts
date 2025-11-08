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

export const SendChat = Base.extend({
  type: z.literal("sendChat"),
  chat: z.string(),
});

export const Chat = Base.extend({
  type: z.literal("chat"),
  name: z.string(),
  chat: z.string(),
});

export const FromClient = z.discriminatedUnion("type", [
  ProtocolError,
  Ping,
  Pong,
  SetName,
  SendChat,
]);
export type ClientType = FromClient["type"];

export const FromServer = z.discriminatedUnion("type", [
  ProtocolError,
  Ping,
  Pong,
  NameAccept,
  NameError,
  Chat,
]);
export type ServerType = FromServer["type"];

// Export TypeScript types
export type Base = z.infer<typeof Base>;
export type ProtocolError = z.infer<typeof ProtocolError>;
export type Ping = z.infer<typeof Ping>;
export type Pong = z.infer<typeof Pong>;
export type SetName = z.infer<typeof SetName>;
export type SendChat = z.infer<typeof SendChat>;
export type FromClient = z.infer<typeof FromClient>;
export type NameAccept = z.infer<typeof NameAccept>;
export type NameError = z.infer<typeof NameError>;
export type Chat = z.infer<typeof Chat>;
export type FromServer = z.infer<typeof FromServer>;
