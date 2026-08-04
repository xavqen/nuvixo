export function NoteCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="flex justify-between items-center">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-8 bg-muted rounded w-20" />
        </div>
      </div>
    </div>
  );
}
