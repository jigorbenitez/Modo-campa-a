export default function TerritorialDirectoryLoading() {
  return (
    <div className="grid min-h-[calc(100vh-5rem)] place-items-center">
      <div className="text-center">
        <span className="atiy-spinner mx-auto block size-8 animate-spin rounded-full border-2" />
        <p className="mt-4 text-xs font-extrabold text-[var(--muted)]">Preparando Territorio…</p>
      </div>
    </div>
  );
}
