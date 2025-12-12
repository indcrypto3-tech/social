'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from 'lucide-react'

// Mock usage data - In real app, fetch from DB
const USAGE = {
    posts: 42,
    limit: 100,
}

export function BillingSettings({ user }: { user: any }) {
    const isPro = user.subscriptionTier === 'pro' || user.subscriptionTier === 'business'

    return (
        <Card>
            <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>Manage your subscription plan and payment method.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <div className="text-base font-semibold text-foreground flex items-center gap-2">
                            {user.subscriptionTier === 'free' ? 'Free Plan' :
                                user.subscriptionTier === 'pro' ? 'Pro Plan' : 'Business Plan'}
                            {isPro && <Badge>Active</Badge>}
                            {!isPro && <Badge variant="secondary">Free</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {user.subscriptionTier === 'free'
                                ? 'Upgrade to unlock more features.'
                                : `You are currently on the ${user.subscriptionTier} plan.`}
                        </div>
                    </div>
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Posts</span>
                        <span className="font-medium">{USAGE.posts} / {USAGE.limit}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
                            style={{ width: `${(USAGE.posts / USAGE.limit) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                        Resets on {new Date(new Date().setDate(1)).toLocaleDateString()}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground hidden sm:block">
                    {/* Placeholder for billing info */}
                    Billing is managed via Stripe.
                </div>
                <form action="/api/billing/portal" method="POST">
                    <Button type="submit">
                        Manage Subscription
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
