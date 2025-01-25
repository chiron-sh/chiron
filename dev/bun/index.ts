import { chiron } from "./chiron";

Bun.serve({
  fetch: chiron.handler,
  port: 4000,
});
console.log("Server running on port 4000");
