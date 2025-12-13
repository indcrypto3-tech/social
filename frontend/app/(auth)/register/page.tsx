import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function RegisterPage({ searchParams }: { searchParams: { error?: string, message?: string } }) {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Sign Up</CardTitle>
                <CardDescription>
                    Create an account to verify your email.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={signup} className="grid gap-4">
                    {searchParams.error && (
                        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-4">
                            <p>{searchParams.error}</p>
                        </div>
                    )}
                    {searchParams.message && (
                        <div className="bg-green-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-green-600 mb-4">
                            <p>{searchParams.message}</p>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" name="fullName" placeholder="John Doe" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Create account
                    </Button>
                </form>
            </CardContent>
            <CardFooter>
                <div className="w-full text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
