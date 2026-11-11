import { useState } from "react";
import {
	Avatar,
	AvatarFallback,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon, LogOutIcon, SparklesIcon } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmModal from "@/components/ConfirmModal";
import AvatarPickerModal from "@/features/auth/AvatarPickerModal";
import { AvatarDisplay } from "@/features/auth/preworkedAvatars";
import { ROUTES } from "@/lib/routes";

export function NavUser() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [showAvatarModal, setShowAvatarModal] = useState(false);

	const isAdminPortal = location.pathname.startsWith("/admin");
	const displayName = user?.name || user?.email?.split("@")[0] || (isAdminPortal ? "Admin" : "User");
	const email = user?.email || "";
	const initial = displayName.charAt(0).toUpperCase();

	async function handleLogout() {
		try {
			await logout();
		} finally {
			navigate(isAdminPortal ? ROUTES.admin.login : ROUTES.customer.login, { replace: true });
		}
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						aria-label="User menu"
						className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
					>
						<Avatar className="size-8 overflow-hidden">
							<AvatarFallback className="bg-primary text-on-primary font-semibold text-xs overflow-hidden">
								<AvatarDisplay avatarId={user?.avatar || user?.profile?.avatar} className="size-8" fallback={initial} />
							</AvatarFallback>
						</Avatar>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuGroup>
						<DropdownMenuLabel className="pointer-events-none flex items-center gap-2">
							<Avatar className="size-8 overflow-hidden">
								<AvatarFallback className="bg-primary text-on-primary font-semibold text-xs overflow-hidden">
									<AvatarDisplay avatarId={user?.avatar || user?.profile?.avatar} className="size-8" fallback={initial} />
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<span className="font-medium text-foreground block truncate">{displayName}</span>
								<div className="truncate text-muted-foreground text-xs">
									{email}
								</div>
							</div>
						</DropdownMenuLabel>
					</DropdownMenuGroup>
					{!isAdminPortal && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => setShowAvatarModal(true)} className="cursor-pointer">
									<SparklesIcon className="mr-2 size-4 text-primary" />
									Change Profile Picture
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => navigate(ROUTES.customer.profile)} className="cursor-pointer">
									<UserIcon className="mr-2 size-4" />
									Profile & Preferences
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setShowLogoutConfirm(true)} className="cursor-pointer text-danger-fg">
						<LogOutIcon className="mr-2 size-4" />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AvatarPickerModal
				isOpen={showAvatarModal}
				onClose={() => setShowAvatarModal(false)}
			/>

			<ConfirmModal
				isOpen={showLogoutConfirm}
				onClose={() => setShowLogoutConfirm(false)}
				onConfirm={async () => {
					setShowLogoutConfirm(false);
					await handleLogout();
				}}
				title="Log out of ChopWise?"
				message="Are you sure you want to log out? You will need to sign in again to access your meal plans."
				confirmText="Log out"
				variant="danger"
				icon="👋"
			/>
		</>
	);
}
