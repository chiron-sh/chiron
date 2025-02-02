import { defu } from "defu";
import { createLogger } from "./utils/logger";
import { generateId, isProduction } from "./utils";
import type {
  Adapter,
  AuthenticatedUser,
  ChironOptions,
  LiteralUnion,
  Models,
  SecondaryStorage,
  UnauthenticatedUser,
} from "./types";
import { getAdapter } from "./db/utils";
import { getBaseURL } from "./utils/url";
import { getSubscriptionManagementTables } from "./db";
import type { ChironPlugin } from "./types/plugins";
import { createInternalAdapter } from "./db/internal-adapter";
import {
  paymentProviders,
  type PaymentProvider,
  type paymentProviderList,
} from "./payment-providers";
import type { ChironPaymentProvider } from "./payment-providers/types";

export const init = async (options: ChironOptions) => {
  const adapter = await getAdapter(options);
  const plugins = options.plugins || [];
  const internalPlugins = getInternalPlugins(options);
  const logger = createLogger(options.logger);

  const baseURL = getBaseURL(options.baseURL, options.basePath);

  options = {
    ...options,
    baseURL: baseURL ? new URL(baseURL).origin : "",
    basePath: options.basePath || "/api/chiron",
    plugins: plugins.concat(internalPlugins),
  };
  // const cookies = getCookies(options);
  const tables = getSubscriptionManagementTables(options);
  const enabledProviders = Object.keys(options.paymentProviders || {})
    .map((key) => {
      const value = options.paymentProviders?.[key as "internal"]!;
      if (value.enabled === false) {
        return null;
      }
      return paymentProviders[key as (typeof paymentProviderList)[number]](
        // @ts-expect-error should be fixed
        value as any // TODO: fix this
      );
    })
    .filter((x) => x !== null);

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
    authenticate: async (ctx) => {
      const res = await options.authenticate(ctx);
      if (!res) {
        return {
          status: "unauthenticated",
        };
      }
      return {
        ...res,
        status: "authenticated",
      };
    },
    paymentProviders: enabledProviders,
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
  authenticate: (options: {
    headers: Headers;
  }) => Promise<AuthenticatedUser | UnauthenticatedUser>;
  paymentProviders: ChironPaymentProvider[];
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
