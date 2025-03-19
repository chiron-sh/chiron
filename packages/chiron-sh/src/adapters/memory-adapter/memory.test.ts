// TODO: Fix with real db models
import { describe } from "vitest";
import { memoryAdapter } from "./memory-adapter";
import { runAdapterTest } from "../test";

describe("adapter test", async () => {
	const db = {
		customer: [],
		subscription: [],
	};
	const adapter = memoryAdapter(db);
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
				},
				...customOptions,
			});
		},
	});
});
