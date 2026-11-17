import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'

interface TablaDatosProps<T> {
  datos: T[]
  columnas: ColumnDef<T>[]
  buscador?: boolean
  filasPorPagina?: number
}

/** Tabla generica con TanStack Table: orden, filtro global y paginacion del lado del cliente */
export function TablaDatos<T>({ datos, columnas, buscador = true, filasPorPagina = 8 }: TablaDatosProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [filtro, setFiltro] = useState('')

  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    state: { sorting, globalFilter: filtro },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: filasPorPagina } },
  })

  return (
    <div>
      {buscador && (
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar en la tabla..."
          className="mb-3 w-full max-w-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-marca-500"
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-stone-600">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`px-3 py-2 font-semibold ${header.column.getCanSort() ? 'cursor-pointer select-none' : ''}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="border-t border-stone-100 hover:bg-stone-50">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-3 py-2 align-middle">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {tabla.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columnas.length} className="px-3 py-8 text-center text-stone-500">
                  No hay registros para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {tabla.getPageCount() > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2 text-sm">
          <button
            className="rounded border border-stone-300 bg-white px-2 py-1 disabled:opacity-40"
            onClick={() => tabla.previousPage()}
            disabled={!tabla.getCanPreviousPage()}
          >
            ←
          </button>
          <span>
            Página {tabla.getState().pagination.pageIndex + 1} de {tabla.getPageCount()}
          </span>
          <button
            className="rounded border border-stone-300 bg-white px-2 py-1 disabled:opacity-40"
            onClick={() => tabla.nextPage()}
            disabled={!tabla.getCanNextPage()}
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
