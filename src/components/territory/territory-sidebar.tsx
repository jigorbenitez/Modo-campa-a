import type {
  NeighborhoodContextView,
  TerritoryCircuit,
  TerritoryCircuitContextView,
  TerritoryFeature,
  TerritoryNeighborhood,
} from "@/features/territorio-map";
import { TerritoryOverview } from "./territory-overview";

const kindLabels = {
  activity: "Actividad",
  problem: "Problema",
  commitment: "Compromiso",
  proposal: "Propuesta",
  document: "Documento",
  institution: "Institución",
  photo: "Fotografía",
};

function RelatedSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; status?: string }>;
}) {
  if (!items.length) return null;
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">{title}</h3>
        <span className="text-[10px] font-bold text-[var(--muted)]">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl bg-[var(--surface-muted)] p-3">
            <p className="text-xs font-extrabold">{item.title}</p>
            {item.status && <p className="mt-1 text-[10px] uppercase text-[var(--muted)]">{item.status.replaceAll("_", " ")}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureDetails({ feature, onClose }: { feature: TerritoryFeature; onClose: () => void }) {
  return (
    <div>
      <div className="border-b border-[var(--border)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
              {feature.subtype ?? kindLabels[feature.kind]}
            </p>
            <h2 className="mt-2 text-xl font-extrabold tracking-tight">{feature.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border)]" aria-label="Cerrar ficha">×</button>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{feature.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase">
          <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[var(--accent-strong)]">{feature.status.replaceAll("_", " ")}</span>
          <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[var(--muted)]">
            {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(feature.occurredAt))}
          </span>
        </div>
        <dl className="mt-4 grid gap-2 text-xs text-[var(--muted)]">
          <div className="flex justify-between gap-3"><dt>Localidad</dt><dd className="font-bold text-[var(--foreground)]">{feature.localidad}</dd></div>
          <div className="flex justify-between gap-3"><dt>Fuente</dt><dd className="text-right font-bold text-[var(--foreground)]">{feature.source}</dd></div>
          <div className="flex justify-between gap-3"><dt>Confianza</dt><dd className="font-bold text-[var(--foreground)]">{feature.confidence === "verified" ? "Verificada" : feature.confidence === "high" ? "Alta" : "Sin evaluar"}</dd></div>
          <div className="flex justify-between gap-3"><dt>Actualización</dt><dd className="font-bold text-[var(--foreground)]">{new Intl.DateTimeFormat("es-AR").format(new Date(feature.updatedAt))}</dd></div>
        </dl>
      </div>

      <div className="space-y-6 p-5">
        {feature.participants.length > 0 && (
          <section>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Participantes</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {feature.participants.map((participant) => (
                <span key={participant} className="rounded-full border border-[var(--border)] px-2.5 py-1.5 text-xs font-bold">{participant}</span>
              ))}
            </div>
          </section>
        )}
        <RelatedSection title="Problemas" items={feature.problems} />
        <RelatedSection title="Compromisos" items={feature.commitments} />
        <RelatedSection title="Propuestas" items={feature.proposals} />
        <RelatedSection title="Documentos" items={feature.documents} />
        <RelatedSection title="Publicaciones" items={feature.publications} />

        {(feature.photos.length > 0 || feature.videos.length > 0) && (
          <section>
            <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Fotos y videos</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[...feature.photos, ...feature.videos].map((asset) => (
                <div key={asset} className="flex aspect-[4/3] flex-col justify-end rounded-xl bg-[var(--surface-muted)] p-3">
                  <p className="truncate text-[10px] font-extrabold">{asset}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Historial</h3>
          <div className="mt-3 space-y-3 border-l border-[var(--border)] pl-4">
            {feature.history.map((item) => (
              <div key={`${item.at}-${item.label}`} className="relative">
                <span className="absolute -left-[1.18rem] top-1 size-2 rounded-full bg-[var(--accent)] ring-4 ring-[var(--surface)]" />
                <p className="text-xs font-bold">{item.label}</p>
                <p className="mt-1 text-[10px] text-[var(--muted)]">
                  {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.at))}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function NeighborhoodDetails({
  context,
  onClose,
  onSelectFeature,
}: {
  context: NeighborhoodContextView;
  onClose: () => void;
  onSelectFeature: (feature: TerritoryFeature) => void;
}) {
  const { neighborhood } = context;
  const stats = [
    ["Recorridas", context.tours],
    ["Problemas activos", context.activeProblems],
    ["Compromisos", context.commitments],
    ["Propuestas", context.proposals],
    ["Documentos", context.documents],
    ["Publicaciones", context.publications],
    ["Escuelas", context.schools],
    ["Jardines", context.kindergartens],
    ["Clubes", context.clubs],
    ["Plazas", context.squares],
    ["Centros de salud", context.healthCenters],
    ["Instituciones", context.institutions],
    ["Actividades", context.activities],
    ["Fotografías", context.photos],
  ] as const;

  return (
    <div>
      <div className="border-b border-[var(--border)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Contexto barrial</p>
            <h2 className="mt-2 text-2xl font-extrabold">{neighborhood.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border)]" aria-label="Cerrar barrio">×</button>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{neighborhood.description}</p>
        <div className="mt-4 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-extrabold text-[var(--accent-strong)]">
          Estado: {neighborhood.generalStatus === "stable" ? "estable" : neighborhood.generalStatus === "attention" ? "requiere atención" : "prioridad territorial"}
        </div>
      </div>
      <div className="space-y-6 p-5">
        {context.latestActivity && (
          <button type="button" onClick={() => onSelectFeature(context.latestActivity!)} className="w-full rounded-2xl bg-[var(--sidebar)] p-4 text-left text-white">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-300">Última actividad</p>
            <p className="mt-2 text-sm font-extrabold">{context.latestActivity.title}</p>
            <p className="mt-1 text-xs text-[var(--sidebar-muted)]">
              {new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(context.latestActivity.occurredAt))}
            </p>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[var(--surface-muted)] p-3">
              <p className="text-lg font-extrabold">{value}</p>
              <p className="text-[10px] font-bold uppercase text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </div>

        <section>
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Indicadores</h3>
          <div className="mt-2 space-y-2">
            {neighborhood.indicators.map((indicator) => (
              <div key={indicator.label} className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] p-3">
                <div><p className="text-xs font-extrabold">{indicator.label}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{indicator.context}</p></div>
                <span className="text-xs font-extrabold text-[var(--accent)]">{indicator.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Actividad territorial</h3>
          <div className="mt-2 space-y-2">
            {context.features.slice(0, 6).map((feature) => (
              <button key={feature.id} type="button" onClick={() => onSelectFeature(feature)} className="flex w-full items-center justify-between gap-3 rounded-xl bg-[var(--surface-muted)] p-3 text-left">
                <span><span className="block text-xs font-extrabold">{feature.title}</span><span className="mt-1 block text-[10px] text-[var(--muted)]">{kindLabels[feature.kind]}</span></span>
                <span className="text-[var(--muted)]">→</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CircuitDetails({
  context,
  onClose,
  onSelectFeature,
}: {
  context: TerritoryCircuitContextView;
  onClose: () => void;
  onSelectFeature: (feature: TerritoryFeature) => void;
}) {
  const stats = [
    ["Vecinos", context.neighbors],
    ["Instituciones", context.institutions],
    ["Escuelas", context.schools],
    ["Clubes", context.clubs],
    ["Hospitales", context.hospitals],
    ["CAPS", context.healthCenters],
    ["Recorridas", context.tours],
    ["Problemas", context.problems],
    ["Compromisos", context.commitments],
    ["Propuestas", context.proposals],
    ["Documentos", context.documents],
    ["Fotografías", context.photos],
  ] as const;

  return (
    <div>
      <div className="border-b border-[var(--border)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
              Circuito electoral
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">{context.circuit.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-[var(--border)]"
            aria-label="Cerrar circuito"
          >
            ×
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          División electoral oficial que complementa localidades y barrios sin reemplazarlos.
        </p>
        <dl className="mt-4 grid gap-2 text-xs text-[var(--muted)]">
          <div className="flex justify-between gap-3">
            <dt>Fuente</dt>
            <dd className="text-right font-bold text-[var(--foreground)]">
              Cámara Nacional Electoral
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>Licencia</dt>
            <dd className="font-bold text-[var(--foreground)]">{context.circuit.license}</dd>
          </div>
        </dl>
      </div>
      <div className="space-y-6 p-5">
        <div className="grid grid-cols-2 gap-2">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[var(--surface-muted)] p-3">
              <p className="text-lg font-extrabold">{value}</p>
              <p className="text-[10px] font-bold uppercase text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </div>

        <section>
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
            Contexto asociado
          </h3>
          {context.features.length ? (
            <div className="mt-2 space-y-2">
              {context.features.slice(0, 8).map((feature) => (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => onSelectFeature(feature)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl bg-[var(--surface-muted)] p-3 text-left"
                >
                  <span>
                    <span className="block text-xs font-extrabold">{feature.title}</span>
                    <span className="mt-1 block text-[10px] text-[var(--muted)]">
                      {kindLabels[feature.kind]}
                    </span>
                  </span>
                  <span className="text-[var(--muted)]">→</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-xl bg-[var(--surface-muted)] p-4 text-xs leading-5 text-[var(--muted)]">
              Todavía no hay información operativa asociada a este circuito.
            </p>
          )}
        </section>
        <section>
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Indicadores automáticos</h3>
          <p className="mt-2 rounded-xl bg-[var(--accent-soft)] p-3 text-xs leading-5 text-[var(--accent-strong)]">
            {context.activities === 0
              ? "No hay actividad registrada en el período visible."
              : `${context.activities} actividades conectadas y ${context.commitments} compromisos permiten evaluar la cobertura del circuito.`}
          </p>
        </section>
        <section>
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Acciones rápidas</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a href="/recorrido" className="rounded-xl bg-[var(--primary)] px-3 py-2.5 text-center text-xs font-extrabold text-white">Nueva recorrida</a>
            <a href="/propuestas" className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-center text-xs font-extrabold">Crear propuesta</a>
          </div>
        </section>
      </div>
    </div>
  );
}

export function TerritorySidebar({
  neighborhoods,
  circuits,
  selectedFeature,
  selectedNeighborhood,
  selectedCircuit,
  onSelectNeighborhood,
  onSelectCircuit,
  onSelectFeature,
  onClearFeature,
  onClearAll,
}: {
  neighborhoods: TerritoryNeighborhood[];
  circuits: TerritoryCircuit[];
  selectedFeature?: TerritoryFeature;
  selectedNeighborhood?: NeighborhoodContextView;
  selectedCircuit?: TerritoryCircuitContextView;
  onSelectNeighborhood: (id: string) => void;
  onSelectCircuit: (id: string) => void;
  onSelectFeature: (feature: TerritoryFeature) => void;
  onClearFeature: () => void;
  onClearAll: () => void;
}) {
  return (
    <aside className="h-full overflow-y-auto bg-[var(--surface)]">
      {selectedFeature ? (
        <FeatureDetails feature={selectedFeature} onClose={onClearFeature} />
      ) : selectedNeighborhood ? (
        <NeighborhoodDetails context={selectedNeighborhood} onClose={onClearAll} onSelectFeature={onSelectFeature} />
      ) : selectedCircuit ? (
        <CircuitDetails context={selectedCircuit} onClose={onClearAll} onSelectFeature={onSelectFeature} />
      ) : (
        <TerritoryOverview
          neighborhoods={neighborhoods}
          circuits={circuits}
          onSelect={onSelectNeighborhood}
          onSelectCircuit={onSelectCircuit}
        />
      )}
    </aside>
  );
}
