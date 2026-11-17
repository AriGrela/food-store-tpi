import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { TablaDatos } from '../../../shared/components/TablaDatos'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { formatFecha, formatPrecio } from '../../../shared/utils/formato'
import { TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const textoAccion: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'A preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelar',
}

interface TablaPedidosProps {
  pedidos: Pedido[]
  onVerDetalle: (pedido: Pedido) => void
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void
}

export function TablaPedidos({ pedidos, onVerDetalle, onCambiarEstado }: TablaPedidosProps) {
  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      { accessorKey: 'usuario_id', header: 'Cliente (ID)' },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => formatFecha(row.original.created_at),
      },
      {
        id: 'items',
        header: 'Ítems',
        accessorFn: (p) => p.items.reduce((acc, i) => acc + i.cantidad, 0),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => <span className="font-semibold">{formatPrecio(row.original.total)}</span>,
      },
      {
        accessorKey: 'forma_pago',
        header: 'Pago',
        cell: ({ row }) => (row.original.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        enableSorting: false,
        cell: ({ row }) => {
          const pedido = row.original
          return (
            <div className="flex flex-wrap gap-1.5">
              <Button tamanio="sm" variante="fantasma" onClick={() => onVerDetalle(pedido)}>
                Ver
              </Button>
              {/* solo muestro las transiciones validas segun la maquina de estados */}
              {TRANSICIONES[pedido.estado].map((destino) => (
                <Button
                  key={destino}
                  tamanio="sm"
                  variante={destino === 'CANCELADO' ? 'peligro' : 'primario'}
                  onClick={() => onCambiarEstado(pedido, destino)}
                >
                  {textoAccion[destino]}
                </Button>
              ))}
            </div>
          )
        },
      },
    ],
    [onVerDetalle, onCambiarEstado],
  )

  return <TablaDatos datos={pedidos} columnas={columnas} />
}
