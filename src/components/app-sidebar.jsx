import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { adminNavGroups, customerNavGroups } from "@/components/app-shared";
import { SparklesIcon, LogOutIcon, ArrowLeftIcon } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import ConfirmModal from "@/components/ConfirmModal";
import { ROUTES } from "@/lib/routes";

export function AppSidebar({
    pathname = ROUTES.customer.dashboard,
    onRegenerate,
    onAdminAction,
}) {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

	const isAdminRoute = pathname?.startsWith("/admin");
	const groups = isAdminRoute ? adminNavGroups : customerNavGroups;

	async function handleConfirmLogout() {
		setShowLogoutConfirm(false);
		try {
			await logout();
		} finally {
			navigate(isAdminRoute ? ROUTES.admin.login : ROUTES.customer.login, { replace: true });
		}
	}

	return (
		<Sidebar collapsible="icon" variant="inset">
			<SidebarHeader className="h-14 justify-center">
				<SidebarMenuButton asChild>
					<Link
						to={isAdminRoute ? ROUTES.admin.dashboard : ROUTES.customer.dashboard}
						className="flex items-center gap-2"
					>
						<LogoMark className="size-6" />
						<span className="font-bold text-fg tracking-tight">
							Chop<span className="text-primary">Wise</span>
						</span>
					</Link>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				{onRegenerate && !isAdminRoute && (
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
				{isAdminRoute && onAdminAction && (
					<SidebarGroup>
						<SidebarMenuItem className="flex items-center gap-2">
							<SidebarMenuButton
								onClick={onAdminAction}
								className="min-w-8 bg-primary text-on-primary duration-200 ease-linear hover:bg-primary-hover hover:text-on-primary active:bg-primary-hover active:text-on-primary cursor-pointer [&>span]:text-on-primary [&>svg]:text-on-primary"
								tooltip="Run Health Check"
							>
								<SparklesIcon className="size-4 shrink-0 text-on-primary" />
								<span className="text-on-primary font-semibold">⚡ Run Health Check</span>
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
			<SidebarFooter className="border-t border-line p-3 space-y-2">
				{isAdminRoute && (
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="w-full text-muted font-medium hover:bg-surface-muted hover:text-primary cursor-pointer flex items-center gap-2 [&>svg]:text-muted group-hover:[&>svg]:text-primary"
								tooltip="Customer App"
							>
								<Link to={ROUTES.customer.dashboard}>
									<ArrowLeftIcon className="size-4 shrink-0" />
									<span className="font-medium text-xs">Customer App</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				)}
				<div className="flex items-center justify-between gap-2 px-1">
					<span className="text-xs font-semibold text-fg">Theme</span>
					<ThemeToggle showLabel={true} className="w-auto h-8 text-xs" />
				</div>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => setShowLogoutConfirm(true)}
							className="w-full text-danger-fg font-medium hover:bg-danger-bg hover:text-danger-fg cursor-pointer flex items-center gap-2 [&>svg]:text-danger-fg"
						>
							<LogOutIcon className="size-4 shrink-0 text-danger-fg" />
							<span className="font-medium text-danger-fg">Log out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<ConfirmModal
					isOpen={showLogoutConfirm}
					onClose={() => setShowLogoutConfirm(false)}
					onConfirm={handleConfirmLogout}
					title="Log out of ChopWise?"
					message="Are you sure you want to log out? You will need to sign in again to access your meal plans."
					confirmText="Log out"
					variant="danger"
					icon="🚪"
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
