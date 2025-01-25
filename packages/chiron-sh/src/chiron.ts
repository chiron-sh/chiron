import type { ChironOptions } from "./types";

// export type WithJsDoc<T, D> = Expand<T & D>;

export const setupChiron = <O extends ChironOptions>(options: O) => {
  // const authContext = init(options as O);
  // const { api } = getEndpoints(authContext, options as O);
  // const errorCodes = options.plugins?.reduce((acc, plugin) => {
  // 	if (plugin.$ERROR_CODES) {
  // 		return {
  // 			...acc,
  // 			...plugin.$ERROR_CODES,
  // 		};
  // 	}
  // 	return acc;
  // }, {});
  return {
    handler: async (request: Request) => {
      // const ctx = await authContext;
      // const basePath = ctx.options.basePath || "/api/auth";
      // const url = new URL(request.url);
      // if (!ctx.options.baseURL) {
      // 	const baseURL =
      // 		getBaseURL(undefined, basePath) || `${url.origin}${basePath}`;
      // 	ctx.options.baseURL = baseURL;
      // 	ctx.baseURL = baseURL;
      // }
      // ctx.trustedOrigins = [
      // 	...(options.trustedOrigins || []),
      // 	ctx.baseURL,
      // 	url.origin,
      // ];
      // const { handler } = router(ctx, options);
      return new Response("Hello World");
    },
    // api: api as InferAPI<typeof api>,
    // options: options as O,
    // $context: authContext,
    // $Infer: {} as {
    //   Session: {
    //     session: PrettifyDeep<InferSession<O>>;
    //     user: PrettifyDeep<InferUser<O>>;
    //   };
    // } & InferPluginTypes<O>,
    // $ERROR_CODES: {
    //   ...errorCodes,
    //   ...BASE_ERROR_CODES,
    // } as InferPluginErrorCodes<O> & typeof BASE_ERROR_CODES,
  };
};

// export type Auth = {
// 	handler: (request: Request) => Promise<Response>;
// 	api: FilterActions<ReturnType<typeof router>["endpoints"]>;
// 	options: BetterAuthOptions;
// 	$ERROR_CODES: typeof BASE_ERROR_CODES;
// };
