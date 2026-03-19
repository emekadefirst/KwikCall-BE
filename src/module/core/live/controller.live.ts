import { OpenAPIHono } from "@hono/zod-openapi";
import { startLiveRoute, joinLiveRoute } from "./routes.live";
import { LiveService } from "./services.live";
import { getCookie } from "hono/cookie";
import { getUserIdFromHeader } from "../../../hooks/header.hooks";

const liveController = new OpenAPIHono();
const liveService = new LiveService();

// HOST: Start the session
liveController.openapi(startLiveRoute, async (c) => {
  const { shortCode } = c.req.valid('param');
    const token = getCookie(c, 'accessToken');
    
    if (!token) {
        return c.json({ message: "Unauthorized: No access token" }, 401);
    }

    const hostId = await getUserIdFromHeader(token) as string;

  try {
    const result = await liveService.startSession(shortCode!, hostId);
    return c.json(result, 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 401 as any);
  }
});

// VIEWER: Join the session
liveController.openapi(joinLiveRoute, async (c) => {
  const { shortCode } = c.req.valid('param');
    const token = getCookie(c, 'accessToken');
    
    if (!token) {
        return c.json({ message: "Unauthorized: No access token" }, 401);
    }

    const hostId = await getUserIdFromHeader(token) as string;

  try {
    const result = await liveService.joinSession(shortCode!, hostId);
    return c.json(result, 200);
  } catch (e: any) {
    return c.json({ error: e.message }, 404 as any);
  }
});

export default liveController;