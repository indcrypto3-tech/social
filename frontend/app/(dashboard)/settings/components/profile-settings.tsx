'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { updateProfile } from '../actions'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface User {
    id: string
    fullName: string | null
    email?: string | null
    timezone: string | null
    avatarUrl: string | null
}

export function ProfileSettings({ user }: { user: User }) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl)
    const { toast } = useToast()
    const supabase = createClient()

    async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true)
            const file = event.target.files?.[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)

        } catch (error) {
            toast({
                title: "Error uploading avatar",
                description: "Please try again.",
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        if (avatarUrl) {
            formData.append('avatarUrl', avatarUrl)
        }

        try {
            await updateProfile(formData)
            toast({ title: "Profile updated" })
        } catch (error) {
            toast({
                title: "Error updating profile",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your public profile information.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarUrl || ''} />
                            <AvatarFallback>{user.fullName?.[0] || user.email?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="avatar">Avatar</Label>
                            <Input id="avatar" type="file" onChange={handleAvatarUpload} disabled={uploading} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" name="fullName" defaultValue={user.fullName || ''} required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email || ''} disabled />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select name="timezone" defaultValue={user.timezone || 'UTC'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UTC">UTC</SelectItem>
                                <SelectItem value="America/New_York">America/New_York</SelectItem>
                                <SelectItem value="Europe/London">Europe/London</SelectItem>
                                <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                                <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button type="submit" disabled={loading || uploading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
