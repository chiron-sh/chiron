import type { ChironClientPlugin, ChironOptions } from "../../types";

export const InferServerPlugin = <
	AuthOrOption extends
		| ChironOptions
		| {
				options: ChironOptions;
		  },
	ID extends string,
>() => {
	type Option = AuthOrOption extends { options: infer O } ? O : AuthOrOption;
	type Plugin = Option["plugins"] extends Array<infer P>
		? P extends {
				id: ID;
			}
			? P
			: never
		: never;
	return {
		id: "infer-server-plugin",
		$InferServerPlugin: {} as Plugin,
	} satisfies ChironClientPlugin;
};
