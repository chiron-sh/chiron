import type { ChironContext, Customer } from "chiron-sh";
import {
	type ChironPaymentProvider,
	type ChironPlugin,
	createChironEndpoint,
	diffSubscriptions,
} from "chiron-sh/plugins";
import { Stripe } from "stripe";
import { z } from "zod";
import { ChironError } from "../../../packages/chiron-sh/src/error";
import { tryCatch } from "./utils/try-catch";
import { authMiddleware } from "../../../packages/chiron-sh/src/api/routes/profile";
import { transformToChironSubscription } from "./utils/transform";

interface StripeOptions {
	stripePublishableKey: string;
	stripeSecretKey: string;
	stripeWebhookSecret: string;
	stripe?: Stripe;
}

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

	const syncStripeData = async (
		ctx: ChironContext,
		stripeCustomerId: string
	) => {
		const chironCustomerId =
			await ctx.internalAdapter.findCustomerIdByCustomerExternalId(
				"stripe",
				stripeCustomerId
			);

		if (!chironCustomerId) {
			throw new ChironError("Customer with specified Stripe ID not found");
		}
		// Fetch latest subscription data from Stripe
		const stripeSubscriptionsRes = await tryCatch(
			stripeClient.subscriptions.list({
				customer: stripeCustomerId,
				limit: 1,
				status: "all",
				expand: ["data.default_payment_method"],
			})
		);

		if (stripeSubscriptionsRes.error) {
			throw new ChironError("Failed to fetch Stripe subscription data");
		}

		const stripeSubscriptions = stripeSubscriptionsRes.data.data;

		const subscriptions =
			await ctx.internalAdapter.listSubscriptions(chironCustomerId);

		// Find changes
		const changedSubscriptions = [];
		const newSubscriptions = [];
		for (const stripeSubscription of stripeSubscriptions) {
			const subscription = subscriptions.find(
				(s) =>
					s.provider === "stripe" &&
					s.providerSubscriptionId === stripeSubscription.id
			);

			if (!subscription) {
				newSubscriptions.push(
					transformToChironSubscription(stripeSubscription, chironCustomerId)
				);
				continue;
			}

			const changedSubscription = transformToChironSubscription(
				stripeSubscription,
				chironCustomerId
			);

			// Sync the id and timestamps to prevent incorrect diffs
			changedSubscription.id = subscription.id;
			changedSubscription.createdAt = subscription.createdAt;
			changedSubscription.updatedAt = subscription.updatedAt;

			const diff = diffSubscriptions(subscription, changedSubscription);
			if (diff.length > 0) {
				changedSubscriptions.push(changedSubscription);
			}
		}

		// Store new subscriptions
		for (const subscription of newSubscriptions) {
			await ctx.internalAdapter.createSubscription({
				...subscription,
			});
		}

		// Update existing subscriptions
		for (const subscription of changedSubscriptions) {
			await ctx.internalAdapter.updateSubscription(
				subscription.id,
				subscription
			);
		}
	};

	const processStripeEvent = async (
		ctx: ChironContext,
		event: Stripe.Event
	) => {
		ctx.logger.info("Processing Stripe event", {
			eventType: event.type,
		});

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
		return await syncStripeData(ctx, customerId);
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

					processStripeEvent(ctx.context, event);

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
