import type { ChironContext, Customer } from "chiron-sh";
import { type ChironPlugin, createChironEndpoint } from "chiron-sh/plugins";
import { Stripe } from "stripe";
import { z } from "zod";
import { ChironError } from "../../../packages/chiron-sh/src/error";
import { tryCatch } from "./utils/try-catch";
import { authMiddleware } from "../../../packages/chiron-sh/src/api/routes/profile";
import { transformToChironSubscription } from "./utils/transform";
import { type AccessLevelConfiguration } from "chiron-sh";
import { createPaymentProvider } from "../../../packages/chiron-sh/src/payment-providers/core";
import type { StripeOptions, StripeProductConfig } from "./types";
import { ALLOWED_EVENTS } from "./constants";
import { getSchema } from "./schema";

const PLUGIN_ID = "stripe";

/**
 * Maps access levels to Stripe product configurations
 */
export type StripeAccessLevelMap<T extends AccessLevelConfiguration> = {
	[K in keyof T]?: StripeProductConfig[];
};

export const stripe = (options: StripeOptions) => {
	const stripeClient = options.stripe ?? new Stripe(options.stripeSecretKey);

	const createStripeCustomer = async (
		ctx: ChironContext,
		customer: Customer & { stripeCustomerId?: string }
	) => {
		if (customer.stripeCustomerId) {
			return customer.stripeCustomerId;
		}

		const stripeCustomerCreationResult = await tryCatch(
			stripeClient.customers.create({
				email: customer.email ?? undefined,
				name: customer.name ?? undefined,
				metadata: {
					"chiron:customerId": customer.id,
				},
			})
		);

		if (stripeCustomerCreationResult.error) {
			throw new ChironError("Failed to create Stripe customer");
		}

		const stripeCustomer = stripeCustomerCreationResult.data;

		await ctx.adapter.update<Customer>({
			model: "customer",
			where: [
				{
					field: "id",
					value: customer.id,
				},
			],
			update: {
				stripeCustomerId: stripeCustomer.id,
			},
		});

		return stripeCustomer.id;
	};

	const syncStripeData = async (
		ctx: ChironContext,
		stripeCustomerId: string
	) => {
		const customer = await ctx.adapter.findOne<Customer>({
			model: "customer",
			where: [
				{
					field: "stripeCustomerId",
					value: stripeCustomerId,
				},
			],
		});

		if (!customer) {
			throw new ChironError("Customer with specified Stripe ID not found");
		}

		await ctx.paymentCore.syncCustomerSubscriptions({
			customerId: customer.id,
			provider: PLUGIN_ID,
		});
	};

	return {
		id: PLUGIN_ID,
		init: (ctx) => {
			return {
				context: {
					...ctx,
					paymentProviders: ctx.paymentProviders.concat([
						createPaymentProvider({
							id: PLUGIN_ID,
							extractSubscriptionAccessLevel: (subscription) => {
								if (!options.accessLevels) {
									return null;
								}

								// Get the product ID from the subscription
								const productId = subscription.providerProductId;
								const priceId = subscription.providerBasePlanId;

								// Use the accessLevels mapping function to find the matching access level
								let matchedAccessLevel: string | null = null;

								options.accessLevels((accessLevels, mapping) => {
									// Check each access level in the mapping
									for (const [level, products] of Object.entries(mapping)) {
										if (!products) continue;

										// Look for a product configuration that matches this subscription
										const matchingProduct = products.find(
											(product) =>
												product.productId === productId &&
												product.priceId === priceId
										);

										if (matchingProduct) {
											matchedAccessLevel = level;
											break;
										}
									}

									return mapping;
								});

								return matchedAccessLevel;
							},
							getSubscriptions: async ({ customerId }) => {
								const profile = (await ctx.adapter.findOne<Customer>({
									model: "customer",
									where: [
										{
											field: "id",
											value: customerId,
										},
									],
								})) as Customer & { stripeCustomerId?: string };

								if (!profile) {
									throw new ChironError(
										"Customer with specified Stripe ID not found"
									);
								}

								// Fetch latest subscription data from Stripe
								const stripeSubscriptionsRes = await tryCatch(
									stripeClient.subscriptions.list({
										customer: profile.stripeCustomerId,
										status: "all",
										expand: ["data.default_payment_method"],
									})
								);

								if (stripeSubscriptionsRes.error) {
									throw new ChironError(
										"Failed to fetch Stripe subscription data"
									);
								}

								const stripeSubscriptions = stripeSubscriptionsRes.data.data;

								return stripeSubscriptions.map((stripeSubscription) =>
									transformToChironSubscription(stripeSubscription, customerId)
								);
							},
						}),
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
					cloneRequest: true,
				},

				async (ctx) => {
					// Verify signature
					const body = await new Response(ctx.request?.body).text();
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

					// Skip processing if the event isn't one we're tracking
					if (!ALLOWED_EVENTS.includes(event.type)) return;

					// Extract the customer ID from the event data
					const eventObject = event.data.object as any;
					const customerId = eventObject.customer;

					// This helps make it typesafe and also lets us know if our assumption is wrong
					if (typeof customerId !== "string") {
						throw new ChironError(
							`Stripe webhook event doesn't contain a customer ID. Event type: ${event.type}`
						);
					}

					// Sync the Stripe data to our KV
					await syncStripeData(ctx.context, customerId);

					return ctx.json({ message: "Hello World" });
				}
			),

			createCheckoutSession: createChironEndpoint(
				"/stripe/checkout-session",
				{
					method: "POST",
					requireHeaders: true,
					body: z.object({
						priceId: z.string().min(1),
						successRedirect: z.string(),
						cancelRedirect: z.string(),
						redirect: z.boolean().default(false).optional(),
					}),
					use: [authMiddleware],
				},

				async (ctx) => {
					const { priceId, successRedirect, cancelRedirect, redirect } =
						ctx.body;

					const customer = (await ctx.context.getAuthenticatedCustomer({
						headers: ctx.headers,
					})) as Customer & { stripeCustomerId?: string };

					let stripeCustomerId = customer.stripeCustomerId;
					if (!stripeCustomerId) {
						stripeCustomerId = await createStripeCustomer(
							ctx.context,
							customer
						);
					}
					const successRedirectUrl = successRedirect.startsWith("http")
						? successRedirect
						: `${ctx.context.baseURL}${successRedirect}`;
					const cancelRedirectUrl = cancelRedirect.startsWith("http")
						? cancelRedirect
						: `${ctx.context.baseURL}${cancelRedirect}`;

					const session = await stripeClient.checkout.sessions.create({
						mode: "subscription",
						customer: stripeCustomerId,
						line_items: [
							{
								price: priceId,
								quantity: 1,
							},
						],
						success_url: successRedirectUrl,
						cancel_url: cancelRedirectUrl,
					});

					if (redirect) {
						if (!session.url) {
							throw new Error("Stripe checkout session URL is missing");
						}

						throw ctx.redirect(session.url);
					}

					return ctx.json({ url: session.url });
				}
			),
		},
		schema: getSchema(options),
	} satisfies ChironPlugin;
};
