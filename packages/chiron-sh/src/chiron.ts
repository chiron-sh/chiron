import { getEndpoints, router } from "./api";
import { BASE_ERROR_CODES } from "./error/codes";
import { init } from "./init";
import type { ChironOptions, InferPluginErrorCodes } from "./types";
import type { InferAPI, FilterActions } from "./types/api";
import { getBaseURL } from "./utils/url";

// export type WithJsDoc<T, D> = Expand<T & D>;

export const setupChiron = <O extends ChironOptions>(options: O) => {
  const chironContext = init(options as O);
  const { api } = getEndpoints(chironContext, options as O);
  const errorCodes = options.plugins?.reduce((acc, plugin) => {
    if (plugin.$ERROR_CODES) {
      return {
        ...acc,
        ...plugin.$ERROR_CODES,
      };
    }
    return acc;
  }, {});
  return {
    handler: async (request: Request) => {
      const ctx = await chironContext;
      const basePath = ctx.options.basePath || "/api/chiron";
      const url = new URL(request.url);
      if (!ctx.options.baseURL) {
        const baseURL =
          getBaseURL(undefined, basePath) || `${url.origin}${basePath}`;
        ctx.options.baseURL = baseURL;
        ctx.baseURL = baseURL;
      }

      const { handler } = router(ctx, options);
      return handler(request);
    },
    api: api as InferAPI<typeof api>,
    options: options as O,
    $context: chironContext,
    // $Infer: {} as {
    //   Session: {
    //     session: PrettifyDeep<InferSession<O>>;
    //     user: PrettifyDeep<InferUser<O>>;
    //   };
    // } & InferPluginTypes<O>,
    $ERROR_CODES: {
      ...errorCodes,
      ...BASE_ERROR_CODES,
    } as InferPluginErrorCodes<O> & typeof BASE_ERROR_CODES,
  };
};

export type Chiron = {
  handler: (request: Request) => Promise<Response>;
  api: FilterActions<ReturnType<typeof router>["endpoints"]>;
  options: ChironOptions;
  $ERROR_CODES: typeof BASE_ERROR_CODES;
};
