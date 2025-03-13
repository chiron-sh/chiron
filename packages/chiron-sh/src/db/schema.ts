import { z } from "zod";

export const customerSchema = z.object({
	id: z.string(),
	customUserId: z.string(),
	email: z.string().email().nullish(),
	name: z.string().nullish(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});

export const subscriptionSchema = z.object({
	id: z.string(),
	customerId: z.string(),
	status: z.enum(["active", "trialing", "canceled"]),
	provider: z.string(),
	providerProductId: z.string(),
	providerBasePlanId: z.string(),
	providerSubscriptionId: z.string(),
	startsAt: z.date(),
	purchasedAt: z.date(),
	expiresAt: z.date().nullish(),
	billingIssueDetectedAt: z.date().nullish(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});
