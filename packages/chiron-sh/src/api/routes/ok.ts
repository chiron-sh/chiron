import { HIDE_METADATA } from "../../utils/hide-metadata";
import { createChironEndpoint } from "../call";

export const ok = createChironEndpoint(
  "/ok",
  {
    method: "GET",
    metadata: {
      ...HIDE_METADATA,
      openapi: {
        description: "Check if the API is working",
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: {
                      type: "boolean",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  async (ctx) => {
    return ctx.json({
      ok: true,
    });
  }
);
