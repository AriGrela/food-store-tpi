import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string | null
  stock: number // stock que habia cuando se agrego, para no pasarse
}

interface CartState {
  items: ItemCarrito[]
  agregar: (item: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) => {
        const existente = get().items.find((i) => i.producto_id === item.producto_id)
        if (existente) {
          // si ya estaba sumo la cantidad (sin pasarme del stock)
          set({
            items: get().items.map((i) =>
              i.producto_id === item.producto_id
                ? { ...i, stock: item.stock, cantidad: Math.min(i.cantidad + cantidad, item.stock) }
                : i,
            ),
          })
        } else {
          set({ items: [...get().items, { ...item, cantidad: Math.min(cantidad, item.stock) }] })
        }
      },

      quitar: (productoId) => {
        set({ items: get().items.filter((i) => i.producto_id !== productoId) })
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(productoId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.producto_id === productoId ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i,
          ),
        })
      },

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),

      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'foodstore-carrito' },
  ),
)
