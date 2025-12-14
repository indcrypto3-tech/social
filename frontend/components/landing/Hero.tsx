"use client";
import { Button } from "@/components/ui/button";
import { FadeIn, SlideUp, BlurFade } from "@/components/animations";
import Link from "next/link";

interface HeroProps {
    inWaitlistMode?: boolean;
}

export function Hero({ inWaitlistMode }: HeroProps) {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            <div className="container px-4 mx-auto text-center">
                <FadeIn>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 text-sm text-muted-foreground mb-6 hover:bg-muted/80 transition-colors cursor-default">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        v2.0 is now live
                    </div>
                </FadeIn>

                <SlideUp delay={0.1}>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        Master Your Social Media <br className="hidden md:block" />
                        <span className="text-primary">Without the Chaos</span>
                    </h1>
                </SlideUp>

                <SlideUp delay={0.2}>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        The all-in-one platform for creators and agencies to plan, analyze, and automate their social presence. Stop guessing, start growing.
                    </p>
                </SlideUp>

                <SlideUp delay={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {inWaitlistMode ? (
                        <Link href="/waitlist" className="w-full sm:w-auto">
                            <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow w-full">
                                Join Waitlist
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow w-full">
                                    Start Free Trial
                                </Button>
                            </Link>
                            <Link href="#features" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base w-full">
                                    View Demo
                                </Button>
                            </Link>
                        </>
                    )}
                </SlideUp>

                <div className="mt-20 relative">
                    <BlurFade delay={0.5}>
                        <div className="rounded-xl border bg-background/50 backdrop-blur-sm shadow-2xl p-2 md:p-4 max-w-5xl mx-auto">
                            <div className="aspect-video rounded-lg bg-muted/50 overflow-hidden relative group">
                                {/* Placeholder for Product Screenshot */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-muted/50 to-muted/80">
                                    <span className="text-2xl font-medium mb-2">SocialScheduler Dashboard</span>
                                    <span className="text-sm opacity-70">Interactive Preview coming soon</span>
                                </div>
                                {/* Simulated UI Elements */}
                                <div className="absolute top-4 left-4 right-4 h-8 bg-background/40 rounded flex items-center px-2 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                            </div>
                        </div>
                    </BlurFade>
                    {/* Decorative gradients */}
                    <div className="absolute -top-10 -left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10 opacity-50"></div>
                    <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -z-10 opacity-50"></div>
                </div>
            </div>
        </section>
    );
}
