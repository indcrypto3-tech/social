'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

const PLANS = [
    {
        name: 'Basic',
        price: '$9',
        description: 'Essential tools for individuals.',
        features: ['5 Social Accounts', '100 Scheduled Posts', 'Basic Analytics'],
        priceId: 'price_basic_test_id'
    },
    {
        name: 'Pro',
        price: '$29',
        description: 'Perfect for growing creators.',
        features: ['15 Social Accounts', 'Unlimited Scheduled Posts', 'Advanced Analytics', 'Priority Support'],
        priceId: 'price_pro_test_id'
    },
    {
        name: 'Agency',
        price: '$99',
        description: 'For teams and agencies.',
        features: ['Unlimited Accounts', 'Team Collaboration', 'White-label Reports', 'Dedicate Manager'],
        priceId: 'price_agency_test_id'
    }
]

export function BillingContent({ plan, status, date }: { plan: string, status: string, date: Date | null }) {
    const [loading, setLoading] = useState<string | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    async function handleCheckout(priceId: string) {
        setLoading(priceId)
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                body: JSON.stringify({ priceId }),
                headers: { 'Content-Type': 'application/json' }
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('Failed to create checkout session')
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
            setLoading(null)
        }
    }

    async function handlePortal() {
        setLoading('portal')
        try {
            const res = await fetch('/api/billing/portal', {
                method: 'POST'
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
            setLoading(null)
        }
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Subscription Status</CardTitle>
                    <CardDescription>
                        You are currently on the <span className="font-semibold text-foreground capitalize">{plan}</span> plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Status: <Badge variant={status === 'active' || status === 'trialing' ? 'default' : 'secondary'}>{status}</Badge></p>
                            {date && <p className="text-sm text-muted-foreground">Renews on: {date.toLocaleDateString()}</p>}
                        </div>
                        {(status === 'active' || status === 'trialing') && (
                            <Button variant="outline" onClick={handlePortal} disabled={loading === 'portal'}>
                                {loading === 'portal' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Manage Subscription
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                {PLANS.map((p) => (
                    <Card key={p.name} className={plan === p.name.toLowerCase() ? 'border-primary ring-1 ring-primary' : ''}>
                        <CardHeader>
                            <CardTitle>{p.name}</CardTitle>
                            <CardDescription>{p.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="text-3xl font-bold">{p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <ul className="grid gap-2 text-sm">
                                {p.features.map((f) => (
                                    <li key={f} className="flex items-center"><Check className="mr-2 h-4 w-4 text-primary" /> {f}</li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            {plan === p.name.toLowerCase() ? (
                                <Button className="w-full" disabled>Current Plan</Button>
                            ) : (
                                <Button className="w-full" onClick={() => handleCheckout(p.priceId)} disabled={!!loading}>
                                    {loading === p.priceId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {plan === 'free' ? 'Upgrade' : 'Switch'}
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
