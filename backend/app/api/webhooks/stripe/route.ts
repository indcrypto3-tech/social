import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '../../../../lib/stripe'
import { db } from '../../../../lib/db'
import { users } from '../../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session | Stripe.Subscription

    if (event.type === 'checkout.session.completed') {
        const checkoutSession = session as Stripe.Checkout.Session
        const subscriptionId = checkoutSession.subscription as string
        const customerId = checkoutSession.customer as string
        const userId = checkoutSession.metadata?.userId

        if (userId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)

            await db.update(users).set({
                stripeSubscriptionId: subscriptionId,
                stripeCustomerId: customerId,
                subscriptionPlan: 'pro', // This should be mapped from price ID in real app
                subscriptionStatus: subscription.status,
                refreshAt: new Date(subscription.current_period_end * 1000)
            }).where(eq(users.id, userId))
        }
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = session as Stripe.Subscription
        const dbUser = await db.query.users.findFirst({
            where: eq(users.stripeCustomerId, subscription.customer as string)
        })

        if (dbUser) {
            await db.update(users).set({
                subscriptionStatus: subscription.status,
                refreshAt: new Date(subscription.current_period_end * 1000),
                stripeSubscriptionId: subscription.id
            }).where(eq(users.id, dbUser.id))
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = session as Stripe.Subscription
        const dbUser = await db.query.users.findFirst({
            where: eq(users.stripeCustomerId, subscription.customer as string)
        })

        if (dbUser) {
            await db.update(users).set({
                subscriptionStatus: 'canceled',
                subscriptionPlan: 'free',
                refreshAt: null
            }).where(eq(users.id, dbUser.id))
        }
    }

    return new NextResponse('Webhook Received', { status: 200 })
}
