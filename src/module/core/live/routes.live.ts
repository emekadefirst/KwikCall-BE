import { createRoute, z } from "@hono/zod-openapi";
import { LiveSessionSchema } from "./schema.live";

export const startLiveRoute = createRoute({
  method: 'post',
  path: '/start/{shortCode}',
  request: {
    params: LiveSessionSchema.pick({ shortCode: true }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            token: z.string(),
            serverUrl: z.string(),
          }),
        },
      },
      description: 'Stream started successfully, returns SFU token',
    },
    401: {
      description: 'Unauthorized - You do not own this event',
    },
  },
});

export const joinLiveRoute = createRoute({
  method: 'get',
  path: '/join/{shortCode}',
  request: {
    params: LiveSessionSchema.pick({ shortCode: true }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            token: z.string(),
            serverUrl: z.string(),
          }),
        },
      },
      description: 'Joined stream successfully',
    },
    404: {
      description: 'Stream not found or not live',
    },
  },
});