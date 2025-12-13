"use client";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { SlideUp } from "@/components/animations";

export function PricingSummary() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <SlideUp>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
                        <p className="text-muted-foreground text-lg">
                            Start for free, upgrade as you grow. No hidden fees.
                        </p>
                    </SlideUp>
                </div>

                <SlideUp delay={0.2} className="relative max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* Free Plan */}
                        <div className="bg-background border rounded-2xl p-8 shadow-sm">
                            <h3 className="text-xl font-semibold mb-2">Starter</h3>
                            <p className="text-muted-foreground mb-6">Perfect for individuals starting out.</p>
                            <div className="text-3xl font-bold mb-6">$0</div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2"><Check size={18} className="text-primary" /> <span>3 Social Accounts</span></li>
                                <li className="flex items-center gap-2"><Check size={18} className="text-primary" /> <span>10 Scheduled Posts/mo</span></li>
                                <li className="flex items-center gap-2"><Check size={18} className="text-primary" /> <span>Basic Analytics</span></li>
                            </ul>
                            <Button variant="outline" className="w-full">Get Started Free</Button>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-xl relative overflow-hidden transform md:scale-105">
                            <div className="absolute top-0 right-0 bg-white/20 px-3 py-1 rounded-bl-lg text-xs font-medium">Popular</div>
                            <h3 className="text-xl font-semibold mb-2">Pro</h3>
                            <p className="text-primary-foreground/80 mb-6">For serious creators and pros.</p>
                            <div className="text-3xl font-bold mb-6">$29 <span className="text-lg font-normal opacity-70">/mo</span></div>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2"><Check size={18} /> <span>UNLIMITED Social Accounts</span></li>
                                <li className="flex items-center gap-2"><Check size={18} /> <span>Unlimited Scheduled Posts</span></li>
                                <li className="flex items-center gap-2"><Check size={18} /> <span>Advanced AI Insights</span></li>
                                <li className="flex items-center gap-2"><Check size={18} /> <span>Team Collaboration</span></li>
                            </ul>
                            <Button variant="secondary" className="w-full font-semibold">Start 14-Day Free Trial</Button>
                        </div>
                    </div>
                </SlideUp>
            </div>
        </section>
    );
}
