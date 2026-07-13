import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxdatmpilygchplcuxqx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4ZGF0bXBpbHlnY2hwbGN1eHF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NDczMzQsImV4cCI6MjA5OTUyMzMzNH0.J3w4tH8BUqfdL0ZBn0fQ68rzS9_pxcceLGomBdFlXzs';
export const supabase = createClient(supabaseUrl, supabaseKey);