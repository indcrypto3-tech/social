"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
    // Default to true for desktop usually, but we handle hydration carefully
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem("sidebar-open");
        if (saved !== null) {
            setIsSidebarOpen(saved === "true");
        }
    }, []);

    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);
        localStorage.setItem("sidebar-open", String(newState));
    };

    if (!isMounted) {
        // Prevent hydration mismatch by rendering a safe default (e.g. open) or empty
        // Rendering open is better for SEO/standard view usually, but simpler to match structure
        return (
            <div className="grid min-h-screen w-full lg:grid-cols-[256px_1fr]">
                <div className="hidden border-r bg-muted/40 lg:block">
                    {/* Static render for initial load */}
                    <Sidebar />
                </div>
                <div className="flex flex-col">
                    <Header />
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-muted/5">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "grid min-h-screen w-full transition-all duration-300 ease-in-out",
                isSidebarOpen ? "lg:grid-cols-[256px_1fr]" : "lg:grid-cols-[0px_1fr]"
            )}
        >
            <div className={cn(
                "hidden border-r bg-muted/40 lg:block overflow-hidden transition-all duration-300",
                !isSidebarOpen && "border-r-0"
            )}>
                <div className="w-[256px] h-full">
                    <Sidebar onCollapse={toggleSidebar} showCollapseButton={true} />
                </div>
            </div>
            <div className="flex flex-col min-w-0">
                <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-muted/5">
                    {children}
                </main>
            </div>
        </div>
    );
}
