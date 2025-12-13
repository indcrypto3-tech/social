"use client";
import { FadeIn, SlideUp } from "@/components/animations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const team = [
    { name: "Alex Chen", role: "CEO & Founder", image: "" },
    { name: "Sarah Miller", role: "CTO", image: "" },
    { name: "David Kim", role: "Head of Product", image: "" },
    { name: "Jessica Lee", role: "Lead Designer", image: "" },
    { name: "Tom Wilson", role: "Head of Growth", image: "" },
    { name: "Emma Davis", role: "Customer Success", image: "" },
];

export default function AboutPage() {
    return (
        <div className="bg-background min-h-screen pt-32 pb-24">
            <div className="container px-4 mx-auto max-w-5xl">
                {/* Hero */}
                <div className="text-center mb-24">
                    <FadeIn>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Helping creators find their voice</h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            We're on a mission to simplify social media management so you can focus on creating content that matters.
                        </p>
                    </FadeIn>
                </div>

                {/* Story */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                    <SlideUp delay={0.2} className="relative aspect-square rounded-2xl bg-muted overflow-hidden">
                        {/* Placeholder image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-muted-foreground/50">
                            Office Photo Placeholder
                        </div>
                    </SlideUp>
                    <SlideUp delay={0.3} className="space-y-6">
                        <h2 className="text-3xl font-bold">Our Story</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            SocialScheduler started in 2023 when our founder, Alex, realized that existing tools were too complex and expensive for independent creators. He wanted to build something that felt like a natural extension of the creative workflow.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Today, we serve thousands of creators and agencies worldwide. We believe in the power of consistency and authenticity. Our tools are designed to amplify your voice, not replace it.
                        </p>
                        <div className="flex gap-8 pt-4">
                            <div>
                                <h3 className="text-3xl font-bold text-primary">10k+</h3>
                                <p className="text-sm text-muted-foreground">Active Users</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-primary">5M+</h3>
                                <p className="text-sm text-muted-foreground">Posts Scheduled</p>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-primary">99.9%</h3>
                                <p className="text-sm text-muted-foreground">Uptime</p>
                            </div>
                        </div>
                    </SlideUp>
                </div>

                {/* Team */}
                <div className="mb-24">
                    <h2 className="text-3xl font-bold mb-12 text-center">Meet the Team</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                        {team.map((member, i) => (
                            <SlideUp key={i} delay={0.1 * i} className="text-center group">
                                <div className="aspect-square rounded-full bg-muted mb-4 overflow-hidden relative mx-auto max-w-[120px] ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                    <Avatar className="h-full w-full">
                                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                            {member.name.split(" ").map(n => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <h3 className="font-semibold">{member.name}</h3>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                            </SlideUp>
                        ))}
                    </div>
                </div>

                {/* Vision */}
                <div className="bg-muted/30 rounded-3xl p-12 text-center">
                    <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        &quot;We envision a world where every creator has the tools they need to build a sustainable business around their passion, without getting burnt out by the logistics of social media.&quot;
                    </p>
                </div>
            </div>
        </div>
    );
}
