import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const chironSubscriptions = sqliteTable("chiron_subscriptions", {
  id: text().primaryKey(),
  customerId: text().references(() => chironCustomers.id),
  status: text({
    enum: ["active", "trialing", "canceled"],
  }),
  provider: text(),
  storeProductId: text(),
  storeBasePlanId: text(),
  storeTransactionId: text(),
  storeOriginalTransactionId: text(),
  startsAt: integer({
    mode: "timestamp",
  }),
  purchasedAt: integer({
    mode: "timestamp",
  }),
  originallyPurchasedAt: integer({
    mode: "timestamp",
  }),
  expiresAt: integer({
    mode: "timestamp",
  }),
  renewalCancelledAt: integer({
    mode: "timestamp",
  }),
  billingIssueDetectedAt: integer({
    mode: "timestamp",
  }),
  isInGracePeriod: integer({
    mode: "boolean",
  }),
  cancellationReason: text(),
  metadata: text({
    mode: "json",
  }),
});

export const chironCustomers = sqliteTable("chiron_customers", {
  id: text().primaryKey(),
  customUserId: text(),
  metadata: text({
    mode: "json",
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
