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
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

function isItemActive(itemPath, currentPath) {
	if (!currentPath || !itemPath) return false;
	if (itemPath === currentPath) return true;

	if (itemPath.includes("#")) {
		return currentPath === itemPath;
	}

	const cleanCurrent = currentPath.split("?")[0].split("#")[0];
	const cleanItem = itemPath.split("?")[0].split("#")[0];

	if (cleanItem === ROUTES.customer.saved) {
		return cleanCurrent === ROUTES.customer.saved;
	}
	if (cleanItem === ROUTES.customer.profile) {
		return cleanCurrent === ROUTES.customer.profile;
	}
	if (cleanItem === ROUTES.customer.dashboard) {
		return cleanCurrent === ROUTES.customer.dashboard ||
			cleanCurrent.startsWith(ROUTES.customer.mealPrefix);
	}
	if (cleanItem === ROUTES.admin.dashboard) {
		return cleanCurrent === ROUTES.admin.dashboard && !currentPath.includes("#");
	}
	return cleanCurrent === cleanItem;
}

export function NavGroup({
    label,
    items,
    pathname
}) {
	return (
		<SidebarGroup>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
			<SidebarMenu>
				{items.map((item) => {
					const active = isItemActive(item.path, pathname);
					const hasActiveSub = item.subItems?.some((subItem) => isItemActive(subItem.path, pathname));

					return (
						<Collapsible
							asChild
							className="group/collapsible"
							defaultOpen={active || hasActiveSub}
							key={item.title}
						>
							<SidebarMenuItem>
								{item.subItems?.length ? (
									<>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton
												isActive={active}
												className={cn(
													active && "bg-primary text-on-primary font-semibold shadow-xs [&>svg]:text-on-primary hover:bg-primary-hover hover:text-on-primary data-active:bg-primary data-active:text-on-primary"
												)}
											>
												{item.icon}
												<span>{item.title}</span>
												<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
											</SidebarMenuButton>
										</CollapsibleTrigger>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.subItems?.map((subItem) => {
													const subActive = isItemActive(subItem.path, pathname);
													return (
														<SidebarMenuSubItem key={subItem.title}>
															<SidebarMenuSubButton
																asChild
																isActive={subActive}
																className={cn(
																	subActive && "bg-primary text-on-primary font-medium [&>svg]:text-on-primary hover:bg-primary-hover hover:text-on-primary data-active:bg-primary data-active:text-on-primary"
																)}
															>
																<Link to={subItem.path}>
																	{subItem.icon}
																	<span>{subItem.title}</span>
																</Link>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													);
												})}
											</SidebarMenuSub>
										</CollapsibleContent>
									</>
								) : (
									<SidebarMenuButton
										asChild
										isActive={active}
										className={cn(
											active && "bg-primary text-on-primary font-semibold shadow-xs [&>svg]:text-on-primary hover:bg-primary-hover hover:text-on-primary data-active:bg-primary data-active:text-on-primary"
										)}
									>
										<Link to={item.path}>
											{item.icon}
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								)}
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
