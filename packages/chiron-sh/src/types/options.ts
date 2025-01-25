import type { Dialect, Kysely, MysqlPool, PostgresPool } from "kysely";
import type { Database } from "better-sqlite3";
import type { AdapterInstance, SecondaryStorage } from "./adapter";
import type { KyselyDatabaseType } from "../adapters/kysely-adapter/types";
import type { Logger } from "../utils";
import type { LiteralUnion } from "./helper";
import type { Models } from "./models";

export type ChironOptions = {
  /**
   * Base URL for Chiron. This is typically the
   * root URL where your application server is hosted.
   * If not explicitly set,
   * the system will check the following environment variable:
   *
   * process.env.CHIRON_AUTH_URL
   *
   * If not set it will throw an error.
   */
  baseURL?: string;
  /**
   * Base path for the better auth. This is typically
   * the path where the
   * better auth routes are mounted.
   *
   * @default "/api/chiron"
   */
  basePath?: string;
  /**
   * Database configuration
   */
  database?:
    | PostgresPool
    | MysqlPool
    | Database
    | Dialect
    | AdapterInstance
    | {
        dialect: Dialect;
        type: KyselyDatabaseType;
        /**
         * casing for table names
         *
         * @default "camel"
         */
        casing?: "snake" | "camel";
      }
    | {
        /**
         * Kysely instance
         */
        db: Kysely<any>;
        /**
         * Database type between postgres, mysql and sqlite
         */
        type: KyselyDatabaseType;
        /**
         * casing for table names
         *
         * @default "camel"
         */
        casing?: "snake" | "camel";
      };

  logger?: Logger;

  /**
   * Advanced options
   */
  advanced?: {
    /**
     * Custom generateId function.
     *
     * If not provided, random ids will be generated.
     * If set to false, the database's auto generated id will be used.
     */
    generateId?:
      | ((options: {
          model: LiteralUnion<Models, string>;
          size?: number;
        }) => string)
      | false;
  };
};
