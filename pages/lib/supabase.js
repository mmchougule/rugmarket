import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://chpfmfkiydbqubclwahq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocGZtZmtpeWRicXViY2x3YWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2NjgxMjksImV4cCI6MjA0MzI0NDEyOX0.7uzGcT7tUq-e9QboW_1IB01aYbCsLSjLR85u2M7vFgI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// REACT_APP_SUPABASE_URL=https://chpfmfkiydbqubclwahq.supabase.co
// REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNocGZtZmtpeWRicXViY2x3YWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2NjgxMjksImV4cCI6MjA0MzI0NDEyOX0.7uzGcT7tUq-e9QboW_1IB01aYbCsLSjLR85u2M7vFgI
// # butterfly@Vimanai supabase