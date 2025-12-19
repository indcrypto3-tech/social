
"use client";

import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/lib/auth/session-provider";
import Link from "next/link";
import Image from "next/image";
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

export function Sidebar({ className, onCollapse, showCollapseButton }: { className?: string, onCollapse?: () => void, showCollapseButton?: boolean }) {
    const pathname = usePathname();
    const { signOut } = useSession();

    return (
        <div className={cn("flex h-full flex-col border-r bg-card text-card-foreground", className)}>
            <div className="flex h-16 items-center justify-between border-b px-6">
                <Link className="flex items-center gap-2 font-semibold" href="/">
                    <div className="relative h-8 w-8">
                        <Image src="/logo-icon-dark.svg" alt="Autopostr Logo" fill className="object-contain dark:hidden" />
                        <Image src="/logo-icon-light.svg" alt="Autopostr Logo" fill className="object-contain hidden dark:block" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Autopostr
                    </span>
                </Link>
                {showCollapseButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hidden lg:flex"
                        onClick={onCollapse}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                        >
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <path d="M9 3v18" />
                            <path d="m14 9-2 3 2 3" />
                        </svg>
                        <span className="sr-only">Collapse Sidebar</span>
                    </Button>
                )}
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
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={async () => await signOut()}
                >
                    <LogOut className="h-4 w-4" />
                    Log Out
                </Button>
            </div>
        </div>
    );
}
