import { createClient } from "@supabase/supabase-js";

/**
 * No Vite, variáveis do tipo VITE_* são injetadas no build.
 * No Render, você DEVE configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas env vars do Static Site.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Exportamos um boolean para a UI avisar quando você estiver rodando local
 * sem configurar .env. (Mas o tipo do supabase não vira "null", para o TS não quebrar o build.)
 */
export const SUPABASE_ENV_OK = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Tipagem NÃO-NULL para não quebrar o TypeScript no build.
 * Se as envs não estiverem configuradas, o app pode falhar em runtime.
 * (Por isso usamos SUPABASE_ENV_OK na UI quando necessário.)
 */
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
