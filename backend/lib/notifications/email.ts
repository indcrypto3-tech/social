
import { Resend } from 'resend';

// Initialize Resend with API Key (ensure it's in .env)
// Initialize Resend lazily to allow for late environment variable loading
const getResendClient = () => {
    if (!process.env.RESEND_API_KEY) return null;
    return new Resend(process.env.RESEND_API_KEY);
};

type EmailPayload = {
    to: string;
    subject: string;
    html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
    const resend = getResendClient();

    if (!resend) {
        console.warn("RESEND_API_KEY is not set. Email not sent:", { to, subject });
        return { success: false, error: "Missing API Key" };
    }

    try {
        const data = await resend.emails.send({
            from: 'Social Scheduler <onboarding@resend.dev>', // Update with your domain
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
}
