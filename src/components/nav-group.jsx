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

function isItemActive(itemPath, currentPath) {
	if (!currentPath || !itemPath) return false;
	if (itemPath === currentPath) return true;
	const cleanCurrent = currentPath.split("?")[0];
	const cleanItem = itemPath.split("?")[0];

	if (itemPath.includes("tab=saved")) {
		return currentPath.includes("tab=saved");
	}
	if (cleanItem === "/profile") {
		return cleanCurrent === "/profile" && !currentPath.includes("tab=saved");
	}
	if (cleanItem === "/dashboard") {
		return cleanCurrent === "/dashboard" || cleanCurrent.startsWith("/meal/");
	}
	if (cleanItem === "/admin") {
		return cleanCurrent.startsWith("/admin");
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
