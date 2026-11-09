import {
	LayoutGridIcon,
	BookmarkIcon,
	UserIcon,
	ShieldAlertIcon,
	ActivityIcon,
	SparklesIcon,
	SlidersHorizontalIcon,
	CoinsIcon,
	CheckSquareIcon,
	FlaskConicalIcon,
} from "lucide-react";

export const customerNavGroups = [
	{
		label: "Menu",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <LayoutGridIcon className="size-4 shrink-0" />,
			},
			{
				title: "Saved meals",
				path: "/saved",
				icon: <BookmarkIcon className="size-4 shrink-0" />,
			},
			{
				title: "My profile",
				path: "/profile",
				icon: <UserIcon className="size-4 shrink-0" />,
			},
		],
	},
];

export const adminNavGroups = [
	{
		label: "Admin Portal",
		items: [
			{
				title: "Admin Overview",
				path: "/admin",
				icon: <ShieldAlertIcon className="size-4 shrink-0" />,
			},
			{
				title: "Functions & APIs",
				path: "/admin#functions",
				icon: <ActivityIcon className="size-4 shrink-0" />,
			},
			{
				title: "Gemini",
				path: "/admin#gemini",
				icon: <SparklesIcon className="size-4 shrink-0" />,
			},
			{
				title: "Edamam",
				path: "/admin#edamam",
				icon: <ActivityIcon className="size-4 shrink-0" />,
			},
			{
				title: "Recommendation settings",
				path: "/admin#settings",
				icon: <SlidersHorizontalIcon className="size-4 shrink-0" />,
			},
			{
				title: "Safety thresholds",
				path: "/admin#safety",
				icon: <ShieldAlertIcon className="size-4 shrink-0" />,
			},
			{
				title: "Ingredient prices",
				path: "/admin#prices",
				icon: <CoinsIcon className="size-4 shrink-0" />,
			},
			{
				title: "Setup checklist",
				path: "/admin#checklist",
				icon: <CheckSquareIcon className="size-4 shrink-0" />,
			},
			{
				title: "Evaluation",
				path: "/admin#evaluation",
				icon: <FlaskConicalIcon className="size-4 shrink-0" />,
			},
		],
	},
	{
		label: "Customer View",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <LayoutGridIcon className="size-4 shrink-0" />,
			},
		],
	},
];

export const userNavGroups = customerNavGroups;
export const navGroups = customerNavGroups;

export const userFooterNavLinks = [];
export const adminFooterNavLinks = [];
export const footerNavLinks = [];

export const navLinks = [
	...customerNavGroups.flatMap((group) => group.items),
	...adminNavGroups.flatMap((group) => group.items),
];
