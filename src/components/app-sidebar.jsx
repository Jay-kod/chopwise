import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogoMark } from "@/components/Logo";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/nav-group";
import { adminNavGroups, customerNavGroups } from "@/components/app-shared";
import { LogOutIcon } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import ConfirmModal from "@/components/ConfirmModal";
import { ROUTES } from "@/lib/routes";

export function AppSidebar({
    pathname = ROUTES.customer.dashboard,
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
				{groups.map((group, index) => (
					<NavGroup
						key={`sidebar-group-${index}`}
						{...group}
						pathname={pathname}
					/>
				))}
			</SidebarContent>
			<SidebarFooter className="border-t border-line p-2">
				<SidebarMenu>
					{/* Log Out as the sole Sidebar Footer Item */}
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => setShowLogoutConfirm(true)}
							className="w-full cursor-pointer text-muted hover:bg-danger-bg hover:text-danger-fg transition-colors group-data-[collapsible=icon]:text-muted flex items-center gap-2"
							tooltip="Log out"
						>
							<LogOutIcon className="size-4 shrink-0 transition-colors" />
							<span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
								Log out
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>

				<ConfirmModal
					isOpen={showLogoutConfirm}
					onClose={() => setShowLogoutConfirm(false)}
					onConfirm={handleConfirmLogout}
					title="Log out of ChopWise?"
					message={
						isAdminRoute
							? "Are you sure you want to log out? You will need to sign in again to access the administrator portal."
							: "Are you sure you want to log out? You will need to sign in again to access your meal plans."
					}
					confirmText="Log out"
					variant="danger"
					icon="🚪"
				/>
			</SidebarFooter>
		</Sidebar>
	);
}
