import { setupChiron } from "chiron-sh";
import { prismaAdapter } from "chiron-sh/adapters/prisma";

export const chiron = setupChiron({
  baseURL: "http://localhost:4000",
  database: prismaAdapter(
    {},
    {
      provider: "sqlite",
    }
  ),
});
