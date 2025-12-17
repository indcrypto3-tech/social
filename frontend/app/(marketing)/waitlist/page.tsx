"use client";

import { useState } from "react";
import { joinWaitlist } from "./action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function WaitlistPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        const result = await joinWaitlist(email);

        if (result.success) {
            setStatus("success");
            setMessage("You've been added to the waitlist!");
        } else {
            setStatus("error");
            setMessage(result.error || "Something went wrong.");
        }
    };

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12 text-center">
            <div className="max-w-xl space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground/70">
                        We’re launching soon
                    </h1>
                    <p className="text-lg text-muted-foreground text-balance">
                        Experience the future of social media scheduling. Join our exclusive waitlist to get early access.
                    </p>
                </div>

                {status === "success" ? (
                    <div className="rounded-lg border bg-card p-8 shadow-sm">
                        <h3 className="text-2xl font-semibold text-primary mb-2">Welcome Aboard! 🚀</h3>
                        <p className="text-muted-foreground">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row max-w-md mx-auto w-full">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={status === "loading"}
                            className="h-12"
                        />
                        <Button type="submit" size="lg" disabled={status === "loading"} className="h-12 px-8">
                            {status === "loading" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                "Join Waitlist"
                            )}
                        </Button>
                    </form>
                )}

                {status === "error" && (
                    <p className="text-sm text-destructive font-medium animate-pulse">{message}</p>
                )}
            </div>
        </div>
    );
}
