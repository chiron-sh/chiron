import { defu } from "defu";
import { createLogger } from "./utils/logger";
import { generateId, isProduction } from "./utils";
import type {
  Adapter,
  ChironOptions,
  LiteralUnion,
  Models,
  SecondaryStorage,
} from "./types";
import { getAdapter } from "./db/utils";
import { getBaseURL } from "./utils/url";
import { getSubscriptionManagementTables } from "./db";
import type { ChironPlugin } from "./types/plugins";
import { createInternalAdapter } from "./db/internal-adapter";

export const init = async (options: ChironOptions) => {
  const adapter = await getAdapter(options);
  const plugins = options.plugins || [];
  const internalPlugins = getInternalPlugins(options);
  const logger = createLogger(options.logger);

  const baseURL = getBaseURL(options.baseURL, options.basePath);

  options = {
    ...options,
    baseURL: baseURL ? new URL(baseURL).origin : "",
    basePath: options.basePath || "/api/auth",
    plugins: plugins.concat(internalPlugins),
  };
  // const cookies = getCookies(options);
  const tables = getSubscriptionManagementTables(options);
  // const providers = Object.keys(options.socialProviders || {})
  // 	.map((key) => {
  // 		const value = options.socialProviders?.[key as "github"]!;
  // 		if (value.enabled === false) {
  // 			return null;
  // 		}
  // 		if (!value.clientId) {
  // 			logger.warn(
  // 				`Social provider ${key} is missing clientId or clientSecret`,
  // 			);
  // 		}
  // 		return socialProviders[key as (typeof socialProviderList)[number]](
  // 			value as any, // TODO: fix this
  // 		);
  // 	})
  // 	.filter((x) => x !== null);

  const generateIdFunc: ChironContext["generateId"] = ({ model, size }) => {
    if (typeof options?.advanced?.generateId === "function") {
      return options.advanced.generateId({ model, size });
    }
    return generateId(size);
  };

  const ctx: ChironContext = {
    options,
    tables,
    baseURL: baseURL || "",
    rateLimit: {
      ...options.rateLimit,
      enabled: options.rateLimit?.enabled ?? isProduction,
      window: options.rateLimit?.window || 10,
      max: options.rateLimit?.max || 100,
      storage:
        options.rateLimit?.storage ||
        (options.secondaryStorage ? "secondary-storage" : "memory"),
    },
    logger: logger,
    generateId: generateIdFunc,
    secondaryStorage: options.secondaryStorage,
    adapter: adapter,
    internalAdapter: createInternalAdapter(adapter, {
      options,
      hooks: options.databaseHooks ? [options.databaseHooks] : [],
      generateId: generateIdFunc,
    }),
  };
  let { context } = runPluginInit(ctx);
  return context;
};

export type ChironContext = {
  options: ChironOptions;
  baseURL: string;
  logger: ReturnType<typeof createLogger>;
  rateLimit: {
    enabled: boolean;
    window: number;
    max: number;
    storage: "memory" | "database" | "secondary-storage";
  } & ChironOptions["rateLimit"];
  secondaryStorage: SecondaryStorage | undefined;
  adapter: Adapter;
  internalAdapter: ReturnType<typeof createInternalAdapter>;
  generateId: (options: {
    model: LiteralUnion<Models, string>;
    size?: number;
  }) => string;
  //   secondaryStorage: SecondaryStorage | undefined;

  tables: ReturnType<typeof getSubscriptionManagementTables>;
};

function runPluginInit(ctx: ChironContext) {
  let options = ctx.options;
  const plugins = options.plugins || [];
  let context: ChironContext = ctx;
  const dbHooks: ChironOptions["databaseHooks"][] = [];
  for (const plugin of plugins) {
    if (plugin.init) {
      const result = plugin.init(ctx);
      if (typeof result === "object") {
        if (result.options) {
          const { databaseHooks, ...restOpts } = result.options;
          if (databaseHooks) {
            dbHooks.push(databaseHooks);
          }
          options = defu(options, restOpts);
        }
        if (result.context) {
          context = {
            ...context,
            ...(result.context as Partial<ChironContext>),
          };
        }
      }
    }
  }
  // Add the global database hooks last
  dbHooks.push(options.databaseHooks);
  context.internalAdapter = createInternalAdapter(ctx.adapter, {
    options,
    hooks: dbHooks.filter((u) => u !== undefined),
    generateId: ctx.generateId,
  });
  context.options = options;
  return { context };
}

function getInternalPlugins(options: ChironOptions) {
  const plugins: ChironPlugin[] = [];
  return plugins;
}
