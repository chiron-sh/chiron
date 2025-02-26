import type { ChironPaymentProvider } from "./types";

export const internal = () => {
  return {
    id: "internal",
  } satisfies ChironPaymentProvider;
};
