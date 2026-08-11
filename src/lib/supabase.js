import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wqympfcmxhvkdwmevtqj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PonBL-Kgeb3Yi358MGzjuw_2oQG2Sl4';

export const supabase = createClient(supabaseUrl, supabaseKey);

// For admin backend operations, we ideally use the service_role key.
// But since we only have the anon key right now, we will use it for both.
export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);
