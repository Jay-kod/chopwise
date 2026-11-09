import {
	LayoutGridIcon,
	BookmarkIcon,
	UserIcon,
	SlidersHorizontalIcon,
	ShieldAlertIcon,
	ActivityIcon,
} from "lucide-react";

export const userNavGroups = [
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
];

export const adminNavGroups = [
	{
		label: "Admin Controls",
		items: [
			{
				title: "Admin Overview",
				path: "/admin",
				icon: <ShieldAlertIcon className="size-4 shrink-0" />,
			},
			{
				title: "API Integrations",
				path: "/admin#integrations",
				icon: <ActivityIcon className="size-4 shrink-0" />,
			},
		],
	},
	{
		label: "Navigation",
		items: [
			{
				title: "User Dashboard",
				path: "/dashboard",
				icon: <LayoutGridIcon className="size-4 shrink-0" />,
			},
		],
	},
];

// navGroups defaults to userNavGroups so the user sidebar never contains Admin Portal
export const navGroups = userNavGroups;

export const userFooterNavLinks = [];

export const adminFooterNavLinks = [
	{
		title: "User Dashboard",
		path: "/dashboard",
		icon: <LayoutGridIcon className="size-4 shrink-0" />,
	},
];

export const footerNavLinks = userFooterNavLinks;

export const navLinks = [
	...userNavGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...adminNavGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
];
