import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../api/productos'
import type { FiltrosProductos, ProductoCreate, ProductoStockUpdate, ProductoUpdate } from '../types/producto'

export const productosKeys = {
  todos: ['productos'] as const,
  lista: (filtros: FiltrosProductos) => ['productos', filtros] as const,
}

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: productosKeys.lista(filtros),
    queryFn: () => productosApi.listar(filtros),
    placeholderData: keepPreviousData, // no parpadea al cambiar de pagina
  })
}

function useInvalidarProductos() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: productosKeys.todos })
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: (datos: ProductoCreate) => productosApi.crear(datos),
    onSuccess: invalidar,
  })
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) => productosApi.actualizar(id, datos),
    onSuccess: invalidar,
  })
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) =>
      productosApi.actualizarStock(id, datos),
    onSuccess: invalidar,
  })
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos()
  return useMutation({
    mutationFn: (id: number) => productosApi.eliminar(id),
    onSuccess: invalidar,
  })
}
