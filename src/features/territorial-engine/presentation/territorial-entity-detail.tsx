import Link from "next/link";
import type { TerritorialEntity } from "../domain";
import { categoryLabel } from "@/features/territorial-quality";
import { calculateEnrichmentCoverage } from "@/features/territorial-enrichment/application";

const placeholderSections = [
  ["Documentos", "Los documentos relacionados aparecerán aquí."],
  ["Relaciones", "Personas, actividades y compromisos se conectarán sin modificar este agregado."],
  ["Actividad futura", "La cronología se completará al vincular operaciones del equipo."],
  ["Fotografías", "La evidencia visual conservará su origen y permisos."],
];

export function TerritorialEntityDetail({ entity }: { entity: TerritorialEntity | null }) {
  if (!entity) {
    return (
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-3xl place-items-center px-4 py-12 text-center">
        <section>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--accent-soft)] text-xl text-[var(--accent)]">⌖</span>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">Ficha territorial</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Entidad aún no disponible</h1>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">La pantalla está preparada para mostrar contexto completo cuando se incorporen los primeros registros.</p>
          <Link href="/territorio/entidades" className="premium-button mt-6 inline-flex h-11 items-center px-5 text-sm font-extrabold">Volver a Territorio</Link>
        </section>
      </div>
    );
  }

  const location = [entity.address?.formatted, entity.neighborhoodName, entity.localityName].filter(Boolean).join(" · ");
  const enrichment = calculateEnrichmentCoverage(entity);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      <Link href="/territorio/entidades" className="text-xs font-extrabold text-[var(--accent)]">← Territorio</Link>
      <header className="mt-6 border-b border-[var(--border)] pb-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]">{categoryLabel(entity.category)}</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">{entity.name}</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">{location || "Ubicación pendiente"}</p>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <DetailSection title="Información">
            <p>{entity.description || "Sin descripción."}</p>
            {!!entity.alternateNames?.length && <div className="mt-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wide">Nombres alternativos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {entity.alternateNames.map((name) => <span key={name} className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">{name}</span>)}
              </div>
            </div>}
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <DetailValue label="Categoría" value={categoryLabel(entity.category)} />
              <DetailValue label="Subcategoría" value={entity.subcategory ?? "Sin definir"} />
              <DetailValue label="Teléfono" value={entity.phone ?? "Sin registrar"} />
              <DetailValue label="Email" value={entity.email ?? "Sin registrar"} />
              <DetailValue label="Sitio web" value={entity.website ?? "Sin registrar"} />
              <DetailValue label="Horarios" value={String(entity.metadata.openingHours ?? "Sin registrar")} />
              <DetailValue label="Organismo responsable" value={String(entity.metadata.responsibleOrganization ?? "Sin registrar")} />
              <DetailValue label="Circuito electoral" value={String(entity.metadata.electoralCircuit ?? "Sin registrar")} />
              <DetailValue label="Estado" value={entity.status} />
            </dl>
          </DetailSection>
          <DetailSection title="Notas">
            <p>{entity.notes.length ? entity.notes.join(" · ") : "Todavía no hay notas incorporadas."}</p>
          </DetailSection>
          {!!entity.sources?.length && <DetailSection title="Fuentes e identificadores">
            <div className="space-y-3">
              {entity.sources.map((source) => <div key={source.externalId} className="rounded-xl bg-[var(--surface-muted)] p-3">
                <p className="font-extrabold text-[var(--foreground)]">{source.name}</p>
                <p className="mt-1 break-all text-xs">{source.externalId}</p>
                {source.url && <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 block break-all text-xs font-bold text-[var(--accent)]">Abrir fuente pública</a>}
                {source.license && <p className="mt-1 text-[10px]">Licencia: {source.license}</p>}
              </div>)}
            </div>
            <p className="mt-4 text-xs">Última actualización de fuente: {String(entity.metadata.sourceUpdatedAt ?? entity.updatedAt)}</p>
          </DetailSection>}
        </div>
        <div className="space-y-5">
          <DetailSection title="Ubicación">
            <p>{location || "Dirección no disponible."}</p>
            <p className="mt-3 text-xs">{entity.latitude === undefined ? "Coordenadas pendientes." : `${entity.latitude}, ${entity.longitude}`}</p>
            <Link href="/territorio" className="mt-4 inline-flex text-xs font-extrabold text-[var(--accent)]">Abrir en Mapa Vivo →</Link>
          </DetailSection>
          <DetailSection title="Cobertura">
            <div className="grid grid-cols-2 gap-3"><div className="rounded-xl bg-[var(--surface-muted)] p-3"><p className="text-[10px] font-extrabold uppercase">Calidad</p><strong className="mt-1 block text-2xl text-[var(--foreground)]">{enrichment.quality}%</strong></div><div className="rounded-xl bg-[var(--surface-muted)] p-3"><p className="text-[10px] font-extrabold uppercase">Completitud</p><strong className="mt-1 block text-2xl text-[var(--foreground)]">{enrichment.completeness}%</strong></div></div>
            <p className="mt-3 text-xs">Falta: {enrichment.missing.length ? enrichment.missing.join(" · ") : "ningún campo prioritario"}.</p>
          </DetailSection>
          {placeholderSections.map(([title, description]) => (
            <DetailSection key={title} title={title}><p>{description}</p></DetailSection>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]"><h2 className="text-lg font-black">{title}</h2><div className="mt-4 text-sm leading-6 text-[var(--muted)]">{children}</div></section>;
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--muted)]">{label}</dt><dd className="mt-1 font-bold text-[var(--foreground)]">{value}</dd></div>;
}
