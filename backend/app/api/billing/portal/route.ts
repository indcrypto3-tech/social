import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { stripe } from '../../../../lib/stripe'
import { db } from '../../../../lib/db'
import { users } from '../../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { withErrorHandler, normalizeResponse } from '../../../../middleware/error'
import { AuthError, NotFoundError } from '../../../../lib/errors'

export const POST = withErrorHandler(async (req: Request) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new AuthError()

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id)
    })

    if (!dbUser || !dbUser.stripeCustomerId) {
        throw new NotFoundError('No billing information found')
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        // Ensure FRONTEND_URL is set, or fallback to referrer/origin
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`,
    })

    return normalizeResponse({ url: session.url })
});
