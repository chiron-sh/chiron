import type { BetterFetch } from "@better-fetch/fetch";
import { atom } from "nanostores";
import type { Customer } from "../types";
import { useChironQuery } from "./query";

export function getCustomerAtom($fetch: BetterFetch) {
	const $signal = atom<boolean>(false);
	const customer = useChironQuery<{
		customer: Customer;
	}>($signal, "/get-customer", $fetch, {
		method: "GET",
	});

	return {
		customer,
		$customerSignal: $signal,
	};
}
