import { cn } from "cn";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";

export function isItemActive(itemPath, currentPath) {
	if (!currentPath || !itemPath) return false;
	if (itemPath === currentPath) return true;

	if (itemPath.includes("#")) {
		return currentPath === itemPath;
	}

	const cleanCurrent = currentPath.split("?")[0].split("#")[0];
	const cleanItem = itemPath.split("?")[0].split("#")[0];

	if (cleanItem === ROUTES.customer.meals) {
		return cleanCurrent === ROUTES.customer.meals;
	}
	if (cleanItem === ROUTES.customer.saved) {
		return cleanCurrent === ROUTES.customer.saved;
	}
	if (cleanItem === ROUTES.customer.recipes) {
		return cleanCurrent === ROUTES.customer.recipes;
	}
	if (cleanItem === ROUTES.customer.profile) {
		return cleanCurrent === ROUTES.customer.profile;
	}
	if (cleanItem === ROUTES.customer.dashboard) {
		return cleanCurrent === ROUTES.customer.dashboard ||
			cleanCurrent.startsWith(ROUTES.customer.mealPrefix);
	}
	if (cleanItem === ROUTES.admin.dashboard) {
		return cleanCurrent === ROUTES.admin.dashboard || cleanCurrent === '/admin';
	}
	return cleanCurrent === cleanItem;
}

export function navItemClassName(active, subItem = false) {
	return cn(
		"relative min-h-11 rounded-md px-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
		subItem && "min-h-11",
		active
			? "bg-surface-muted pl-4 font-semibold text-fg shadow-xs before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-primary [&>svg]:text-primary hover:bg-surface-muted hover:text-fg data-active:bg-surface-muted data-active:text-fg"
			: "font-medium text-fg hover:bg-surface-muted hover:text-fg [&>svg]:text-muted group-hover/menu-button:[&>svg]:text-fg"
	);
}

export const CATEGORY_STYLES = {
	planning: {
		badge: "bg-cat-planning-bg text-cat-planning-fg border-cat-planning-line",
		dot: "bg-cat-planning-dot",
		icon: "[&>svg]:text-cat-planning-fg group-hover/menu-button:[&>svg]:text-cat-planning-dot",
	},
	meals: {
		badge: "bg-cat-meals-bg text-cat-meals-fg border-cat-meals-line",
		dot: "bg-cat-meals-dot",
		icon: "[&>svg]:text-cat-meals-fg group-hover/menu-button:[&>svg]:text-cat-meals-dot",
	},
	health: {
		badge: "bg-cat-health-bg text-cat-health-fg border-cat-health-line",
		dot: "bg-cat-health-dot",
		icon: "[&>svg]:text-cat-health-fg group-hover/menu-button:[&>svg]:text-cat-health-dot",
	},
	engine: {
		badge: "bg-cat-engine-bg text-cat-engine-fg border-cat-engine-line",
		dot: "bg-cat-engine-dot",
		icon: "[&>svg]:text-cat-engine-fg group-hover/menu-button:[&>svg]:text-cat-engine-dot",
	},
	governance: {
		badge: "bg-cat-governance-bg text-cat-governance-fg border-cat-governance-line",
		dot: "bg-cat-governance-dot",
		icon: "[&>svg]:text-cat-governance-fg group-hover/menu-button:[&>svg]:text-cat-governance-dot",
	},
};

export const DEFAULT_CATEGORY_STYLE = {
	badge: "bg-surface-muted text-muted border-line",
	dot: "bg-muted",
	icon: "[&>svg]:text-muted group-hover/menu-button:[&>svg]:text-fg",
};

function NavSingleItem({ item, pathname, categoryTheme }) {
	const active = isItemActive(item.path, pathname);
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={active}
				className={cn(navItemClassName(active), !active && categoryTheme?.icon)}
			>
				<Link to={item.path} aria-current={active ? "page" : undefined}>
					{item.icon}
					<span>{item.title}</span>
					{active && <ChevronRightIcon aria-hidden="true" className="ml-auto size-4" />}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

function NavCollapsibleItem({ item, pathname, categoryTheme }) {
	const active = isItemActive(item.path, pathname);
	const hasActiveSub = item.subItems?.some((subItem) => isItemActive(subItem.path, pathname));

	return (
		<Collapsible
			asChild
			className="group/collapsible"
			defaultOpen={active || hasActiveSub}
		>
			<SidebarMenuItem>
				<CollapsibleTrigger asChild>
					<SidebarMenuButton
						isActive={active}
						className={cn(navItemClassName(active), !active && categoryTheme?.icon)}
					>
						{item.icon}
						<span>{item.title}</span>
						<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
					</SidebarMenuButton>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<SidebarMenuSub>
						{item.subItems.map((subItem) => {
							const subActive = isItemActive(subItem.path, pathname);
							return (
								<SidebarMenuSubItem key={subItem.title}>
									<SidebarMenuSubButton
										asChild
										isActive={subActive}
										className={cn(navItemClassName(subActive, true), !subActive && categoryTheme?.icon)}
									>
										<Link to={subItem.path} aria-current={subActive ? "page" : undefined}>
											{subItem.icon}
											<span>{subItem.title}</span>
											{subActive && <ChevronRightIcon aria-hidden="true" className="ml-auto size-4" />}
										</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							);
						})}
					</SidebarMenuSub>
				</CollapsibleContent>
			</SidebarMenuItem>
		</Collapsible>
	);
}

function NavMenuItem({ item, pathname, categoryTheme }) {
	if (!item.subItems?.length) {
		return <NavSingleItem item={item} pathname={pathname} categoryTheme={categoryTheme} />;
	}
	return <NavCollapsibleItem item={item} pathname={pathname} categoryTheme={categoryTheme} />;
}

export function NavGroup({
    label,
    category,
    items,
    pathname
}) {
	const theme = CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE;

	return (
		<SidebarGroup className="py-2">
			{label && (
				<SidebarGroupLabel className="h-auto px-2 py-1 mb-1">
					<span
						className={cn(
							"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-2xs",
							theme.badge
						)}
					>
						<span className={cn("size-1.5 rounded-full shrink-0", theme.dot)} />
						<span>{label}</span>
					</span>
				</SidebarGroupLabel>
			)}
			<SidebarMenu>
				{items.map((item) => (
					<NavMenuItem
						key={item.title}
						item={item}
						pathname={pathname}
						categoryTheme={theme}
					/>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
