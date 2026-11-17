import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'
import { useAuthStore } from '../../../store/authStore'
import { handleApiError } from '../../../shared/api/handleApiError'
import { formatFecha } from '../../../shared/utils/formato'
import { Button } from '../../../shared/ui/Button'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Alerta } from '../../../shared/components/Alerta'

export function AdminUsuariosPage() {
  const { data: usuarios, isLoading, isError, error, refetch } = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const idSesion = useAuthStore((s) => s.usuario?.id)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  const columnas = useMemo<ColumnDef<Usuario>[]>(() => {
    const cambiarEstado = async (usuario: Usuario, accion: 'activar' | 'desactivar') => {
      try {
        if (accion === 'activar') await activar.mutateAsync(usuario.id)
        else await desactivar.mutateAsync(usuario.id)
        setMensaje({ tipo: 'exito', texto: `Usuario ${usuario.username} ${accion === 'activar' ? 'activado' : 'desactivado'}` })
      } catch (e) {
        setMensaje({ tipo: 'error', texto: handleApiError(e) })
      }
    }

    return [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => (
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${row.original.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-stone-600'}`}
          >
            {row.original.role}
          </span>
        ),
      },
      {
        id: 'estado',
        accessorFn: (u) => (u.disabled ? 'Desactivado' : 'Activo'),
        header: 'Estado',
        cell: ({ row }) =>
          row.original.disabled ? (
            <span className="font-medium text-red-600">Desactivado</span>
          ) : (
            <span className="font-medium text-green-700">Activo</span>
          ),
      },
      {
        accessorKey: 'created_at',
        header: 'Alta',
        cell: ({ row }) => <span className="text-stone-500">{formatFecha(row.original.created_at)}</span>,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original
          // no muestro "Desactivar" en mi propia fila
          if (u.id === idSesion) return <span className="text-xs text-stone-400">(vos)</span>
          return u.disabled ? (
            <Button tamanio="sm" onClick={() => void cambiarEstado(u, 'activar')}>
              Activar
            </Button>
          ) : (
            <Button tamanio="sm" variante="peligro" onClick={() => void cambiarEstado(u, 'desactivar')}>
              Desactivar
            </Button>
          )
        },
      },
    ]
  }, [activar, desactivar, idSesion])

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Usuarios</h2>
      {mensaje && (
        <div className="mb-3">
          <Alerta tipo={mensaje.tipo} mensaje={mensaje.texto} />
        </div>
      )}
      {isLoading && <SkeletonLista />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {usuarios && <TablaDatos datos={usuarios} columnas={columnas} />}
    </div>
  )
}
