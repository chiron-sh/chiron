import { z } from "zod";
import { createChironEndpoint, createChironMiddleware } from "../call";
import { APIError } from "better-call";
import { authMiddleware } from "./customer";

export const getSubscriptions = createChironEndpoint(
	"/subscriptions",
	{
		method: "GET",
		requireHeaders: true,
		metadata: {
			openapi: {
				description: "Get user subscriptions",
				responses: {
					"200": {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										subscriptions: {
											type: "array",
											items: {
												type: "object",
												properties: {
													id: {
														type: "string",
													},
													type: {
														type: "string",
													},
													status: {
														type: "string",
													},
													currentPeriodStart: {
														type: "string",
														format: "date-time",
													},
													currentPeriodEnd: {
														type: "string",
														format: "date-time",
													},
													cancelAtPeriodEnd: {
														type: "boolean",
													},
												},
											},
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
		const customer = await ctx.context.getAuthenticatedCustomer(ctx);

		const subscriptions = await ctx.context.internalAdapter.listSubscriptions(
			customer.id
		);

		return ctx.json({
			status: true,
			body: subscriptions,
		});
	}
);
