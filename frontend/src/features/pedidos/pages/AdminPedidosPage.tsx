import { useCallback, useState } from 'react'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { TablaPedidos } from '../components/TablaPedidos'
import { DetallePedido } from '../components/DetallePedido'
import { ESTADOS, type EstadoPedido, type Pedido } from '../types/pedido'
import { handleApiError } from '../../../shared/api/handleApiError'
import { formatPrecio } from '../../../shared/utils/formato'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { Alerta } from '../../../shared/components/Alerta'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'

const nombreEstado: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function AdminPedidosPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [cambio, setCambio] = useState<{ pedido: Pedido; estado: EstadoPedido } | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null)

  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: 0, limit: 100, estado: filtroEstado })
  const cambiarEstado = useCambiarEstadoPedido()

  const pedirConfirmacion = useCallback((pedido: Pedido, estado: EstadoPedido) => {
    setCambio({ pedido, estado })
  }, [])

  const confirmarCambio = async () => {
    if (!cambio) return
    try {
      await cambiarEstado.mutateAsync({ id: cambio.pedido.id, estado: cambio.estado })
      setMensaje({
        tipo: 'exito',
        texto:
          cambio.estado === 'CANCELADO'
            ? `Pedido #${cambio.pedido.id} cancelado. Se restituyó el stock de sus productos.`
            : `Pedido #${cambio.pedido.id} pasó a ${nombreEstado[cambio.estado]}`,
      })
    } catch (e) {
      setMensaje({ tipo: 'error', texto: handleApiError(e) })
    }
    setCambio(null)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Pedidos</h2>
        <label className="flex items-center gap-2 text-sm">
          Filtrar por estado:
          <select
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5"
            value={filtroEstado ?? ''}
            onChange={(e) => setFiltroEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)}
          >
            <option value="">Todos</option>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {nombreEstado[estado]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mensaje && (
        <div className="mb-3">
          <Alerta tipo={mensaje.tipo} mensaje={mensaje.texto} />
        </div>
      )}

      {isLoading && <SkeletonLista />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}
      {data && (
        <TablaPedidos pedidos={data.items} onVerDetalle={setDetalle} onCambiarEstado={pedirConfirmacion} />
      )}

      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onCerrar={() => setDetalle(null)} ancho="lg">
        {detalle && <DetallePedido pedido={detalle} />}
      </Modal>

      <Modal abierto={cambio !== null} titulo="Cambiar estado" onCerrar={() => setCambio(null)}>
        {cambio && (
          <>
            <p>
              ¿Pasar el pedido <b>#{cambio.pedido.id}</b> ({formatPrecio(cambio.pedido.total)}) de{' '}
              <b>{nombreEstado[cambio.pedido.estado]}</b> a <b>{nombreEstado[cambio.estado]}</b>?
            </p>
            {cambio.estado === 'CANCELADO' && (
              <p className="mt-2 text-sm text-stone-500">Al cancelar se devuelve el stock de cada producto.</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button variante="secundario" onClick={() => setCambio(null)}>
                Volver
              </Button>
              <Button
                variante={cambio.estado === 'CANCELADO' ? 'peligro' : 'primario'}
                cargando={cambiarEstado.isPending}
                onClick={() => void confirmarCambio()}
              >
                Confirmar
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
