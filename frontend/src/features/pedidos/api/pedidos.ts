import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido'

export const pedidosApi = {
  async listar(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
    const params: Record<string, string | number> = { skip: filtros.skip, limit: filtros.limit }
    if (filtros.estado) params.estado = filtros.estado
    const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', { params })
    return data
  },

  async obtener(id: number): Promise<Pedido> {
    const { data } = await axiosInstance.get<Pedido>(`/pedidos/${id}`)
    return data
  },

  async crear(datos: PedidoCreate): Promise<Pedido> {
    const { data } = await axiosInstance.post<Pedido>('/pedidos', datos)
    return data
  },

  async cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
    const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado })
    return data
  },

  async cancelar(id: number): Promise<Pedido> {
    const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`)
    return data
  },

  async resumen(): Promise<ResumenPedidos> {
    const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen')
    return data
  },
}
