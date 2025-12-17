"use client";
import { Zap, BarChart3, Clock, Users, Shield, Globe } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations";

const features = [
    {
        title: "AI-Powered Scheduling",
        description: "Our AI analyzes your audience to suggest the perfect posting times for maximum engagement.",
        icon: Zap,
    },
    {
        title: "Advanced Analytics",
        description: "Deep dive into your performance metrics with customizable dashboards and reports.",
        icon: BarChart3,
    },
    {
        title: "Visual Calendar",
        description: "Plan your content visually with our drag-and-drop calendar interface.",
        icon: Clock,
    },
    {
        title: "Team Collaboration",
        description: "Invite your team, assign roles, and streamline your approval workflow.",
        icon: Users,
    },
    {
        title: "Brand Safety",
        description: "Enterprise-grade security and permissions to keep your accounts safe.",
        icon: Shield,
    },
    {
        title: "Global Reach",
        description: "Auto-translate and localize your content for audiences worldwide.",
        icon: Globe,
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-muted/30">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
                    <p className="text-muted-foreground text-lg">
                        Powerful features designed to help you scale your social media presence without the busywork.
                    </p>
                </div>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <StaggerItem key={index} className="bg-background border rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 group cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
