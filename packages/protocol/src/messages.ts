import { z } from 'zod';

// Base message envelope
const BaseMessage = z.object({
    id: z.string().uuid(),
    timestamp: z.string().datetime(),
});

// Specific message types
export const PingMessage = BaseMessage.extend({
    type: z.literal('ping'),
});

export const PongMessage = BaseMessage.extend({
    type: z.literal('pong'),
    payload: z.object({
        originalId: z.string().uuid(),
    }),
});

// Union of all message types
export const Message = z.discriminatedUnion('type', [
    PingMessage,
    PongMessage,
]);

// Export TypeScript types
export type PingMessage = z.infer<typeof PingMessage>;
export type PongMessage = z.infer<typeof PongMessage>;
export type Message = z.infer<typeof Message>;
