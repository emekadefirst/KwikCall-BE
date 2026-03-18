import { OpenAPIHono } from "@hono/zod-openapi";
import { startLiveRoute, joinLiveRoute } from "./routes.live";
import { LiveService } from "./services.live";

const liveController = new OpenAPIHono();
const liveService = new LiveService();

// HOST: Start the session
liveController.openapi(startLiveRoute, async (c) => {
  const { shortCode } = c.req.valid('param');
  const user = c.get('user' as any); // From your Auth middleware

  try {
    const result = await liveService.startSession(shortCode!, user.id);
    return c.json(result, 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 401 as any);
  }
});

// VIEWER: Join the session
liveController.openapi(joinLiveRoute, async (c) => {
  const { shortCode } = c.req.valid('param');
  const user = c.get('user' as any);

  try {
    const result = await liveService.joinSession(shortCode!, user.id);
    return c.json(result, 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 404 as any);
  }
});

export default liveController;