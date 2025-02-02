import { setupChiron } from "chiron-sh";
import { drizzleAdapter } from "chiron-sh/adapters/drizzle";
import { stripe } from "chiron-sh/plugins/stripe";
import * as schema from "../db/schema";
import { db } from "@/db";
import { env } from "@/env";
import { auth } from "./auth";

export const chiron = setupChiron({
  authenticate: async (ctx) => {
    const session = await auth.api.getSession({
      headers: ctx.headers,
    });
    if (!session?.user) {
      return null;
    }
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    };
  },
  accessLevels: {
    pro: {
      products: [
        {
          from: "stripe",
          productId: "prod_P000000000000",
          priceId: "price_P000000000000",
        },
      ],
    },
  },
  plugins: [
    stripe({
      stripePublishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripeSecretKey: env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
});
