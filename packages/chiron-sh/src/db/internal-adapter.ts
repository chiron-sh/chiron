import { getWithHooks } from "./with-hooks";
import type { Adapter, ChironContext, ChironOptions } from "../types";

export const createInternalAdapter = (
  adapter: Adapter,
  ctx: {
    options: ChironOptions;
    hooks: Exclude<ChironOptions["databaseHooks"], undefined>[];
    generateId: ChironContext["generateId"];
  }
) => {
  const options = ctx.options;

  const { createWithHooks, updateWithHooks, updateManyWithHooks } =
    getWithHooks(adapter, ctx);

  return {};
};

export type InternalAdapter = ReturnType<typeof createInternalAdapter>;
