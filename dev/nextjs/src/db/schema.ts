import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Table representing user subscription information.
 * Based on the Adapty subscription model:
 * https://adapty.io/docs/server-side-api-objects#subscription
 */
export const subscription = sqliteTable("subscription", {
	id: text("id").primaryKey(),
	customerId: text("customer_id").references(() => customer.id),

	/**
	 * Subscription status - can be active, trialing, or canceled
	 */
	status: text("status", {
		enum: ["active", "trialing", "canceled"],
	}),
	/**
	 * Store where the product was bought (e.g., stripe)
	 */
	provider: text("provider"),

	/**
	 * ID of the product in the app store that unlocked this subscription
	 */
	providerProductId: text("store_product_id"),

	/**
	 * Price ID in Stripe
	 */
	providerBasePlanId: text("store_base_plan_id"),

	/**
	 * The original subscription ID from the provider
	 */
	providerSubscriptionId: text("original_subscription_id"),

	/**
	 * The date when the subscription becomes active (could be in the future)
	 */
	startsAt: integer("starts_at", {
		mode: "timestamp",
	}),

	/**
	 * The datetime of the most recent purchase for the subscription
	 */
	purchasedAt: integer("purchased_at", {
		mode: "timestamp",
	}),

	/**
	 * The datetime when the subscription expires (may be in the past, or null for lifetime access)
	 */
	expiresAt: integer("expires_at", {
		mode: "timestamp",
	}),
	/**
	 * The datetime when a billing issue was detected (e.g., failed payment)
	 * The subscription might still be active; cleared if payment succeeds later
	 */
	billingIssueDetectedAt: integer("billing_issue_detected_at", {
		mode: "timestamp",
	}),

	createdAt: integer("created_at", {
		mode: "timestamp",
	}),

	updatedAt: integer("updated_at", {
		mode: "timestamp",
	}),
});

export const customer = sqliteTable("customer", {
	id: text("id").primaryKey(),
	customUserId: text("custom_user_id"),
	name: text("name"),
	email: text("email"),
	createdAt: integer("created_at", {
		mode: "timestamp",
	}),
	updatedAt: integer("updated_at", {
		mode: "timestamp",
	}),
});

export const customer_external_id = sqliteTable("customer_external_id", {
	id: text("id").primaryKey(),
	customerId: text("customer_id").references(() => customer.id),
	service: text("service"),
	externalId: text("external_id"),
	createdAt: integer("created_at", {
		mode: "timestamp",
	}),
	updatedAt: integer("updated_at", {
		mode: "timestamp",
	}),
});

// BetterAuth
export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", {
		mode: "timestamp",
	}),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp",
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }),
	updatedAt: integer("updated_at", { mode: "timestamp" }),
});
