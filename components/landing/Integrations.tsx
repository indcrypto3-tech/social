"use client";
import { BlurFade } from "@/components/animations";
// Using lucide-react icons as placeholders for brand logos, in a real app these would be SVGs
import { Instagram, Linkedin, Twitter, Facebook, Youtube, Twitch, Slack, Figma } from "lucide-react";

export function Integrations() {
    return (
        <section className="py-24 bg-muted/30 border-y border-border/40 overflow-hidden">
            <div className="container px-4 mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-12">Integrates with your favorite tools</h2>

                <div className="relative max-w-4xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        <BlurFade delay={0.1}><div className="flex flex-col items-center gap-2"><Instagram size={40} /> <span className="text-xs font-medium">Instagram</span></div></BlurFade>
                        <BlurFade delay={0.2}><div className="flex flex-col items-center gap-2"><Linkedin size={40} /> <span className="text-xs font-medium">LinkedIn</span></div></BlurFade>
                        <BlurFade delay={0.3}><div className="flex flex-col items-center gap-2"><Twitter size={40} /> <span className="text-xs font-medium">Twitter</span></div></BlurFade>
                        <BlurFade delay={0.4}><div className="flex flex-col items-center gap-2"><Facebook size={40} /> <span className="text-xs font-medium">Facebook</span></div></BlurFade>
                        <BlurFade delay={0.5}><div className="flex flex-col items-center gap-2"><Youtube size={40} /> <span className="text-xs font-medium">YouTube</span></div></BlurFade>
                        <BlurFade delay={0.6}><div className="flex flex-col items-center gap-2"><Twitch size={40} /> <span className="text-xs font-medium">Twitch</span></div></BlurFade>
                        <BlurFade delay={0.7}><div className="flex flex-col items-center gap-2"><Slack size={40} /> <span className="text-xs font-medium">Slack</span></div></BlurFade>
                        <BlurFade delay={0.8}><div className="flex flex-col items-center gap-2"><Figma size={40} /> <span className="text-xs font-medium">Figma</span></div></BlurFade>
                    </div>

                    {/* Gradient masks for infinite scroll effect feel (static here but visual cue) */}
                    <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-muted to-transparent pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-muted to-transparent pointer-events-none"></div>
                </div>
            </div>
        </section>
    );
}
