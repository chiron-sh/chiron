import type { ChironPlugin } from "../types";
import type { ChironClientPlugin } from "./types";
export * from "./vanilla";
export * from "./query";
export * from "./types";

export const InferPlugin = <T extends ChironPlugin>() => {
  return {
    id: "infer-server-plugin",
    $InferServerPlugin: {} as T,
  } satisfies ChironClientPlugin;
};

export type * from "@better-fetch/fetch";
//@ts-expect-error
export type * from "zod";
