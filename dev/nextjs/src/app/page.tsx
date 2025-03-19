import Navbar from "@/components/navbar";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col bg-black text-white">
			<Navbar />
			<main className="grow flex items-center justify-start container mx-auto">
				<div className="flex flex-col gap-8">
					<h1 className="text-6xl tracking-tight font-semibold">
						Development project
					</h1>
					<p className="text-zinc-400 text-xl">
						Develop features on a real world like project.
					</p>
				</div>
			</main>
		</div>
	);
}
