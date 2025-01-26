import type { ChironPlugin } from "../../types";

interface StripeOptions {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
}

export const stripe = (options: StripeOptions) =>
  ({
    id: "stripe",
    init: (ctx) => {},
  }) satisfies ChironPlugin;
