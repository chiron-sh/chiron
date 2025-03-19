// TODO: Fix with real db models
import fs from "fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runAdapterTest } from "../../test";
import { getMigrations } from "../../../db/get-migration";
import path from "path";
import Database from "better-sqlite3";
import { kyselyAdapter } from "..";
import { Kysely, MysqlDialect, sql, SqliteDialect } from "kysely";
import type { ChironOptions } from "../../../types";
import { createPool } from "mysql2/promise";

import * as tedious from "tedious";
import * as tarn from "tarn";
import { MssqlDialect } from "kysely";
import { getTestInstance } from "../../../test-utils/test-instance";

describe("adapter test", async () => {
	const sqlite = new Database(path.join(__dirname, "test.db"));
	const mysql = createPool("mysql://user:password@localhost:3306/chiron_sh");
	const sqliteKy = new Kysely({
		dialect: new SqliteDialect({
			database: sqlite,
		}),
	});
	const mysqlKy = new Kysely({
		dialect: new MysqlDialect(mysql),
	});
	const opts = (database: ChironOptions["database"]) =>
		({
			database: database,
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
		}) satisfies ChironOptions;
	const mysqlOptions = opts({
		db: mysqlKy,
		type: "mysql",
	});
	const sqliteOptions = opts({
		db: sqliteKy,
		type: "sqlite",
	});
	beforeAll(async () => {
		const { runMigrations } = await getMigrations(mysqlOptions);
		await runMigrations();
		const { runMigrations: runMigrationsSqlite } =
			await getMigrations(sqliteOptions);
		await runMigrationsSqlite();
	});

	afterAll(async () => {
		await mysql.query("DROP DATABASE IF EXISTS chiron_sh");
		await mysql.query("CREATE DATABASE chiron_sh");
		await mysql.end();
		await fs.unlink(path.join(__dirname, "test.db"));
	});

	const mysqlAdapter = kyselyAdapter(mysqlKy, {
		type: "mysql",
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
			return mysqlAdapter({ ...mysqlOptions, ...customOptions });
		},
	});

	const sqliteAdapter = kyselyAdapter(sqliteKy, {
		type: "sqlite",
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
			return sqliteAdapter({ ...sqliteOptions, ...customOptions });
		},
	});
});

// describe("mssql", async () => {
// 	const dialect = new MssqlDialect({
// 		tarn: {
// 			...tarn,
// 			options: {
// 				min: 0,
// 				max: 10,
// 			},
// 		},
// 		tedious: {
// 			...tedious,
// 			connectionFactory: () =>
// 				new tedious.Connection({
// 					authentication: {
// 						options: {
// 							password: "Password123!",
// 							userName: "sa",
// 						},
// 						type: "default",
// 					},
// 					options: {
// 						port: 1433,
// 						trustServerCertificate: true,
// 					},
// 					server: "localhost",
// 				}),
// 		},
// 	});
// 	const opts = {
// 		database: dialect,
// 		authenticate: async () => {
// 			return {
// 				id: "1",
// 				email: "test-email@email.com",
// 				name: "Test Name",
// 			};
// 		},
// 		customer: {
// 			modelName: "customer",
// 		},
// 	} satisfies ChironOptions;
// 	beforeAll(async () => {
// 		const { runMigrations, toBeAdded, toBeCreated } = await getMigrations(opts);
// 		console.log({ toBeAdded, toBeCreated });
// 		await runMigrations();
// 	});
// 	const mssql = new Kysely({
// 		dialect: dialect,
// 	});
// 	const getAdapter = kyselyAdapter(mssql, {
// 		type: "mssql",
// 	});

// 	const adapter = getAdapter(opts);

// 	async function resetDB() {
// 		await sql`DROP TABLE dbo.session;`.execute(mssql);
// 		await sql`DROP TABLE dbo.verification;`.execute(mssql);
// 		await sql`DROP TABLE dbo.account;`.execute(mssql);
// 		await sql`DROP TABLE dbo.users;`.execute(mssql);
// 	}

// 	afterAll(async () => {
// 		await resetDB();
// 	});

// 	await runAdapterTest({
// 		getAdapter: async (
// 			customOptions = {
// 				authenticate: async () => {
// 					return {
// 						id: "1",
// 						email: "test-email@email.com",
// 						name: "Test Name",
// 					};
// 				},
// 			}
// 		) => {
// 			return adapter;
// 		},
// 		skipGenerateIdTest: true,
// 	});

// describe("simple flow", async () => {
// 	const { chiron } = await getTestInstance(
// 		{
// 			database: dialect,
// 			custom  er: {
// 				modelName: "users",
// 			},
// 		},
// 		{
// 			disableTestUser: true,
// 		}
// 	);
// 	it("should sign-up", async () => {
// 		const res = await auth.api.signUpEmail({
// 			body: {
// 				name: "test",
// 				password: "password",
// 				email: "test-2@email.com",
// 			},
// 		});
// 		expect(res.user.name).toBe("test");
// 		expect(res.token?.length).toBeTruthy();
// 	});
// });
// });
