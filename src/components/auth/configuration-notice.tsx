import { isSupabaseConfigured } from "@/infrastructure/supabase/config";

export function ConfigurationNotice() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
      Modo demostración: agregá las variables de Supabase para habilitar cuentas reales. El resto de la aplicación continúa disponible.
    </div>
  );
}
