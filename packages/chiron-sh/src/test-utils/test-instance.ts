import fs from "fs/promises";
import { afterAll } from "vitest";
import { setupChiron } from "../chiron";
import type { ChironOptions } from "../types";
import { getMigrations } from "../db/get-migration";
import { getAdapter } from "../db/utils";
import Database from "better-sqlite3";
import { Kysely, MysqlDialect, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "../adapters/mongodb-adapter";
import { createPool } from "mysql2/promise";
import { generateRandomString } from "../utils";

export async function getTestInstance<
  O extends Partial<ChironOptions>,
  //   C extends ClientOptions,
>(
  options?: O,
  config?: {
    // clientOptions?: C;
    port?: number;
    // disableTestUser?: boolean;
    // testUser?: Partial<User>;
    testWith?: "sqlite" | "postgres" | "mongodb" | "mysql";
  }
) {
  const testWith = config?.testWith || "sqlite";
  /**
   * create db folder if not exists
   */
  await fs.mkdir(".db", { recursive: true });
  const randomStr = generateRandomString(4, "a-z");
  const dbName = `./.db/test-${randomStr}.db`;

  const postgres = new Kysely({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: "postgres://user:password@localhost:5432/better_auth",
      }),
    }),
  });

  const mysql = new Kysely({
    dialect: new MysqlDialect(
      createPool("mysql://user:password@localhost:3306/better_auth")
    ),
  });

  async function mongodbClient() {
    const dbClient = async (connectionString: string, dbName: string) => {
      const client = new MongoClient(connectionString);
      await client.connect();
      const db = client.db(dbName);
      return db;
    };
    const db = await dbClient("mongodb://127.0.0.1:27017", "better-auth");
    return db;
  }

  const opts = {
    database:
      testWith === "postgres"
        ? { db: postgres, type: "postgres" }
        : testWith === "mongodb"
          ? mongodbAdapter(await mongodbClient())
          : testWith === "mysql"
            ? { db: mysql, type: "mysql" }
            : new Database(dbName),
    rateLimit: {
      enabled: false,
    },
    advanced: {},
  } satisfies ChironOptions;

  const chiron = setupChiron({
    baseURL: "http://localhost:" + (config?.port || 3000),
    ...opts,
    ...options,
    advanced: {},
    plugins: [...(options?.plugins || [])],
  } as O extends undefined ? typeof opts : O & typeof opts);

  if (testWith !== "mongodb") {
    const { runMigrations } = await getMigrations({
      ...chiron.options,
      database: opts.database,
    });
    await runMigrations();
  }

  afterAll(async () => {
    if (testWith === "mongodb") {
      const db = await mongodbClient();
      await db.dropDatabase();
      return;
    }
    if (testWith === "postgres") {
      await sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`.execute(
        postgres
      );
      await postgres.destroy();
      return;
    }

    if (testWith === "mysql") {
      await sql`SET FOREIGN_KEY_CHECKS = 0;`.execute(mysql);
      const tables = await mysql.introspection.getTables();
      for (const table of tables) {
        // @ts-expect-error
        await mysql.deleteFrom(table.name).execute();
      }
      await sql`SET FOREIGN_KEY_CHECKS = 1;`.execute(mysql);
      return;
    }

    await fs.unlink(dbName);
  });

  const customFetchImpl = async (
    url: string | URL | Request,
    init?: RequestInit
  ) => {
    const req = new Request(url.toString(), init);
    return chiron.handler(req);
  };

  //   const client = createAuthClient({
  //     // ...(config?.clientOptions as C extends undefined ? {} : C),
  //     baseURL: getBaseURL(
  //       options?.baseURL || "http://localhost:" + (config?.port || 3000),
  //       options?.basePath || "/api/auth"
  //     ),
  //     fetchOptions: {
  //       customFetchImpl,
  //     },
  //   });
  return {
    chiron,
    customFetchImpl,
    db: await getAdapter(chiron.options),
  };
}
