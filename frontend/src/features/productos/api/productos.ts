import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto'

export const productosApi = {
  async listar(filtros: FiltrosProductos): Promise<ProductosPaginados> {
    // saco los filtros vacios para no mandar search= vacio
    const params: Record<string, string | number | boolean> = { skip: filtros.skip, limit: filtros.limit }
    if (filtros.search) params.search = filtros.search
    if (filtros.categoria_id !== undefined) params.categoria_id = filtros.categoria_id
    if (filtros.disponible !== undefined) params.disponible = filtros.disponible

    const { data } = await axiosInstance.get<ProductosPaginados>('/productos', { params })
    return data
  },

  async obtener(id: number): Promise<Producto> {
    const { data } = await axiosInstance.get<Producto>(`/productos/${id}`)
    return data
  },

  async crear(datos: ProductoCreate): Promise<Producto> {
    const { data } = await axiosInstance.post<Producto>('/productos', datos)
    return data
  },

  async actualizar(id: number, datos: ProductoUpdate): Promise<Producto> {
    const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, datos)
    return data
  },

  async actualizarStock(id: number, datos: ProductoStockUpdate): Promise<Producto> {
    const { data } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, datos)
    return data
  },

  async eliminar(id: number): Promise<void> {
    await axiosInstance.delete(`/productos/${id}`)
  },
}
