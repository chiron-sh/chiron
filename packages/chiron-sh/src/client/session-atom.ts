// import type { BetterFetch } from "@better-fetch/fetch";
// import { atom } from "nanostores";
// import { useChironQuery } from "./query";
// import type { Session, User } from "../types";

// export function getSessionAtom($fetch: BetterFetch) {
// 	const $signal = atom<boolean>(false);
// 	const session = useChironQuery<{
// 		user: User;
// 		session: Session;
// 	}>($signal, "/get-session", $fetch, {
// 		method: "GET",
// 	});
// 	return {
// 		session,
// 		$sessionSignal: $signal,
// 	};
// }
