import type { ChironPlugin } from "../types";

export function toNextJsHandler(
  chiron:
    | {
        handler: (request: Request) => Promise<Response>;
      }
    | ((request: Request) => Promise<Response>)
) {
  const handler = async (request: Request) => {
    return "handler" in chiron ? chiron.handler(request) : chiron(request);
  };
  return {
    GET: handler,
    POST: handler,
  };
}

export const nextCookies = () => {
  return {
    id: "next-cookies",
    hooks: {
      after: [
        {
          matcher(ctx) {
            return true;
          },
          handler: async (ctx) => {
            const returned = ctx.responseHeader;
            if ("_flag" in ctx && ctx._flag === "router") {
              return;
            }
            if (returned instanceof Headers) {
              const setCookies = returned?.get("set-cookie");
              if (!setCookies) return;
              return;
            }
          },
        },
      ],
    },
  } satisfies ChironPlugin;
};
