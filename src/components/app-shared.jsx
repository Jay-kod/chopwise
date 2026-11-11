import {
	LayoutGridIcon,
	UtensilsIcon,
	HeartIcon,
	BookmarkIcon,
	UserIcon,
	ShieldAlertIcon,
	ActivityIcon,
	SparklesIcon,
	SlidersHorizontalIcon,
	CoinsIcon,
	CheckSquareIcon,
	FlaskConicalIcon,
	BookOpenIcon,
	UsersIcon,
	ClipboardListIcon,
	UserCogIcon,
	WrenchIcon,
	PlugZapIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

export const customerNavGroups = [
	{
		label: "Planning & Insights",
		category: "planning",
		items: [
			{
				title: "Dashboard",
				path: ROUTES.customer.dashboard,
				icon: <LayoutGridIcon className="size-4 shrink-0" />,
			},
			{
				title: "Meal Analysis",
				path: ROUTES.customer.analysis,
				icon: <ActivityIcon className="size-4 shrink-0" />,
			},
		],
	},
	{
		label: "Meals & Recipes",
		category: "meals",
		items: [
			{
				title: "Meals",
				path: ROUTES.customer.meals,
				icon: <UtensilsIcon className="size-4 shrink-0" />,
			},
			{
				title: "Favourite meals",
				path: ROUTES.customer.saved,
				icon: <HeartIcon className="size-4 shrink-0" />,
			},
			{
				title: "Recipe Catalogue",
				path: ROUTES.customer.recipes,
				icon: <BookOpenIcon className="size-4 shrink-0" />,
			},
		],
	},
	{
		label: "Account & Health",
		category: "health",
		items: [
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
		label: "Overview & Monitoring",
		category: "planning",
		items: [
			{
				title: "Admin Dashboard",
				path: ROUTES.admin.dashboard,
				icon: <LayoutGridIcon className="size-4 shrink-0" />,
			},
			{
				title: "System Analysis",
				path: ROUTES.admin.analysis,
				icon: <ActivityIcon className="size-4 shrink-0" />,
			},
			{
				title: "Evaluation Suite",
				path: ROUTES.admin.evaluation,
				icon: <FlaskConicalIcon className="size-4 shrink-0" />,
			},
			{
				title: "Activity History",
				path: ROUTES.admin.activity,
				icon: <ClipboardListIcon className="size-4 shrink-0" />,
			},
		],
	},
	{
		label: "Food & User Operations",
		category: "meals",
		items: [
			{
				title: "Recipe Catalogue",
				path: ROUTES.admin.recipes,
				icon: <BookOpenIcon className="size-4 shrink-0" />,
			},
			{
				title: "Customer Accounts",
				path: ROUTES.admin.customers,
				icon: <UsersIcon className="size-4 shrink-0" />,
			},
			{
				title: "Ingredient Prices",
				path: ROUTES.admin.prices,
				icon: <CoinsIcon className="size-4 shrink-0" />,
			},
		],
	},
	{
		label: "AI & Clinical Engine",
		category: "engine",
		items: [
			{
				title: "API Integrations",
				path: ROUTES.admin.integrations,
				icon: <PlugZapIcon className="size-4 shrink-0" />,
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
		],
	},
	{
		label: "Governance & Tools",
		category: "governance",
		items: [
			{
				title: "Administrator Access",
				path: ROUTES.admin.access,
				icon: <UserCogIcon className="size-4 shrink-0" />,
			},
			{
				title: "Setup Checklist",
				path: ROUTES.admin.checklist,
				icon: <CheckSquareIcon className="size-4 shrink-0" />,
			},
			{
				title: "Maintenance",
				path: ROUTES.admin.maintenance,
				icon: <WrenchIcon className="size-4 shrink-0" />,
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
