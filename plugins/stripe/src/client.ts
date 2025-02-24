import type { stripe } from ".";
import type { ChironClientPlugin } from "chiron-sh";

export const stripeClient = () => {
	return {
		id: "stripe",
		$InferServerPlugin: {} as ReturnType<typeof stripe>,
	} satisfies ChironClientPlugin;
};
