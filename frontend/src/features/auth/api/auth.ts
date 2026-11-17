import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { MensajeResponse, UserCreate, UserPublic, UsuarioSesion } from '../types/auth'

export const authApi = {
  async login(username: string, password: string): Promise<MensajeResponse> {
    // el login es un formulario OAuth2 (x-www-form-urlencoded), no JSON
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    const { data } = await axiosInstance.post<MensajeResponse>('/auth/token', form)
    return data
  },

  async register(datos: UserCreate): Promise<UserPublic> {
    const { data } = await axiosInstance.post<UserPublic>('/auth/register', datos)
    return data
  },

  async logout(): Promise<MensajeResponse> {
    const { data } = await axiosInstance.post<MensajeResponse>('/auth/logout')
    return data
  },

  async me(): Promise<UsuarioSesion> {
    const { data } = await axiosInstance.get<UserPublic>('/auth/me')
    return {
      id: data.id,
      username: data.username,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
    }
  },
}
