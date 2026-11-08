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
import { footerNavLinks, navGroups } from "@/components/app-shared";
import { Link } from "react-router-dom";
import { SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSidebar({
    pathname = "/dashboard",
    onRegenerate
}) {
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
								className="min-w-8 bg-primary text-on-primary duration-200 ease-linear hover:bg-primary-hover active:bg-primary-hover cursor-pointer"
								tooltip="Regenerate Plan"
							>
								<SparklesIcon className="size-4 shrink-0" />
								<span>⚡ Regenerate Plan</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarGroup>
				)}
				{navGroups.map((group, index) => (
					<NavGroup
						key={`sidebar-group-${index}`}
						{...group}
						pathname={pathname}
					/>
				))}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu className="mt-2">
					{footerNavLinks.map((item) => {
						const isActive = pathname === item.path || (item.path === '/admin' && pathname?.startsWith('/admin'));
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton
									asChild
									isActive={isActive}
									size="sm"
									className={cn(
										isActive
											? "bg-primary-soft text-on-primary-soft font-semibold [&>svg]:text-primary"
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
		</Sidebar>
	);
}
