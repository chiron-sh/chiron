import type { Endpoint } from "better-call";
import type { Migration } from "kysely";
import type { FieldAttribute } from "../db/field";
import type {
	ChironContext,
	ChironOptions,
	DeepPartial,
	HookEndpointContext,
	LiteralString,
	UnionToIntersection,
} from ".";
import type { ChironEndpoint, ChironMiddleware } from "../api/call";

export type ChironPluginSchema = {
	[table in string]: {
		fields: {
			[field in string]: FieldAttribute;
		};
		disableMigration?: boolean;
		modelName?: string;
	};
};

export type HookBeforeHandler = (context: HookEndpointContext) => Promise<
	| void
	| {
			context?: Partial<HookEndpointContext>;
	  }
	| Response
	| {
			response: Record<string, any>;
			body: any;
			_flag: "json";
	  }
>;

export type HookAfterHandler = (context: HookEndpointContext) => Promise<
	| void
	| {
			responseHeader?: Headers;
	  }
	| Response
	| {
			response: Record<string, any>;
			body: any;
			_flag: "json";
	  }
>;

export type ChironPlugin = {
	id: LiteralString;
	/**
	 * The init function is called when the plugin is initialized.
	 * You can return a new context or modify the existing context.
	 */
	init?: (ctx: ChironContext) => {
		context?: DeepPartial<Omit<ChironContext, "options">>;
		options?: Partial<ChironOptions>;
	} | void;
	endpoints?: {
		[key: string]: ChironEndpoint;
	};
	middlewares?: {
		path: string;
		middleware: Endpoint;
	}[];
	onRequest?: (
		request: Request,
		ctx: ChironContext
	) => Promise<
		| {
				response: Response;
		  }
		| {
				request: Request;
		  }
		| void
	>;
	onResponse?: (
		response: Response,
		ctx: ChironContext
	) => Promise<{
		response: Response;
	} | void>;
	hooks?: {
		before?: {
			matcher: (context: HookEndpointContext) => boolean;
			handler: ChironMiddleware;
		}[];
		after?: {
			matcher: (context: HookEndpointContext) => boolean;
			handler: ChironMiddleware;
		}[];
	};
	/**
	 * Schema the plugin needs
	 *
	 * This will also be used to migrate the database. If the fields are dynamic from the plugins
	 * configuration each time the configuration is changed a new migration will be created.
	 *
	 * NOTE: If you want to create migrations manually using
	 * migrations option or any other way you
	 * can disable migration per table basis.
	 *
	 * @example
	 * ```ts
	 * schema: {
	 * 	user: {
	 * 		fields: {
	 * 			email: {
	 * 				 type: "string",
	 * 			},
	 * 			emailVerified: {
	 * 				type: "boolean",
	 * 				defaultValue: false,
	 * 			},
	 * 		},
	 * 	}
	 * } as ChironPluginSchema
	 * ```
	 */
	schema?: ChironPluginSchema;
	/**
	 * The migrations of the plugin. If you define schema that will automatically create
	 * migrations for you.
	 *
	 * ⚠️ Only uses this if you dont't want to use the schema option and you disabled migrations for
	 * the tables.
	 */
	migrations?: Record<string, Migration>;
	/**
	 * The options of the plugin
	 */
	options?: Record<string, any>;
	/**
	 * types to be inferred
	 */
	$Infer?: Record<string, any>;
	/**
	 * The rate limit rules to apply to specific paths.
	 */
	rateLimit?: {
		window: number;
		max: number;
		pathMatcher: (path: string) => boolean;
	}[];
	/**
	 * The error codes returned by the plugin
	 */
	$ERROR_CODES?: Record<string, string>;
};

export type InferOptionSchema<S extends ChironPluginSchema> = S extends Record<
	string,
	{ fields: infer Fields }
>
	? {
			[K in keyof S]?: {
				modelName?: string;
				fields: {
					[P in keyof Fields]?: string;
				};
			};
		}
	: never;

export type InferPluginErrorCodes<O extends ChironOptions> =
	O["plugins"] extends Array<infer P>
		? UnionToIntersection<
				P extends ChironPlugin
					? P["$ERROR_CODES"] extends Record<string, any>
						? P["$ERROR_CODES"]
						: {}
					: {}
			>
		: {};
