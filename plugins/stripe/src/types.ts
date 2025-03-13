import type { AccessLevelConfiguration } from "chiron-sh";
import type { Stripe } from "stripe";

/**
 * Configuration for a Stripe product and price associated with an access level
 */
export interface StripeProductConfig {
	type: "subscription";
	productId: string;
	priceId: string;
}

export interface StripeOptions {
	stripePublishableKey: string;
	stripeSecretKey: string;
	stripeWebhookSecret: string;
	stripe?: Stripe;
	accessLevels?: (
		map: <ALC extends AccessLevelConfiguration>(
			accessLevels: ALC,
			mapping: { [P in keyof ALC]?: StripeProductConfig[] }
		) => unknown
	) => unknown;
}
