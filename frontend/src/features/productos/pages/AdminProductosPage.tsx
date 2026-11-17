import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { ImagenProducto } from '../components/ImagenProducto'
import type { Producto, ProductoCreate, ProductoStockUpdate } from '../types/producto'
import { handleApiError } from '../../../shared/api/handleApiError'
import { formatPrecio } from '../../../shared/utils/formato'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Alerta } from '../../../shared/components/Alerta'

export function AdminProductosPage() {
  // el panel pide limit=100 y pagina del lado del cliente con TanStack Table
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const { data: categorias = [] } = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const actualizarStock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [stockDe, setStockDe] = useState<Producto | null>(null)
  const [aEliminar, setAEliminar] = useState<Producto | null>(null)
  const [errorModal, setErrorModal] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const abrirForm = (producto: Producto | null) => {
    setEditando(producto)
    setErrorModal(null)
    setFormAbierto(true)
  }

  const guardar = async (datos: ProductoCreate) => {
    setErrorModal(null)
    try {
      if (editando) {
        await actualizar.mutateAsync({ id: editando.id, datos })
        setMensaje(`Producto "${datos.nombre}" actualizado`)
      } else {
        await crear.mutateAsync(datos)
        setMensaje(`Producto "${datos.nombre}" creado`)
      }
      setFormAbierto(false)
    } catch (e) {
      setErrorModal(handleApiError(e))
    }
  }

  const guardarStock = async (datos: ProductoStockUpdate) => {
    if (!stockDe) return
    setErrorModal(null)
    try {
      await actualizarStock.mutateAsync({ id: stockDe.id, datos })
      setMensaje(`Stock de "${stockDe.nombre}" actualizado a ${datos.stock}`)
      setStockDe(null)
    } catch (e) {
      setErrorModal(handleApiError(e))
    }
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    try {
      await eliminar.mutateAsync(aEliminar.id)
      setMensaje(`Producto "${aEliminar.nombre}" dado de baja`)
    } catch (e) {
      setMensaje(handleApiError(e))
    }
    setAEliminar(null)
  }

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        id: 'imagen',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <ImagenProducto url={row.original.imagen_url} alt={row.original.nombre} className="h-10 w-10 rounded text-base" />
        ),
      },
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        id: 'categoria',
        accessorFn: (p) => p.categoria.nombre,
        header: 'Categoría',
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ row }) => formatPrecio(row.original.precio_base),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span className={row.original.stock <= 5 ? 'font-semibold text-red-600' : ''}>{row.original.stock}</span>
        ),
      },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: ({ row }) =>
          row.original.disponible ? (
            <span className="text-green-700">Sí</span>
          ) : (
            <span className="text-red-600">No</span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            <Button tamanio="sm" variante="secundario" onClick={() => abrirForm(row.original)}>
              Editar
            </Button>
            <Button
              tamanio="sm"
              variante="secundario"
              onClick={() => {
                setErrorModal(null)
                setStockDe(row.original)
              }}
            >
              Stock
            </Button>
            <Button tamanio="sm" variante="peligro" onClick={() => setAEliminar(row.original)}>
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button onClick={() => abrirForm(null)} disabled={categorias.length === 0}>
          + Nuevo producto
        </Button>
      </div>

      {mensaje && (
        <div className="mb-3">
          <Alerta tipo="exito" mensaje={mensaje} />
        </div>
      )}

      {isLoading && <SkeletonLista />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {data && <TablaDatos datos={data.items} columnas={columnas} />}

      <Modal
        abierto={formAbierto}
        titulo={editando ? 'Editar producto' : 'Nuevo producto'}
        onCerrar={() => setFormAbierto(false)}
      >
        <div className="mb-3">
          <Alerta mensaje={errorModal} />
        </div>
        <ProductoForm
          key={editando?.id ?? 'nuevo'}
          inicial={editando}
          categorias={categorias}
          onGuardar={guardar}
          onCancelar={() => setFormAbierto(false)}
        />
      </Modal>

      <Modal abierto={stockDe !== null} titulo="Stock y disponibilidad" onCerrar={() => setStockDe(null)}>
        <div className="mb-3">
          <Alerta mensaje={errorModal} />
        </div>
        {stockDe && (
          <StockForm
            key={stockDe.id}
            producto={stockDe}
            onGuardar={guardarStock}
            onCancelar={() => setStockDe(null)}
          />
        )}
      </Modal>

      <Modal abierto={aEliminar !== null} titulo="Eliminar producto" onCerrar={() => setAEliminar(null)}>
        <p>
          ¿Seguro que querés dar de baja <b>{aEliminar?.nombre}</b>? Va a dejar de aparecer en el catálogo.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setAEliminar(null)}>
            Cancelar
          </Button>
          <Button variante="peligro" cargando={eliminar.isPending} onClick={() => void confirmarEliminar()}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
