import type {
	BetterFetch,
	BetterFetchOption,
	BetterFetchPlugin,
} from "@better-fetch/fetch";
import type { ChironPlugin } from "../types/plugins";
import type { Atom, WritableAtom } from "nanostores";
import type {
	LiteralString,
	StripEmptyObjects,
	UnionToIntersection,
} from "../types/helper";
import type { Chiron } from "../chiron";
import type { InferRoutes } from "./path-to-object";
import type { InferFieldsInputClient, InferFieldsOutput } from "../db";
import type { Customer } from "../types";

export type AtomListener = {
	matcher: (path: string) => boolean;
	signal: "$sessionSignal" | Omit<string, "$sessionSignal">;
};

export interface Store {
	notify: (signal: string) => void;
	listen: (signal: string, listener: () => void) => void;
	atoms: Record<string, WritableAtom<any>>;
}

export interface ChironClientPlugin {
	id: LiteralString;
	/**
	 * only used for type inference. don't pass the
	 * actual plugin
	 */
	$InferServerPlugin?: ChironPlugin;
	/**
	 * Custom actions
	 */
	getActions?: ($fetch: BetterFetch, $store: Store) => Record<string, any>;
	/**
	 * State atoms that'll be resolved by each framework
	 * auth store.
	 */
	getAtoms?: ($fetch: BetterFetch) => Record<string, Atom<any>>;
	/**
	 * specify path methods for server plugin inferred
	 * endpoints to force a specific method.
	 */
	pathMethods?: Record<string, "POST" | "GET">;
	/**
	 * Better fetch plugins
	 */
	fetchPlugins?: BetterFetchPlugin[];
	/**
	 * a list of recaller based on a matcher function.
	 * The signal name needs to match a signal in this
	 * plugin or any plugin the user might have added.
	 */
	atomListeners?: AtomListener[];
}

export interface ClientOptions {
	fetchOptions?: BetterFetchOption;
	plugins?: ChironClientPlugin[];
	baseURL?: string;
	disableDefaultFetchPlugins?: boolean;
}

export type InferClientAPI<O extends ClientOptions> = InferRoutes<
	O["plugins"] extends Array<any>
		? Chiron["api"] &
				(O["plugins"] extends Array<infer Pl>
					? UnionToIntersection<
							Pl extends {
								$InferServerPlugin: infer Plug;
							}
								? Plug extends {
										endpoints: infer Endpoints;
									}
									? Endpoints
									: {}
								: {}
						>
					: {})
		: Chiron["api"],
	O
>;

export type InferActions<O extends ClientOptions> = O["plugins"] extends Array<
	infer Plugin
>
	? UnionToIntersection<
			Plugin extends ChironClientPlugin
				? Plugin["getActions"] extends (...args: any) => infer Actions
					? Actions
					: {}
				: {}
		>
	: {};

export type InferErrorCodes<O extends ClientOptions> =
	O["plugins"] extends Array<infer Plugin>
		? UnionToIntersection<
				Plugin extends ChironClientPlugin
					? Plugin["$InferServerPlugin"] extends ChironPlugin
						? Plugin["$InferServerPlugin"]["$ERROR_CODES"]
						: {}
					: {}
			>
		: {};
/**
 * signals are just used to recall a computed value.
 * as a convention they start with "$"
 */
export type IsSignal<T> = T extends `$${infer _}` ? true : false;

export type InferPluginsFromClient<O extends ClientOptions> =
	O["plugins"] extends Array<ChironClientPlugin>
		? Array<O["plugins"][number]["$InferServerPlugin"]>
		: undefined;

// export type InferSessionFromClient<O extends ClientOptions> = StripEmptyObjects<
// 	Session &
// 		UnionToIntersection<InferAdditionalFromClient<O, "session", "output">>
// >;
// export type InferUserFromClient<O extends ClientOptions> = StripEmptyObjects<
// 	User & UnionToIntersection<InferAdditionalFromClient<O, "user", "output">>
// >;

export type InferCustomerFromClient<O extends ClientOptions> =
	StripEmptyObjects<
		Customer &
			UnionToIntersection<InferAdditionalFromClient<O, "customer", "output">>
	>;

export type InferAdditionalFromClient<
	Options extends ClientOptions,
	Key extends string,
	Format extends "input" | "output" = "output",
> = Options["plugins"] extends Array<infer T>
	? T extends ChironClientPlugin
		? T["$InferServerPlugin"] extends {
				schema: {
					[key in Key]: {
						fields: infer Field;
					};
				};
			}
			? Format extends "input"
				? InferFieldsInputClient<Field>
				: InferFieldsOutput<Field>
			: {}
		: {}
	: {};
