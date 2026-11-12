"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { navLinks } from "@/components/app-shared";
import { NavUser } from "@/components/nav-user";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import LiveClock from "@/components/LiveClock";
import { ROUTES } from "@/lib/routes";

export function AppHeader({
    pathname = ROUTES.customer.dashboard
}) {
	const cleanPath = (pathname || "").split("?")[0].split("#")[0];
	const activeItem = navLinks.find((item) => item.path === pathname) ||
		navLinks.find((item) => item.path === cleanPath) ||
		(cleanPath.startsWith(ROUTES.customer.mealPrefix)
			? { title: "Recipe Details" }
			: { title: "Personalised Meal Plan" });
	return (
		<header
			className={cn(
				"sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-3 sm:px-4 md:px-6"
			)}
		>
			<div className="flex items-center gap-2 sm:gap-3 min-w-0">
				<CustomSidebarTrigger />
				<Separator
					className="mr-1 h-4 data-[orientation=vertical]:self-center hidden sm:block"
					orientation="vertical"
				/>
				<div className="truncate min-w-0">
					<AppBreadcrumbs page={activeItem} />
				</div>
			</div>
			<div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
				<div className="hidden lg:flex items-center">
					<LiveClock />
				</div>
				<NotificationBell />
				<ThemeToggle />
				<Separator
					className="h-4 data-[orientation=vertical]:self-center hidden sm:block"
					orientation="vertical"
				/>
				<NavUser />
			</div>
		</header>
	);
}
