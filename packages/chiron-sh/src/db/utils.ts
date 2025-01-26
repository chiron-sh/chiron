import { createKyselyAdapter, kyselyAdapter } from "../adapters/kysely-adapter";
import { memoryAdapter } from "../adapters/memory-adapter";
import { ChironError } from "../error";
import type { Adapter, ChironOptions } from "../types";
import { logger } from "../utils";
import { getSubscriptionManagementTables } from "./get-tables";

export async function getAdapter(options: ChironOptions): Promise<Adapter> {
  if (!options.database) {
    const tables = getSubscriptionManagementTables(options);
    const memoryDB = Object.keys(tables).reduce((acc, key) => {
      // @ts-ignore
      acc[key] = [];
      return acc;
    }, {});
    logger.warn(
      "No database configuration provided. Using memory adapter in development"
    );
    return memoryAdapter(memoryDB)(options);
  }

  if (typeof options.database === "function") {
    return options.database(options);
  }

  const { kysely, databaseType } = await createKyselyAdapter(options);
  if (!kysely) {
    throw new ChironError("Failed to initialize database adapter");
  }
  return kyselyAdapter(kysely, {
    type: databaseType || "sqlite",
  })(options);
}
