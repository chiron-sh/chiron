import type { z } from "zod";
import type { customerSchema, subscriptionSchema } from "../db/schema";
import type { ChironOptions } from "./options";
import type { Chiron } from "../chiron";
import type { StripEmptyObjects, UnionToIntersection } from "./helper";
import type { InferFieldsFromOptions, InferFieldsFromPlugins } from "../db";
import type { ChironPlugin } from "../plugins";

export type Models = "subscription" | "customer" | "rate_limit";

export type AdditionalCustomerFieldsInput<Options extends ChironOptions> =
	InferFieldsFromPlugins<Options, "customer", "input"> &
		InferFieldsFromOptions<Options, "customer", "input">;

export type AdditionalCustomerFieldsOutput<Options extends ChironOptions> =
	InferFieldsFromPlugins<Options, "customer"> &
		InferFieldsFromOptions<Options, "customer">;

export type InferCustomer<O extends ChironOptions | Chiron> =
	UnionToIntersection<
		StripEmptyObjects<
			Customer &
				(O extends ChironOptions
					? AdditionalCustomerFieldsOutput<O>
					: O extends Chiron
						? AdditionalCustomerFieldsOutput<O["options"]>
						: {})
		>
	>;

export type InferPluginTypes<O extends ChironOptions> =
	O["plugins"] extends Array<infer P>
		? UnionToIntersection<
				P extends ChironPlugin
					? P["$Infer"] extends Record<string, any>
						? P["$Infer"]
						: {}
					: {}
			>
		: {};

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

export type { RateLimit };
