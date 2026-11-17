export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />
}

/** Grilla de tarjetas "fantasma" mientras carga el catalogo */
export function SkeletonGrilla({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cantidad }).map((_, i) => (
        <div key={i} className="rounded-xl border border-stone-200 bg-white p-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="mt-3 h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

/** Filas "fantasma" para listas y tablas */
export function SkeletonLista({ filas = 4 }: { filas?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: filas }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}
