
"use client";

import { logout } from "@/app/(auth)/actions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Calendar,
    PenSquare,
    Users,
    Image as ImageIcon,
    Settings,
    BarChart,
    LogOut,
    Link as LinkIcon,
    CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarNavItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Accounts",
        href: "/accounts",
        icon: LinkIcon,
    },
    {
        title: "Create Post",
        href: "/composer",
        icon: PenSquare,
    },
    {
        title: "Calendar",
        href: "/calendar",
        icon: Calendar,
    },
    {
        title: "Media Library",
        href: "/media",
        icon: ImageIcon,
    },
    {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart,
    },
    {
        title: "Team",
        href: "/team",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <div className={cn("flex h-full flex-col border-r bg-card text-card-foreground", className)}>
            <div className="flex h-16 items-center border-b px-6">
                <Link className="flex items-center gap-2 font-semibold" href="/">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Scheduler<span className="text-primary">AI</span>
                    </span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-6 px-4">
                <nav className="grid gap-1 text-sm font-medium">
                    {sidebarNavItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                                    isActive
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t space-y-2">
                {/* Placeholder for Billing Status if needed */}
                {/* <div className="rounded-lg border bg-muted/50 p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold">Pro Plan</span>
                     </div>
                     <p className="text-xs text-muted-foreground mb-3">5/10 Accounts connected</p>
                     <Button size="sm" variant="outline" className="w-full text-xs h-8">Upgrade</Button>
                 </div> */}

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={async () => await logout()}
                >
                    <LogOut className="h-4 w-4" />
                    Log Out
                </Button>
            </div>
        </div>
    );
}
