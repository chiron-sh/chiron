"use client";
import { Check, Copy } from "lucide-react";
import {
	type ButtonHTMLAttributes,
	type HTMLAttributes,
	type ReactNode,
	forwardRef,
	useCallback,
	useRef,
} from "react";
import { cn } from "../lib/cn";
import { ScrollArea, ScrollBar, ScrollViewport } from "./ui/scroll-area";
import { useCopyButton } from "../lib/use-copy-button";
import { buttonVariants } from "./ui/button";
import type { ScrollAreaViewportProps } from "@radix-ui/react-scroll-area";

export type CodeBlockProps = HTMLAttributes<HTMLElement> & {
	/**
	 * Icon of code block
	 *
	 * When passed as a string, it assumes the value is the HTML of icon
	 */
	icon?: ReactNode;

	/**
	 * Allow to copy code with copy button
	 *
	 * @defaultValue true
	 */
	allowCopy?: boolean;

	/**
	 * Keep original background color generated by Shiki or Rehype Code
	 *
	 * @defaultValue false
	 */
	keepBackground?: boolean;

	viewportProps?: ScrollAreaViewportProps;
};

export const Pre = forwardRef<HTMLPreElement, HTMLAttributes<HTMLPreElement>>(
	({ className, ...props }, ref) => {
		return (
			<pre
				ref={ref}
				className={cn("p-4 focus-visible:outline-none", className)}
				{...props}
			>
				{props.children}
			</pre>
		);
	}
);

Pre.displayName = "Pre";

export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(
	(
		{
			title,
			allowCopy = true,
			keepBackground = false,
			icon,
			viewportProps,
			...props
		},
		ref
	) => {
		const areaRef = useRef<HTMLDivElement>(null);
		const onCopy = useCallback(() => {
			const pre = areaRef.current?.getElementsByTagName("pre").item(0);

			if (!pre) return;

			const clone = pre.cloneNode(true) as HTMLElement;
			clone.querySelectorAll(".nd-copy-ignore").forEach((node) => {
				node.remove();
			});

			void navigator.clipboard.writeText(clone.textContent ?? "");
		}, []);

		return (
			<figure
				ref={ref}
				{...props}
				className={cn(
					"not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm",
					keepBackground && "bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)",
					props.className
				)}
			>
				{title ? (
					<div className="flex flex-row items-center gap-2 border-b bg-fd-muted px-4 py-1.5">
						{icon ? (
							<div
								className="text-fd-muted-foreground [&_svg]:size-3.5"
								dangerouslySetInnerHTML={
									typeof icon === "string"
										? {
												__html: icon,
											}
										: undefined
								}
							>
								{typeof icon !== "string" ? icon : null}
							</div>
						) : null}
						<figcaption className="flex-1 truncate text-fd-muted-foreground">
							{title}
						</figcaption>
						{allowCopy ? (
							<CopyButton className="-me-2" onCopy={onCopy} />
						) : null}
					</div>
				) : (
					allowCopy && (
						<CopyButton
							className="absolute right-2 top-2 z-[2] backdrop-blur-md"
							onCopy={onCopy}
						/>
					)
				)}
				<ScrollArea ref={areaRef} dir="ltr">
					<ScrollViewport
						{...viewportProps}
						className={cn("max-h-[600px]", viewportProps?.className)}
					>
						{props.children}
					</ScrollViewport>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</figure>
		);
	}
);

CodeBlock.displayName = "CodeBlock";

function CopyButton({
	className,
	onCopy,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	onCopy: () => void;
}) {
	const [checked, onClick] = useCopyButton(onCopy);

	return (
		<button
			type="button"
			className={cn(
				buttonVariants({
					color: "ghost",
				}),
				"transition-opacity group-hover:opacity-100 [&_svg]:size-3.5",
				!checked && "[@media(hover:hover)]:opacity-0",
				className
			)}
			aria-label={checked ? "Copied Text" : "Copy Text"}
			onClick={onClick}
			{...props}
		>
			<Check className={cn("transition-transform", !checked && "scale-0")} />
			<Copy
				className={cn("absolute transition-transform", checked && "scale-0")}
			/>
		</button>
	);
}
