import type { stripe } from "./index-ai";
import type { ChironClientPlugin } from "chiron-sh";

export const stripeClient = () => {
	return {
		id: "stripe",
		$InferServerPlugin: {} as ReturnType<typeof stripe>,
	} satisfies ChironClientPlugin;
};
