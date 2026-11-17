import { useState } from 'react'
import { useProductos } from '../hooks/useProductos'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonGrilla } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'

const POR_PAGINA = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const busquedaDebounced = useDebounce(busqueda)

  const { data: categorias } = useCategorias()
  const { data, isLoading, isError, error, refetch, isFetching } = useProductos({
    skip: pagina * POR_PAGINA, // paginado en el servidor
    limit: POR_PAGINA,
    search: busquedaDebounced.trim() || undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0

  const cambiarCategoria = (id: number | undefined) => {
    setCategoriaId(id)
    setPagina(0)
  }

  const claseChip = (activo: boolean) =>
    `rounded-full px-3 py-1 text-sm font-medium border ${activo ? 'border-marca-600 bg-marca-600 text-white' : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-100'}`

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nuestro menú</h1>
        <p className="text-stone-500">Elegí lo que quieras y armá tu pedido.</p>
      </div>

      <div className="mb-6 space-y-3">
        <input
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
          placeholder="🔍 Buscar productos por nombre..."
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-100"
        />
        <div className="flex flex-wrap gap-2">
          <button className={claseChip(categoriaId === undefined)} onClick={() => cambiarCategoria(undefined)}>
            Todas
          </button>
          {categorias?.map((c) => (
            <button key={c.id} className={claseChip(categoriaId === c.id)} onClick={() => cambiarCategoria(c.id)}>
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <SkeletonGrilla cantidad={POR_PAGINA} />}

      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}

      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje="Probá con otra búsqueda o con otra categoría."
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <p className="mb-3 text-sm text-stone-500">
            {data.total} producto{data.total !== 1 && 's'} {isFetching && '· actualizando...'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
