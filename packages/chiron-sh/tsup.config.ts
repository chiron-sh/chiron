import { defineConfig } from "tsup";

export default defineConfig((env) => {
	return {
		entry: {
			index: "./src/index.ts",
			types: "./src/types/index.ts",
			client: "./src/client/index.ts",
			"adapters/prisma": "./src/adapters/prisma-adapter/index.ts",
			"adapters/drizzle": "./src/adapters/drizzle-adapter/index.ts",
			"adapters/mongodb": "./src/adapters/mongodb-adapter/index.ts",
			"adapters/kysely": "./src/adapters/kysely-adapter/index.ts",
			"adapters/memory": "./src/adapters/memory-adapter/index.ts",
			"adapters/test": "./src/adapters/test.ts",
			db: "./src/db/index.ts",
			react: "./src/client/react/index.ts",
			vue: "./src/client/vue/index.ts",
			svelte: "./src/client/svelte/index.ts",
			solid: "./src/client/solid/index.ts",
			plugins: "./src/plugins/index.ts",
			api: "./src/api/index.ts",
			"client/plugins": "./src/client/plugins/index.ts",
			"svelte-kit": "./src/integrations/svelte-kit.ts",
			"solid-start": "./src/integrations/solid-start.ts",
			"next-js": "./src/integrations/next-js.ts",
			node: "./src/integrations/node.ts",
		},
		format: ["esm", "cjs"],
		splitting: true,
		cjsInterop: true,
		skipNodeModulesBundle: true,
		treeshake: true,
	};
});
