import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Dark Mode Landing Page",
	description:
		"A simple dark mode landing page with a transparent navbar and centered text",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body className={`${inter.className} bg-black text-white`}>
				{children}
			</body>
		</html>
	);
}
