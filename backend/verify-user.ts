import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    console.log('URL available:', !!url)
    console.log('Key available:', !!key)
    process.exit(1)
}

const supabase = createClient(url, key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function run() {
    const email = 'qa_user_02@test.com'
    console.log('Looking for user:', email)
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('List users error:', error)
        return
    }

    const user = users.find(u => u.email === email)
    if (!user) {
        console.error('User not found. Available users:', users.map(u => u.email))
        return
    }

    console.log('Found user:', user.id)

    const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true, user_metadata: { email_verified: true } }
    )

    if (updateError) {
        console.error('Update error:', updateError)
    } else {
        console.log('User verified:', email)
    }
}

run()
