import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriasApi } from '../api/categorias'
import type { CategoriaCreate, CategoriaUpdate } from '../types/categoria'

export const categoriasKeys = {
  todas: ['categorias'] as const,
}

export function useCategorias() {
  return useQuery({
    queryKey: categoriasKeys.todas,
    queryFn: categoriasApi.listar,
  })
}

export function useCrearCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: CategoriaCreate) => categoriasApi.crear(datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriasKeys.todas }),
  })
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaUpdate }) => categoriasApi.actualizar(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriasKeys.todas })
      // los productos muestran el nombre de la categoria
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => categoriasApi.eliminar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriasKeys.todas }),
  })
}
