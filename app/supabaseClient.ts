import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kxdatmpilygchplcuxqx.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_UijhQBIt90PenY6nRUi9zg_zDxFEJgb';

export const supabase = createClient(supabaseUrl, supabaseKey);
