import { atom, computed } from "nanostores";
import type { ChironClientPlugin } from "./types";
import type { ChironPlugin } from "../types/plugins";
import { createChironEndpoint } from "../api/call";
import { useChironQuery } from "./query";

const serverPlugin = {
	id: "test",
	endpoints: {
		test: createChironEndpoint(
			"/test",
			{
				method: "GET",
			},
			async (c) => {
				return {
					data: "test",
				};
			}
		),
		testSignOut2: createChironEndpoint(
			"/test-2/sign-out",
			{
				method: "POST",
			},
			async (c) => {
				return null;
			}
		),
	},
	schema: {
		user: {
			fields: {
				testField: {
					type: "string",
					required: false,
				},
				testField2: {
					type: "number",
					required: false,
				},
				testField3: {
					type: "string",
					returned: false,
				},
				testField4: {
					type: "string",
					defaultValue: "test",
				},
			},
		},
	},
} satisfies ChironPlugin;

export const testClientPlugin = () => {
	const $test = atom(false);
	let testValue = 0;
	const computedAtom = computed($test, () => {
		return testValue++;
	});
	return {
		id: "test" as const,
		getActions($fetch) {
			return {
				setTestAtom(value: boolean) {
					$test.set(value);
				},
				test: {
					signOut: async () => {},
				},
			};
		},
		getAtoms($fetch) {
			const $signal = atom(false);
			const queryAtom = useChironQuery<any>($signal, "/test", $fetch, {
				method: "GET",
			});
			return {
				$test,
				$signal,
				computedAtom,
				queryAtom,
			};
		},
		$InferServerPlugin: {} as typeof serverPlugin,
		atomListeners: [
			{
				matcher: (path) => path === "/test",
				signal: "$test",
			},
			{
				matcher: (path) => path === "/test2/sign-out",
				signal: "$sessionSignal",
			},
		],
	} satisfies ChironClientPlugin;
};
export const testClientPlugin2 = () => {
	const $test2 = atom(false);
	let testValue = 0;
	const anotherAtom = computed($test2, () => {
		return testValue++;
	});
	return {
		id: "test",
		getAtoms($fetch) {
			return {
				$test2,
				anotherAtom,
			};
		},
		atomListeners: [
			{
				matcher: (path) => path === "/test",
				signal: "$test",
			},
			{
				matcher: (path) => path === "/test2/sign-out",
				signal: "$sessionSignal",
			},
		],
	} satisfies ChironClientPlugin;
};
