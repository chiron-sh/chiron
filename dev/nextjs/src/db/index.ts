import { env } from "@/env";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
export const db = drizzle(env.DATABASE_URL);
