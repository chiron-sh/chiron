import { afterAll, describe } from "vitest";
import * as schema from "./schema";
import { runAdapterTest } from "../../test";
import { drizzleAdapter } from "..";
import { getMigrations } from "../../../db/get-migration";
import { drizzle } from "drizzle-orm/node-postgres";
import type { ChironOptions } from "../../../types";
import { Pool } from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";

const TEST_DB_URL = "postgres://user:password@localhost:5432/chiron_sh";

const createTestPool = () => new Pool({ connectionString: TEST_DB_URL });

const createKyselyInstance = (pool: Pool) =>
	new Kysely({
		dialect: new PostgresDialect({ pool }),
	});

const cleanupDatabase = async (postgres: Kysely<any>) => {
	await sql`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`.execute(
		postgres
	);
	await postgres.destroy();
};

const createTestOptions = (pg: Pool): ChironOptions => ({
	database: pg,
	authenticate: async () => {
		return {
			id: "1",
			email: "test-email@email.com",
			name: "Test Name",
		};
	},
	customer: {
		fields: { email: "email" },
		additionalFields: {
			test: {
				type: "string",
				defaultValue: "test",
			},
		},
	},
});

describe("Drizzle Adapter Tests", async () => {
	let pg: Pool;
	let postgres: Kysely<any>;
	let opts: ChironOptions;

	pg = createTestPool();
	postgres = createKyselyInstance(pg);
	opts = createTestOptions(pg);
	const { runMigrations } = await getMigrations(opts);
	await runMigrations();

	afterAll(async () => {
		await cleanupDatabase(postgres);
	});

	const db = drizzle(pg);
	const adapter = drizzleAdapter(db, { provider: "pg", schema });

	await runAdapterTest({
		getAdapter: async (
			customOptions = {
				authenticate: async () => null,
			}
		) => {
			return adapter({ ...opts, ...customOptions });
		},
	});
});
