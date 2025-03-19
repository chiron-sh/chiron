import { createChironEndpoint, createChironMiddleware } from "../call";
import { APIError } from "better-call";

export const authMiddleware = createChironMiddleware(async (ctx) => {
	// const session = await getSessionFromCtx(ctx);
	const session = await ctx.context.authenticate({
		headers: ctx.headers || new Headers(),
	});

	if (session.status === "unauthenticated") {
		throw new APIError("UNAUTHORIZED");
	}

	return {
		session,
	};
});

export const getCustomer = createChironEndpoint(
	"/get-customer",
	{
		method: "GET",
		requireHeaders: true,
		metadata: {
			openapi: {
				description: "Get the current session",
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										id: {
											type: "string",
										},
										email: {
											type: "string",
										},
										name: {
											type: "string",
										},
									},
								},
							},
						},
					},
				},
			},
		},
		use: [authMiddleware],
	},
	async (ctx) => {
		const session = ctx.context.session;
		const authenticatedCustomer =
			await ctx.context.getAuthenticatedCustomer(ctx);

		if (!authenticatedCustomer) {
			throw new APIError("UNAUTHORIZED");
		}

		const accessLevels = await ctx.context.paymentCore.getCustomerAccessLevels({
			customerId: authenticatedCustomer.id,
		});

		return ctx.json({
			...authenticatedCustomer,
			accessLevels,
		});
	}
);
