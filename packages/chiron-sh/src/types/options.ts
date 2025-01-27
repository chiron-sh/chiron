import type { Dialect, Kysely, MysqlPool, PostgresPool } from "kysely";
import type { Database } from "better-sqlite3";
import type { AdapterInstance, SecondaryStorage } from "./adapter";
import type { KyselyDatabaseType } from "../adapters/kysely-adapter/types";
import type { Logger } from "../utils";
import type { LiteralUnion } from "./helper";
import type { Models, RateLimit } from "./models";
import type {
  ChironPlugin,
  HookAfterHandler,
  HookBeforeHandler,
} from "./plugins";
import type { ChironContext } from "../init";

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

  /**
   * Secondary storage configuration
   *
   * This is used to store session and rate limit data.
   */
  secondaryStorage?: SecondaryStorage;

  /**
   * List of Chiron plugins
   */
  plugins?: ChironPlugin[];

  logger?: Logger;
  /**
   * allows you to define custom hooks that can be
   * executed during lifecycle of core database
   * operations.
   */
  databaseHooks?: {};

  /**
   * Rate limiting configuration
   */
  rateLimit?: {
    /**
     * By default, rate limiting is only
     * enabled on production.
     */
    enabled?: boolean;
    /**
     * Default window to use for rate limiting. The value
     * should be in seconds.
     *
     * @default 10 seconds
     */
    window?: number;
    /**
     * The default maximum number of requests allowed within the window.
     *
     * @default 100 requests
     */
    max?: number;
    /**
     * Custom rate limit rules to apply to
     * specific paths.
     */
    customRules?: {
      [key: string]:
        | {
            /**
             * The window to use for the custom rule.
             */
            window: number;
            /**
             * The maximum number of requests allowed within the window.
             */
            max: number;
          }
        | ((request: Request) =>
            | { window: number; max: number }
            | Promise<{
                window: number;
                max: number;
              }>);
    };
    /**
     * Storage configuration
     *
     * By default, rate limiting is stored in memory. If you passed a
     * secondary storage, rate limiting will be stored in the secondary
     * storage.
     *
     * @default "memory"
     */
    storage?: "memory" | "database" | "secondary-storage";
    /**
     * If database is used as storage, the name of the table to
     * use for rate limiting.
     *
     * @default "rateLimit"
     */
    modelName?: string;
    /**
     * Custom field names for the rate limit table
     */
    fields?: Record<keyof RateLimit, string>;
    /**
     * custom storage configuration.
     *
     * NOTE: If custom storage is used storage
     * is ignored
     */
    customStorage?: {
      get: (key: string) => Promise<RateLimit | undefined>;
      set: (key: string, value: RateLimit) => Promise<void>;
    };
  };

  /**
   * Advanced options
   */
  advanced?: {
    /**
     * Ip address configuration
     */
    ipAddress?: {
      /**
       * List of headers to use for ip address
       *
       * Ip address is used for rate limiting and session tracking
       *
       * @example ["x-client-ip", "x-forwarded-for"]
       *
       * @default
       * @link https://github.com/voidhashcom/chiron-sh/blob/main/packages/chiron-sh/src/utils/get-request-ip.ts#L8
       */
      ipAddressHeaders?: string[];
      /**
       * Disable ip tracking
       *
       * ⚠︎ This is a security risk and it may expose your application to abuse
       */
      disableIpTracking?: boolean;
    };
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

  /**
   * API error handling
   */
  onAPIError?: {
    /**
     * Throw an error on API error
     *
     * @default false
     */
    throw?: boolean;
    /**
     * Custom error handler
     *
     * @param error
     * @param ctx - Auth context
     */
    onError?: (error: unknown, ctx: ChironContext) => void | Promise<void>;
  };
  /**
   * Hooks
   */
  hooks?: {
    /**
     * Before a request is processed
     */
    before?: HookBeforeHandler;
    /**
     * After a request is processed
     */
    after?: HookAfterHandler;
  };
  /**
   * Disabled paths
   *
   * Paths you want to disable.
   */
  disabledPaths?: string[];
};
