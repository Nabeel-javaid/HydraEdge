import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kkpjoyextzeaksenddwv.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrcGpveWV4dHplYWtzZW5kZHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyODY0MzMsImV4cCI6MjA1Mzg2MjQzM30.p87Nqgf3YkJDWrplgmMJFHP73FqOfhU9h8TQ6dFtp-U';

export const supabase = createClient(supabaseUrl, supabaseServiceRole);