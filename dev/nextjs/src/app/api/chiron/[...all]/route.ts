import { chiron } from "@/lib/chiron";
import { toNextJsHandler } from "chiron-sh/next-js";

export const { POST, GET } = toNextJsHandler(chiron);
