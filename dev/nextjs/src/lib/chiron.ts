import { setupChiron } from "chiron-sh";
import { drizzleAdapter } from "chiron-sh/adapters/drizzle";
import { stripe } from "chiron-sh/plugins/stripe";
import * as schema from "../db/schema";
import { db } from "@/db";
import { env } from "@/env";

export const chiron = setupChiron({
  baseURL: "http://localhost:4000",
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
