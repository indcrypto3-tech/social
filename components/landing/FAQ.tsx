"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeIn } from "@/components/animations";

export function FAQ() {
    return (
        <section className="py-24 bg-background">
            <div className="container px-4 mx-auto max-w-3xl">
                <div className="text-center mb-16">
                    <FadeIn>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground text-lg">
                            Got questions? We&apos;ve got answers.
                        </p>
                    </FadeIn>
                </div>

                <FadeIn delay={0.2}>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
                            <AccordionContent>
                                Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What social media platforms do you support?</AccordionTrigger>
                            <AccordionContent>
                                We currently support Instagram, Twitter (X), LinkedIn, Facebook, and Pinterest. TikTok and YouTube support is coming soon!
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Is there a free trial?</AccordionTrigger>
                            <AccordionContent>
                                Yes, we offer a 14-day free trial for our Pro and Agency plans. No credit card is required to start the trial.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How does the AI scheduling work?</AccordionTrigger>
                            <AccordionContent>
                                Our AI analyzes your historical engagement data and industry trends to recommend the best times to post for your specific audience.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </FadeIn>
            </div>
        </section>
    );
}
