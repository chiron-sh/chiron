import type { Subscription, SubscriptionStatus } from "chiron-sh";
import type Stripe from "stripe";
import { ChironError } from "../../../../packages/chiron-sh/src/error";

export const transformToChironSubscription = (
	subscription: Stripe.Subscription,
	customerId: string
): Subscription => {
	const now = new Date();

	const providerProductId = subscription.items.data[0].price.product as string;
	const providerBasePlanId = subscription.items.data[0].price.id;

	if (!providerProductId || !providerBasePlanId) {
		throw new ChironError("Missing product_id or price_id");
	}

	return {
		id: subscription.id,
		customerId: customerId,
		status: transformSubscriptionStatus(subscription.status),
		provider: "stripe",
		providerProductId,
		providerBasePlanId,
		providerSubscriptionId: subscription.id,
		startsAt: new Date(subscription.start_date * 1000),
		purchasedAt: new Date(subscription.created * 1000),
		expiresAt: subscription.cancel_at
			? new Date(subscription.cancel_at * 1000)
			: null,
		billingIssueDetectedAt: null,
		createdAt: now,
		updatedAt: now,
	};
};

const transformSubscriptionStatus = (
	status: Stripe.Subscription.Status
): SubscriptionStatus => {
	switch (status) {
		case "trialing":
			return "trialing";
		case "active":
			return "active";
		case "canceled":
		case "incomplete":
		case "incomplete_expired":
		case "past_due":
		case "unpaid":
		case "paused":
			return "canceled";
		default:
			return "canceled";
	}
};
