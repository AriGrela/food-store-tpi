import { useCartStore } from '../../../store/cartStore'
import { formatPrecio } from '../../../shared/utils/formato'
import { Button } from '../../../shared/ui/Button'
import { ImagenProducto } from './ImagenProducto'
import type { Producto } from '../types/producto'

interface ProductoCardProps {
  producto: Producto
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  )

  const sinStock = producto.stock === 0
  const puedeAgregar = producto.disponible && !sinStock && enCarrito < producto.stock

  let textoBoton = 'Agregar al carrito'
  if (!producto.disponible) textoBoton = 'No disponible'
  else if (sinStock) textoBoton = 'Sin stock'
  else if (enCarrito >= producto.stock) textoBoton = 'Máximo en carrito'

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <ImagenProducto url={producto.imagen_url} alt={producto.nombre} className="h-40 w-full" />
      <div className="flex flex-1 flex-col p-3">
        <span className="text-xs font-medium uppercase tracking-wide text-marca-600">
          {producto.categoria.nombre}
        </span>
        <h3 className="mt-1 font-semibold">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 text-sm text-stone-500">{producto.descripcion}</p>}
        <div className="mt-auto pt-3">
          <div className="flex items-end justify-between">
            <span className="text-lg font-bold">{formatPrecio(producto.precio_base)}</span>
            <span className={`text-xs ${producto.stock <= 5 ? 'text-red-600' : 'text-stone-500'}`}>
              Stock: {producto.stock}
            </span>
          </div>
          {enCarrito > 0 && <p className="mt-1 text-xs text-green-700">✓ {enCarrito} en el carrito</p>}
          <Button
            className="mt-2 w-full"
            disabled={!puedeAgregar}
            onClick={() =>
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                imagen_url: producto.imagen_url,
                stock: producto.stock,
              })
            }
          >
            {textoBoton}
          </Button>
        </div>
      </div>
    </div>
  )
}
