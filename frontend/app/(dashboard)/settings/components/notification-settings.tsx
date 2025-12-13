'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateNotificationPreferences } from '../actions'
import { Loader2 } from 'lucide-react'

interface Preferences {
    emailPostFailed: boolean
    emailPostPublished: boolean
    weeklyDigest: boolean
}

function SwitchItem({ id, label, defaultChecked }: { id: string, label: string, defaultChecked: boolean }) {
    const [checked, setChecked] = useState(defaultChecked)

    return (
        <div className="flex items-center justify-between space-x-2">
            <Label htmlFor={id} className="flex-1">{label}</Label>
            <Switch id={id} checked={checked} onCheckedChange={setChecked} />
            <input type="hidden" name={id} value={checked ? 'true' : 'false'} />
        </div>
    )
}

export function NotificationSettings({ preferences }: { preferences: Preferences }) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await updateNotificationPreferences(formData)
            toast({ title: "Preferences updated" })
        } catch (error) {
            toast({
                title: "Error updating preferences",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <SwitchItem
                        id="emailPostFailed"
                        label="Email me when a post fails"
                        defaultChecked={preferences.emailPostFailed}
                    />

                    <SwitchItem
                        id="emailPostPublished"
                        label="Email me when a post is published"
                        defaultChecked={preferences.emailPostPublished}
                    />

                    <SwitchItem
                        id="weeklyDigest"
                        label="Weekly Digest"
                        defaultChecked={preferences.weeklyDigest}
                    />

                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Preferences
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
