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
import { ROUTES } from "@/lib/routes";

export const customerNavGroups = [
	{
		label: "Menu",
		items: [
			{
				title: "Dashboard",
				path: ROUTES.customer.dashboard,
				icon: <LayoutGridIcon className="size-4 shrink-0" />,
			},
			{
				title: "Saved meals",
				path: ROUTES.customer.saved,
				icon: <BookmarkIcon className="size-4 shrink-0" />,
			},
			{
				title: "My profile",
				path: ROUTES.customer.profile,
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
				path: ROUTES.admin.dashboard,
				icon: <ShieldAlertIcon className="size-4 shrink-0" />,
			},
			{
				title: "Functions & APIs",
				path: `${ROUTES.admin.dashboard}#functions`,
				icon: <ActivityIcon className="size-4 shrink-0" />,
			},
			{
				title: "Gemini",
				path: `${ROUTES.admin.dashboard}#gemini`,
				icon: <SparklesIcon className="size-4 shrink-0" />,
			},
			{
				title: "Edamam",
				path: `${ROUTES.admin.dashboard}#edamam`,
				icon: <ActivityIcon className="size-4 shrink-0" />,
			},
			{
				title: "Recommendation settings",
				path: `${ROUTES.admin.dashboard}#settings`,
				icon: <SlidersHorizontalIcon className="size-4 shrink-0" />,
			},
			{
				title: "Safety thresholds",
				path: `${ROUTES.admin.dashboard}#safety`,
				icon: <ShieldAlertIcon className="size-4 shrink-0" />,
			},
			{
				title: "Ingredient prices",
				path: `${ROUTES.admin.dashboard}#prices`,
				icon: <CoinsIcon className="size-4 shrink-0" />,
			},
			{
				title: "Setup checklist",
				path: `${ROUTES.admin.dashboard}#checklist`,
				icon: <CheckSquareIcon className="size-4 shrink-0" />,
			},
			{
				title: "Evaluation",
				path: `${ROUTES.admin.dashboard}#evaluation`,
				icon: <FlaskConicalIcon className="size-4 shrink-0" />,
			},
		],
	},
	{
		label: "Customer View",
		items: [
			{
				title: "Dashboard",
				path: ROUTES.customer.dashboard,
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
