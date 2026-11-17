export type Rol = 'user' | 'admin'

/** Mismo formato que UserPublic del backend */
export interface UserPublic {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
  disabled: boolean
  created_at: string
}

/** Lo que guardo en el authStore (sin el token) */
export type UsuarioSesion = Pick<UserPublic, 'id' | 'username' | 'full_name' | 'email' | 'role'>

export interface UserCreate {
  username: string
  full_name: string
  email: string
  password: string
}

export interface MensajeResponse {
  message: string
}
