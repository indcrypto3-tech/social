import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        // TODO: Integrate Stripe
        // 1. Get stripe_customer_id from 'users' table or 'subscriptions' table
        // 2. Create billing portal session
        /*
        const session = await stripe.billingPortal.sessions.create({
            customer: userProfile.stripeCustomerId,
            return_url: `${request.headers.get('origin')}/settings`,
        })
        return NextResponse.redirect(session.url)
        */

        // Mock redirect for now
        const origin = request.headers.get('origin') || 'http://localhost:3000'
        console.log(`[Mock] Generating Stripe Portal for user ${user.id}`)

        // Redirect back for demo purposes with a success query param or similar
        // In a real app, this would go to Stripe
        return NextResponse.redirect(`${origin}/settings?billing_action=success`)
    } catch (error) {
        console.error(error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
