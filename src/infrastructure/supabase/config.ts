export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export function isSupabaseConfigured(): boolean {
  if (process.env.ATIY_FORCE_DEMO_MODE === "true") return false;
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}
