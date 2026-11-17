import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { formatPrecio } from '../../../shared/utils/formato'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { ImagenProducto } from '../../productos/components/ImagenProducto'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const quitar = useCartStore((s) => s.quitar)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos desde el catálogo."
        accion={
          <Link to="/" className="rounded-lg bg-marca-600 px-4 py-2 font-medium text-white hover:bg-marca-700">
            Ver catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Mi carrito</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.producto_id} className="flex items-center gap-4">
              <ImagenProducto url={item.imagen_url} alt={item.nombre} className="h-16 w-16 rounded-lg" />
              <div className="flex-1">
                <p className="font-semibold">{item.nombre}</p>
                <p className="text-sm text-stone-500">{formatPrecio(item.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="h-8 w-8 rounded-lg border border-stone-300 hover:bg-stone-100"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                  aria-label="Restar"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{item.cantidad}</span>
                <button
                  className="h-8 w-8 rounded-lg border border-stone-300 hover:bg-stone-100 disabled:opacity-40"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.stock}
                  aria-label="Sumar"
                >
                  +
                </button>
              </div>
              <p className="w-28 text-right font-semibold">{formatPrecio(item.precio_unitario * item.cantidad)}</p>
              <button
                className="text-sm text-red-600 hover:underline"
                onClick={() => quitar(item.producto_id)}
              >
                Quitar
              </button>
            </Card>
          ))}
          <button className="text-sm text-stone-500 hover:text-red-600 hover:underline" onClick={vaciar}>
            Vaciar carrito
          </button>
        </div>

        <Card className="h-fit p-5">
          <h2 className="text-lg font-semibold">Resumen</h2>
          <div className="mt-3 space-y-1 text-sm">
            {items.map((i) => (
              <div key={i.producto_id} className="flex justify-between text-stone-600">
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
          <Button className="mt-4 w-full" onClick={() => navigate('/checkout')}>
            Continuar con el pedido
          </Button>
          <Link to="/" className="mt-2 block text-center text-sm text-marca-600 hover:underline">
            Seguir comprando
          </Link>
        </Card>
      </div>
    </div>
  )
}
