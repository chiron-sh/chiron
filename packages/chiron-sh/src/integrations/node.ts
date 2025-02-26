import { toNodeHandler as toNode } from "better-call/node";
import type { Chiron } from "../chiron";
import type { IncomingHttpHeaders } from "http";

export const toNodeHandler = (
	chiron:
		| {
				handler: Chiron["handler"];
		  }
		| Chiron["handler"]
) => {
	return "handler" in chiron ? toNode(chiron.handler) : toNode(chiron);
};

export function fromNodeHeaders(nodeHeaders: IncomingHttpHeaders): Headers {
	const webHeaders = new Headers();
	for (const [key, value] of Object.entries(nodeHeaders)) {
		if (value !== undefined) {
			if (Array.isArray(value)) {
				value.forEach((v) => webHeaders.append(key, v));
			} else {
				webHeaders.set(key, value);
			}
		}
	}
	return webHeaders;
}
