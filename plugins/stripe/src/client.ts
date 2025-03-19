import type { ChironClientPlugin } from "chiron-sh";
import type { stripe } from ".";

export const stripeClient = () => {
	return {
		id: "stripe",
		$InferServerPlugin: {} as ReturnType<typeof stripe>,
	} satisfies ChironClientPlugin;
};
