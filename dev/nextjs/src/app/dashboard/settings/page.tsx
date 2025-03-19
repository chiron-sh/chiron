import { auth } from "@/lib/auth";
import { chiron } from "@/lib/chiron";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
	const session = await auth.api.getSession({
		headers: await headers(), // you need to pass the headers object.
	});

	if (!session?.user) {
		return redirect("/login");
	}

	const profileRes = await chiron.api.getCustomer({
		headers: await headers(),
	});

	const profile = profileRes.body;

	return (
		<div>
			Settings
			<br /> {JSON.stringify(profile)}
		</div>
	);
}
