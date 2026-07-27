import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ConfigurationNotice } from "@/components/auth/configuration-notice";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthScreen eyebrow="Acceso seguro" title="Bienvenido de nuevo" description="Ingresá para continuar trabajando con el contexto de tu municipio." footer={<>¿No tenés cuenta? <Link href="/registro" className="font-extrabold text-[var(--accent)]">Crear espacio</Link></>}>
      <ConfigurationNotice />
      <LoginForm />
      <Link href="/recuperar-clave" className="mt-4 block text-center text-xs font-bold text-[var(--muted)]">¿Olvidaste tu contraseña?</Link>
    </AuthScreen>
  );
}
