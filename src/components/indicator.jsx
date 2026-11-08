import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const statusIndicatorVariants = cva(
	[
		"relative flex size-2 shrink-0 items-center justify-center rounded-full",
		"*:rounded-full *:bg-current",
		"[&_[data-slot=indicator-dot]]:size-[75%]",
		"[&_[data-slot=indicator-ping]]:absolute [&_[data-slot=indicator-ping]]:size-full",
	],
	{
		variants: {
			color: {
				emerald: "text-primary",
				rose: "text-danger-fg",
				amber: "text-warn-fg",
				sky: "text-muted",
			},
			pulse: {
				true: "[&_[data-slot=indicator-ping]]:animate-ping",
				false: "[&_[data-slot=indicator-ping]]:hidden",
			},
		},
		defaultVariants: {
			color: "emerald",
			pulse: true,
		},
	}
);

export function StatusIndicator({
    className,
    color,
    pulse,
    ...props
}) {
	return (
		<span
			className={cn(statusIndicatorVariants({ color, pulse }), className)}
			{...props}
		>
			<span aria-hidden data-slot="indicator-ping" />
			<span aria-hidden data-slot="indicator-dot" />
		</span>
	);
}
