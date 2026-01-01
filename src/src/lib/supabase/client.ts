import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

export const supabase = createSupabaseClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export function createClient() {
  return supabase;
}