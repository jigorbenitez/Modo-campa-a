import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { ConfigurationNotice } from "@/components/auth/configuration-notice";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthScreen eyebrow="Nuevo espacio" title="Crear una cuenta" description="Configurá el primer administrador y el municipio inicial." footer={<>¿Ya tenés cuenta? <Link href="/login" className="font-extrabold text-[var(--accent)]">Iniciar sesión</Link></>}>
      <ConfigurationNotice />
      <RegisterForm />
    </AuthScreen>
  );
}
