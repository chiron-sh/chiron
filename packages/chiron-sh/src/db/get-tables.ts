import type { FieldAttribute } from ".";
import type { ChironOptions } from "../types";

export type ChironDbSchema = Record<
	string,
	{
		/**
		 * The name of the table in the database
		 */
		modelName: string;
		/**
		 * The fields of the table
		 */
		fields: Record<string, FieldAttribute>;
		/**
		 * Whether to disable migrations for this table
		 * @default false
		 */
		disableMigrations?: boolean;
		/**
		 * The order of the table
		 */
		order?: number;
	}
>;

export const getSubscriptionManagementTables = (
	options: ChironOptions
): ChironDbSchema => {
	const pluginSchema = options.plugins?.reduce(
		(acc, plugin) => {
			const schema = plugin.schema;
			if (!schema) return acc;
			for (const [key, value] of Object.entries(schema)) {
				acc[key] = {
					fields: {
						...acc[key]?.fields,
						...value.fields,
					},
					modelName: value.modelName || key,
				};
			}
			return acc;
		},
		{} as Record<
			string,
			{ fields: Record<string, FieldAttribute>; modelName: string }
		>
	);

	const shouldAddRateLimitTable = options.rateLimit?.storage === "database";
	const rateLimitTable = {
		rateLimit: {
			modelName: options.rateLimit?.modelName || "rateLimit",
			fields: {
				key: {
					type: "string",
					fieldName: options.rateLimit?.fields?.key || "key",
				},
				count: {
					type: "number",
					fieldName: options.rateLimit?.fields?.count || "count",
				},
				lastRequest: {
					type: "number",
					bigint: true,
					fieldName: options.rateLimit?.fields?.lastRequest || "lastRequest",
				},
			},
		},
	} satisfies ChironDbSchema;

	const { customer, subscription, customer_external_id, ...pluginTables } =
		pluginSchema || {};
	return {
		customer: {
			modelName: options.customer?.modelName || "customer",
			fields: {
				customUserId: {
					type: "string",
					required: true,
					fieldName: options.customer?.fields?.customUserId || "customUserId",
				},
				email: {
					type: "string",
					required: false,
					fieldName: options.customer?.fields?.email || "email",
				},
				name: {
					type: "string",
					required: false,
					fieldName: options.customer?.fields?.name || "name",
				},
				createdAt: {
					type: "date",
					defaultValue: () => new Date(),
					required: true,
					fieldName: options.customer?.fields?.createdAt || "createdAt",
				},
				updatedAt: {
					type: "date",
					defaultValue: () => new Date(),
					required: true,
					fieldName: options.customer?.fields?.updatedAt || "updatedAt",
				},
				...customer?.fields,
				...options.customer?.additionalFields,
			},
			order: 1,
		},
		subscription: {
			modelName: options.subscription?.modelName || "subscription",
			fields: {
				customerId: {
					type: "string",
					required: true,
					references: {
						model: "customers",
						field: "id",
					},
					fieldName: options.subscription?.fields?.customerId || "customerId",
				},
				status: {
					type: "string",
					required: true,
					fieldName: options.subscription?.fields?.status || "status",
				},
				provider: {
					type: "string",
					required: true,
					fieldName: options.subscription?.fields?.provider || "provider",
				},
				providerProductId: {
					type: "string",
					required: true,
					fieldName:
						options.subscription?.fields?.providerProductId ||
						"providerProductId",
				},
				providerBasePlanId: {
					type: "string",
					required: true,
					fieldName:
						options.subscription?.fields?.providerBasePlanId ||
						"providerBasePlanId",
				},
				providerSubscriptionId: {
					type: "string",
					required: true,
					fieldName:
						options.subscription?.fields?.providerSubscriptionId ||
						"providerSubscriptionId",
				},
				startsAt: {
					type: "date",
					required: true,
					fieldName: options.subscription?.fields?.startsAt || "startsAt",
				},
				purchasedAt: {
					type: "date",
					required: true,
					fieldName: options.subscription?.fields?.purchasedAt || "purchasedAt",
				},
				expiresAt: {
					type: "date",
					required: false,
					fieldName: options.subscription?.fields?.expiresAt || "expiresAt",
				},
				billingIssueDetectedAt: {
					type: "date",
					required: false,
					fieldName:
						options.subscription?.fields?.billingIssueDetectedAt ||
						"billingIssueDetectedAt",
				},
				createdAt: {
					type: "date",
					defaultValue: () => new Date(),
					required: true,
					fieldName: options.subscription?.fields?.createdAt || "createdAt",
				},
				updatedAt: {
					type: "date",
					defaultValue: () => new Date(),
					required: true,
					fieldName: options.subscription?.fields?.updatedAt || "updatedAt",
				},
				...subscription?.fields,
				...options.subscription?.additionalFields,
			},
			order: 2,
		},
		customer_external_id: {
			modelName:
				options.customerExternalId?.modelName || "customer_external_id",
			fields: {
				service: {
					type: "string",
					required: true,
					fieldName: options.customerExternalId?.fields?.service || "service",
				},
				customerId: {
					type: "string",
					required: true,
					references: {
						model: "customers",
						field: "id",
					},
					fieldName:
						options.customerExternalId?.fields?.customerId || "customerId",
				},
				externalId: {
					type: "string",
					required: true,
					fieldName:
						options.customerExternalId?.fields?.externalId || "externalId",
				},
				createdAt: {
					type: "date",
					defaultValue: () => new Date(),
					required: true,
					fieldName:
						options.customerExternalId?.fields?.createdAt || "createdAt",
				},
				updatedAt: {
					type: "date",
					defaultValue: () => new Date(),
					required: true,
					fieldName:
						options.customerExternalId?.fields?.updatedAt || "updatedAt",
				},
				...customer_external_id?.fields,
				...options.customerExternalId?.additionalFields,
			},
			order: 3,
		},
		...pluginTables,
		...(shouldAddRateLimitTable ? rateLimitTable : {}),
	} satisfies ChironDbSchema;
};
