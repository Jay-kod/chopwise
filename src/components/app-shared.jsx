import {
	LayoutGridIcon,
	BookmarkIcon,
	UserIcon,
	SlidersHorizontalIcon,
	ShieldAlertIcon,
	ActivityIcon,
} from "lucide-react";

export const navGroups = [
	{
		label: "Meal Planning",
		items: [
			{
				title: "Meal Recommendations",
				path: "/dashboard",
				icon: <LayoutGridIcon className="size-4 shrink-0" />,
			},
			{
				title: "Saved Recipes",
				path: "/profile?tab=saved",
				icon: <BookmarkIcon className="size-4 shrink-0" />,
			},
		],
	},
	{
		label: "Health & Preferences",
		items: [
			{
				title: "Dietary Profile",
				path: "/profile",
				icon: <UserIcon className="size-4 shrink-0" />,
			},
			{
				title: "Update Food Budget",
				path: "/onboarding",
				icon: <SlidersHorizontalIcon className="size-4 shrink-0" />,
			},
		],
	},
	{
		label: "Administration",
		items: [
			{
				title: "Admin Portal",
				path: "/admin",
				icon: <ShieldAlertIcon className="size-4 shrink-0" />,
			},
		],
	},
];

export const footerNavLinks = [
	{
		title: "System Status",
		path: "/admin",
		icon: <ActivityIcon className="size-4 shrink-0" />,
	},
];

export const navLinks = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
