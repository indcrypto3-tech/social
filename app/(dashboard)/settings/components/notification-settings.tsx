'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { updateNotificationPreferences } from '../actions'
import { useToast } from '@/hooks/use-toast'

function Switch({ checked, onCheckedChange, id }: { checked: boolean, onCheckedChange: (c: boolean) => void, id?: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            id={id}
            onClick={() => onCheckedChange(!checked)}
            className={`
                peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50
                ${checked ? 'bg-primary' : 'bg-input'}
            `}
        >
            <span
                className={`
                    pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform
                    ${checked ? 'translate-x-5' : 'translate-x-0'}
                `}
            />
        </button>
    )
}

export function NotificationSettings({ preferences }: { preferences: any }) {
    const { toast } = useToast()
    const [prefs, setPrefs] = useState(preferences || {
        emailPostFailed: true,
        emailPostPublished: true,
        weeklyDigest: false
    })

    async function handleToggle(key: string, value: boolean) {
        const newPrefs = { ...prefs, [key]: value }
        setPrefs(newPrefs) // Optimistic update

        try {
            await updateNotificationPreferences({ [key]: value })
            toast({
                title: "Preferences updated",
                description: "Your notification settings have been saved.",
            })
        } catch (error) {
            console.error(error)
            setPrefs(prefs) // Revert
            toast({
                title: "Error",
                description: "Failed to update preferences",
                variant: "destructive"
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="emailPostFailed" className="flex flex-col space-y-1">
                        <span>Post failure</span>
                        <span className="font-normal text-muted-foreground">Receive emails when a scheduled post fails to publish.</span>
                    </Label>
                    <Switch
                        id="emailPostFailed"
                        checked={prefs.emailPostFailed}
                        onCheckedChange={(c) => handleToggle('emailPostFailed', c)}
                    />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="emailPostPublished" className="flex flex-col space-y-1">
                        <span>Post published</span>
                        <span className="font-normal text-muted-foreground">Receive emails when a post is successfully published.</span>
                    </Label>
                    <Switch
                        id="emailPostPublished"
                        checked={prefs.emailPostPublished}
                        onCheckedChange={(c) => handleToggle('emailPostPublished', c)}
                    />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="weeklyDigest" className="flex flex-col space-y-1">
                        <span>Weekly digest</span>
                        <span className="font-normal text-muted-foreground">Receive a weekly report of your social media performance.</span>
                    </Label>
                    <Switch
                        id="weeklyDigest"
                        checked={prefs.weeklyDigest}
                        onCheckedChange={(c) => handleToggle('weeklyDigest', c)}
                    />
                </div>
            </CardContent>
        </Card>
    )
}
