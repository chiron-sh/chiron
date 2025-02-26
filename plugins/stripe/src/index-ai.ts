import type { ChironContext, Customer } from "chiron-sh";
import {
	type ChironPaymentProvider,
	type ChironPlugin,
	createChironEndpoint,
} from "chiron-sh/plugins";
import { Stripe } from "stripe";
import { z } from "zod";
import { ChironError } from "../../../packages/chiron-sh/src/error";
import { tryCatch } from "./utils/try-catch";
import { authMiddleware } from "../../../packages/chiron-sh/src/api/routes/profile";

interface StripeOptions {
	stripePublishableKey: string;
	stripeSecretKey: string;
	stripeWebhookSecret: string;
	stripe?: Stripe;
}

// Define Stripe subscription cache type
type STRIPE_SUB_CACHE =
	| {
			subscriptionId: string | null;
			status: Stripe.Subscription.Status;
			priceId: string | null;
			currentPeriodStart: number | null;
			currentPeriodEnd: number | null;
			cancelAtPeriodEnd: boolean;
			paymentMethod: {
				brand: string | null;
				last4: string | null;
			} | null;
	  }
	| {
			status: "none";
	  };

// List of Stripe events we want to process
const ALLOWED_EVENTS: Stripe.Event.Type[] = [
	"checkout.session.completed",
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
	"customer.subscription.paused",
	"customer.subscription.resumed",
	"customer.subscription.pending_update_applied",
	"customer.subscription.pending_update_expired",
	"customer.subscription.trial_will_end",
	"invoice.paid",
	"invoice.payment_failed",
	"invoice.payment_action_required",
	"invoice.upcoming",
	"invoice.marked_uncollectible",
	"invoice.payment_succeeded",
	"payment_intent.succeeded",
	"payment_intent.payment_failed",
	"payment_intent.canceled",
];

export const stripe = (options: StripeOptions) => {
	const stripeClient = options.stripe ?? new Stripe(options.stripeSecretKey);

	const getOrCreateStripeCustomerId = async (
		ctx: ChironContext,
		customer: Customer
	) => {
		const externalId = await ctx.internalAdapter.findCustomerExternalId(
			"stripe",
			customer.id
		);

		if (externalId) {
			return externalId.externalId;
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

		await ctx.internalAdapter.createCustomerExternalId({
			service: "stripe",
			customerId: customer.id,
			externalId: stripeCustomer.id,
		});

		return stripeCustomer.id;
	};

	// Function to sync Stripe data to KV store
	const syncStripeDataToKV = async (
		ctx: ChironContext,
		stripeCustomerId: string
	) => {
		// Fetch latest subscription data from Stripe
		const subscriptionsResult = await tryCatch(
			stripeClient.subscriptions.list({
				customer: stripeCustomerId,
				limit: 1,
				status: "all",
				expand: ["data.default_payment_method"],
			})
		);

		if (subscriptionsResult.error) {
			throw new ChironError("Failed to fetch Stripe subscription data");
		}

		const subscriptions = subscriptionsResult.data;

		if (subscriptions.data.length === 0) {
			const subData = { status: "none" } as STRIPE_SUB_CACHE;

			// Store in our KV system
			await ctx.internalAdapter.createCustomerExternalId({
				service: "stripe:subscription",
				customerId: stripeCustomerId,
				externalId: JSON.stringify(subData),
			});

			return subData;
		}

		// Get the primary subscription
		const subscription = subscriptions.data[0];

		// Extract price ID from subscription items
		const priceId =
			subscription.items.data.length > 0
				? subscription.items.data[0].price.id
				: null;

		// Store complete subscription state
		const subData: STRIPE_SUB_CACHE = {
			subscriptionId: subscription.id,
			status: subscription.status,
			priceId,
			currentPeriodEnd: subscription.current_period_end,
			currentPeriodStart: subscription.current_period_start,
			cancelAtPeriodEnd: subscription.cancel_at_period_end,
			paymentMethod:
				subscription.default_payment_method &&
				typeof subscription.default_payment_method !== "string"
					? {
							brand: subscription.default_payment_method.card?.brand ?? null,
							last4: subscription.default_payment_method.card?.last4 ?? null,
						}
					: null,
		};

		// Store the data using our adapter
		await ctx.internalAdapter.createCustomerExternalId({
			service: "stripe:subscription",
			customerId: stripeCustomerId,
			externalId: JSON.stringify(subData),
		});

		return subData;
	};

	// Function to process Stripe webhook events
	const processStripeEvent = async (
		ctx: ChironContext,
		event: Stripe.Event
	) => {
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
		return await syncStripeDataToKV(ctx, customerId);
	};

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
							{ error: "Missing or invalid signature" },
							{
								status: 400,
							}
						);
					}

					try {
						// Construct the event from the raw body and signature
						const event = stripeClient.webhooks.constructEvent(
							body as any,
							signature,
							options.stripeWebhookSecret
						);

						// Process the event asynchronously so we can return a 200 response quickly
						// This helps prevent webhook timeouts
						setTimeout(() => {
							processStripeEvent(ctx.context, event).catch((error) => {
								console.error(
									"[STRIPE WEBHOOK] Error processing event:",
									error
								);
							});
						}, 0);

						// Return a success response immediately
						return ctx.json({ received: true });
					} catch (error) {
						console.error(
							"[STRIPE WEBHOOK] Error verifying webhook signature:",
							error
						);
						return ctx.json(
							{ error: "Invalid signature" },
							{
								status: 400,
							}
						);
					}
				}
			),

			// Endpoint for "success" page to sync Stripe data after checkout
			syncStripeData: createChironEndpoint(
				"/stripe/sync",
				{
					method: "POST",
					requireHeaders: true,
					use: [authMiddleware],
				},

				async (ctx) => {
					const customer = await ctx.context.getAuthenticatedCustomer({
						headers: ctx.headers,
					});

					// Get the Stripe customer ID for this user
					const externalId =
						await ctx.context.internalAdapter.findCustomerExternalId(
							"stripe",
							customer.id
						);

					if (!externalId) {
						return ctx.json(
							{ error: "No Stripe customer found" },
							{
								status: 404,
							}
						);
					}

					// Sync the data
					await syncStripeDataToKV(ctx.context, externalId.externalId);

					return ctx.json({ success: true });
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

					const customer = await ctx.context.getAuthenticatedCustomer({
						headers: ctx.headers,
					});

					const stripeCustomerId = await getOrCreateStripeCustomerId(
						ctx.context,
						customer
					);

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
						console.log("Redirecting");
						throw ctx.redirect(session.url);
					}

					return ctx.json({ url: session.url });
				}
			),
		},
	} satisfies ChironPlugin;
};
