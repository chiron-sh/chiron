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
