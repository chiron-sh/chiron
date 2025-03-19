import type { Subscription } from "../types";

export function diffSubscriptions<
	T extends Subscription,
	TIgnoredFields extends (keyof T)[],
>(
	prevSubscription: Partial<Exclude<T, TIgnoredFields>>,
	newSubscription: Partial<Exclude<T, TIgnoredFields>>,
	ignoreFields: TIgnoredFields
) {
	const changes: { field: string; prevValue: any; newValue: any }[] = [];

	// Compare each field in the subscription objects
	for (const key in newSubscription) {
		if (ignoreFields.includes(key as keyof T)) continue;

		// Type assertion to access properties using string indexing
		const prevValue = (prevSubscription as any)[key];
		const newValue = (newSubscription as any)[key];

		// Handle Date objects - compare timestamps
		if (prevValue instanceof Date && newValue instanceof Date) {
			if (prevValue.getTime() !== newValue.getTime()) {
				changes.push({
					field: key,
					prevValue,
					newValue,
				});
			}
		}
		// Handle nullish values
		else if (
			(prevValue === null && newValue !== null) ||
			(prevValue !== null && newValue === null)
		) {
			changes.push({
				field: key,
				prevValue,
				newValue,
			});
		}
		// Handle primitive values
		else if (prevValue !== newValue) {
			changes.push({
				field: key,
				prevValue,
				newValue,
			});
		}
	}

	return changes;
}
