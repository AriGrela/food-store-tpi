import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usuariosApi } from '../api/usuarios'

export const usuariosKeys = {
  todos: ['usuarios'] as const,
}

export function useUsuarios() {
  return useQuery({
    queryKey: usuariosKeys.todos,
    queryFn: usuariosApi.listar,
  })
}

export function useActivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => usuariosApi.activar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosKeys.todos }),
  })
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => usuariosApi.desactivar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosKeys.todos }),
  })
}
