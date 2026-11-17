interface PaginacionProps {
  pagina: number // empieza en 0
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) return null

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-100 disabled:opacity-40"
        disabled={pagina === 0}
        onClick={() => onCambiar(pagina - 1)}
      >
        ← Anterior
      </button>
      <span className="text-sm text-stone-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <button
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm hover:bg-stone-100 disabled:opacity-40"
        disabled={pagina >= totalPaginas - 1}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </button>
    </div>
  )
}
