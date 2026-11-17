import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '../../store/authStore'

// rutas donde un 401 es "normal" (login mal o no hay sesion todavia)
const RUTAS_IGNORADAS = ['/auth/token', '/auth/me']
const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true, // para que el navegador mande la cookie HttpOnly
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail
    const esRutaIgnorada = RUTAS_IGNORADAS.some((ruta) => url.includes(ruta))

    // sesion vencida o cuenta desactivada -> limpio el store.
    // ProtectedRoute se encarga de mandar a /login al quedar sin usuario
    if ((status === 401 && !esRutaIgnorada) || (status === 400 && detail === CUENTA_DESACTIVADA)) {
      useAuthStore.getState().limpiarSesion()
    }
    return Promise.reject(error)
  },
)
