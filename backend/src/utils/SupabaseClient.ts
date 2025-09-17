import { createClient } from '@supabase/supabase-js'

// ⚠️ Backend usa la SERVICE_ROLE_KEY
const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})
