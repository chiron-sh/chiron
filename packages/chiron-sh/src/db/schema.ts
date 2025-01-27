import { z } from "zod";

export const customerSchema = z.object({
  id: z.string(),
  customUserId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const subscriptionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  status: z.string(),
  provider: z.string(),
  storeProductId: z.string(),
  storeBasePlanId: z.string(),
  storeTransactionId: z.string(),
  storeOriginalTransactionId: z.string(),
  startsAt: z.date(),
  purchasedAt: z.date(),
  originallyPurchasedAt: z.date(),
  expiresAt: z.date(),
  renewalCancelledAt: z.date().optional(),
  billingIssueDetectedAt: z.date().optional(),
  isInGracePeriod: z.boolean(),
  cancellationReason: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
