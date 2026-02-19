import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export type PromptTemplate = {
  id: string;
  title: string;
  description: string;
  template_text: string;
  category: string;
  variable_examples: Record<string, string>;
  variable_required: Record<string, boolean>;
  created_at: string;
};
