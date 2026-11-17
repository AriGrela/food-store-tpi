import { useResumenPedidos } from '../hooks/usePedidos'
import { TarjetaResumen } from '../components/TarjetaResumen'
import { formatPrecio } from '../../../shared/utils/formato'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'

export function AdminResumenPage() {
  const { data: resumen, isLoading, isError, error, refetch } = useResumenPedidos()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  if (isError || !resumen) {
    return <EstadoError error={error} onReintentar={() => void refetch()} />
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Resumen del negocio</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TarjetaResumen titulo="Pedidos de hoy" valor={resumen.pedidos_hoy} icono="📅" />
        <TarjetaResumen
          titulo="Ingresos (entregados)"
          valor={formatPrecio(resumen.ingresos_entregados)}
          icono="💰"
          color="bg-green-50"
        />
        <TarjetaResumen titulo="Pendientes" valor={resumen.pendientes} icono="⏳" color="bg-amber-50" />
        <TarjetaResumen titulo="En preparación" valor={resumen.en_preparacion} icono="👨‍🍳" color="bg-blue-50" />
        <TarjetaResumen titulo="Entregados" valor={resumen.entregados} icono="✅" />
        <TarjetaResumen titulo="Cancelados" valor={resumen.cancelados} icono="❌" color="bg-red-50" />
      </div>
    </div>
  )
}
