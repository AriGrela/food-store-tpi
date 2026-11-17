import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types/categoria'

export const categoriasApi = {
  async listar(): Promise<Categoria[]> {
    const { data } = await axiosInstance.get<Categoria[]>('/categorias')
    return data
  },

  async crear(datos: CategoriaCreate): Promise<Categoria> {
    const { data } = await axiosInstance.post<Categoria>('/categorias', datos)
    return data
  },

  async actualizar(id: number, datos: CategoriaUpdate): Promise<Categoria> {
    const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, datos)
    return data
  },

  async eliminar(id: number): Promise<void> {
    await axiosInstance.delete(`/categorias/${id}`)
  },
}
