"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users, Plus, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { PageHeader } from "../components/page-header";
import { MetricCard } from "../components/metric-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { OnboardingChecklist } from "../components/onboarding-checklist";
import { UpgradeBanner } from "../components/upgrade-banner";


const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

interface DashboardClientProps {
    data: any; // Type this properly if possible, but 'any' is fine for refactoring
}

export function DashboardClient({ data }: DashboardClientProps) {
    const isPro = data?.isPro || false;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
        >
            <PageHeader heading="Dashboard" text="Overview of your social media performance." />

            {!isPro && (
                <motion.div variants={item}>
                    <UpgradeBanner />
                </motion.div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-full lg:col-span-5 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                        <motion.div variants={item}>
                            <MetricCard
                                title="Total Posts"
                                value="124"
                                icon={DollarSign}
                                trend={{ value: 20.1, label: "last month", isPositive: true }}
                                description="from last month"
                            />
                        </motion.div>
                        <motion.div variants={item}>
                            <MetricCard
                                title="Scheduled"
                                value="12"
                                icon={Users}
                                trend={{ value: 180.1, label: "last month", isPositive: true }}
                                description="posts aligned"
                            />
                        </motion.div>
                        <motion.div variants={item}>
                            <MetricCard
                                title="Sales"
                                value="+12,234"
                                icon={CreditCard}
                                trend={{ value: 19, label: "last month", isPositive: true }}
                                description="from social traffic"
                            />
                        </motion.div>
                        <motion.div variants={item}>
                            <MetricCard
                                title="Active Now"
                                value="+573"
                                icon={Activity}
                                description="+201 since last hour"
                            />
                        </motion.div>
                    </div>

                    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                        <motion.div variants={item} className="xl:col-span-2 space-y-4">
                            <Card className="h-full">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="grid gap-2">
                                        <CardTitle>Recent Activity</CardTitle>
                                        <CardDescription>
                                            Your latest social media actions and automation logs.
                                        </CardDescription>
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href="/analytics" className="gap-1">
                                            View All <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[200px] border-2 border-dashed rounded-lg bg-muted/20">
                                        <Activity className="h-10 w-10 mb-4 opacity-50" />
                                        <h3 className="text-lg font-medium">No recent activity</h3>
                                        <p className="text-sm max-w-sm mt-2">
                                            You haven't posted anything yet. Create your first post to see analytics here.
                                        </p>
                                        <Button className="mt-4" asChild>
                                            <Link href="/composer">Create Post</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={item} className="space-y-4">
                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                    <Button className="w-full justify-start" asChild>
                                        <Link href="/composer">
                                            <Plus className="mr-2 h-4 w-4" /> Create New Post
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/calendar">
                                            <CalendarIcon className="mr-2 h-4 w-4" /> View Calendar
                                        </Link>
                                    </Button>
                                    <Button variant="secondary" className="w-full justify-start" asChild>
                                        <Link href="/accounts">
                                            <Users className="mr-2 h-4 w-4" /> Connect Account
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-8">
                                    <div className="flex items-center justify-center p-8 text-muted-foreground text-sm border rounded-md">
                                        No scheduled posts for today.
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="ghost" className="w-full text-sm text-muted-foreground" asChild>
                                        <Link href="/calendar">View Full Schedule</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                <motion.div variants={item} className="col-span-full lg:col-span-2 space-y-4">
                    <OnboardingChecklist />
                </motion.div>
            </div>
        </motion.div>
    );
}
