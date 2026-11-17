import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import { DetallePedido } from '../components/DetallePedido'
import type { Pedido } from '../types/pedido'
import { handleApiError } from '../../../shared/api/handleApiError'
import { formatFecha, formatPrecio } from '../../../shared/utils/formato'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Modal } from '../../../shared/ui/Modal'
import { Alerta } from '../../../shared/components/Alerta'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonLista } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'

const POR_PAGINA = 5

export function MisPedidosPage() {
  const location = useLocation()
  const recienCreado = (location.state as { pedidoCreado?: boolean } | null)?.pedidoCreado ?? false

  const [pagina, setPagina] = useState(0)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(
    recienCreado ? { tipo: 'exito', texto: '¡Pedido confirmado! Lo vas a ver acá abajo.' } : null,
  )

  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const confirmarCancelacion = async () => {
    if (!aCancelar) return
    try {
      await cancelar.mutateAsync(aCancelar.id)
      setMensaje({ tipo: 'exito', texto: `Pedido #${aCancelar.id} cancelado. El stock fue restituido.` })
    } catch (e) {
      setMensaje({ tipo: 'error', texto: handleApiError(e) })
    }
    setACancelar(null)
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>

      {mensaje && (
        <div className="mb-4">
          <Alerta tipo={mensaje.tipo} mensaje={mensaje.texto} />
        </div>
      )}

      {isLoading && <SkeletonLista />}
      {isError && <EstadoError error={error} onReintentar={() => void refetch()} />}

      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="rounded-lg bg-marca-600 px-4 py-2 font-medium text-white">
              Ir al catálogo
            </Link>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((pedido) => (
            <Card key={pedido.id} className="flex flex-wrap items-center gap-4">
              <div className="min-w-24">
                <p className="font-bold">Pedido #{pedido.id}</p>
                <p className="text-xs text-stone-500">{formatFecha(pedido.created_at)}</p>
              </div>
              <BadgeEstado estado={pedido.estado} />
              <p className="flex-1 text-sm text-stone-600">
                {pedido.items.map((i) => `${i.cantidad}× ${i.nombre_producto}`).join(', ')}
              </p>
              <p className="text-lg font-bold">{formatPrecio(pedido.total)}</p>
              <div className="flex gap-2">
                <Button tamanio="sm" variante="secundario" onClick={() => setDetalle(pedido)}>
                  Ver detalle
                </Button>
                {/* el cliente solo puede cancelar en PENDIENTE */}
                {pedido.estado === 'PENDIENTE' && (
                  <Button tamanio="sm" variante="peligro" onClick={() => setACancelar(pedido)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </Card>
          ))}
          <Paginacion
            pagina={pagina}
            totalPaginas={Math.ceil(data.total / POR_PAGINA)}
            onCambiar={setPagina}
          />
        </div>
      )}

      <Modal abierto={detalle !== null} titulo={`Pedido #${detalle?.id ?? ''}`} onCerrar={() => setDetalle(null)} ancho="lg">
        {detalle && <DetallePedido pedido={detalle} />}
      </Modal>

      <Modal abierto={aCancelar !== null} titulo="Cancelar pedido" onCerrar={() => setACancelar(null)}>
        <p>
          ¿Seguro que querés cancelar el pedido <b>#{aCancelar?.id}</b> por{' '}
          <b>{aCancelar ? formatPrecio(aCancelar.total) : ''}</b>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setACancelar(null)}>
            No, volver
          </Button>
          <Button variante="peligro" cargando={cancelar.isPending} onClick={() => void confirmarCancelacion()}>
            Sí, cancelar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
