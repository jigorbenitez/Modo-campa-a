import type { MediaAsset } from "@/domain/shared/types";

export function AttachmentGallery({ attachments }: { attachments: MediaAsset[] }) {
  if (attachments.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No se adjuntaron archivos.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {attachments.map((attachment, index) => (
        <div key={attachment.id} className="flex aspect-[4/3] flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <span className="grid size-8 place-items-center rounded-lg bg-[var(--surface)] text-sm font-black text-[var(--accent)]">
            {attachment.type === "video" ? "▶" : "IMG"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold">{attachment.title}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
              {attachment.type === "video" ? "Video" : `Foto ${index + 1}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
