import { beforeAll, describe, vi, afterEach } from "vitest";
import type { ChironOptions, ChironPlugin } from "../types";
import Database from "better-sqlite3";
import { init } from "../init";
import { getMigrations } from "./get-migration";
import { SqliteDialect } from "kysely";

describe("adapter test", async () => {
	const sqliteDialect = new SqliteDialect({
		database: new Database(":memory:"),
	});
	const map = new Map();
	let id = 1;

	const opts = {
		authenticate: async () => null,
		database: {
			dialect: sqliteDialect,
			type: "sqlite",
		},
		secondaryStorage: {
			set(key, value, ttl) {
				map.set(key, value);
			},
			get(key) {
				return map.get(key);
			},
			delete(key) {
				map.delete(key);
			},
		},
		advanced: {
			generateId() {
				return (id++).toString();
			},
		},
		databaseHooks: {},
		plugins: [
			{
				id: "test-plugin",
				init(ctx) {
					return {
						options: {
							databaseHooks: {},
						},
					};
				},
			} satisfies ChironPlugin,
		],
	} satisfies ChironOptions;
	beforeAll(async () => {
		(await getMigrations(opts)).runMigrations();
	});
	afterEach(async () => {
		vi.clearAllMocks();
	});
	const ctx = await init(opts);
	const internalAdapter = ctx.internalAdapter;
});
