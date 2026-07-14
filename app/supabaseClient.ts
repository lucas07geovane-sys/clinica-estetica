import { createClient } from '@supabase/supabase-js';

const supabaseUrl ='https://kxdatmpilygchplcuxqx.supabase.co';
const supabaseKey ='sb_publishable_UijhQBIt90PenY6nRUi9zg_zDxFEJgb';

export const supabase = createClient(supabaseUrl, supabaseKey);
