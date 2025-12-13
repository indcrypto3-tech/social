
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { getOnboardingProgress } from '../dashboard/actions';

type Steps = {
    connectAccount: boolean;
    createPost: boolean;
    schedulePost: boolean;
    viewCalendar: boolean;
    upgradePlan: boolean;
};

export function OnboardingChecklist() {
    const [isOpen, setIsOpen] = useState(true);
    const [steps, setSteps] = useState<Steps>({
        connectAccount: false,
        createPost: false,
        schedulePost: false,
        viewCalendar: false,
        upgradePlan: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for dismissal
        const dismissed = localStorage.getItem('onboarding_dismissed');
        if (dismissed === 'true') {
            setIsOpen(false);
            return;
        }



        // Fetch server state
        async function load() {
            try {
                const data = await getOnboardingProgress();
                if (data) {
                    const viewedCalendar = localStorage.getItem('onboarding_viewed_calendar') === 'true';

                    setSteps(prev => ({
                        ...prev,
                        connectAccount: data.hasConnectedAccount,
                        createPost: data.hasCreatedPost,
                        schedulePost: data.hasScheduledPost,
                        upgradePlan: data.isPro,
                        viewCalendar: viewedCalendar,
                    }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem('onboarding_dismissed', 'true');
    };

    const completedCount = Object.values(steps).filter(Boolean).length;
    const progress = (completedCount / 5) * 100;

    if (!isOpen) return null;
    if (loading) return null; // Or skeleton
    if (completedCount === 5) return null; // Hide if all done

    return (
        <Card className="border-blue-200 bg-blue-50/50 relative">
            <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
                <X className="h-4 w-4" />
            </button>

            <CardHeader>
                <CardTitle className="text-lg text-blue-900">Get Started with Social Scheduler</CardTitle>
                <CardDescription>Complete these steps to become a pro.</CardDescription>
                <Progress value={progress} className="h-2 w-full mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{completedCount} of 5 completed</p>
            </CardHeader>
            <CardContent className="grid gap-3">
                <StepItem
                    completed={steps.connectAccount}
                    label="Connect your first social account"
                    href="/accounts"
                    actionLabel="Connect"
                />
                <StepItem
                    completed={steps.createPost}
                    label="Create your first post"
                    href="/composer"
                    actionLabel="Create"
                />
                <StepItem
                    completed={steps.schedulePost}
                    label="Schedule a post for later"
                    href="/composer"
                    actionLabel="Schedule"
                />
                <StepItem
                    completed={steps.viewCalendar}
                    label="View your content calendar"
                    href="/calendar"
                    actionLabel="View"
                    onClick={() => {
                        // Optimistic update
                        setSteps(s => ({ ...s, viewCalendar: true }));
                        localStorage.setItem('onboarding_viewed_calendar', 'true');
                    }}
                />
                <StepItem
                    completed={steps.upgradePlan}
                    label="Upgrade to Pro for more features"
                    href="/billing"
                    actionLabel="Upgrade"
                />
            </CardContent>
        </Card>
    );
}

function StepItem({ completed, label, href, actionLabel, onClick }: { completed: boolean; label: string; href: string; actionLabel: string, onClick?: () => void }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                {completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={cn("text-sm transition-colors", completed ? "text-muted-foreground line-through" : "font-medium text-foreground")}>
                    {label}
                </span>
            </div>
            {!completed && (
                <Button variant="outline" size="sm" className="h-7 text-xs" asChild onClick={onClick}>
                    <Link href={href}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    );
}
