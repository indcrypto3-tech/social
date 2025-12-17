import { createClient } from '@/lib/supabase/server'
// import { db } from '@/lib/db'
// import { users } from '@/lib/db/schema'
// import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { BillingContent } from './components/billing-content'
import { PageHeader } from '../components/page-header'
import { Separator } from '@/components/ui/separator'

export default async function BillingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // TODO: Fetch from Backend API
    // const dbUser = await db.query.users.findFirst(...)

    // Defaults (Stubbed)
    const plan = 'free'
    const status = 'inactive'
    const refreshAt = null

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6 md:p-10 pb-16">
            <PageHeader heading="Billing & Subscription" text="Manage your subscription plan and billing information." />
            <BillingContent plan={plan} status={status} date={refreshAt} />
        </div>
    )
}
