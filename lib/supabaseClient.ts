import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pisnrogqkscrgusfxbfq.supabase.co';
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_I2v0KOGP59tcNh0ngafLZw_xzIOLUKQ';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
