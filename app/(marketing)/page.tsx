"use client";

import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Integrations } from "@/components/landing/Integrations";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingSummary } from "@/components/landing/PricingSummary";
import { FAQ } from "@/components/landing/FAQ";

export default function Home() {
    return (
        <>
            <Hero />
            <Features />
            <HowItWorks />
            <Integrations />
            <Testimonials />
            <PricingSummary />
            <FAQ />
        </>
    );
}
