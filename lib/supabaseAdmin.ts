import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pisnrogqkscrgusfxbfq.supabase.co';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || 'sb_secret_216lrGKov740wQ8CKL07kg_3r9m1Pg0';

// Privileged server-side client for atomic database operations & double-booking prevention
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
