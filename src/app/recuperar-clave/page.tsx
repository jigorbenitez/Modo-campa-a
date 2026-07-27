import Link from "next/link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { PasswordResetForm } from "@/components/auth/password-reset-form";

export default function RecoverPasswordPage() {
  return (
    <AuthScreen eyebrow="Recuperación" title="Recuperar acceso" description="Enviaremos un enlace de un solo uso al correo de la cuenta." footer={<Link href="/login" className="font-extrabold text-[var(--accent)]">Volver al inicio de sesión</Link>}>
      <PasswordResetForm />
    </AuthScreen>
  );
}
