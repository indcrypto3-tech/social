
"use client";

import { logout } from "@/app/(auth)/actions";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    Bell,
    Menu,
    Moon,
    Search,
    Sun,
    Laptop,
    Settings,
    LogOut,
    User,
    CreditCard,
    ChevronRight,
    Home
} from "lucide-react";
import { Sidebar } from "./sidebar";
import { Fragment } from "react";

export function Header() {
    const pathname = usePathname();
    const { setTheme } = useTheme();

    // Generate breadcrumbs from path
    const segments = pathname.split('/').filter(Boolean);

    // Format sidebar titlesmap
    const formatTitle = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-50">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 lg:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
                    <Sidebar />
                </SheetContent>
            </Sheet>

            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center text-sm text-muted-foreground">
                <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
                    <Home className="h-4 w-4 mr-2" />
                </Link>
                {segments.map((segment, index) => {
                    const path = `/${segments.slice(0, index + 1).join('/')}`;
                    const isLast = index === segments.length - 1;

                    return (
                        <Fragment key={path}>
                            <ChevronRight className="h-4 w-4 mx-1" />
                            {isLast ? (
                                <span className="font-medium text-foreground">{formatTitle(segment)}</span>
                            ) : (
                                <Link href={path} className="hover:text-foreground transition-colors">
                                    {formatTitle(segment)}
                                </Link>
                            )}
                        </Fragment>
                    )
                })}
            </div>

            {/* Right Side Actions */}
            <div className="ml-auto flex items-center gap-2 md:gap-4">
                {/* Search Bar */}
                <form className="hidden sm:flex relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-8 w-full h-9 bg-muted/50 focus-visible:bg-background transition-colors"
                    />
                </form>

                <div className="flex items-center gap-1 md:gap-2 border-l pl-2 md:pl-4">
                    {/* Theme Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                <Sun className="mr-2 h-4 w-4" /> Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                <Moon className="mr-2 h-4 w-4" /> Dark
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                <Laptop className="mr-2 h-4 w-4" /> System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Bell className="h-4 w-4" />
                        <span className="sr-only">Notifications</span>
                    </Button>

                    {/* User Nav */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border ml-1">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">SC</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer font-normal">
                                    <User className="mr-2 h-4 w-4" /> Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/billing" className="cursor-pointer font-normal">
                                    <CreditCard className="mr-2 h-4 w-4" /> Billing
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer font-normal">
                                    <Settings className="mr-2 h-4 w-4" /> Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-medium p-3"
                                onClick={async () => await logout()}
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
