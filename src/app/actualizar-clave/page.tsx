import { AuthScreen } from "@/components/auth/auth-screen";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <AuthScreen eyebrow="Seguridad" title="Definir nueva contraseña" description="Usá al menos ocho caracteres y evitá reutilizar una contraseña anterior.">
      <UpdatePasswordForm />
    </AuthScreen>
  );
}
