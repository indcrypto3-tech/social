'use client'

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { ComponentProps, useState } from "react"
import { Loader2, Twitter } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ConnectTwitterButtonProps extends ComponentProps<typeof Button> {
    isConnected?: boolean
}

export function ConnectTwitterButton({
    isConnected,
    className,
    ...props
}: ConnectTwitterButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleConnect = async () => {
        try {
            setIsLoading(true)

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'twitter',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
                    scopes: 'tweet.read tweet.write users.read offline.access',
                    skipBrowserRedirect: false,
                }
            })

            if (error) {
                throw error
            }

        } catch (error) {
            console.error("Twitter Connect Error:", error)
            setIsLoading(false)
            toast({
                title: "Connection Failed",
                description: "Could not connect to Twitter. Please try again.",
                variant: "destructive"
            })
        }
    }

    return (
        <Button
            variant={isConnected ? "outline" : "default"}
            className={className}
            onClick={handleConnect}
            disabled={isLoading || isConnected}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Twitter className="mr-2 h-4 w-4" />
            )}
            {isConnected ? "Twitter Connected" : "Connect Twitter"}
        </Button>
    )
}
