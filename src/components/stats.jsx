import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";

const stats = [
	{
		label: "Open queue",
		value: "38",
		delta: -12.4,
		footnote: "vs yesterday",
		lowerIsBetter: true,
	},
	{
		label: "Active conversations",
		value: "126",
		delta: 5.2,
		footnote: "vs last week",
		lowerIsBetter: false,
	},
	{
		label: "Median first reply",
		value: "4.1m",
		delta: -8.0,
		footnote: "vs last week",
		lowerIsBetter: true,
	},
	{
		label: "CSAT (30d)",
		value: "94%",
		delta: 1.1,
		footnote: "vs prior 30d",
		lowerIsBetter: false,
	},
];

export function DashboardStats({ items = stats }) {
	return (
		<>
			{items.map((s) => (
				<Card className={cn("shadow-none border border-line bg-surface")} key={s.label}>
					<CardHeader className="pb-2">
						<CardTitle className="font-medium text-muted text-xs tracking-wide">
							{s.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-1.5">
						<p className="font-bold text-xl sm:text-2xl text-fg tabular-nums">{s.value}</p>
						<div className="flex items-center gap-1.5 text-xs">
							{s.delta !== undefined && (
								<Delta value={s.delta}>
									<DeltaIcon />
									<DeltaValue />
								</Delta>
							)}
							{s.footnote && <span className="text-muted text-[11px] font-medium truncate">{s.footnote}</span>}
						</div>
					</CardContent>
				</Card>
			))}
		</>
	);
}
