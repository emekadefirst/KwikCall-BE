import { app, websocket } from "./src/app"

const port = process.env.PORT || 3000;

export default { 
  fetch: app.fetch,
  websocket 
}

 