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

export type Profile = {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  role: "admin" | "sub_admin" | "user";
  created_at: string;
};

export type PromptTemplate = {
  id: string;
  title: string;
  description: string;
  template_text: string;
  category: string;
  variable_examples: Record<string, string>;
  variable_required: Record<string, boolean>;
  recommended_usage: string;
  recommended_ai: string;
  author_id: string | null;
  created_at: string;
  // joined
  profiles?: Profile;
};

export type Comment = {
  id: string;
  user_id: string;
  template_id: string;
  content: string;
  created_at: string;
  // joined
  profiles?: Profile;
};
