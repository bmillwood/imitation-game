import { z } from 'zod';

// Base message envelope
const Base = z.object({
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
});

// Specific message types
export const Ping = Base.extend({
    type: z.literal('ping'),
});

export const Pong = Base.extend({
    type: z.literal('pong'),
    payload: z.object({
        originalId: z.string().uuid(),
    }),
});

export const NameRequest = Base.extend({
    type: z.literal('set-name'),
    name: z.string(),
});

export const NameAccept = Base.extend({
    type: z.literal('name-accept'),
});

export const NameError = Base.extend({
    type: z.literal('name-error'),
    error: z.string(),
});

export const FromClient = z.discriminatedUnion('type', [
    Ping,
    Pong,
    NameRequest,
]);

export const FromServer = z.discriminatedUnion('type', [
    Ping,
    Pong,
    NameAccept,
    NameError,
]);

// Export TypeScript types
export type Ping = z.infer<typeof Ping>;
export type Pong = z.infer<typeof Pong>;
export type FromClient = z.infer<typeof FromClient>;
export type FromServer = z.infer<typeof FromServer>;
