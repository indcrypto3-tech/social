'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'

interface SubscriptionSettingsProps {
    plan: string
    status: string
}

export function SubscriptionSettings({ plan, status }: SubscriptionSettingsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handlePortal() {
        setLoading(true)
        try {
            const data = await apiClient<{ url: string }>('/billing/portal', {
                method: 'POST'
            })

            if (data.url) {
                window.location.href = data.url
            } else {
                router.push('/billing')
            }
        } catch (error) {
            // Toast managed by apiClient
            router.push('/billing')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your subscription plan and billing details.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Current Plan</p>
                    <p className="text-sm text-muted-foreground capitalize">
                        {plan} <span className="text-xs">({status})</span>
                    </p>
                </div>
                <Button variant="outline" onClick={handlePortal} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                    Manage Subscription
                </Button>
            </CardContent>
        </Card>
    )
}
