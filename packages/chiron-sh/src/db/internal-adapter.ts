import { getWithHooks } from "./with-hooks";
import type {
	Subscription,
	Adapter,
	ChironContext,
	ChironOptions,
	Customer,
	CustomerExternalId,
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
			console.log(customer);
			const createdCustomer = await createWithHooks(
				{
					createdAt: new Date(),
					updatedAt: new Date(),
					...customer,
					email: customer.email?.toLowerCase(),
				},
				"customer"
			);
			return createdCustomer as T & Customer;
		},

		findCustomerById: async (id: string) => {
			const customer = await adapter.findOne<Customer>({
				model: "customer",
				where: [{ field: "id", value: id }],
			});
			return customer;
		},

		findCustomerByCustomUserId: async (customUserId: string) => {
			const customer = await adapter.findOne<Customer>({
				model: "customer",
				where: [{ field: "customUserId", value: customUserId }],
			});
			return customer;
		},

		createCustomerExternalId: async (
			customerExternalId: Omit<
				CustomerExternalId,
				"id" | "createdAt" | "updatedAt"
			> &
				Partial<CustomerExternalId> &
				Record<string, any>
		) => {
			await createWithHooks(
				{
					...customerExternalId,
				},
				"customer_external_id"
			);
		},

		findCustomerExternalId: async (service: string, customerId: string) => {
			const externalId = await adapter.findOne<CustomerExternalId>({
				model: "customer_external_id",
				where: [
					{ field: "service", value: service },
					{ field: "customerId", value: customerId },
				],
			});
			return externalId;
		},

		findCustomerIdByCustomerExternalId: async (
			service: string,
			customerExternalId: string
		) => {
			const externalId = await adapter.findOne<CustomerExternalId>({
				model: "customer_external_id",
				where: [
					{ field: "service", value: service },
					{ field: "externalId", value: customerExternalId },
				],
			});
			return externalId?.customerId;
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

		updateSubscription: async <T,>(
			subscriptionId: string,
			data: Partial<Subscription> & Record<string, any>
		) => {
			const subscription = await updateWithHooks<Subscription>(
				data,
				[
					{
						field: "id",
						value: subscriptionId,
					},
				],
				"subscription"
			);
			return subscription;
		},
	};
};

export type InternalAdapter = ReturnType<typeof createInternalAdapter>;
