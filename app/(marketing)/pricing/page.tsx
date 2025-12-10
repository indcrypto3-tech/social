"use client";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { SlideUp } from "@/components/animations";
import { useState } from "react";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Starter",
        description: "Perfect for individuals and small creators.",
        price: { monthly: 0, yearly: 0 },
        features: [
            "3 Social Accounts",
            "10 Scheduled Posts/mo",
            "Basic Analytics",
            "1 User Seat",
        ],
        cta: "Get Started Free",
        popular: false
    },
    {
        name: "Pro",
        description: "For serious creators and growing brands.",
        price: { monthly: 29, yearly: 290 },
        features: [
            "Unlimited Social Accounts",
            "Unlimited Scheduled Posts",
            "Advanced AI Insights",
            "Team Collaboration (up to 3)",
            "Priority Support",
            "Content Calendar"
        ],
        cta: "Start 14-Day Free Trial",
        popular: true
    },
    {
        name: "Agency",
        description: "For agencies managing multiple clients.",
        price: { monthly: 99, yearly: 990 },
        features: [
            "Everything in Pro",
            "Unlimited Team Members",
            "Client Approval Workflows",
            "White-label Reports",
            "Dedicated Account Manager",
            "API Access"
        ],
        cta: "Contact Sales",
        popular: false
    }
];

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    return (
        <div className="bg-background min-h-screen pt-32 pb-24">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <SlideUp>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h1>
                        <p className="text-muted-foreground text-lg mb-8">
                            Choose the plan that's right for you. Change or cancel at any time.
                        </p>
                    </SlideUp>

                    <SlideUp delay={0.1}>
                        <div className="inline-flex items-center p-1 bg-muted rounded-full border border-border">
                            <button
                                onClick={() => setBillingCycle("monthly")}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-medium transition-all",
                                    billingCycle === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle("yearly")}
                                className={cn(
                                    "px-6 py-2 rounded-full text-sm font-medium transition-all",
                                    billingCycle === "yearly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Yearly <span className="ml-1 text-xs text-primary font-normal">-20%</span>
                            </button>
                        </div>
                    </SlideUp>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <SlideUp key={index} delay={index * 0.1} className={cn(
                            "relative flex flex-col p-8 rounded-2xl border transition-all duration-300",
                            plan.popular
                                ? "bg-primary text-primary-foreground shadow-2xl scale-105 border-primary z-10"
                                : "bg-card hover:border-primary/50 hover:shadow-lg"
                        )}>
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-white/20 px-4 py-1.5 rounded-bl-xl text-xs font-semibold">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <p className={cn("text-sm", plan.popular ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold">
                                    ${billingCycle === "monthly" ? plan.price.monthly : Math.round(plan.price.yearly / 12)}
                                </span>
                                <span className={cn("text-sm", plan.popular ? "text-primary-foreground/70" : "text-muted-foreground")}>/mo</span>
                                {billingCycle === "yearly" && plan.price.monthly > 0 && (
                                    <div className="text-sm mt-1 opacity-70">
                                        Billed ${plan.price.yearly} yearly
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm">
                                        <Check size={18} className={cn(plan.popular ? "text-white" : "text-primary")} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.popular ? "secondary" : "outline"}
                                className="w-full font-semibold"
                                size="lg"
                            >
                                {plan.cta}
                            </Button>
                        </SlideUp>
                    ))}
                </div>

                <div className="mt-24 max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold mb-8 text-center">Compare features</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-lg">Feature</th>
                                    <th className="px-6 py-4">Starter</th>
                                    <th className="px-6 py-4">Pro</th>
                                    <th className="px-6 py-4 rounded-tr-lg">Agency</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">Social Accounts</td>
                                    <td className="px-6 py-4">3</td>
                                    <td className="px-6 py-4">Unlimited</td>
                                    <td className="px-6 py-4">Unlimited</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">Scheduled Posts</td>
                                    <td className="px-6 py-4">10/mo</td>
                                    <td className="px-6 py-4">Unlimited</td>
                                    <td className="px-6 py-4">Unlimited</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">Team Members</td>
                                    <td className="px-6 py-4">-</td>
                                    <td className="px-6 py-4">3</td>
                                    <td className="px-6 py-4">Unlimited</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="px-6 py-4 font-medium">AI Insights</td>
                                    <td className="px-6 py-4">Basic</td>
                                    <td className="px-6 py-4">Advanced</td>
                                    <td className="px-6 py-4">Advanced</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 font-medium">Support</td>
                                    <td className="px-6 py-4">Community</td>
                                    <td className="px-6 py-4">Priority Email</td>
                                    <td className="px-6 py-4">Dedicated Manager</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
