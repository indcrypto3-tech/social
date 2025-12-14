"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavbarProps {
    inWaitlistMode?: boolean;
}

export function Navbar({ inWaitlistMode }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
            scrolled ? "bg-background/80 backdrop-blur-md border-border/40 shadow-sm" : "bg-transparent"
        )}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <div className="w-4 h-4 rounded-full bg-primary shadow-glow" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        SocialScheduler
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
                    <Link href="/#how-it-works" className="hover:text-primary transition-colors">How it Works</Link>
                    {!inWaitlistMode && <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>}
                    <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                </div>

                <div className="flex items-center gap-4">
                    {inWaitlistMode ? (
                        <Link href="/waitlist">
                            <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                Join Waitlist
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="hidden md:block text-sm font-medium hover:text-primary transition-colors">
                                Log in
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
