import { beforeAll, describe } from "vitest";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "..";
import { runAdapterTest } from "../../test";

const db = new PrismaClient();
describe("adapter test", async () => {
	beforeAll(async () => {
		await clearDb();
	});
	const adapter = prismaAdapter(db, {
		provider: "sqlite",
	});

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
	});
});

async function clearDb() {
	await db.subscription.deleteMany();
	await db.customer.deleteMany();
}
