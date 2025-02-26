import type { z } from "zod";
import type {
	customerExternalIdSchema,
	customerSchema,
	subscriptionSchema,
} from "../db/schema";

export type Models =
	| "subscription"
	| "customer"
	| "customer_external_id"
	| "rate_limit";

// Example
// | "user"
// | "account"
// | "session"
// | "verification"
// | "rate-limit"
// | "organization"
// | "member"
// | "invitation"
// | "jwks"
// | "passkey"
// | "two-factor";

interface RateLimit {
	/**
	 * The key to use for rate limiting
	 */
	key: string;
	/**
	 * The number of requests made
	 */
	count: number;
	/**
	 * The last request time in milliseconds
	 */
	lastRequest: number;
}

export type Customer = z.infer<typeof customerSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type CustomerExternalId = z.infer<typeof customerExternalIdSchema>;

export type { RateLimit };
