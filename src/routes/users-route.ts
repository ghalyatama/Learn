import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/users" }).post(
  "/",
  async ({ body, set }) => {
    try {
      const result = await UsersService.register(body);
      set.status = 201;
      return result;
    } catch (error: any) {
      set.status = 400;
      return {
        error: error.message || "Terjadi kesalahan pada server",
      };
    }
  },
  {
    body: t.Object({
      name: t.String({ minLength: 1, error: "Nama tidak boleh kosong" }),
      email: t.String({ minLength: 3, error: "Email tidak boleh kosong" }),
      password: t.String({ minLength: 1, error: "Password tidak boleh kosong" }),
    }),
  }
);
