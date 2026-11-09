import { LogoMark } from "@/components/Logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/nav-group";
import {
	adminFooterNavLinks,
	adminNavGroups,
	userFooterNavLinks,
	userNavGroups,
} from "@/components/app-shared";
import { Link } from "react-router-dom";
import { SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar({
    pathname = "/dashboard",
    onRegenerate
}) {
	const isAdminRoute = pathname?.startsWith("/admin");
	const groups = isAdminRoute ? adminNavGroups : userNavGroups;
	const footerLinks = isAdminRoute ? adminFooterNavLinks : userFooterNavLinks;

	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader className="h-14 justify-center">
				<SidebarMenuButton asChild>
					<Link to="/dashboard" className="flex items-center gap-2">
						<LogoMark className="size-6" />
						<span className="font-bold text-fg tracking-tight">
							Chop<span className="text-primary">Wise</span>
						</span>
					</Link>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				{onRegenerate && (
					<SidebarGroup>
						<SidebarMenuItem className="flex items-center gap-2">
							<SidebarMenuButton
								onClick={onRegenerate}
								className="min-w-8 bg-primary text-on-primary duration-200 ease-linear hover:bg-primary-hover hover:text-on-primary active:bg-primary-hover active:text-on-primary cursor-pointer [&>span]:text-on-primary [&>svg]:text-on-primary"
								tooltip="Regenerate Plan"
							>
								<SparklesIcon className="size-4 shrink-0 text-on-primary" />
								<span className="text-on-primary font-semibold">⚡ Regenerate Plan</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarGroup>
				)}
				{groups.map((group, index) => (
					<NavGroup
						key={`sidebar-group-${index}`}
						{...group}
						pathname={pathname}
					/>
				))}
			</SidebarContent>
			{footerLinks.length > 0 && (
				<SidebarFooter>
					<SidebarMenu className="mt-2">
						{footerLinks.map((item) => {
							const isActive = pathname === item.path || (item.path === '/admin' && pathname?.startsWith('/admin'));
							return (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={isActive}
										size="sm"
										className={cn(
											isActive
												? "bg-primary text-on-primary font-semibold [&>svg]:text-on-primary hover:bg-primary-hover hover:text-on-primary data-active:bg-primary data-active:text-on-primary"
												: "text-muted"
										)}
									>
										<Link to={item.path}>
											{item.icon}
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarFooter>
			)}
		</Sidebar>
	);
}
