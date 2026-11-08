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
					{footerNavLinks.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								className="text-muted-foreground"
								isActive={item.path === pathname}
								size="sm"
							>
								<Link to={item.path}>
									{item.icon}
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
