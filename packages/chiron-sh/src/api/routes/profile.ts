import { z } from "zod";
import { createChironEndpoint, createChironMiddleware } from "../call";
import { APIError } from "better-call";

export const authMiddleware = createChironMiddleware(async (ctx) => {
  // const session = await getSessionFromCtx(ctx);
  const session = await ctx.context.authenticate({
    headers: ctx.headers || new Headers(),
  });

  if (session.status === "unauthenticated") {
    throw new APIError("UNAUTHORIZED");
  }

  return {
    session,
  };
});

export const getProfile = createChironEndpoint(
  "/profile",
  {
    method: "GET",
    requireHeaders: true,
    metadata: {
      openapi: {
        description: "Get the current session",
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    email: {
                      type: "string",
                    },
                    name: {
                      type: "string",
                    },
                    // session: {
                    //   type: "object",
                    //   properties: {
                    //     token: {
                    //       type: "string",
                    //     },
                    //     userId: {
                    //       type: "string",
                    //     },
                    //     expiresAt: {
                    //       type: "string",
                    //     },
                    //   },
                    // },
                    // user: {
                    //   type: "object",
                    //   $ref: "#/components/schemas/User",
                    // },
                  },
                },
              },
            },
          },
        },
      },
    },
    use: [authMiddleware],
  },
  async (ctx) => {
    const session = ctx.context.session;
    return ctx.json({
      status: true,
      body: {
        id: session.id,
        email: session.email,
        name: session.name,
      },
    });
  }
);
