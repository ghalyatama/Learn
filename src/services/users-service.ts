import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserDTO {
  email: string;
  password: string;
}

export class UsersService {
  static async register(data: RegisterUserDTO) {
    // 1. Periksa apakah email sudah terdaftar
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email sudah terdaftar");
    }

    // 2. Hash password menggunakan Bun built-in bcrypt
    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Simpan data user ke database
    await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return { data: "OK" };
  }

  static async login(data: LoginUserDTO) {
    // 1. Cari user berdasarkan email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    const user = userResult[0];

    // Jika user tidak ditemukan
    if (!user) {
      throw new Error("Email atau password salah");
    }

    // 2. Verifikasi password
    const isPasswordValid = await Bun.password.verify(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    // 3. Generate UUID token
    const token = crypto.randomUUID();

    // 4. Simpan session ke database
    await db.insert(sessions).values({
      token: token,
      userId: user.id,
    });

    // 5. Kembalikan token
    return { data: token };
  }

  static async getCurrentUser(token: string) {
    // Cari data user berdasarkan token di tabel sessions
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    const user = result[0];

    // Jika token tidak valid atau tidak ditemukan
    if (!user) {
      throw new Error("Unauthorized");
    }

    return { data: user };
  }
}


