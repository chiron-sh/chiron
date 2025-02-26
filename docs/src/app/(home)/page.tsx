"use client";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { GithubIcon } from "@/components/icons/github";

export default function HomePage() {
	return (
		<main className="flex flex-col min-h-full">
			<div className="fixed w-full bottom-0 z-0">
				<Image
					src="/gradient.png"
					alt=""
					width={1440}
					height={482}
					className="w-full"
				/>
			</div>
			<div className="flex-1 flex flex-col justify-center items-center z-10 px-4 pt-12">
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
				>
					<Image src="/star.png" alt="Hero" width={120} height={120} />
				</motion.div>
				<motion.h1
					className="font-medium text-3xl md:text-5xl text-center max-w-xl tracking-tight md:leading-tight"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					Add Subscriptions Without the Headache
				</motion.h1>
				<motion.p
					className="text-center max-w-xl pt-6 md:pt-11 leading-normal opacity-80"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					Chiron is an open-source TypeScript library that lets you integrate
					Stripe, Google Play, App Store, and more with just a few lines of
					code. Keep full control over your subscription logic and data—no
					third-party platforms. Self-hosted, customizable, and free from vendor
					lock-in.
				</motion.p>
				<motion.div
					className="flex gap-8 pt-10 md:pt-16 items-center"
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<Link
						href="https://docs.google.com/forms/d/e/1FAIpQLScBVsXknhdjoC3CABRfTRSJ11ATFoqWXdEWtei7Q7JntqG4gw/viewform?usp=header"
						className="dark:bg-white flex gap-2 font-medium dark:text-black px-5 py-3 rounded-full dark:hover:bg-white/80 bg-black hover:bg-black/80 text-white"
					>
						<span>Join the waitlist</span>
						<ArrowUpRight />
					</Link>
					<Link
						href="https://github.com/voidhashcom/chiron"
						className="hover:opacity-80 dark:text-white text-black"
					>
						<GithubIcon width={24} height={24} alt="Github" />
					</Link>
				</motion.div>
			</div>
		</main>
	);
}
