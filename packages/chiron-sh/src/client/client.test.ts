// @vitest-environment happy-dom

import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { createChironClient as createSolidClient } from "./solid";
import { createChironClient as createReactClient } from "./react";
import { createChironClient as createVueClient } from "./vue";
import { createChironClient as createSvelteClient } from "./svelte";
import { testClientPlugin, testClientPlugin2 } from "./test-plugin";
import type { Accessor } from "solid-js";
import type { Ref } from "vue";
import type { ReadableAtom } from "nanostores";

import { BetterFetchError } from "@better-fetch/fetch";

describe("run time proxy", async () => {
	it("proxy api should be called", async () => {
		let apiCalled = false;
		const client = createSolidClient({
			plugins: [testClientPlugin()],
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					apiCalled = true;
					return new Response();
				},
				baseURL: "http://localhost:3000",
			},
		});
		await client.test();
		expect(apiCalled).toBe(true);
	});

	it("state listener should be called on matched path", async () => {
		const client = createSolidClient({
			plugins: [testClientPlugin()],
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					return new Response();
				},
				baseURL: "http://localhost:3000",
			},
		});
		const res = client.useComputedAtom();
		expect(res()).toBe(0);
		await client.test();
		vi.useFakeTimers();
		setTimeout(() => {
			expect(res()).toBe(1);
		}, 100);
	});

	it("should call useCustomer", async () => {
		let returnNull = false;
		const client = createSolidClient({
			plugins: [testClientPlugin()],
			fetchOptions: {
				customFetchImpl: async () => {
					if (returnNull) {
						return new Response(JSON.stringify(null));
					}
					return new Response(
						JSON.stringify({
							user: {
								id: 1,
								email: "test@email.com",
							},
						})
					);
				},
				baseURL: "http://localhost:3000",
			},
		});
		const res = client.useCustomer();
		vi.useFakeTimers();
		await vi.advanceTimersByTimeAsync(1);
		expect(res()).toMatchObject({
			data: { user: { id: 1, email: "test@email.com" } },
			error: null,
			isPending: false,
		});
	});

	it("should allow second argument fetch options", async () => {
		let called = false;
		const client = createSolidClient({
			plugins: [testClientPlugin()],
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					return new Response();
				},
				baseURL: "http://localhost:3000",
			},
		});
		await client.test(
			{},
			{
				onSuccess(context) {
					called = true;
				},
			}
		);
		expect(called).toBe(true);
	});
});

describe("type", () => {
	it("should infer session additional fields", () => {
		const client = createReactClient({
			plugins: [testClientPlugin()],
			baseURL: "http://localhost:3000",
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					return new Response();
				},
			},
		});

		type ReturnedCustomer = ReturnType<typeof client.useCustomer>;
		expectTypeOf<ReturnedCustomer>().toMatchTypeOf<{
			data: {
				customer: {
					id: string;
					customUserId: string;
					createdAt: Date;
					updatedAt: Date;
					email?: string | null | undefined;
					name?: string | null | undefined;
				};
			} | null;
			error: BetterFetchError | null;
			isPending: boolean;
		}>();
	});
	it("should infer resolved hooks react", () => {
		const client = createReactClient({
			plugins: [testClientPlugin()],
			baseURL: "http://localhost:3000",
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					return new Response();
				},
			},
		});
		expectTypeOf(client.useComputedAtom).toEqualTypeOf<() => number>();
	});
	it("should infer resolved hooks solid", () => {
		const client = createSolidClient({
			plugins: [testClientPlugin()],
			baseURL: "http://localhost:3000",
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					return new Response();
				},
			},
		});
		expectTypeOf(client.useComputedAtom).toEqualTypeOf<
			() => Accessor<number>
		>();
	});
	it("should infer resolved hooks vue", () => {
		const client = createVueClient({
			plugins: [testClientPlugin()],
			baseURL: "http://localhost:3000",
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					return new Response();
				},
			},
		});
		expectTypeOf(client.useComputedAtom).toEqualTypeOf<
			() => Readonly<Ref<number>>
		>();
	});
	it("should infer resolved hooks svelte", () => {
		const client = createSvelteClient({
			plugins: [testClientPlugin()],
			baseURL: "http://localhost:3000",
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					return new Response();
				},
			},
		});
		expectTypeOf(client.useComputedAtom).toEqualTypeOf<
			() => ReadableAtom<number>
		>();
	});

	it("should infer actions", () => {
		const client = createSolidClient({
			plugins: [testClientPlugin(), testClientPlugin2()],
			baseURL: "http://localhost:3000",
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					return new Response();
				},
			},
		});
		expectTypeOf(client.setTestAtom).toEqualTypeOf<(value: boolean) => void>();
		expectTypeOf(client.test.signOut).toEqualTypeOf<() => Promise<void>>();
	});

	it("should infer customer", () => {
		const client = createSolidClient({
			plugins: [testClientPlugin(), testClientPlugin2()],
			baseURL: "http://localhost:3000",
			fetchOptions: {
				customFetchImpl: async (url, init) => {
					return new Response();
				},
			},
		});
		const $infer = client.$Infer;
		expectTypeOf($infer.Customer).toEqualTypeOf<{
			customer: {
				id: string;
				email?: string | null | undefined;
				name?: string | null | undefined;
				customUserId: string;
				createdAt: Date;
				updatedAt: Date;
			};
		}>();
	});

	it("should infer session react", () => {
		const client = createReactClient({
			plugins: [],
		});
		const $infer = client.$Infer.Customer;
		expectTypeOf($infer.customer).toEqualTypeOf<{
			id: string;
			customUserId: string;
			createdAt: Date;
			updatedAt: Date;
			email?: string | null;
			name?: string | null;
		}>();
	});

	it("should infer `throw:true` in fetch options", async () => {
		const client = createReactClient({
			plugins: [testClientPlugin()],
			baseURL: "http://localhost:3000",
			fetchOptions: {
				throw: true,
				customFetchImpl: async (url, init) => {
					return new Response();
				},
			},
		});
		const data = client.getCustomer();
		expectTypeOf(data).toMatchTypeOf<
			Promise<{
				customer: {
					id: string;
					customUserId: string;
					createdAt: Date;
					updatedAt: Date;
					email?: string | null;
					name?: string | null;
				};
			} | null>
		>();
	});
});
