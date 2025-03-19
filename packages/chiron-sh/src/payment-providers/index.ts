import { z } from "zod";
import { internal } from "./internal";
import { createPaymentProvider } from "./core";
import type { Prettify } from "../types";

export const paymentProviders = {
	internal,
};

export const paymentProviderList = Object.keys(paymentProviders) as [
	"internal",
	...(keyof typeof paymentProviders)[],
];

export type PaymentProviderList = typeof paymentProviderList;

export const PaymentProviderListEnum = z.enum(paymentProviderList, {
	description: "Payment provider to use",
});

export type PaymentProvider = z.infer<typeof PaymentProviderListEnum>;

export type PaymentProviders = {
	[K in PaymentProviderList[number]]?: Prettify<
		Omit<ReturnType<typeof createPaymentProvider>, "id"> & {
			enabled?: boolean;
		}
	>;
};

export * from "./types";
