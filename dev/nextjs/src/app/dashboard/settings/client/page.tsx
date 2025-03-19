"use client";

import { chironClient } from "@/lib/chiron-client";

export default function Dashboard() {
	const { data: customer, isPending } = chironClient.useCustomer();

	return (
		<div>
			Settings
			<br /> {JSON.stringify(customer)}
		</div>
	);
}
