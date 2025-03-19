/*

This file is used explicitly for testing purposes.

It's not used in the production code.

For information on how to use the drizzle-adapter, please refer to the documentation.

https://www.chiron.sh/docs/concepts/database#drizzle-adapter

*/
import { text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const customer = pgTable("customer", {
	id: text("id").primaryKey(),
	customUserId: text("customUserId").notNull(),
	name: text("name"),
	email: text("email"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	test: text("test").notNull(),
});

export const subscription = pgTable("subscription", {
	id: text("id").primaryKey(),
	customerId: text("customerId").references(() => customer.id),
	status: text("status", {
		enum: ["active", "trialing", "canceled"],
	}),
	provider: text("provider"),
	providerProductId: text("providerProductId"),
	providerBasePlanId: text("providerBasePlanId"),
	providerSubscriptionId: text("providerSubscriptionId"),
	startsAt: timestamp("startsAt"),
	purchasedAt: timestamp("purchasedAt"),
	expiresAt: timestamp("expiresAt"),
	billingIssueDetectedAt: timestamp("billingIssueDetectedAt"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});
