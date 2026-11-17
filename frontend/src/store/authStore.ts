import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '../features/auth/api/auth'
import type { Rol, UsuarioSesion } from '../features/auth/types/auth'

interface AuthState {
  usuario: UsuarioSesion | null
  cargando: boolean // true mientras checkSession confirma la sesion
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
  tieneRol: (roles: Rol[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        // el backend pone el token en la cookie HttpOnly, aca nunca lo vemos
        await authApi.login(username, password)
        const usuario = await authApi.me()
        set({ usuario, cargando: false })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } finally {
          set({ usuario: null })
        }
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await authApi.me()
          set({ usuario })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },

      limpiarSesion: () => set({ usuario: null }),

      tieneRol: (roles) => {
        const usuario = get().usuario
        return usuario !== null && roles.includes(usuario.role)
      },
    }),
    {
      name: 'foodstore-auth',
      // solo guardo los datos del usuario, NUNCA el token
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)
