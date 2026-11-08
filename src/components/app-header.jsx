"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { navLinks } from "@/components/app-shared";
import { NavUser } from "@/components/nav-user";
import ThemeToggle from "@/components/ThemeToggle";

export function AppHeader({
    pathname = "/dashboard"
}) {
	const cleanPath = (pathname || "").split("?")[0];
	const activeItem = navLinks.find((item) => item.path === pathname) ||
		navLinks.find((item) => item.path === cleanPath) ||
		(cleanPath.startsWith("/meal/")
			? { title: "Recipe Details" }
			: { title: "Personalised Meal Plan" });
	return (
		<header
			className={cn(
				"sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-4 md:px-6"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center hidden sm:block"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>
			<div className="flex items-center gap-2 sm:gap-3">
				<ThemeToggle />
				<Separator
					className="h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<NavUser />
			</div>
		</header>
	);
}
