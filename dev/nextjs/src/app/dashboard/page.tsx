import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

	const upgradeToPremium = async () => {
		"use server";
		const res = await chiron.api.createCheckoutSession({
			headers: await headers(),
			body: {
				priceId: process.env.NEXT_PUBLIC_STRIPE_TEST_SUBSCRIPTION_PRICE_ID!,
				successRedirect: `/dashboard`,
				cancelRedirect: `/dashboard`,
			},
		});

		if (!res.url) {
			throw new Error("Failed to create checkout session");
		}

		redirect(res.url);
	};

	return (
		<div className="flex flex-col items-center justify-center h-full">
			<Card>
				<CardHeader>Upgrade to Premium to access this page.</CardHeader>
				<CardContent>
					<form action={upgradeToPremium}>
						<Button>Upgrade to Premium</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
