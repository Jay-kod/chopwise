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
				title: "Overview",
				path: ROUTES.admin.dashboard,
				icon: <LayoutGridIcon className="size-4 shrink-0" />,
			},
			{
				title: "Functions & APIs",
				path: ROUTES.admin.functions,
				icon: <ActivityIcon className="size-4 shrink-0" />,
			},
			{
				title: "Gemini AI",
				path: ROUTES.admin.gemini,
				icon: <SparklesIcon className="size-4 shrink-0" />,
			},
			{
				title: "Edamam Nutrition",
				path: ROUTES.admin.edamam,
				icon: <ActivityIcon className="size-4 shrink-0" />,
			},
			{
				title: "Recommendation Settings",
				path: ROUTES.admin.settings,
				icon: <SlidersHorizontalIcon className="size-4 shrink-0" />,
			},
			{
				title: "Safety Thresholds",
				path: ROUTES.admin.safety,
				icon: <ShieldAlertIcon className="size-4 shrink-0" />,
			},
			{
				title: "Ingredient Prices",
				path: ROUTES.admin.prices,
				icon: <CoinsIcon className="size-4 shrink-0" />,
			},
			{
				title: "Setup Checklist",
				path: ROUTES.admin.checklist,
				icon: <CheckSquareIcon className="size-4 shrink-0" />,
			},
			{
				title: "Evaluation Suite",
				path: ROUTES.admin.evaluation,
				icon: <FlaskConicalIcon className="size-4 shrink-0" />,
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
