"use client";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
					className="font-medium text-3xl md:text-5xl text-center max-w-2xl tracking-tight md:leading-tight text-balance"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					The universal subscription management framework
				</motion.h1>
				<motion.p
					className="text-center max-w-xl pt-6 md:pt-11 leading-normal text-balance"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 0.8, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					Chiron is an open-source TypeScript library that lets you integrate
					Stripe with just a few lines of code.
				</motion.p>
				<motion.div
					className="flex gap-8 pt-10 md:pt-16 items-center"
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					<Link
						href="/docs"
						className="dark:bg-white flex gap-2 font-medium dark:text-black px-5 py-3 rounded-full dark:hover:bg-white/80 bg-black hover:bg-black/80 text-white"
					>
						<span>Get started</span>
						<ArrowRight />
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
