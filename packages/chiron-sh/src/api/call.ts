import {
  APIError,
  type Endpoint,
  type EndpointResponse,
  createEndpointCreator,
  createMiddleware,
  createMiddlewareCreator,
} from "better-call";
import type { ChironContext } from "../init";
import type { ChironOptions } from "../types/options";

export const optionsMiddleware = createMiddleware(async () => {
  /**
   * This will be passed on the instance of
   * the context. Used to infer the type
   * here.
   */
  return {} as ChironContext;
});

export const createAuthMiddleware = createMiddlewareCreator({
  use: [
    optionsMiddleware,
    /**
     * Only use for post hooks
     */
    createMiddleware(async () => {
      return {} as {
        returned?: APIError | Response | Record<string, any>;
        endpoint: Endpoint;
      };
    }),
  ],
});

export const createAuthEndpoint = createEndpointCreator({
  use: [optionsMiddleware],
});

export type ChironEndpoint = Endpoint<
  (ctx: {
    options: ChironOptions;
    body: any;
    query: any;
    params: any;
    headers: Headers;
  }) => Promise<EndpointResponse>
>;

export type AuthMiddleware = ReturnType<typeof createAuthMiddleware>;
