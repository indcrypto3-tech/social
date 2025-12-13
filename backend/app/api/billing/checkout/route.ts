import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'
import { stripe } from '../../../../lib/stripe'
import { db } from '../../../../lib/db'
import { users } from '../../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { withErrorHandler, normalizeResponse } from '../../../../middleware/error'
import { AuthError, NotFoundError, ValidationError } from '../../../../lib/errors'

export const POST = withErrorHandler(async (req: Request) => {
    const { priceId } = await req.json()

    if (!priceId) {
        throw new ValidationError("Price ID is required");
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new AuthError()
    }

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id)
    })

    if (!dbUser) {
        throw new NotFoundError('User not found')
    }

    let customerId = dbUser.stripeCustomerId

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: dbUser.email,
            metadata: {
                userId: user.id
            }
        })
        customerId = customer.id
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id))
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
            {
                price: priceId,
                quantity: 1
            }
        ],
        mode: 'subscription',
        success_url: `${frontendUrl}/billing?success=true`,
        cancel_url: `${frontendUrl}/billing?canceled=true`,
        metadata: {
            userId: user.id
        }
    })

    return normalizeResponse({ url: session.url })
});
