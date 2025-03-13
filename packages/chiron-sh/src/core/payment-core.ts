import type { InternalAdapter } from "../db/internal-adapter";
import { ChironError } from "../error";
import type { ChironPaymentProvider } from "../payment-providers/types";
import type { Subscription } from "../types";
import { diffSubscriptions } from "../utils";

type CreatePaymentCoreOptions = {
	internalAdapter: InternalAdapter;
	paymentProviders: ChironPaymentProvider[];
};

export const createPaymentCore = (options: CreatePaymentCoreOptions) => {
	const { internalAdapter } = options;

	const getCustomerAccessLevels = async ({
		customerId,
	}: {
		customerId: string;
	}) => {
		const subscriptions = await internalAdapter.listSubscriptions(customerId);
		const activeOrTrialingSubscriptions = subscriptions.filter(
			(s) => s.status === "active" || s.status === "trialing"
		);

		const accessLevels = new Map<string, Subscription[]>();

		for (const subscription of activeOrTrialingSubscriptions) {
			const provider = options.paymentProviders.find(
				(p) => p.id === subscription.provider
			);
			if (!provider) {
				continue;
			}

			const accessLevel =
				provider.extractSubscriptionAccessLevel?.(subscription);
			if (!accessLevel) continue;

			if (!accessLevels.has(accessLevel)) {
				accessLevels.set(accessLevel, [subscription]);
			} else {
				accessLevels.get(accessLevel)?.push(subscription);
			}
		}

		return Object.fromEntries(accessLevels);
	};

	/**
	 * Syncs subscriptions for a customer. It will load current subscription data from the payment provider and update the subscription in the database.
	 * @param syncOptions Options for the sync.
	 * @returns
	 */
	const syncCustomerSubscriptions = async (syncOptions: {
		customerId: string;
		provider: string;
	}) => {
		const { customerId, provider } = syncOptions;
		const changedSubscriptions = [];
		const newSubscriptions = [];

		const existingSubscriptionsAll =
			await internalAdapter.listSubscriptions(customerId);

		// Only sync subscriptions for the given provider
		const existingSubscriptions = existingSubscriptionsAll.filter(
			(s) => s.provider === provider
		);

		const paymentProvider = options.paymentProviders.find(
			(p) => p.id === provider
		);

		if (!paymentProvider) {
			throw new ChironError(`Payment provider ${provider} not found`);
		}

		// Payment provider does not have a way to get subscriptions. The sync should be handled by the payment provider.
		if (!paymentProvider.getSubscriptions) {
			return;
		}

		const subscriptionsToSync = await paymentProvider.getSubscriptions({
			customerId,
		});

		for (const subscriptionToSync of subscriptionsToSync) {
			// TODO: Fix this and make it universal
			// We find the existing subscription by the providerSubscriptionId because the
			const existingSubscription = existingSubscriptions.find(
				(s) =>
					s.providerSubscriptionId === subscriptionToSync.providerSubscriptionId
			);

			if (!existingSubscription) {
				newSubscriptions.push(subscriptionToSync);
				continue;
			}

			// TODO: Each provider should be able to define their own ignored fields.
			const diff = diffSubscriptions(existingSubscription, subscriptionToSync, [
				"id",
				"createdAt",
				"updatedAt",
			]);

			if (diff.length > 0) {
				changedSubscriptions.push({
					...subscriptionToSync,
					id: existingSubscription.id,
				});
			}
		}

		// Store new subscriptions
		for (const subscription of newSubscriptions) {
			await internalAdapter.createSubscription({
				...subscription,
			});
		}

		// Update existing subscriptions
		for (const subscription of changedSubscriptions) {
			await internalAdapter.updateSubscription(subscription.id, subscription);
		}
	};

	return {
		syncCustomerSubscriptions,
		getCustomerAccessLevels,
	};
};
