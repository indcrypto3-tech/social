"use client";
import { SlideUp } from "@/components/animations";

const steps = [
    {
        number: "01",
        title: "Connect Your Accounts",
        description: "Link your profiles from Instagram, Twitter, LinkedIn, and more in just a few clicks.",
    },
    {
        number: "02",
        title: "Plan Your Content",
        description: "Use our intuitive visual calendar to draft, schedule, and organize your posts.",
    },
    {
        number: "03",
        title: "Analyze & Optimize",
        description: "Track performance with real-time analytics and let AI optimize your future posts.",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-background">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <SlideUp>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
                        <p className="text-muted-foreground text-lg">
                            Get started in minutes. No credit card required.
                        </p>
                    </SlideUp>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -z-10 hidden md:block -translate-y-1/2 dashed-line"></div>
                    {steps.map((step, index) => (
                        <SlideUp key={index} delay={index * 0.2} className="relative bg-background p-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-6 mx-auto shadow-xl shadow-primary/20 relative z-10">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-center">{step.title}</h3>
                            <p className="text-muted-foreground text-center leading-relaxed">
                                {step.description}
                            </p>
                        </SlideUp>
                    ))}
                </div>
            </div>
        </section>
    );
}
