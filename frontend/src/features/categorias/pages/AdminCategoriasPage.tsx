import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import { CategoriaForm } from '../components/CategoriaForm'
import type { Categoria, CategoriaCreate } from '../types/categoria'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Alerta } from '../../../shared/components/Alerta'

export function AdminCategoriasPage() {
  const { data: categorias, isLoading, isError, error, refetch } = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const abrirNueva = () => {
    setEditando(null)
    setErrorForm(null)
    setFormAbierto(true)
  }

  const abrirEdicion = (categoria: Categoria) => {
    setEditando(categoria)
    setErrorForm(null)
    setFormAbierto(true)
  }

  const guardar = async (datos: CategoriaCreate) => {
    setErrorForm(null)
    try {
      if (editando) {
        await actualizar.mutateAsync({ id: editando.id, datos })
        setMensaje('Categoría actualizada')
      } else {
        await crear.mutateAsync(datos)
        setMensaje('Categoría creada')
      }
      setFormAbierto(false)
    } catch (e) {
      setErrorForm(handleApiError(e))
    }
  }

  const confirmarEliminar = async () => {
    if (!aEliminar) return
    try {
      await eliminar.mutateAsync(aEliminar.id)
      setMensaje(`Categoría "${aEliminar.nombre}" dada de baja`)
    } catch (e) {
      setMensaje(handleApiError(e))
    }
    setAEliminar(null)
  }

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'nombre', header: 'Nombre' },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) => <span className="text-stone-500">{row.original.descripcion ?? '-'}</span>,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button tamanio="sm" variante="secundario" onClick={() => abrirEdicion(row.original)}>
              Editar
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
        <h2 className="text-xl font-semibold">Categorías</h2>
        <Button onClick={abrirNueva}>+ Nueva categoría</Button>
      </div>

      {mensaje && (
        <div className="mb-3">
          <Alerta tipo="exito" mensaje={mensaje} />
        </div>
      )}

      {isLoading && <SkeletonLista />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {categorias && <TablaDatos datos={categorias} columnas={columnas} />}

      <Modal
        abierto={formAbierto}
        titulo={editando ? 'Editar categoría' : 'Nueva categoría'}
        onCerrar={() => setFormAbierto(false)}
      >
        <div className="mb-3">
          <Alerta mensaje={errorForm} />
        </div>
        <CategoriaForm
          key={editando?.id ?? 'nueva'}
          inicial={editando}
          onGuardar={guardar}
          onCancelar={() => setFormAbierto(false)}
        />
      </Modal>

      <Modal abierto={aEliminar !== null} titulo="Eliminar categoría" onCerrar={() => setAEliminar(null)}>
        <p>
          ¿Seguro que querés dar de baja la categoría <b>{aEliminar?.nombre}</b>?
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Es una baja lógica: el nombre sigue reservado y sus productos no se ocultan (hay que darlos de baja aparte).
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
