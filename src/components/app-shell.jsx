import { useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({
    children,
    pathname,
    onRegenerate,
    onAdminAction,
}) {
	const location = useLocation();
	const activePath = pathname || (location.pathname + (location.search || "") + (location.hash || ""));

	return (
		<TooltipProvider delayDuration={0}>
			<div className="overflow-hidden bg-page text-fg min-h-screen">
				<SidebarProvider className="relative h-svh">
					<AppSidebar pathname={activePath} onRegenerate={onRegenerate} onAdminAction={onAdminAction} />
					<SidebarInset className="md:peer-data-[variant=inset]:ml-0 bg-page">
						<AppHeader pathname={activePath} />
						<div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 sm:p-5 md:p-6 bg-page">
							{children}
						</div>
					</SidebarInset>
				</SidebarProvider>
			</div>
		</TooltipProvider>
	);
}
