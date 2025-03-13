export const setupAccessLevels = <A extends AccessLevelConfiguration>(
	accessLevels: A
): A => {
	return accessLevels;
};

export type AccessLevelConfiguration = Record<string, boolean>;

/**
 * Represents the keys of an access level configuration
 * Used for enforcing type safety when referencing access level names
 */
export type AccessLevelName<T extends AccessLevelConfiguration> = keyof T &
	string;
