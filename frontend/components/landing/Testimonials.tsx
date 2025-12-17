"use client";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
    {
        quote: "SocialScheduler has completely transformed how we manage our agency clients. The AI analytics are a game changer.",
        author: "Sarah J.",
        role: "Marketing Director",
        avatar: "S",
    },
    {
        quote: "I used to spend hours planning posts. Now I do it in 20 minutes a week. Best investment for my personal brand.",
        author: "Mike T.",
        role: "Content Creator",
        avatar: "M",
    },
    {
        quote: "The collaboration features are top-notch. My team and I are finally on the same page without endless email threads.",
        author: "Emily R.",
        role: "Social Media Manager",
        avatar: "E",
    },
];

export function Testimonials() {
    return (
        <section className="py-24 bg-background">
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16">
                    <FadeIn>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by creators worldwide</h2>
                        <p className="text-muted-foreground text-lg">
                            Join thousands of satisfied users who are growing their audience.
                        </p>
                    </FadeIn>
                </div>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <StaggerItem key={i} className="bg-muted/20 p-8 rounded-2xl border border-border/50 hover:bg-muted/40 transition-colors">
                            <Quote className="text-primary/40 mb-4 h-8 w-8" />
                            <p className="text-lg font-medium mb-6 leading-relaxed">
                                &quot;{t.quote}&quot;
                            </p>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border border-border">
                                    <AvatarFallback className="bg-primary/10 text-primary">{t.avatar}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{t.author}</p>
                                    <p className="text-muted-foreground text-xs">{t.role}</p>
                                </div>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
