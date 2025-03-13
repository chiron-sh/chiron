import { expect, test } from "vitest";
import type { Adapter, ChironOptions, Customer, Subscription } from "../types";

interface AdapterTestOptions {
	getAdapter: (
		customOptions?: Omit<ChironOptions, "database">
	) => Promise<Adapter>;
	skipGenerateIdTest?: boolean;
}

export async function runAdapterTest(opts: AdapterTestOptions) {
	const adapter = await opts.getAdapter();
	const customer = {
		id: "1",
		name: "user",
		email: "user@email.com",
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	test("create model", async () => {
		const res = await adapter.create({
			model: "customer",
			data: customer,
		});
		expect({
			name: res.name,
			email: res.email,
		}).toEqual({
			name: customer.name,
			email: customer.email,
		});
		customer.id = res.id;
	});

	test("find model", async () => {
		const res = await adapter.findOne<Customer>({
			model: "customer",
			where: [
				{
					field: "id",
					value: customer.id,
				},
			],
		});
		expect({
			name: res?.name,
			email: res?.email,
		}).toEqual({
			name: customer.name,
			email: customer.email,
		});
	});

	test("find model without id", async () => {
		const res = await adapter.findOne<Customer>({
			model: "customer",
			where: [
				{
					field: "email",
					value: customer.email,
				},
			],
		});
		expect({
			name: res?.name,
			email: res?.email,
		}).toEqual({
			name: customer.name,
			email: customer.email,
		});
	});

	test("find model with select", async () => {
		const res = await adapter.findOne({
			model: "customer",
			where: [
				{
					field: "id",
					value: customer.id,
				},
			],
			select: ["email"],
		});
		expect(res).toEqual({ email: customer.email });
	});

	test("update model", async () => {
		const newEmail = "updated@email.com";

		const res = await adapter.update<Customer>({
			model: "customer",
			where: [
				{
					field: "id",
					value: customer.id,
				},
			],
			update: {
				email: newEmail,
			},
		});
		expect(res).toMatchObject({
			email: newEmail,
			name: customer.name,
		});
	});

	test("should find many", async () => {
		const res = await adapter.findMany({
			model: "customer",
		});
		expect(res.length).toBe(1);
	});

	test("should find many with where", async () => {
		const customer = await adapter.create<Customer>({
			model: "customer",
			data: {
				id: "2",
				customUserId: "2",
				name: "user2",
				email: "test@email.com",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});
		const res = await adapter.findMany({
			model: "customer",
			where: [
				{
					field: "id",
					value: customer.id,
				},
			],
		});
		expect(res.length).toBe(1);
	});

	test("should find many with operators", async () => {
		const newCustomer = await adapter.create<Customer>({
			model: "customer",
			data: {
				id: "3",
				customUserId: "3",
				name: "user",
				email: "test-email2@email.com",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});
		const res = await adapter.findMany({
			model: "customer",
			where: [
				{
					field: "id",
					operator: "in",
					value: [customer.id, newCustomer.id],
				},
			],
		});
		expect(res.length).toBe(2);
	});

	test("should work with reference fields", async () => {
		const customer = await adapter.create<{ id: string } & Record<string, any>>(
			{
				model: "customer",
				data: {
					id: "4",
					customUserId: "4",
					name: "user",
					email: "my-email@email.com",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			}
		);
		await adapter.create<Subscription>({
			model: "subscription",
			data: {
				id: "1",
				createdAt: new Date(),
				updatedAt: new Date(),
				status: "active",
				customerId: customer.id,
				provider: "stripe",
				providerProductId: "123",
				providerBasePlanId: "base_123",
				providerSubscriptionId: "sub_123",
				startsAt: new Date(),
				purchasedAt: new Date(),
			},
		});
		const res = await adapter.findOne({
			model: "subscription",
			where: [
				{
					field: "customerId",
					value: customer.id,
				},
			],
		});
		expect(res).toMatchObject({
			customerId: customer.id,
		});
	});

	test("should find many with sortBy", async () => {
		await adapter.create({
			model: "customer",
			data: {
				id: "5",
				customUserId: "5",
				name: "a",
				email: "a@email.com",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});
		const res = await adapter.findMany<Customer>({
			model: "customer",
			sortBy: {
				field: "name",
				direction: "asc",
			},
		});
		expect(res[0].name).toBe("a");

		const res2 = await adapter.findMany<Customer>({
			model: "customer",
			sortBy: {
				field: "name",
				direction: "desc",
			},
		});

		expect(res2[res2.length - 1].name).toBe("a");
	});

	test("should find many with limit", async () => {
		const res = await adapter.findMany({
			model: "user",
			limit: 1,
		});
		expect(res.length).toBe(1);
	});

	test("should find many with offset", async () => {
		const res = await adapter.findMany({
			model: "user",
			offset: 2,
		});
		expect(res.length).toBe(3);
	});

	test("should update with multiple where", async () => {
		await adapter.updateMany({
			model: "customer",
			where: [
				{
					field: "name",
					value: customer.name,
				},
				{
					field: "email",
					value: customer.email,
				},
			],
			update: {
				email: "updated@email.com",
			},
		});
		const updatedUser = await adapter.findOne<Customer>({
			model: "customer",
			where: [
				{
					field: "email",
					value: "updated@email.com",
				},
			],
		});
		expect(updatedUser).toMatchObject({
			name: customer.name,
			email: "updated@email.com",
		});
	});

	test("delete model", async () => {
		await adapter.delete({
			model: "customer",
			where: [
				{
					field: "id",
					value: customer.id,
				},
			],
		});
		const findRes = await adapter.findOne({
			model: "customer",
			where: [
				{
					field: "id",
					value: customer.id,
				},
			],
		});
		expect(findRes).toBeNull();
	});

	test("should delete many", async () => {
		for (const id of ["to-be-delete1", "to-be-delete2", "to-be-delete3"]) {
			await adapter.create({
				model: "customer",
				data: {
					id,
					name: "to-be-deleted",
					email: `email@test-${id}.com`,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});
		}
		const findResFirst = await adapter.findMany({
			model: "customer",
			where: [
				{
					field: "name",
					value: "to-be-deleted",
				},
			],
		});
		expect(findResFirst.length).toBe(3);
		await adapter.deleteMany({
			model: "user",
			where: [
				{
					field: "name",
					value: "to-be-deleted",
				},
			],
		});
		const findRes = await adapter.findMany({
			model: "user",
			where: [
				{
					field: "name",
					value: "to-be-deleted",
				},
			],
		});
		expect(findRes.length).toBe(0);
	});

	test("shouldn't throw on delete record not found", async () => {
		await adapter.delete({
			model: "customer",
			where: [
				{
					field: "id",
					value: "5",
				},
			],
		});
	});

	test("shouldn't throw on record not found", async () => {
		const res = await adapter.findOne({
			model: "customer",
			where: [
				{
					field: "id",
					value: "5",
				},
			],
		});
		expect(res).toBeNull();
	});

	test("should find many with contains operator", async () => {
		const res = await adapter.findMany({
			model: "customer",
			where: [
				{
					field: "name",
					operator: "contains",
					value: "user2",
				},
			],
		});
		expect(res.length).toBe(1);
	});

	test("should search users with startsWith", async () => {
		const res = await adapter.findMany({
			model: "customer",
			where: [
				{
					field: "name",
					operator: "starts_with",
					value: "us",
				},
			],
		});
		expect(res.length).toBe(3);
	});

	test("should search users with endsWith", async () => {
		const res = await adapter.findMany({
			model: "customer",
			where: [
				{
					field: "name",
					operator: "ends_with",
					value: "er2",
				},
			],
		});
		expect(res.length).toBe(1);
	});

	test.skipIf(opts.skipGenerateIdTest)(
		"should prefer generateId if provided",
		async () => {
			const customAdapter = await opts.getAdapter({
				advanced: {
					generateId: () => "mocked-id",
				},
				authenticate: async () => null,
			});

			const res = await customAdapter.create({
				model: "customer",
				data: {
					id: "1",
					name: "user4",
					email: "user4@email.com",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			});

			expect(res.id).toBe("mocked-id");
		}
	);
}
