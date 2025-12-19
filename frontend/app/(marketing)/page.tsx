import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Integrations } from "@/components/landing/Integrations";
import { Testimonials } from "@/components/landing/Testimonials";
import { PricingSummary } from "@/components/landing/PricingSummary";
import { FAQ } from "@/components/landing/FAQ";

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        redirect('/dashboard');
    }

    const isWaitlistMode = process.env.LAUNCH === 'OFF';

    return (
        <>
            <Hero inWaitlistMode={isWaitlistMode} />
            <Features />
            <HowItWorks />
            <Integrations />
            {!isWaitlistMode && (
                <>
                    <Testimonials />
                    <PricingSummary />
                    <FAQ />
                </>
            )}
        </>
    );
}
