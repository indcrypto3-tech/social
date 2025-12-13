"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SlideUp } from "@/components/animations";
import { Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="bg-background min-h-screen pt-32 pb-24">
            <div className="container px-4 mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <SlideUp>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in touch</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We&apos;d love to hear from you. Please fill out this form or shoot us an email.
                        </p>
                    </SlideUp>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <SlideUp delay={0.2}>
                        <div className="bg-muted/10 p-8 rounded-2xl border">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="first-name" className="text-sm font-medium">First name</label>
                                        <Input id="first-name" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="last-name" className="text-sm font-medium">Last name</label>
                                        <Input id="last-name" placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input id="email" type="email" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <Textarea id="message" placeholder="How can we help you?" className="min-h-[150px]" />
                                </div>
                                <Button type="submit" className="w-full">Send Message</Button>
                            </form>
                        </div>
                    </SlideUp>

                    <SlideUp delay={0.4} className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                            <p className="text-muted-foreground mb-8">
                                Need immediate assistance? Check out our <a href="/faq" className="text-primary underline">Help Center</a> or contact us directly.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Email</h4>
                                        <p className="text-sm text-muted-foreground">support@socialscheduler.com</p>
                                        <p className="text-sm text-muted-foreground">sales@socialscheduler.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Office</h4>
                                        <p className="text-sm text-muted-foreground">123 Creator St, Suite 456</p>
                                        <p className="text-sm text-muted-foreground">San Francisco, CA 94103</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Hours</h4>
                                        <p className="text-sm text-muted-foreground">Mon-Fri: 9am - 5pm PST</p>
                                        <p className="text-sm text-muted-foreground">Weekends: Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <h4 className="font-semibold mb-2">Join our Discord Community</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Connect with other creators, share tips, and get direct access to our team.
                            </p>
                            <Button variant="outline" className="w-full">Join Discord</Button>
                        </div>
                    </SlideUp>
                </div>
            </div>
        </div>
    );
}
