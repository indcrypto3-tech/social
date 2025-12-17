"use client";
// Using lucide-react icons as placeholders for brand logos
import { Instagram, Linkedin, Twitter, Facebook } from "lucide-react";

const integrations = [
    { name: "Instagram", icon: Instagram },
    { name: "LinkedIn", icon: Linkedin },
    { name: "X/Twitter", icon: Twitter },
    { name: "Facebook", icon: Facebook },
];

export function Integrations() {
    return (
        <section className="py-24 bg-muted/30 border-y border-border/40 overflow-hidden">
            <div className="container px-4 mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-12">Integrates with your favorite tools</h2>

                <div className="relative">
                    {/* Infinite slider container */}
                    <div className="flex overflow-hidden">
                        {/* First set of logos */}
                        <div className="flex animate-scroll gap-16 pr-16">
                            {integrations.map((integration, index) => (
                                <div
                                    key={`first-${index}`}
                                    className="flex flex-col items-center gap-3 min-w-[120px] opacity-70 hover:opacity-100 transition-opacity duration-300"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center hover:scale-110 transition-transform duration-300">
                                        <integration.icon size={32} className="text-foreground" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">{integration.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Duplicate set for seamless loop */}
                        <div className="flex animate-scroll gap-16 pr-16">
                            {integrations.map((integration, index) => (
                                <div
                                    key={`second-${index}`}
                                    className="flex flex-col items-center gap-3 min-w-[120px] opacity-70 hover:opacity-100 transition-opacity duration-300"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center hover:scale-110 transition-transform duration-300">
                                        <integration.icon size={32} className="text-foreground" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">{integration.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Third set for extra smoothness */}
                        <div className="flex animate-scroll gap-16 pr-16">
                            {integrations.map((integration, index) => (
                                <div
                                    key={`third-${index}`}
                                    className="flex flex-col items-center gap-3 min-w-[120px] opacity-70 hover:opacity-100 transition-opacity duration-300"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-background border flex items-center justify-center hover:scale-110 transition-transform duration-300">
                                        <integration.icon size={32} className="text-foreground" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">{integration.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gradient masks for fade effect */}
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none"></div>
                </div>
            </div>
        </section>
    );
}
