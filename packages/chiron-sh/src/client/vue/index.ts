import { useStore } from "./vue-store";
import type { DeepReadonly, Ref } from "vue";
import { getClientConfig } from "../config";
import { capitalizeFirstLetter } from "../../utils/misc";
import type {
	ChironClientPlugin,
	ClientOptions,
	InferActions,
	InferClientAPI,
	InferErrorCodes,
	IsSignal,
} from "../types";
import { createDynamicPathProxy } from "../proxy";
import type { PrettifyDeep, UnionToIntersection } from "../../types/helper";
import type {
	BetterFetchError,
	BetterFetchResponse,
} from "@better-fetch/fetch";
import type { BASE_ERROR_CODES } from "../../error/codes";

function getAtomKey(str: string) {
	return `use${capitalizeFirstLetter(str)}`;
}

type InferResolvedHooks<O extends ClientOptions> = O["plugins"] extends Array<
	infer Plugin
>
	? Plugin extends ChironClientPlugin
		? Plugin["getAtoms"] extends (fetch: any) => infer Atoms
			? Atoms extends Record<string, any>
				? {
						[key in keyof Atoms as IsSignal<key> extends true
							? never
							: key extends string
								? `use${Capitalize<key>}`
								: never]: () => DeepReadonly<
							Ref<ReturnType<Atoms[key]["get"]>>
						>;
					}
				: {}
			: {}
		: {}
	: {};

export function createChironClient<Option extends ClientOptions>(
	options?: Option
) {
	const {
		pluginPathMethods,
		pluginsActions,
		pluginsAtoms,
		$fetch,
		$store,
		atomListeners,
	} = getClientConfig(options);
	let resolvedHooks: Record<string, any> = {};
	for (const [key, value] of Object.entries(pluginsAtoms)) {
		resolvedHooks[getAtomKey(key)] = () => useStore(value);
	}

	type ClientAPI = InferClientAPI<Option>;
	type Customer = ClientAPI extends {
		getCustomer: () => Promise<infer Res>;
	}
		? Res extends BetterFetchResponse<infer S>
			? S
			: Res extends Record<string, any>
				? Res
				: never
		: never;

	function useCustomer(): DeepReadonly<
		Ref<{
			data: Customer;
			isPending: boolean;
			isRefetching: boolean;
			error: BetterFetchError | null;
		}>
	>;
	function useCustomer<F extends (...args: any) => any>(
		useFetch: F
	): Promise<{
		data: Ref<Customer>;
		isPending: false; //this is just to be consistent with the default hook
		error: Ref<{
			message?: string;
			status: number;
			statusText: string;
		}>;
	}>;
	function useCustomer<UseFetch extends <T>(...args: any) => any>(
		useFetch?: UseFetch
	) {
		if (useFetch) {
			const ref = useStore(pluginsAtoms.$customerSignal);
			const baseURL = options?.fetchOptions?.baseURL || options?.baseURL;
			let authPath = baseURL ? new URL(baseURL).pathname : "/api/chiron";
			authPath = authPath === "/" ? "/api/chiron" : authPath; //fix for root path
			authPath = authPath.endsWith("/") ? authPath.slice(0, -1) : authPath; //fix for trailing slash
			return useFetch(`${authPath}/get-customer`, {
				ref,
			}).then((res: any) => {
				return {
					data: res.data,
					isPending: false,
					error: res.error,
				};
			});
		}
		return resolvedHooks.useCustomer();
	}

	const routes = {
		...pluginsActions,
		...resolvedHooks,
		useCustomer,
		$fetch,
		$store,
	};

	const proxy = createDynamicPathProxy(
		routes,
		$fetch,
		pluginPathMethods,
		pluginsAtoms,
		atomListeners
	);

	return proxy as UnionToIntersection<InferResolvedHooks<Option>> &
		InferClientAPI<Option> &
		InferActions<Option> & {
			useCustomer: typeof useCustomer;
			$Infer: {
				Customer: NonNullable<Customer>;
			};
			$fetch: typeof $fetch;
			$store: typeof $store;
			$ERROR_CODES: PrettifyDeep<
				InferErrorCodes<Option> & typeof BASE_ERROR_CODES
			>;
		};
}
