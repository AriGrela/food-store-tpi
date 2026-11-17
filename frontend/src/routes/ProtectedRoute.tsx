import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Rol } from '../features/auth/types/auth'

interface ProtectedRouteProps {
  roles?: Rol[] // si no se pasa, alcanza con tener sesion
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  // mientras checkSession confirma la sesion muestro un indicador
  if (cargando) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-marca-500 border-t-transparent" />
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
