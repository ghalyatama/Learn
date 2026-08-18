import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const port = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .get("/", () => ({
    message: "Hello from Bun + Elysia + Drizzle + PostgreSQL!",
    status: "ok",
  }))
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return { success: true, data: allUsers };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  })
  .post(
    "/users",
    async ({ body, set }) => {
      try {
        const [newUser] = await db
          .insert(users)
          .values({
            name: body.name,
            email: body.email,
          })
          .returning();

        set.status = 201;
        return { success: true, data: newUser };
      } catch (error) {
        set.status = 400;
        return { success: false, error: (error as Error).message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  )
  .listen(port);

console.log(`🦊 Elysia is running at http://${app.server?.hostname || "localhost"}:${app.server?.port}`);

export type App = typeof app;
