export type AuthenticatedUser = {
	status: "authenticated";
	id: string;
	email?: string;
	name?: string;
	roles?: string[];
};

export type UnauthenticatedUser = {
	status: "unauthenticated";
};
