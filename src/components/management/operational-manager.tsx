"use client";

import { useEffect, useMemo, useState } from "react";

export interface ManagerField {
  id: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "date"
    | "datetime-local"
    | "number"
    | "email"
    | "tel"
    | "url"
    | "select";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface ManagedAttachment {
  name: string;
  size: number;
  type: string;
}

export interface ManagedRecord {
  id: string;
  values: Record<string, string>;
  status: string;
  attachments: ManagedAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface ManagerStatus {
  value: string;
  label: string;
}

const storageEvent = "atiy:operational-records-changed";

export function OperationalManager({
  storageKey,
  eyebrow,
  title,
  description,
  singular,
  fields,
  statuses,
  primaryField,
  secondaryField,
  allowArchive = false,
  locationFields,
  categoryFilterField,
}: {
  storageKey: string;
  eyebrow: string;
  title: string;
  description: string;
  singular: string;
  fields: ManagerField[];
  statuses: ManagerStatus[];
  primaryField: string;
  secondaryField?: string;
  allowArchive?: boolean;
  locationFields?: { latitude: string; longitude: string };
  categoryFilterField?: string;
}) {
  const [records, setRecords] = useState<ManagedRecord[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState<ManagedRecord>();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
        setRecords(Array.isArray(parsed) ? parsed : []);
      } catch {
        setRecords([]);
      }
    };
    queueMicrotask(load);
    window.addEventListener("storage", load);
    window.addEventListener(storageEvent, load);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener(storageEvent, load);
    };
  }, [storageKey]);

  const visibleRecords = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es-AR");
    return records
      .filter(
        (record) =>
          (statusFilter === "all" || record.status === statusFilter) &&
          (categoryFilter === "all" || !categoryFilterField || record.values[categoryFilterField] === categoryFilter) &&
          (!normalized ||
            Object.values(record.values)
              .join(" ")
              .toLocaleLowerCase("es-AR")
              .includes(normalized)),
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }, [categoryFilter, categoryFilterField, query, records, statusFilter]);

  function persist(next: ManagedRecord[]) {
    setRecords(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(storageEvent));
  }

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(record: ManagedRecord) {
    setEditing(record);
    setDialogOpen(true);
  }

  function saveRecord(input: Omit<ManagedRecord, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    if (editing) {
      persist(
        records.map((record) =>
          record.id === editing.id
            ? { ...editing, ...input, updatedAt: now }
            : record,
        ),
      );
    } else {
      persist([
        {
          ...input,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        },
        ...records,
      ]);
    }
    setEditing(undefined);
    setDialogOpen(false);
  }

  function duplicate(record: ManagedRecord) {
    const now = new Date().toISOString();
    persist([
      {
        ...structuredClone(record),
        id: crypto.randomUUID(),
        values: {
          ...record.values,
          [primaryField]: `${record.values[primaryField] ?? singular} (copia)`,
        },
        createdAt: now,
        updatedAt: now,
      },
      ...records,
    ]);
  }

  function remove(record: ManagedRecord) {
    if (!window.confirm(`¿Querés eliminar “${record.values[primaryField] ?? singular}”?`)) {
      return;
    }
    persist(records.filter((item) => item.id !== record.id));
  }

  function archive(record: ManagedRecord) {
    const now = new Date().toISOString();
    persist(
      records.map((item) =>
        item.id === record.id
          ? { ...item, status: "archived", updatedAt: now }
          : item,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="flex flex-col justify-between gap-6 border-b border-[var(--border)] pb-8 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        <button type="button" onClick={openNew} className="premium-button h-12 px-5 text-sm font-extrabold">
          Crear {singular.toLocaleLowerCase("es-AR")}
        </button>
      </header>

      <section className="mt-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] md:grid-cols-[1fr_220px_auto]">
        <label>
          <span className="sr-only">Buscar</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar ${title.toLocaleLowerCase("es-AR")}`}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label>
          <span className="sr-only">Filtrar por estado</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-bold"
          >
            <option value="all">Todos los estados</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          {categoryFilterField && (() => {
            const field = fields.find((item) => item.id === categoryFilterField);
            return field?.options ? <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label={`Filtrar por ${field.label}`} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs font-bold"><option value="all">Todas las categorías</option>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : null;
          })()}
        </label>
        <div className="flex items-center justify-end px-2 text-xs font-bold text-[var(--muted)]">
          {visibleRecords.length} registros
        </div>
      </section>

      {visibleRecords.length ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleRecords.map((record) => (
            <article key={record.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold">
                    {record.values[primaryField] || `Sin ${primaryField}`}
                  </p>
                  {secondaryField && record.values[secondaryField] ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                      {record.values[secondaryField]}
                    </p>
                  ) : null}
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[10px] font-extrabold text-[var(--accent-strong)]">
                  {statuses.find((status) => status.value === record.status)?.label ?? record.status}
                </span>
              </div>
              <dl className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                {fields
                  .filter((field) => ![primaryField, secondaryField].includes(field.id))
                  .filter((field) => record.values[field.id])
                  .slice(0, 4)
                  .map((field) => (
                    <div key={field.id} className="flex justify-between gap-3 text-xs">
                      <dt className="text-[var(--muted)]">{field.label}</dt>
                      <dd className="max-w-[60%] truncate text-right font-bold">
                        {field.options?.find((option) => option.value === record.values[field.id])?.label ??
                          record.values[field.id]}
                      </dd>
                    </div>
                  ))}
              </dl>
              {record.attachments.length ? (
                <p className="mt-4 text-[10px] font-bold uppercase text-[var(--muted)]">
                  {record.attachments.length} archivo{record.attachments.length === 1 ? "" : "s"}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(record)} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs font-extrabold">Editar</button>
                <button type="button" onClick={() => duplicate(record)} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs font-extrabold">Duplicar</button>
                {allowArchive && record.status !== "archived" ? (
                  <button type="button" onClick={() => archive(record)} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs font-extrabold">Archivar</button>
                ) : null}
                {locationFields &&
                record.values[locationFields.latitude] &&
                record.values[locationFields.longitude] ? (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${encodeURIComponent(record.values[locationFields.latitude])}&mlon=${encodeURIComponent(record.values[locationFields.longitude])}#map=17/${encodeURIComponent(record.values[locationFields.latitude])}/${encodeURIComponent(record.values[locationFields.longitude])}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs font-extrabold"
                  >
                    Geolocalizar
                  </a>
                ) : null}
                <button type="button" onClick={() => remove(record)} className="ml-auto rounded-lg px-3 py-2 text-xs font-extrabold text-[var(--danger)] hover:bg-red-50 dark:hover:bg-red-950/20">Eliminar</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-6 grid min-h-72 place-items-center rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-8 text-center">
          <div className="max-w-md">
            <h2 className="text-xl font-extrabold">
              {records.length ? "No hay coincidencias" : `Todavía no hay ${title.toLocaleLowerCase("es-AR")}`}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {records.length
                ? "Cambiá la búsqueda o el estado seleccionado."
                : `Creá el primer registro para comenzar a trabajar con información propia.`}
            </p>
            {!records.length ? (
              <button type="button" onClick={openNew} className="premium-button mt-5 h-11 px-4 text-xs font-extrabold">
                Crear {singular.toLocaleLowerCase("es-AR")}
              </button>
            ) : null}
          </div>
        </section>
      )}

      {dialogOpen ? (
        <RecordDialog
          key={editing?.id ?? "new"}
          record={editing}
          singular={singular}
          fields={fields}
          statuses={statuses}
          onClose={() => {
            setDialogOpen(false);
            setEditing(undefined);
          }}
          onSave={saveRecord}
        />
      ) : null}
    </div>
  );
}

function RecordDialog({
  record,
  singular,
  fields,
  statuses,
  onClose,
  onSave,
}: {
  record?: ManagedRecord;
  singular: string;
  fields: ManagerField[];
  statuses: ManagerStatus[];
  onClose: () => void;
  onSave: (input: Omit<ManagedRecord, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    () => record?.values ?? Object.fromEntries(fields.map((field) => [field.id, ""])),
  );
  const [status, setStatus] = useState(record?.status ?? statuses[0]?.value ?? "active");
  const [attachments, setAttachments] = useState<ManagedAttachment[]>(
    record?.attachments ?? [],
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ values, status, attachments });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[var(--surface)] shadow-2xl sm:max-h-[88vh] sm:rounded-3xl">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
              {record ? "Editar" : "Nuevo registro"}
            </p>
            <h2 className="mt-1 text-xl font-extrabold">{singular}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-xl border border-[var(--border)]" aria-label="Cerrar">×</button>
        </header>
        <div className="grid gap-5 overflow-y-auto p-5 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.id} className={field.type === "textarea" ? "sm:col-span-2" : undefined}>
              <span className="mb-2 block text-xs font-extrabold text-[var(--muted)]">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  required={field.required}
                  value={values[field.id] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-3 text-sm outline-none focus:border-[var(--accent)]"
                />
              ) : field.type === "select" ? (
                <select
                  required={field.required}
                  value={values[field.id] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))}
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
                >
                  <option value="">Seleccionar</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  required={field.required}
                  type={field.type ?? "text"}
                  value={values[field.id] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))}
                  placeholder={field.placeholder}
                  className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm outline-none focus:border-[var(--accent)]"
                />
              )}
            </label>
          ))}
          <label>
            <span className="mb-2 block text-xs font-extrabold text-[var(--muted)]">Estado</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm">
              {statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-xs font-extrabold text-[var(--muted)]">Archivos y documentos</span>
            <input
              type="file"
              multiple
              onChange={(event) =>
                setAttachments((current) => [
                  ...current,
                  ...Array.from(event.target.files ?? []).map((file) => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                  })),
                ])
              }
              className="block w-full text-xs text-[var(--muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface-muted)] file:px-3 file:py-2 file:text-xs file:font-bold"
            />
          </label>
          {attachments.length ? (
            <div className="sm:col-span-2">
              <p className="text-xs font-extrabold text-[var(--muted)]">Archivos adjuntos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <button
                    key={`${attachment.name}-${index}`}
                    type="button"
                    onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    className="rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold"
                    title="Quitar archivo"
                  >
                    {attachment.name} ×
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <footer className="flex justify-end gap-3 border-t border-[var(--border)] px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-extrabold text-[var(--muted)]">Cancelar</button>
          <button type="submit" className="premium-button px-5 py-3 text-sm font-extrabold">Guardar</button>
        </footer>
      </form>
    </div>
  );
}
