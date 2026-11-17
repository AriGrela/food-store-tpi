import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import { CheckoutForm, type DatosCheckout } from '../components/CheckoutForm'
import { handleApiError } from '../../../shared/api/handleApiError'
import { formatPrecio } from '../../../shared/utils/formato'
import { Card } from '../../../shared/ui/Card'
import { Alerta } from '../../../shared/components/Alerta'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const confirmar = async (datos: DatosCheckout) => {
    setError(null)
    try {
      await crearPedido.mutateAsync({
        ...datos,
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      })
      vaciar()
      navigate('/mis-pedidos', { state: { pedidoCreado: true } })
    } catch (e) {
      // ej: stock insuficiente -> el backend no guarda nada y muestro el detail
      setError(handleApiError(e))
    }
  }

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        mensaje="Tu carrito está vacío."
        accion={
          <Link to="/" className="rounded-lg bg-marca-600 px-4 py-2 font-medium text-white">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-semibold">Datos de entrega</h2>
          {error && (
            <div className="mb-4">
              <Alerta mensaje={error} />
            </div>
          )}
          <CheckoutForm onConfirmar={confirmar} />
          <p className="mt-3 text-xs text-stone-500">
            El pago es manual: se abona en efectivo al recibir o por transferencia.
          </p>
        </Card>

        <Card className="h-fit p-5">
          <h2 className="text-lg font-semibold">Tu pedido</h2>
          <div className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.producto_id} className="flex justify-between">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatPrecio(i.precio_unitario * i.cantidad)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-stone-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrecio(total)}</span>
          </div>
          <Link to="/carrito" className="mt-3 block text-sm text-marca-600 hover:underline">
            ← Volver al carrito
          </Link>
        </Card>
      </div>
    </div>
  )
}
