import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-5 py-12">
      <section className="max-w-md text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-100 text-2xl">↯</span>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-amber-600">Modo sin conexión</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Seguís teniendo el control.</h1>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Podés continuar un recorrido y consultar las pantallas almacenadas. La sincronización se retomará automáticamente al volver la conexión.</p>
        <Link href="/recorrido" className="mt-6 inline-grid h-12 place-items-center rounded-2xl bg-[var(--accent)] px-6 text-sm font-black text-white">Abrir Modo Recorrida</Link>
      </section>
    </div>
  );
}
