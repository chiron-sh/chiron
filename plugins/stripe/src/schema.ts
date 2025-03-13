import type { ChironPluginSchema } from "chiron-sh";
import type { StripeOptions } from "./types";

export const getSchema = (options: StripeOptions) => {
	const customer = {
		customer: {
			fields: {
				stripeCustomerId: {
					type: "string",
					required: false,
				},
			},
		},
	} satisfies ChironPluginSchema;
	return {
		...customer,
	} as typeof customer;
};
