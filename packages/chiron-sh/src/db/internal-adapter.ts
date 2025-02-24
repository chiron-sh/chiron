import { getWithHooks } from "./with-hooks";
import type {
	Subscription,
	Adapter,
	ChironContext,
	ChironOptions,
	Customer,
} from "../types";

export const createInternalAdapter = (
	adapter: Adapter,
	ctx: {
		options: ChironOptions;
		hooks: Exclude<ChironOptions["databaseHooks"], undefined>[];
		generateId: ChironContext["generateId"];
	}
) => {
	const options = ctx.options;
	const secondaryStorage = options.secondaryStorage;

	const { createWithHooks, updateWithHooks, updateManyWithHooks } =
		getWithHooks(adapter, ctx);

	return {
		createCustomer: async <T,>(
			customer: Omit<Customer, "id" | "createdAt" | "updatedAt"> &
				Partial<Customer> &
				Record<string, any>
		) => {
			const createdCustomer = await createWithHooks(
				{
					createdAt: new Date(),
					updatedAt: new Date(),
					...customer,
					email: customer.email.toLowerCase(),
				},
				"customer"
			);
			return createdCustomer as T & Customer;
		},

		createSubscription: async <T,>(
			subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt"> &
				Partial<Subscription> &
				Record<string, any>
		) => {
			const createdSubscription = await createWithHooks(
				subscription,
				"subscription"
			);
			return createdSubscription as T & Subscription;
		},

		listSubscriptions: async (customerId: string) => {
			const subscriptions = await adapter.findMany<Subscription>({
				model: "subscription",
				where: [
					{
						field: "customerId",
						value: customerId,
					},
				],
			});
			return subscriptions;
		},

		findSubscriptionById: async (id: string) => {
			const subscription = await adapter.findOne<Subscription>({
				model: "subscription",
				where: [
					{
						field: "id",
						value: id,
					},
				],
			});
			return subscription;
		},

		findSubscriptionByExternalId: async (externalId: string) => {
			const subscription = await adapter.findOne<Subscription>({
				model: "subscription",
				where: [
					{
						field: "externalId",
						value: externalId,
					},
				],
			});
			return subscription;
		},
	};
};

export type InternalAdapter = ReturnType<typeof createInternalAdapter>;
