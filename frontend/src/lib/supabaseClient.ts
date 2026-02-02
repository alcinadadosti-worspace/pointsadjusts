import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Em vez de "throw" (que causa tela branca), a gente exporta null
 * e a UI mostra uma mensagem de configuração faltando.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const SUPABASE_ENV_OK = Boolean(supabaseUrl && supabaseAnonKey);
