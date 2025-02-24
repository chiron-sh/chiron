import {
	type ChironPaymentProvider,
	type ChironPlugin,
	createChironEndpoint,
} from "chiron-sh/plugins";
import { Stripe } from "stripe";
import { z } from "zod";

interface StripeOptions {
	stripePublishableKey: string;
	stripeSecretKey: string;
	stripeWebhookSecret: string;
	stripe?: Stripe;
}

export const stripe = (options: StripeOptions) => {
	const stripeClient = options.stripe ?? new Stripe(options.stripeSecretKey);

	return {
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
					method: "POST",
					body: z.any(),
				},

				async (ctx) => {
					// Verify signature
					const body = ctx.body;
					const signature = ctx.headers?.get("stripe-signature");

					if (!signature || typeof signature !== "string") {
						return ctx.json(
							{},
							{
								status: 400,
							}
						);
					}

					const event = stripeClient.webhooks.constructEvent(
						body as any,
						signature,
						options.stripeWebhookSecret
					);

					return ctx.json({ message: "Hello World" });
				}
			),

			createCheckoutSession: createChironEndpoint(
				"/stripe/checkout-session",
				{
					method: "POST",
					body: z.object({
						priceId: z.string().min(1),
						successRedirect: z.string(),
						cancelRedirect: z.string(),
						redirect: z.boolean().default(false).optional(),
					}),
				},

				async (ctx) => {
					const { priceId, successRedirect, cancelRedirect, redirect } =
						ctx.body;

					const successRedirectUrl = successRedirect.startsWith("http")
						? successRedirect
						: `${ctx.context.baseURL}${successRedirect}`;
					const cancelRedirectUrl = cancelRedirect.startsWith("http")
						? cancelRedirect
						: `${ctx.context.baseURL}${cancelRedirect}`;

					const session = await stripeClient.checkout.sessions.create({
						mode: "subscription",
						line_items: [
							{
								price: priceId,
								quantity: 1,
							},
						],
						success_url: successRedirectUrl,
						cancel_url: cancelRedirectUrl,
					});

					console.log(session);

					if (redirect) {
						if (!session.url) {
							throw new Error("Stripe checkout session URL is missing");
						}
						console.log("Redirecting");
						throw ctx.redirect(session.url);
					}

					return ctx.json({ url: session.url });
				}
			),
		},
	} satisfies ChironPlugin;
};
