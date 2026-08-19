import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .get("/", () => ({
    message: "Server is running",
    status: "ok",
  }))
  .group("/api", (app) => app.use(usersRoute))
  .listen(port);

console.log(`🦊 Elysia is running at http://${app.server?.hostname || "localhost"}:${app.server?.port}`);

export type App = typeof app;

