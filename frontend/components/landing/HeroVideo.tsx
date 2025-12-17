"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function HeroVideo() {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <div className="rounded-xl border bg-background/50 backdrop-blur-sm shadow-2xl p-2 md:p-4 max-w-5xl mx-auto">
            <div className="aspect-video rounded-lg bg-black/5 overflow-hidden relative group border border-border/50">
                {/* Browser Controls Decoration */}
                <div className="absolute top-0 left-0 right-0 h-6 md:h-8 bg-background/40 backdrop-blur-md flex items-center px-4 gap-2 z-20 border-b border-white/10">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>

                {isPlaying ? (
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/2Ea-Qfq2oHk?autoplay=1&mute=1&rel=0&modestbranding=1"
                        title="Product Demo"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full relative z-10"
                    />
                ) : (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-500/5 via-background to-cyan-500/5 cursor-pointer z-10"
                        onClick={() => setIsPlaying(true)}
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />

                        <div className="relative z-10 flex flex-col items-center gap-6 transition-transform duration-300 group-hover:scale-105">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-background/80 border border-primary/20 backdrop-blur-md shadow-2xl transition-all duration-300 group-hover:bg-background group-hover:border-primary/50 group-hover:shadow-primary/25">
                                    <Play className="w-8 h-8 md:w-10 md:h-10 text-primary fill-primary ml-1" />
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-xl md:text-2xl font-semibold tracking-tight">See how it works</h3>
                                <p className="text-sm text-muted-foreground">Watch a quick 2-minute demo</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
