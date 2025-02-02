import { createChironEndpoint } from "../../api";
import type { ChironPaymentProvider } from "../../payment-providers/types";
import type { ChironPlugin } from "../../types";

interface StripeOptions {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
}

export const stripe = (options: StripeOptions) =>
  ({
    id: "stripe",
    init: (ctx) => {
      return {
        context: {
          ...ctx,
          paymentProviders: ctx.paymentProviders.concat([
            {
              id: "stripe",
            } satisfies ChironPaymentProvider,
          ]),
        },
      };
    },
    endpoints: {
      stripeWebhook: createChironEndpoint(
        "/stripe/webhook",
        {
          method: "GET",
        },
        async (ctx) => {
          // TODO: Handle stripe webhook
          return ctx.json({ message: "Hello World" });
        }
      ),
    },
  }) satisfies ChironPlugin;
