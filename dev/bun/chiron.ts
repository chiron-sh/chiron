import { setupChiron } from "chiron-sh";
import { drizzleAdapter } from "chiron-sh/adapters/drizzle";
import { stripe } from "chiron-sh/plugins/stripe";
import * as schema from "./db/schema";
import { env } from "bun";

if (
  !env.STRIPE_PUBLISHABLE_KEY ||
  !env.STRIPE_SECRET_KEY ||
  !env.STRIPE_WEBHOOK_SECRET
) {
  throw new Error("Stripe keys are not set");
}

export const chiron = setupChiron({
  baseURL: "http://localhost:4000",
  plugins: [
    stripe({
      stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY,
      stripeSecretKey: env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    }),
  ],
  database: drizzleAdapter(
    {},
    {
      provider: "sqlite",
      schema,
    }
  ),
});
