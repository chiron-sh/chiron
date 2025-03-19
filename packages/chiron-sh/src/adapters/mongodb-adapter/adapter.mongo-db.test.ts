// TODO: Fix with real db models

import { describe, beforeAll, it, expect } from "vitest";

import { MongoClient } from "mongodb";
import { runAdapterTest } from "../test";
import { mongodbAdapter } from ".";
import { getTestInstance } from "../../test-utils/test-instance";

describe("adapter test", async () => {
	const dbClient = async (connectionString: string, dbName: string) => {
		const client = new MongoClient(connectionString);
		await client.connect();
		const db = client.db(dbName);
		return db;
	};

	const user = "user";
	const db = await dbClient("mongodb://127.0.0.1:27017", "better-auth");
	async function clearDb() {
		await db.collection(user).deleteMany({});
		await db.collection("session").deleteMany({});
	}

	beforeAll(async () => {
		await clearDb();
	});

	const adapter = mongodbAdapter(db);
	await runAdapterTest({
		getAdapter: async (
			customOptions = {
				authenticate: async () => {
					return {
						id: "1",
						email: "test-email@email.com",
						name: "Test Name",
					};
				},
			}
		) => {
			return adapter({
				customer: {
					fields: {
						email: "email_address",
					},
					additionalFields: {
						test: {
							type: "string",
							defaultValue: "test",
						},
					},
				},
				...customOptions,
			});
		},
		skipGenerateIdTest: true,
	});
});

describe("simple-flow", async () => {
	const { client } = await getTestInstance(
		{},
		{
			testWith: "mongodb",
		}
	);
	it("should get session", async () => {
		const headers = new Headers();
		const { data: customer } = await client.getCustomer({
			fetchOptions: { headers },
		});

		expect(customer).toBeDefined();
	});
});
