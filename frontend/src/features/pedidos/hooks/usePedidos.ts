import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidos'
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from '../types/pedido'

export const pedidosKeys = {
  todos: ['pedidos'] as const,
  lista: (filtros: FiltrosPedidos) => ['pedidos', 'lista', filtros] as const,
  detalle: (id: number) => ['pedidos', 'detalle', id] as const,
  resumen: ['pedidos', 'resumen'] as const,
}

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: pedidosKeys.lista(filtros),
    queryFn: () => pedidosApi.listar(filtros),
    placeholderData: keepPreviousData,
  })
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: pedidosKeys.detalle(id ?? 0),
    queryFn: () => pedidosApi.obtener(id ?? 0),
    enabled: id !== null,
  })
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: pedidosKeys.resumen,
    queryFn: pedidosApi.resumen,
  })
}

/** Despues de crear/cancelar/cambiar estado cambian los pedidos Y el stock de los productos */
function useInvalidarPedidosYProductos() {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.invalidateQueries({ queryKey: pedidosKeys.todos })
    await queryClient.invalidateQueries({ queryKey: ['productos'] })
  }
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidosYProductos()
  return useMutation({
    mutationFn: (datos: PedidoCreate) => pedidosApi.crear(datos),
    onSuccess: invalidar,
  })
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidosYProductos()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => pedidosApi.cambiarEstado(id, estado),
    onSuccess: invalidar,
  })
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidosYProductos()
  return useMutation({
    mutationFn: (id: number) => pedidosApi.cancelar(id),
    onSuccess: invalidar,
  })
}
