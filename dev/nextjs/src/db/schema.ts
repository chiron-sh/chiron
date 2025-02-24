import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chironSubscriptions = sqliteTable("chiron_subscription", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => chironCustomers.id),
  status: text("status", {
    enum: ["active", "trialing", "canceled"],
  }),
  provider: text("provider"),
  storeProductId: text("store_product_id"),
  storeBasePlanId: text("store_base_plan_id"),
  storeTransactionId: text("store_transaction_id"),
  storeOriginalTransactionId: text("store_original_transaction_id"),
  startsAt: integer("starts_at", {
    mode: "timestamp",
  }),
  purchasedAt: integer("purchased_at", {
    mode: "timestamp",
  }),
  originallyPurchasedAt: integer("originally_purchased_at", {
    mode: "timestamp",
  }),
  expiresAt: integer("expires_at", {
    mode: "timestamp",
  }),
  renewalCancelledAt: integer("renewal_cancelled_at", {
    mode: "timestamp",
  }),
  billingIssueDetectedAt: integer("billing_issue_detected_at", {
    mode: "timestamp",
  }),
  isInGracePeriod: integer("is_in_grace_period", {
    mode: "boolean",
  }),
  cancellationReason: text("cancellation_reason"),
});

export const chironCustomers = sqliteTable("chiron_customer", {
  id: text("id").primaryKey(),
  customUserId: text("custom_user_id"),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
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
