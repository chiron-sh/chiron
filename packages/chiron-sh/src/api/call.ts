import { createEndpoint, createMiddleware } from "better-call";
import type { ChironContext } from "../init";

export const optionsMiddleware = createMiddleware(async () => {
	/**
	 * This will be passed on the instance of
	 * the context. Used to infer the type
	 * here.
	 */
	return {} as ChironContext;
});

export const createChironMiddleware = createMiddleware.create({
	use: [
		optionsMiddleware,
		/**
		 * Only use for post hooks
		 */
		createMiddleware(async () => {
			return {} as {
				returned?: unknown;
				responseHeaders?: Headers;
			};
		}),
	],
});

export const createChironEndpoint = createEndpoint.create({
	use: [optionsMiddleware],
});

export type ChironEndpoint = ReturnType<typeof createChironEndpoint>;
export type ChironMiddleware = ReturnType<typeof createChironMiddleware>;
