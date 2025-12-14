import { resetPassword } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function ForgotPasswordPage({ searchParams }: { searchParams: { error?: string, message?: string } }) {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>
                    Enter your email to receive a password reset link
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={resetPassword} className="grid gap-4">
                    {searchParams.error && (
                        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                            <p>{searchParams.error}</p>
                        </div>
                    )}
                    {searchParams.message && (
                        <div className="bg-green-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-green-600">
                            <p>{searchParams.message}</p>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Send Reset Link
                    </Button>
                </form>
            </CardContent>
            <CardFooter>
                <div className="w-full text-center text-sm">
                    Remember your password?{" "}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
