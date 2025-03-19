import type { LiteralString, Subscription } from "../types";

export const createPaymentProvider = (
	options: CreatePaymentProviderOptions
) => {
	return {
		id: options.id,
		subscriptionProviderIdentifierExtractor:
			options.subscriptionProviderIdentifierExtractor ??
			((s) => s.providerSubscriptionId),
		createCustomer: options.createCustomer,
		extractSubscriptionAccessLevel: options.extractSubscriptionAccessLevel,
		getSubscriptions: options.getSubscriptions,
		mapFromProviderSubscription: options.mapFromProviderSubscription,
	} satisfies ChironPaymentProvider;
};

type GetSubscriptionsOptions = {
	customerId: string;
};

type CreatePaymentProviderOptions = {
	id: LiteralString;
	subscriptionProviderIdentifierExtractor?: <T extends Subscription>(
		subscription: T
	) => string;
	createCustomer?: () => void;
	extractSubscriptionAccessLevel?: (
		subscription: Subscription
	) => string | null;
	getSubscriptions?: (
		options: GetSubscriptionsOptions
	) => Promise<Subscription[]>;
	mapFromProviderSubscription?: (subscription: any) => Subscription;
};

export interface ChironPaymentProvider {
	id: LiteralString;
	subscriptionProviderIdentifierExtractor?: <T extends Subscription>(
		subscription: T
	) => string;
	createCustomer?: () => void;
	extractSubscriptionAccessLevel?: (
		subscription: Subscription
	) => string | null;
	getSubscriptions?: (
		options: GetSubscriptionsOptions
	) => Promise<Subscription[]>;
	mapFromProviderSubscription?: (subscription: any) => Subscription;
}
